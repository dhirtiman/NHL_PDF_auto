const fs = require("fs");
const { PDFDocument } = require("pdf-lib");

/**
 * Removes specific pages from a PDF and saves the result.
 * 
 * @param {string} inputPath - Path to the input PDF
 * @param {string} outputPath - Path for the output PDF
 * @param {number[]} pagesToRemove - List of page numbers (1-based) to remove
 */
async function removePagesFromPDF(inputPath, outputPath, pagesToRemove) {
  const inputBytes = fs.readFileSync(inputPath);
  const inputPdfDoc = await PDFDocument.load(inputBytes);

  const outputPdfDoc = await PDFDocument.create();
  const totalPages = inputPdfDoc.getPageCount();

  for (let i = 0; i < totalPages; i++) {
    const pageNumber = i + 1; // 1-based index
    if (pagesToRemove.includes(pageNumber)) {
      console.log(`Skipping page ${pageNumber}`);
      continue;
    }

    const [copiedPage] = await outputPdfDoc.copyPages(inputPdfDoc, [i]);
    outputPdfDoc.addPage(copiedPage);
  }

  const outputBytes = await outputPdfDoc.save();
  fs.writeFileSync(outputPath, outputBytes);

  console.log(`✅ New PDF created: ${outputPath}`);
}

// Example usage
const inputPath = "./removePages/input/modules.pdf";
const outputPath = "./removePages/output/modules.pdf";
const pagesToRemove = [44]; // Specify the pages you want to remove

removePagesFromPDF(inputPath, outputPath, pagesToRemove);
