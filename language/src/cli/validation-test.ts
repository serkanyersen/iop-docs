import { EmptyFileSystem } from 'langium';
import { createIopServices } from '../language/iop-module.js';
import * as fs from 'fs';
import * as path from 'path';
import { URI } from 'langium';

async function main() {
    const { shared, Iop } = createIopServices(EmptyFileSystem);

    // Command line arg
    const fileName = process.argv[2];
    if (!fileName) {
        console.error('Usage: node validation-test.js <file.intent>');
        process.exit(1);
    }

    const filePath = path.resolve(fileName);
    const content = fs.readFileSync(filePath, 'utf-8');

    const document = Iop.shared.workspace.LangiumDocumentFactory.fromString(content, URI.file(filePath));
    console.log('Document ID:', document.textDocument.uri);
    console.log('Language ID:', document.textDocument.languageId);

    await Iop.shared.workspace.DocumentBuilder.build([document]);

    const diagnostics = document.diagnostics;

    if (diagnostics && diagnostics.length > 0) {
        console.log('Validation Diagnostics:');
        diagnostics.forEach(d => console.log(`[${d.severity}] ${d.message} (Line: ${d.range.start.line + 1})`));
        if (diagnostics.some(d => d.severity === 1)) {
             process.exit(1); // Error found
        }
    } else {
        console.log('No validation errors found.');
    }
}

main().catch(err => console.error(err));
