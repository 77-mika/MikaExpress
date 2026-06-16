import { IncomingMessage, ServerResponse } from "http";
export interface MikaResponse extends ServerResponse {
    json(data: unknown): void;
    redirect(url: string): void;
}
export interface MikaRequest extends IncomingMessage {
    query: Record<string, string>;
    params: Record<string, string>;
    path: string;
}
export type Handler = (req: MikaRequest, res: MikaResponse) => void;
export type NextFunction = () => void;
export type Middleware = (req: MikaRequest, res: MikaResponse, next: NextFunction) => void;
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
