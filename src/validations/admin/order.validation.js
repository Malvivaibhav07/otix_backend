const dotenv = require('dotenv');
dotenv.config();

const configvar = require('../../config/configvar.json');
const common = require('../../utils/common');
const allLang = require('../../languages/allLang');

module.exports.validateSalesOrder = async function (req) {
  const body = req.body;
  let errors = [];

  
  if (!body.invoice_no) {
    errors.push("Invoice number is required");
  }

  // return
  if (errors.length > 0) {
    return {
      code: 400,
      status: "error",
      message: errors.join(", ")
    };
  }

  return { code: 200, status: "success" };
};

module.exports.validateEditSalesInvoice = async function (req) {
  const body = req.body;

 

  if (!body.cust_id) {
    return {
      code: 400,
      status: "error",
      message: "Customer ID is required.",
    };
  }

  if (!body.invoice_no || !body.invoice_date) {
    return {
      code: 400,
      status: "error",
      message: "Invoice number and date are required.",
    };
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return {
      code: 400,
      status: "error",
      message: "At least one item must be present in the sales order.",
    };
  }

  for (let item of body.items) {
    if (!item.product_id || !item.quantity || !item.rate) {
      return {
        code: 400,
        status: "error",
        message: "Each item must have product_id, quantity, and rate.",
      };
    }
  }

  return {
    code: 200,
    status: "success",
    message: "Validation passed.",
  };
};
