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
    }

    const token = accessToken.split(' ')[1]; 

    jwt.verify(token, process.env.APP_ADMIN_ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.json({
                code: 403,
                status: configvar.error_status,
                message: allLang[lang].access_token_not_match
            });
        }

        
        req.admin = decoded;

        console.log('Admin Token validated:', decoded);
        next();
    });
}

module.exports = auth;
