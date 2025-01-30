import { Program } from "../bril/bril-ts/bril.ts";
import { readStdin } from "../bril/bril-ts/util.ts";

const main = async () => {
    const ast: Program = JSON.parse(await readStdin());
    console.log(ast);
}

main();