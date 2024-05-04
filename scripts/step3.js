const fs = require('fs');
const { PDFDocument, rgb } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const csv = require('csv-parser');

const textSize = 85;
const colorValue = 0.10;
const textColor = rgb(colorValue, colorValue, colorValue)


/*



#######
SCROLL TO THE END 
###### 

*/
async function mergePdfWithSingleRow(slNumberToFind, callback) {
    // Read data from CSV file
    const data = [];
    fs.createReadStream(`data/${step1CSV}`)
        .pipe(csv())
        .on('data', (row) => {
            data.push(row);
        })
        .on('end', async () => {
            // Load existing PDF
            const pdfBytes = fs.readFileSync(`templates/${templateName}`);


            // Load the font directly from the file path
            const fontPath = 'fonts/Shrikhand/Shrikhand-Regular.ttf';
            const fontBytes = fs.readFileSync(fontPath);
            const pdfDoc = await PDFDocument.load(pdfBytes);
            pdfDoc.registerFontkit(fontkit);
            const font = await pdfDoc.embedFont(fontBytes);

            // Get the first page of the PDF
            const page = pdfDoc.getPages()[0];

            // Get data from the first row
            const rowData = data.find((row) => row['Sl Number'] === slNumberToFind);

            if (!rowData) {
                console.log(`Row with SL_Number ${slNumberToFind} not found.`);
                return;
            }

            // Write data to specific points on the PDF
            page.drawText(`${rowData['Sl Number']}`, { x: 1200, y: 2340, font, size: textSize, color: textColor });
            page.drawText(`${rowData.Name}`, { x: 700, y: 2042, font, size: textSize, color: textColor });
            page.drawText(`${rowData.Age}`, { x: 600, y: 1745, font, size: textSize, color: textColor });
            page.drawText(`${rowData.Gender}`, { x: 2100, y: 1745, font, size: textSize, color: textColor });
            page.drawText(`${rowData['Phone number']}`, { x: 900, y: 1150, font, size: textSize, color: textColor });



            // Save the modified PDF to a new file
            const modifiedPdfBytes = await pdfDoc.save();
            fs.writeFileSync(`step3/step1.pdf`, modifiedPdfBytes);

            console.log('PDF with data from a single row merged successfully!');
            callback();
        });
}

async function generatePdfFromSlNumber(slNumberToFind, callback) {
    // Read data from the second CSV file
    const data = [];
    fs.createReadStream(`data/${step2CSV}`)
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
            const templatePdfBytes = fs.readFileSync(`step3/step1.pdf`);
            const fontPath = 'fonts/Shrikhand/Shrikhand-Regular.ttf';
            const fontBytes = fs.readFileSync(fontPath);

            const tickImagePath = 'data/ticknobg.png'; // Replace with the path to your tick mark image
            const tickImageBytes = fs.readFileSync(tickImagePath);

            // Load PDF
            const pdfDoc = await PDFDocument.load(templatePdfBytes);
            pdfDoc.registerFontkit(fontkit);
            const font = await pdfDoc.embedFont(fontBytes);

            // Get the pages from the PDF
            const page1 = pdfDoc.getPages()[0];   // page 1 body data
            const page3 = pdfDoc.getPages()[2];   // page 3 medical
            const page4 = pdfDoc.getPages()[3];   // page 4 goals

            const yMinus = 150;
            // Write data to specific points on each page
            page1.drawText(`${rowData.Height}`, { x: 900, y: 1400, font, size: textSize, color: textColor });
            page1.drawText(`${rowData.Weight}`, { x: 2400, y: 1400, font, size: textSize, color: textColor });
            page1.drawText(`${rowData.BMI}`, { x: 500, y: 700 - yMinus, font, size: textSize, color: textColor });
            page1.drawText(`${rowData.BodyFat}`, { x: 1100, y: 700 - yMinus, font, size: textSize, color: textColor });
            page1.drawText(`${rowData['LeanMass(S/M)']}`, { x: 1700, y: 700 - yMinus, font, size: textSize, color: textColor });
            page1.drawText(`${rowData.VisceralFat}`, { x: 2350, y: 700 - yMinus, font, size: textSize, color: textColor });
            page1.drawText(`${rowData.WaistLine}`, { x: 2900, y: 700 - yMinus, font, size: textSize, color: textColor });
            page1.drawText(`${rowData.WaistHipRatio}`, { x: 3650, y: 700 - yMinus, font, size: textSize, color: textColor });
            page1.drawText(`${rowData.BodyAge}`, { x: 4300, y: 700 - yMinus, font, size: textSize, color: textColor });

            page1.drawText(`${rowData['Dietary preference']}`, { x: 3451, y: 1300 - yMinus, font, size: textSize, color: textColor })


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
                    page3.drawImage(tickImage, {
                        x: x - 50,
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
                    page3.drawImage(tickImage, {
                        x: x - 50,
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
                    page3.drawImage(tickImage, {
                        x: x - 50,
                        y: y,
                        width: tickImage.width,
                        height: tickImage.height,
                    });
                }
            }




            // PAGE 4
            const goalsText = `${rowData.Goals}`.replace(/,/g, '\n\n\n\n\n\n\n');

            page4.drawText(`${goalsText}`, { x: 700, y: 1930, font, size: textSize, color: textColor });
            // Continue adding other fields to page4

            // Save the modified PDF to a new file
            const modifiedPdfBytes = await pdfDoc.save();
            fs.writeFileSync(`step3/step2.pdf`, modifiedPdfBytes);

            console.log(`PDF for SL_Number ${slNumberToFind} generated successfully!`);

            newFileName = `step3/output/Sl_${slNumberToFind}_${rowData.Name}_forDtcn.pdf`

            callback();
        });
}

