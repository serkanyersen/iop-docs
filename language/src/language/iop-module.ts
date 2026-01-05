import { type Module, inject } from 'langium';
import { type DefaultSharedModuleContext, createDefaultModule, createDefaultSharedModule } from 'langium/lsp';
import { type LangiumServices, type LangiumSharedServices, type PartialLangiumServices } from 'langium/lsp';
import { IopGeneratedModule, IopGeneratedSharedModule } from '../generated/module.js';

export type IopServices = LangiumServices;
export type IopSharedServices = LangiumSharedServices;

import { IopSemanticTokenProvider } from './iop-semantic-token-provider.js';

import { registerValidationChecks } from './iop-validator.js';
import { IopCompletionProvider } from './iop-completion-provider.js';

export const IopModule: Module<IopServices, PartialLangiumServices> = {
    lsp: {
        SemanticTokenProvider: (services) => new IopSemanticTokenProvider(services),
        CompletionProvider: (services) => new IopCompletionProvider(services)
    }
};

export function createIopServices(context: DefaultSharedModuleContext): {
    shared: LangiumSharedServices,
    Iop: IopServices
} {
    const shared = inject(
        createDefaultSharedModule(context),
        IopGeneratedSharedModule
    );
    const Iop = inject(
        createDefaultModule({ shared }),
        IopGeneratedModule,
        IopModule
    );
    shared.ServiceRegistry.register(Iop);
    registerValidationChecks(Iop);
    return { shared, Iop };
}
