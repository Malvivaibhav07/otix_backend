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
const { customerValidation} = require('../../validations/customer');
const sendMail = require('../../config/sendMail');

module.exports.addCustomer = async function (req, res) {
    const lang = common.getLang(req);

    // Validate input
    const validate = await customerValidation.addCustomer(req);
    if (validate.code !== 200) {
        return res.status(400).json({
            code: validate.code,
            status: validate.status,
            message: validate.message,
        });
    }

    try {
        

        const bodyData = req.body;

        // Check if customer with same email already exists
        const customerExists = await queryService.getDataByConditions("customers", {
            cust_email: bodyData.cust_email
        });

        const customerData = {
            cust_code: bodyData.cust_code,
            cust_name: bodyData.cust_name,
            comany_name: bodyData.comany_name,
            PAN_no: bodyData.PAN_no,
            GST_no: bodyData.GST_no,
            cust_email: bodyData.cust_email,
            cust_phone: bodyData.cust_phone,
            website_url: bodyData.website_url,
            address: bodyData.address,
            city: bodyData.city,
            state: bodyData.state,
            pincode: bodyData.pincode,
            country: bodyData.country,
            updated_at: new Date(),
           
        };

        if (customerExists.length > 0) {
            const existing = customerExists[0];

            if (existing.deleted_at !== null) {
                // Customer was soft-deleted, restore and update
                customerData.deleted_at = null;

                const updated = await queryService.updateData("customers", customerData, {
                    cust_id: existing.cust_id
                });

                return res.status(200).json({
                    code: 200,
                    status: "success",
                    message: allLang[lang].customer_created_success || "Customer created successfully.",
                    data: { cust_id: existing.cust_id }
                });
            } else {
                return res.json({
                    code: configvar.error_code,
                    status: configvar.error_status,
                    message: allLang[lang].email_already_exists || "Customer email already exists.",
                });
            }
        }

        // Insert new customer
        

        const resultData = await queryService.insertData("customers", customerData);
        if (!resultData) {
            return res.status(500).json({
                code: 500,
                status: "error",
                message: allLang[lang].customer_creation_failed || "Failed to create customer.",
            });
        }

        return res.status(200).json({
            code: 200,
            status: "success",
            message: allLang[lang].customer_created_success || "Customer created successfully.",
            data: {
                cust_id: resultData.insertId
            }
        });

    } catch (error) {
        console.error("Error in addCustomer API:", error);
        return res.status(500).json({
            code: 500,
            status: "error",
            message: allLang[lang].something_went_wrong || "Something went wrong. Please try again later.",
        });
    }
};
