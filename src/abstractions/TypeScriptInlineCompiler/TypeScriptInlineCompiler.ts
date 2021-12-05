import TypeScriptInlineCompilerFailedResult from "./TypeScriptInlineCompilerFailedResult/TypeScriptInlineCompilerFailedResult";

export default interface TypeScriptInlineCompiler {
    compile(path: string, source: string): string | TypeScriptInlineCompilerFailedResult;
}