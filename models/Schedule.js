// var mongoose = require('mongoose');
// var Schema = mongoose.Schema;
var thinky = require('../connection');
var type = thinky.type; 

var User = require('../models/users');

    var scheduleSchema= thinky.createModel("schedules", {
title:String,
scheduleDate:Date,
createdBy:String,
updatedBy:String,
isDeleted: Boolean
}, { timestamps: true });

User.hasOne(scheduleSchema, "schedule", "id", "scheduleId");
scheduleSchema.belongsTo(User, "user", "createdBy", "id");
scheduleSchema.belongsTo(User, "user1", "updatedBy", "id");

module.exports = scheduleSchema;