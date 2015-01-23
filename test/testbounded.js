var expect = require('expect.js');
var Mocha  = require('mocha');

var BoundedBroadcastDefinition = require('../index.js').Def;

describe('index.js', function() {
    
    describe('initialization', function(){
	it('should create an empty object', function(){
	    var bbd = new BoundedBroadcastDefinition(42);
            expect(bbd.cache.length).to.be.eql(0);
            expect(bbd.index).to.be.eql(-1);
            expect(bbd.max).to.be.eql(42);
            expect(bbd.counter).to.be.eql(0);
        });
    });

    describe('decorateBroadcastMessage', function(){
        it('should increment the counter and put the new key at cache[0]',
           function(){
               var bbd = new BoundedBroadcastDefinition(42);
               var msg = bbd.decorateBroadcastMessage("hello world");
               expect(bbd.cache.length).to.be.eql(1);
               expect(bbd.index).to.be.eql(0);
               expect(bbd.counter).to.be.eql(1);
               expect(bbd.cache[0]).to.be.eql(msg.key);
           });

        it('should not exceed the size of the cache', function(){
            var bbd = new BoundedBroadcastDefinition(42);
            for (var i = 0; i<1337; ++i){
                bbd.decorateBroadcastMessage("Meow :3");
            };
            expect(bbd.cache.length).to.be.eql(42);
            expect(bbd.index).to.be.eql((1337-1)%42);
            expect(bbd.counter).to.be.eql(1337);
        });
    });

    describe("stopPropagation",function(){
        it("should not stop a new message", function(){
            var bbd = new BoundedBroadcastDefinition(42);
            var mustStop = bbd.stopPropagation({key:"Meow"});
            expect(mustStop).to.not.be.ok();
        });

        it("should stop the propagation of an already known message",
           function(){
               var bbd = new BoundedBroadcastDefinition(42);
               var mustStop = bbd.stopPropagation({key:"Mew"});
               expect(mustStop).to.not.be.ok();
               mustStop = bbd.stopPropagation({key:"Mew"});
               expect(mustStop).to.be.ok();
           });
    });
    
});
