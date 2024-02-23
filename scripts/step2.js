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
  fs.createReadStream(`data/${csvName}`)
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

      const tickImagePath = 'data/ticknobg.png'; // Replace with the path to your tick mark image
      const tickImageBytes = fs.readFileSync(tickImagePath);

      // Load PDF
      const pdfDoc = await PDFDocument.load(templatePdfBytes);
      pdfDoc.registerFontkit(fontkit);
      const font = await pdfDoc.embedFont(fontBytes);

      // Get the pages from the PDF
      const page1 = pdfDoc.getPages()[0];
      const page2 = pdfDoc.getPages()[1];
      const page3 = pdfDoc.getPages()[2];
      const page5 = pdfDoc.getPages()[4];

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

      // Write checkboxes for medical conditions

      const tickImage = await pdfDoc.embedPng(tickImageBytes);


      const medicalConditions = rowData['select any medical conditions'].split(',');
      const medicalConditionsZCoor = 2020

      const medicalConditionsMap = {
        'Thyroid': [2000, medicalConditionsZCoor],
        'BP': [2550, medicalConditionsZCoor],
        'HYPER TENSION': [3100, medicalConditionsZCoor],
        'URIC ACID': [3650, medicalConditionsZCoor],
        'DIABETES': [4200, medicalConditionsZCoor],
        'None': [4800, medicalConditionsZCoor] // Adjust coordinates as needed
      };

      for (const condition of medicalConditions) {
        const [x, y] = medicalConditionsMap[condition];
        if (x && y) {
          page2.drawImage(tickImage, {
            x: x-50,
            y: y,
            width: tickImage.width,
            height: tickImage.height,
          });

        }
      }

      // Write checkboxes for deficiencies
      const deficiencies = rowData['Select any deficiencies'].split(',');
      const deficienciesZCoor = 1220

      const deficienciesMap = {
        'Iron': [1980, deficienciesZCoor],
        'Vit D': [2400, deficienciesZCoor],
        'Cal': [2900, deficienciesZCoor],
        'Vit A': [3400, deficienciesZCoor],
        'Magnesium': [3850, deficienciesZCoor],
        'Iodine': [4300, deficienciesZCoor],
        'None': [4800, deficienciesZCoor] // Adjust coordinates as needed
      };

      for (const deficiency of deficiencies) {
        const [x, y] = deficienciesMap[deficiency];
        if (x && y) {
          page2.drawImage(tickImage, {
            x: x-50,
            y: y,
            width: tickImage.width,
            height: tickImage.height,
          });
        }
      }

      // Write checkboxes for other health concerns
      const healthConcerns = rowData['Select any other Health concerns'].split(',');
      const healConcernsZCoor = 420
      const healthConcernsMap = {
        'Heart': [1950, healConcernsZCoor],
        'Energy': [2350, healConcernsZCoor],
        'Liver': [2750, healConcernsZCoor],
        'Immunity': [3150, healConcernsZCoor],
        'GUT': [3560, healConcernsZCoor],
        'Mind': [4000, healConcernsZCoor],
        'Bone / Joint': [4400, healConcernsZCoor],
        'None': [4800, healConcernsZCoor] // Adjust coordinates as needed
      };

      for (const concern of healthConcerns) {
        const [x, y] = healthConcernsMap[concern];
        if (x && y) {
          page2.drawImage(tickImage, {
            x: x-50,
            y: y,
            width: tickImage.width,
            height: tickImage.height,
          });
        }
      }





      // PAGE 3

      const coreSupplementsText = `${rowData.Core_Supplements}`.replace(/,/g, '\n\n\n\n\n\n');
      const addonsText = `${rowData.Addons}`.replace(/,/g, '\n\n\n\n\n\n');

      page3.drawText(`${coreSupplementsText}`, { x: 600, y: 1900, font, size: textSize + 10, color: textColor });
      page3.drawText(`${addonsText}`, { x: 2600, y: 1900, font, size: textSize + 10, color: textColor });

      // PAGE 4
      const goalsText = `${rowData.Goals}`.replace(/,/g, '\n\n\n\n\n\n\n');

      page5.drawText(`${goalsText}`, { x: 700, y: 1930, font, size: textSize, color: textColor });
      // Continue adding other fields to page5

      // Save the modified PDF to a new file
      const modifiedPdfBytes = await pdfDoc.save();
      fs.writeFileSync(`PatientPDF/Output/sl_${slNumberToFind}_${rowData.Name}_F.pdf`, modifiedPdfBytes);

      console.log(`PDF for SL_Number ${slNumberToFind} generated successfully!`);
    });
}

// Specific File Name
const fileName = 'Sl_3_Tokato Sumi.pdf'
const csvName = 'step2.csv'
generatePdfFromSlNumber('3');  // Example using SL_Number '2'

