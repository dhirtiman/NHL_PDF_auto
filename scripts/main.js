const fs = require('fs');
const { PDFDocument, rgb } = require('pdf-lib'); 
const fontkit = require('@pdf-lib/fontkit');
const csv = require('csv-parser');

const textSize = 85;
const colorValue = 0.10;
const textColor = rgb(colorValue, colorValue, colorValue)


async function mergePdfWithSingleRow(rowNumber) {
    // Read data from CSV file
    const data = [];
    fs.createReadStream('data/NHL response 2.csv')
        .pipe(csv())
        .on('data', (row) => {
            data.push(row);
        })
        .on('end', async () => {
            // Load existing PDF
            const pdfBytes = fs.readFileSync('templates/NHL_template_g.pdf');

            // Load the font directly from the file path
            const fontPath = 'fonts/Shrikhand/Shrikhand-Regular.ttf';
            const fontBytes = fs.readFileSync(fontPath);
            const pdfDoc = await PDFDocument.load(pdfBytes);
            pdfDoc.registerFontkit(fontkit);
            const font = await pdfDoc.embedFont(fontBytes);

            // Get the first page of the PDF
            const page = pdfDoc.getPages()[0];

            // Get data from the first row
            const rowData = data[rowNumber];

            // Write data to specific points on the PDF
            page.drawText(`${rowData['Sl Number']}`, { x: 1200, y: 2340, font, size: textSize, color: textColor });
            page.drawText(`${rowData.Name}`, { x: 700, y: 2042, font, size: textSize, color: textColor });
            page.drawText(`${rowData.Age}`, { x: 600, y: 1745, font, size: textSize, color: textColor });
            page.drawText(`${rowData.Gender}`, { x: 2100, y: 1745, font, size: textSize, color: textColor });


            // Save the modified PDF to a new file
            const modifiedPdfBytes = await pdfDoc.save();
            fs.writeFileSync('output/output.pdf', modifiedPdfBytes);
            console.log('PDF with data from a single row merged successfully!');
        });
}

async function mergePdfFromRowNumber(startRowNumber) {
    // Read data from CSV file
    const data = [];
    fs.createReadStream('data/NHL response 2.csv')
        .pipe(csv())
        .on('data', (row) => {
            data.push(row);
        })
        .on('end', async () => {
            // Load the existing PDF template
            const templatePdfBytes = fs.readFileSync('templates/NHL_template_g.pdf');
            const fontPath = 'fonts/Shrikhand/Shrikhand-Regular.ttf';
            const fontBytes = fs.readFileSync(fontPath);

            // Iterate through all rows in the CSV
            for (const rowData of data) {
                // Check if the current row is greater than or equal to the specified startRowNumber
                if (parseInt(rowData['Sl Number']) >= startRowNumber) {
                    // Load the existing PDF template for each row
                    const pdfDoc = await PDFDocument.load(templatePdfBytes);
                    pdfDoc.registerFontkit(fontkit);
                    const font = await pdfDoc.embedFont(fontBytes);

                    // Get the first page of the PDF
                    const page = pdfDoc.getPages()[0];

                    // Write data to specific points on the PDF for each row
                    page.drawText(`${rowData['Sl Number']}`, { x: 1200, y: 2340, font, size: textSize, color: textColor });
                    page.drawText(`${rowData.Name}`, { x: 700, y: 2042, font, size: textSize, color: textColor });
                    page.drawText(`${rowData.Age}`, { x: 600, y: 1745, font, size: textSize, color: textColor });
                    page.drawText(`${rowData.Gender}`, { x: 2100, y: 1745, font, size: textSize, color: textColor });

                    // Save the modified PDF to a new file for each row
                    const modifiedPdfBytes = await pdfDoc.save();
                    fs.writeFileSync(`output/Sl_${rowData['Sl Number']}_${rowData.Name}.pdf`, modifiedPdfBytes);
                }
            }

            console.log(`PDFs with data from row ${startRowNumber} onwards merged successfully!`);
        });
}


// Generate from specific row

const specificRow = 0;

mergePdfWithSingleRow(specificRow);



// Generate from a specific row number
const startRow = 4;

mergePdfFromRowNumber(startRow);