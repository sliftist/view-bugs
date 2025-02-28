export function rootPromise(promise: Promise<unknown>) {
    promise.catch(e => {
        setTimeout(() => {
            throw e
        });
    });
}