import db from "../../utility/db/knex/knex.js";

export const insertFileRecord = async ({ user_id, file_tag, filename }) => {
  const [file] = await db("files")
    .insert({ user_id, file_tag, filename, status: "ACTIVE", updatedAt: Math.floor(Date.now() / 1000) })
    .returning("*");
  return file;
};

export const updateUserFileStatus = async ({ user_id, file_tag, status }) => {
  const updatedCount = await db("files")
    .where({ user_id, file_tag })
    .update({ status });
  return updatedCount;
};

export const getUserFilesDetails = async ({ user_id, file_tag, status }) => {
  return db("files")
    .where({ user_id, file_tag })
    .whereIn("status", status)
    .orderBy("updatedAt", "desc")
    .select("*");
};

export const getFilebyFileAndUserId = async ({fileId, userId}) => {
  return db("files")
    .where({ id: fileId, user_id:userId })
    .select("*")
    .first();
}