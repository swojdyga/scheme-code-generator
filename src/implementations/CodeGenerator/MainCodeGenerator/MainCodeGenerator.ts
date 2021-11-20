import CodeGenerator from "../../../abstractions/CodeGenerator/CodeGenerator";
import CodeGeneratorParams from "../../../abstractions/CodeGenerator/CodeGeneratorParams/CodeGeneratorParams";
import * as fs from "fs";
import * as path from "path";

export default class MainCodeGenerator implements CodeGenerator {
    public async generateCode(params: CodeGeneratorParams): Promise<void> {
        const template = params.config.templates.find(
            (templatesTemplate) => templatesTemplate.name === params.templateName,
        );

        if(!template) {
            return;
        }
        
        const generatedCode = await template.generator({
            destinationPath: params.destinationPath,
            params: params.params,
        });

        generatedCode.files.forEach((generatedCodeFile) => {
            const fullPath = path.resolve(params.basePath, generatedCodeFile.path);

            fs.mkdirSync(path.dirname(fullPath), {
                recursive: true,
            });
        
            fs.writeFileSync(fullPath, generatedCodeFile.source);
        });
    }
}