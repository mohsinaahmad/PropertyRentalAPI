var express = require('express');
var fs = require("fs");
var multer = require('multer');
var crypto = require('crypto');
var mime = require("mime");
var s3 = require('s3');
var AWS = require('aws-sdk');
var utilityRouter = express.Router();

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        crypto.pseudoRandomBytes(16, function (err, raw) {
            var last = file.originalname.substring(file.originalname.lastIndexOf(".") + 1, file.originalname.length);

            cb(null, file.originalname);
        });
    }
});

var upload = multer({ storage: storage });

utilityRouter
  .route('/upload')
  .post(upload.single('file'), function (request, response) {
      console.log(request.file);
      var bucketName = process.env.S3BUCKET;
      var accessKeyid = process.env.S3KEY;
      var secretAccesskey = process.env.S3SECRET;
      var region = process.env.S3REGION;
      var file_name = request.file.originalname;
      var extention = file_name.split(".")[1];

      var file_contenttype = "";

      var awsS3Client = new AWS.S3({
          accessKeyId: accessKeyid.trim(),
          secretAccessKey: secretAccesskey.trim(),
          region: region.trim()
      });

      fs.readFile('uploads/' + file_name, function (err, data) {
          if (err) { throw err; }

          var base64data = new Buffer(data, 'binary');
          var filePath = "";
          if (request.file.mimetype.includes("image")) {
              filePath = "images/" + file_name; file_contenttype = "image/" + extention;


          }
          else {
              if (extention == "pdf") {
                  filePath = "docs/" + file_name; file_contenttype = "application/pdf"
              }
              else {
                  filePath = "docs/" + file_name; file_contenttype = "text/plain"
              }
          }
          console.log(filePath);
          awsS3Client.putObject({
              Bucket: bucketName,
              Key: filePath,
              Body: base64data,
              ACL: 'public-read',
              ContentDisposition: "inline; filename=" + file_name,
              ContentType: file_contenttype
          }, function (resp) {
              console.log('Successfully uploaded package.  :' + file_name);
              response.json({ msg: `File uploaded successfully`, statusCode: 200, path: 'https://' + bucketName + '.s3.amazonaws.com/' + filePath });
              return;
          });

      });
  });

module.exports = utilityRouter;