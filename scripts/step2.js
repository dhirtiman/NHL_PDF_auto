const fs = require('fs');
const { PDFDocument, rgb } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const csv = require('csv-parser');

const textSize = 85;
const colorValue = 0.10;
const textColor = rgb(colorValue, colorValue, colorValue);

async function generatePdfFromSlNumber(slNumberToFind) {
  // Read data from the second CSV file
  const data = [];
  fs.createReadStream('data/Patient_step2.csv')
    .pipe(csv())
    .on('data', (row) => {
      data.push(row);
    })
    .on('end', async () => {
      // Find the row data for the specified Sl_Number
      const rowData = data.find((row) => row['SL_Number'] === slNumberToFind);

      if (!rowData) {
        console.log(`Row with SL_Number ${slNumberToFind} not found.`);
        return;
      }

      // Load the existing PDF template
      const templatePdfBytes = fs.readFileSync(`PatientPDF/Input/${fileName}`);
      const fontPath = 'fonts/Shrikhand/Shrikhand-Regular.ttf';
      const fontBytes = fs.readFileSync(fontPath);

      // Load PDF
      const pdfDoc = await PDFDocument.load(templatePdfBytes);
      pdfDoc.registerFontkit(fontkit);
      const font = await pdfDoc.embedFont(fontBytes);

      // Get the pages from the PDF
      const page1 = pdfDoc.getPages()[0];
      const page2 = pdfDoc.getPages()[1];
      const page3 = pdfDoc.getPages()[2];

      // Write data to specific points on each page
      page1.drawText(`${rowData.Height}`, { x: 900, y: 1400, font, size: textSize, color: textColor });
      page1.drawText(`${rowData.Weight}`, { x: 2400, y: 1400, font, size: textSize, color: textColor });
      page1.drawText(`${rowData.BMI}`, { x: 500, y: 700, font, size: textSize, color: textColor });
      page1.drawText(`${rowData.BodyFat}`, { x: 1100, y: 700, font, size: textSize, color: textColor });
      page1.drawText(`${rowData['LeanMass(S/M)']}`, { x: 1700, y: 700, font, size: textSize, color: textColor });
      page1.drawText(`${rowData.VisceralFat}`, { x: 2350, y: 700, font, size: textSize, color: textColor });
      page1.drawText(`${rowData.WaistLine}`, { x: 2900, y: 700, font, size: textSize, color: textColor });
      page1.drawText(`${rowData.WaistHipRatio}`, { x: 3650, y: 700, font, size: textSize, color: textColor });
      page1.drawText(`${rowData.BodyAge}`, { x: 4300, y: 700, font, size: textSize, color: textColor });





      // PAGE 2

      const coreSupplementsText = `${rowData.Core_Supplements}`.replace(/,/g, '\n\n\n\n\n\n');
      const addonsText = `${rowData.Addons}`.replace(/,/g, '\n\n\n\n\n\n');

      page2.drawText(`${coreSupplementsText}`, { x: 600, y: 1900, font, size: textSize + 10, color: textColor });
      page2.drawText(`${addonsText}`, { x: 2700, y: 1900, font, size: textSize+10, color: textColor });

     // PAGE 3
     const goalsText = `${rowData.Goals}`.replace(/,/g, '\n\n\n\n\n\n\n');

      page3.drawText(`${goalsText}`, { x: 700, y: 1930, font, size: textSize, color: textColor });
      // Continue adding other fields to page3

      // Save the modified PDF to a new file
      const modifiedPdfBytes = await pdfDoc.save();
      fs.writeFileSync(`PatientPDF/Output/sl_${slNumberToFind}_${rowData.Name}_Final.pdf`, modifiedPdfBytes);

      console.log(`PDF for SL_Number ${slNumberToFind} generated successfully!`);
    });
}

// Specific File Name
const fileName = 'SL_2_Chuba.pdf'
generatePdfFromSlNumber('2');  // Example using SL_Number '2'
