const bluebird = require('bluebird');
var express = require('express');
var Property = require('../models/Property');
var PropertyUnit = require('../models/PropertyUnit');
var PropertyCase = require('../models/PropertyCase');
var Role = require('../models/Role');
var User = require('../models/users');
const nodemailer = require('nodemailer')
const crypto = bluebird.promisifyAll(require('crypto'));
const smtp = require('../smtp');
var EmailTemplate = require('email-templates').EmailTemplate;
var path = require('path');
var templatesDir = path.resolve(__dirname, '../templates');
var async = require('async');
var feed = require("feed-read-parser");
var propertyRouter = express.Router();



//save property and its units
propertyRouter.route('/property')
 .post(function (request, response) {
     if (!request.body.createdBy) {
         response.json({ msg: 'missing a parameter', statusCode: 400, property: null });
         return;
     }
     const createProperty = () => {
         const property = new Property({
             name: request.body.name,
             address: request.body.address,
             propertyTypeId: request.body.propertyTypeId,
             propertyType: request.body.propertyType,
             holdingType: request.body.holdingType,
             prchaseDate: request.body.prchaseDate,
             purchaseAmount: request.body.purchaseAmount,
             isMortgaged: request.body.isMortgaged,
             mortgageProviderId: request.body.mortgageProviderId,
             mortgageProvider: request.body.mortgageProvider,
             mortgageType: request.body.mortgageType,
             mortgageTerm: request.body.mortgageTerm,
             interestRate: request.body.interestRate,
             mortgagePayment: request.body.mortgagePayment,
             mortgageOutstanding: request.body.mortgageOutstanding,
             mortgageStartDate: request.body.mortgageStartDate,
             mortgageEndDate: request.body.mortgageEndDate,
             isSingleUnit: request.body.propertyUnits.length == 1 ? true : false,
             currentEstimate: request.body.currentEstimate,
             propimageurl:request.body.propimageurl,
             keyExpirydates: [],
             propertyDocs: [],
             createdBy: request.body.createdBy,
             updatedBy: request.body.updatedBy,
             updatedAt: new Date(),
             createdAt: new Date(),
             isDeleted: false
         });

         return property.save().then(() => new Promise((resolve, reject) => {
             resolve(property);
         }));
     };

     const saveunits = (property) => {

         var units = request.body.propertyUnits;
         if (units.length > 0) {
             async.forEachSeries(units, function (item, callback) {
                 if (item.isVacant == "0") {
                     item.isVacant = false;
                 }
                 else {
                     item.isVacant = true;
                 }
                 var index = units.indexOf(item);
                 var unit = new PropertyUnit({
                     propertyId: property.id,
                     unitName: item.unitName,
                     bedRooms: item.bedRooms,
                     isVacant: item.isVacant,
                     rent: item.rent,
                     tenancyStartDate: item.tenancyStartDate,
                     tenancyEndDate: item.tenancyEndDate,
                     tenancyTerm: item.tenancyTerm,
                     createdBy: request.body.createdBy,
                     updatedBy: request.body.updatedBy,
                     isDeleted: false
                 });
                 unit.save().then(() => {

                     callback();
                     return;
                 });
             });
         }
         else {
             return;
         }
     };

     createProperty()
       .then(saveunits)
       .then(() => {
           if (!response.finished) {
               response.json({ msg: "Success", statusCode: 200 });
               return;
           }
       })
       .catch(err => {
           if (err) {
               response.json({ msg: err.message, statusCode: 400 });
               return;
           }
       })
 });


// edit property
propertyRouter.route('/property/:id')
 .put(function (request, response) {
     if (!request.params.id) {
         response.json({ msg: 'missing a parameter', statusCode: 400 });
         return;
     }
     Property.filter({ id: request.params.id, createdBy: request.body.createdBy, isDeleted: false }).then((property) => {
         if (!property) {
             response.json({ msg: "Property not found", statusCode: 400 });
             return;
         }
         else {
             property[0].address = request.body.address,
 property[0].name = request.body.name,
 property[0].purchaseAmount = request.body.purchaseAmount,
 property[0].currentEstimate = request.body.currentEstimate,
 property[0].prchaseDate = request.body.prchaseDate,
 property[0].propertyType=request.body.propertyType,
  property[0].propertyTypeId=request.body.propertyTypeId,
 property[0].holdingType= request.body.holdingType,
 property[0].propimageurl=request.body.propimageurl,
              property[0].interestRate = request.body.interestRate,
              property[0].mortgageEndDate = !request.body.mortgageEndDate ? property.mortgageEndDate : request.body.mortgageEndDate,
              property[0].mortgageStartDate = !request.body.mortgageStartDate ? property.mortgageStartDate : request.body.mortgageStartDate,
              property[0].mortgagePayment = !request.body.mortgagePayment ? property.mortgagePayment : request.body.mortgagePayment,
              property[0].mortgageProvider = !request.body.mortgageProvider ? property.mortgageProvider : request.body.mortgageProvider,
              property[0].mortgageType = !request.body.mortgageType ? property.mortgageType : request.body.mortgageType,
              property[0].mortgageOutstanding = !request.body.mortgageOutstanding ? property.mortgageOutstanding : request.body.mortgageOutstanding
             property[0].keyExpirydates = request.body.keyExpirydates;
             property[0].propertyDocs = request.body.propertyDocs;
             property[0].save().then(() => {

                 response.json({ msg: "Property updateted successfuly.", statusCode: 200 });
                 return;
             });
         }
     });
 });

