const PDFDocument = require('pdfkit');

module.exports.buildPdf = async function (dataCallback, endCallback){
    try{
     const doc = new PDFDocument();
     doc.on('data', dataCallback);
     doc.on('end', endCallback);

     // Add content to PDF
        doc.fontSize(18).text('Finishing Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text('Date: ' + new Date().toLocaleString());
        doc.moveDown();
        doc.text('Finishing Name: John Doe');
        doc.text('Email: johndoe@example.com');
        doc.text('Total Orders: 5');

        // Finalize PDF
        doc.end();
}catch (error) {
        console.error('PDF generation error:', error);
        res.status(500).json({
            code: 500,
            status: 'error',
            message: 'Failed to generate PDF'
        });
    }
}