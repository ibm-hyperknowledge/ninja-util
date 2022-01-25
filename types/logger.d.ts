/**
* Copyright (c) 2016-present, IBM Research
* Licensed under The MIT License [see LICENSE for details]
*/
export function Logger(enable: any): void;
export class Logger {
    constructor(enable: any);
    setEnabled(enable: any): void;
    _isEnabled: any;
    log(...log: any[]): void;
    error(...log: any[]): void;
    _msg(...log: any[]): string[];
}
