const dotenv = require('dotenv');
dotenv.config();

const configvar = require('../../config/configvar.json');
const common = require('../../utils/common');
const allLang = require('../../languages/allLang');

module.exports.addProduct = async function (req) {
    const lang = common.getLang(req);

    try {
        const bodyData = req.body;
        console.log("Incoming Product Data:", bodyData);

        let validationErrors = [];

        // Required fields (some are strings, some numbers)
        const requiredFields = [
            "product_name",
            "product_code",
            "pieces_per_box",
            "labour_charge",
            "box_weight",
            "temporary_weight",
            "kg_per_dozen",
            "carton_weight",
            "dozen_weight"
        ];

        // Validate required fields (string or number)
        requiredFields.forEach((fieldName) => {
            const value = bodyData[fieldName];

            const isMissing =
                value === undefined ||
                value === null ||
                (typeof value === 'string' && value.trim() === '');

            if (isMissing) {
                validationErrors.push(`${fieldName} ${allLang[lang].is_required}`);
            }
        });

        // Validate numeric fields
        const numberFields = [
            "pieces_per_box",
            "labour_charge",
            "box_weight",
            "temporary_weight",
            "kg_per_dozen",
            "carton_weight",
            "dozen_weight"
        ];

        numberFields.forEach((field) => {
            const value = bodyData[field];
            if (
                value !== undefined &&
                value !== null &&
                value !== '' &&
                isNaN(Number(value))
            ) {
                validationErrors.push(`${field} ${allLang[lang].must_be_number || "must be a number"}`);
            }
        });

        // Return errors if any
        if (validationErrors.length > 0) {
            return {
                code: configvar.error_code,
                status: configvar.error_status,
                message: validationErrors.join(", "),
            };
        }

        // Success
        return {
            code: configvar.success_code || 200,
            status: configvar.success_status || "success",
            message: allLang[lang].success_status,
        };

    } catch (error) {
        console.error("Error in addProduct validation:", error);
        return {
            code: configvar.error_code,
            status: configvar.error_status,
            message: allLang[lang].something_went_wrong
        };
    }
};
