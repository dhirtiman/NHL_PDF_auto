const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

async function combinePDFsFromFolder(folderPath, outputPath) {
  const pdfPaths = fs.readdirSync(folderPath)
    .filter(file => file.endsWith('.pdf'))
    .map(file => `${folderPath}/${file}`)
    .sort();

  await combinePDFs(pdfPaths, outputPath);
}

async function combinePDFs(pdfPaths, outputPath) {
  const mergedPdfDoc = await PDFDocument.create();

  for (const pdfPath of pdfPaths) {
    const pdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    for (let i = 0; i < pdfDoc.getPageCount(); i++) {
      const [copiedPage] = await mergedPdfDoc.copyPages(pdfDoc, [i]);
      mergedPdfDoc.addPage(copiedPage);
    }
  }

  const mergedPdfBytes = await mergedPdfDoc.save();
  fs.writeFileSync(outputPath, mergedPdfBytes);

  console.log('PDFs combined successfully!');
}

// Example usage:
const folderPath = 'combine/Kumar';
const name = 'Krishna_Kumari '


const outputPath = `combine/output/Diet_doc_${name}.pdf`;


combinePDFsFromFolder(folderPath, outputPath);
