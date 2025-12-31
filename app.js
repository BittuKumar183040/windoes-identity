
import mlogger from 'morgan';
import express from 'express';
import 'express-async-errors';
import logger  from '#logger';
import cookieParser from 'cookie-parser';
import indexRouter from './routes/index.js';
import userRouter from './routes/users.js';
import fileRouter from './routes/file.js';
import authRouter from './routes/auth.js';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './docs/swagger.json' with { type: 'json' };

const swaggerSpec = {
  ...swaggerDocument,
  servers: [
    {
      url: `${process.env.BASE_URL}`,
      description: process.env.NODE_ENV || 'development'
    }
  ]
};

let app = express();
app.use('/identity-service/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(mlogger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/identity-service/health', indexRouter);
app.use('/users', userRouter);
app.use('/users', fileRouter);
app.use('/auth', authRouter);

app.use(function(err, req, res, next) {
  

  if (err.code === '23505') {
    logger.error(err.message)
    return res.status(409).json({ error: err.detail || 'Data Already exists' });
  }
  if(err.type = "DatabaseError") {
    logger.error(err)
    return res.status(500).json({ error: err.detail || err.message || 'Database Schema or Table is not initilized' });
  }

  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
});

app.use((req, res, next) => {
  res.status(404).json({ error: { message: 'Not Found' } });
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error'
    }
  });
});

export default app;