propertyRouter
  .route('/property/:id')
  .get(function (request, response) {
      Property.get(request.params.id).then((property) => {
          if (!property) {
              response.json({ msg: 'err', statusCode: 400 });
              return;
          }
          if (property) {
              PropertyUnit.filter({ propertyId: property.id, isDeleted: false })
              .orderBy('createdAt').run()
     .then((propertyunits) => {
         var propertyData = property;
         if (!propertyunits) {
             propertyData.propertyUnits = [];
         }
         else {
             propertyData.propertyUnits = propertyunits;
         }
         response.json({ msg: `Success`, statusCode: 200, property: propertyData });
         return;
     });
          }
          else {
              response.json({ msg: `Success`, statusCode: 200, property: property });
              return;
          }
      });
  });

propertyRouter
.route('/properties/:id')
.get(function (request, response) {
    Property.filter({ createdBy: request.params.id, isDeleted: false })
    .then((properties) => {
        if (!properties) {
            response.json({ msg: 'Error', statusCode: 400, properties: [] });
            return;
        }
        if (properties.length > 0) {
            var propertiesData = [];
            async.forEachSeries(properties, function (item, callback) {
                var property = item;
                // .toObject();
                PropertyUnit.filter({ propertyId: item.id, isDeleted: false })
                .orderBy('unitName').run()
                 .then((propertyunits) => {

                     var index = properties.indexOf(item);
                     if (!propertyunits) {
                         property.propertyUnits = [];
                         propertiesData.push(property);
                         callback();
                     }
                     else {
                         property.propertyUnits = propertyunits;
                         propertiesData.push(property);
                         callback();
                     }

                     if ((properties.length - 1) == index) {
                         response.json({ msg: `Success`, statusCode: 200, properties: propertiesData });
                         return;
                     }
                 });

            }); 
        }
        else {
            response.json({ msg: `Success`, statusCode: 200, properties: properties });
            return;
        }

    });
});

// add property unit
propertyRouter
  .route('/propertyUnit')
  .post(function (request, response) {
      if (!request.body.createdBy || !request.body.propertyId) {
          response.json({ msg: 'missing a parameter', statusCode: 400, property: null });
          return;
      }
      Property.filter({ propertyId: request.body.propertyId, createdBy: request.body.createdBy, isDeleted: false })
       .then((property) => {
           if (!property) {
               response.json({ msg: "Property not found.", statusCode: 400 });
               return;
           }
           if (request.body.isVacant == "0") {
               request.body.isVacant = false;
           }
           else {
               request.body.isVacant = true;
           }
           var unit = new PropertyUnit({
               propertyId: request.body.propertyId,
               unitName: request.body.unitName,
               bedRooms: request.body.bedRooms,
               isVacant: request.body.isVacant,
               rent: request.body.rent,
               tenancyStartDate: request.body.tenancyStartDate,
               tenancyEndDate: request.body.tenancyEndDate,
               tenancyTerm: request.body.tenancyTerm,
               createdBy: request.body.createdBy,
               updatedBy: request.body.updatedBy,
               isDeleted: false,
           });
           unit.save(() => {
               response.json({ msg: `Property unit saved successfully.`, statusCode: 200, unit: unit });
               return;
           });
       });
  });


