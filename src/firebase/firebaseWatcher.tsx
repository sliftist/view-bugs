import * as preact from "preact";

import * as firebase from "firebase/app";
import "firebase/auth";

import { FirebaseCache } from "./FirebaseCache";
import { db } from "../../db";
import { render } from "preact";
import { proxyWrapper, isProxy } from "../proxyWrapper";
import { jsxWalk } from "../jsxWalk";
import { isChromeExtensionBootstrap } from "./lib/misc";
import { rootPromise } from "./lib/promise";

let firebaseCache = new FirebaseCache(db);

export function authNow() {
    let provider = new firebase.auth.GoogleAuthProvider();
    let unsub = firebase.auth().onAuthStateChanged((user) => {
        if(user === null) {
            rootPromise(firebase.auth().signInWithPopup(provider));
        }
        unsub();
    });
}

if(db) {
    firebase.auth().onAuthStateChanged((user) => {
        firebaseCache.forceSetValue("/authuseremail", user?.email || undefined);
    });
}

let proxy: any = proxyWrapper(
    (pathHash) => {
        return firebaseCache.getValue(pathHash);
    },
    (pathHash) => {
        firebaseCache.cancelGetValue(pathHash);
    },
    (pathHash, value) => {
        firebaseCache.getValue(pathHash);
        rootPromise(db.database().ref(pathHash).set(value));
    }
);

export function fireData(): FirebaseData {
    return proxy;
}

export function eventWrite(callback: () => void) {
    firebaseCache.wrapGetValue(callback, lastEventCallback);
}

// TODO: Make it so the FirebaseCache supports accessing values with:
//  1) Not creating subscriptions
//  2) Throwing if values that we not previous accessed were accessed
// And then use that instead of this dummy callback
function lastEventCallback() { }

export function firebaseWatcher<
    ClassType extends
        new (...args: any[]) =>
            { render(): preact.VNode; forceUpdate(): void; }
> (
    Class: ClassType
) {
    return class extends Class {
        componentWillUnmount() {
            firebaseCache.wrapGetValue(() => {}, this.forceUpdateCallback);
        }

        parentRender = () => {
            let result = super.render();
            return jsxWalk(result, (node) => {
                // Event callbacks are special. They may make reads, and as they aren't async, they can't
                //  wait for the reads to complete, so... we pre-run them to pre-load the data.
                if(node && typeof node === "object" && "type" in node) {
                    if(typeof node.type === "string") {
                        for(let key in node.props) {
                            let value = node.props[key];
                            if(typeof value === "function") {
                                let valueFnc: Function = value;
                                node.props[key] = function() {
                                    console.log(`Clicked on ${key} for`, node);
                                    return firebaseCache.wrapGetValue(() => {
                                        return valueFnc.apply(node.props, arguments);
                                    }, lastEventCallback);
                                };
                            }
                        }
                    }
                }
                if(node && typeof node === "function" && isProxy in node) {
                    return undefined;
                }
                //console.log(node);
                return node;
            });
        };

        forceUpdateCallback = () => {
            this.forceUpdate();
        };

        render() {
            try {
                return firebaseCache.wrapGetValue(this.parentRender, this.forceUpdateCallback);
            } catch(e) {
                return (
                    <div style={{ "white-space": "pre-wrap" }}>
                        {e.stack}
                    </div>
                )
            }
        }
    }
}