import NodeCodeGenerator from "../../../abstractions/NodeCodeGenerator/NodeCodeGenerator";
import CodeGenerator from "../../../abstractions/CodeGenerator/CodeGenerator";
import * as fs from "fs";
import * as path from "path";
import {resolve} from "path";
import CodeGeneratorParamsConfig from "../../../abstractions/CodeGeneratorConfig/CodeGeneratorConfig";
import ArgsParser from "../../../abstractions/ArgsParser/ArgsParser";
import TypeScriptInlineCompiler from "../../../abstractions/TypeScriptInlineCompiler/TypeScriptInlineCompiler";
import TypeScriptInlineCompilerFailedResult from "../../../abstractions/TypeScriptInlineCompiler/TypeScriptInlineCompilerFailedResult/TypeScriptInlineCompilerFailedResult";

export default class ByCodeGeneratorNodeCodeGenerator implements NodeCodeGenerator {
    public constructor(
        private readonly codeGenerator: CodeGenerator,
        private readonly argsParser: ArgsParser,
        private readonly typeScriptInlineCompiler: TypeScriptInlineCompiler,
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

        const config = this.loadConfig(realPwd);
        if('errors' in config) {
            console.log(`Error during compiling config:\n\n${config.errors
                .map((error) => {
                    if(error.fileName !== null) {
                        return `${error.fileName}:${error.line}: ${error.error}`;
                    }

                    return error.error;
                })
                .join(`\n\n`)}`);
            return;
        }

        await this.codeGenerator.generateCode({
            basePath: realPwd,
            templateName,
            destinationPath: this.getRealDestinationPath(pwd, realPwd, destinationPath),
            params: parseredArgs.keyValuesArgs,
            config,
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
    
    private loadConfig(pwd: string): CodeGeneratorParamsConfig | TypeScriptInlineCompilerFailedResult {
        const path = resolve(pwd, "./scheme-code-generator/config.ts");
        const configSourceRaw = fs.readFileSync(path).toString();
        const configSource = this.typeScriptInlineCompiler.compile(path, configSourceRaw);
        if(typeof configSource !== "string") {
            return configSource;
        }

        function requireFromString(src: any, filename: any) {
            var Module: any = module.constructor;
            var m = new Module();
            m._compile(src, filename);
            return m.exports;
        }
    
        return requireFromString(configSource, '').codeGeneratorConfig;
    }
}