async function step3(slNumberToFind, callback) {
    const data = [];
    fs.createReadStream(`data/${step3CSV}`)
        .pipe(csv())
        .on('data', (row) => {
            data.push(row);
        })
        .on('end', async () => {
            const rowData = data.find((row) => row['Sl Number'] === slNumberToFind);

            if (!rowData) {
                console.log(`Row with SL_Number ${slNumberToFind} not found.`);
                return;
            }


            const templatePdfBytes = fs.readFileSync(`step3/step2.pdf`);

            const tickImagePath = 'data/ticknobg.png'; // Replace with the path to your tick mark image
            const tickImageBytes = fs.readFileSync(tickImagePath);


            const pdfDoc = await PDFDocument.load(templatePdfBytes);
            pdfDoc.registerFontkit(fontkit);

            const page2 = pdfDoc.getPages()[1];
            const tickImage = await pdfDoc.embedPng(tickImageBytes);

            tickWidth = tickImage.width * 0.50;
            tickheight = tickImage.height * 0.50;


            //page2 stuff Question answer

            const q1 = rowData['Q1 How often do you eat meals in a day (including tea, coffee, fruits, salads, snacks)?']
            const q1ZCoor = 300;

            const q1Map = {
                '>6 times': [950, q1ZCoor],
                '6 times': [1150, q1ZCoor], // 1150 x
                '5 times': [1370, q1ZCoor],
                '4 times': [1600, q1ZCoor],
                '<3 times': [1800, q1ZCoor],
            };

            let [x, y] = q1Map[q1];
            if (x && y) {
                page2.drawImage(tickImage, {
                    x: x,
                    y: y,
                    width: tickWidth,
                    height: tickheight,
                });
            }

            //Question2

            const q2 = rowData['Q2 How often do you drink sweetened beverages like soft drinks, juices, etc.?']
            const q2ZCoor = 2250;

            const q2Map = {
                'At least once daily': [1100, q2ZCoor],
                '3 to 6 times a week': [1600, q2ZCoor],
                '1 to 2 times a week': [2100, q2ZCoor],
                '2 to 3 times a month': [2550, q2ZCoor],
                'Once a month or less.': [3020, q2ZCoor], // x 3020
            };

            [x, y] = q2Map[q2];
            if (x && y) {
                page2.drawImage(tickImage, {
                    x: x,
                    y: y,
                    width: tickWidth,
                    height: tickheight,
                });
            }

            //Question3

            const q3 = rowData['Q3. How often do you eat fried foods such as Puri, Parathas, Fried chicken, momo, chow, Noodles, etc .']
            const q3ZCoor = 2050;

            const q3Map = {
                'At least once daily': [1100, q3ZCoor],
                '3 to 6 times a week': [1600, q3ZCoor],
                '1 to 2 times a week': [2100, q3ZCoor],
                '2 to 3 times a month': [2550, q3ZCoor],
                'Once a month or less.': [3020, q3ZCoor], // x 3020
            };

            [x, y] = q3Map[q3];
            if (x && y) {
                page2.drawImage(tickImage, {
                    x: x,
                    y: y,
                    width: tickWidth,
                    height: tickheight,
                });
            }

            //Question4

            const q4 = rowData['Q4. How often do you eat sweets such as Laddu, Barfi, Jalebi, Kulfi, Chocolate, Halwa, Rice pudding, etc.?'];
            const q4ZCoor = 1880;

            const q4Map = {
                'At least once daily': [1100, q4ZCoor],
                '3 to 6 times a week': [1600, q4ZCoor],
                '1 to 2 times a week': [2100, q4ZCoor],
                '2 to 3 times a month': [2550, q4ZCoor],
                'Once a month or less.': [3020, q4ZCoor], // x 3020
            };

            [x, y] = q4Map[q4];
            if (x && y) {
                page2.drawImage(tickImage, {
                    x: x,
                    y: y,
                    width: tickWidth,
                    height: tickheight,
                });
            }

            //question5

            const q5 = rowData['Q5.How often do you eat high salt snacks such as Namkeen, Bhujia, Meat/Veg Pickles, Chutney, Papad etc.?'];
            const q5ZCoor = 1700;

            const q5Map = {
                'At least once daily': [1100, q5ZCoor],
                '3 to 6 times a week': [1600, q5ZCoor],
                '1 to 2 times a week': [2100, q5ZCoor],
                '2 to 3 times a month': [2550, q5ZCoor],
                'Once a month or less.': [3020, q5ZCoor], // x 3020
            };

            [x, y] = q5Map[q5];
            if (x && y) {
                page2.drawImage(tickImage, {
                    x: x,
                    y: y,
                    width: tickWidth,
                    height: tickheight,
                });
            }

            // Question6
            const q6 = rowData['Q6 How often do you consume sugar and honey in tea, coffee, curd, lassi, etc?'];
            const q6ZCoor = 1540;

            const q6Map = {
                'At least once daily': [1100, q6ZCoor],
                '3 to 6 times a week': [1600, q6ZCoor],
                '1 to 2 times a week': [2100, q6ZCoor],
                '2 to 3 times a month': [2550, q6ZCoor],
                'Once a month or less.': [3020, q6ZCoor], // x 3020
            };

            [x, y] = q6Map[q6];
            if (x && y) {
                page2.drawImage(tickImage, {
                    x: x,
                    y: y,
                    width: tickWidth,
                    height: tickheight,
                });
            }

            //Question9
            const q9 = rowData['Q9 .How often do you eat saturated fat like Pork, mutton, Beef fat, egg yolks, etc.?'];
            const q9ZCoor = 1390;

            const q9Map = {
                'At least once daily': [1100, q9ZCoor],
                '3 to 6 times a week': [1600, q9ZCoor],
                '1 to 2 times a week': [2100, q9ZCoor],
                '2 to 3 times a month': [2550, q9ZCoor],
                'Once a month or less.': [3020, q9ZCoor], // x 3020
            };

            [x, y] = q9Map[q9];
            if (x && y) {
                page2.drawImage(tickImage, {
                    x: x,
                    y: y,
                    width: tickWidth,
                    height: tickheight,
                });
            }

            //Question10

            const q10 = rowData['Q10 How often do you eat refined food items like burgers, pizza, KFC etc.?'];
            const q10ZCoor = 1210;

            const q10Map = {
                'At least once daily': [1100, q10ZCoor],
                '3 to 6 times a week': [1600, q10ZCoor],
                '1 to 2 times a week': [2100, q10ZCoor],
                '2 to 3 times a month': [2550, q10ZCoor],
                'Once a month or less.': [3020, q10ZCoor], // x 3020
            };

            [x, y] = q10Map[q10];
            if (x && y) {
                page2.drawImage(tickImage, {
                    x: x,
                    y: y,
                    width: tickWidth,
                    height: tickheight,
                });
            }

            //Question 11

            const q11 = rowData['Q11 How often do you eat ghee, butter, cream, mayonnaise, etc.?'];
            const q11ZCoor = 1050;

            const q11Map = {
                'At least once daily': [1100, q11ZCoor],
                '3 to 6 times a week': [1600, q11ZCoor],
                '1 to 2 times a week': [2100, q11ZCoor],
                '2 to 3 times a month': [2550, q11ZCoor],
                'Once a month or less.': [3020, q11ZCoor], // x 3020
            };

            [x, y] = q11Map[q11];
            if (x && y) {
                page2.drawImage(tickImage, {
                    x: x,
                    y: y,
                    width: tickWidth,
                    height: tickheight,
                });
            }

            // Question 7 
            const q7 = rowData['Q7 How often do you eat fruit and salad?'];
            const q7ZCoor = 810;

            const q7Map = {
                'Every time in the main diet': [1000, q7ZCoor],
                'At least once a day': [1500, q7ZCoor], //1500
                '3 to 4 times a week': [2000, q7ZCoor],
                '1 time a week': [2450, q7ZCoor],
                'Less than once a week': [3020, q7ZCoor], // 
            };

            [x, y] = q7Map[q7];
            if (x && y) {
                page2.drawImage(tickImage, {
                    x: x,
                    y: y,
                    width: tickWidth,
                    height: tickheight,
                });
            }

            //Question 8 

            const q8 = rowData['Q8. How often do you eat sprouted pulses and green vegetables?'];
            const q8ZCoor = 650;

            const q8Map = {
                'Every time in the main diet': [1000, q8ZCoor],
                'At least once a day': [1500, q8ZCoor],  // 1500 x
                '3 to 4 times a week': [2000, q8ZCoor],
                '1 time a week': [2450, q8ZCoor],
                'Less than once a week': [3020, q8ZCoor], // x 3020
            };

            [x, y] = q8Map[q8];
            if (x && y) {
                page2.drawImage(tickImage, {
                    x: x,
                    y: y,
                    width: tickWidth,
                    height: tickheight,
                });
            }

            // question 12

            const q12 = rowData['Q12 How often do you eat out of the house (such as in Resturant , party, family function, wedding etc )?'];
            const q12ZCoor = 300;

            const q12Map = {
                'More than 3 times a week': [2950, q12ZCoor],
                'More than once a week': [3400, q12ZCoor],  // x 3400
                '2 times in a month': [3800, q12ZCoor],
                '1 time in a month': [4250, q12ZCoor],
                'Less than 1 time in a month': [4680, q12ZCoor],
            };

            [x, y] = q12Map[q12];
            if (x && y) {
                page2.drawImage(tickImage, {
                    x: x,
                    y: y,
                    width: tickWidth,
                    height: tickheight,
                });
            }


            //Question 13 

            const q13 = rowData['Q13 How many days do you exercise in a week?'];
            const q13ZCoor = 2150;

            const q13Map = {
                'Daily': [3720, q13ZCoor],
                '5 to 6 times a week': [4000, q13ZCoor],
                '3 to 4 times a week': [4300, q13ZCoor],
                '1 to 2 times a week': [4590, q13ZCoor], // 4590
                'Never': [4830, q13ZCoor],
            };

            [x, y] = q13Map[q13];
            if (x && y) {
                page2.drawImage(tickImage, {
                    x: x,
                    y: y,
                    width: tickWidth,
                    height: tickheight,
                });
            }

            //Question 14
            const q14 = rowData['Q14 How much time do you exercise for each session?'];
            const q14ZCoor = 1500;

            const q14Map = {
                '>40 minutes': [3720, q14ZCoor],
                '30–40 minutes': [4000, q14ZCoor],
                '20–30 minutes': [4300, q14ZCoor],
                '10–20 minutes': [4590, q14ZCoor],
                '< 10 minutes': [4830, q14ZCoor], // x 3020
            };

            [x, y] = q14Map[q14];
            if (x && y) {
                page2.drawImage(tickImage, {
                    x: x,
                    y: y,
                    width: tickWidth,
                    height: tickheight,
                });
            }





            //end


            const modifiedPdfBytes = await pdfDoc.save();
            fs.writeFileSync(`step3/output/sl_${slNumberToFind}_forDtcn.pdf`, modifiedPdfBytes);

            currentFileName = `step3/output/sl_${slNumberToFind}_forDtcn.pdf`

            console.log(`step3 Success`);

            callback();
        });
}


async function renameFile() {


    fs.rename(currentFileName, newFileName, (err) => {
        if (err) {
            console.error('Error renaming file:', err);
            return;
        }
        console.log('File renamed successfully!');
    });
}




// File names in data folder and templates folder 
let currentFileName = '';
let newFileName = '';


const step1CSV = 'step1.csv';
const step2CSV = 'step2.csv'
const step3CSV = 'step3.csv'
const templateName = 'NHL_P_Intel_w_Question.pdf'
 
// Generate from specific row


function mainFunction(sl_number) {
    mergePdfWithSingleRow(sl_number, () => {
        generatePdfFromSlNumber(sl_number, () => {
            step3(sl_number, () => {
                renameFile();
            });
        });
    });
}




let sl_number = 19;                                   /// start here
sl_number = sl_number.toString();
mainFunction(sl_number);
// step3(sl_number);



