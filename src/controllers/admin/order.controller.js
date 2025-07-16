const dotenv = require('dotenv');
dotenv.config();
const configvar = require('../../config/configvar');
const common = require('../../utils/common');
const allLang = require('../../languages/allLang');
const { queryService} = require('../../services');
const orderValidation = require('../../validations/admin/order.validation')
// const pdfService = require('../services/pdfService'); //for PDF generation

module.exports.createSalesOrder = async function (req, res) {
  const lang = common.getLang(req);
  const body = req.body;

  const validate = await orderValidation.validateSalesOrder(req);
    if (validate.code !== 200) {
    return res.status(400).json(validate);
    }

  try {
    if (!body.items || body.items.length === 0) {
      return res.status(400).json({
        code: 400,
        status: "error",
        message: "At least one item is required to create a sales order."
      });
    }

    // Insert Sales Order
    const orderData = {
      cust_id: body.cust_id,
      bill_type: body.bill_type,
      invoice_no: body.invoice_no,
      invoice_date: body.invoice_date,
      delivery_date: body.delivery_date,
      payment_terms: body.payment_terms,
      terms_conditions: body.terms_conditions,
      gst_option: body.gst_option,
      
    };

    const orderResult = await queryService.insertData('sales_orders', orderData);
    const order_id = orderResult.insertId;

    let totalAmount = 0;
    let totalGst = 0;

    // Loop through items and insert into sales_order_items
    for (let item of body.items) {
      const amount = item.quantity * item.rate;
      f_id = item.f_id;

      // Get finishing charge from finishing table
      let conditions = {f_id};
      const finishData = await queryService.getDataByConditions('finishing', conditions );
        const finishing_charge = finishData && finishData.length > 0
        ? parseFloat(finishData[0].charge || 0)
        : 0;

      const gst_amount = body.gst_option == 'with_gst'
        ? (amount * item.gst_percent) / 100
        : 0;

      const final_amount = amount + gst_amount + finishing_charge;
      console.log('FA',final_amount)

      totalAmount += amount;
      totalGst += gst_amount;

      const itemData = {
        order_id,
        product_id: item.product_id,
        product_description: item.product_description,
        hsn_code: item.hsn_code,
        quantity: item.quantity,
        unit: item.unit,
        rate: item.rate,
        amount,
        gst_percent: item.gst_percent,
        gst_amount,
        finishing_id: item.finishing_id,
        final_amount,
      };

      await queryService.insertData("sales_order_items", itemData);
    }

    const grandTotal = totalAmount + totalGst;

    // Update sales_orders with totals
    await queryService.updateData(
      "sales_orders",
      {
        total_amount: totalAmount,
        gst_amount: totalGst,
        grand_total: grandTotal,
      },
      { order_id }
    );

    // Generate PDF (optional)
    // const pdfBuffer = await pdfService.generateSalesOrderPDF(order_id); // Optional
    // const pdfBase64 = pdfBuffer?.toString("base64");

    return res.status(200).json({
      code: 200,
      status: "success",
      message: "Sales order created successfully.",
      data: {
        order_id,
        // pdf_base64: pdfBase64 // or download link if saved on disk
      }
    });
  } catch (error) {
    console.error("Error creating sales order:", error);
    return res.status(500).json({
      code: 500,
      status: "error",
      message: "Failed to create sales order. Please try again."
    });
  }
};

