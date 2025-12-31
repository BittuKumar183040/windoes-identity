import logger from "#logger";

export const userNotFound = (status=404, msg=`User not registered.`) => {
  logger.error("User not found or not even registered")
  throw { status, error: msg };
}

export const userNotActive = (user) => {
  throw { status: 403, error: `User Account: ${JSON.stringify(user)} is currently inactive.`};
}

export const userPasswordIncorrect = () => {
  throw { status: 401, error: "Incorrect Password, Please try again." };
}

export const userPinNeverInit = () => {
  throw { status: 404, error: "Pin is never initilized." }
}

export const userPinUpdateFailed = () => {
  throw { status: 404, error: "Pin updation failed! Rollback to Last used Pin." }
}

export const userPinIncorrect = () => {
  throw { status: 401, error: "Pin is incorrect, Try another." }
}

export const checkUserPin = (user, pin) => {
  if(user.pin === null) { userPinNeverInit() }
  if(user.pin !== pin){ userPinIncorrect() }
}

export const checkUserActive = (user) => {
  if (!user) { userNotFound() }
  if (user.status !== "ACTIVE") { userNotActive(user) }
}

export const checkUserActivePin = (user, pin) => {
  checkUserActive(user);
  checkUserPin(user, pin);
}