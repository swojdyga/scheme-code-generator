export default interface ArgsParser {
    parse(args: string[]): {
        args: string[],
        keyValuesArgs: {[key: string]: string},
    };
}