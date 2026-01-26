import db from '../../utility/db/knex/knex.js';
import { hashPassword } from '../../utility/passwordHelper.js';

export const userDto = ["id", "username", "name", "email", "status", "createdAt", "updatedAt"];
export const userInternal = ["id", "username", "name", "email", "passwordHash", "pin", "status", "createdAt", "updatedAt"];

export const insertUser = async ({ username, name, email, password, status }) => {
  const passwordHash = await hashPassword(password);
  const [newUser] = await db('users')
    .insert({
      username, 
      name,
      email, 
      passwordHash,
      status: status || 'ACTIVE',
    })
    .returning(userDto);
  return newUser;
};

export const updateUsernameById = async ({ id, username }) => {
  const [updatedUser] = await db('users')
    .where({ id })
    .update({ username })
    .returning(userDto);
  return updatedUser;
}

export const getUserById = async (userId) => {
  return await db('users')
    .select([...userDto])
    .where('id', userId)
    .first();
};

export const getUserByUsername = async (username) => {
  return await db('users')
    .select([...userDto])
    .where('username', username)
    .first();
};
export const getUserByEmail = async (email) => {
  return await db('users')
    .select([...userDto])
    .where('email', email)
    .first();
};

export const getUsers = async () => {
  return db('users')
    .select([...userDto])
    .orderBy('createdAt', 'desc');
};

export const findUserByIdUsernameOrEmail = async (keyword) => {
  if (!keyword) return null;
  return db('users')
    .select([...userDto])
    .where((qb) => {
      qb.where('id', keyword)
        .orWhere('email', keyword)
        .orWhere('username', keyword);
    })
    .first();
};

export const getUserWithPin = async (usernameOrEmail) => {
  return await db('users')
    .select([...userInternal])
    .where('username', usernameOrEmail)
    .orWhere('email', usernameOrEmail)
    .first();
}
export const getUserWithPassword = async (id) => {
  return await db('users')
    .select([...userInternal])
    .where('id', id)
    .first();
}

export const getUserByIdUsernameOrEmailWithPassword = async (usernameOrEmail) => {
  if (!usernameOrEmail) return null;
  return db('users')
    .select([...userInternal])
    .where((qb) => {
      qb.where('id', usernameOrEmail)
        .orWhere('email', usernameOrEmail)
        .orWhere('username', usernameOrEmail);
    })
    .first();
}

export const updatePin = async (id, pin) => {
  const [updatedUser] = await db('users')
    .where({ id })
    .update({ pin })
    .returning(userInternal);
  return updatedUser;
}

