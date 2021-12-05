import TypeScriptInlineCompiler from "../../../abstractions/TypeScriptInlineCompiler/TypeScriptInlineCompiler";
import * as tsvfs from "@typescript/vfs";
import * as ts from "typescript";
import TypeScriptInlineCompilerFailedResult from "../../../abstractions/TypeScriptInlineCompiler/TypeScriptInlineCompilerFailedResult/TypeScriptInlineCompilerFailedResult";

export default class ByTypeScriptVFSTypeScriptInlineCompiler implements TypeScriptInlineCompiler {
    private readonly compilerOptions: ts.CompilerOptions = {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2021,
        moduleResolution: ts.ModuleResolutionKind.NodeJs,
        declaration: true,
        noImplicitReturns: true,
        strict: true,
        strictBindCallApply: true,
        strictPropertyInitialization: true,
        downlevelIteration: true,
        skipLibCheck: true,
        lib: [

        ],
        typeRoots: [
            "../node_modules/@types"
        ],
        types: [
            "@types/node",
        ],
    };

    public compile(path: string, source: string): string | TypeScriptInlineCompilerFailedResult {
        const fsMap = tsvfs.createDefaultMapFromNodeModules(this.compilerOptions);
        fsMap.set(path, source);

        const system = tsvfs.createFSBackedSystem(fsMap, path, ts);
        const host = tsvfs.createVirtualCompilerHost(system, {}, ts);

        const program = ts.createProgram({
            rootNames: [...fsMap.keys()],
            options: this.compilerOptions,
            host: host.compilerHost,
        });

        program.emit();

        const errors = this.getErrors(program);
        if(errors.length) {
            return this.returnErrors(errors);
        }

        return this.returnResult(path, fsMap);
    }

    private getErrors(program: ts.Program): ts.Diagnostic[] {
        return [
            ...program.getGlobalDiagnostics(),
            ...program.getOptionsDiagnostics(),
            ...program.getSemanticDiagnostics(),
            ...program.getSyntacticDiagnostics(),
            ...program.getDeclarationDiagnostics(),
            ...program.getConfigFileParsingDiagnostics(),
        ];
    }

    private returnErrors(errors: ts.Diagnostic[]): TypeScriptInlineCompilerFailedResult {
        return {
            errors: errors
                .map((error) => {
                    return {
                        fileName: error.file?.fileName ?? null,
                        line: error.start && error.file
                            ? this.getLineOfCharPosition(error.file.text, error.start)
                            : null,
                        error: this.getCompileErrorMessageTextAsText(error.messageText),
                    };
                }),
        }
    }

    private getCompileErrorMessageTextAsText(messageText: string | ts.DiagnosticMessageChain): string {
        if(typeof messageText === "string") {
            return messageText;
        }

        return messageText.messageText;
    }

    private returnResult(path: string, fsMap: Map<string, string>): string {
        const result = fsMap.get(`${path.replace(/^(.*)\.\w+$/, '$1')}.js`);
        if(!result) {
            throw new Error('Unexpected compile state.');
        }

        return result;
    }

    private getLineOfCharPosition(content: string, charPosition: number): number {
        const linesLength = content.split(`\n`)
            .map((lineContent) => lineContent.length);

        return this.findLineOfCharPosition(
            0,
            0,
            linesLength,
            charPosition
        );
    }

    private findLineOfCharPosition(
        previousLinesChars: number,
        previousLine: number,
        linesLength: number[],
        charPosition: number,
    ): number {
        if(previousLinesChars >= charPosition) {
            return previousLine; 
        }

        return this.findLineOfCharPosition(
            previousLinesChars + linesLength[0],
            previousLine + 1,
            linesLength.slice(1),
            charPosition,
        );
    }
}