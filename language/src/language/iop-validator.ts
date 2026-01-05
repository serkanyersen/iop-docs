import { ValidationAcceptor, ValidationChecks } from 'langium';
import { IopAstType, Block, isBlock, File } from '../generated/ast.js';
import type { IopServices } from './iop-module.js';

export class IopValidator {

    checkFileStructure(file: File, accept: ValidationAcceptor): void {
        console.log('Checking file structure...');
        console.log('Elements:', file.elements.length);
        for (const element of file.elements) {
            if (isBlock(element)) {
                console.log('Block type:', element.type);
                if (element.type !== 'intent') {
                    console.log('Error found!');
                    accept('error', "Top-level blocks must be of type 'intent'.", { node: element, property: 'type' });
                }
            } else {
                 accept('error', "Attributes are not allowed at the top level.", { node: element, property: 'name' });
            }
        }
    }

    checkBlockNesting(block: Block, accept: ValidationAcceptor): void {
        console.log('Checking block nesting:', block.type);
        if (block.type === 'intent') {
             // Logic
        }
    }
}

export function registerValidationChecks(services: IopServices) {
    console.log('Registering validation checks...');
    const registry = services.validation.ValidationRegistry;
    const validator = new IopValidator();
    const checks: ValidationChecks<IopAstType> = {
        File: validator.checkFileStructure.bind(validator),
        Block: validator.checkBlockNesting.bind(validator)
    };
    registry.register(checks, validator);
}
