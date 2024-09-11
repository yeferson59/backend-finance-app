import { UserRoleDb } from "../interfaces/user.interface";
import * as bcrypt from "bcrypt"

export async function removeRoleIdUser(data: UserRoleDb) {
  const { role: { name }, roleId, ...res } = data;
  const user = {
    role: name,
    ...res
  };
  return user;
}

export async function encrypt(password: string) {
  const saltRounds = 11;
  const salt = await bcrypt.genSalt(saltRounds);
  const hashPassword = await bcrypt.hash(password, salt);
  return hashPassword;
}

export async function formatName(word: string) {
  if (word.length === 0) return;
  const firstWord = word.charAt(0).toUpperCase();
  if (word.length === 1) return firstWord;
  return (firstWord + word.slice(1).toLowerCase());
} 