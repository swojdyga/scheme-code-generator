import NodeCodeGenerator from "../../../abstractions/NodeCodeGenerator/NodeCodeGenerator";
import CodeGenerator from "../../../abstractions/CodeGenerator/CodeGenerator";
import * as fs from "fs";
import {resolve} from "path";
import CodeGeneratorParamsConfig from "../../../abstractions/CodeGeneratorConfig/CodeGeneratorConfig";
import * as ts from "typescript";
import * as tsvfs from "@typescript/vfs";

export default class ByCodeGeneratorNodeCodeGenerator implements NodeCodeGenerator {
    public constructor(
        private readonly codeGenerator: CodeGenerator,
    ) {

    }

    public async generateCode(pwd: string, args: string[]): Promise<void> {
        const [templateName, destinationPath, ...restArgs] = args;

        if(templateName === undefined) {
            console.log('templateName is required.');
            return;
        }
    
        if(destinationPath === undefined) {
            console.log(`destinationPath is required.`);
            return;
        }

        const params = this.convertArgsToParams(restArgs);
        const config = await this.loadConfig(pwd);

        await this.codeGenerator.generateCode({
            basePath: pwd,
            templateName,
            destinationPath,
            params,
            config,
        });
    }

    private convertArgsToParams(args: string[]): {[key: string]: string} {
        const argsKeys = args.filter(
            (arg, index) => this.isKeyArg(index),
        );

        const argsValues = args.filter(
            (arg, index) => !this.isKeyArg(index),
        );

        const indexesWithInvalidArgs = argsKeys
            .map((argKey, index) => {
                if(this.isCorrectArgKey(argKey)) {
                    return null;
                }

                return index;
            })
            .filter((indexOrNull) => indexOrNull !== null);

        const validArgsKeys = argsKeys
            .filter((argsKey, index) => !indexesWithInvalidArgs.includes(index));

        const validArgsValues = argsValues
            .filter((argsKey, index) => !indexesWithInvalidArgs.includes(index));

        return validArgsKeys
            .reduce((params, validArgKey, index) => ({
                ...params,
                [validArgKey.slice(2)]: validArgsValues[index],
            }), {});
    }

    private isKeyArg(index: number): boolean {
        return index % 2 === 0;
    }

    private isCorrectArgKey(argKey: string): boolean {
        return argKey.slice(0, 2) === '--';
    }

    private async loadConfig(pwd: string): Promise<CodeGeneratorParamsConfig> {
        const config = (await fs.promises.readFile(resolve(pwd, "./code-generator/config.ts"))).toString();

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