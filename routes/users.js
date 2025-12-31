import logger from "#logger";
import express from "express";
import { listAllUsers, retriveUserById, retriveUserByPk, createUser, updateUsername } from "../service/userService.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  logger.info("Getting list of users");
  try{
    const users = await listAllUsers();
    logger.info(`Total ${users.length} users retrived`);
    res.status(200).json(users);
  } catch (err) {
    logger.error(`Error: ${err} `)
    if (err.status) {
      return res.status(err.status).json({ error: err.error });
    }
    return res.status(500).json({ err: "Something went wrong! While getting users list." });
  }
});

router.get("/id/:id", async (req, res) => {
  const { id } = req.params;
  if (!id) { return res.status(400).json({ error: "User Id is required "}) }

  try {
    const user = await retriveUserById(id)
    return res.status(200).json(user);
  } catch (err) {
    logger.error(`Error: ${err} `)
    if (err.status) {
      return res.status(err.status).json({ error: err.error });
    }
    return res.status(500).json({ err: "Something went wrong! while getting user." });
  }
});

router.get("/keyword/:keyword", async (req, res) => {
  const { keyword } = req.params;
  if (!keyword) { return res.status(400).json({ error: "Id or Username or Email is Required as keyword"}) }
  try {
    const user = await retriveUserByPk(keyword)
    res.status(200).json(user);
  } catch (err) {
    logger.error(`Error: ${err} `)
    if (err.status) {
      return res.status(err.status).json({ error: err.error });
    }
    return res.status(500).json({ err: "Something went wrong, while getting user." });
  }
});

router.post("/", async (req, res) => {
  const { username, name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "name, email and password are required" });
  }
  try {
    const newUser = await createUser(username, name, email, password);
    logger.info(`User created successfully ${JSON.stringify(newUser)}`);
    res.status(201).json(newUser);
  } catch (err) {
    logger.error(`Error: ${err} `)
    if (err.status) {
      return res.status(err.status).json({ error: err.error });
    }
    return res.status(500).json({ err: "Something went wrong! while getting user." });
  }
});

router.put("/id/:id/update-username", async (req, res) => {
  const { id } = req.params;
  const { username } = req.body;
  if (!id || !username) {
    return res.status(400).json({ error: `id and username is required` });
  }
  try {
    const newUser = await updateUsername(id, username);
    logger.info("Username updated successfully ", newUser);
    res.status(200).json(newUser);
  } catch (err) {
    logger.error(`Error: ${err} `)
    if (err.status) {
      return res.status(err.status).json({ error: err.error });
    }
    return res.status(500).json({ err: "Something went wrong! while getting user." });
  }
})

export default router;
