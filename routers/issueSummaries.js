var express = require('express');
var IssueSummary = require('../models/IssueSummary');
var issuesummaryRouter = express.Router();

issuesummaryRouter
  .route('/issuesummaries')
  .get(function (request, response) {
      IssueSummary.filter({ isDeleted: false }).then((issuesummaries) =>{
     if (!issuesummaries) {  response.json({ msg: 'Error',statusCode:400,issuesummaries:[]});
          return;}
      response.json({ msg: `Success`,statusCode:200,issuesummaries:issuesummaries });
      return;
      });
  });

  module.exports = issuesummaryRouter;