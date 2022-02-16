/**
* Copyright (c) 2016-present, IBM Research
* Licensed under The MIT License [see LICENSE for details]
*/
export = NHttpError;
declare class NHttpError extends Error {
    constructor(code: any, payload: any);
    code: any;
    payload: any;
}
