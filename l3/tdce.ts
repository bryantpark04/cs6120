import { readStdin } from "../bril/bril-ts/util.ts";
import { Function, Program, Instruction } from "../bril/bril-ts/bril.ts";
import { formBasicBlocks } from "../l2/basic_blocks.ts";
import { Block } from "../l2/types.ts";

const main = async () => {
    const ast: Program = JSON.parse(await readStdin());

    ast.functions.forEach(func => {
        let modified = true;
        while (modified) {
            modified = dceTrivial(func);
            modified = deleteReassignBeforeRead(func) || modified;
        }
    });
    
    console.log(JSON.stringify(ast));
}

const effectOps = new Set(["br", "jmp", "print", "ret", "call", "store", "free", "speculate", "guard", "commit"]);

const dceTrivial = (func: Function): boolean => {
    const originalLength = func.instrs.length;

    const used = new Set(func.instrs.flatMap(inst => "args" in inst ? inst.args : []));

    func.instrs = func.instrs
        .filter(inst => !(
            "op" in inst && !effectOps.has(inst.op)
            && "dest" in inst && !used.has(inst.dest)
        ));

    return originalLength != func.instrs.length;
}

const deleteReassignBeforeRead = (func: Function): boolean => {
    const originalLength = func.instrs.length;
    func.instrs = formBasicBlocks(func)
        .flatMap(block => {
            const used = new Set<string>(block.insts.flatMap(inst => "args" in inst && inst.args ? inst.args : []));
            return block.insts
                .toReversed()
                .filter(inst => {
                    if (!("dest" in inst)) {
                        if ("args" in inst) {
                            inst.args?.forEach(used.add.bind(used));
                        }
                        return true;
                    }
                    if (used.has(inst.dest)) {
                        used.delete(inst.dest);
                        if ("args" in inst) {
                            inst.args?.forEach(used.add.bind(used));
                        }
                        return true;
                    }
                    return "op" in inst && effectOps.has(inst.op);
                })
                .toReversed();
        });
    return func.instrs.length != originalLength;
}

if (import.meta.main) main();