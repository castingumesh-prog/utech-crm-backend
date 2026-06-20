const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Ensure the local uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Generate a branded PDF document for Quotations, PIs, Work Orders, or AMC Contracts.
 * Saves the file locally and returns the local relative path.
 * @param {string} type - Document type ('Quotation', 'ProformaInvoice', 'WorkOrder', 'AMCContract')
 * @param {object} docData - Document properties (no, date, customerName, customerMobile, address, items, subtotal, gst_amount, total_amount)
 * @returns {Promise<{relativePath: string, filePath: string}>} Paths to the generated PDF
 */
function generateBrandedPDF(type, docData) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const filename = `${type.toLowerCase()}-${docData.no || Date.now()}-${Math.round(Math.random() * 1000)}.pdf`;
      const relativePath = `/uploads/${filename}`;
      const filePath = path.join(uploadDir, filename);

      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      // --- BRANDED HEADER ---
      doc.fillColor('#1A365D') // Navy Blue
         .rect(0, 0, 595.28, 110) // A4 width is 595.28 points
         .fill();

      doc.fillColor('#FFFFFF')
         .fontSize(22)
         .text('U TECH FIRE & SAFETY SYSTEMS', 50, 30, { align: 'left' });

      doc.fontSize(10)
         .text('Office 102, Sector 4, Gurugram, Haryana, 122001', 50, 60, { align: 'left' })
         .text('Email: info@utech.com | Phone: +91 98765 43210 | GSTIN: 07AAAAA1111A1Z1', 50, 75, { align: 'left' });

      // --- TITLE ---
      doc.fillColor('#1A365D')
         .fontSize(18)
         .text(`${type.toUpperCase()}`, 50, 130, { align: 'right' });
      
      // Draw a gold divider line
      doc.strokeColor('#D69E2E')
         .lineWidth(2)
         .moveTo(50, 155)
         .lineTo(545, 155)
         .stroke();

      // --- DOCUMENT INFO / METADATA ---
      doc.fillColor('#2D3748')
         .fontSize(10)
         .text(`Document No  : ${docData.no || 'N/A'}`, 50, 175)
         .text(`Date         : ${docData.date || new Date().toLocaleDateString()}`, 50, 190);

      // Bill To details
      doc.fontSize(11)
         .fillColor('#1A365D')
         .text('BILL TO:', 320, 175)
         .fillColor('#2D3748')
         .fontSize(10)
         .text(`Customer     : ${docData.customerName || 'N/A'}`, 320, 190)
         .text(`Contact      : ${docData.customerMobile || 'N/A'}`, 320, 205)
         .text(`Address      : ${docData.address || 'N/A'}`, 320, 220, { width: 220 });

      // Spacer
      let y = 265;

      // --- TABLE HEADERS ---
      doc.fillColor('#1A365D')
         .rect(50, y, 495, 22)
         .fill();

      doc.fillColor('#FFFFFF')
         .fontSize(10)
         .text('S.No', 60, y + 6)
         .text('Description / Product', 100, y + 6)
         .text('Qty', 330, y + 6, { width: 30, align: 'right' })
         .text('Unit Price', 380, y + 6, { width: 70, align: 'right' })
         .text('Total (INR)', 470, y + 6, { width: 70, align: 'right' });

      y += 22;

      // --- TABLE ITEMS ---
      doc.fillColor('#2D3748');
      if (docData.items && docData.items.length > 0) {
        docData.items.forEach((item, index) => {
          // Check if we need a new page
          if (y > 720) {
            doc.addPage();
            y = 50; // Start at top of new page
          }

          // Alternating row background
          if (index % 2 === 1) {
            doc.fillColor('#F7FAFC')
               .rect(50, y, 495, 20)
               .fill();
            doc.fillColor('#2D3748');
          }

          doc.fontSize(9)
             .text(String(index + 1), 60, y + 5)
             .text(item.product_name || 'Service Charge / Custom Item', 100, y + 5, { width: 220 })
             .text(String(item.qty), 330, y + 5, { width: 30, align: 'right' })
             .text(Number(item.unit_price).toFixed(2), 380, y + 5, { width: 70, align: 'right' });
          
          const totalVal = Number(item.total || (item.qty * item.unit_price) || 0);
          doc.text(totalVal.toFixed(2), 470, y + 5, { width: 70, align: 'right' });

          y += 20;
        });
      } else {
        doc.fontSize(10).text('No items included.', 60, y + 8);
        y += 25;
      }

      // Draw table border line
      doc.strokeColor('#E2E8F0')
         .lineWidth(1)
         .moveTo(50, y)
         .lineTo(545, y)
         .stroke();

      y += 15;

      // --- TOTALS SECTION ---
      if (docData.subtotal !== undefined) {
        doc.fontSize(10)
           .text('Subtotal:', 350, y, { width: 90, align: 'right' })
           .text(Number(docData.subtotal).toFixed(2), 460, y, { width: 80, align: 'right' });
        y += 15;

        doc.text('GST Amount:', 350, y, { width: 90, align: 'right' })
           .text(Number(docData.gst_amount).toFixed(2), 460, y, { width: 80, align: 'right' });
        y += 15;

        doc.strokeColor('#1A365D')
           .lineWidth(1.5)
           .moveTo(350, y)
           .lineTo(545, y)
           .stroke();
        y += 5;

        doc.fontSize(11)
           .fillColor('#1A365D')
           .text('Total Amount (INR):', 320, y, { width: 120, align: 'right' })
           .text(Number(docData.total_amount).toFixed(2), 460, y, { width: 80, align: 'right' });
      } else if (docData.total_amount !== undefined) {
        doc.fontSize(11)
           .fillColor('#1A365D')
           .text('Total Amount (INR):', 320, y, { width: 120, align: 'right' })
           .text(Number(docData.total_amount).toFixed(2), 460, y, { width: 80, align: 'right' });
      }

      // --- TERMS & CONDITIONS ---
      doc.fillColor('#718096')
         .fontSize(8)
         .text('Terms & Conditions:', 50, 680)
         .text('1. Payment should be made as per terms negotiated on the work order / contract.', 50, 692)
         .text('2. Goods once sold cannot be returned or exchanged under any circumstances.', 50, 702)
         .text('3. Disputes, if any, are subject to Gurugram jurisdiction only.', 50, 712);

      // --- FOOTER ---
      doc.strokeColor('#E2E8F0')
         .lineWidth(1)
         .moveTo(50, 740)
         .lineTo(545, 740)
         .stroke();

      doc.fillColor('#A0AEC0')
         .fontSize(8)
         .text('This is a computer-generated document and does not require a physical signature.', 50, 750, { align: 'center' });

      doc.end();

      writeStream.on('finish', () => {
        resolve({ relativePath, filePath });
      });

      writeStream.on('error', (err) => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = {
  generateBrandedPDF,
};
