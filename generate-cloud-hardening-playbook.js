const { PDFGenerator } = require('./dist/generators/PDFGenerator');
const fs = require('fs');
const path = require('path');

async function generateCloudHardeningPDF() {
  try {
    console.log('📄 Starting Cloud Hardening Playbook PDF generation...');
    
    // Initialize PDF generator
    const pdfGenerator = new PDFGenerator();
    
    // PDF options for professional output
    const pdfOptions = {
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0cm',
        right: '0cm', 
        bottom: '0cm',
        left: '0cm'
      }
    };
    
    console.log('🔧 Generating PDF with cloud-hardening-playbook template...');
    
    // Generate PDF (passing empty data since template is mostly self-contained HTML)
    const pdfBuffer = await pdfGenerator.generatePDF('cloud-hardening-playbook', {}, pdfOptions);
    
    // Save PDF
    const outputPath = path.join(__dirname, 'Cloud-Hardening-Playbook.pdf');
    fs.writeFileSync(outputPath, pdfBuffer);
    
    console.log(`🎉 Playbook PDF generated successfully!`);
    console.log(`📍 Location: ${outputPath}`);
    console.log(`📊 Size: ${Math.round(pdfBuffer.length / 1024)} KB`);
    
    // Close browser
    await pdfGenerator.closeBrowser();
    console.log('🔒 Browser closed successfully');
    
  } catch (error) {
    console.error('❌ Error generating playbook PDF:', error.message);
    process.exit(1);
  }
}

// Ensure the templates directory exists in dist before running (handle TypeScript build lag)
const srcTemplate = path.join(__dirname, 'src', 'templates', 'cloud-hardening-playbook.hbs');
const distDir = path.join(__dirname, 'dist', 'templates');
const distTemplate = path.join(distDir, 'cloud-hardening-playbook.hbs');

if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}
if (fs.existsSync(srcTemplate)) {
    fs.copyFileSync(srcTemplate, distTemplate);
}

// Run the generator
generateCloudHardeningPDF();
