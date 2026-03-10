
import fs from 'fs';
import path from 'path';

async function generateProposal() {
    try {
        const payloadPath = path.join(__dirname, 'catador-proposal.json');
        const payload = JSON.parse(fs.readFileSync(payloadPath, 'utf-8'));

        console.log('Sending request to PDF Generator...');
        const response = await fetch('http://localhost:4000/api/pdf/generate-template', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        // The endpoint returns metadata with a job ID, or buffer if returnBuffer is true?
        // Wait, check server.ts: generate-template returns mocked metadata currently because it says "For now, redirect to the existing generate-sync endpoint... In a full implementation...". 
        // Actually server.ts says: "This would be handled by the pdf-routes, but for compatibility: res.status(202).json({...})"
        // It seems `generate-template` is MOCKED in server.ts line 239.

        // I should use `generate-sync` instead if I want the actual PDF buffer?
        // Let's check `api/pdf-routes` if possible, but server.ts says it MOUNTS `pdfRoutes` at `/api/pdf`.
        // And `generate-template` is defined explicitly in `server.ts` line 239.

        // Wait, if `generate-template` is mocked in `server.ts`, it won't generate a PDF.
        // I need to use the REAL endpoint matching `pdfRoutes`.
        // `server.ts` line 95: `app.use('/api/pdf', pdfRoutes);`

        // Let's try to call `/api/pdf/generate-sync` directly with the same payload (it expects `templateId` and `data`).

        console.log('Trying /api/pdf/generate-sync...');
        const syncResponse = await fetch('http://localhost:4000/api/pdf/generate-sync', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload) // format might need adjustment
        });

        if (syncResponse.ok) {
            const contentType = syncResponse.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const jsonResponse = await syncResponse.json();
                if (jsonResponse.success && jsonResponse.result && jsonResponse.result.pdfPath) {
                    const sourcePath = jsonResponse.result.pdfPath;
                    const outputPath = path.join(__dirname, 'propuesta-cafe-catador.pdf');

                    // Copy file from source to dest
                    fs.copyFileSync(sourcePath, outputPath);
                    console.log(`✅ PDF copied successfully from ${sourcePath} to ${outputPath}`);
                } else {
                    console.error('JSON response did not contain pdfPath:', jsonResponse);
                }
            } else {
                const buffer = await syncResponse.arrayBuffer();
                const outputPath = path.join(__dirname, 'propuesta-cafe-catador.pdf');
                fs.writeFileSync(outputPath, Buffer.from(buffer));
                console.log(`✅ PDF generated successfully: ${outputPath}`);
            }
        } else {
            console.error('Failed to generate PDF via sync endpoint:', await syncResponse.text());
        }
    } catch (error) {
        console.error('Error generating proposal:', error);
    }
}

generateProposal();
