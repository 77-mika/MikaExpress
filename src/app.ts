import http, { IncomingMessage, ServerResponse, RequestListener } from "http";

interface MikaResponse extends ServerResponse {
    json(data: unknown): void;
}

type Handler = (req: IncomingMessage, res: MikaResponse) => void;
type NextFunction = () => void;
type Middleware = (
    req: IncomingMessage,
    res: MikaResponse,
    next: NextFunction,
) => void;
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
// type Handler = RequestListener;

interface Route {
    method: HttpMethod;
    path: string;
    handler: Handler;
}

export class App {
    //store routes
    private routes: Route[] = [];
    private middlewares: Middleware[] = [];
    //method to add a route
    private registerRoute(method: HttpMethod, path: string, handler: Handler) {
        this.routes.push({ method, path, handler });
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

                const method = req.method as HttpMethod;

                const mikaRes = res as MikaResponse;
                mikaRes.json = function (data: unknown) {
                    this.writeHead(200, { "Content-Type": "application/json" });
                    this.write(JSON.stringify(data));
                    this.end();
                };

                const route = this.routes.find(
                    (r) => r.method === method && r.path === req.url,
                );
                if (!route) {
                    res.writeHead(404, { "Content-Type": "text/plain" });
                    res.write("Not Found");
                    res.end();
                    return;
                }

                let middlewareIndex = 0;
                const next = () => {
                    if (middlewareIndex < this.middlewares.length) {
                        const currentMiddleware =
                            this.middlewares[middlewareIndex];
                        middlewareIndex++;
                        currentMiddleware(req, mikaRes, next);
                    } else {
                        route.handler(req, mikaRes);
                    }
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
