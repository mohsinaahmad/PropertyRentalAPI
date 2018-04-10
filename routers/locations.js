var express = require('express');
var Location = require('../models/Location');
var locationRouter = express.Router();

locationRouter
  .route('/locations')
  .get(function (request, response) {
      Location.filter({isDeleted:false})
      .then((locations) =>{
     if (locations) {  response.json({ msg: `Success`,statusCode:200,locations:locations});
          return;}
      response.json({ msg: `Fail`,statusCode:400,locations:[] });
      return;
      });
  });

  module.exports = locationRouter;

