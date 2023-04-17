const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const auth = require('../middlewares/auth');
const {
  getMovies,
  postMovie,
  deleteMovie,
} = require('../controllers/movies');
const validateURL = require('../middlewares/valid');

router.get('/movies', auth, getMovies);

router.post(
  '/movies',
  auth,
  celebrate({
    body: Joi.object().keys({
      country: Joi.string().required(),
      director: Joi.string().required(),
      duration: Joi.number().required(),
      year: Joi.string().required(),
      description: Joi.string().required(),
      image: Joi.string().required().custom(validateURL),
      trailerLink: Joi.string().required().custom(validateURL),
      thumbnail: Joi.string().required().custom(validateURL),
      movieId: Joi.number().required(),
      nameRU: Joi.string().required(),
      nameEN: Joi.string().required(),
    }),
  }),
  postMovie,
);

router.delete(
  '/movies/:_id',
  auth,
  celebrate({
    params: Joi.object().keys({
      _id: Joi.string().length(24).hex(),
    }),
  }),
  deleteMovie,
);

module.exports = router;
