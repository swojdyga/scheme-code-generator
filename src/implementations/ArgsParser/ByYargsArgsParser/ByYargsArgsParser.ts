import ArgsParser from "../../../abstractions/ArgsParser/ArgsParser";
import * as parser from "yargs-parser";

export default class ByYargsArgsParser implements ArgsParser {
    public parse(args: string[]): {
        args: string[],
        keyValuesArgs: {[key: string]: string},
    } {
        const parseredArgs = parser(args);
        return {
            args: parseredArgs._,
            keyValuesArgs: (() => {
                const args: {[key: string]: string} = {...parseredArgs};
                delete args._;
                delete args.$0;

                return args;
            })(),
        }
    }
}