// edit propertyUnit
propertyRouter.route('/propertyUnit/:id')
 .put(function (request, response) {
     if (!request.params.id) {
         response.json({ msg: 'missing a parameter', statusCode: 400 });
         return;
     }
     PropertyUnit.filter({ id: request.params.id, propertyId: request.body.propertyId, createdBy: request.body.createdBy, isDeleted: false }).then((propertyUnit) => {
         if (!propertyUnit) {
             response.json({ msg: "PropertyUnit not found", statusCode: 400 });
             return;
         }
         else {
             if (request.body.isVacant == "0") {
                 request.body.isVacant = false;
             }
             else {
                 request.body.isVacant = true;
             }
             console.log(request.body);
             propertyUnit[0].unitName = request.body.unitName,
                          propertyUnit[0].rent = request.body.rent,
                          propertyUnit[0].isVacant = request.body.isVacant,
                          propertyUnit[0].tenancyEndDate = !request.body.tenancyEndDate ? propertyUnit.tenancyEndDate : request.body.tenancyEndDate,
                          propertyUnit[0].tenancyStartDate = !request.body.tenancyStartDate ? propertyUnit.tenancyStartDate : request.body.tenancyStartDate,
                          propertyUnit[0].save().then(() => {

                              response.json({ msg: "PropertyUnit updateted successfuly.", statusCode: 200 });
                              return;
                          });
         }
     });
 });


propertyRouter
.route('/propertyUnits/:id')
.get(function (request, response) {
    PropertyUnit.filter({ propertyId: request.params.id, isDeleted: false })
    .then((propertyunits) => {

        if (!propertyunits) {
            response.json({ msg: err, statusCode: 400, propertyunits: [] });
            return;
        }

        response.json({ msg: `Success`, statusCode: 200, propertyunits: propertyunits });
        return;
    });
});

// add tenant
propertyRouter.route('/tenant')
.post(function (request, response) {
    try {
        if (!request.body.createdBy || !request.body.unitId || !request.body.propertyId) {
            response.json({ msg: 'missing a parameter', statusCode: 400, property: null });
            return;
        }        
        Role.filter({ 'name': "Tenant" })
           .then((roles) => {
               var role = roles[0];
               crypto.randomBytesAsync(10).then((buf) => {
                   const generatepassword = buf.toString('hex');

                   console.log("getrole");
                   if (!role) {
                       response.json({ msg: 'Role not found with role name: Tenant', statusCode: 400 });
                       return;
                   }
                   else {
                       User.filter({ 'email': request.body.email }).then((user1s) => {
                           var user1 = user1s[0];
                           console.log("checkusername");
                           if (user1 && ((user1.roles.length > 0 && user1.roles[0].roleName != "Tenant") || user1.roles.length == 0)) {
                               response.json({ msg: 'A landlord exist with this email ' + request.body.email, statusCode: 400 });
                               return;
                           }
                           if (user1 && user1.isActive) {

                               response.json({ msg: 'Tenant already exist with this user name ' + request.body.email, statusCode: 400 });
                               return;
                           }
                           else {
                               if (user1 && !user1.isActive) {
                                   user1.profile.firstName = request.body.firstName;
                                   user1.profile.lastName = request.body.lastName;
                                   user1.profile.contactNum = request.body.contactNum;
                                   user1.isConfirmed = true;
                                   user1.save().then(() => {

                                       // send email
                                       var template = new EmailTemplate(path.join(templatesDir, 'tenantSignup'));
                                       var locals = {
                                           firstName: request.body.firstName,
                                           lastName: request.body.lastName,
                                           userName: request.body.email,
                                           password: generatepassword,
                                           host: process.env.HOSTNAME
                                       };

                                       template.render(locals, function (err, results) {
                                           if (err) {
                                               return console.error(err);
                                           }
                                           var mailData = {
                                               from: process.env.FROMEMAIL, // sender address
                                               to: user1.email,
                                               subject: results.subject,
                                               html: results.html
                                           };
                                           const smtpProtocol = smtp.smtpTransport;
                                           smtpProtocol.sendMail(mailData)
                                           .then(() => {

                                               response.json({ msg: 'Tenant account is activated and an e-mail has been sent to Tenant on this email ' + request.body.email + ' with further instructions.', statusCode: 200 });
                                               return;
                                           });
                                       });

                                   });
                               }

                               else {
                                   User.filter({ 'email': request.body.email, 'isActive': true }).then((existingUser) => {

                                       if (existingUser[0] && existingUser[0].isActive) {
                                           response.json({ msg: 'Tenant with that email address already exists.', statusCode: 400 });
                                           return;
                                       }
                                       else {
                                           const user = new User({
                                               email: request.body.email,
                                               password: generatepassword,
                                               userName: request.body.email,
                                               isConfirmed: true,
                                               isActive: true,
                                               roles: [{ roleId: role.id, roleName: role.name }],
                                               profile: {
                                                   firstName: request.body.firstName,
                                                   lastName: request.body.lastName,
                                                   contactNum: request.body.contactNum
                                               }
                                           });


                                           user.save().then(() => {
                                               PropertyUnit.filter({ id: request.body.unitId, propertyId: request.body.propertyId, createdBy: request.body.createdBy, isDeleted: false }).limit(1).then((units) => {
                                                   var unit = units[0];
                                                   unit.tenantUserId = user.id;
                                                   unit.firstName = request.body.firstName;
                                                   unit.lastName = request.body.lastName;
                                                   unit.email = request.body.email;
                                                   unit.contactNum = request.body.contactNum;
                                                   unit.rent = request.body.rent;
                                                   unit.tenancyStartDate = request.body.tenancyStartDate;
                                                   unit.tenancyEndDate = request.body.tenancyEndDate;
                                                   unit.deposit = request.body.deposit;
                                                   unit.rentDueDate = request.body.rentDueDate;
                                                   unit.tenantBank = request.body.tenantBank;
                                                   unit.bankSortCode = request.body.bankSortCode;
                                                       unit.isVacant=request.body.isVacant;
                                                   unit.bankAccountNumber = request.body.bankAccountNumber;
                                                   unit.tenantDocs = request.body.tenantDocs
                                                   unit.save().then(() => {

                                                       // send email
                                                       var template = new EmailTemplate(path.join(templatesDir, 'tenantSignup'));
                                                       var locals = {
                                                           firstName: request.body.firstName,
                                                           lastName: request.body.lastName,
                                                           userName: request.body.email,
                                                           password: generatepassword,
                                                           host: process.env.HOSTNAME
                                                       };

                                                       template.render(locals, function (err, results) {
                                                           if (err) {
                                                               return console.error(err);
                                                           }

                                                           var mailData = {
                                                               from: process.env.FROMEMAIL, // sender address
                                                               to: user.email,
                                                               subject: results.subject,
                                                               html: results.html
                                                           };
                                                           const smtpProtocol = smtp.smtpTransport;
                                                           smtpProtocol.sendMail(mailData)
                                                           .then(() => {

                                                               response.json({ msg: 'Tenant account created and an e-mail has been sent to Tenant on this email ' + request.body.email + ' with further instructions.', statusCode: 200 });
                                                               return;
                                                           });
                                                       });
                                                   });
                                               });
                                           });
                                       }

                                   });
                               }
                           }
                       });
                   }
               });
           });
    } catch (err) {
        response.json({ msg: err.message, statusCode: 500 });
        return;

    }
});


