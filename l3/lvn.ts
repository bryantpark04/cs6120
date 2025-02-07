import { readStdin } from "../bril/bril-ts/util.ts";
import { Function, Program, Instruction } from "../bril/bril-ts/bril.ts";
import { dceTrivial, deleteReassignBeforeRead } from "./tdce.ts";
import { Block } from "../l2/types.ts";
import { formBasicBlocks } from "../l2/basic_blocks.ts";
import { deepEquals } from "./helpers.ts";

const variableNames: Set<string> = new Set();
const freshVariableName = () => {
    let counter = 0;
    const stem = "dummy_";
    while (variableNames.has(stem + counter)) {
        counter++;
    }
    variableNames.add(stem + counter)
    return stem + counter;
}

const main = async () => {
    const ast: Program = JSON.parse(await readStdin());

    ast.functions
        .flatMap(func => func.instrs)
        .flatMap(inst => {
            const variables = "dest" in inst ? [inst.dest] : [];
            return variables.concat("args" in inst && inst.args ? inst.args : []);
        })
        .forEach(variableNames.add.bind(variableNames));

    ast.functions.forEach(func => {
        let modified = true;
        while (modified) {
            const blocks = formBasicBlocks(func);
            blocks.forEach(lvn);
            console.error(blocks);
            func.instrs = blocks.flatMap(block => block.insts);
            modified = dceTrivial(func);
            modified = deleteReassignBeforeRead(func) || modified;
        }
    });

    console.log(JSON.stringify(ast));
}

const LIVE_IN = "live-in" as const;
type ValueTuple = { op: string, args: number[] } | typeof LIVE_IN;

const lvn = (block: Block): void => {
    const table: [ValueTuple, string][] = [];
    const varToNum: Map<string, number> = new Map();

    block.insts.forEach((inst, idx) => {
        if ("args" in inst) {
            // replace args
            const argValueNumbers = (inst.args ?? []).map(arg => {
                const valueNumber = varToNum.get(arg);
                if (valueNumber !== undefined) {
                    return valueNumber;
                } else {
                    // live-in
                    const newValNum = table.length;
                    table.push([LIVE_IN, arg]);
                    varToNum.set(arg, newValNum);
                    return newValNum;
                }
            });
            inst.args = argValueNumbers?.map(valueNum => table[valueNum][1]);

            // TODO check if this is correct for print
            if (!("op" in inst)) {
                return;
            }

            const value: ValueTuple = { op: inst.op, args: argValueNumbers };
            console.error(table);
            let valueNumber = table.findIndex(([tblVal, _]) => deepEquals(tblVal, value));
            if (valueNumber > -1) { // found - replace this inst with a copy
                inst.op = "id"; // can I mutate it in-flight like this?
                inst.args = [table[valueNumber][1]];
                // TODO should I check to see if this is a function call or a branch?
                console.error(inst);
            } else { // newly computed value
                valueNumber = table.length;
                if ("dest" in inst) {
                    if (block.insts
                        .slice(idx + 1)
                        .findIndex(laterInst => "dest" in laterInst && laterInst.dest === inst.dest) 
                        > -1) {
                        inst.dest = freshVariableName();
                    }
                    
                    table.push([value, inst.dest]);
                }
            }
            if ("dest" in inst) {
                varToNum.set(inst.dest, valueNumber);
            }
        }
    });
}

if (import.meta.main) {
    main();
}