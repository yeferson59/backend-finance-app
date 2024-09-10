import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength, IsOptional } from "class-validator";

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(25)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(25)
  lastName: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(25)
  username: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  role: string | null;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/, { message: 'La contraseña debe tener al menos una letra mayuscaula, una minuscula y un numero' })
  @MaxLength(22, { message: 'Debe contener menos de 8 caracteres de longitud' })
  password: string;
}
