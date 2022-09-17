export function collect<T>(n: number, cb: (ix: number) => T): T[] {
    const outputArray: T[] = [];
    for (let i = 0; i < n; i++) {
        outputArray.push(cb(i));
    }
    return outputArray;
}

export function pick<T>(arr: T[]): T {
    if (arr.length === 0) {
        throw new Error("can't pick from empty array");
    }
    return arr[Math.floor(Math.random() * arr.length)];
}
