const dotenv = require('dotenv');
dotenv.config();

const configvar = require('../../config/configvar.json');
const common = require('../../utils/common');
const allLang = require('../../languages/allLang.json');

module.exports.userAdd = async function (req) {
    const lang = common.getLang(req);

    try {
        const bodyData = req.body;
        console.log("Incoming Data:", bodyData);

        let validationErrors = [];

        // Required fields for user addition
        const requiredFields = ["first_name", "last_name", "email", "role"];

        // Validate required fields
        requiredFields.forEach((fieldName) => {
            if (!bodyData[fieldName] || bodyData[fieldName].trim() === "") {
                validationErrors.push(`${fieldName} ${allLang[lang].is_required}`);
            }
        });

        //Check for validation errors
        if (validationErrors.length > 0) {
            return {
                code: configvar.error_code,
                status: configvar.error_status,
                message: validationErrors.join(", "),
            };
        }
         if (!common.isValidEmail(bodyData.email)) {
                return {
                    code: configvar.error_code,
                    status: configvar.error_status,
                    message: allLang[lang].email_invalid,
        
                };
            }
           
        return {
            code: configvar.success_code || 200,
            status: configvar.success_status || "success",
            message: allLang[lang].success_status,
        };
       
       
      
    } catch (error) {
        // Handle any errors during the process
        console.error("Error in userAdd:", error);

        return {
            code: configvar.error_code,
            status: configvar.error_status,
            message: allLang[lang].something_went_wrong 
        };
    }
};