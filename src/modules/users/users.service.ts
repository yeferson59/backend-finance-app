import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from './interfaces/user.interface';
import { encrypt, formatName, removeRoleIdUser } from './utils/functions';

@Injectable()
export class UsersService {

  constructor(private readonly prismaService: PrismaService) { }

  async findOneEmail(email: string): Promise<User | null> {
    const userFound = await this.prismaService.user.findFirst({
      where: { email },
      include: { role: true }
    });
    if (!userFound) return null
    const { role: { name }, roleId, ...rest } = userFound;
    const user = {
      role: name,
      ...rest
    }
    return user;
  }

  async create(createUserDto: CreateUserDto) {
    const { email } = createUserDto;
    const userFound = await this.findOneEmail(email);
    if (userFound) throw new ConflictException('User exist yet');
    const { password: receivePassword, name: receiveName, lastName: recieveLastName } = createUserDto;
    const hash = await encrypt(receivePassword);
    const correctName = await formatName(receiveName);
    const correctLastname = await formatName(recieveLastName);
    if (!createUserDto.role) {
      const { role, password, name, lastName, ...rest } = createUserDto;
      const data = {
        ...rest,
        name: correctName,
        lastName: correctLastname,
        password: hash
      };
      const user = await this.prismaService.user.create({ data: data, include: { role: true } });
      return await removeRoleIdUser(user);
    };
    const role = await this.prismaService.role.findFirst({
      where: { name: createUserDto.role }
    });
    if (!role) throw new NotFoundException();
    const { id } = role
    const { role: roleName, password, name, lastName, ...re } = createUserDto;
    const data = {
      roleId: id,
      ...re,
      password: hash,
      name: correctName,
      lastName: correctLastname
    }
    const user = await this.prismaService.user.create({ data: data, include: { role: true } });
    return await removeRoleIdUser(user);
  }

  findAll() {
    return this.prismaService.user.findMany();
  }

  async findOne(id: string) {
    const userFound = await this.prismaService.user.findUnique({
      where: { id },
      include: { role: true }
    });
    if (!userFound) throw new NotFoundException('User not exist');
    const user = await removeRoleIdUser(userFound)
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const userFound = await this.findOne(id);
    if (updateUserDto.email) {
      const isExistEmail = await this.findOneEmail(updateUserDto.email);
      if (isExistEmail) throw new ConflictException('User exist with the same email');
    }
    if (!userFound) throw new NotFoundException();
    if (updateUserDto.name) {
      const { name } = updateUserDto;
      updateUserDto.name = await formatName(name);
    }
    if (updateUserDto.lastName) {
      const { lastName } = updateUserDto;
      updateUserDto.lastName = await formatName(lastName);
    }
    if (!updateUserDto.role) {
      const { role, ...rest } = updateUserDto;
      const dataUser = {
        ...rest
      }
      const user = await this.prismaService.user.update({
        where: { id },
        data: dataUser,
        include: { role: true }
      })
      return await removeRoleIdUser(user)
    }
    const role = await this.prismaService.role.findFirst({
      where: { name: updateUserDto.role }
    });
    if (!role) throw new NotFoundException();
    const { id: roleId } = role
    const { role: roleName, ...re } = updateUserDto;
    const data = {
      roleId,
      ...re
    }
    const user = await this.prismaService.user.update({ where: { id }, data, include: { role: true } })
    return await removeRoleIdUser(user);
  }

  async remove(id: string) {
    const userFound = await this.findOne(id);
    if (!userFound) throw new NotFoundException();
    const user = await this.prismaService.user.delete({
      where: { id },
      include: { role: true }
    })
    return await removeRoleIdUser(user);
  }
}
