import * as path from 'path';
import * as vscode from 'vscode';
import {xsltOutputChannel} from "./xslt/xsltOutputChannel";

import { runXSLTTransformation } from './xslt/xsltTransform';

export function activate(context: vscode.ExtensionContext) {
	console.log("Rex-visualizer has been activated");
	xsltOutputChannel.clear();
	xsltOutputChannel.show();
	xsltOutputChannel.append("Rex-visualizer has been activated");
    context.subscriptions.push(
		vscode.workspace.onDidOpenTextDocument((d)=>{
			const ext = path.extname(d.fileName);
			if (ext == '.rex'){
				TTSPanel.create(context.extensionPath, d);
			}
		})
	);
}

/**
 * Manages the TTS panels
 */
class TTSPanel {
   
   	public static currentPanel: TTSPanel | undefined;

	private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionPath: string;
	private _disposables: vscode.Disposable[] = [];
	private readonly _textDocument: vscode.TextDocument;
	public static readonly viewType = 'rexViewer';

	private constructor(panel: vscode.WebviewPanel, extensionPath: string, textDocument: vscode.TextDocument) {
		this._panel = panel;
		this._extensionPath = extensionPath;
		this._textDocument = textDocument;
		this._setHtml();

		// Listen for when the panel is disposed
		// This happens when the user closes the panel or when the panel is closed programatically
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
	}

	private _setHtml() {
      	this._panel.webview.html = runXSLTTransformation(this._textDocument.fileName);
	}

	public static create(extensionPath: string, textDocument: vscode.TextDocument) {
		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

		const panel = vscode.window.createWebviewPanel(
			TTSPanel.viewType,
			path.basename(textDocument.fileName),
			column || vscode.ViewColumn.One,
			{
				// Dont need to enable javascript in the webview
				enableScripts: false,

				// And restrict the webview to only loading content from our extension's `media` directory.
				localResourceRoots: [vscode.Uri.file(path.join(extensionPath, 'media'))]
			}
		);

		TTSPanel.currentPanel = new TTSPanel(panel, extensionPath, textDocument);
	}

	public dispose() {
		TTSPanel.currentPanel = undefined;

		// Clean up our resources
		this._panel.dispose();

		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}
}