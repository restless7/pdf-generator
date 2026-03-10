/**
 * ICE Operations Manual PDF Generator Script
 * 
 * This script generates a PDF from the ICE Operations Manual data.
 * 
 * Usage:
 *   npm run build && node dist/generate-operations-manual.js
 *   OR (with ts-node)
 *   npx ts-node src/generate-operations-manual.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import Handlebars from 'handlebars';
import puppeteer from 'puppeteer';

async function generateOperationsManualPDF() {
    console.log('🚀 Starting ICE Operations Manual PDF generation...');

    // 1. Load the JSON data
    const dataPath = path.join(__dirname, '..', 'ice-operations-manual-data.json');
    const jsonData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    console.log('✅ Loaded JSON data:', jsonData.documentTitle);

    // 2. Load the Handlebars template
    const templatePath = path.join(__dirname, 'templates', 'ice-operations-manual.hbs');
    const templateSource = fs.readFileSync(templatePath, 'utf-8');
    console.log('✅ Loaded Handlebars template');

    // 3. Register Handlebars helpers
    Handlebars.registerHelper('default', function (value: any, defaultValue: any) {
        return value || defaultValue;
    });

    // 4. Compile and render template
    const template = Handlebars.compile(templateSource);
    const html = template(jsonData);
    console.log('✅ Rendered HTML from template');

    // 5. Save debug HTML for inspection
    const debugHtmlPath = path.join(__dirname, '..', 'debug-operations-manual.html');
    fs.writeFileSync(debugHtmlPath, html);
    console.log(`✅ Debug HTML saved to: ${debugHtmlPath}`);

    // 6. Launch Puppeteer and generate PDF
    console.log('🔧 Launching Puppeteer...');
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
        ],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // 7. Generate PDF with options
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const pdfFilename = `ICE-Operations-Manual-${timestamp}.pdf`;
    const pdfPath = path.join(__dirname, '..', pdfFilename);

    await page.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true,
        margin: {
            top: '1.5cm',
            right: '1.5cm',
            bottom: '1.5cm',
            left: '1.5cm',
        },
        displayHeaderFooter: false,
    });

    await browser.close();

    console.log('');
    console.log('========================================');
    console.log('✅ PDF GENERATED SUCCESSFULLY!');
    console.log(`📄 Output: ${pdfPath}`);
    console.log('========================================');

    return pdfPath;
}

// Run if called directly
generateOperationsManualPDF().catch(console.error);
