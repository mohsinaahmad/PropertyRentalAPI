const bluebird = require('bluebird');
var express = require('express');
var User = require('../models/users');
var Role = require('../models/Role');
const nodemailer = require('nodemailer')
const crypto = bluebird.promisifyAll(require('crypto'));
const smtp = require('../smtp');
var EmailTemplate = require('email-templates').EmailTemplate;
var path = require('path');
var templatesDir = path.resolve(__dirname, '../templates');
var r = require('../connection');
var userRouter = express.Router();

userRouter
  .route('/')
  .get(function (request, response) {
      response.json({ msg: `Welcome to property manager apis`, statusCode: 200 });
      return;
  });
userRouter
  .route('/login')
  .post(function (request, response) {



      var userName = request.body.userName;
      var password = request.body.password;
      User.filter({ userName: userName }).then((users) => {
          var user = users[0];
          if (!user) {
              response.json({ msg: `UserName ${userName} not found.`, statusCode: 400, user: null });
              return;
          }
          if (user && user.isConfirmed) {
              if (!user.isActive && (user.roles.length > 0 && user.roles[0].roleName == "Tenant")) {
                  response.json({ msg: 'Your account is not active. Please contact your landlord.', statusCode: 400, user: null });
                  return;
              }
              else {
                  user.comparePassword(password, (err, isMatch) => {
                      if (err) {
                          response.json({ msg: err, statusCode: 400, user: null });
                          return;
                      }
                      if (isMatch) {
                          response.json({ msg: 'Success', statusCode: 200, user: user });
                          return;
                      }
                      else {
                          response.json({ msg: 'Invalid username or password.', statusCode: 400, user: null });
                          return;
                      }
                  });
              }
          }
          else {
              response.json({ msg: 'Your email is not confirmed yet. Please check your inbox.', statusCode: 400, user: null });
              return;
          }
      });
  });


userRouter
  .route('/googleLogin')
  .post(function (req, response) {


      User.filter({ google: req.body.googleId }).then((existingUsers) => {
          var existingUser = existingUsers[0];
          if (existingUser) {
              response.json({ msg: `There is already a Google account that belongs to you. Sign in with that account.`, statusCode: 200, user: existingUser });
              return;
          } else {
              User.filter({ email: req.body.email }).then((existingEmailUser) => {
                  if (existingEmailUser && existingEmailUser[0]) {
                      response.json({ msg: `There is already an account using this email address.`, statusCode: 400, user: user });
                      return;
                  } else {
                      const user = new User({
                          email: req.body.email,
                          isConfirmed: true,
                          isActive: true,
                          google: req.body.googleId,
                          tokens: [{ kind: 'google', accessToken: req.body.accessToken }],
                          profile: {
                              firstName: req.body.firstName,
                              lastName: req.body.lastName,
                              gender: req.body.gender,
                              picture: req.body.picture,
                              updatedAt: new Date(),
                              createdAt: new Date(),
                          }
                      });
                      user.save((err) => {
                          response.json({ msg: `Google account has been updated.`, statusCode: 200, user: user });
                          return;
                      });
                  }
              });
          }
      });
  });



userRouter
  .route('/signup')
  .post(function (req, response) {
      if (!req.body.email || !req.body.password || !req.body.userName || !req.body.firstName || !req.body.lastName) {
          response.json({ msg: 'missing a parameter', statusCode: 400, user: null });
          return;
      }

      Role.filter({ 'name': "Landlord" }).then((roles) => {
          var role = roles[0];
          if (!role) {
              response.json({ msg: 'Role not found with role name: Landlord', statusCode: 400 });
              return;
          }
          else {
              const user = new User({
                  email: req.body.email,
                  password: req.body.password,
                  userName: req.body.userName,
                  roles: [{ roleId: role.id, roleName: role.name }],
                  confirmEmailtoken: req.body.confirmEmailtoken,
                  isConfirmed: false,
                  profile:
                  {
                      title: req.body.title,
                      firstName: req.body.firstName,
                      lastName: req.body.lastName,
                      gender: req.body.gender,
                      dob: req.body.dob,
                      contactNum: req.body.contactNum,
                      location: req.body.location
                  }
              });
              User.filter({ 'userName': req.body.userName }).then((user1s) => {
                  var user1 = user1s[0];
                  if (user1) {
                      response.json({ msg: 'User already exist with this user name ' + req.body.userName, statusCode: 400, user: null });
                      return;
                  }
                  User.filter({ 'email': req.body.email }).then((existingUser) => {
                      if (existingUser && existingUser[0]) {
                          response.json({ msg: 'Account with that email address already exists.', statusCode: 400, user: null });
                          return;

                      }
                      user.save();
                      console.log('hash pasd3:    ' + user.password)
                      // send email
                      var template = new EmailTemplate(path.join(templatesDir, 'signup'));
                      var locals = {
                          firstName: user.profile.firstName,
                          lastName: user.profile.lastName,
                          host: process.env.HOSTNAME,
                          userName: user.userName,
                          confirmEmailtoken: user.confirmEmailtoken
                      };

                      template.render(locals, function (err, results) {
                          if (err) {
                              return console.error(err);
                          }

                          var mailData = {
                              from: process.env.FROMEMAIL, // sender address
                              to: user.email,
                              bcc: 'testermail4u@gmail.com',
                              subject: results.subject,
                              html: results.html
                          };
                          const smtpProtocol = smtp.smtpTransport;
                          smtpProtocol.sendMail(mailData, function (err, info) {
                              if (err) {
                                  response.json({ msg: err, statusCode: 500, user: user });
                                  return;
                              }
                              response.json({ msg: 'An account activation link has been sent to your email id. Please click on activation link to activate your account.', statusCode: 200, user: user });
                              return;
                          });
                      });
                  });
              });
          }
      });
  });


