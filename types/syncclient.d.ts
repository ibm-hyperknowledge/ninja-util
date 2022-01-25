/**
* Copyright (c) 2016-present, IBM Research
* Licensed under The MIT License [see LICENSE for details]
*/
export = SyncClient;
declare function SyncClient(url: any, authenticator: any): void;
declare class SyncClient {
    constructor(url: any, authenticator: any);
    _ws: any;
    pendingMessages: any[];
    user: any;
    session: any;
    sessionState: any;
    closed: boolean;
    authenticator: any;
    authEnabled: boolean;
    _tries: number;
    _url: any;
    connectToSession(user: any, session: any): void;
    sendMessage(type: any, data: any, session?: undefined): void;
    connect(): void;
    closeSession(): void;
    disableAuth(): void;
}
