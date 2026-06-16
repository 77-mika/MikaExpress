import { Middleware } from "../types/http";
import fs from "fs";
import path from "path";

const MIME_TYPES: Record<string, string> = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".png": "image/png",
};

export function staticMiddleware(dir: string): Middleware {
    return (req, res, next) => {
        const relativePath = req.path.slice(1);
        const filePath = path.join(dir, relativePath);
        if (!fs.existsSync(filePath)) {
            fs.readFile(filePath, (err, data) => {
                if (err) {
                    return next();
                }
                res.end(data);
            });
            return next();
        }
        return;
    };
}