userRouter
  .route('/forgot')
  .post(function (req, response) {
      if (!req.body.email) {
          response.json({ msg: 'missing a parameter', statusCode: 400 });
          return;
      }
      const createRandomToken = crypto.randomBytesAsync(16).then(buf => buf.toString('hex'));

      const setRandomToken = token =>
          User.filter({ email: req.body.email })
            .then((users) => {
                var user = users[0];
                if (!user) {
                    response.json({ msg: 'Account with that email address does not exist.', statusCode: 400 });
                    return;
                } else {
                    if (user.google) {
                        response.json({ msg: 'You cannot change the password of this email address as it is registered with Google.', statusCode: 400 });
                        return;
                    }
                    else {
                        user.passwordResetToken = token;
                        user.passwordResetExpires = (Date.now() + 3600000).toString(); // 1 hour
                        user = user.save();
                    }
                }
                return user;
            });

      const sendForgotPasswordEmail = (user) => {
          if (!user) { return; }
          if (user.google) { return; }
          const token = user.passwordResetToken;

          var template = new EmailTemplate(path.join(templatesDir, 'forgotPassword'));
          var locals = {
              email: req.query.email,
              firstName: user.profile.firstName,
              lastName: user.profile.lastName,
              host: process.env.HOSTNAME,
              userName: user.userName,
              passwordResetToken: user.passwordResetToken
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
              return smtpProtocol.sendMail(mailData)
                .then(() => {
                });
          });
      };


      createRandomToken
        .then(setRandomToken)
        .then(sendForgotPasswordEmail)
        .then(() => {
            if (!response.finished) {
                response.json({ msg: 'An e-mail has been sent to ' + req.body.email + ' with further instructions.', statusCode: 200 });
                return;
            }
        })
        .catch(err => {
            if (err) {
                response.json({ msg: err, statusCode: 400 });
                return;
            }
        })
  });


userRouter
  .route('/reset')
  .get(function (req, response) {
      if (!req.query.token) {
          response.json({ msg: 'missing a parameter', statusCode: 400 });
          return;
      }
      User
          .filter({ passwordResetToken: req.query.token })
          .where('passwordResetExpires').gt(Date.now())
          .exec((err, user) => {
              if (err) {
                  response.json({ msg: err, statusCode: 400 });
                  return;
              }
              if (!user) {
                  response.json({ msg: 'Password reset token is invalid or has expired.', statusCode: 400 });
                  return;
              }
              response.json({ msg: 'Success', statusCode: 200 });
              return;
          });
  });

userRouter
  .route('/reset')
  .post(function (req, response) {
      if (!req.body.password || !req.query.token) {
          response.json({ msg: 'missing a parameter', statusCode: 400 });
          return;
      }
      const resetPassword = () =>
          User
            .filter({ passwordResetToken: req.query.token })
           .then((users) => {
               var user = users[0];
               if (!user) {
                   response.json({ msg: 'Password reset token is invalid or has expired.', statusCode: 400 });
                   return;
               }
               user.password = req.body.password;
               user.passwordResetToken = undefined;
               user.passwordResetExpires = undefined;
               user.isReset = true;
               return user.save().then(() => new Promise((resolve, reject) => {
                   resolve(user);
               }));
           });


      resetPassword()
        .then(() => {
            if (!response.finished) {
                response.json({ msg: 'Success! Your password has been changed.', statusCode: 200 });
                return;
            }
        })
        .catch(err => {
            if (err) {
                response.json({ msg: err, statusCode: 400 });
                return;
            }
        });
  });

userRouter
  .route('/confirmEmail')
  .post(function (req, response) {
      User.filter({ 'userName': req.body.userName, 'confirmEmailtoken': req.body.confirmToken, 'isConfirmed': false }).then((users) => {
          var user = users[0];
          if (!user) {
              response.json({ msg: 'Success', statusCode: 200 });
              return;
          }
          else {
              user.isConfirmed = true;
              user.isActive = true;
              user.save((err) => {
                  response.json({ msg: 'Your email is confirmed. You can login now.', statusCode: 200 });
                  return;
              });

          }
      });
  });

module.exports = userRouter;