propertyRouter
  .route('/tenant/:id')
  .get(function (request, response) {
      PropertyUnit.filter({ id: request.params.id, isDeleted: false }).then((propertyunit) => {
          if (propertyunit[0]) {
              response.json({ msg: `Success`, statusCode: 200, tenat: propertyunit[0] });
              return;
          }
          else {
              response.json({ msg: `Success`, statusCode: 200, tenat: propertyunit });
              return;
          }
      });
  });


//all tenant
propertyRouter
  .route('/tenant')
  .get(function (request, response) {
      PropertyUnit.filter({isDeleted: false }).then((propertyunit) => {
          if (propertyunit[0]) {
              response.json({ msg: `Success`, statusCode: 200, tenat: propertyunit[0] });
              return;
          }
          else {
              response.json({ msg: `Success`, statusCode: 200, tenat: propertyunit });
              return;
          }
      });
  });




//delete tenant
propertyRouter
  .route('/tenant/:id')
  .post(function (request, response) {
      PropertyUnit.filter({ id: request.params.id, isDeleted: false }).then((propertyunits) => {
          var propertyunit = propertyunits[0];
          if (!propertyunit) {
              response.json({ msg: 'err', statusCode: 400 });
              return;
          }
          if (propertyunit) {
              User.filter({ 'id': propertyunit.tenantUserId }).then((tenants) => {
                  var tenant = tenants[0];
                  console.log("checkusername");
                  if (tenant && tenant.isActive) {
                      tenant.isActive = false;
                      tenant.save();
                  }

                  propertyunit.tenantUserId = null;
                  propertyunit.firstName = "";
                  propertyunit.lastName = "";
                  propertyunit.contactNum = "";
                  propertyunit.tenantDocs = [];
                  propertyunit.email = "";
                  propertyunit.save();
                  response.json({ msg: 'Tenant deleted successfully.', statusCode: 200 });
                  return;       
              });
          }
          else {
              response.json({ msg: `Unit not found`, statusCode: 400, tenat: propertyunit });
              return;
          }

      });
  });



