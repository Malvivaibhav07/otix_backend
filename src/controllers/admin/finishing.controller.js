const dotenv = require('dotenv');
dotenv.config();
const configvar = require('../../config/configvar');
const common = require('../../utils/common');
const allLang = require('../../languages/allLang');
const { queryService} = require('../../services');
const finishingValidation = require('../../validations/admin/finishing.validation');

module.exports.addFinishing = async function (req, res) {
    const lang = common.getLang(req);

    // Validate the input data
    const validate = await finishingValidation.addFinishing(req);
    if (validate.code !== 200) {
        return res.status(400).json({
            code: validate.code,
            status: validate.status,
            message: validate.message,
        });
    }

    try {
        const bodyData = req.body;

        // Check if finishing with the same name already exists
        const finishingExists = await queryService.getDataByConditions("finishing", {
            finishing_name: bodyData.finishing_name
        });

        if (finishingExists.length > 0) {
            const existing = finishingExists[0];

            if (existing.deleted_at === null) {
                // Already exists and is active
                return res.json({
                    code: configvar.error_code,
                    status: configvar.error_status,
                    message: allLang[lang].finishing_already_exists,
                });
            } else {
                // Soft-deleted: update it (restore)
                const updateData = {
                    finishing_name: bodyData.finishing_name,
                    deleted_at: null // Restore
                };

                const condition = { f_id: existing.f_id };
                const updated = await queryService.updateData("finishing", updateData, condition);

                if (updated) {
                    return res.status(200).json({
                        code: 200,
                        status: "success",
                        message: allLang[lang].finishing_created_success,
                        data: { f_id: existing.f_id }
                    });
                } else {
                    return res.status(500).json({
                        code: 500,
                        status: configvar.error_status,
                        message: allLang[lang].finishing_creation_failed,
                    });
                }
            }
        }

        // No match: insert new
        const insertData = {
            finishing_name: bodyData.finishing_name,
        };

        const resultData = await queryService.insertData("finishing", insertData);
        if (!resultData) {
            return res.status(500).json({
                code: 500,
                status: configvar.error_status,
                message: allLang[lang].finishing_creation_failed || "Failed to create finishing.",
            });
        }

        return res.status(200).json({
            code: 200,
            status: "success",
            message: allLang[lang].finishing_created_success
            
        });

    } catch (error) {
        console.error("Error in addFinishing API:", error);
        return res.status(500).json({
            code: 500,
            status: configvar.error_status,
            message: allLang[lang].something_went_wrong,
        });
    }
};


module.exports.editFinishing = async function (req, res) {
    const lang = common.getLang(req);
    console.log(req.body);

    // Validate input
    const validate = await finishingValidation.editFinishing(req);
    if (validate.code !== 200) {
        return res.status(400).json({
            code: validate.code,
            status: validate.status,
            message: validate.message,
        });
    }

    try {
        const bodyData = req.body;
        const f_id = req.params.f_id;
        if (!f_id) {
            return res.json({
                code: configvar.error_code,
                status: configvar.error_status,
                message: allLang[lang].finishing_id_required
            });
        }
        let conditions = { f_id}; 

        // Check if the new name already exists in another record
        const existing = await queryService.getDataByConditions("finishing", conditions);

        if (existing.length === 0) {
            return res.json({
                code: configvar.error_code,
                status: configvar.error_status,
                message: allLang[lang].finishing_not_found
            });
        }

        const updateData = {
            finishing_name: bodyData.finishing_name,
        };

        

        const result = await queryService.updateData("finishing", updateData, conditions);

        if (!result) {
            return res.status(500).json({
                code: 500,
                status: configvar.error_status,
                message: allLang[lang].finishing_update_failed,
            });
        }

        return res.status(200).json({
            code: 200,
            status: "success",
            message: allLang[lang].finishing_updated_success,
            data: { f_id }
        });

    } catch (error) {
        console.error("Error in editFinishing API:", error);
        return res.status(500).json({
            code: 500,
            status: configvar.error_status,
            message: allLang[lang].something_went_wrong || "Something went wrong. Please try again later.",
        });
    }
};


module.exports.deleteFinishing = async function (req, res) {
    const lang = common.getLang(req);

    try {
        const f_id = req.params.f_id;

        if (!f_id) {
            return res.json({
                code: configvar.error_code,
                status: configvar.error_status,
                message: allLang[lang].finishing_id_required
            });
        }

        let conditions = { f_id: f_id };
        let resultData = await queryService.getDataByConditions('finishing', conditions);

        if (resultData.length === 0) {
            return res.json({
                code: configvar.error_code,
                status: configvar.error_status,
                message: allLang[lang].finishing_not_found
            });
        }

        const newData = {
             deleted_at: new Date() ,
        };

        let updateData = await queryService.updateData('finishing', newData, conditions);

        if (updateData.affectedRows !== 0) {
            return res.json({
                code: configvar.success_code,
                status: configvar.success_status,
                message: allLang[lang].finishing_deleted_successfully
            });
        } else {
            return res.json({
                code: configvar.error_code,
                status: configvar.error_status,
                message: allLang[lang].something_went_wrong
            });
        }
    } catch (error) {
        console.error("Error:", error);
        return res.json({
            code: configvar.error_code,
            status: configvar.error_status,
            message: allLang[lang].something_went_wrong
        });
    }
};