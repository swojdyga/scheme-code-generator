export default interface NodeCodeGenerator {
    generateCode(pwd: string, args: string[]): Promise<void>;
}