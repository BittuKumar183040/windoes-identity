import logger from "#logger";
import express from "express";
import { loginUserByPassword, loginUserByPin, updateUserPin, verifyUserPassword } from "../service/authService.js";
import jwt from "jsonwebtoken"
var router = express.Router();

router.post("/login", async (req, res) => {
  const { usernameOrEmail, password } = req.body;
  if (!usernameOrEmail || !password) {
    return res.status(400).json({ error: "Username/email and password are required" });
  }

  try {
    logger.info(`Verifing user usernameOrEmail: ${usernameOrEmail} and password: ${password} `)
    const {token, payload} = await loginUserByPassword(usernameOrEmail, password);

    res.cookie("auth_token", token, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    });
    return res.status(200).json({ 
      user: payload,
      message: 'Login successful'
    });
    
  } catch (e) {
    logger.error(e);
    if (e.status) {
      return res.status(e.status).json({ error: e.error });
    }
    return res.status(500).json({ e: "Login failed" });
  }
});

router.post("/login/pin", async (req, res) => {
  const { usernameOrEmail, pin } = req.body;
  if (!usernameOrEmail || !pin) {
    return res.status(400).json({ error: "Username/email and pin are required" });
  }

  try {
    const {token, payload} = await loginUserByPin(usernameOrEmail, pin);

    res.cookie("auth_token", token, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    });
    logger.info("info", payload, token)
    return res.status(200).json({ 
      user: payload,
      message: 'Login successful'
    });
    
  } catch (e) {
    logger.error(e);
    if (e.status) {
      return res.status(e.status).json({ error: e.error });
    }
    return res.status(500).json({ e: "Login failed" });
  }
});

router.post("/login/id/:id/password/verify", async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ error: "Password is required" });
  }
  try {
    const user = await verifyUserPassword(id, password);
    const pinToken = jwt.sign(
      {
        sub: user.id,
        scope: "PIN_UPDATE"
      },
      process.env.PIN_TOKEN_SECRET_KEY || "mysecretpassword",
      { expiresIn: "5m" }
    );
    logger.info(`User:${id} : Pin Update Token Delivered Successfully`)
    return res.status(200).json({ pinUpdateToken: pinToken, expiresIn: 300 });
  } catch (e) {
    logger.error(e);
    if (e.status) {
      return res.status(e.status).json({ error: e.error });
    }
    return res.status(500).json({ e: "Login failed" });
  }
})

router.put("/login/pin", async (req, res) => {
  const authHeader = req.headers.authorization;
  const { pin } = req.body;
  if (!pin) {
    return res.status(400).json({ error: "Username/email and pin are required" });
  }
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "PIN update token required" });
  }

  try {
    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify( token, process.env.PIN_TOKEN_SECRET_KEY || "mysecretpassword");

    if (decoded.scope !== "PIN_UPDATE") {
      return res.status(403).json({ error: "Invalid token scope" });
    }
    const id = decoded.sub;
    await updateUserPin(id, pin);
    logger.info(`Pin Updated successfully for user: ${id}`)
    return res.status(200).json({ message: "PIN updated successfully" });
  } catch (e) {
    logger.error(e);
    if(e.message) {
      return res.status(401).json({ error: e.message });
    }
    if (e.status) {
      return res.status(e.status || 500).json({ error: e.error });
    }
    return res.status(500).json({ e: "Login failed" });
  }
});


export default router;
