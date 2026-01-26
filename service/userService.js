import logger from "#logger";
import { checkUserActive, userNotFound } from "./errorCheckService.js";
import { findUserByIdUsernameOrEmail, getUserByEmail, getUserById, getUserByUsername, getUsers, insertUser, updateUsernameById } from "./repo/userRepo.js"

export const listAllUsers = async () => {
  const users = await getUsers();
  return users;
}

export const retriveUserById = async (userId) => {
  const user = await getUserById(userId);
  checkUserActive(user);
  return user;
}



export const checkUsernameExists = async (username) => {
  const user = await getUserByUsername(username)
  logger.info(`${JSON.stringify(user)}`)
  return user;
}

export const retriveUserByPk = async (keyword) => {
  logger.info(`Retreving user based on keywork: ${keyword}`)
  const user = await findUserByIdUsernameOrEmail(keyword);
  logger.info(`${JSON.stringify(user)}`)
  checkUserActive(user)
  return user;
}

export const createUser = async (username, name, email, password) => {
  logger.info(`Creating user with name:${name}, username:${username} and email:${email}`)
  let user = await getUserByEmail(email);
  if(user) { userNotFound(409, `Email:${email} is already registered`) }
  if(username != null) {
    let user = await getUserByUsername(username);
    if(user) { userNotFound(`username:${username} is already taken.`) }
  }

  user = await insertUser({username, name, email, password});
  return user;
}

export const updateUsername = async (id, username) => {
  logger.info(`Creating user with id:${id} and username:${username}`)
  let user = await getUserById(id);
  checkUserActive(user)
  if(user.username === username) { return user}
  user = await updateUsernameById({id, username});
  return user;
}