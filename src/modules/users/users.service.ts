import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from './interfaces/user.interface';
import { removeRoleIdUser } from './utils/functions';

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
    if (!createUserDto.role) {
      const { role, ...rest } = createUserDto;
      const data = {
        ...rest
      };
      const user = await this.prismaService.user.create({ data: data, include: { role: true } });
      return await removeRoleIdUser(user);
    };
    const role = await this.prismaService.role.findFirst({
      where: { name: createUserDto.role }
    });
    if (!role) throw new NotFoundException();
    const { id } = role
    const { role: roleName, ...re } = createUserDto;
    const data = {
      roleId: id,
      ...re
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
    if (!userFound) throw new NotFoundException();
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
