var express = require('express');
//var mongoose = require('mongoose');
var rethinkdb = require('rethinkdbdash')({
  db:'PropertyRental',
	port: 28015,
	host: 'ec2-13-126-155-88.ap-south-1.compute.amazonaws.com'
});
var bodyParser = require('body-parser');
var cors                  = require('cors');
var userRouter = require('./routers/users');
var locationRouter = require('./routers/locations');
 var propertyTypeRouter = require('./routers/propertyTypes');
 var propertyRouter = require('./routers/properties');
 var mortgageProviderRouter = require('./routers/mortgageProviders');
 var utilityRouter = require('./routers/utilities');
 var issuesummaryRouter = require('./routers/issueSummaries');
 var scheduleRouter=require('./routers/schedules');
 var tenantsRouter=require('./routers/tenants');
 var paymentsRouter=require('./routers/payments');

const dotenv = require('dotenv');
var app = express();

dotenv.load({ path: '.env.example' });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(cors());
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.use('/api', userRouter);
app.use('/api', locationRouter);
 app.use('/api', propertyTypeRouter);
 app.use('/api', mortgageProviderRouter);
 app.use('/api', propertyRouter);
 app.use('/api', utilityRouter);
 app.use('/api', issuesummaryRouter);
 app.use('/api', scheduleRouter);
app.use('/api', tenantsRouter);
app.use('/api', paymentsRouter);

app.set('port', process.env.PORT || 8081);
app.listen(app.get('port'), function () {
  console.log('Listening on port ' + app.get('port'));
});

