import { max } from "./math";
import { isJSNumber } from "./type";

export const g = typeof globalThis !== "undefined" ? globalThis : new Function("return this")();

export function isNode() {
    return typeof window === "undefined";
}



export function isEmpty<T>(obj: {[key: string]: T} | undefined | null): boolean {
    if(!obj) {
        return true;
    }
    for(var key in obj) {
        return false;
    }
    return true;
}
export function firstKey<T>(obj: {[key: string]: T}): string|undefined {
    for(var key in obj) {
        return key
    }
    return undefined; 
}

let nextId = 0;
export function randomUID(prefix = "UID") {
    return prefix + (+new Date()).toString() + "." + (nextId++);
}

export function cloneDeep<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}
export function cloneDeepSymbols<T>(obj: T): T {
    if(typeof obj !== "object") {
        return obj;
    }
    let copy = Object.create(null) as any;
    let keys = (Object.getOwnPropertySymbols(obj) as (string|symbol)[]).concat(Object.getOwnPropertyNames(obj))
    for(let key of keys) {
        copy[key] = cloneDeepSymbols((obj as any)[key]);
    }
    return copy;
}

type GetInstance<T> = T extends { new(...args: any[]): infer I } ? I : never;

export function isInstance<T extends Function>(value: unknown, type: T): value is GetInstance<T> {
    return value && typeof value === "object" && value instanceof type;
}


export function isDeepEqual<T>(a: T, b: T): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
}
export function isShallowEqual<T>(a: T, b: T): boolean {
    if(!a || !b || typeof a !== "object" || typeof b !== "object") return a === b;
    for(let key in a) {
        if(a[key] !== b[key]) return false;
    }
    for(let key in b) {
        if(a[key] !== b[key]) return false;
    }
    return true;
}
export function floatEqual(a: number, b: number): boolean {
    let max = Math.max(Math.abs(a), Math.abs(b));
    let baseBits = Math.log2(max);
    if(baseBits < 1) {
        baseBits = 1;
    }
    let mantissa = Math.pow(2, baseBits - 12);
    return (a - mantissa) <= b && (a + mantissa) >= b;
}

export function unique(arr: string[]): string[] {
    return Object.keys(keyBy(arr, x => x, true))
}

export function keyBy<T, Key extends string>(
    a: T[],
    key: (obj: T) => Key = x => String(x) as Key,
    noCollisionWarning = false
): { [key in Key]: T } {
    let dict: { [key in Key]: T } = Object.create(null);
    for(let obj of a) {
        let keyStr = key(obj);
        if(!noCollisionWarning) {
            if(keyStr in dict) {
                console.warn(`keyBy has collision in key ${JSON.stringify(keyStr)}`, a);
            }
        }
        dict[keyStr] = obj;
    }
    return dict;
}
export function keyByArray<T>(a: T[], key: (obj: T) => string): { [key: string]: T[] } {
    let dict: { [key: string]: T[] } = Object.create(null);
    for(let obj of a) {
        let keyStr = key(obj);
        let arr = dict[keyStr] = dict[keyStr] || [];
        arr.push(obj);
    }
    return dict;
}

export function flatten<T>(a: T[][]) {
    let b: T[] = [];
    for(let arr of a) {
        for(let o of arr) {
            b.push(o);
        }
    }
    return b;
}

export function sort<T>(arr: T[], sortKey: (obj: T) => number) {
    arr.sort((a, b) => sortKey(a) - sortKey(b));
    return arr;
}

export function compareValue(lhs: (string|number), rhs: (string|number)): number {
    if(typeof(lhs) !== "number" || typeof(rhs) !== "number") {
        lhs = String(lhs);
        rhs = String(rhs);
    }
    return lhs < rhs ? -1 : lhs > rhs ? +1 : 0;
}
export function compareArray(lhs: readonly (string|number)[], rhs: readonly (string|number)[]): number {
    for(let i = 0; i < Math.min(lhs.length, rhs.length); i++) {
        let diff = compareValue(lhs[i], rhs[i]);
        if(diff) return diff;
    }

    return compareValue(lhs.length, rhs.length);
}
export function arraysEqual<T>(lhs: readonly T[], rhs: readonly T[]): boolean {
    if(lhs.length !== rhs.length) return false;

    for(let i = 0; i < Math.min(lhs.length, rhs.length); i++) {
        if(lhs[i] !== rhs[i]) return false;
    }

    return true;
}

export function convertToNumIfNum(str: string): string|number {
    if(isJSNumber(str)) {
        return +str;
    }
    return str;
}

export function sortDotDelimitted<T>(arr: T[], sortKey: (obj: T) => string) {
    arr.sort((a, b) => {
        let lhs = sortKey(a);
        let rhs = sortKey(b);
        return compareArray(lhs.split(".").map(convertToNumIfNum), rhs.split(".").map(convertToNumIfNum));
    });
}

export function range(start: number, end: number): number[] {
    let values: number[] = [];
    for(let i = start; i < end; i++) {
        values.push(i);
    }
    return values;
}

