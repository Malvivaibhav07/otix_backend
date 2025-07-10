const dotenv = require('dotenv');
dotenv.config();

const configvar = require('../../config/configvar.json');
const common = require('../../utils/common');
const allLang = require('../../languages/allLang');


module.exports.addFinishing = async function (req) {
    const lang = common.getLang(req);
    const bodyData = req.body;

    try {
        let validationErrors = [];

        // Required field
        if (!bodyData.finishing_name || bodyData.finishing_name.trim() === "") {
            validationErrors.push(allLang[lang].finishing_name_required || "Finishing name is required.");
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
            message: allLang[lang].success_status || "Validation successful.",
        };

    } catch (error) {
        console.error("Validation Error in addFinishing:", error);

        return {
            code: configvar.error_code,
            status: configvar.error_status,
            message: allLang[lang].something_went_wrong || "Something went wrong during validation.",
        };
    }
};

module.exports.editFinishing = async function (req) {
    const lang = common.getLang(req);
    const bodyData = req.body;

    try {
        let validationErrors = [];

        if (!bodyData.finishing_name || bodyData.finishing_name.trim() === "") {
            validationErrors.push(allLang[lang].finishing_name_required || "Finishing name is required.");
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
            message: allLang[lang].success_status || "Validation successful.",
        };

    } catch (error) {
        console.error("Validation Error in editFinishing:", error);

        return {
            code: configvar.error_code,
            status: configvar.error_status,
            message: allLang[lang].something_went_wrong || "Something went wrong during validation.",
        };
    }
};
