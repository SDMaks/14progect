const routCard = require('express').Router();

const {
  findCard, createCard, deleteCard, likeCard, dislikeCard,
} = require('../controllers/cards');

routCard.get('/', findCard);
routCard.post('/', createCard);
routCard.delete('/:cardId', deleteCard);
routCard.put('/:cardId/likes', likeCard);
routCard.delete('/:cardId/likes', dislikeCard);

module.exports = routCard;
