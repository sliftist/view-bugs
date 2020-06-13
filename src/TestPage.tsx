import * as preact from "preact";
import { db } from "../db";
import { proxyWrapper, isProxy } from "./proxyWrapper";
import { jsxWalk } from "./jsxWalk";
import { V4MAPPED } from "dns";
import * as firebase from "firebase/app";
import { FirebaseCache } from "./firebase/FirebaseCache";
import { firebaseWatcher, fireData } from "./firebase/firebaseWatcher";

@firebaseWatcher
export class TestPage extends preact.Component<{}, {}> {
    render() {
        return (
            <div>
                <button onClick={() => {
                    fireData().nested.z++;
                }}>
                    Test
                </button>
                {fireData().nested.z}
            </div>
        );
        /*
        return jsxWalk(
            <div>
                test 2
                <div>
                    test: {JSON.stringify(proxy.test)}
                </div>
                <div>
                    b: {proxy.b}
                </div>
            </div>
        , (node) => {
            if(node && typeof node === "function" && isProxy in node) {
                console.log("proxy", node);
                return "proxy";
            }
            //console.log(node);
            return node;
        });
        */
        /*
        return (
            <div>
                test 2
                <div>
                    a: {proxy.a}
                </div>
                <div>
                    b: {proxy.b}
                </div>
            </div>
        );
        */
    }
}