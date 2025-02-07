function main(n: bigint) {
    let total: bigint = 0n;
    for (; n > 0; ) {
        const tenth: bigint = n / 10n;
        const currentDigit: bigint = n - 10n * tenth;
        total = total + currentDigit;
        n = tenth;
    }
    console.log(total);
}