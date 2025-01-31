import { Function, Program } from "../bril/bril-ts/bril.ts";
import { readStdin } from "../bril/bril-ts/util.ts";
import { Block } from "./types.ts";

let currentBlockNumber = 0;

const generateNewBlock = () => ({ successors: [], insts: [], id: currentBlockNumber++ });

export const formBasicBlocks = (f: Function): Block[] => {
    const blocks = [];
    let currentBlock: Block = generateNewBlock();
    for (const inst of f.instrs) {
        if ("label" in inst) {
            if (currentBlock.insts.length > 0) {
                currentBlock.successors = [inst.label];
                blocks.push(currentBlock);
            }
            currentBlock = { successors: [], insts: [inst], id: inst.label };
        } else {    // instruction
            currentBlock.insts.push(inst);
            if (["jmp", "br", "ret"].includes(inst.op)) {
                if ("labels" in inst && inst.labels) {
                    currentBlock.successors = inst.labels;
                }
                blocks.push(currentBlock);
                currentBlock = generateNewBlock();
            }
        }
    }
    if (currentBlock.insts.length > 0) {
        blocks.push(currentBlock);
    }
    return blocks;
}

const main = async () => {
    const ast: Program = JSON.parse(await readStdin());

    for (const func of ast.functions) {
        const blocks = formBasicBlocks(func);
        console.log(`For function ${func.name}, ${blocks.length} basic blocks:`)
        console.log(blocks);
    }
}

if (import.meta.main) main();