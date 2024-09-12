import { OmitType } from "@nestjs/mapped-types";
import { SignUpDto } from "./sign-up.dto";

export class SignInDto extends OmitType(SignUpDto, ['name', 'lastName', 'username']) { }