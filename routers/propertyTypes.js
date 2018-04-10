var express = require('express');
var PropertyType = require('../models/PropertyType');
var propertyTypesRouter = express.Router();
var r = require('../connection');

propertyTypesRouter
  .route('/propertyTypes')
  .get(function (request, response) {
      PropertyType.filter({ isDeleted: false }).then((propertyTypes) =>{
     if (!propertyTypes) {  response.json({ msg: 'Error',statusCode:400,propertyTypes: [] });
          return;}
      response.json({ msg: `Success`,statusCode:200,propertyTypes:propertyTypes });
      return;
      });
  });
  
  module.exports = propertyTypesRouter;