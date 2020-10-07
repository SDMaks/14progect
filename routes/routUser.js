const routUser = require('express').Router();

const {
  findUser, findUserId, updateUser, updateAvatar,
} = require('../controllers/users');

routUser.get('/', findUser);
routUser.get('/:userId', findUserId);
routUser.patch('/me', updateUser);
routUser.patch('/me/avatar', updateAvatar);

module.exports = routUser;
