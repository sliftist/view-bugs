import { proxyWrapper } from "./proxyWrapper";

interface WatcherInterface {
    forceUpdate(): void;
}

/*

export function synchronousWatcherFactory(
    watchValue: (
        watchKey: string,
        objectPath: string[],
        parameters: { [key: string]: unknown },
        onChanged: (watchKey: string, value: unknown) => void
    ) => void,
    unwatchValue: (watchKey: string) => void
) {
    let valueCache: Map<string, unknown> = new Map();
    let subscriptions: Map<string, Set<() => void>> = new Map();
    let lastAccesses: Map<() => void, Set<string>> = new Map();
    let curFunction: (() => void)|undefined = undefined;


    function getValue(pathHash: string) {
        if(!curFunction) {
            throw new Error(`Called getValue outside of FirebaseCache.wrapGetValue`);
        }
        let lastAccessesFnc = lastAccesses.get(curFunction);
        if(!lastAccessesFnc) {
            throw new Error(`Called getValue outside of FirebaseCache.wrapGetValue`);
        }

        lastAccessesFnc.add(pathHash);
        return valueCache.get(pathHash);
    }

    todonext;
    // Oh right... uh... firebase is fully recursive so... is that reconcilable with explicit functions?
    //  It... might not be... Oh, well... firebase should have explicit "get this data now", via a function.
    // Yep, so... in our proxy we should only get the data once they call a function. And... this solves
    //  a lot of problems.


    let values: any = proxyWrapper(

    );
    return Object.assign(synchronousWatcher, {
        values
    });
    function synchronousWatcher<
        ClassType extends
            new (...args: any[]) =>
                { render(): preact.VNode; forceUpdate(): void; }
    > (
        Class: ClassType
    ) {
        return class extends Class {
            componentWillUnmount() {
            }
            render() {

            }
        }
    }
}

*/