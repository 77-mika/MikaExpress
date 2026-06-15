import http, { IncomingMessage, ServerResponse, RequestListener } from "http";

interface MikaResponse extends ServerResponse {
    json(data: unknown): void;
}

type Handler = (req: IncomingMessage, res: MikaResponse) => void;

// type Handler = RequestListener;

interface Route {
    method: "GET";
    path: string;
    handler: Handler;
}

export class App {
    //store routes
    private routes: Route[] = [];

    //method to add a route
    get(path: string, handler: Handler) {
        this.routes.push({ method: "GET", path, handler });
    }

    listen(port: number) {
        //create a server
        const server = http.createServer(
            (req: IncomingMessage, res: ServerResponse) => {
                console.log(`someone Requested : ${req.url}`);

                const mikaRes = res as MikaResponse;
                mikaRes.json = function(data: unknown) {
                    this.writeHead(200, { "Content-Type": "application/json" });
                    this.write(JSON.stringify(data));
                    this.end();
                };

                const route = this.routes.find(
                    (r) => r.method === req.method && r.path === req.url,
                );
                if (!route) {
                    res.writeHead(404, { "Content-Type": "text/plain" });
                    res.write("Not Found");
                    res.end();
                } else {
                    route.handler(req, mikaRes);
                    return;
                }
            },
        );
        //start listening
        server.listen(port, () => {
            //log a mesassage
            console.log(`Server is Listening on http://localhost:${port}`);
        });
    }
}
