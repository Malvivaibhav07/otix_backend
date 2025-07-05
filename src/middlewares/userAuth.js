const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');
dotenv.config();
const configvar = require('../config/configvar.json');
const common = require('../utils/common');
const allLang = require('../languages/allLang.json');


function auth(req, res, next) {
    const lang = common.getLang(req);

    const accessToken = req.headers['authorization'];
    if (!accessToken) {
        return res.json({
            code: 403,
            status: configvar.error_status,
            message: allLang[lang].access_token_not_match
        });
    } else {
        const token = accessToken.toString().split(' ')[1];
        jwt.verify(token, process.env.APP_USER_ACCESS_TOKEN_SECRET, (err, user) => {
            console.log(token)
            if (err) {
                return res.json({
                    code: 403,
                    status: configvar.error_status,
                    message: allLang[lang].access_token_not_match
                });
            }
            console.log('validate')
            next();
        });
    }
}

module.exports = auth;