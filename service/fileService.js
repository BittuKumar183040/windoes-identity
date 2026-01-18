import logger from "#logger";
import fs from "fs";
import path from "path";
import { getUserById } from "./repo/userRepo.js";
import { updateUserFileStatus, insertFileRecord, getUserFilesDetails, getFilebyFileAndUserId } from "./repo/fileRepo.js";

export const uploadFile = async ({ id, fileTag, file }) => {
  const rootFolder = process.env.ROOT_FOLDER || "/data";
  const uploadDir = path.join(rootFolder, id, fileTag);

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  const filename = file.originalname;
  const filePath = path.join(uploadDir, filename);
  const user = await getUserById(id);
  if (!user) {
    throw { status: 404, error:`User: ${id} not found`};
  }

  fs.writeFileSync(filePath, file.buffer);
  const resetStatusCount = await updateUserFileStatus({ userId: id, fileTag: fileTag, status: "INACTIVE" })
  logger.info(`Reset already exists images count: ${resetStatusCount} back to inactive for user:${id}`)

  const fileRecord = await insertFileRecord({ userId: id, fileTag: fileTag, filename });
  logger.info(`File uploaded successfully for User Id ${id}, File Tag:${fileTag}, filePath:${filePath}, filename:${filename} `);
  return fileRecord;
};

export const getFile = async ({ id, fileTag, statuses }) => {
  let fileRecord = await getUserFilesDetails({userId: id, fileTag: fileTag, status: statuses})

  if (!fileRecord || !fileRecord.length) {
    throw { status: 404, error:`No File found for user ${id}, tag ${fileTag} and status ${[...statuses]}`}
  }
  return getFileByEntity(fileRecord[0])
};

export const getFileById = async ({ fileId, userId }) => {

  logger.info(`Looking for File Id: ${fileId} for User Id: ${userId}`)
  let fileRecord = await getFilebyFileAndUserId({fileId, userId})
  
  if (!fileRecord) {
    throw { status: 404, error: `No File found for user: ${userId} and File: ${fileId} ` }
  }

  return getFileByEntity(fileRecord)
};

const getFileByEntity = async (fileRecord) => {

  const rootFolder = process.env.ROOT_FOLDER || "/data";
  logger.info(`Getting file from - Root:${rootFolder}, ${JSON.stringify(fileRecord)}`)
  const location = path.join(rootFolder, fileRecord.userId, fileRecord.fileTag, fileRecord.filename);

  logger.info(`Looking into Location: ${location}`)
  
  if (!fs.existsSync(location)) {
    throw { status: 404, error: `File not found on disk at ${location}`};
  }

  const buffer = fs.readFileSync(location);

  const ext = path.extname(fileRecord.filename).toLowerCase();
  const mimeMap = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp"
  };

  const mimetype = mimeMap[ext] || "application/octet-stream";
  return { buffer, filename: fileRecord.filename, mimetype, location };
}