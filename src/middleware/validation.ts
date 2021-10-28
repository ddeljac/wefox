import * as Joi from 'joi';

export const validate = (schema: Joi.Schema, property: string) => {
  return (req: any, res: any, next: any) => {
    const {error, value} = schema.validate(req[property]);
    const valid = error == null;

    if (valid) {
      req[property] = value;
      next();
    } else {
      const {details} = error;
      const message = details.map((i) => i.message).join(',');
      console.error('error', message);
      res.status(422).json({error: message});
    }
  };
};