// edit tenant
propertyRouter
.route('/tenant/:id')
.put(function (request, response) {
    if (!request.params.id || !request.body.createdBy) {
        response.json({ msg: 'missing a parameter', statusCode: 400, user: null });
        return;
    }

    PropertyUnit.filter({ unitName: request.body.unitName, propertyId: request.body.propertyId }).then((oldunit) => {
        if (oldunit.length) {
            var currentunit = oldunit[0];
            if (currentunit) {
                currentunit.unitName = request.body.oldunitname;
                currentunit.save()
            }
        }
        PropertyUnit.filter({ id: request.params.id, isDeleted: false, propertyId: request.body.propertyId }).then((propertyunits) => {
            var propertyunit = propertyunits[0];
            if (!propertyunit) {
                response.json({ msg: 'err', statusCode: 400 });
                return;
            }
            if (propertyunit) {
                User.get(propertyunit.tenantUserId).then((tenant) => {
                    console.log("checkusername");
                    if (tenant && tenant.isActive) {
                        tenant.profile.firstName = request.body.firstName;
                        tenant.profile.lastName = request.body.lastName;
                        tenant.profile.contactNum = request.body.contactNum;
                        tenant.save();

                        propertyunit.unitName = request.body.unitName;
                        propertyunit.firstName = request.body.firstName;
                        propertyunit.lastName = request.body.lastName;
                        propertyunit.contactNum = request.body.contactNum;
                        propertyunit.rent = request.body.rent;
                        propertyunit.deposit = request.body.deposit;
                        propertyunit.tenancyStartDate = request.body.tenancyStartDate;
                        propertyunit.tenancyEndDate = request.body.tenancyEndDate;
                        propertyunit.rentDueDate = request.body.rentDueDate;
                        propertyunit.bankSortCode = request.body.bankSortCode;
                        propertyunit.bankAccountNumber = request.body.bankAccountNumber;
                        propertyunit.tenantBank = request.body.tenantBank;
                        propertyunit.tenantDocs = request.body.tenantDocs
                        propertyunit.save().then(() => {;
                            response.json({ msg: 'Tenant updated successfully.', statusCode: 200 });
                            return;
                        });
                    }
                    else {
                        response.json({ msg: 'Tenant not found.', statusCode: 400 });
                    }
                });
            }
            else {
                response.json({ msg: `Unit not found`, statusCode: 400, tenat: propertyunit });
                return;
            }
        });
    });
});



// create property case
propertyRouter
.route('/propertycase')
.post(function (request, response) {
    var pp = request.body.propertyId;
    var tt = request.body.tenantId;
    if (!request.body.tenantId || !request.body.createdBy || !request.body.propertyId || !request.body.createdByrole
    || !request.body.issuesummaryId) {
        response.json({ msg: 'missing a parameter', statusCode: 400 });
        return;
    }

    PropertyUnit.filter({ propertyId: pp, tenantUserId: tt, isDeleted: false }).then((propertyunits) => {
        if(propertyunits.length==0){
            response.json({ msg: 'error', statusCode: 400 });
            return;
        }
        var propertyunit = propertyunits[0];
        if (!propertyunit) {
            response.json({ msg: 'err', statusCode: 400 });
            return;
        }
        if (propertyunit) {

            User.filter({ 'id': propertyunit.tenantUserId }).then((tenants) => {
                var tenant = tenants[0];
                if (tenant && tenant.isActive) {
                    var propertycasesCount = 0;
                    PropertyCase.count().execute().then(function (result) {
                        propertycasesCount = result;

                        console.log('propertycasesCount:  ' + propertycasesCount);
                        var d = new Date();
                        var caseid = (d.getFullYear()).toString() + (d.getMonth() + 1).toString() + (d.getDate()).toString() + '00' + (propertycasesCount + 1);
                        var propertycase = new PropertyCase({
                            caseId: caseid,
                            propertyId: request.body.propertyId,
                            propertyName: request.body.propertyName,
                            unitId: propertyunit.id,
                            unitName: propertyunit.name,
                            tenantId: request.body.tenantId,
                            tenantName: tenant.profile.firstName,
                            issuesummaryId: request.body.issuesummaryId,
                            issuesummaryName: request.body.issuesummaryName,
                            caseDetail: request.body.caseDetail,
                            createdAt: new Date(),
                            createdByrole: request.body.createdByrole,

                            status: 'Active',
                            caseDocs: request.body.caseDocs,
                            isDeleted: false,
                        });
                        var toeemail = '';


                        User.filter({ 'id': propertyunit.createdBy }).then((landlords) => {
                            var landlord = landlords[0];
                            if (request.body.createdByrole == 'Tenant') {
                                toeemail = landlord.email;
                            }
                            else {
                                toeemail = tenant.email;
                            }
                            propertycase.save().then(() => {
                                // send email
                                var template = new EmailTemplate(path.join(templatesDir, 'propertyCase'));

                                var locals = {
                                    tenantName: propertycase.tenantName,
                                    createdByname: request.body.createdByname,
                                    createdByrole: request.body.createdByrole,
                                    host: process.env.HOSTNAME
                                };

                                template.render(locals, function (err, results) {
                                    if (err) {
                                        return console.error(err);
                                    }

                                    var mailData = {
                                        from: process.env.FROMEMAIL, // sender address
                                        to: toeemail,
                                        subject: results.subject,
                                        html: results.html
                                    };
                                    const smtpProtocol = smtp.smtpTransport;
                                    smtpProtocol.sendMail(mailData)
                                    .then(() => {

                                        response.json({ msg: 'Property case saved successfully.', statusCode: 200 });
                                        return;
                                    });
                                });
                            });
                        });
                    });
                }
                else {
                    response.json({ msg: 'Tenant not found.', statusCode: 400 });
                }
            });
        }
        else {
            response.json({ msg: `Unit not found`, statusCode: 400 });
            return;
        }
    });
});

