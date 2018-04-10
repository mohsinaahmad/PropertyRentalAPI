const bluebird = require('bluebird');
var express = require('express');
var PropertyUnit = require('../models/PropertyUnit');
const nodemailer = require('nodemailer')
const crypto = bluebird.promisifyAll(require('crypto'));
const smtp = require('../smtp');
var EmailTemplate = require('email-templates').EmailTemplate;
var path = require('path');
var templatesDir = path.resolve(__dirname, '../templates');
var async = require('async');
var feed = require("feed-read-parser");
var tenantsRouter = express.Router();
var r = require('../connection');

tenantsRouter
  .route('/tenantproperty/:tenantId')
   .get(function (request, response) {
 PropertyUnit.filter({ tenantUserId: request.params.tenantId, isDeleted: false }).getJoin({
  property: true
})
    .then((propertyunits) => {
        if (!propertyunits) {
            response.json({ msg: err, statusCode: 400, propertyunits: [] });
            return;
        }
        var propertiesData = [];
        propertiesData.push(propertyunits[0]);
        response.json({ msg: `Success`, statusCode: 200, propertyunits: propertiesData });
        return;
    });
  });
  module.exports = tenantsRouter;