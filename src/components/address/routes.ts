import mongoose = require('mongoose');
import {validate} from '../../middleware/validation';
import {address} from './schema';
import axios from 'axios';

const router = require('express').Router();

router.post('/address/validate', validate(address.body, 'body'), async (req: any, res: any) => {
  const response: any = await axios({
    method: 'get',
    url: 'https://nominatim.openstreetmap.org/search',
    responseType: 'json',
    params: {
      format: 'json',
      addressdetails: 1,
      limit: 1,
      street: `${req.body.streetNumber} ${req.body.street}`,
      city: req.body.town,
      country: req.body.country,
      postalcode: req.body.postalCode,
    },
  });

  if (!response.data || response.data.length == 0) {
    res.status(400).send({error: 'Invalid address.'});
  } else {
    return res.status(200).send({
      valid: true,
      address: {
        street: response.data[0].address.road,
        streetNumber: response.data[0].address.house_number,
        town: response.data[0].address.city,
        postalCode: response.data[0].address.postcode,
        country: response.data[0].address.country,
      },
    });
  }
});

export default router;
