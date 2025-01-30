const readAll = async (stream: ReadableStream<Uint8Array>) => {
    const decoder = new TextDecoder();
    let result = "";
    for await (const chunk of stream) {
        result += decoder.decode(chunk, { stream: true });
    }
    return result;
}

const main = async () => {
    const ast = JSON.parse(await readAll(Deno.stdin.readable));
    console.log(ast);
}

main();