
var Utils = require("yutils");

/*!
 * It takes a unique value for peer and a counter to distinguish a message. The
 * number of message is bounded to a size.
 * \param max the maximum size of the cache
 * @constructor
 */
function BoundedBroadcastDefinition(max) {
    this.cache = []; this.index = -1; this.max = max // cyclic cache
    this.counter = 0;
    this.address = Utils.guid(); // pseudo-unique..
}

/*!
 * \brief gets called when a broadcast message reaches this node.  this
 * function evaluates if the node should propagate the message further or if it
 * should stop sending it.
 * \param message {DecoratedMessage} the message got decorated from the
 * other peers
 * \returns  This is defined by either returning {true} (Stop) or {false}
 * (Keep propagating)
 */
BoundedBroadcastDefinition.prototype.stopPropagation = function (message) {
    var found = false, i = this.index;
    if (message.key === undefined){ return true; };
    // #1 circle into the array until one turn has been done or the element
    // has been found
    while (!found &&
           (i>=0 && i<this.cache.length) &&
           (i!==((this.index+1)%this.max))){
        if (this.cache[i]===message.key){ found = true; };
        i = (i-1)%this.max;
    };
    // #2 if not found, register the message in order to drop it next time
    if (!found){
        this.index = (this.index+1)%this.max;
        this.cache[this.index] = message.key;
    };
    return found;
};

/*!
 * \brief before a message is broadcasted, it gets decorated by the Broadcast 
 * definition. Here we can add additional values. This function only gets
 * called when a peer starts a NEW BROADCAST. It will not be called when a
 * peer simply propagates another peers broadcast.
 * \param message the undecorated message to broadcast
 * \returns a decorated message {key , payload}
 */
BoundedBroadcastDefinition.prototype.decorateBroadcastMessage =
    function (message) {
        var key = this.address + "#" + this.counter++;
        this.index = (this.index+1)%this.max;
        this.cache[this.index] = key;
        return {key: key, payload: message };
    };

/**
 * Remove the decoration of the message so that the application can interact
 * with the broadcast message transparently. This gets called whenever a
 * broadcast message hits a peer and is propagated to the application.
 * \param message the decorated message received
 */
BoundedBroadcastDefinition.prototype.removeDecoration = function (message) {
    return message.payload;
};


exports.Def = BoundedBroadcastDefinition;
