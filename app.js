require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const { errors } = require('celebrate');
const userRouter = require('./routes/users');
const movieRouter = require('./routes/movies');
const auth = require('./middlewares/auth');
const NotFoundError = require('./errors/not-found-err');
const { errorHandler } = require('./errors/error-handler');

const { PORT, BASE_PATH, DB_URL } = process.env;
const { requestLogger, errorLogger } = require('./middlewares/logger');
const { limiter } = require('./utils/rateLimit');

const app = express();
mongoose.connect(DB_URL);

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});
app.use(requestLogger);
app.use(limiter);

app.use('/', userRouter);
app.use('/', movieRouter);
app.use('*', auth, (req, res, next) => {
  next(new NotFoundError('Такая страница не  существует'));
});

app.use(errorLogger);
app.use(errors());
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`app listening on port - http://${BASE_PATH}:${PORT}`);
});
