var thinky = require('../connection');
var type = thinky.type; 

var mortgageProviderSchema=thinky.createModel("mortgageproviders", {
name:String,
isDeleted: Boolean
}, { timestamps: true });

module.exports = mortgageProviderSchema;