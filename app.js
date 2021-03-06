require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const routCard = require('./routes/routCard.js');

const routUser = require('./routes/routUser.js');
const { createUser, login } = require('./controllers/users.js');
const auth = require('./middlewares/auth');

const app = express();

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

const { PORT = 3200 } = process.env;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 мин
  max: 100, // ограничение кс каждого IP до 100 запросов
});

app.use(limiter);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());
app.post('/signin', login);
app.post('/signup', createUser);
app.use(auth);
app.use('/cards', routCard);
app.use('/users', routUser);

app.use((req, res) => {
  res.status(404).send({ message: 'Запрашиваемый ресурс не найден' });
});

app.listen(PORT);
