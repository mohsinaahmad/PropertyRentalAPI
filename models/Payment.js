var thinky = require('../connection');
var type = thinky.type; 
var Property = require('../models/Property');
var User = require('../models/users');
var PropertyUnit=require('../models/PropertyUnit');

var paymentSchema=thinky.createModel("payments", {
transationId:String,
propertyId:String,
propertyName:String,
unitId:String,
unitName:String,
tenantId:String,
tenantName:String,
landlordId:String,
landlordName:String,
status:String,
amount:Number,
transationDate:Date,
createdBy:String,
updatedBy:String,
isDeleted: Boolean
}, { timestamps: true });

User.hasOne(paymentSchema, "payment", "id", "paymentId");
paymentSchema.belongsTo(User, "user", "createdBy", "id");
paymentSchema.belongsTo(User, "user1", "updatedBy", "id");
paymentSchema.belongsTo(User, "tenantuser", "tenantId", "id");
paymentSchema.belongsTo(User, "landlorduser", "landlordId", "id");


Property.hasOne(paymentSchema, "payment", "id", "paymentId");
paymentSchema.belongsTo(Property, "property", "propertyId", "id");

PropertyUnit.hasOne(paymentSchema, "payment", "id", "paymentId");
paymentSchema.belongsTo(PropertyUnit, "propertyunit", "propertyunitId", "id");

module.exports = paymentSchema;