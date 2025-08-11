const { PDFGenerator } = require('./dist/generators/PDFGenerator');
const fs = require('fs');
const path = require('path');

async function generatePortfolioPDF() {
  try {
    console.log('📄 Starting Portfolio PDF generation...');
    
    // Load portfolio data
    const dataPath = path.join(__dirname, 'portfolio-data.json');
    console.log(`📖 Loading data from: ${dataPath}`);
    
    if (!fs.existsSync(dataPath)) {
      throw new Error(`Data file not found: ${dataPath}`);
    }
    
    const portfolioData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    console.log(`✅ Loaded portfolio data with ${portfolioData.services.length} services`);
    
    // Initialize PDF generator
    const pdfGenerator = new PDFGenerator();
    
    // PDF options for professional output
    const pdfOptions = {
      format: 'A4',
      printBackground: true,
      margin: {
        top: '1.5cm',
        right: '1.5cm', 
        bottom: '1.5cm',
        left: '1.5cm'
      }
    };
    
    console.log('🔧 Generating PDF with portfolio template...');
    
    // Generate PDF
    const pdfBuffer = await pdfGenerator.generatePDF('portfolio', portfolioData, pdfOptions);
    
    // Save PDF
    const outputPath = path.join(__dirname, 'APEX-Digital-Services-Portfolio.pdf');
    fs.writeFileSync(outputPath, pdfBuffer);
    
    console.log(`🎉 Portfolio PDF generated successfully!`);
    console.log(`📍 Location: ${outputPath}`);
    console.log(`📊 Size: ${Math.round(pdfBuffer.length / 1024)} KB`);
    
    // Close browser
    await pdfGenerator.closeBrowser();
    console.log('🔒 Browser closed successfully');
    
  } catch (error) {
    console.error('❌ Error generating portfolio PDF:', error.message);
    process.exit(1);
  }
}

// Run the generator
generatePortfolioPDF();
