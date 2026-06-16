"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
const http_1 = __importDefault(require("http"));
class App {
    constructor() {
        //store routes
        this.routes = [];
        this.middlewares = [];
    }
    //method to add a route
    registerRoute(method, path, handler) {
        const segments = path.split("/").filter(Boolean);
        this.routes.push({ method, path, handler, segments });
    }
    matchRoute(method, requestPath) {
        const requestSegments = requestPath.split("/").filter(Boolean);
        for (const route of this.routes) {
            if (route.method !== method)
                continue;
            const routeSegments = route.segments;
            if (routeSegments.length !== requestSegments.length)
                continue;
            const params = {};
            let isMatch = true;
            for (let i = 0; i < routeSegments.length; i++) {
                const routeSegment = routeSegments[i];
                const requestSegment = requestSegments[i];
                if (routeSegment.startsWith(":")) {
                    const paramName = routeSegment.slice(1);
                    params[paramName] = requestSegment;
                }
                else if (routeSegment !== requestSegment) {
                    isMatch = false;
                    break;
                }
            }
            if (isMatch) {
                return { route, params };
            }
        }
        return null;
    }
    get(path, handler) {
        this.registerRoute("GET", path, handler);
    }
    post(path, handler) {
        this.registerRoute("POST", path, handler);
    }
    put(path, handler) {
        this.registerRoute("PUT", path, handler);
    }
    delete(path, handler) {
        this.registerRoute("DELETE", path, handler);
    }
    use(middleware) {
        this.middlewares.push(middleware);
    }
    listen(port) {
        //create a server
        const server = http_1.default.createServer((req, res) => {
            console.log(`someone Requested : ${req.url}`);
            if (!req.method ||
                !["GET", "POST", "PUT", "DELETE"].includes(req.method)) {
                res.writeHead(405, { "Content-Type": "text/plain" });
                res.write("Method Not Allowed");
                res.end();
                return;
            }
            const mikaReq = req;
            const url = new URL(req.url || "/", `http://${req.headers.host}`);
            mikaReq.query = Object.fromEntries(url.searchParams.entries());
            mikaReq.path = url.pathname;
            const method = req.method;
            const mikaRes = res;
            mikaRes.json = function (data) {
                this.writeHead(200, { "Content-Type": "application/json" });
                this.write(JSON.stringify(data));
                this.end();
            };
            mikaRes.redirect = function (url) {
                this.statusCode = 302;
                this.setHeader("Location", url);
                this.end();
            };
            const match = this.matchRoute(method, mikaReq.path);
            let middlewareIndex = 0;
            const next = () => {
                if (middlewareIndex < this.middlewares.length) {
                    const currentMiddleware = this.middlewares[middlewareIndex];
                    middlewareIndex++;
                    currentMiddleware(mikaReq, mikaRes, next);
                    return;
                }
                if (!match) {
                    res.writeHead(404, { "Content-Type": "text/plain" });
                    res.end("Not Found");
                    return;
                }
                mikaReq.params = match.params;
                match.route.handler(mikaReq, mikaRes);
            };
            next();
        });
        //start listening
        server.listen(port, () => {
            //log a mesassage
            console.log(`Server is Listening on http://localhost:${port}`);
        });
    }
}
exports.App = App;
