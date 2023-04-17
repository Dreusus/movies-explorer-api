const Movie = require('../models/movies');
const BadRequestError = require('../errors/bad-req-err');
const ForbiddenError = require('../errors/forbidden-err');
const NotFoundError = require('../errors/not-found-err');

const getMovies = (req, res, next) => {
  const owner = req.user._id;
  Movie.find({ owner })
    .then((movies) => {
      res.status(201).send({ movies });
    })
    .catch(next);
};

const postMovie = (req, res, next) => {
  const owner = req.user._id;
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
  } = req.body;

  Movie.create({
    owner,
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
  })
    .then((movie) => {
      res.status(201).send({ movie });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Не указаны обязательные поля'));
      }
      return next(err);
    });
};

const deleteMovie = (req, res, next) => {
  Movie.findById(req.params._id)
    .then((item) => {
      if (!item) {
        return next(new NotFoundError(`Фильм с ${req.params._id} не найден`));
      }
      if (item.owner.toString() !== req.user._id) {
        return next(new ForbiddenError('Вам запрещено удалять данный фильм'));
      }
      return Movie.findByIdAndDelete(req.params._id)
        .then(() => {
          res.status(200).send({ message: 'Фильм удален' });
        });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequestError('400 - Некорректный id'));
      }
      return next(err);
    });
};

module.exports = {
  getMovies,
  postMovie,
  deleteMovie,
};
