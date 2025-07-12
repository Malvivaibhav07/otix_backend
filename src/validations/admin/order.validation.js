const dotenv = require('dotenv');
dotenv.config();

const configvar = require('../../config/configvar.json');
const common = require('../../utils/common');
const allLang = require('../../languages/allLang');

module.exports.validateSalesOrder = async function (req) {
  const body = req.body;
  let errors = [];

  // same logic as above...
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
