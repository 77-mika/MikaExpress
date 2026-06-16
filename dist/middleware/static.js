"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.staticMiddleware = staticMiddleware;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const MIME_TYPES = {
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
function staticMiddleware(dir) {
    const publicDir = path_1.default.resolve(dir);
    return (req, res, next) => {
        const relativePath = req.path.slice(1);
        const filePath = path_1.default.resolve(path_1.default.join(dir, relativePath));
        const normalizedPath = path_1.default.normalize(filePath);
        const relative = path_1.default.relative(publicDir, normalizedPath);
        if (relative.startsWith("..") || path_1.default.isAbsolute(relative)) {
            res.writeHead(403, { "Content-Type": "text/plain" });
            res.end("Access Denied");
            return;
        }
        if (!fs_1.default.existsSync(normalizedPath) ||
            !fs_1.default.statSync(normalizedPath).isFile()) {
            return next();
        }
        fs_1.default.readFile(normalizedPath, (err, data) => {
            if (err) {
                return next();
            }
            const ext = path_1.default.extname(normalizedPath);
            const mimeType = MIME_TYPES[ext] || "application/octet-stream";
            res.writeHead(200, {
                "Content-Type": mimeType,
            });
            res.end(data);
        });
    };
}
