import mongoose = require('mongoose');
import {validate} from '../../middleware/validation';
import {address} from '../address/schema';
import axios from 'axios';

const router = require('express').Router();

router.post('/weather', validate(address.body, 'body'), async (req: any, res: any) => {
  const address: any = await axios({
    method: 'post',
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

  if (!address.data || address.data.length == 0) {
    res.status(400).send({error: 'Invalid address.'});
  }

  const weather: any = await axios({
    method: 'post',
    url: 'http://www.7timer.info/bin/api.pl',
    responseType: 'json',
    params: {
      lon: address.data[0].lon,
      lat: address.data[0].lat,
      product: 'astro',
      output: 'json',
    },
  });

  return res.status(200).send(weather.data);
});

export default router;