export function arrayEqual<T>(a: T[], b: T[]): boolean {
    if(a.length !== b.length) return false;
    for(let ix = 0; ix < a.length; ix++) {
        if(a[ix] !== b[ix]) return false;
    }
    return true;
}
/** Really just arrayEquals(superset.slice(0, subset.length), subset) */
export function arrayIsSupersetOrEqual<T>(subset: T[], superset: T[]): boolean {
    if(superset.length < subset.length) return false;
    for(let ix = 0; ix < subset.length; ix++) {
        if(subset[ix] !== superset[ix]) return false;
    }
    return true;
}
/** Really just arrayIsSupersetOrEqual(subset, superset) && !arrayEquals(subset, superset) */
export function arrayIsSuperset<T>(subset: T[], superset: T[]): boolean {
    if(superset.length <= subset.length) return false;
    for(let ix = 0; ix < subset.length; ix++) {
        if(subset[ix] !== superset[ix]) return false;
    }
    return true;
}
export function arrayMerge<T>(a: T[], b: T[], hash: (val: T) => string): T[] {
    let array: T[] = [];
    let values: { [hash: string]: Object } = Object.create(null);
    for(var i = 0; i < a.length; i++) {
        var x = a[i];
        let hashed = hash(x);
        if(hashed in values) continue;
        values[hashed] = true;
        array.push(x);
    }
    for(var i = 0; i < b.length; i++) {
        var x = b[i];
        let hashed = hash(x);
        if(hashed in values) continue;
        values[hashed] = true;
        array.push(x);
    }
    return array;
}

export function getPathRaw(object: any, path: readonly string[]): object {
    for(let i = 0; i < path.length; i++) {
        object = object[path[i]];
    }
    return object;
}

export function setPathRaw(object: any, value: any, path: string[]) {
    for(let i = 0; i < path.length - 1; i++) {
        object = object[path[i]];
    }
    object[path[path.length - 1]] = value;
}

export function asyncTimeout(delay: number): Promise<void> {
    return new Promise<void>(resolve => {
        setTimeout(resolve, delay);
    });
}


export function mapObjectValues<AObj extends { [key in string|number]: any }, B>(
    object: AObj,
    map: (value: AObj[keyof AObj], key: string) => B
): { [key in keyof AObj]: B } {
    let result: { [key in keyof AObj]: B } = Object.create(null);
    for(let key in object) {
        result[key] = map(object[key], key);
    }
    return result;
}
export function mapObjectKeys<AObj extends { [key in string|number]: any }>(
    object: AObj,
    map: (value: AObj[keyof AObj], key: string) => string
): { [key in string]: AObj[keyof AObj] } {
    let result: { [key: string]: AObj[keyof AObj] } = Object.create(null);
    for(let key in object) {
        let value = object[key];
        let newKey = map(object[key], key);
        if(newKey in result) {
            throw new Error(`Overlapping keys in mapObjectKeys`);
        }
        result[newKey] = value;
    }
    return result;
}


export function filterObjectValues<A>(
    object: { [key: string]: A },
    filter: (value: A, key: string) => boolean
): { [key: string]: A } {
    let result: { [key: string]: A } = Object.create(null);
    for(let key in object) {
        if(filter(object[key], key)) {
            result[key] = object[key];
        }
    }
    return result;
}

export function zipObject<P extends string, O>(prop1: P, values1: O[]): {[key in P]: O}[];

export function zipObject<
    P1 extends string, V1,
    P2 extends string, V2
>(
    p1: P1, v1: V1[],
    p2: P2, v2: V2[],
):
(
    {[key in P1]: V1}
    & {[key in P2]: V2}
)[];
export function zipObject<
    P1 extends string, V1,
    P2 extends string, V2,
    P3 extends string, V3,
>(
    p1: P1, o1: V1[],
    p2: P2, o2: V2[],
    p3: P3, o3: V3[],
):
(
    {[key in P1]: V1}
    & {[key in P2]: V2}
    & {[key in P3]: V3}
)[];
export function zipObject<
    P1 extends string, V1,
    P2 extends string, V2,
    P3 extends string, V3,
    P4 extends string, V4,
>(
    p1: P1, o1: V1[],
    p2: P2, o2: V2[],
    p3: P3, o3: V3[],
    p4: P4, o4: V4[],
):
(
    {[key in P1]: V1}
    & {[key in P2]: V2}
    & {[key in P3]: V3}
    & {[key in P4]: V4}
)[];
export function zipObject<
    P1 extends string, V1,
    P2 extends string, V2,
    P3 extends string, V3,
    P4 extends string, V4,
    P5 extends string, V5,
>(
    p1: P1, o1: V1[],
    p2: P2, o2: V2[],
    p3: P3, o3: V3[],
    p4: P4, o4: V4[],
    p5: P5, o5: V5[],
):
(
    {[key in P1]: V1}
    & {[key in P2]: V2}
    & {[key in P3]: V3}
    & {[key in P4]: V4}
    & {[key in P5]: V5}
)[];

export function zipObject(...args: (string | object[])[]): object[] {
    let output: object[] = [];

    let argsObjects: { prop: string, values: object[] }[] = [];

    if(args.length % 2 !== 0) {
        throw new Error(`Expected an even number of arguments, one property per one list of objects.`);
    }

    let count = args.length / 2;
    for(let i = 0; i < count; i++) {
        let prop = args[i];
        if(typeof prop !== "string") {
            throw new Error(`Every other property should be the property name, instead we received: ${prop}`);
        }
        let objArray = args[i + 1];
        if(!Array.isArray(objArray)) {
            throw new Error(`Every other property should be an array of values, instead we received: ${objArray}`);
        }

        argsObjects.push({prop, values: objArray as any});
    }

    let maxCount = max(argsObjects.map(x => x.values.length));

    return (
        range(0, maxCount)
        .map(i => {
            let obj: any = Object.create(null);
            for(let argObj of argsObjects) {
                let prop = argObj.prop;
                let value = argObj.values[i];
                obj[prop] = value;
            }
            return obj;
        })
    );
}

/** Ex, if we a script injected into an extension via executeScript. */
export function isChromeExtensionScript() {
    return g.chrome && g.chrome.runtime && typeof g.chrome.runtime.getManifest === "function";
}

/** Ex, if we are the main chrome extension code, that can access browserAction. */
export function isChromeExtensionBootstrap() {
    return g.chrome && g.chrome.browserAction && g.chrome.browserAction.onClicked;
}