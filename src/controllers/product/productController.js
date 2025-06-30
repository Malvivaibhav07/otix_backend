const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const saltRounds = 12;
const { v4: uuidv4 } = require('uuid');
const { exec } = require('child_process');
const dotenv = require('dotenv');
dotenv.config();
const configvar = require('../../config/configvar');
const common = require('../../utils/common');
const allLang = require('../../languages/allLang');
const { queryService} = require('../../services');
const { productValidation} = require('../../validations/product');
const sendMail = require('../../config/sendMail');

module.exports.addProduct = async function (req, res) {
    const lang = common.getLang(req);
    console.log(req.body)

    // Validate the input data
    const validate = await productValidation.addProduct(req);
    if (validate.code !== 200) {
        return res.status(400).json({
            code: validate.code,
            status: validate.status,
            message: validate.message,
        });
    }

    try {
       
        // Decrypt the request payload
        const bodyData = req.body;

        // Check if product with same code already exists (example logic, you can change condition)
        const productExists = await queryService.getDataByConditions("products", {
            product_code: bodyData.product_code
        });

        if (productExists.length > 0 && productExists[0].deleted_at === null) {
            return res.json({
                code: configvar.error_code,
                status: configvar.error_status,
                message: allLang[lang].product_already_exists || "Product with this code already exists.",
            });
        }

        // Construct the insert data
        const insertData = {
            product_name: bodyData.product_name,
            product_code: bodyData.product_code,
            pieces_per_box: bodyData.pieces_per_box,
            labour_charge: bodyData.labour_charge,
            box_weight: bodyData.box_weight,
            temporary_weight: bodyData.temporary_weight,
            kg_per_dozen: bodyData.kg_per_dozen,
            carton_weight: bodyData.carton_weight,
            dozen_weight: bodyData.dozen_weight,
            created_at: new Date(),
            updated_at: new Date(),
                       
        };

        const resultData = await queryService.insertData("products", insertData);
        if (!resultData) {
            return res.status(500).json({
                code: 500,
                status: configvar.error_status,
                message: allLang[lang].product_creation_failed || "Failed to create product.",
            });
        }

        return res.status(200).json({
            code: 200,
            status: "success",
            message: allLang[lang].product_created_success || "Product created successfully.",
            data: {
                product_id: resultData.insertId
            }
        });

    } catch (error) {
        console.error("Error in addProduct API:", error);
        return res.status(500).json({
            code: 500,
            status:configvar.error_status,
            message: allLang[lang].something_went_wrong || "Something went wrong. Please try again later.",
        });
    }
};

