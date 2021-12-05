#!/usr/bin/env node
import ByCodeGeneratorNodeCodeGenerator from "../../implementations/NodeCodeGenerator/ByCodeGeneratorNodeCodeGenerator/ByCodeGeneratorNodeCodeGenerator";
import MainCodeGenerator from "../../implementations/CodeGenerator/MainCodeGenerator/MainCodeGenerator";
import ByYargsArgsParser from "../../implementations/ArgsParser/ByYargsArgsParser/ByYargsArgsParser";
import ByTypeScriptVFSTypeScriptInlineCompiler from "../../implementations/TypeScriptInlineCompiler/ByTypeScriptVFSTypeScriptInlineCompiler/ByTypeScriptVFSTypeScriptInlineCompiler";

const pwd = process.env.PWD;
if(!pwd) {
    throw new Error(`Unexpected pwd state.`);
}

const codeGenerator = new ByCodeGeneratorNodeCodeGenerator(
    new MainCodeGenerator(),
    new ByYargsArgsParser(),
    new ByTypeScriptVFSTypeScriptInlineCompiler(),
);

codeGenerator.generateCode(pwd, process.argv.slice(2));