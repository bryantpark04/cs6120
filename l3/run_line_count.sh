find ../bril/benchmarks -type f -name "*.bril" | xargs -I {} sh -c 'bril2json < "{}" | bril2txt | wc -l' | awk '{s+=$1} END {print s}'
find ../bril/benchmarks -type f -name "*.bril" | xargs -I {} sh -c 'bril2json < "{}" | deno run tdce.ts | bril2txt | wc -l' | awk '{s+=$1} END {print s}'
find ../bril/benchmarks -type f -name "*.bril" | xargs -I {} sh -c 'bril2json < "{}" | deno run lvn.ts | bril2txt | wc -l' | awk '{s+=$1} END {print s}'