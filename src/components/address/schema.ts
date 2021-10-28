import * as Joi from 'joi';

export const address = {
  body: Joi.object().keys({
    street: Joi.string().required(),
    streetNumber: Joi.string().required(),
    town: Joi.string().required(),
    postalCode: Joi.string().required(),
    country: Joi.string().required(),
  }),
};
