import { Chmod } from "../../../../Types/Chmod/Chmod";

export default interface CodeGeneratorConfigTemplateGeneratorResultFile {
    path: string;
    source: string;
    chmod?: Chmod;
}