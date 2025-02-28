import * as preact from "preact";
import { db } from "../db";
import { proxyWrapper, isProxy } from "./proxyWrapper";
import { jsxWalk } from "./jsxWalk";
import { V4MAPPED } from "dns";
import { FirebaseCache } from "./firebase/FirebaseCache";
import { firebaseWatcher, fireData, authNow } from "./firebase/firebaseWatcher";

import "./UIOverlay.less";

// https://view-bugs.atlassian.net/rest/api/2/permissions
// https://view-bugs.atlassian.net/rest/api/2/search?jql=text%20~%20%22test%22
// https://view-bugs.atlassian.net/rest/api/2/search?jql=text%20~%20%22test%22&fields=summary

@firebaseWatcher
export class UIOverlay extends preact.Component<{}, {}> {
    render() {
        return (
            <div className="UIOverlay">
                <button onClick={() => authNow()}>
                    Auth
                </button>
                <button onClick={() => {
                    fireData().nested.z++;
                }}>
                    Test
                </button>
                {fireData().nested.z}
                <div>
                    Email: {fireData().authuseremail}
                </div>
            </div>
        );
    }
}