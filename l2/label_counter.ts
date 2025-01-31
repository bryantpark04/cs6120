import { Program } from "../bril/bril-ts/bril.ts";
import { readStdin } from "../bril/bril-ts/util.ts";


const main = async () => {
    const ast: Program = JSON.parse(await readStdin());

    let numLabels = 0;

    ast.functions.forEach(func => {
        numLabels += func.instrs
            .filter(inst => "label" in inst)
            .length;
    });

    console.log(`# labels: ${numLabels}`);
}

main();