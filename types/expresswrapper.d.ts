/**
* Copyright (c) 2016-present, IBM Research
* Licensed under The MIT License [see LICENSE for details]
*/
export = ExpressWrapper;
declare function ExpressWrapper(app: any): void;
declare class ExpressWrapper {
    constructor(app: any);
    auth_mode: number;
    auth_arg: any;
    app: any;
    logLevel: number;
    logOptions: {};
    console: Console;
    setConsole(c: any): void;
    setLogLevel(level: any, options: any): void;
    logRequest(req: any): void;
    logResponse(req: any, code: any, data: any): void;
    setAuthMode(...args: any[]): boolean;
    get(route: any, streamResponse: any, callback: any): void;
    post(route: any, streamResponse: any, callback: any): void;
    put(route: any, streamResponse: any, callback: any): void;
    delete(route: any, streamResponse: any, callback: any): void;
    getApp(): any;
}
declare namespace ExpressWrapper {
    const AUTH_NONE: number;
    const AUTH_SECRET: number;
    const AUTH_CERT: number;
    const AUTH_JUST_DECODE: number;
    const LOG_NONE: number;
    const LOG_REQUESTS: number;
}
