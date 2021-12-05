export default interface TypeScriptInlineCompilerFailedResultError {
    fileName: string | null;
    line: number | null;
    error: string;
}