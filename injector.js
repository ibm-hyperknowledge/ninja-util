/*
 * Copyright (c) 2016-present, IBM Research
 * Licensed under The MIT License [see LICENSE for details]
 */

"use strict";


const FunctionNameRegex = /\s*function\s*([\w\d_]+)\s*\(([\w\s\,_]*)\)/;
const ClassNameRegex = /\s*class\s*([\w\d_]+)\s*(extends [\w]*)?\s*\{\s*(\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$)?\s*(constructor\s*\(([\w\s\,_]*)\))?/

function Injector()
{
    this.interfaces = [];
    this.graph = {};

    this.references = {};
    this.resources = {};
    this.methodsSet = {}; // id / Set<function>
    this.dependencies = {} // id / [dependencies]

    this._aliasCallback = null;

    this.resourceInstances = {}; // id
}

Injector.prototype.build = function()
{
    let list = topologicalSort(this.dependencies);

    _instanceResources.call(this, list);
}

Injector.prototype.getResource = function(id)
{
    if(typeof id === "function")
    {
        id = id.name;
    }
    return this.resources[id] || null;
}

Injector.prototype.getAllResources = function()
{
    return Object.values(this.resources);
}

Injector.prototype.addReference = function(reference)
{
    if(typeof reference === "function") // possible class
    {
        let methods = new Set();
        for(let k in reference.prototype)
        {
            let f = reference.prototype[k];

            if(typeof f === "function")
            {
                methods.add(k);
            }
        }

        if(methods.size > 0)
        {
            this.methodsSet[reference.name] = methods;
            this.references[reference.name] = null;
        }
    }
    else if(typeof reference === "string")
    {
        this.references[reference] = null;
    }
    else
    {
        throw "Invalid Reference type";
    }
}

Injector.prototype.addResource = function(resource, reference = null, dependencies = null)
{
    let isClass = typeof resource === "function";
    if(!reference && isClass)
    {
        // isClass = true;
        reference = _findReference.call(this, resource);
    }

    if(isClass && !reference)
    {
        reference = resource.name;
        this.addReference(resource);
    }
    else if(!reference)
    {
        throw `Invalid resource without reference: ${resource}`;
    }

    reference = typeof reference === "function" ? reference.name : reference;

    this.references[reference] = resource;

    if(isClass && !dependencies)
    {
		let classStr = resource.toString().trimLeft();
        let functionPart = null;
		let argumentIdx = null;

		if(classStr.startsWith("function"))
		{
			functionPart = FunctionNameRegex.exec(classStr);

			argumentIdx = 2;
		}
		else if(classStr.startsWith("class"))
		{
			functionPart = ClassNameRegex.exec(classStr);

			argumentIdx = 6;
		}

        if(functionPart && functionPart.length >= 2)
        {
            let args = functionPart[argumentIdx].split(",");
            for(let i = 0; i < args.length; i++)
            {
                args[i] = args[i].replace(/\s*/g, "");
            }
            dependencies = args;
        }
    }

    if(isClass && dependencies)
    {
        for(let j = dependencies.length-1; j >= 0; j--)
        {
            if(!dependencies[j])
            {
                dependencies.splice(j, 1);
            }
        }
        if(!this._aliasCallback)
        {
            this.dependencies[reference] = dependencies.slice(0);
        }
        else
        {
            let aliasedDep = [];
            for(let i = 0; i < dependencies.length; i++)
            {
                let dep = dependencies[i];
                var dependencyName = (typeof dep === 'function')? dep.name : dep;
                let alias = this._aliasCallback(dependencyName, reference);

				if(typeof alias === "function")
				{
					aliasedDep.push(alias.name);
				}
				else
				{
                	aliasedDep.push(alias);
				}
            }
            this.dependencies[reference] = aliasedDep;
        }

    }
    else
    {
        this.dependencies[reference] = [];
    }
}

Injector.prototype.readReferencesFromPath = function(paths)
{
    let references = [];
    try
    {
        for(let i = 0; i < paths.length; i++)
        {
            let p = paths[i];
            let ref = require(p);
            references.push(ref);
        }
    }
    catch(exp)
    {
        console.trace(exp);
        return;
    }
    this.addReferences(references);

}

Injector.prototype.addReferences = function(references)
{
    for(let i = 0; i < references.length; i++)
    {
        let ref = references[i];
        this.addReference(ref);
    }
}

Injector.prototype.addResources = function(resources)
{
    for(let i = 0; i < resources.length; i++)
    {
        let ref = resources[i];
        this.addResource(ref);
    }
}


Injector.prototype.setAliasCallback = function(callback)
{
    if(typeof callback === "function")
    {
        this._aliasCallback = callback;
    }
}

function _findReference(resource)
{

    // Collect method that the implementation contains
    let resourceMethods = new Set();
    for(let k in resource.prototype)
    {
        let f = resource.prototype[k];

        if(typeof f === "function")
        {
            resourceMethods.add(k);
        }
    }

    if(resourceMethods.size === 0)
    {
        return null; // stop
    }

    // Find which previous interface
    // the resource implements
    let foundRef = null;
    for(let k in this.methodsSet)
    {
        let referenceMethods = this.methodsSet[k];
        let fullfill = true;
        for(let method of referenceMethods)
        {
            if(!resourceMethods.has(method))
            {
                fullfill = false;
            }
        }
        if(fullfill)
        {
            foundRef = k;
            break;
        }
    }
    return foundRef;
}

function _instanceResources(list)
{
    for(let i = 0; i < list.length; i++)
    {
        let id = list[i];
        if(this.references.hasOwnProperty(id))
        {
            let ref = this.references[id];

            if(typeof ref === "function")
            {
                let dependencies = this.dependencies[id];

                let resourcesDependencies = [];
                for(let j = 0; j < dependencies.length; j++)
                {
                    let inst = this.resources[dependencies[j]];
                    resourcesDependencies.push(inst);
                }

                function instantiateResource (...depedencies)
                {
					return new ref(...depedencies);
                }

                let newInstance = instantiateResource.apply(null, resourcesDependencies);
                this.resources[id] = newInstance;
            }
            else if(ref !== null)
            {
                this.resources[id] = ref;
            }
            else
            {
                throw `Invalid or null resource for reference ${id}`;
            }
        }
        else
        {
            throw `Missing resource concretion for reference ${id}`;
        }
    }
}

function topologicalSort(dependencies)
{
    let list = [];
    let incomingEdges = JSON.parse(JSON.stringify(dependencies));
    let edgeLessNodes = [];
    let outComingEdges = {};

    // Collect edgeLessNodes
    for(let k in incomingEdges)
    {
        let node = incomingEdges[k];
        if(node.length === 0)
        {
            edgeLessNodes.push(k);
            delete incomingEdges[k];
        }
        else
        {
            for(let i = 0; i < node.length; i++)
            {
                let dep = node[i];
                if(!outComingEdges.hasOwnProperty(dep))
                {
                    outComingEdges[dep] = [k];
                }
                else
                {
                    outComingEdges[dep].push(k);
                }
            }
        }
    }

    while(edgeLessNodes.length > 0)
    {
        let n = edgeLessNodes[edgeLessNodes.length-1];
        edgeLessNodes.splice(edgeLessNodes.length-1, 1);
        list.push(n);

        if(outComingEdges.hasOwnProperty(n))
        {
            let out = outComingEdges[n];
            for(let i = 0; i < out.length; i++)
            {
                let o = out[i];
                if(incomingEdges.hasOwnProperty(o))
                {
                    let inc = incomingEdges[o];
                    let idx = inc.indexOf(n);

                    if(idx >= 0)
                    {
                        inc.splice(idx, 1);
                    }

                    if(inc.length === 0)
                    {
                        edgeLessNodes.push(o);
                        delete incomingEdges[o];
                    }
                }
            }
            delete outComingEdges[n];
        }
    }

    if(Object.keys(outComingEdges).length !== 0)
    {
        let err = "Dependency injection failed! \n";

        let unresolvedDependencies = "Unresolved dependencies: \n";
        let missingDependencies = new Set();

        // Look for missing dependencies
        for(let i in incomingEdges)
        {
            let remainingDependecies = incomingEdges[i];
            for(let i =0; i < remainingDependecies.length; i++)
            {
                let r = remainingDependecies[i]
                if(!incomingEdges.hasOwnProperty(r))
                {
                    missingDependencies.add(r);
                }
            }

            // Collect unresolved
            unresolvedDependencies += `${i} -> ${JSON.stringify(incomingEdges[i])} \n`;
        }

        // Look for possible cycles
        if(missingDependencies.size > 0)
        {
            err += `Missing dependencies:\n${JSON.stringify(Array.from(missingDependencies))} \n`;
        }
        else
        {
            let cycle = findCycle(incomingEdges);
            if(cycle.length > 0)
            {
                err += `Found circular dependency:\n${JSON.stringify(Array.from(cycle))} \n`;
            }
        }

        err += unresolvedDependencies;

        throw err;
    }
    return list
}

function recursiveFindCycle(node, graph, visited, out)
{
    if(!visited.has(node))
    {
        visited.add(node);
    }
    else
    {
        out.push(node);
        return true;
    }

    let adjacents = graph[node];
    for(let i = 0; i < adjacents.length; i++)
    {
        let found = recursiveFindCycle(adjacents[i], graph, visited, out);
        if(found)
        {
            out.push(node);
            return true;
        }
    }
    return false;
}

function findCycle(graph)
{
    let visited = new Set();
    let anyNode = Object.keys(graph)[0];
    let out = [];

    recursiveFindCycle(anyNode, graph, visited, out);
    return out;
}

module.exports = Injector;
