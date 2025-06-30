const dotenv = require('dotenv');
dotenv.config();
const configvar = require('../../config/configvar');
const common = require('../../utils/common');
const allLang = require('../../languages/allLang');

module.exports.login = async function (req) {
    const lang = common.getLang(req);
    
    const bodyData = req.body;
    
    if (!bodyData || bodyData.length == 0) {
                return {
                    code: configvar.error_code,
                    status: configvar.error_status,
                    message: allLang[lang].data_not_found
                };
            }
          
    let validationErrors = [];
    const optionalFields = [];
    Object.entries(bodyData).forEach(([fieldName, fieldValue]) => {
        if (!fieldValue || fieldValue === "") {
            if (!optionalFields.includes(fieldName)) {
                validationErrors.push(`${fieldName} ${allLang[lang].is_required}`);
            }
        }
    });
    if (validationErrors.length > 0) {
        return res.json({
            code: configvar.error_code,
            status: configvar.error_status,
            message: validationErrors.join(", ")
        });
    }
    else if (!common.isValidEmail(bodyData.email)) {
        return res.json({
            code: configvar.error_code,
            status: configvar.error_status,
            message: allLang[lang].email_invalid
        });
    }
    else {
        return {
            code: configvar.success_code,
            status: configvar.success_status,
            message: configvar.success_status
        };
    }
};

module.exports.signup = async function (req) {
    const lang = common.getLang(req);

    const bodyData = req.body;
   
    if (!bodyData || bodyData.length == 0) {
                return {
                    code: configvar.error_code,
                    status: configvar.error_status,
                    message: allLang[lang].data_not_found
                };
            }
    let validationErrors = [];
    const optionalFields = [];
    Object.entries(bodyData).forEach(([fieldName, fieldValue]) => {
        if (!fieldValue || fieldValue === "") {
            if (!optionalFields.includes(fieldName)) {
                validationErrors.push(`${fieldName} ${allLang[lang].is_required}`);
            }
        }
    });
    if (validationErrors.length > 0) {
        return {
            code: configvar.error_code,
            status: configvar.error_status,
            message: validationErrors.join(", ")
        };
    }
    else if (!common.isValidEmail(bodyData.email)) {
        return {
            code: configvar.error_code,
            status: configvar.error_status,
            message: allLang[lang].email_invalid
        };
    }
    
    else if (bodyData.password.toString().length < 8) {
        return {
            code: configvar.error_code,
            status: configvar.error_status,
            message: allLang[lang].password_too_short
        };
    } else if (bodyData.password.toString().length > 20) {
        return {
            code: configvar.error_code,
            status: configvar.error_status,
            message: allLang[lang].password_too_long
        };
    }
    else if (bodyData.password !== bodyData.confirm_password) {
        return {
            code: configvar.error_code,
            status: configvar.error_status,
            message: allLang[lang].both_passwords_same
        };
    }
    else {
        return {
            code: configvar.success_code,
            status: configvar.success_status,
            message: configvar.success_status
        };
    }
};

module.exports.forgotPassword = async function (req) {
    const lang = common.getLang(req);

    const bodyData = req.body;
    if (!bodyData || bodyData.length == 0) {
                return {
                    code: configvar.error_code,
                    status: configvar.error_status,
                    message: allLang[lang].data_not_found
                };
            }
    let validationErrors = [];
    const optionalFields = [];
    Object.entries(bodyData).forEach(([fieldName, fieldValue]) => {
        if (!fieldValue || fieldValue === "") {
            if (!optionalFields.includes(fieldName)) {
                validationErrors.push(`${fieldName} ${allLang[lang].is_required}`);
            }
        }
    });
    if (validationErrors.length > 0) {
        return {
            code: configvar.error_code,
            status: configvar.error_status,
            message: validationErrors.join(", ")
        };
    }
    else if (!common.isValidEmail(bodyData.email)) {
        return {
            code: configvar.error_code,
            status: configvar.error_status,
            message: allLang[lang].email_invalid
        };
    }
    else {
        return {
            code: configvar.success_code,
            status: configvar.success_status,
            message: configvar.success_status
        };
    }
};

module.exports.verifyOtpValidation = async function (req) {
    const lang = common.getLang(req);
    const bodyData = req.body;

    let validationErrors = [];
    const requiredFields = ['email', 'email_otp'];
   

    // Validate required fields
    requiredFields.forEach((field) => {
        if (!bodyData[field] || bodyData[field] === "") {
            validationErrors.push(`${field} ${allLang[lang].is_required}`);
        }
    });

    // Validate the email field
    if (bodyData.email && !common.isValidEmail(bodyData.email)) {
        validationErrors.push(allLang[lang].email_invalid);
    }

    // Validate the OTP field (optional: check OTP length or type)
    if (bodyData.email_otp && isNaN(bodyData.email_otp)) {
        validationErrors.push(allLang[lang].otp_invalid);
    }

    if (validationErrors.length > 0) {
        return {
            code: configvar.error_code,
            status: configvar.error_status,
            message: validationErrors.join(", "),
        };
    }

    // Success response for validation
    return {
        code: configvar.success_code,
        status: configvar.success_status,
        message: configvar.success_message,
    };
};

module.exports.resetPasswordValidation = async function (req) {
    const lang = common.getLang(req);

    const bodyData = req.body;
     let validationErrors = [];
        const optionalFields = [];
        Object.entries(bodyData).forEach(([fieldName, fieldValue]) => {
            if (!fieldValue || fieldValue === "") {
                if (!optionalFields.includes(fieldName)) {
                    validationErrors.push(`${fieldName} ${allLang[lang].is_required}`);
                }
            }
        });

    
    const requiredFields = ['email','newPassword','confirmPassword'];

    // Validate required fields
    requiredFields.forEach((field) => {
        if (!bodyData[field] || bodyData[field] === "") {
            validationErrors.push(`${field} ${allLang[lang].is_required}`);
        }
    });

    // Validate the email field
    if (bodyData.email && !common.isValidEmail(bodyData.email)) {
        validationErrors.push(allLang[lang].email_invalid);
    }

    // Validate the newPassword field (enforce strength requirements)
    if (validationErrors.length > 0) {
        return {
            code: configvar.error_code,
            status: configvar.error_status,
            message: validationErrors.join(", "),
        };
    }
     else if (bodyData.newPassword.toString().length < 8) {
            return {
                code: configvar.error_code,
                status: configvar.error_status,
                message: allLang[lang].password_too_short
            };
        } else if (bodyData.newPassword.toString().length > 20) {
            return {
                code: configvar.error_code,
                status: configvar.error_status,
                message: allLang[lang].password_too_long
            };
        }
        else if (bodyData.newPassword !== bodyData.confirmPassword) {
        return {
            code: configvar.error_code,
            status: configvar.error_status,
            message: allLang[lang].both_passwords_same
        };
    }
    // Success response for validation
    return {
        code: configvar.success_code,
        status: configvar.success_status,
        message: configvar.success_message,
    };
};