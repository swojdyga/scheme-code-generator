import ByCodeGeneratorNodeCodeGenerator from "../../implementations/NodeCodeGenerator/ByCodeGeneratorNodeCodeGenerator/ByCodeGeneratorNodeCodeGenerator";
import MainCodeGenerator from "../../implementations/CodeGenerator/MainCodeGenerator/MainCodeGenerator";

const pwd = process.env.PWD;
if(!pwd) {
    throw new Error(`Unexpected pwd state.`);
}

const codeGenerator = new ByCodeGeneratorNodeCodeGenerator(
    new MainCodeGenerator(),
);

codeGenerator.generateCode(pwd, process.argv.slice(2));