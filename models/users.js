var thinky = require('../connection');
var type = thinky.type; 

const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');

var userSchema = thinky.createModel("users", {
  email: String,
  userName: String,
  password:String,
  isConfirmed:Boolean,
  confirmEmailtoken:  String,
  passwordResetToken:  String,
  passwordResetExpires :String,
  google:String,
  tokens:Array,
  roles:Array,
  profile:  {
    title: String,
    firstName: String,
    lastName:String,
    contactNum:String,
    gender: String,
    location: String,
    dob: Date,
    createdAt:Date,
updatedAt:Date,
    picture: String
  },
  google:String,
  isActive: Boolean,
  isReset: Boolean,
}, { timestamps: true });


userSchema.pre('save', function save(next) {
  const user = this;
  if(!user.isReset){user.isReset=false;}
  if(user.id && user.isReset==false){
 next();
  }
  else{
  var dd="sdf";
  
  //if (!user.isModified('password')) { return next(); }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return next(err); }
    bcrypt.hash(user.password, salt, null, (err, hash) => {
      if (err) { return next(err); }
      console.log('hash pasd:    '+hash)
      user.password = hash;
      console.log('hash pasd2:    '+user.password)
      next();
    });
  });
  }
});

/**
 * Helper method for validating user's password.
 */
userSchema.define('comparePassword', function comparePassword(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    cb(err, isMatch);
  });
}) ; 

/**
 * Helper method for getting user's gravatar.
 */
userSchema.define('gravatar', function gravatar(size) {
  if (!size) {
    size = 200;
  }
  if (!this.email) {
    return `https://gravatar.com/avatar/?s=${size}&d=retro`;
  }
  const md5 = crypto.createHash('md5').update(this.email).digest('hex');
  return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
});

module.exports = userSchema;