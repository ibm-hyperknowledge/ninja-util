/**
* Copyright (c) 2016-present, IBM Research
* Licensed under The MIT License [see LICENSE for details]
*/
export = SyncJWTAuth;
declare class SyncJWTAuth {
    constructor(secret: any);
    _secret: any;
    _token: any;
    setAuth(token: any): void;
    sign(message: any): any;
    verify({ bearer }: {
        bearer: any;
    }): any;
}
