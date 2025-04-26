const fs = require("fs");
const { PDFDocument } = require("pdf-lib");



function extractNumberFromStr(str) {
  // Extracts digits from a string and returns them as a single string
  let c = "0123456789";
  const matches = [...str].reduce((x, y) => (c.includes(y) ? x + y : x), "");

  // Return the number as a string if extracted, otherwise return null
  return matches || null;
}

async function combinePDFsFromFolder(folderPath, outputPath) {
  const pdfPaths = fs
    .readdirSync(folderPath)
    .filter((file) => file.endsWith(".pdf"))
    .map((file) => `${folderPath}/${file}`)
    .sort((a, b) => {
      // Extract the numbers within each filename using the extractNumberFromStr function
      const numA = extractNumberFromStr(a);
      const numB = extractNumberFromStr(b);

      // Convert extracted strings to integers
      const intA = numA ? parseInt(numA, 10) : 0;
      const intB = numB ? parseInt(numB, 10) : 0;

      console.log(intA, intB); // Check the extracted values

      return intA - intB; // Sort numerically by extracted numbers
    });

  console.log(pdfPaths); // Check the sorted order
  
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

  console.log("PDFs combined successfully!");
}

// Example usage:
const name = "Prashant singh chundawat";
// const outputPath = `combine/output/NA.pdf`;


const folderPath = "combine/modules";
const outputPath = `combine/output/modules.pdf`;

combinePDFsFromFolder(folderPath, outputPath);
