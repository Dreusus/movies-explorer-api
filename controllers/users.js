const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/users');
const BadRequestError = require('../errors/bad-req-err');
const ConflictError = require('../errors/conflict-err');
const NotFoundError = require('../errors/not-found-err');

const { NODE_ENV, JWT_SECRET = 'dev-secret' } = process.env;

const login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
        { expiresIn: '7d' },
      );
      res.status(200).send({ token });
    })
    /* .catch(next); */
};

const getUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      res.status(200).send({
        email: user.email,
        name: user.name,
      });
    })
    .catch(next);
};

const updateProfile = (req, res, next) => {
  const { name, email } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { email, name },
    { new: true, runValidators: true },
  )
    .then((user) => {
      if (!user) {
        return next(new NotFoundError(`404 Пользователь по указанному  _id - ${req.params.id} не найден`));
      }
      return res.status(200).send({
        name: user.name,
        email: user.email,
      });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('400 - Переданы некорректные данные при обновлении профиля'));
      }
      if (err.code === 11000) {
        return next(new ConflictError('Пользователь с этим e-mail уже существует'));
      }
      return next(err);
    });
};

const createUser = (req, res, next) => {
  const { email, password, name } = req.body;
  bcrypt
    .hash(password, 10)
    .then((hash) => {
      User.create({
        email,
        name,
        password: hash,
      })
        .then((user) => {
          res.status(201).send({
            _id: user._id,
            email: user.email,
            name: user.name,
          });
        })
        .catch((err) => {
          if (err.name === 'ValidationError') {
            return next(new BadRequestError('Не указаны обязательные поля'));
          }
          if (err.code === 11000) {
            return next(new ConflictError('Пользователь с этим e-mail уже существует'));
          }
          return next(err);
        });
    });
};

module.exports = {
  createUser,
  getUser,
  updateProfile,
  login,
};
