var nodemailer = require('nodemailer');
var smtpTransport = require("nodemailer-smtp-transport");
var smtpTransport = nodemailer.createTransport(smtpTransport({
   host: "smtp.postmarkapp.com",
    secureConnection: true,
    port: 587,
    auth: {
        user: "e3b46e20-f719-4d2f-925e-34483c7730ec",
        pass: "e3b46e20-f719-4d2f-925e-34483c7730ec"      
    }
}));

module.exports = {
    'smtpTransport': smtpTransport,  
};