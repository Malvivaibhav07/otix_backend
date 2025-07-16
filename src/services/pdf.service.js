// const PDFDocument = require('pdfkit');

// module.exports.buildPdf = async function (dataCallback, endCallback){
//     try{
//      const doc = new PDFDocument();
//      doc.on('data', dataCallback);
//      doc.on('end', endCallback);

//      // Add content to PDF
//         doc.fontSize(18).text('Finishing Report', { align: 'center' });
//         doc.moveDown();
//         doc.fontSize(12).text('Date: ' + new Date().toLocaleString());
//         doc.moveDown();
//         doc.text('Finishing Name: John Doe');
//         doc.text('Email: johndoe@example.com');
//         doc.text('Total Orders: 5');

//         // Finalize PDF
//         doc.end();
// }catch (error) {
//         console.error('PDF generation error:', error);
//         res.status(500).json({
//             code: 500,
//             status: 'error',
//             message: 'Failed to generate PDF'
//         });
//     }
// }



const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const Handlebars = require('handlebars');
// const fpath = require('../templates/full-bill.html') 
// Register the helper
Handlebars.registerHelper('multiply', function (a, b) {
  return a * b;
});

module.exports.generateFullBillPDF = async function (data, res) {
  try {
    // Load and compile the template
    const templatePath = path.join(__dirname, '../templates/full-bill.html');
    const templateHtml = fs.readFileSync(templatePath, 'utf8');
    const compiledTemplate = Handlebars.compile(templateHtml);
    const htmlWithData = compiledTemplate(data); // inject data

    // Launch puppeteer and generate PDF
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setContent(htmlWithData, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });

    await browser.close();

    // Send response
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=full-bill.pdf',
    });
    res.send(pdfBuffer);
  } catch (err) {
    console.error('PDF generation error:', err);
    res.status(500).json({ message: 'PDF generation failed' });
  }
};
module.exports.generateWeightBillPDF = async function (data, res) {
  try {
    // Load and compile the template
    const templatePath = path.join(__dirname, '../templates/weight-bill.html');
    const templateHtml = fs.readFileSync(templatePath, 'utf8');
    const compiledTemplate = Handlebars.compile(templateHtml);
    const htmlWithData = compiledTemplate(data); // inject data

    // Launch puppeteer and generate PDF
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setContent(htmlWithData, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });

    await browser.close();

    // Send response
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=weight-bill.pdf',
    });
    res.send(pdfBuffer);
  } catch (err) {
    console.error('PDF generation error:', err);
    res.status(500).json({ message: 'PDF generation failed' });
  }
};
