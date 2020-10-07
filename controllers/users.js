/* eslint-disable consistent-return */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const userSchema = require('../models/user');

const { NODE_ENV, JWT_SECRET } = process.env;

const InBaseNotFound = require('../errors/InBaseNotFound');

module.exports.findUser = (req, res) => {
  userSchema.find({})
    .then((user) => {
      if (!user.length) {
        throw new InBaseNotFound('Нет пользователей в базе');
      }
      res.send({ data: user });
    })
    .catch(() => res.status(500).send({ message: 'На сервере произошла ошибка' }));
};

module.exports.findUserId = (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new InBaseNotFound('Не валидный запрос');
    }
    let errorCode = 500;

    userSchema.findById(userId)
      .orFail(() => {
        errorCode = 404;
        throw new InBaseNotFound('Нет пользователя в базе');
      })
      .then((user) => res.send({ data: user }))
      .catch((err) => res.status(errorCode).send({ message: err.message }));
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
};

module.exports.createUser = (req, res) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  if (!password || !email || !avatar || !about || !name) {
    return res
      .status(400)
      .send({ message: 'Все поля должны быть заполнены' });
  }
  if (password.length < 8 || password.trim().length === 0) {
    return res
      .status(400)
      .send({ message: 'Пароль должен быть не менее 8 символов и не пустой строкой' });
  }

  bcrypt.hash(req.body.password, 10)
    .then((hash) => userSchema.create({
      name,
      about,
      avatar,
      email,
      password: hash,

    }))
    .then((user) => res.status(201).send({ _id: user._id, email: user.email }))
    .catch(() => res.status(400).send({ message: 'Не правильно введены данные' }));
};

module.exports.login = (req, res) => {
  const { email, password } = req.body;
  if (!password || !email) {
    return res
      .status(400)
      .send({ message: 'Поля "e-mail" и "пароль" должны быть заполнены' });
  }
  return userSchema.findUserByCredentials(email, password)
    .then((user) => {
      // аутентификация успешна! пользователь в переменной user
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', { expiresIn: '7d' });
      res
        .cookie('jwt', token, {
          maxAge: 3600000 * 24 * 7,
          httpOnly: true,
          sameSite: true,
        })
        .end();
    })
    .catch((err) => {
      // ошибка аутентификации
      res
        .status(401)
        .send({ message: err.message });
    });
};

module.exports.updateUser = (req, res) => {
  const { name, about } = req.body;
  const owner = req.user._id;
  userSchema.findByIdAndUpdate(owner, { name, about }, { new: true, runValidators: true })
    .orFail(() => Error('Нет такого пользователя в базе'))
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.prototype.name === 'ValidationError') {
        res.status(400);
      } else {
        res.status(500).send({ message: 'Произошла ошибка' });
      }
      res.send({ message: err.message });
    });
};

module.exports.updateAvatar = (req, res) => {
  const { avatar } = req.body;
  const owner = req.user._id;

  userSchema.findByIdAndUpdate(owner, { avatar }, { new: true, runValidators: true })
    .orFail(() => Error('Нет такого пользователя в базе'))
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.prototype.name === 'ValidationError') {
        res.status(400);
      } else {
        res.status(500).send({ message: 'Произошла ошибка' });
      }
      res.send({ message: err.message });
    });
};
