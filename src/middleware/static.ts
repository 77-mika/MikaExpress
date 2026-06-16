import { Middleware } from "../types/http";
import fs from "fs";
import path from "path";

const MIME_TYPES: Record<string, string> = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
};

export function staticMiddleware(dir: string): Middleware {
    const publicDir = path.resolve(dir);

    return (req, res, next) => {
        const relativePath = req.path.slice(1);
        const filePath = path.resolve(path.join(dir, relativePath));
        const normalizedPath = path.normalize(filePath);

        const relative = path.relative(publicDir, normalizedPath);

        if (relative.startsWith("..") || path.isAbsolute(relative)) {
            res.writeHead(403, { "Content-Type": "text/plain" });
            res.end("Access Denied");
            return;
        }

        if (
            !fs.existsSync(normalizedPath) ||
            !fs.statSync(normalizedPath).isFile()
        ) {
            return next();
        }

        fs.readFile(normalizedPath, (err, data) => {
            if (err) {
                return next();
            }

            const ext = path.extname(normalizedPath);
            const mimeType = MIME_TYPES[ext] || "application/octet-stream";

            res.writeHead(200, {
                "Content-Type": mimeType,
            });

            res.end(data);
        });
    };
}
