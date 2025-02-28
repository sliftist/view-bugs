//require("source-map-support").install();

import * as preact from "preact";

import "!!copy-to-output!./manifest.json";
import { isChromeExtensionBootstrap, isChromeExtensionScript, g } from "./src/firebase/lib/misc";
import { UIOverlay } from "./src/UIOverlay";

import "./index.less";
import { UnionUndefined } from "./src/firebase/lib/type";
import { db } from "./db";
import { loadFile } from "./src/firebase/lib/request";

if (isChromeExtensionBootstrap()) {

    async function test() {
        let result = await loadFile(`https://view-bugs.atlassian.net/rest/api/2/permissions`);
        console.log(result);
    }

    test().catch(e => setTimeout(() => { throw e }));

    /*
    chrome.tabs.onCreated.addListener((tab) => {
        if(!tab.url) return;
        console.log(tab.url);
    });

    chrome.tabs.query({
        url: "https://perspectanalytics.atlassian.net/*"
    }, (tabs) => {
        let tab = UnionUndefined(tabs[0]);
        if(tab && tab.id) {
            chrome.tabs.executeScript(tab.id, {
                file: "./main.js"
            });
        }
    });

    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        if(!tab.url) return;
        if(tab.url.startsWith("https://perspectanalytics.atlassian.net")) {
            if(tab && tab.id) {
                chrome.tabs.executeScript(tab.id, {
                    file: "./main.js"
                });
            }
        }
    });
    */

    /*
    chrome.tabs.create({
        url: "https://perspectanalytics.atlassian.net/secure/BrowseProjects.jspa?selectedProjectType=software"
    });
    */

    /*
    chrome.browserAction.onClicked.addListener(function (tab) {
        if(!tab.id) return;
        // for the current tab, inject the "inject.js" file & execute it
        chrome.tabs.executeScript(tab.id, {
            file: "./main.js"
        });
    });
    */
} else if (isChromeExtensionScript()) {
    g.viewBugsId = (Date.now() + "." + Math.random()) || g.viewBugsId;

    let script = document.createElement("script");
    script.src = "http://localhost:8080/main.js";
    document.body.appendChild(script);

} else {
    let root = document.getElementById("view-bugs-ui-root");
    if (!root) {
        root = document.createElement("div");
        root.id = "view-bugs-ui-root";
        document.body.appendChild(root);
    }

    let url = new URL(document.location.href);
    if (!url.hostname.endsWith(".atlassian.net")) {
        preact.render(<UIOverlay />, root);
    }


    //todonext;
    // So... wait... we don't need firebase? Hmm... eh... oh well. We want... something that
    //  will convert get requests into synchronous things... but, uh... we also need the requests to
    //  occur in the extension?
    // Oh, and... we will still want regular async function things to make issues, etc.

    // So... we need to make a... polling request thing... that also supports redirection?
    //  Or, or just... a polling promise function caller?


    // obj path => path => backend request => string
    // string change => rerender
    // access <= object <= string
}


