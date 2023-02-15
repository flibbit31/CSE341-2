const Joi = require("joi");

const userGameSchema = Joi.object({
    userid: Joi.string().required(),
    gameid: Joi.string().required()
});

const gameCreateSchema = Joi.object({
    name: Joi.string().required(),
    esrbRating: Joi.string().valid("E", "Everyone10+", "T", "M", "AO").required(),
    genres: Joi.array().items(Joi.string()).required(),
    metacritic: Joi.number().integer().min(1).max(100).required(),
    playTime: Joi.number().integer().min(0).max(2000000000).required(),
    platforms: Joi.array().items(Joi.string()).required(),
    releaseDate: Joi.string().required(),
    updateDate: Joi.string().required(),
    completed: Joi.bool().required(),
    owned: Joi.bool().required(),
    rating: Joi.number().integer().min(1).max(100).required(),
    userPlayTime: Joi.number().integer().min(0).max(2000000000).required(),
    added: Joi.string().required()
});

const gameUpdateSchema = Joi.object({
    name: Joi.string(),
    esrbRating: Joi.string().valid("E", "Everyone10+", "T", "M", "AO"),
    genres: Joi.array().items(Joi.string()),
    metacritic: Joi.number().integer().min(1).max(100),
    playTime: Joi.number().integer().min(0).max(2000000000),
    platforms: Joi.array().items(Joi.string()),
    releaseDate: Joi.string(),
    updateDate: Joi.string(),
    completed: Joi.bool(),
    owned: Joi.bool(),
    rating: Joi.number().integer().min(1).max(100),
    userPlayTime: Joi.number().integer().min(0).max(2000000000),
    added: Joi.string()
});

module.exports = {
    userGameSchema,
    gameCreateSchema,
    gameUpdateSchema
};