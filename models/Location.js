var thinky = require('../connection');
var type = thinky.type;  

var locationSchema= thinky.createModel("locations", {
 name: type.string(),
  code: type.string(),
  isDeleted: type.boolean(),
  createdAt: type.date().default(),
 updatedAt: type.date().default()
 });
module.exports=locationSchema;
