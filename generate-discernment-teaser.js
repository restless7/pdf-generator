const puppeteer = require('puppeteer');
const Handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

async function generateDiscernmentTeaser() {
  let browser = null;
  let page = null;

  try {
    console.log('🚀 Starting Information Discernment Teaser PDF generation...');

    const templatePath = path.join(__dirname, 'information-discernment-teaser.html');
    const dataPath = path.join(__dirname, 'information-discernment-teaser-data.json');

    if (!fs.existsSync(templatePath)) throw new Error(`Template not found: ${templatePath}`);
    if (!fs.existsSync(dataPath)) throw new Error(`Data not found: ${dataPath}`);

    console.log('📖 Loading template & data...');
    const templateSource = fs.readFileSync(templatePath, 'utf-8');
    const template = Handlebars.compile(templateSource);
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    console.log('⚡ Compiling template...');
    const finalHtml = template(data);

    // Debug HTML
    const debugPath = path.join(__dirname, 'debug-discernment-teaser.html');
    fs.writeFileSync(debugPath, finalHtml);
    console.log(`🔍 Debug HTML saved: ${debugPath}`);

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
        '--disable-gpu'
      ],
      timeout: 60000
    });

    page = await browser.newPage();
    await page.setViewport({ width: 1240, height: 1754 });

    console.log('📝 Loading content...');
    await page.setContent(finalHtml, {
      waitUntil: ['networkidle0', 'domcontentloaded'],
      timeout: 60000
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    const pdfOptions = {
      format: 'A4',
      printBackground: true,
      margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
      preferCSSPageSize: true,
      displayHeaderFooter: false
    };

    console.log('🎯 Generating PDF...');
    const pdfBuffer = await page.pdf(pdfOptions);

    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const outputPath = path.join(__dirname, `Information-Discernment-Teaser-${timestamp}.pdf`);
    const simplePath = path.join(__dirname, 'Information-Discernment-Teaser.pdf');

    fs.writeFileSync(outputPath, pdfBuffer);
    fs.writeFileSync(simplePath, pdfBuffer);

    console.log('🎉 Teaser PDF generated successfully!');
    console.log(`📍 Timestamped: ${outputPath}`);
    console.log(`📄 Simple: ${simplePath}`);
    console.log(`📊 Size: ${Math.round(pdfBuffer.length / 1024)} KB`);

    // Copy to apex-website public downloads
    const publicDir = path.join(__dirname, '..', 'apex-website', 'public', 'downloads');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    const publicPath = path.join(publicDir, 'Information-Discernment-Teaser.pdf');
    fs.writeFileSync(publicPath, pdfBuffer);
    console.log(`📦 Copied to apex-website: ${publicPath}`);

    return { success: true, outputPath, simplePath, size: pdfBuffer.length };

  } catch (error) {
    console.error('❌ Error:', error.message);
    return { success: false, error: error.message };
  } finally {
    if (page) await page.close();
    if (browser) await browser.close();
  }
}

// Run
generateDiscernmentTeaser().then(result => {
  if (result.success) {
    console.log('🏁 Done!');
    process.exit(0);
  } else {
    console.error('💥 Failed.');
    process.exit(1);
  }
});
