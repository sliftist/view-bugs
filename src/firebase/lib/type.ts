


export function isJSNumber(str: string): boolean {
    return (+str).toString() === str;
}
/** As in, {} can have children. But null can't. Also, function(){} doesn't count. Yes, it can have children, but it is more likely a mistake. */
export function canHaveChildren(value: unknown): value is object {
    return value && typeof value === "object" || false;
}

export function UnionUndefined<T>(val: T): T|undefined {
    return val;
}

export function assertDefined<T>(value: T|undefined|null): T {
    if(value === undefined) {
        throw new Error(`Value is undefined`);
    }
    if(value === null) {
        throw new Error(`Value is null`);
    }
    return value;
}