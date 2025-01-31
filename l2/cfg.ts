import { Program } from "../bril/bril-ts/bril.ts";
import { readStdin } from "../bril/bril-ts/util.ts";
import { Block, CFG } from "./types.ts";
import { formBasicBlocks } from "./basic_blocks.ts";

const generateCfg = (blocks: Block[]): CFG => {
    const map = new Map();
    for (const block of blocks) {
        map.set(block.id, block);
        if ("label" in block.insts[0]) {
            block.insts.splice(0, 1);
        }
    }
    const entryPoint = { successors: [blocks[0].id], insts: [], id: -1 };
    map.set(-1, entryPoint);
    return { blocks: map, entryPoint: entryPoint};
}

const main = async () => {
    const ast: Program = JSON.parse(await readStdin());

    for (const func of ast.functions) {
        const blocks = formBasicBlocks(func);
        const cfg = generateCfg(blocks);
        console.log(`For function ${func.name}, ${blocks.length} basic blocks:`)
        console.log(cfg);
    }
}

if (import.meta.main) main();