module.exports.editSalesInvoice = async function (req, res) {
  const lang = common.getLang(req);
  const body = req.body;

  const validate = await orderValidation.validateEditSalesInvoice(req);
  if (validate.code !== 200) {
    return res.status(400).json(validate);
  }

  try {
    const order_id = req.params.order_id;
     if (!order_id) {
    return {
      code: 400,
      status: "error",
      message: "Missing order_id for updating the sales order.",
    };
  }

    if (!body.items || body.items.length === 0) {
      return res.status(400).json({
        code: 400,
        status: "error",
        message: "At least one item is required to update the sales order.",
      });
    }

 // ✅ Prevent duplicate HSN codes in request body
    const seenHsn = new Set();
    for (let item of body.items) {
      if (seenHsn.has(item.hsn_code)) {
        return res.status(400).json({
          code: 400,
          status: "error",
          message: `Duplicate HSN code found in request: ${item.hsn_code}`,
        });
      }
      seenHsn.add(item.hsn_code);
    }

    // ✅ Update the main sales order
    const orderData = {
      cust_id: body.cust_id,
      bill_type: body.bill_type,
      invoice_no: body.invoice_no,
      invoice_date: body.invoice_date,
      delivery_date: body.delivery_date,
      payment_terms: body.payment_terms,
      terms_conditions: body.terms_conditions,
      gst_option: body.gst_option,
      updated_at: new Date(),
    };

    await queryService.updateData("sales_orders", orderData, { order_id });

    let totalAmount = 0;
    let totalGst = 0;

    // ✅ Add new items only if HSN not already present in DB
    for (let item of body.items) {
      const hsn_code = item.hsn_code;

      // Check if item already exists for this order by HSN code
      const existing = await queryService.getDataByConditions("sales_order_items", {
        order_id,
        hsn_code,
      });

      if (existing && existing.length > 0) {
        console.warn(`Item with HSN ${hsn_code} already exists for order ${order_id}. Skipping.`);
        continue;
      }

      const amount = item.quantity * item.rate;
      const f_id = item.f_id;

      const finishData = await queryService.getDataByConditions("finishing", { f_id });
      const finishing_charge = finishData?.[0]?.charge
        ? parseFloat(finishData[0].charge)
        : 0;

      const gst_amount = body.gst_option === "with_gst"
        ? (amount * item.gst_percent) / 100
        : 0;

      const final_amount = amount + gst_amount + finishing_charge;

      totalAmount += amount;
      totalGst += gst_amount;

      const itemData = {
        order_id,
        product_id: item.product_id,
        product_description: item.product_description,
        hsn_code: item.hsn_code,
        quantity: item.quantity,
        unit: item.unit,
        rate: item.rate,
        amount,
        gst_percent: item.gst_percent,
        gst_amount,
        finishing_id: item.finishing_id,
        final_amount,
      };

      await queryService.insertData("sales_order_items", itemData);
    }

    const grandTotal = totalAmount + totalGst;

    // ✅ Update totals in order
    await queryService.updateData(
      "sales_orders",
      {
        total_amount: totalAmount,
        gst_amount: totalGst,
        grand_total: grandTotal,
      },
      { order_id }
    );

    return res.status(200).json({
      code: 200,
      status: "success",
      message: "Sales Invoice updated successfully.",
      data: {
        order_id,
      },
    });
  } catch (error) {
    console.error("Error updating sales invoice:", error);
    return res.status(500).json({
      code: 500,
      status: "error",
      message: "Failed to update sales Invoice. Please try again.",
    });
  }
};

module.exports.deleteSalesInvoice = async function (req, res) {
  const lang = common.getLang(req);
  const order_id = req.params.order_id;
  console.log(order_id)

  if (!order_id) {
    return res.status(400).json({
      code: 400,
      status: "error",
      message: "Missing order_id for deletion.",
    });
  }

  try {
    // Soft delete the sales order
    const deletedAt = new Date();
    await queryService.updateData(
      "sales_orders",
      { deleted_at: deletedAt },
      { order_id }
    );

    // Optional: Soft delete all related items too
    await queryService.updateData(
      "sales_order_items",
      { deleted_at: deletedAt },
      { order_id }
    );

    return res.status(200).json({
      code: 200,
      status: "success",
      message: "Sales order deleted successfully.",
      data: { order_id },
    });
  } catch (error) {
    console.error("Error deleting sales order:", error);
    return res.status(500).json({
      code: 500,
      status: "error",
      message: "Failed to  delete sales order. Please try again.",
    });
  }
};

module.exports.salesInvoiceList = async function (req, res) {
    const lang = common.getLang(req); 

    try {
        
        let conditions = 'deleted_at IS NULL'; 
        let invoices = await queryService.getDataByConditionsOrderBy('sales_orders', conditions, 'order_id DESC'); 
        if (invoices.length === 0) {
            return res.json({
                code: configvar.success_code,
                status: configvar.success_status,
                message: 'Invoices not found',
                data: []
            });
        }

        
        return res.json({
            code: configvar.success_code,
            status: configvar.success_status,
            message: 'Invoice list fetched successfully',
            data: invoices
        });
    } catch (error) {
        console.error("Error fetching invoice list:", error);
        return res.json({
            code: configvar.error_code,
            status: configvar.error_status,
            message: allLang[lang].something_went_wrong
        });
    }
};