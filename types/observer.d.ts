/**
* Copyright (c) 2016-present, IBM Research
* Licensed under The MIT License [see LICENSE for details]
*/
export function initSubject(subject: any): void;
export function notify(subject: any, method: any, arg1: any, ...arg2: any[]): void;
export function addObserver(subject: any, observer: any): void;
export function removeObserver(subject: any, observer: any): void;
