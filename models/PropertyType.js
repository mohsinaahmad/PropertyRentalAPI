var thinky = require('../connection');
var type = thinky.type; 

var propertyTypeSchema=thinky.createModel("propertytypes", {
name:String,
isDeleted: Boolean
}, { timestamps: true });

module.exports =propertyTypeSchema;