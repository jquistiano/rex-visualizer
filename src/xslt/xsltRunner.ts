import {ChildProcess, spawn, spawnSync} from "child_process";
import {ViewColumn, window, workspace} from "vscode";
import {xsltOutputChannel} from "./xsltOutputChannel";

export class Runner {

    private _result: string = '';

    public runCommand(command: string, args: string[], data: string, cwd?: string) {
        let process = spawnSync(command, args, {cwd: cwd, shell: true});
        if (process.status == 0) {
            this._result = process.stdout.toString();
        } else {
            xsltOutputChannel.clear();
            xsltOutputChannel.show();
            xsltOutputChannel.append(process.stderr.toString());
        }
    }

    public runXSLTTtransformationCommand(command: string, xml: string, cwd?: string) {
        this.runCommand(command, [], xml, cwd);
    }

    public getHtmlFormated(){
        return this._result;
    }
}
