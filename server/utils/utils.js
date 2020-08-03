const jwt = require('jsonwebtoken');
const persianDate = require('persian-date');
const crypto = require('crypto');
persianDate.toLocale('en');


let getCurrentDate = () => {
    return new persianDate().format('YYYY-MM-DD HH:mm:ss');
}

let getCurrentMonthName = () => {
    return new persianDate().format('MMMM');
}

let getCurrentDayName = () => {
    return new persianDate().format('dddd');
}
let generateRandomNum = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
};


let metaResponse = (status, result, message) => {
    return {
        code: status,
        result: result,
        message: message
    }
};

let metaError = (status, result, message, type) => {
    return {
        code: status,
        result: result,
        message: message,
        type: type
    }
};

let generateSignToken = async (data, private_key) => {
    return await jwt.sign(data, private_key);
};

let decodeApiKey = (apikey, secret) => {
    return jwt.verify(apikey, secret);
};

let arrayRemove = (arr, value) => {

    return arr.filter(function (ele) {
        return ele._id !== value;
    });

};


function genUuid() {
    return uuidFromBytes(crypto.randomBytes(16));
}

function uuidFromBytes(rnd) {
    rnd[6] = (rnd[6] & 0x0f) | 0x40;
    rnd[8] = (rnd[8] & 0x3f) | 0x80;
    rnd = rnd.toString('hex').match(/(.{8})(.{4})(.{4})(.{4})(.{12})/);
    rnd.shift();
    return rnd.join('-');
}

module.exports = {
    generateRandomNum,
    metaResponse,
    metaError,
    generateSignToken,
    decodeApiKey,
    getCurrentDate,
    arrayRemove,
    getCurrentDayName,
    getCurrentMonthName,
    genUuid
};