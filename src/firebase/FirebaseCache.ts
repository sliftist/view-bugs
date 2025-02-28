import { rootPromise } from "./lib/promise";

export class FirebaseCache {
    constructor(private app: firebase.app.App) { }

    valueCache: Map<string, unknown> = new Map();
    subscriptions: Map<string, Set<() => void>> = new Map();
    lastAccesses: Map<() => void, Set<string>> = new Map();
    curFunction: (() => void)|undefined = undefined;

    forceSetValues: Set<string> = new Set();

    refToPath: WeakMap<any, string> = new WeakMap();

    getValue(pathHash: string) {
        if(!this.curFunction) {
            throw new Error(`Called getValue outside of FirebaseCache.wrapGetValue`);
        }
        let lastAccesses = this.lastAccesses.get(this.curFunction);
        if(!lastAccesses) {
            throw new Error(`Called getValue outside of FirebaseCache.wrapGetValue`);
        }

        lastAccesses.add(pathHash);
        return this.valueCache.get(pathHash);
    }
    // When you make an oopsy and ask for a value you shouldn't have, call this, and we'll make it like it never happened.
    cancelGetValue(pathHash: string) {
        if(!this.curFunction) {
            throw new Error(`Called getValue outside of FirebaseCache.wrapGetValue`);
        }
        let lastAccesses = this.lastAccesses.get(this.curFunction);
        if(!lastAccesses) {
            throw new Error(`Called getValue outside of FirebaseCache.wrapGetValue`);
        }
        lastAccesses.delete(pathHash);
    }

    forceSetValue(pathHash: string, value: unknown) {
        console.log(`Force set ${pathHash} to ${value}`);
        this.valueCache.set(pathHash, value);
        this.forceSetValues.add(pathHash);
        this.onChanged(pathHash, value);
        let subscriptions = this.subscriptions.get(pathHash);
        if(subscriptions) {
            for(let fnc of subscriptions) {
                this.removeSubscription(pathHash, fnc);
            }
        }
    }

    pendingCallbacks: Set<() => void>|undefined;

    callback = (a: firebase.database.DataSnapshot, b?: string | null) => {
        let path = this.refToPath.get((a.ref as any).path);
        if(path === undefined) {
            throw new Error(`Cannot find ref in callback`);
        }
        this.onChanged(path, a.val());
    };
    onChanged(path: string, value: unknown) {
        if(this.forceSetValues.has(path)) return;

        this.valueCache.set(path, value);
        let subscriptions = this.subscriptions.get(path);
        if(subscriptions) {
            let pendingFncs = this.pendingCallbacks;
            if(!pendingFncs) {
                let curPendingFncs = pendingFncs = new Set();
                this.pendingCallbacks = pendingFncs;
                rootPromise(Promise.resolve().then(() => {
                    this.pendingCallbacks = undefined;
                    for(let callback of curPendingFncs) {
                        try {
                            callback();
                        } catch(e) {
                            // Throw it asynchronously, so we can continue with the other callbacks.
                            setTimeout(() => { throw e; }, 0);
                        }
                    }
                }));
            }
            for(let fnc of subscriptions) {
                pendingFncs.add(fnc);
            }
        }
    }
    removeSubscription(path: string, fnc: () => void) {
        let subscriptions = this.subscriptions.get(path);
        if(!subscriptions) throw new Error(`Internal error`);
        subscriptions.delete(fnc);
        if(subscriptions.size === 0) {
            // unsubscribe
            this.app.database().ref(path).off("value", this.callback);
            if(!this.forceSetValues.has(path)) {
                this.valueCache.delete(path);
            }
            this.subscriptions.delete(path);
            console.log(`Unwatch path ${path}`);
        }
    }
    wrapGetValue<T>(
        fnc: () => T,
        callback: () => void
    ): T {
        this.curFunction = callback;
        try {
            let lastAccess = this.lastAccesses.get(callback) || new Set();
            let nextAccesses: Set<string> = new Set();
            this.lastAccesses.set(callback, nextAccesses);
            try {
                return fnc();
            } finally {
                removeParents(nextAccesses);

                for(let path of lastAccess) {
                    if(!nextAccesses.has(path)) {
                        this.removeSubscription(path, callback);
                    }
                }
                for(let path of nextAccesses) {
                    if(!lastAccess.has(path)) {
                        let subscriptions = this.subscriptions.get(path);
                        if(!subscriptions) {
                            // subscribe
                            if(!this.forceSetValues.has(path)) {
                                console.log(`Watch path ${path}`);
                                let ref = this.app.database().ref(path);
                                this.refToPath.set((ref as any).path, path);
                                ref.on("value", this.callback);
                            }

                            subscriptions = new Set();
                            this.subscriptions.set(path, subscriptions);
                        }
                        subscriptions.add(callback);
                    }
                }

                if(nextAccesses.size === 0) {
                    this.lastAccesses.delete(callback);
                }
            }
        } finally {
            this.curFunction = undefined;
        }
    }
}

function removeParents(paths: Set<string>): void {
    let pathsChecked: Set<string> = new Set();
    for(let path of paths) {
        let parts = path.split("/");
        for(let i = 2; i < parts.length; i++) {
            let parentPath = parts.slice(0, i).join("/");
            if(!pathsChecked.has(parentPath) && paths.has(parentPath)) {
                pathsChecked.add(parentPath);
                paths.delete(parentPath);
            }
        }
    }
}