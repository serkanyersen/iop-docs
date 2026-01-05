import { AstNode, type AstNodeDescription, type LangiumDocument } from 'langium';
import { AbstractSemanticTokenProvider, type SemanticTokenAcceptor } from 'langium/lsp';
import { Attribute, Block, isAttribute, isBlock } from '../generated/ast.js';
import { SemanticTokenTypes } from 'vscode-languageserver';

export class IopSemanticTokenProvider extends AbstractSemanticTokenProvider {

    protected override highlightElement(node: AstNode, acceptor: SemanticTokenAcceptor): void {
        if (isBlock(node)) {
            this.highlightBlock(node, acceptor);
        } else if (isAttribute(node)) {
            this.highlightAttribute(node, acceptor);
        }
    }

    protected highlightBlock(node: Block, acceptor: SemanticTokenAcceptor): void {
        const keywordTypes = new Set(['intent', 'block', 'constraint', 'interface', 'generator', 'method', 'acceptance']);

        if (keywordTypes.has(node.type)) {
            // Color known block types as Keywords (Control)
            // We use the 'type' property of the Block AST
            acceptor({
                node,
                property: 'type',
                type: SemanticTokenTypes.keyword,
                modifier: ['declaration']
            });
        } else {
            // Other block types (custom) as Classes or Types
            acceptor({
                node,
                property: 'type',
                type: SemanticTokenTypes.type
            });
        }
    }

    protected highlightAttribute(node: Attribute, acceptor: SemanticTokenAcceptor): void {
        acceptor({
            node,
            property: 'name',
            type: SemanticTokenTypes.property
        });
    }
}
