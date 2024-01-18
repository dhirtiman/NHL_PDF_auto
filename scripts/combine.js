const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

async function mergeSpecificPages(pdf1Path, pdf2Path, pdf1Pages, pdf2Pages, outputPath,lastPages) {
    // Load PDF1
    const pdf1Bytes = fs.readFileSync(pdf1Path);
    const pdf1Doc = await PDFDocument.load(pdf1Bytes);

    // Load PDF2
    const pdf2Bytes = fs.readFileSync(pdf2Path);
    const pdf2Doc = await PDFDocument.load(pdf2Bytes);

    // Create a new PDF document
    const mergedPdfDoc = await PDFDocument.create();

    // Iterate through specified pages of PDF1 and add them to the merged PDF
    for (const pageNumber of pdf1Pages) {
        const pdf1Page = await mergedPdfDoc.copyPages(pdf1Doc, [pageNumber - 1]);
        mergedPdfDoc.addPage(pdf1Page[0]);
    }

    // Iterate through specified pages of PDF2 and add them to the merged PDF
    for (const pageNumber of pdf2Pages) {
        const pdf2Page = await mergedPdfDoc.copyPages(pdf2Doc, [pageNumber - 1]);
        mergedPdfDoc.addPage(pdf2Page[0]);
    }

    for (const pageNumber of lastPages) {
        const pdf1Page = await mergedPdfDoc.copyPages(pdf1Doc, [pageNumber - 1]);
        mergedPdfDoc.addPage(pdf1Page[0]);
    }


    // Save the merged PDF to a new file
    const mergedPdfBytes = await mergedPdfDoc.save();
    fs.writeFileSync(outputPath, mergedPdfBytes);

    console.log('Merged PDF created successfully!');
}

// Example usage:
const pdf1Path = 'combine/sofa1.pdf';
const pdf2Path = 'combine/sofa2.pdf';
const pdf1Pages = [
    51,
    53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90,
    5, 8,
    24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50
];

const pdf2Pages = [
    69, 70, 71, 72, 73, 74, 75, 76, 77
];

const lastPages = [11, 12, 13, 14, 15, 16,]
const outputPath = 'combine/output/sofas.pdf';

mergeSpecificPages(pdf1Path, pdf2Path, pdf1Pages, pdf2Pages, outputPath,lastPages);
