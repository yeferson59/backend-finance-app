import { UserRoleDb } from "../interfaces/user.interface";

export async function removeRoleIdUser(data: UserRoleDb) {
  const { role: { name }, roleId, ...res } = data
  const user = {
    role: name,
    ...res
  }
  return user
}