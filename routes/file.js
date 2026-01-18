import logger from "#logger";
import express from "express";
import upload from "../utility/multer/index.js";
import { getFile, getFileById, uploadFile } from "../service/fileService.js";
import { getUserFilesDetails } from "../service/repo/fileRepo.js";

const router = express.Router();

const ALLOWED_TAGS = ["profile-picture", "wallpaper"];
export const ALLOWED_STATUS = ["ACTIVE", "INACTIVE"];

router.post("/id/:id/file/upload", upload.single("file"), async (req, res) => {
  const { id } = req.params;
  const { fileTag } = req.body;
  const file = req.file;

  if (!fileTag) {return res.status(400).json({ error: "File Tag is required" })}
  if (!file) {return res.status(400).json({ error: "Image file is required" })}
  
  try {
    if (!ALLOWED_TAGS.includes(fileTag)) {
      throw { status: 422, error: `Invalid fileTag: ${fileTag}. Accepted Status: ${[...ALLOWED_TAGS]}`};
    }
    const uploadedFile = await uploadFile({ id, fileTag, file});
    return res.status(202).json(uploadedFile);
  } catch (err) {
    logger.error(err)
    if (err.status) {
      return res.status(err.status).json({ error: err.error });
    }
    return res.status(500).json({ err: "Something went wrong! While Uploading file." });
  }
});

router.get("/id/:id/file/:fileTag", async (req, res) => {
  try {
    const { id, fileTag } = req.params;
    const status = [].concat(req.query.status || []);

    if (!ALLOWED_TAGS.includes(fileTag)) {
      throw { status: 422, error: `Invalid fileTag: ${fileTag}. Accepted Status: ${[...ALLOWED_TAGS]}`};
    }

    if (status.length === 0) {
      throw { status: 400, error: `At least one status is required. Accepted Status: ${[...ALLOWED_STATUS]}`};
    }

    const invalid = status.filter(s => !ALLOWED_STATUS.includes(s));
    if (invalid.length) {
      throw { status: 422, error: `Invalid status value(s): ${invalid.join(", ")}. Accepted Status: ${[...ALLOWED_STATUS]}`};
    }

    const files = await getUserFilesDetails({ userId: id, fileTag: fileTag, status });

    return res.status(200).json(files);

  } catch (err) {
    logger.error(err)
    if (err.status) {
      return res.status(err.status).json({ error: err.error });
    }
    return res.status(500).json({ err: "Failed to fetch user files" });
  } 
});

router.get("/id/:id/file/:fileTag/download", async (req, res) => {
  try {
    const { id, fileTag } = req.params;
    const statuses = [].concat(req.query.status || []);

    const invalid = statuses.filter(s => !ALLOWED_STATUS.includes(s));
    if (invalid.length) { statuses=["ACTIVE"] }
    
    logger.info(`Looking for File Tag: ${fileTag} for User Id: ${id} for file status ${[...statuses]}`)
    const file = await getFile({id, fileTag, statuses});

    if (!file) {
      throw {status:404, error: `Required File not found for UserId:${id}`};
    }

    res.setHeader("Content-Type", file.mimetype);
    res.setHeader(
      "Content-Disposition",
      `inline; filename=${file.filename}`
    );
    return res.send(file.buffer);
  } catch (err) {
    logger.error(err)
    if (err.status) {
      return res.status(err.status).json({ error: err.error });
    }
    return res.status(500).json({ err: "Something went wrong! While Downloading file." });
  }
});

router.get("/id/:id/file/fileId/:fileId/download", async (req, res) => {
  try {
    const { id, fileId } = req.params;
    const file = await getFileById({fileId, userId:id});

    if (!file) {
      return res.status(404).json({ error: "Requred File not found for User Id: " + id });
    }

    res.setHeader("Content-Type", file.mimetype);
    res.setHeader(
      "Content-Disposition",
      `inline; filename=${file.filename}`
    );
    return res.send(file.buffer);
  } catch (err) {
    logger.error(err)
    if (err.status) {
      return res.status(err.status).json({ error: err.error });
    }
    return res.status(500).json({ err: "Something went wrong! While Downloading file." });
  }
});

export default router;