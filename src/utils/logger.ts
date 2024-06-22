import { Request } from "express";

export function logRequest(request: Request) {
    console.log(`[s]: ${request.method} ${request.url}`);
}
