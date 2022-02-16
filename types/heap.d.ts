/**
* Copyright (c) 2016-present, IBM Research
* Licensed under The MIT License [see LICENSE for details]
*/
export = Heap;
declare function Heap(): void;
declare class Heap {
    data: any[];
    push(a: any): void;
    pop(): boolean;
    top(): any;
    bubbleUp(): void;
    heapify(): void;
}
