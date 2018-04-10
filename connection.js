var rethinkdb = require('thinky')({
  db:'PropertyRental',
	port: 28015,
	host: 'ec2-13-126-155-88.ap-south-1.compute.amazonaws.com'
});
module.exports  = rethinkdb;