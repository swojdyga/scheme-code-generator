import CodeGeneratorParams from "./CodeGeneratorParams/CodeGeneratorParams";

export default interface CodeGenerator {
    generateCode(params: CodeGeneratorParams): Promise<void>;
}