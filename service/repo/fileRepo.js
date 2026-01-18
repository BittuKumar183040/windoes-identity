import db from "../../utility/db/knex/knex.js";

export const insertFileRecord = async ({ userId, fileTag, filename }) => {
  const [file] = await db("files")
    .insert({ userId, fileTag, filename, status: "ACTIVE", updatedAt: Math.floor(Date.now() / 1000) })
    .returning("*");
  return file;
};

export const updateUserFileStatus = async ({ userId, fileTag, status }) => {
  const updatedCount = await db("files")
    .where({ userId, fileTag })
    .update({ status });
  return updatedCount;
};

export const getUserFilesDetails = async ({ userId, fileTag, status }) => {
  return db("files")
    .where({ userId, fileTag })
    .whereIn("status", status)
    .orderBy("updatedAt", "desc")
    .select("*");
};

export const getFilebyFileAndUserId = async ({fileId, userId}) => {
  return db("files")
    .where({ id: fileId, userId:userId })
    .select("*")
    .first();
}