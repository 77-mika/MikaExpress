import http, { IncomingMessage, ServerResponse } from "http";
import {
    Handler,
    HttpMethod,
    Middleware,
    MikaRequest,
    MikaResponse,
} from "./types/http";

interface Route {
    method: HttpMethod;
    path: string;
    handler: Handler;
    segments: string[];
}

export class App {
    //store routes
    private routes: Route[] = [];
    private middlewares: Middleware[] = [];
    //method to add a route
    private registerRoute(method: HttpMethod, path: string, handler: Handler) {
        const segments = path.split("/").filter(Boolean);
        this.routes.push({ method, path, handler, segments });
    }

    private matchRoute(method: HttpMethod, requestPath: string) {
        const requestSegments = requestPath.split("/").filter(Boolean);
        for (const route of this.routes) {
            if (route.method !== method) continue;
            const routeSegments = route.segments;
            if (routeSegments.length !== requestSegments.length) continue;

            const params: Record<string, string> = {};
            let isMatch = true;
            for (let i = 0; i < routeSegments.length; i++) {
                const routeSegment = routeSegments[i];
                const requestSegment = requestSegments[i];
                if (routeSegment.startsWith(":")) {
                    const paramName = routeSegment.slice(1);
                    params[paramName] = requestSegment;
                } else if (routeSegment !== requestSegment) {
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

    get(path: string, handler: Handler) {
        this.registerRoute("GET", path, handler);
    }

    post(path: string, handler: Handler) {
        this.registerRoute("POST", path, handler);
    }

    put(path: string, handler: Handler) {
        this.registerRoute("PUT", path, handler);
    }

    delete(path: string, handler: Handler) {
        this.registerRoute("DELETE", path, handler);
    }

    use(middleware: Middleware) {
        this.middlewares.push(middleware);
    }

    listen(port: number) {
        //create a server
        const server = http.createServer(
            (req: IncomingMessage, res: ServerResponse) => {
                console.log(`someone Requested : ${req.url}`);

                if (
                    !req.method ||
                    !["GET", "POST", "PUT", "DELETE"].includes(req.method)
                ) {
                    res.writeHead(405, { "Content-Type": "text/plain" });
                    res.write("Method Not Allowed");
                    res.end();
                    return;
                }

                const mikaReq = req as MikaRequest;
                const url = new URL(
                    req.url || "/",
                    `http://${req.headers.host}`,
                );
                mikaReq.query = Object.fromEntries(url.searchParams.entries());
                mikaReq.path = url.pathname;

                const method = req.method as HttpMethod;

                const mikaRes = res as MikaResponse;
                mikaRes.json = function (data: unknown) {
                    this.writeHead(200, { "Content-Type": "application/json" });
                    this.write(JSON.stringify(data));
                    this.end();
                };

                mikaRes.redirect = function (url: string) {
                    this.statusCode = 302;
                    this.setHeader("Location", url);
                    this.end();
                };

                const match = this.matchRoute(method, mikaReq.path);

                let middlewareIndex = 0;

                const next = () => {
                    if (middlewareIndex < this.middlewares.length) {
                        const currentMiddleware =
                            this.middlewares[middlewareIndex];
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
            },
        );
        //start listening
        server.listen(port, () => {
            //log a mesassage
            console.log(`Server is Listening on http://localhost:${port}`);
        });
    }
}
