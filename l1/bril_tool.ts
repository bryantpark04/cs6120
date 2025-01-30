const main = async () => {
    const filename = Deno.args[0];
    const ast = await import(filename, { with: { type: "json" } });
    console.log(ast);
}

main();