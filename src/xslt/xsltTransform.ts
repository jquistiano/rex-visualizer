import {window, workspace} from "vscode";
import { run } from "mocha";
import {Runner} from "./xsltRunner";
import * as path from 'path';

export interface XSLTTransformation {
    xml: string;
    xslt: string;
    processor: string;
}

export  function runXSLTTransformation(xml: string) {
    let configuration = workspace.getConfiguration("xslt");
    let processor = configuration.get<string>("processor");
    let xslt = configuration.get<string>("stylesheet");

    console.log(processor);
    console.log(xslt);

    if (processor === undefined) {
        window.showErrorMessage("No xslt processor configured");
        return '';
    }

    if (xml === undefined) {
        window.showErrorMessage("No valid xml file opened");
        return '';
    }

    if (xslt === undefined) {
        window.showErrorMessage("No valid xslt file");
        return '';
    }

    const xsltTransformation: XSLTTransformation = {
        xml: xml,
        xslt: xslt,
        processor: processor
    };

    let cmd = getXSLTTransformCommand(xsltTransformation);
    console.log(cmd);
    let cwd: string | undefined;
    if (workspace.workspaceFolders) {
        cwd = path.join(workspace.workspaceFolders[0].uri.fsPath);
    }
    let commandRunner: Runner = new Runner();
    let htmlFormated:string | undefined;
    commandRunner.runXSLTTtransformationCommand(cmd, xsltTransformation.xml, cwd);
    
    htmlFormated = commandRunner.getHtmlFormated();
    if (htmlFormated != '') {
        //xsl will reinterprete the '&' in the '&amp;' and in other HTML entities. For EDIFACT an '&' indicates the EOL
        htmlFormated = htmlFormated.replace(/&amp;lt;/g, "<").replace(/&amp;gt;/g, ">").replace(/&amp;amp;/g, "&amp;.<br/>");
        htmlFormated = htmlFormated.replace(/&amp;quot;/g, '"').replace(/&amp;apos;/g, "'");
    }
    
    return htmlFormated;
}

function getXSLTTransformCommand(transformation: XSLTTransformation): string {
    return [
        "java",
        "-jar",
        transformation.processor,
        `-s:${transformation.xml}`,
        `-xsl:${transformation.xslt}`
    ].join(" ");
}