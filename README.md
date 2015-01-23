# BoundedBroadcastDefinition

Nodejs implementation of the [broadcastDefinition
interface](https://github.com/justayak/network). It uses a bounded
growing cache to collect the unique identifier of each message. Therefore, if
the cache size is large enough, the messages are broadcast only once per peer
in the network.

## Installation

```
$ npm install bounded-broadcast-definition
```

