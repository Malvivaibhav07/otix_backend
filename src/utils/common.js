const CryptoJS = require("crypto-js");
const dotenv = require('dotenv');
dotenv.config();
const con = require('../config/db');
const configvar = require('../config/configvar');
const prefix = configvar['dbprefix'];


module.exports.getLang = function (req) {
    const langArr = ["eng", "sp"];
    let lang = "eng";
    if (req.headers.lang && langArr.includes(req.headers.lang))
    lang = req.headers.lang;

    return lang;
};

module.exports.isValidEmail = function (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
// Example JS regex check
module.exports.isValidPin = function (pin) {
    const pinRegeX = /^\d{4}$/;
    return pinRegeX.test(pin);
}


module.exports.getCurrentDateAndTime = function (dateOnly = false, dateSymbol = "-") {
    let date = new Date();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();
    let strTime = hours + ':' + minutes + ':' + seconds;
    let month = date.getMonth() + 1;
    if(dateOnly)
    return date.getFullYear() + dateSymbol + month + dateSymbol + date.getDate();
    else
    return date.getFullYear() + dateSymbol + month + dateSymbol + date.getDate() + " " + strTime;
};

module.exports.getIP = function (req) {
    return (req.headers['x-forwarded-for'] || '').split(':').pop() || (req.connection.remoteAddress).split(':').pop();
};

module.exports.generatePassword = function (len) {
    let length = len;
        charset = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ123456789!#&?@",
        retVal = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

module.exports.generateReferralCode = function (len) {
    let length = len;
        charset = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ123456789",
        retVal = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

module.exports.excelDateToJSDate = function (excelDate) {
    let date = new Date(Math.round((excelDate - (25567 + 2)) * 86400 * 1000));
    let converted_date = date.toISOString().split('T')[0];
    return converted_date;
}

module.exports.getCurrentDay = function () {
    let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let date = new Date();
    let dayName = days[date.getDay()];
    return dayName;
}