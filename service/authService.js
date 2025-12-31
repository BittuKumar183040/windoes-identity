import logger from "#logger";
import { generateToken } from "../utility/jwt/jwt.js";
import { verifyPassword } from "../utility/passwordHelper.js";
import { checkUserActive, checkUserActivePin, userPasswordIncorrect, userPinUpdateFailed } from "./errorCheckService.js";
import { getUserByIdUsernameOrEmailWithPassword, getUserWithPin, getUserWithPassword, updatePin } from "./repo/userRepo.js";

export const loginUserByPassword = async (usernameOrEmail, password) => {
  const user = await getUserByIdUsernameOrEmailWithPassword(usernameOrEmail);
  checkUserActive(user);
  logger.info(`Found User based of Username or Email : ${JSON.stringify(user)}`)
  const isPaswordValid = await verifyPassword(password, user.passwordHash)
  if(!isPaswordValid) { userPasswordIncorrect() }

  const payload = { id: user.id, username: user.username, name: user.name, email: user.email }
  const token = generateToken(payload);
  return {token, payload}
};

export const loginUserByPin = async (usernameOrEmail, pin) => {
  const user = await getUserWithPin(usernameOrEmail);
  logger.info(`Retrived User based on username:${usernameOrEmail} got ${JSON.stringify(user)}`);
  checkUserActivePin(user, pin)
  const payload = { id: user.id, username: user.username, name: user.name, email: user.email }
  const token = generateToken(payload);
  return {token, payload}
};

export const verifyUserPassword = async (id, password) => {
  const user = await getUserWithPassword(id);
  checkUserActive(user);
  logger.info(`Found User based on id : ${user.id}, username: ${user.username}: Init password verfication process`)
  const isPaswordValid = await verifyPassword(password, user.passwordHash)
  if(!isPaswordValid) { userPasswordIncorrect() }
  return user;
}

export const updateUserPin = async (id, pin) => {
  logger.info(`Updating pin for id: ${id} with new pin : ${pin}`)
  const user = await updatePin(id, pin)
  if(user.pin !== pin) { userPinUpdateFailed() }
  return user;
}