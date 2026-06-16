"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.staticMiddleware = void 0;
exports.default = mikaexpress;
const app_1 = require("./app");
var static_1 = require("./middleware/static");
Object.defineProperty(exports, "staticMiddleware", { enumerable: true, get: function () { return static_1.staticMiddleware; } });
function mikaexpress() {
    return new app_1.App();
}
