// var mongoose = require('mongoose');
// var Schema = mongoose.Schema;
var thinky = require('../connection');
var type = thinky.type; 

var roleSchema=thinky.createModel("roles", {
name:String
}, { timestamps: true });

module.exports = roleSchema;