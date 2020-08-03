const {mongoose} = require('./../database/mongoose');
let Schema = mongoose.Schema;
const bcrypt = require('bcrypt')
const {generateSignToken, genUuid} = require('./../utils/utils');


// create a schema
let userSchema = new Schema({
    //name of the user
    name: {type: String, trim: true, minlength: 3, maxlength: 30},
    // unique name
    username: {type: String, minlength: 5, maxlength: 30, unique: true , trim:true},
    //public key for authentication and interaction between app and server
    public_key: {type: String, unique: true},
    // a key for encrypt and generate public key
    secret_key: {type: String, trim: true},
    // user fire base token in app
    fcm_key: {type: String, default: null, trim: true},
    //password for login
    password: {type: String, trim: true},
    // check if user blocked or not
    blocked: {type: Boolean, default: false},
    //mobile device name of user
    device_model: {type: String, trim: true, default: null},
    //user profile picture
    avatar: {type: String, default: '/public/avatars/131221g2lmo1lf.jpg', trim: true},
    //get the last time that user was online
    last_seen: {type: Number, required: true, default: new Date().getTime()},
    // timestamp
    updated_at: {type: Number, required: true, default: new Date().getTime()},
    // timestamp
    created_at: {type: Number, required: true, default: new Date().getTime()},
});

userSchema.pre('save', async function (next) {
    console.log(this)
    //generate salt for hashing password
    let passSalt = await bcrypt.genSaltSync(10);
    //hashing password by salt
    this.password = bcrypt.hashSync(this.password, passSalt);
    //create custom object and encrypt for public key , i prefer to put user id in it
    let tokenObject = {_id: this._id, date: new Date()};
    //create secret key , u can access this function in Utils.js
    this.secret_key = await genUuid();
    // use the secret key for encrypt the custom token and generate public key , u can access this function in Utils.js
    this.public_key = await generateSignToken(tokenObject, this.secret_key);
    //timestamp
    this.updated_at = new Date().getTime();
    this.last_seen = new Date().getTime();
    this.created_at = new Date().getTime();
    next();
});

// the schema is useless so far
// we need to create a model using it
let User = mongoose.model('User', userSchema);

// make this available to our users in our Node applications
module.exports = {User};