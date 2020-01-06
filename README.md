# Ninja-Util

This library has a set of helper classes and functions that are shared by our application following common patterns that we use on them. We mostly use `MVC`, `SOLID` and `Observer Pattern`.


## Callback

Wraps a callback to be executed, check if it is a valid function and execute without exceptions.

```js
const {Callback} = require("ninja-util");
Callback.invoke(aCallback); 
```

## Express Wrapper

Wraps the http methods from the express and automatically set the  response based on the callback invoked by the application

Examples:
```

const { ExpressWrapper } = require ('ninja-util');

```

## Heap

> TODO

## Logger

Useful to logs the application to make easier to turn on and turn off logs.

`TODO: document`
## Memory


```js
const Memory = require("ninja-util/memory");
```

#### checkMemory([log]) 
> NOTE: Node only

Logs the memory from the node application

Example:
```js
memory.checkMemory("now")
```

Posibble Output:
```
now 5.5186767578125
```

#### compreensiveBytes(bytesCount) 

Example
```js
console.log(memory.compreensiveBytes(42))
console.log(memory.compreensiveBytes(42000))
console.log(memory.compreensiveBytes(42000000))
```

Output:
```
42b
41.02kb
40.05mb
```

#### getCurrentMemory([asNumber])

Returns the current footprint from the node application. If `asNumber` is set true, it will return in a number as bytes. Otherwise, it will convert using the `compreensiveBytes`, default is false.

Example:
```
 memory.getCurrentMemory()
 memory.getCurrentMemory(true)
```

Possible Output:

```
5.84mb
6244264
```

## Observer

> TODO

## Promisify

> TODO

## SyncClient

> TODO

## SyncServer

> TODO

## Timer

> TODO