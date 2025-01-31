import { Instruction, Label } from "../bril/bril-ts/bril.ts";

export type Block = { successors: (string | number)[], insts: (Label | Instruction)[], id: string | number };
export type CFG = { blocks: Map<string, Block>, entryPoint: Block };
