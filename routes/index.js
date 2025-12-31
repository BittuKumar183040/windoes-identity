import express from 'express';
var router = express.Router();

router.get('/', (req, res) => {

  res.json({
    name: 'Auth Service',
    description: 'Centralized authentication & authorization server',
    environment: process.env.NODE_ENV || 'development',
    uptime: `${Math.floor(process.uptime())}s`,
    time: new Date().toISOString()
  });
});

export default router;
