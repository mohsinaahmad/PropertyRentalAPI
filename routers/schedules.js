var express = require('express');
var Schedule = require('../models/Schedule');
var scheduleRouter = express.Router();



// save schedule
scheduleRouter
  .route('/schedule')
  .post(function (request, response) {
 if (!request.body.title || !request.body.scheduleDate || !request.body.createdBy) {
          response.json({ msg: 'missing a parameter', statusCode: 400});
          return;
      }

      Schedule.filter({ title:request.body.title, scheduleDate:request.body.scheduleDate, createdBy:request.body.createdBy, isDeleted: false }).then((schedules) => {
    var schedule=schedules[0];

          if(schedule)
          {
              response.json({ msg: `Same schedule already exist on this date.`,statusCode:200 });
              return;
          }
          else
          {
            var schedule=new Schedule({});
            schedule.title=request.body.title;
            schedule.scheduleDate=request.body.scheduleDate;
            schedule.createdBy=request.body.createdBy;
            schedule.updatedBy=request.body.createdBy;
            schedule.isDeleted=false;
            schedule.save();

      response.json({ msg: `Schedule saved successfully.`,statusCode:200 });
      return;
          }
      });
  });

// get all schedules by userid
scheduleRouter
  .route('/schedules/:id')
  .get(function (request, response) {
      Schedule.filter({ createdBy:request.params.id, isDeleted: false })
      .orderBy('scheduleDate').run()
      .then((schedules) =>{
     if (!schedules) {  response.json({ msg: 'Error',statusCode:400,schedules:[]});
          return;}
      response.json({ msg: `Success`,statusCode:200,schedules:schedules });
      return;
      });
  });

// delete schedule by schedule id
  scheduleRouter
  .route('/schedule/:id')
  .post(function (request, response) {
      Schedule.filter({ id:request.params.id, isDeleted: false }).then((schedules) => {
          var schedule=schedules[0];
          if(!schedule)
          {
              response.json({ msg: `Schedule not found.`,statusCode:200 });
              return;
          }
          else
          {
             schedule.isDeleted=true;
             schedule.save(); 
             response.json({ msg: `Schedule deleted successfully.`,statusCode:200 });
             return;
          }
     
      });
  });
  module.exports = scheduleRouter;