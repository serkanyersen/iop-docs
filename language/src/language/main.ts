import { startLanguageServer } from 'langium/lsp';
import { createConnection, ProposedFeatures } from 'vscode-languageserver/node.js';
import { createIopServices } from './iop-module.js';
import { NodeFileSystem } from 'langium/node';

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all);

// Inject the shared services and language-specific services
const { shared } = createIopServices({ connection, ...NodeFileSystem });

// Start the language server with the shared services
startLanguageServer(shared as any);
