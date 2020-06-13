require("source-map-support").install();

import * as preact from "preact";
import { TestPage } from "./src/TestPage";

import "./index.less";

preact.render(
    <body><TestPage /></body>,
    document.body
);