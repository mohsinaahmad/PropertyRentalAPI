var thinky = require('../connection');
var type = thinky.type; 
var MortgageProvider = require('../models/MortgageProvider');
var PropertyType = require('../models/PropertyType');
var User = require('../models/users');

var propertySchema=thinky.createModel("properties", {
name:String,
address:String,
postalCode:String,
propertyTypeId:String,
propertyType:String,
holdingType:String,
prchaseDate:Date,
purchaseAmount:Number,
currentEstimate:Number,
isMortgaged:Boolean,
mortgageProviderId:String,
mortgageProvider:String,
mortgageType:String,
mortgageTerm:Number,
interestRate:Number,
mortgagePayment:Number,
mortgageOutstanding:Number,
mortgageStartDate:Date,
mortgageEndDate:Date,
isSingleUnit:Boolean,
propertyDocs:Array,
keyExpirydates:Array,
createdBy:String,
updatedBy:String,
createdAt:Date,
updatedAt:Date,
propimageurl:String,
isDeleted: Boolean
}, { timestamps: true });

User.hasOne(propertySchema, "property", "id", "propertyId");
propertySchema.belongsTo(User, "user", "createdBy", "id");
propertySchema.belongsTo(User, "user1", "updatedBy", "id");

MortgageProvider.hasOne(propertySchema, "property", "id", "propertyId");
propertySchema.belongsTo(MortgageProvider, "mortgageprovider", "mortgageProviderId", "id");

PropertyType.hasOne(propertySchema, "property", "id", "propertyId");
propertySchema.belongsTo(PropertyType, "propertytype", "propertyTypeId", "id");

module.exports =propertySchema;