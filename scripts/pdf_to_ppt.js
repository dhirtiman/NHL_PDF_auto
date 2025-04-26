
// Paths


const { fromPath } = require("pdf2pic");
const PptxGenJS = require("pptxgenjs");
const fs = require("fs");
const path = require("path");

// Paths
const pdfPath = "./pdf_ppt/input/modules.pdf"; // Your PDF file path
const outputFolder = "./pdf_ppt/output"; // Temp folder for images

// pdf2pic options
const options = {
  density: 150,            // 300 is high quality but can crash if memory is low
  saveFilename: "slide",
  savePath: outputFolder,
  format: "png",
  width: 1280,
  height: 720,
};

async function convertPdfToPpt() {
  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder);
  }

  const convert = fromPath(pdfPath, options);

  // Convert PDF pages to images
  let pages;
  try {
    pages = await convert.bulk(-1, true); // -1 = all pages
  } catch (err) {
    console.error("Failed to convert PDF pages:", err);
    return;
  }

  console.log(`✅ Converted ${pages.length} pages.`);

  // Create a PPT
  let pptx = new PptxGenJS();

  for (const page of pages) {
    let slide = pptx.addSlide();

    // Ensure the path exists
    const imgPath = path.resolve(page.path);

    if (fs.existsSync(imgPath)) {
      slide.addImage({ path: imgPath, x: 0, y: 0, w: "100%", h: "100%" });
    } else {
      console.error(`❌ Image not found: ${imgPath}`);
    }
  }

  // Save the PPT
  try {
    await pptx.writeFile({ fileName: "output-presentation.pptx" });
    console.log("🎉 Presentation created successfully!");
  } catch (err) {
    console.error("Error saving PPTX:", err);
  }
}

convertPdfToPpt();
