import CodeGeneratorConfigTemplateGeneratorParams from "./CodeGeneratorConfigTemplateGeneratorParams/CodeGeneratorConfigTemplateGeneratorParams";
import CodeGeneratorConfigTemplateGeneratorResult from "./CodeGeneratorConfigTemplateGeneratorResult/CodeGeneratorConfigTemplateGeneratorResult";

export default interface CodeGeneratorConfigTemplate {
    name: string;
    generator: (params: CodeGeneratorConfigTemplateGeneratorParams)
        => Promise<CodeGeneratorConfigTemplateGeneratorResult>;
}