const bluebird = require('bluebird');
var express = require('express');
var Payment = require('../models/Payment');


var paymentRouter = express.Router();

 paymentRouter.route('/payment')
  .post(function (request, response) {
      if (!request.body.createdBy || !request.body.transationId || !request.body.unitId 
      || !request.body.propertyId || !request.body.amount || !request.body.tenantId  || !request.body.landlordId || !request.body.transationDate) {
         response.json({ msg: 'missing a parameter', statusCode: 400 });
          return;
     }
      const payment = new Payment({
     transationId:request.body.transationId,
propertyId:request.body.propertyId,
propertyName:request.body.propertyName,
unitId:request.body.unitId,
unitName:request.body.unitName,
tenantId:request.body.tenantId,
tenantName:request.body.tenantName,
landlordId:request.body.landlordId,
landlordName:request.body.landlordName,
amount:request.body.amount,
transationDate:request.body.transationDate,
createdBy:request.body.createdBy,
updatedBy:request.body.createdBy,
isDeleted: false
      });

payment.save().then(() => {
           response.json({ msg: "Payment saved successfully", statusCode: 200, payment:payment });
                  return; 
        });
     });

     paymentRouter.route('/payments/:tenantId')
  .get(function (request, response) {
      if (!request.params.tenantId ) {
         response.json({ msg: 'missing a parameter', statusCode: 400 });
          return;
     }
      
 Payment.filter({tenantId:request.params.tenantId}).then((payments) => {
           response.json({ msg: "Success", statusCode: 200, payments:payments });
                  return; 
        });
     });

//paypal details on landlord
     paymentRouter.route('/payment/:landlordId')
  .get(function (request, response) {
      if (!request.params.landlordId ) {
         response.json({ msg: 'missing a parameter', statusCode: 400 });
          return;
     }
      
 Payment.filter({landlordId:request.params.landlordId}).then((payments) => {
     if(payments){
response.json({ msg: "Success", statusCode: 200, payments:payments });
                  return; 
     }
           else{
               response.json({ msg: "Error", statusCode: 400, payments:payments });
                  return; 
           }
        });

     });

//paypal group by details on landlord
     paymentRouter.route('/paymentproperty/:landlordId')
  .get(function (request, response) {
      if (!request.params.landlordId ) {
         response.json({ msg: 'missing a parameter', statusCode: 400 });
          return;
     }
      

 Payment.filter({landlordId:request.params.landlordId}).group('propertyId').run().then((payments) => {
     if(payments){
response.json({ msg: "Success", statusCode: 200, payments:payments });
                  return; 
     }
           else{
               response.json({ msg: "Error", statusCode: 400, payments:payments });
                  return; 
           }
        });
     });


//paypal group by details on unit
     paymentRouter.route('/paymentproperties/:propertyId')
  .get(function (request, response) {
      if (!request.params.propertyId ) {
         response.json({ msg: 'missing a parameter', statusCode: 400 });
          return;
     }
      

 Payment.filter({propertyId:request.params.propertyId}).then((payments) => {
     if(payments){
response.json({ msg: "Success", statusCode: 200, payments:payments });
                  return; 
     }
           else{
               response.json({ msg: "Error", statusCode: 400, payments:payments });
                  return; 
           }
        });
     });

module.exports = paymentRouter;