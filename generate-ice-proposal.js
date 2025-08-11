const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function generateICEProposalPDF() {
  let browser = null;
  let page = null;
  
  try {
    console.log('📄 Starting ICE Proposal PDF generation...');
    
    // Check if HTML file exists
    const htmlPath = path.join(__dirname, 'propuestaICE.html');
    console.log(`📖 Loading HTML from: ${htmlPath}`);
    
    if (!fs.existsSync(htmlPath)) {
      throw new Error(`HTML file not found: ${htmlPath}`);
    }
    
    // Read the HTML content
    const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
    console.log(`✅ Loaded HTML content (${Math.round(htmlContent.length / 1024)} KB)`);
    
    // Launch Puppeteer
    console.log('🔧 Launching browser...');
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ],
      executablePath: '/usr/bin/google-chrome',
      timeout: 60000
    });
    
    console.log('🌐 Creating new page...');
    page = await browser.newPage();
    
    // Set viewport for consistent rendering
    await page.setViewport({ width: 1240, height: 1754 });
    
    // Load the HTML content
    console.log('📝 Loading HTML content into page...');
    await page.setContent(htmlContent, {
      waitUntil: ['networkidle0', 'domcontentloaded'],
      timeout: 60000
    });
    
    // PDF generation options
    const pdfOptions = {
      format: 'A4',
      printBackground: true,
      margin: {
        top: '1cm',
        right: '1cm',
        bottom: '1cm',
        left: '1cm'
      },
      preferCSSPageSize: true
    };
    
    console.log('🎯 Generating PDF...');
    const pdfBuffer = await page.pdf(pdfOptions);
    
    // Save PDF with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const outputPath = path.join(__dirname, `Propuesta-ICE-Colombia-APEX-${timestamp}.pdf`);
    
    fs.writeFileSync(outputPath, pdfBuffer);
    
    console.log('🎉 ICE Proposal PDF generated successfully!');
    console.log(`📍 Location: ${outputPath}`);
    console.log(`📊 Size: ${Math.round(pdfBuffer.length / 1024)} KB`);
    
    // Also create a version without timestamp for easy access
    const simpleOutputPath = path.join(__dirname, 'Propuesta-ICE-Colombia-APEX.pdf');
    fs.writeFileSync(simpleOutputPath, pdfBuffer);
    console.log(`📄 Also saved as: ${simpleOutputPath}`);
    
  } catch (error) {
    console.error('❌ Error generating ICE proposal PDF:', error.message);
    process.exit(1);
  } finally {
    // Clean up
    if (page) {
      console.log('🔄 Closing page...');
      await page.close();
    }
    if (browser) {
      console.log('🔒 Closing browser...');
      await browser.close();
    }
  }
}

// Run the generator
console.log('🚀 ICE Proposal PDF Generator v1.0');
console.log('=====================================');
generateICEProposalPDF();
