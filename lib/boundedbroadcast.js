var EventEmitter = require('events').EventEmitter;
var util = require('util');

var GUID = require('./guid.js');
var MBroadcast = require('./messages').MBroadcast;

util.inherits(BoundedBroadcast, EventEmitter);

/*!
 * It takes a unique value for peer and a counter to distinguish a message. The
 * number of message is bounded to a size.
 * \param source the protocol receiving the messages
 * \param max the maximum size of the cache
 */
function BoundedBroadcast(source, max) {
    EventEmitter.call(this);
    this.cache = []; this.index = -1; this.max = max || 500; // cyclic cache
    this.source = source;
    var self = this;
    this.source.on('bounded-broadcast-receive', function(socket, message){
        self.receive(message);
    });
};

/*!
 * \brief broadcast the message to all participants
 * \param message the message to broadcast
 */
BoundedBroadcast.prototype.send = function(message){
    // #1 get the neighborhood and create the message
    var links = this.source.getPeers(Number.MAX_VALUE);
    var id = GUID();
    var mBroadcast = new MBroadcast(id, message);
    // #2 register the message in the structure
    this.index = (this.index+1)%this.max;
    this.cache[this.index] = id;
    // #3 send the message to the neighborhood
    for (var i = 0; i < links.length; ++i){
        if (links[i].connected){ links[i].send(mBroadcast); };
    };
};

/*!
 * \brief receive a broadcast message
 * \param message the received message
 */
BoundedBroadcast.prototype.receive = function(message){
    if (!this.stopPropagation(message)){
        // #1 register the message
        this.index = (this.index+1)%this.max;
        this.cache[this.index] = id;
        // #2 emit the receive event with the contained message
        this.emit('receive', message.payload);
        // #3 rebroadcast
        var links = this.source.getPeers(Number.MAX_VALUE);
        for (var i = 0; i < links.length; ++i){
            if (links[i].connected){ links[i].send(message)};
        };
    };
};

/*!
 * \brief gets called when a broadcast message reaches this node.  this
 * function evaluates if the node should propagate the message further or if it
 * should stop sending it.
 * \param message a broadcast message
 * \return true if the message is already known, false otherwise
 */
BoundedBroadcast.prototype.stopPropagation = function (message) {
    var found = false, i = this.index;
    // #1 circle into the array until one turn has been done or the element
    // has been found
    while (!found &&
           (i>=0 && i<this.cache.length) &&
           (i!==((this.index+1)%this.max))){
        if (this.cache[i]===message.id){ found = true; };
        i = (i-1)%this.max;
    };
    // #2 if not found, register the message in order to drop it next time
    if (!found){
        this.index = (this.index+1)%this.max;
        this.cache[this.index] = message.id;
    };
    return found;
};

module.exports = BoundedBroadcast;
