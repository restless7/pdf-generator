const { EnhancedPDFGenerator } = require('./dist/index');
const fs = require('fs');
const path = require('path');

async function main() {
    const generator = new EnhancedPDFGenerator();
    try {
        console.log('Initializing PDF generator...');
        await generator.initialize();

        // ── Document 1: Investor Pitch Script ─────────────────────────────
        console.log('\n📄 Generating ICE Investor Pitch Script...');
        const pitchData = JSON.parse(fs.readFileSync(path.join(__dirname, 'ice-investor-pitch-data.json'), 'utf8'));
        const pitchOutput = path.join(__dirname, `ICE-Investor-Pitch-Script-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.pdf`);

        const pitchJob = await generator.generatePDF({
            templateId: 'operations-manual',
            data: pitchData,
            outputPath: pitchOutput
        });

        console.log('Pitch Job ID:', pitchJob.id);
        let currentPitchJob = pitchJob;
        while (currentPitchJob.status === 'pending' || currentPitchJob.status === 'processing') {
            await new Promise(resolve => setTimeout(resolve, 1000));
            currentPitchJob = await generator.getJob(pitchJob.id);
            process.stdout.write('.');
        }
        console.log('\nPitch PDF Status:', currentPitchJob.status);
        if (currentPitchJob.status === 'completed') {
            console.log('✅ Pitch PDF:', currentPitchJob.result?.pdfPath || pitchOutput);
        } else {
            console.error('❌ Pitch failed:', currentPitchJob.error);
        }

        // ── Document 2: Software Modules Catalog ──────────────────────────
        console.log('\n📄 Generating ICE Software Modules Catalog...');
        const modulesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'ice-software-modules-data.json'), 'utf8'));
        const modulesOutput = path.join(__dirname, `ICE-Software-Modules-Catalog-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.pdf`);

        const modulesJob = await generator.generatePDF({
            templateId: 'operations-manual',
            data: modulesData,
            outputPath: modulesOutput
        });

        console.log('Modules Job ID:', modulesJob.id);
        let currentModulesJob = modulesJob;
        while (currentModulesJob.status === 'pending' || currentModulesJob.status === 'processing') {
            await new Promise(resolve => setTimeout(resolve, 1000));
            currentModulesJob = await generator.getJob(modulesJob.id);
            process.stdout.write('.');
        }
        console.log('\nModules PDF Status:', currentModulesJob.status);
        if (currentModulesJob.status === 'completed') {
            console.log('✅ Modules PDF:', currentModulesJob.result?.pdfPath || modulesOutput);
        } else {
            console.error('❌ Modules failed:', currentModulesJob.error);
        }

        console.log('\n🎉 Generation complete!');
    } catch (error) {
        console.error('Error generating PDFs:', error);
    }
}

main();
