const {User} = require('../../schema/user');
const response = require('../../routes/api/response');
const {generateSignToken} = require('../../utils/utils')
const Joi = require('joi');
const _ = require('lodash')
const bcrypt = require('bcrypt');

//auth : login step
exports.login = async function (req, res) {
    try {
        let body = _.pick(req.body, ['username', 'password']);
        console.log(body)
        const verifyJoiSchema = {
            username: Joi.string().required(),
            password: Joi.string().required(),
        };
        //check input
        let validateResult = Joi.validate(body, verifyJoiSchema);
        if (validateResult.error) {
            return res.status(response.STATUS_UNPROCESSABLE_ENTITY).json(
                response.createResponse(response.FAILED, validateResult.error.message)
            );
        }
        //get user from DB
        let userFound = await User.findOne({username: body.username});

        //if no user found throw error
        if (!userFound) {
            return res.status(response.STATUS_UNAUTHORIZED).json(
                response.createResponse(response.FAILED, "No users were found with this username")
            );
        }

        //compare the hashed password with posted password
        let comparePass = await bcrypt.compare(body.password, userFound.password);
        console.log(userFound.password + "\n" + body.password)
        //if compare fail that mean wrong password
        if (!comparePass) {
            return res.status(response.STATUS_UNAUTHORIZED).json(
                response.createResponse(response.FAILED, "Wrong username/password , please try again")
            );
        }

        //finally check if user is block or not
        if (userFound.blocked) {
            return res.status(response.STATUS_FORBIDDEN).json(
                response.createResponse(response.FAILED, "this phone number is blocked , please contact support")
            );
        }

        //if user passed all of steps , it must generate a new public key and return the user object
        let updateObject = {};

        //generate new token
        updateObject.public_key = await generateSignToken({
            _id: userFound._id,
            date: new Date()
        }, userFound.secret_key);
        updateObject.updated_at = new Date().getTime();

        //update user
        await User.findByIdAndUpdate(userFound._id, updateObject);

        //get updated user
        let finalUser = await User.findById(userFound._id, '_id name username public_key avatar');
        return res.status(response.STATUS_OK).json(
            response.createResponse(response.SUCCESS, `Success`, {user: finalUser})
        );

    } catch (e) {
        console.log(e)
        return res.status(response.STATUS_BAD_REQUEST).json(
            response.createResponse(response.ERROR, 'Something went wrong :' + e)
        );
    }
}

//register new user
exports.register = async function (req, res) {
    try {
        //get data from body 
        let body = _.pick(req.body, ['name', 'username', 'password', 'device_model' , 'fcm_key']);
        const verifyJoiSchema = {
            username: Joi.string().required(),
            name: Joi.string().required(),
            device_model: Joi.string().required(),
            password: Joi.string().required(),
            fcm_key: Joi.string(),
        };
        //check input
        let validateResult = Joi.validate(body, verifyJoiSchema);

        if (validateResult.error) {
            return res.status(response.STATUS_UNPROCESSABLE_ENTITY).json(
                response.createResponse(response.FAILED, validateResult.error.message)
            );
        }

        //get user
        let finalUser = await User.findOne({username: body.username}, '_id name username public_key blocked avatar');

        //check registered user again
        if (finalUser) {
            return res.status(response.STATUS_CONFLICT).json(
                response.createResponse(response.FAILED, "Already registered ", {user: finalUser})
            );
        } else if (!finalUser) {
            let newUser = new User(body);
            await newUser.save();
            let registeredUser = await User.findById(newUser._id, '_id name username public_key blocked avatar');
            return res.status(response.STATUS_OK).json(
                response.createResponse(response.SUCCESS, "registered", {user: registeredUser})
            );
        }

    } catch (e) {
        return res.status(response.STATUS_BAD_REQUEST).json(
            response.createResponse(response.ERROR, e)
        );
    }
}

//find user name
exports.findUserName = async function (req, res) {
    try {
        //get query
        let username = req.params.username;

        //get user that like the query
         const foundUsers = await User.find(
            {
                $or:
                    [
                        {username: {$regex: '.*' + username + '.*'}},
                    ]
            },
            '_id name username avatar last_seen')
        ;
        //get user from DB

        return res.status(response.STATUS_OK).json(
            response.createResponse(response.SUCCESS, `Success`, {users: foundUsers})
        );

    } catch (e) {
        console.log(e)
        return res.status(response.STATUS_BAD_REQUEST).json(
            response.createResponse(response.ERROR, 'Something went wrong :' + e)
        );
    }
}

//update fcm key
exports.updateFcmKey = async function (req, res) {
    try {

        //get fcm key
        let fcm_key = req.params.fcm_key;

        //update it
        let user = await User.findByIdAndUpdate(req.user._id, {fcm_key: fcm_key});

        return res.status(response.STATUS_OK).json(
            response.createResponse(response.SUCCESS, `Success`, {user: user})
        );

    } catch (e) {
        console.log(e)
        return res.status(response.STATUS_BAD_REQUEST).json(
            response.createResponse(response.ERROR, 'Something went wrong :' + e)
        );
    }
}


