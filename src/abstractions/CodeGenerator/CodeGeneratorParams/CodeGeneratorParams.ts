import CodeGeneratorConfig from "../../CodeGeneratorConfig/CodeGeneratorConfig";

export default interface CodeGeneratorParams {
    basePath: string;
    templateName: string;
    destinationPath: string;
    params: {[key: string]: string};
    config: CodeGeneratorConfig;
}