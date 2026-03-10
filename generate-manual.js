const { EnhancedPDFGenerator } = require('./dist/index');
const fs = require('fs');
const path = require('path');

async function main() {
    const generator = new EnhancedPDFGenerator();
    try {
        console.log('Initializing generator...');
        await generator.initialize();

        console.log('Generating ICE Operations Manual...');
        const dataPath = path.join(__dirname, 'ice-operations-manual-data.json');
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

        const outputPath = path.join(__dirname, `ICE-Operations-Manual-FINAL-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.pdf`);

        console.log('Starting PDF generation...');
        const job = await generator.generatePDF({
            templateId: 'ice-operations-manual',
            data: data,
            outputPath: outputPath
        });

        console.log('Job submitted. ID:', job.id);

        let currentJob = job;
        while (currentJob.status === 'pending' || currentJob.status === 'processing') {
            await new Promise(resolve => setTimeout(resolve, 1000));
            currentJob = await generator.getJob(job.id);
            process.stdout.write('.');
        }
        console.log('\nJob finished with status:', currentJob.status);

        if (currentJob.status === 'completed') {
            console.log('PDF Generated Successfully at:', currentJob.result?.pdfPath || outputPath);
        } else {
            console.log('Job failed.');
            if (currentJob.error) console.error('Job Error:', currentJob.error);
        }

    } catch (error) {
        console.error('Error generating PDF:', error);
    }
}

main();
