var thinky = require('../connection');
var type = thinky.type; 
var Property = require('../models/Property');
var User = require('../models/users');

var propertyunitSchema=thinky.createModel("propertyunits", {
    propertyId:String,
unitName:String,
bedRooms:Number,
isVacant:Boolean,
tenantUserId:String,
firstName:String,
lastName:String,
email:String,
contactNum:String,
tenancyStartDate:Date,
tenancyEndDate:Date,
//tenancyTerm:Number,
tenantDocs:Array,
deposit:Number,
rent:Number,
rentDueDate: Number,
tenantBank:String,
bankSortCode:Number,
bankAccountNumber:Number,
createdBy:String,
updatedBy:String,
createdAt:Date,
updatedAt:Date,
isDeleted: Boolean
}, { timestamps: true });



User.hasOne(propertyunitSchema, "propertyunit", "id", "propertyunitId");
propertyunitSchema.belongsTo(User, "user", "createdBy", "id");
propertyunitSchema.belongsTo(User, "user1", "updatedBy", "id");
propertyunitSchema.belongsTo(User, "tenantuser", "tenantUserId", "id");


Property.hasOne(propertyunitSchema, "property", "id", "propertyId");
propertyunitSchema.belongsTo(Property, "property", "propertyId", "id");
module.exports = propertyunitSchema;