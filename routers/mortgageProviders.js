var express = require('express');
var MortgageProvider = require('../models/MortgageProvider');
var mortgageProviderRouter = express.Router();


mortgageProviderRouter
  .route('/mortgageProviders')
  .get(function (request, response) {
      MortgageProvider.filter({ isDeleted: false }).then((providers) =>{
     if (!providers) {  response.json({ msg: 'Error',statusCode:400,mortgageProviders:[] });
          return;}
      response.json({ msg: `Success`,statusCode:200,mortgageProviders:providers });
      return;
      });
  });
  
  module.exports = mortgageProviderRouter;