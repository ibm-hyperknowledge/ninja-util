/**
* Copyright (c) 2016-present, IBM Research
* Licensed under The MIT License [see LICENSE for details]
*/
export = Timer;
declare function Timer(logger: any, method?: string): void;
declare class Timer {
    constructor(logger: any, method?: string);
    currentTime: Date;
    logger: any;
    method: string;
    getCurrentTime(): number;
    getTimeString(): string;
    restart(): void;
    tick(...args: any[]): void;
}
