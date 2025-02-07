import { readStdin } from "../bril/bril-ts/util.ts";
import { Function, Program, Instruction } from "../bril/bril-ts/bril.ts";

const main = async () => {
    const ast: Program = JSON.parse(await readStdin());

    ast.functions.forEach(func => {
        let modified = true;
        while (modified) {
            modified = dceTrivial(func);
        }
    });
    
    console.log(JSON.stringify(ast));
}

const effectOps = new Set(["br", "jmp", "print", "ret", "call", "store", "free", "speculate", "guard", "commit"]);

const dceTrivial = (func: Function): boolean => {
    const originalLength = func.instrs.length;

    const used: Set<string> = new Set();
    func.instrs
        .filter((inst): inst is Instruction & { args: string[] } => {
            return "args" in inst && inst.args !== undefined;
        })
        .forEach(inst => inst.args.forEach(arg => used.add(arg)));

    func.instrs = func.instrs
        .filter(inst => !(
            "op" in inst && !effectOps.has(inst.op)
            && "dest" in inst && !used.has(inst.dest)
        ));

    return originalLength != func.instrs.length;
}

if (import.meta.main) main();