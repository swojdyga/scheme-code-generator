import CodeGenerator from "../../../abstractions/CodeGenerator/CodeGenerator";
import CodeGeneratorParams from "../../../abstractions/CodeGenerator/CodeGeneratorParams/CodeGeneratorParams";
import * as fs from "fs";
import * as path from "path";
import { Chmod } from "../../../abstractions/Types/Chmod/Chmod";

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

            this.createDirectoriesStructure(fullPath, generatedCodeFile.chmod);
            this.createFile(fullPath, generatedCodeFile.source, generatedCodeFile.chmod);
        });
    }

    private createDirectoriesStructure(fullPath: string, chmod?: Chmod): void {
        const pathParts = path.dirname(fullPath).split(path.sep);

        pathParts
            .slice(1)
            .reduce((currentPath, pathPart) => {
                const nextPath = currentPath + path.sep + pathPart;
                if(!fs.existsSync(nextPath)) {
                    fs.mkdirSync(nextPath);
                    if(chmod) {
                        fs.chmodSync(nextPath, chmod);
                    }
                }

                return nextPath;
            }, "");
        }

    private createFile(fullPath: string, source: string, chmod?: Chmod): void {
        fs.writeFileSync(fullPath, source);

        if(chmod) {
            fs.chmodSync(fullPath, chmod);
        }
    }
}