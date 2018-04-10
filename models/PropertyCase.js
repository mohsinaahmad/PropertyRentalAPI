var thinky = require('../connection');
var type = thinky.type; 
var Property = require('../models/Property');
var User = require('../models/users');
var IssueSummary = require('../models/IssueSummary');

var propertycaseSchema=thinky.createModel("propertycases", {
caseId:String,
propertyId:String,
propertyName:String,
unitId:String,
unitName:String,
tenantId:String,
tenantName:String,
issuesummaryId:String,
issuesummaryName:String,
caseDetail:String,
caseDocs:Array,
status:String,
createdByrole:String,
createdBy:String,
updatedBy:String,
createdAt:Date,
updatedAt:Date,
isDeleted: Boolean
}, { timestamps: true });

User.hasOne(propertycaseSchema, "propertycase", "id", "propertycaseId");
propertycaseSchema.belongsTo(User, "user", "createdBy", "id");
propertycaseSchema.belongsTo(User, "user1", "updatedBy", "id");
propertycaseSchema.belongsTo(User, "tenantuser", "tenantId", "id");


Property.hasOne(propertycaseSchema, "propertycase", "id", "propertycaseId");
propertycaseSchema.belongsTo(Property, "property", "propertyId", "id");

IssueSummary.hasOne(propertycaseSchema, "issuesummary", "id", "issuesummaryId");
propertycaseSchema.belongsTo(IssueSummary, "issuesummary", "issuesummaryId", "id");

module.exports = propertycaseSchema;