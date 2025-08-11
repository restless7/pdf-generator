const puppeteer = require('puppeteer');
const Handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

async function generateOptimizedProposal(templateFile = 'propuesta-optimizada.html', dataFile = 'ice-colombia-data.json', outputPrefix = 'Propuesta-Optimizada') {
  let browser = null;
  let page = null;
  
  try {
    console.log('🚀 Iniciando generación de propuesta optimizada...');
    console.log(`📋 Template: ${templateFile}`);
    console.log(`📊 Data: ${dataFile}`);
    
    // Paths
    const templatePath = path.join(__dirname, templateFile);
    const dataPath = path.join(__dirname, dataFile);
    const logoPath = path.join(__dirname, 'logominimalapex.png');
    
    // Verificar archivos
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template no encontrado: ${templatePath}`);
    }
    if (!fs.existsSync(dataPath)) {
      throw new Error(`Archivo de datos no encontrado: ${dataPath}`);
    }
    if (!fs.existsSync(logoPath)) {
      throw new Error(`Logo no encontrado: ${logoPath}`);
    }
    
    // Cargar template
    console.log('📖 Cargando template HTML...');
    const templateSource = fs.readFileSync(templatePath, 'utf-8');
    const template = Handlebars.compile(templateSource);
    
    // Cargar datos
    console.log('📊 Cargando datos JSON...');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    
    // Procesar logo
    console.log('🖼️ Procesando logo...');
    const logoBase64 = fs.readFileSync(logoPath).toString('base64');
    data.logoDataUri = `data:image/png;base64,${logoBase64}`;
    
    // Generar HTML final
    console.log('⚡ Compilando template con datos...');
    const finalHtml = template(data);
    
    // Debug: guardar HTML generado para revisión
    const debugHtmlPath = path.join(__dirname, 'debug-generated.html');
    fs.writeFileSync(debugHtmlPath, finalHtml);
    console.log(`🔍 HTML debug guardado en: ${debugHtmlPath}`);
    
    // Inicializar Puppeteer
    console.log('🔧 Iniciando navegador...');
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
    
    console.log('🌐 Creando nueva página...');
    page = await browser.newPage();
    
    // Configurar viewport para documentos A4
    await page.setViewport({ width: 1240, height: 1754 });
    
    // Cargar contenido
    console.log('📝 Cargando contenido en la página...');
    await page.setContent(finalHtml, {
      waitUntil: ['networkidle0', 'domcontentloaded'],
      timeout: 60000
    });
    
    // Esperar un poco para que se renderice todo
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Configuración del PDF optimizada para saltos de página
    const pdfOptions = {
      format: 'A4',
      printBackground: true,
      margin: {
        top: '15mm',
        right: '15mm',
        bottom: '15mm',
        left: '15mm'
      },
      preferCSSPageSize: true,
      displayHeaderFooter: false,
      // Importante: permitir saltos de página naturales
      pageRanges: ''
    };
    
    console.log('🎯 Generando PDF...');
    const pdfBuffer = await page.pdf(pdfOptions);
    
    // Generar nombre de archivo con timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const outputPath = path.join(__dirname, `${outputPrefix}-${timestamp}.pdf`);
    const simpleOutputPath = path.join(__dirname, `${outputPrefix}.pdf`);
    
    // Guardar PDFs
    fs.writeFileSync(outputPath, pdfBuffer);
    fs.writeFileSync(simpleOutputPath, pdfBuffer);
    
    console.log('🎉 Propuesta optimizada generada exitosamente!');
    console.log(`📍 Archivo timestamped: ${outputPath}`);
    console.log(`📄 Archivo simple: ${simpleOutputPath}`);
    console.log(`📊 Tamaño: ${Math.round(pdfBuffer.length / 1024)} KB`);
    
    // Información adicional
    const pageCount = await page.evaluate(() => {
      // Contar divs con clase 'page'
      return document.querySelectorAll('.page').length;
    });
    
    console.log(`📑 Páginas generadas: ${pageCount}`);
    console.log('✅ Proceso completado exitosamente');
    
    return {
      success: true,
      outputPath,
      simpleOutputPath,
      size: pdfBuffer.length,
      pages: pageCount
    };
    
  } catch (error) {
    console.error('❌ Error generando propuesta:', error.message);
    console.error('🔍 Stack trace:', error.stack);
    return {
      success: false,
      error: error.message
    };
  } finally {
    // Limpieza
    if (page) {
      console.log('🔄 Cerrando página...');
      await page.close();
    }
    if (browser) {
      console.log('🔒 Cerrando navegador...');
      await browser.close();
    }
  }
}

// Registrar helpers de Handlebars útiles
Handlebars.registerHelper('eq', function(a, b) {
  return a === b;
});

Handlebars.registerHelper('gt', function(a, b) {
  return a > b;
});

Handlebars.registerHelper('formatCurrency', function(amount) {
  if (!amount || amount === '--') return amount;
  return new Intl.NumberFormat('es-CO').format(parseInt(amount));
});

// Función principal
async function main() {
  console.log('📋 Generador de Propuestas Optimizadas v2.0');
  console.log('==================================================');
  
  // Permitir parámetros de línea de comandos
  const args = process.argv.slice(2);
  let templateFile = 'propuesta-optimizada.html';
  let dataFile = 'ice-colombia-data.json';
  let outputPrefix = 'Propuesta-Optimizada';
  
  // Parsear argumentos
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--template':
        templateFile = args[++i];
        break;
      case '--data':
        dataFile = args[++i];
        break;
      case '--output':
        outputPrefix = args[++i];
        break;
      case '--help':
        console.log('Uso:');
        console.log('  node generate-optimized-proposal.js [opciones]');
        console.log('');
        console.log('Opciones:');
        console.log('  --template <archivo>    Template HTML (default: propuesta-optimizada.html)');
        console.log('  --data <archivo>        Archivo JSON con datos (default: ice-colombia-data.json)');
        console.log('  --output <prefijo>      Prefijo del archivo de salida (default: Propuesta-Optimizada)');
        console.log('  --help                  Mostrar esta ayuda');
        console.log('');
        console.log('Ejemplos:');
        console.log('  node generate-optimized-proposal.js');
        console.log('  node generate-optimized-proposal.js --data otro-cliente-data.json --output Propuesta-Cliente2');
        process.exit(0);
        break;
    }
  }
  
  const result = await generateOptimizedProposal(templateFile, dataFile, outputPrefix);
  
  if (result.success) {
    console.log('🏁 ¡Listo! Tu propuesta optimizada está lista.');
    process.exit(0);
  } else {
    console.error('💥 Error fatal en la generación.');
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { generateOptimizedProposal };
