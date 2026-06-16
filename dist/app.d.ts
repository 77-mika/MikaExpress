import { Handler, Middleware } from "./types/http";
export declare class App {
    private routes;
    private middlewares;
    private registerRoute;
    private matchRoute;
    get(path: string, handler: Handler): void;
    post(path: string, handler: Handler): void;
    put(path: string, handler: Handler): void;
    delete(path: string, handler: Handler): void;
    use(middleware: Middleware): void;
    listen(port: number): void;
}
