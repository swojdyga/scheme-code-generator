import NodeCodeGenerator from "../../../abstractions/NodeCodeGenerator/NodeCodeGenerator";
import CodeGenerator from "../../../abstractions/CodeGenerator/CodeGenerator";
import * as fs from "fs";
import * as path from "path";
import {resolve} from "path";
import CodeGeneratorParamsConfig from "../../../abstractions/CodeGeneratorConfig/CodeGeneratorConfig";
import * as ts from "typescript";
import * as tsvfs from "@typescript/vfs";
import ArgsParser from "../../../abstractions/ArgsParser/ArgsParser";

export default class ByCodeGeneratorNodeCodeGenerator implements NodeCodeGenerator {
    public constructor(
        private readonly codeGenerator: CodeGenerator,
        private readonly argsParser: ArgsParser,
    ) {

    }

    public async generateCode(pwd: string, args: string[]): Promise<void> {
        const parseredArgs = this.argsParser.parse(args);

        const [templateName, destinationPath] = parseredArgs.args;

        if(templateName === undefined) {
            console.log('TemplateName is required.');
            return;
        }
    
        if(destinationPath === undefined) {
            console.log(`DestinationPath is required.`);
            return;
        }

        const realPwd = this.getRealPwd(pwd);
        if(!realPwd) {
            console.log('Failed to find config file.');
            return;
        }

        await this.codeGenerator.generateCode({
            basePath: realPwd,
            templateName,
            destinationPath: this.getRealDestinationPath(pwd, realPwd, destinationPath),
            params: parseredArgs.keyValuesArgs,
            config: this.loadConfig(realPwd),
        });
    }

    private getRealPwd(pwd: string): string | false {
        const configPath = resolve(pwd, "./scheme-code-generator/config.ts");

        if(!fs.existsSync(configPath)) {
            const pwdDirectoryUp = path.dirname(pwd);
            if(pwdDirectoryUp === pwd) {
                return false;
            }

            return this.getRealPwd(pwdDirectoryUp);
        }

        return pwd;
    }

    private getRealDestinationPath(pwd: string, realPwd: string, destinationPath: string): string {
        const restOfPwd = pwd.slice(realPwd.length + 1);
        if(restOfPwd === '') {
            return destinationPath;
        }

        return restOfPwd + path.sep + destinationPath;
    }
    
    private loadConfig(pwd: string): CodeGeneratorParamsConfig {
        const config = fs.readFileSync(resolve(pwd, "./scheme-code-generator/config.ts")).toString();

        const fsMap = tsvfs.createDefaultMapFromNodeModules({ target: ts.ScriptTarget.ES2015 });
        fsMap.set("index.ts", config);

        const system = tsvfs.createSystem(fsMap)
        const host = tsvfs.createVirtualCompilerHost(system, {}, ts);

        const program = ts.createProgram({
            rootNames: [...fsMap.keys()],
            options: {},
            host: host.compilerHost,
        });

        program.emit();
        
        function requireFromString(src: any, filename: any) {
            var Module: any = module.constructor;
            var m = new Module();
            m._compile(src, filename);
            return m.exports;
        }
    
        return requireFromString(fsMap.get('index.js'), '').codeGeneratorConfig;
    }
}