const dotenv = require('dotenv');
dotenv.config();
const configvar = require('../../config/configvar');
const common = require('../../utils/common');
const allLang = require('../../languages/allLang');
const { queryService} = require('../../services');
const customerValidation = require('../../validations/admin/customer.validation');
const productValidation = require('../../validations/admin/product.validation');

module.exports.addCustomerWithProducts = async function (req, res) {
    const lang = common.getLang(req);
    const bodyData = req.body;

    // Validate customer data
    const validate = await customerValidation.addCustomer(req);
    if (validate.code !== 200) {
        return res.status(400).json({
            code: validate.code,
            status: validate.status,
            message: validate.message,
        });
    }

    try {
        // 1. Check if customer already exists
        const customerExists = await queryService.getDataByConditions("customers", {
            cust_email: bodyData.cust_email
        });

        const customerData = {
            cust_code: bodyData.cust_code,
            cust_name: bodyData.cust_name,
            comany_name: bodyData.comany_name,
            // PAN_no: bodyData.PAN_no,
            GST_no: bodyData.GST_no,
            cust_email: bodyData.cust_email,
            cust_phone: bodyData.cust_phone,
            website_url: bodyData.website_url,
            address: bodyData.address,
            city: bodyData.city,
            state: bodyData.state,
            pincode: bodyData.pincode,
            country: bodyData.country,
            // updated_at: new Date(),
        };

        let cust_id;

        if (customerExists.length > 0) {
            const existing = customerExists[0];
            if (existing.deleted_at !== null) {
                customerData.deleted_at = null;
                await queryService.updateData("customers", customerData, {
                    cust_id: existing.cust_id
                });
                cust_id = existing.cust_id;
            } else {
                return res.json({
                    code: configvar.error_code,
                    status: configvar.error_status,
                    message: allLang[lang].email_already_exists,
                });
            }
        } else {
            const resultData = await queryService.insertData("customers", customerData);
            if (!resultData) {
                return res.status(500).json({
                    code: 500,
                    status: "error",
                    message: allLang[lang].customer_creation_failed,
                });
            }
            cust_id = resultData.insertId;
        }

        // 2. Insert products for the customer
        if (Array.isArray(bodyData.products)) {
            for (let product of bodyData.products) {

                    const productReq = Object.create(req);
                    productReq.body = product;

                     // Validate product
                    const validate = await productValidation.addProduct(productReq);
                    if (validate.code !== 200) {
                        return res.status(400).json({
                            code: validate.code,
                            status: validate.status,
                            message: validate.message,
                        });
                    }


                const productData = {
                    cust_id: cust_id,
                    product_name: product.product_name,
                    product_code: product.product_code,
                    pieces_per_box: product.pieces_per_box,
                    labour_charge: product.labour_charge,
                    box_weight: product.box_weight,
                    temporary_weight: product.temporary_weight,
                    kg_per_dozen: product.kg_per_dozen,
                    carton_weight: product.carton_weight,
                    dozen_weight: product.dozen_weight,
                };
                await queryService.insertData("products", productData);
            }
        }

        return res.status(200).json({
            code: 200,
            status: "success",
            message: allLang[lang].customer_created_success,
            data: { cust_id }
        });

    } catch (error) {
        console.error("Error in addCustomerWithProducts API:", error);
        return res.status(500).json({
            code: 500,
            status: "error",
            message: allLang[lang].something_went_wrong,
        });
    }
};

module.exports.customerList = async function (req, res) {
    const lang = common.getLang(req); 

    try {
        let conditions = 'deleted_at IS NULL'; 
        let users = await queryService.getDataByConditionsOrderBy('customers', conditions, 'cust_id DESC'); 
        if (users.length === 0) {
            return res.json({
                code: configvar.success_code,
                status: configvar.success_status,
                message: allLang[lang].no_customer_found,
                data: []
            });
        }

        // Return the list of users
        return res.json({
            code: configvar.success_code,
            status: configvar.success_status,
            message: allLang[lang].customer_list_fetched,
            data: users
        });
    } catch (error) {
        console.error("Error fetching customer list:", error);
        return res.json({
            code: configvar.error_code,
            status: configvar.error_status,
            message: allLang[lang].something_went_wrong
        });
    }
};

module.exports.customerById = async function (req, res) {
    const lang = common.getLang(req); 
    try {
        const { cust_id } = req.params;
        const user = await queryService.getDataByConditions('customers', { cust_id });
        if (!user.length) {
            return res.status(404).json({ message:  allLang[lang].no_customer_found, });
        }
        
        return res.json({
            code: configvar.success_code,
            status: configvar.success_status,
            message: allLang[lang].customer_fetched,
            data: user
        });
    } catch (error) {
        console.error("Error fetching customer:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
}

