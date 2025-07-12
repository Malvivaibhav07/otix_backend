const dotenv = require('dotenv');
dotenv.config();
const configvar = require('../../config/configvar.json');
const common = require('../../utils/common');
const allLang = require('../../languages/allLang');

module.exports.addCustomer = async function (req) {
    const lang = common.getLang(req);

    try {
        const bodyData = req.body;
        let validationErrors = [];

        const requiredFields = [
            "cust_code", "cust_name", "comany_name", "GST_no",
            "cust_email", "cust_phone", "website_url", "address", "city",
            "state", "pincode", "country"
        ];

        requiredFields.forEach((field) => {
            if (!bodyData[field] || bodyData[field].toString().trim() === "") {
                validationErrors.push(`${field} ${allLang[lang].is_required}`);
            }
        });

        if (bodyData.cust_email && !common.isValidEmail(bodyData.cust_email)) {
            validationErrors.push(allLang[lang].email_invalid || "Email is not valid");
        }

        if (bodyData.pincode && isNaN(bodyData.pincode)) {
            validationErrors.push(`pincode ${allLang[lang].must_be_number || "must be a number"}`);
        }

        if (bodyData.cust_phone && !/^[6-9]\d{9}$/.test(bodyData.cust_phone)) {
            validationErrors.push(allLang[lang].phone_invalid || "Invalid phone number");
        }

        if (validationErrors.length > 0) {
            return {
                code: configvar.error_code,
                status: configvar.error_status,
                message: validationErrors.join(", "),
            };
        }

        return {
            code: configvar.success_code || 200,
            status: configvar.success_status || "success",
            message: allLang[lang].success_status || "Validation passed",
        };

    } catch (error) {
        console.error("Error in addCustomer validation:", error);
        return {
            code: configvar.error_code,
            status: configvar.error_status,
            message: allLang[lang].something_went_wrong || "Something went wrong"
        };
    }
};
