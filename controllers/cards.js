const mongoose = require('mongoose');
const cardSchema = require('../models/card');

const InBaseNotFound = require('../errors/InBaseNotFound');

module.exports.findCard = (req, res) => {
  cardSchema.find({})
    .then((card) => {
      if (!card.length) {
        throw new InBaseNotFound('Нет карточек в базе');
      }
      res.send({ data: card });
    })
    .catch(() => res.status(500).send({ message: 'На сервере произошла ошибка' }));
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  cardSchema.create({ name, link, owner })
    .then((card) => res.status(201).send({ data: card }))
    .catch(() => res.status(400).send({ message: 'Не правильно введены данные' }));
};

module.exports.deleteCard = (req, res) => {
  try {
    const { cardId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(cardId)) {
      throw new InBaseNotFound('Не валидный запрос');
    }
    let errorCode = 500;
    cardSchema.findById(cardId)
      .orFail(() => {
        errorCode = 404;
        throw new InBaseNotFound('Такой карточки в базе нет');
      })
      .then((card) => {
        if (req.user._id !== card.owner._id.toString()) {
          errorCode = 403;
          throw new InBaseNotFound('Нет прав...');
        }
        card.remove()
          .then(() => res.send({ message: 'Карточка удалена' }))
          .catch(() => res.status(500).send({ message: 'Ошибка на сервере' }));
      })
      .catch((err) => res.status(errorCode).send({ message: err.message }));
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
};

module.exports.likeCard = (req, res) => {
  try {
    const { cardId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(cardId)) {
      throw new InBaseNotFound('Не валидный запрос');
    }
    let errorCode = 500;
    cardSchema.findByIdAndUpdate(cardId, { $addToSet: { likes: req.user._id } }, { new: true })
      .orFail(() => {
        errorCode = 404;
        throw new InBaseNotFound('Такой карточки в базе нет');
      })
      .then((card) => res.status(200).send({ data: card }))
      .catch((err) => res.status(errorCode).send({ message: err.message }));
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
};

module.exports.dislikeCard = (req, res) => {
  try {
    const { cardId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(cardId)) {
      throw new InBaseNotFound('Не валидный запрос');
    }
    let errorCode = 500;
    cardSchema.findByIdAndUpdate(cardId, { $pull: { likes: req.user._id } }, { new: true })
      .orFail(() => {
        errorCode = 404;
        throw new InBaseNotFound('Такой карточки в базе нет');
      })
      .then((card) => res.status(200).send({ data: card }))
      .catch((err) => res.status(errorCode).send({ message: err.message }));
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
};
