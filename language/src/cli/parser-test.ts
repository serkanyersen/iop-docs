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
        console.error('Usage: node parser-test.js <file.intent>');
        process.exit(1);
    }

    const filePath = path.resolve(fileName);
    const content = fs.readFileSync(filePath, 'utf-8');

    const document = Iop.shared.workspace.LangiumDocumentFactory.fromString(content, URI.file(filePath));
    await Iop.shared.workspace.DocumentBuilder.build([document]);

    const parseResult = document.parseResult;

    if (parseResult.lexerErrors.length > 0) {
        console.error('Lexer Errors:');
        parseResult.lexerErrors.forEach((e: any) => console.error(e));
        process.exit(1);
    }

    if (parseResult.parserErrors.length > 0) {
        console.error('Parser Errors:');
        parseResult.parserErrors.forEach((e: any) => console.error(e));
        process.exit(1);
    }

    console.log('Successfully parsed!');
    console.log('Root Element Type:', parseResult.value.$type);
    // Simple traversal to show blocks
    const file = parseResult.value as any;
    console.log('Top-level elements:', file.elements.length);
    file.elements.forEach((el: any) => {
        if (el.$type === 'Block') {
             console.log(`- Block: ${el.type} [${el.labels.join(', ')}]`);
        }
    });
}

main().catch(err => console.error(err));