propertyRouter
 .route('/propertyCases/:id')
 .get(function (request, response) {
     PropertyCase.filter({ propertyId: request.params.id, isDeleted: false })
      .then((propertycases) => {
          if (!propertycases) {
              response.json({ msg: 'Error', statusCode: 400, propertycases: [] });
              return;
          }
          response.json({ msg: `Success`, statusCode: 200, propertycases: propertycases });
          return;
      });
 });



//get all cases

propertyRouter
 .route('/propertyCasesAll')
 .get(function (request, response) {
     PropertyCase.filter({ isDeleted: false }).getJoin({property:true})
      .then((propertycases) => {
          if (!propertycases) {
              response.json({ msg: 'Error', statusCode: 400, propertycases: [] });
              return;
          }
          response.json({ msg: `Success`, statusCode: 200, propertycases: propertycases });
          return;
      });
 });






//get case by id
propertyRouter
.route('/propertyCase/:id')
.get(function (request, response) {
    console.log('id:  ' + request.params.id);
    PropertyCase.filter({ id: request.params.id, isDeleted: false })
     .then((propertycases) => {
         var propertycase = propertycases[0];
         if (!propertycase) {
             response.json({ msg: 'Case not found', statusCode: 400, propertycases: [] });
             return;
         }
         response.json({ msg: `Success`, statusCode: 200, propertycase: propertycase });
         return;
     });
});


// edit property case
propertyRouter
.route('/propertycase')
.put(function (request, response) {
    if (!request.body.tenantId || !request.body.createdBy || !request.body.propertyId || !request.body.caseId
    || !request.body.status || !request.body.issuesummaryId) {
        response.json({ msg: 'missing a parameter', statusCode: 400 });
        return;
    }
    PropertyCase.filter({ id: request.body.caseId, isDeleted: false }).then((propertycases) => {
        var propertycase = propertycases[0];
        if (!propertycase) {
            response.json({ msg: 'Property case not found', statusCode: 400 });
            return;
        }
        if (propertycase) {
            propertycase.status = request.body.status;
            propertycase.issuesummaryId = request.body.issuesummaryId;
            propertycase.issuesummaryName = request.body.issuesummaryName;
            propertycase.caseDetail = request.body.caseDetail;
            propertycase.createdAt = new Date();
            propertycase.caseDocs = request.body.caseDocs;
            propertycase.save().then(() => {
                User.filter({ 'id': propertycase.tenantId }).then((tenants) => {
                    var tenant = tenants[0];
                    // send email
                    var template = new EmailTemplate(path.join(templatesDir, 'propertyCase'));
                    var locals = {
                        tenantName: propertycase.tenantName,
                        createdByname: request.body.createdByname,
                        host: process.env.HOSTNAME
                    };

                    template.render(locals, function (err, results) {
                        if (err) {
                            return console.error(err);
                        }

                        var mailData = {
                            from: process.env.FROMEMAIL, // sender address
                            to: tenant.email,
                            subject: results.subject,
                            html: results.html
                        };
                        const smtpProtocol = smtp.smtpTransport;
                        smtpProtocol.sendMail(mailData)
                        .then(() => {

                            response.json({ msg: 'Property case updated successfully.', statusCode: 200 });
                            return;
                        });
                    });
                });
            });
        }
    });
});



