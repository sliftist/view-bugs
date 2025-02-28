const { encode, decode } = require("firebase-encode");

export const isProxy = Symbol("isProxy");

export function proxyWrapper(
    getValue: (pathHash: string) => unknown,
    calledFnc: (pathHash: string) => unknown,
    setValue: (pathHash: string, value: unknown) => void,
    pathHash: string = ""
) {
    // BUG: We leak memory by never emptying these caches
    // key => any
    let proxyCache: Map<string, any> = new Map();
    let pathHashCache: Map<string, string> = new Map();
    function getChildPathHash(strKey: string) {
        let childPathHash = pathHashCache.get(strKey);
        if(childPathHash === undefined) {
            childPathHash = pathHash + "/" + encode(strKey);
            pathHashCache.set(strKey, childPathHash);
        }
        return childPathHash;
    }
    let proxy: any = new Proxy(() => {}, {
        get(target, key) {
            if(key === isProxy) return true;
            if(typeof key === "symbol") return undefined;
            let strKey = String(key);
            let childPathHash = getChildPathHash(strKey);
            let value = getValue(childPathHash);
            if(value !== undefined) {
                return value;
            }
            let childProxy = proxyCache.get(strKey);
            if(childProxy === undefined) {
                childProxy = proxyWrapper(getValue, calledFnc, setValue, childPathHash);
                proxyCache.set(strKey, childProxy);
            }
            return childProxy;
        },
        apply(target) {
            calledFnc(pathHash);
            return proxy;
        },
        has(target, key) {
            if(key === isProxy) return true;
            return false;
        },
        set(target, key, value) {
            setValue(getChildPathHash(String(key)), value);
            return true;
        }
    });
    return proxy;
}