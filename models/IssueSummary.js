var thinky = require('../connection');
var type = thinky.type; 

var issuesummarySchema= thinky.createModel("issuesummaries", {
name:String,
isDeleted: Boolean
}, { timestamps: true });

module.exports = issuesummarySchema;