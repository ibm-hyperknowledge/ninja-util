/**
* Copyright (c) 2016-present, IBM Research
* Licensed under The MIT License [see LICENSE for details]
*/
export = Injector;
declare function Injector(): void;
declare class Injector {
    interfaces: any[];
    graph: {};
    references: {};
    resources: {};
    methodsSet: {};
    dependencies: {};
    _aliasCallback: any;
    resourceInstances: {};
    build(): void;
    getResource(id: any): any;
    getAllResources(): any;
    addReference(reference: any): void;
    addResource(resource: any, reference?: null, dependencies?: null): void;
    readReferencesFromPath(paths: any): void;
    addReferences(references: any): void;
    addResources(resources: any): void;
    setAliasCallback(callback: any): void;
}