//remove property
propertyRouter
.route('/propertys/:id')
.post(function (request, response) {
    Property.filter({ id: request.params.id, isDeleted: false }).limit(1).then((property) => {
        if (!property) {
            response.json({ msg: err, statusCode: 400 });
            return;
        }
        if (property) {
            PropertyUnit.filter({ propertyId: property[0].id, isDeleted: false })
            .then((propertyunits) => {

                property[0].isDeleted = true;
                property[0].save();
                if (propertyunits.length > 0) {
                    async.forEachSeries(propertyunits, function (item, callback) {
                        var index = propertyunits.indexOf(item);
                        if (item.tenantUserId) {
                            User.filter({ 'id': item.tenantUserId }).limit(1).then((tenant) => {
                                item.tenantUserId = null;
                                item.firstName = "";
                                item.lastName = "";
                                item.contactNum = "";
                                item.tenantDocs = [];
                                item.isDeleted = true;
                                item.email = "";
                                item.save();
                                if (tenant[0] && tenant[0].isActive) {
                                    tenant[0].isActive = false;
                                    tenant[0].save();
                                }
                                callback();
                                if ((propertyunits.length - 1) == index) {
                                    response.json({ msg: `Property removed successfully.`, statusCode: 200 });
                                    return;
                                }
                            });
                        }
                        callback();
                        if ((propertyunits.length - 1) == index) {
                            response.json({ msg: `Property removed successfully.`, statusCode: 200 });
                            return;
                        }
                    });
                }
                else {
                    response.json({ msg: 'Property removed successfully.', statusCode: 200 });
                    return;
                }
            });
        }
        else {
            response.json({ msg: `Property not found.`, statusCode: 200 });
            return;
        }
    });
});


propertyRouter
  .route('/portfolioalerts/:propertyId/:userId')
  .get(function (request, response) {
      Property.filter({ id: request.params.propertyId, createdBy: request.params.userId, isDeleted: false }).limit(1).then((properties) => {
          var property = properties[0];
          if (property) {
              var propertyAlerts = [];
              var date = new Date();
              date.setDate(date.getDate() - 30);
              var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
              async.forEach(property.keyExpirydates, function (item) {
                  if (item.name.includes('Gas') || item.name.includes('Gas Safety Certificate')) {
                      var firstDate = new Date();
                      var secondDate = new Date(item.value);

                      var diffDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / (oneDay)));
                      if (!item.value) {
                          diffDays = 0;
                      }
                      var alertMsg =
                     {
                         message: "Alert for Gas Safety Certificate due " + property.name + ", Gas Safety Certificate is due in  " + diffDays + " days.",
                         expiredOn: property.keyExpirydates
                     };
                      if (!diffDays == 0) {
                          propertyAlerts.push(alertMsg);

                      }
                  }
              });

              if (property.mortgageEndDate && property.mortgageEndDate >= date) {
                  var firstDate = new Date();
                  var secondDate = new Date(property.mortgageEndDate);
                  var diffDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / (oneDay)));
                  var alertMsg =
                  {
                      message: "For property " + property.name + ", mortgage is due for renewal in  " + diffDays + " days.",
                      expiredOn: property.mortgageEndDate
                  }
                  propertyAlerts.push(alertMsg);
              }

              PropertyUnit.filter({ propertyId: property.id, isDeleted: false }).then((propertyunits) => {
                  if (propertyunits.length > 0) {
                      async.forEachSeries(propertyunits, function (item, callback) {
                          var index = propertyunits.indexOf(item);
                          if (item.tenantUserId && item.tenancyEndDate >= date) {
                              var alertMsg =
                              {
                                  message: "For property " + property.name + "(unit " + item.unitName + "), the tenancy is ending on " + item.tenancyEndDate.toLocaleDateString("en-US") + " date, you need to find new tenants.",
                                  expiredOn: item.tenancyEndDate
                              }
                              propertyAlerts.push(alertMsg);
                          }
                          if (item.rentDueDate && item.rentDueDate > new Date()) {
                              var firstDate = new Date();
                              var secondDate = new Date(property.rentDueDate);
                              var diffDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / (oneDay)));
                              var alertMsg =
                              {
                                  message: "For property " + property.name + " rent is overdue by " + diffDays + " days.",
                                  color: 'red',
                                  expiredOn: item.rentDueDate
                              }
                              propertyAlerts.push(alertMsg);
                          }
                          callback();
                          if ((propertyunits.length - 1) == index) {
                              response.json({ msg: `Success`, statusCode: 200, propertyAlerts: propertyAlerts });
                              return;
                          }
                      });
                  }
                  else {
                      response.json({ msg: `Success`, statusCode: 200, propertyAlerts: propertyAlerts });
                      return;
                  }
              });
          }
          else {
              response.json({ msg: `Property not found`, statusCode: 200 });
              return;
          }
      });
  });

