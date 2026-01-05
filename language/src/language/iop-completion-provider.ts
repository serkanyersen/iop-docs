import { DefaultCompletionProvider, type CompletionContext, type NextFeature, type CompletionAcceptor, type CompletionValueItem } from 'langium/lsp';
import { type AstNode, type MaybePromise } from 'langium';
import { CompletionItemKind } from 'vscode-languageserver';
import { isBlock, isFile } from '../generated/ast.js';

export class IopCompletionProvider extends DefaultCompletionProvider {

    protected override completionFor(context: CompletionContext, next: NextFeature, acceptor: CompletionAcceptor): MaybePromise<void> {
        const node = context.node;
        if (!node) return;

        // If we are completing a Block type (the 'type' property of Block)
        if (next.property === 'type' && next.type === 'Block') {
            this.completeBlockType(context, node, acceptor);
        } else if (next.property === 'name' && next.type === 'Attribute') {
             this.completeAttributeName(context, node, acceptor);
        }

        return super.completionFor(context, next, acceptor);
    }

    private completeBlockType(context: CompletionContext, node: AstNode, acceptor: CompletionAcceptor) {
        // If parent is File (root), suggest 'intent'
        if (isFile(node) || isFile(node.$container)) {
             acceptor(context, { label: 'intent', kind: CompletionItemKind.Keyword, detail: 'Define a new Intent' });
             return;
        }

        const container = node.$container;
        if (isBlock(container)) {
            if (container.type === 'intent') {
                acceptor(context, { label: 'block', kind: CompletionItemKind.Keyword, detail: 'Define a functional block' });
                acceptor(context, { label: 'description', kind: CompletionItemKind.Keyword, detail: 'Description block' }); // Although usually an attribute
            } else if (container.type === 'block') {
                 acceptor(context, { label: 'interface', kind: CompletionItemKind.Keyword, detail: 'Define block interface' });
                 acceptor(context, { label: 'acceptance', kind: CompletionItemKind.Keyword, detail: 'Define acceptance criteria' });
                 acceptor(context, { label: 'constraint', kind: CompletionItemKind.Keyword, detail: 'Define constraints' });
            } else if (container.type === 'interface') {
                 acceptor(context, { label: 'method', kind: CompletionItemKind.Keyword, detail: 'Define a method signature' });
            }
        }
    }

    private completeAttributeName(context: CompletionContext, node: AstNode, acceptor: CompletionAcceptor) {
        const container = node.$container; // The Block containing this attribute
        if (isBlock(container)) {
             if (container.type === 'intent') {
                 acceptor(context, { label: 'id', kind: CompletionItemKind.Property });
                 acceptor(context, { label: 'depends_on', kind: CompletionItemKind.Property });
                 acceptor(context, { label: 'description', kind: CompletionItemKind.Property });
             } else if (container.type === 'block') {
                 acceptor(context, { label: 'prompt', kind: CompletionItemKind.Property });
                 acceptor(context, { label: 'lifecycle', kind: CompletionItemKind.Property });
             } else if (container.type === 'acceptance') {
                 acceptor(context, { label: 'criteria', kind: CompletionItemKind.Property });
             }
        }
    }
}