propertyRouter
 .route('/propertynews')
 .get(function (request, response) {

     var feedrss = [
         'http://www.telegraph.co.uk/property/rss.xml',
     'http://www.estatesgazette.com/blogs/propertyinnumbers/category/investment/feed/'
     ]
     feed(feedrss, function (err, articles) {
         if (err) {
             response.json({ msg: err.message, statusCode: 400 });
             return;
         }
         response.json({ msg: `RSS Feed found`, articles: articles, statusCode: 200 });
         return;
     });
 });



//delete tenant
propertyRouter
  .route('/tenantunit/:id')
  .post(function (request, response) {
      PropertyUnit.filter({ id: request.params.id, isDeleted: false }).then((propertyunits) => {
          var propertyunit = propertyunits[0];
          if (!propertyunit) {
              response.json({ msg: 'err', statusCode: 400 });
              return;
          }
          if (propertyunit) {
              User.filter({ 'id': propertyunit.propertyId }).then((tenants) => {
                  var tenant = tenants[0];
                  console.log("checkusername");
                  if (tenant && tenant.isActive) {
                      tenant.isActive = false;
                      tenant.save();
                  }
                  propertyunit.propertyId = null;
                  propertyunit.firstName = "";
                  propertyunit.lastName = "";
                  propertyunit.save();
                  response.json({ msg: 'Tenant deleted successfully.', statusCode: 200 });
                  return;
                            });

          }
          else {
              response.json({ msg: `Unit not found`, statusCode: 400, tenat: propertyunit });
              return;
          }

      });
  });

propertyRouter
  .route('/propertiestenant/:id')
  .get(function (request, response) {
      Property.filter({ createdBy: request.params.id, isDeleted: false })
      .then((properties) => {
          if (!properties) {
              response.json({ msg: 'Error', statusCode: 400, properties: [] });
              return;
          }
          if (properties.length > 0) {
              var propertiesData = [];
              async.forEachSeries(properties, function (item, callback) {
                  var property = item;

                  PropertyUnit.filter({ propertyId: item.id, isDeleted: false })
                  .orderBy('unitName').run()

                   .then((propertyunits) => {

                       var index = properties.indexOf(item);
                       if (!propertyunits) {
                           property.propertyUnits = [];
                           propertiesData.push(property);
                           callback();
                       }
                       else {
                           property.propertyUnits = propertyunits;
                           propertiesData.push(property);
                           callback();
                       }
                       var prpertiestest = [];
                       var totalrent = 0;
                       if ((properties.length - 1) == index) {
                           async.forEachSeries(property.propertyUnits, function (item, callback) {
                               if (item.tenantUserId != null) {
                                   var diff = (item.tenancyStartDate.getTime() - item.tenancyEndDate.getTime()) / 1000;
                                   diff /= (60 * 60 * 24 * 7 * 4);
                                   var result = Math.abs(Math.round(diff));

                                   totalrent = totalrent + (result * item.rent);
                               }
                               callback();
                           });
                           prpertiestest.push({ 'propertyName': property.name, 'totalrent': totalrent, 'propertyId': property.id });
                           property.prpertiestest = prpertiestest;

                           response.json({ msg: `Success`, statusCode: 200, properties: propertiesData });


                           return;
                       }
                       else {
                           async.forEachSeries(property.propertyUnits, function (item, callback) {
                               if (item.tenantUserId != null) {
                                   var diff = (item.tenancyStartDate.getTime() - item.tenancyEndDate.getTime()) / 1000;
                                   diff /= (60 * 60 * 24 * 7 * 4);
                                   var result = Math.abs(Math.round(diff));

                                   totalrent = totalrent + (result * item.rent);
                               }

                               callback();
                           });
                           prpertiestest.push({ 'propertyName': property.name, 'totalrent': totalrent, 'propertyId': property.id });
                           property.prpertiestest = prpertiestest;
                       }
                   });

              });
          }
          else {
              response.json({ msg: `Success`, statusCode: 200, properties: properties });
              return;
          }
      });
  });

module.exports = propertyRouter;