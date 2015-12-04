(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.boxer = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
* Component
*
* A simple API for all Components that operate via the Engine.
* This class should contain properties shared by all Components,
* for example DOMComponent, SVGComponent, and MeshComponent.
*
* by Steve Belovarich
* Licensed under MIT, see license.txt or http://www.opensource.org/licenses/mit-license.php
**/

var Component = function(node){
    this.node = node ? node : null;
};

module.exports = Component;

},{}],2:[function(require,module,exports){
/**
* DOMComponent
*
* Handles updating a 4x4 Matrix mapped to Matrix3D transforms on a DOMElement.
*
* by Steve Belovarich
* Licensed under MIT, see license.txt or http://www.opensource.org/licenses/mit-license.php
**/

var Component = require('./Component');
var Matrix = require('../math/Matrix');

var DOMComponent = function(node, elem, container){

    this.node = node.id ? node.id : node;
    this._node = node;
    this.elem = elem ? document.createElement(elem) : document.createElement('div');

    var container = container ? container : document.body;

    this.elem.dataset.node = this.node;
    this.elem.classList.add(this.node);
    this.elem.classList.add('node');
    container.appendChild(this.elem);

    Object.observe(this._node, function(changes){
        this.transform(this._node);
    }.bind(this));

    var prefix = function () {

      var styles = window.getComputedStyle(document.documentElement, ''),
        transform,
        origin,
        perspective,
        pre = (Array.prototype.slice
          .call(styles)
          .join('')
          .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
        )[1],
        dom = ('WebKit|Moz|MS|O').match(new RegExp('(' + pre + ')', 'i'))[1];
        if(dom ==='Moz'){
          transform = 'transform';
          origin = 'transformOrigin';
          perspective = 'perspective';
        } else if(dom ==='WebKit'){
          transform = 'webkitTransform';
          origin = 'webkitTransformOrigin';
          perspective = 'perspective';
        } else if(dom ==='MS'){
          transform = 'msTransform';
          origin = 'msTransformOrigin';
          perspective = 'perspective';
        } else if (dom ==='O'){
          transform = 'OTransform';
          origin = 'transformOrigin';
          perspective = 'perspective';
        } else {
          transform = 'transform';
          origin = 'transformOrigin';
          perspective = 'perspective';
        }
      return {
        dom: dom,
        lowercase: pre,
        css: '-' + pre + '-',
        js: pre[0].toUpperCase() + pre.substr(1),
        transform: transform,
        origin: origin
      };

    };

    this.vendor = prefix();

    if(node.content) {
      this.setContent(node.content);
    }

    if(node.classes) {
      for(var i=0; i<node.classes.length; i++){
        this.addClass(node.classes[i]);
      }
    }

    this.transform(node);
};

DOMComponent.prototype = Object.create(Component.prototype);
DOMComponent.prototype.constructor = Component;

DOMComponent.prototype.configure = function(n){

  n.origin = n.origin || [0.0,0.0,0.0];
  n.align = n.align || [0.0,0.0,0.0];
  n.size = n.size || [1.0,1.0,1.0];
  n.scale = n.scale || [1.0,1.0,1.0];
  n.rotate = n.rotate || [0,0,0];
  n.opacity = n.opacity || 1.0;

}

DOMComponent.prototype.isInt = function(n){

    return Number(n) === n && n % 1 === 0;

}

DOMComponent.prototype.isFloat = function(n){

    if(n === parseFloat(1.0)) return true;
    return n === Number(n) && n % 1 !== 0;

}

DOMComponent.prototype.setContent = function(content){

  this.elem.innerHTML = content;

}

DOMComponent.prototype.addClass = function(cl){

  this.elem.classList.add(cl);

}

DOMComponent.prototype.removeClass = function(cl){

  this.elem.classList.remove(cl);

}

DOMComponent.prototype.degreesToRadians = function(degrees) {

  return degrees * (Math.PI / 180);

};

DOMComponent.prototype.transform = function(node){

  var d = this;

  if(node.origin) {

    this.elem.style[this.vendor.origin] = (node.origin[0]*100)+'% '+(node.origin[1]*100)+'%';

  }


  if(node.size) {

    if(node.size[0] === 1) node.size[0] = parseFloat(1.0);
    if(node.size[1] === 1) node.size[1] = parseFloat(1.0);

    if(node.size[0] === null) {
        this.elem.style.width = node.size[1]*100+'vh';
    } else if(node.size[0] === 'auto') {
        this.elem.style.width = 'auto';
    } else {
        this.isFloat(node.size[0]) ? this.elem.style.width = node.size[0]*100+'%' : this.elem.style.width = node.size[0]+'px';
    }
    if(node.size[1] === null) {
        this.elem.style.height = node.size[0]*100+'vw';
    } else if(node.size[1] === 'auto') {
        this.elem.style.height = 'auto';
    } else {
        this.isFloat(node.size[1]) ? this.elem.style.height = node.size[1]*100+'%' : this.elem.style.height = node.size[1]+'px';
        // console.log(node.size[1]*100+'%');
        // this.elem.style.height = node.size[1]*100+'%';
    }

    //TODO: fix isFloat and isInt, its not working!

  }

  if(node.opacity) {

    this.elem.style.opacity = node.opacity;

  }

  if(node.position) {

    this.elem.style.position = node.position;

  }

  if(node.transform) {

    this.elem.style[this.vendor.transform] = node.transform;

  } else {

  var matrix = new Matrix();

  if(node.translate && node.align) {

    matrix = matrix.translate((node.align[0] * this.elem.parentNode.clientWidth)+node.translate[0], (node.align[1] * this.elem.parentNode.clientHeight)+node.translate[1], node.align[2]+ node.translate[2] === 0 ? 1 : node.translate[2] );

  } else if(node.align) {

    matrix = matrix.translate(node.align[0] * this.elem.parentNode.clientWidth, node.align[1] * this.elem.parentNode.clientHeight, node.align[2] );

  } else if(node.translate) {

    matrix = matrix.translate(node.translate[0], node.translate[1], node.translate[2] === 0 ? 1 : node.translate[2]);

  } else {

    matrix = matrix.translate(0, 0, 1);

  }

  if(node.scale) {

      matrix.scale(node.scale[0] || 1, node.scale[1] || 1, node.scale[2] || 1);

  }
  if(node.rotate) {

      if(node.rotate[0]) {
        matrix = matrix.rotateX(d.degreesToRadians(node.rotate[0]));
      }
      if(node.rotate[1]) {
        matrix = matrix.rotateY(d.degreesToRadians(node.rotate[1]));
      }
      if(node.rotate[2]) {
        matrix = matrix.rotateZ(d.degreesToRadians(node.rotate[2]));
      }

  }

  this.elem.style[this.vendor.transform] = matrix.toString();

  }

};

DOMComponent.prototype.setPerspective = function(p){

  this.elem.style['perspective'] = p;

};

DOMComponent.prototype.sync = function(sync){

  this.sync = sync;
  //TODO: Make a Sync Class and properly sync mousewheel and touch drag

};


DOMComponent.prototype.resize = function(){

  this.transform(this._node);

};

module.exports = DOMComponent;

},{"../math/Matrix":12,"./Component":1}],3:[function(require,module,exports){
module.exports = {
    Component: require('./Component'),
    DOMComponent: require('./DOMComponent')
};

},{"./Component":1,"./DOMComponent":2}],4:[function(require,module,exports){
/**
* Engine
*
* A simple Rendering Engine that uses requestAnimationFrame to update.
*
* by Steve Belovarich
* Licensed under MIT, see license.txt or http://www.opensource.org/licenses/mit-license.php
**/

var Engine = function(){

    this.time = 0;
    this._worker = null;
    this.updateQueue = [];

}

Engine.prototype.init = function(worker){
    window.requestAnimationFrame(this.tick.bind(this));
    if(worker){
        this._worker = worker;
    }
    if(worker.constructor.name === 'Worker'){
        this._worker.postMessage({init:'done'});
    }
}

Engine.prototype.tick = function(time){

    var item;
    this.time = performance.now();

    if(this._worker.constructor.name === 'Worker'){
      this._worker.postMessage({frame:this.time});
    } else {
      this._worker.tick(time);
    }

    while (this.updateQueue.length) {
      item = this.updateQueue.shift();
      if (item && item.update) item.update(this.time);
      if (item && item.onUpdate) item.onUpdate(this.time);
    }

    window.requestAnimationFrame(this.tick.bind(this));

}


module.exports = new Engine();

},{}],5:[function(require,module,exports){
/**
* Node
*
* A model that determines properties that can be animated or changed performantly.
* This model can be applied to Components that use it to animate DOMElement or Mesh.
*
* by Steve Belovarich
* Licensed under MIT, see license.txt or http://www.opensource.org/licenses/mit-license.php
**/

var Transitionable = require('../transitions/Transitionable');
var Curves = require('../transitions/Curves');

var _observableCallback = {};

var Node = function(conf, parent){

    this.transitionables = {};

    if(conf){
        this.serialize(conf);
    } else {
        this.setDefaults();
    }
    parent ? this.parent = parent : this.parent = null;

};

Node.prototype.setDefaults = function(conf){
    this.position = 'absolute';
    this.translate = null;
    this.origin = [0.0,0.0,0.0];
    this.align = null;
    this.size = [0,0,0];
    this.scale = [1.0,1.0,1.0];
    this.rotate = [0,0,0];
    this.opacity = 1.0;
    this.transform = null;
};

Node.prototype.serialize = function(conf){
    this.id = conf.id ? conf.id : null;
    this.position = conf.position ? conf.position : 'absolute';
    this.translate = conf.translate ? conf.translate : null;
    this.origin = conf.origin ? conf.origin : [0.0,0.0,0.0];
    this.align = conf.align ? conf.align : null;
    this.size = conf.size ? conf.size : [0,0,0];
    this.scale = conf.scale ? conf.scale : [1.0,1.0,1.0];
    this.rotate = conf.rotate ? conf.rotate : [0,0,0];
    this.opacity = conf.opacity ? conf.opacity : 1.0;
    this.transform = conf.transform ? conf.transform : null;
    this.observe(this.id, this);
    conf.transition ? this.setTransitionable(conf.transition) : false;
};

Node.prototype.getProperties = function(){
    return {
        position: this.position,
        translate: this.translate,
        origin: this.origin,
        align: this.align,
        size: this.size,
        scale: this.scale,
        rotate: this.rotate,
        opacity: this.opacity,
        transitionables: this.transitionables//,
        //observables: this.observables
    }
};

Node.prototype.setPosition = function(pos){
    this.position = pos;
};

Node.prototype.getPosition = function(){
    return this.position;
};

Node.prototype.setTranslation = function(pos){
    this.translate = pos;
};

Node.prototype.getTranslation = function(){
    return this.translate;
};

Node.prototype.setSize = function(size){
    this.size = size;
};

Node.prototype.getSize = function(){
    return this.size;
};

Node.prototype.setScale = function(scale){
    this.scale = scale;
};

Node.prototype.getScale = function(){
    return this.scale;
};

Node.prototype.setOrigin = function(origin){
    this.origin = origin;
};

Node.prototype.getOrigin = function(){
    return this.origin;
};

Node.prototype.setAlign = function(align){
    this.align = align;
};

Node.prototype.getAlign = function(){
    return this.align;
};

Node.prototype.setRotation = function(rotation){
    this.rotation = rotation;
};

Node.prototype.getRotation = function(){
    return this.rotation;
};

Node.prototype.setOpacity = function(opacity){
    this.opacity = opacity;
};

Node.prototype.getOpacity = function(){
    return this.opacity;
};

Node.prototype.transition = function(conf) {
  this.setTransitionable(conf);
};

Node.prototype.setTransitionable = function(conf){
    var n  = this;

    n.transitionables[conf.key] = conf;
    n.transitionables[conf.key].transition = new Transitionable(conf.from);
    n.transitionables[conf.key].transition.set(conf.to);
    //n.transitionables[conf.key].transition.set(conf.to);
    if(conf.delay) {
      n.transit(conf);
    } else {
      n.transitionables[conf.key]
       .transition
       .from(conf.from)
       .to(conf.to, conf.curve, conf.duration);
    }

    this[conf.key] = conf.to;

    n.transitionables[conf.key].transition.id = this.id;
    n.transitionables[conf.key].transition.param = conf.key;
    this.observe(conf.key, n.transitionables[conf.key].transition.get(), conf);

    //TODO: figure out a better way to update Transitionable
    //TODO: unobserve object, clearInerval


};

Node.prototype.transit = function(conf){
    var n  = this;
    if(conf.delay) {

      n.transitionables[conf.key].transition.from(conf.from).delay(conf.delay).to(conf.to, conf.curve, conf.duration);
    }
};

Node.prototype.observe = function(id, obj, conf) {
      var n = this;

      _observableCallback[id] = function(changes){
          changes.forEach(function(change) {
            if(change.type === 'update' && change.name !== 'id') {

              if(change.object.constructor.name === 'Array'){

                n.parent.update({
                              message:{
                                prop: id,
                                val: change.object
                              },
                              node: n.id
                            });
              }
              else if(change.object.constructor.name === 'Transitionable'){
                n[change.object.param] = change.oldValue;
              } else {
                n.parent.update({
                              message:{
                                prop: change.name,
                                val: change.oldValue
                              },
                              node: n.id
                            });
              }

            }
          });
      };

      Object.observe(obj, _observableCallback[id]);

};

Node.prototype.unobserve = function(param) {
    Object.unobserve(this, _observableCallback[this.id]);
};


Node.prototype.eventManager = function(){

  var events = {};
  var hasEvent = events.hasOwnProperty;

  return {
    sub: function(ev, listener) {

      this.observe(ev, this);
      // Create the event's object if not yet created
      if(!hasEvent.call(events, ev)) events[ev] = [];

      // Add the listener to queue
      var index = events[ev].push(listener) - 1;

      // Provide handle back for removal of topic
      return {
        remove: function() {
          this.unobserve(ev);
          delete events[ev][index];
        }
      };
    },
    pub: function(ev, info) {
      // If the event doesn't exist, or there's no listeners in queue, just leave
      if(!hasEvent.call(events, ev)) return;

      // Cycle through events queue, fire!
      events[ev].forEach(function(item) {
      		item(info != undefined ? info : {});
      });
    }
  };
};

Node.prototype.update = function(frame){
  for(var id in this.transitionables) {
    this.transitionables[id].transition.get();
  }
};

module.exports = Node;

},{"../transitions/Curves":18,"../transitions/Transitionable":19}],6:[function(require,module,exports){
/**
* Scene
*
* API for storing Nodes on a Scene Graph. Currently the Scene is flat, but that could very well change in the near future to keep track of parent child relationships between Nodes.
*
* by Steve Belovarich
* Licensed under MIT, see license.txt or http://www.opensource.org/licenses/mit-license.php
**/

var cxt = self;

var Scene = function(graph){

    this.graph = graph || {};
    this.length = 0;

}

Scene.prototype.init = function(worker) {
    if(worker){
        this.worker = worker;
    }
    console.log(this.worker);
}

Scene.prototype.addChild = function(node){
    node.id = node.id || 'node-'+this.length;
    this.length++;
    this.graph[node.id] = node;
}


Scene.prototype.fetchNode = function(id) {
    return this.graph[id];
}

Scene.prototype.find = function(query) {
    var queryArray = [];
    for(q in query){
        for(prop in this.graph) {
            for(p in this.graph[prop]){
                if (p === q && this.graph[prop][p] === query[q]) {
                    queryArray.push(this.graph[prop]);
                }
            }
        }
    }
    return queryArray;
}

Scene.prototype.findOne = function(query) {

    for(q in query){
        for(prop in this.graph) {
            for(p in this.graph[prop]){
                if (p === q && this.graph[prop][p] === query[q]) {
                    return this.graph[prop];
                }
            }
        }
    }

}

Scene.prototype.tick = function(frame){
  for(var node in this.graph) {
    this.graph[node].update(frame);
  }
}

Scene.prototype.update = function(change){
  // if(cxt.constructor.name === 'DedicatedWorkerGlobalScope') {
  //   cxt.postMessage(JSON.parse(JSON.stringify(change)));
  // } else {
    this.onmessage(JSON.parse(JSON.stringify(change)));
  // }
}

module.exports = new Scene();

},{}],7:[function(require,module,exports){
/*
  Tested against Chromium build with Object.observe and acts EXACTLY the same,
  though Chromium build is MUCH faster

  Trying to stay as close to the spec as possible,
  this is a work in progress, feel free to comment/update

  Specification:
    http://wiki.ecmascript.org/doku.php?id=harmony:observe

  Built using parts of:
    https://github.com/tvcutsem/harmony-reflect/blob/master/examples/observer.js

  Limits so far;
    Built using polling... Will update again with polling/getter&setters to make things better at some point

TODO:
  Add support for Object.prototype.watch -> https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/watch
*/
if(!Object.observe){
  (function(extend, global){
    "use strict";
    var isCallable = (function(toString){
        var s = toString.call(toString),
            u = typeof u;
        return typeof global.alert === "object" ?
          function isCallable(f){
            return s === toString.call(f) || (!!f && typeof f.toString == u && typeof f.valueOf == u && /^\s*\bfunction\b/.test("" + f));
          }:
          function isCallable(f){
            return s === toString.call(f);
          }
        ;
    })(extend.prototype.toString);
    // isNode & isElement from http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
    //Returns true if it is a DOM node
    var isNode = function isNode(o){
      return (
        typeof Node === "object" ? o instanceof Node :
        o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName==="string"
      );
    }
    //Returns true if it is a DOM element
    var isElement = function isElement(o){
      return (
        typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
        o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string"
    );
    }
    var _isImmediateSupported = (function(){
      return !!global.setImmediate;
    })();
    var _doCheckCallback = (function(){
      if(_isImmediateSupported){
        return function _doCheckCallback(f){
          return setImmediate(f);
        };
      }else{
        return function _doCheckCallback(f){
          return setTimeout(f, 10);
        };
      }
    })();
    var _clearCheckCallback = (function(){
      if(_isImmediateSupported){
        return function _clearCheckCallback(id){
          clearImmediate(id);
        };
      }else{
        return function _clearCheckCallback(id){
          clearTimeout(id);
        };
      }
    })();
    var isNumeric=function isNumeric(n){
      return !isNaN(parseFloat(n)) && isFinite(n);
    };
    var sameValue = function sameValue(x, y){
      if(x===y){
        return x !== 0 || 1 / x === 1 / y;
      }
      return x !== x && y !== y;
    };
    var isAccessorDescriptor = function isAccessorDescriptor(desc){
      if (typeof(desc) === 'undefined'){
        return false;
      }
      return ('get' in desc || 'set' in desc);
    };
    var isDataDescriptor = function isDataDescriptor(desc){
      if (typeof(desc) === 'undefined'){
        return false;
      }
      return ('value' in desc || 'writable' in desc);
    };

    var validateArguments = function validateArguments(O, callback, accept){
      if(typeof(O)!=='object'){
        // Throw Error
        throw new TypeError("Object.observeObject called on non-object");
      }
      if(isCallable(callback)===false){
        // Throw Error
        throw new TypeError("Object.observeObject: Expecting function");
      }
      if(Object.isFrozen(callback)===true){
        // Throw Error
        throw new TypeError("Object.observeObject: Expecting unfrozen function");
      }
      if (accept !== undefined) {
        if (!Array.isArray(accept)) {
          throw new TypeError("Object.observeObject: Expecting acceptList in the form of an array");
        }
      }
    };

    var Observer = (function Observer(){
      var wraped = [];
      var Observer = function Observer(O, callback, accept){
        validateArguments(O, callback, accept);
        if (!accept) {
          accept = ["add", "update", "delete", "reconfigure", "setPrototype", "preventExtensions"];
        }
        Object.getNotifier(O).addListener(callback, accept);
        if(wraped.indexOf(O)===-1){
          wraped.push(O);
        }else{
          Object.getNotifier(O)._checkPropertyListing();
        }
      };

      Observer.prototype.deliverChangeRecords = function Observer_deliverChangeRecords(O){
        Object.getNotifier(O).deliverChangeRecords();
      };

      wraped.lastScanned = 0;
      var f = (function f(wrapped){
              return function _f(){
                var i = 0, l = wrapped.length, startTime = new Date(), takingTooLong=false;
                for(i=wrapped.lastScanned; (i<l)&&(!takingTooLong); i++){
                  if(_indexes.indexOf(wrapped[i]) > -1){
                    Object.getNotifier(wrapped[i])._checkPropertyListing();
                    takingTooLong=((new Date())-startTime)>100; // make sure we don't take more than 100 milliseconds to scan all objects
                  }else{
                    wrapped.splice(i, 1);
                    i--;
                    l--;
                  }
                }
                wrapped.lastScanned=i<l?i:0; // reset wrapped so we can make sure that we pick things back up
                _doCheckCallback(_f);
              };
            })(wraped);
      _doCheckCallback(f);
      return Observer;
    })();

    var Notifier = function Notifier(watching){
    var _listeners = [], _acceptLists = [], _updates = [], _updater = false, properties = [], values = [];
      var self = this;
      Object.defineProperty(self, '_watching', {
                  enumerable: true,
                  get: (function(watched){
                    return function(){
                      return watched;
                    };
                  })(watching)
                });
      var wrapProperty = function wrapProperty(object, prop){
        var propType = typeof(object[prop]), descriptor = Object.getOwnPropertyDescriptor(object, prop);
        if((prop==='getNotifier')||isAccessorDescriptor(descriptor)||(!descriptor.enumerable)){
          return false;
        }
        if((object instanceof Array)&&isNumeric(prop)){
          var idx = properties.length;
          properties[idx] = prop;
          values[idx] = object[prop];
          return true;
        }
        (function(idx, prop){
          properties[idx] = prop;
          values[idx] = object[prop];
          function getter(){
            return values[getter.info.idx];
          }
          function setter(value){
            if(!sameValue(values[setter.info.idx], value)){
              Object.getNotifier(object).queueUpdate(object, prop, 'update', values[setter.info.idx]);
              values[setter.info.idx] = value;
            }
          }
          getter.info = setter.info = {
            idx: idx
          };
          Object.defineProperty(object, prop, {
            get: getter,
            set: setter
          });
        })(properties.length, prop);
        return true;
      };
      self._checkPropertyListing = function _checkPropertyListing(dontQueueUpdates){
        var object = self._watching, keys = Object.keys(object), i=0, l=keys.length;
        var newKeys = [], oldKeys = properties.slice(0), updates = [];
        var prop, queueUpdates = !dontQueueUpdates, propType, value, idx, aLength;

        if(object instanceof Array){
          aLength = self._oldLength;//object.length;
          //aLength = object.length;
        }

        for(i=0; i<l; i++){
          prop = keys[i];
          value = object[prop];
          propType = typeof(value);
          if((idx = properties.indexOf(prop))===-1){
            if(wrapProperty(object, prop)&&queueUpdates){
              self.queueUpdate(object, prop, 'add', null, object[prop]);
            }
          }else{
            if(!(object instanceof Array)||(isNumeric(prop))){
              if(values[idx] !== value){
                if(queueUpdates){
                  self.queueUpdate(object, prop, 'update', values[idx], value);
                }
                values[idx] = value;
              }
            }
            oldKeys.splice(oldKeys.indexOf(prop), 1);
          }
        }

        if(object instanceof Array && object.length !== aLength){
          if(queueUpdates){
            self.queueUpdate(object, 'length', 'update', aLength, object);
          }
          self._oldLength = object.length;
        }

        if(queueUpdates){
          l = oldKeys.length;
          for(i=0; i<l; i++){
            idx = properties.indexOf(oldKeys[i]);
            self.queueUpdate(object, oldKeys[i], 'delete', values[idx]);
            properties.splice(idx,1);
            values.splice(idx,1);
            for(var i=idx;i<properties.length;i++){
              if(!(properties[i] in object))
                continue;
              var getter = Object.getOwnPropertyDescriptor(object,properties[i]).get;
              if(!getter)
                continue;
              var info = getter.info;
              info.idx = i;
            }
          };
        }
      };
      self.addListener = function Notifier_addListener(callback, accept){
        var idx = _listeners.indexOf(callback);
        if(idx===-1){
          _listeners.push(callback);
          _acceptLists.push(accept);
        }
        else {
          _acceptLists[idx] = accept;
        }
      };
      self.removeListener = function Notifier_removeListener(callback){
        var idx = _listeners.indexOf(callback);
        if(idx>-1){
          _listeners.splice(idx, 1);
          _acceptLists.splice(idx, 1);
        }
      };
      self.listeners = function Notifier_listeners(){
        return _listeners;
      };
      self.queueUpdate = function Notifier_queueUpdate(what, prop, type, was){
        this.queueUpdates([{
          type: type,
          object: what,
          name: prop,
          oldValue: was
        }]);
      };
      self.queueUpdates = function Notifier_queueUpdates(updates){
        var self = this, i = 0, l = updates.length||0, update;
        for(i=0; i<l; i++){
          update = updates[i];
          _updates.push(update);
        }
        if(_updater){
          _clearCheckCallback(_updater);
        }
        _updater = _doCheckCallback(function(){
          _updater = false;
          self.deliverChangeRecords();
        });
      };
      self.deliverChangeRecords = function Notifier_deliverChangeRecords(){
        var i = 0, l = _listeners.length,
            //keepRunning = true, removed as it seems the actual implementation doesn't do this
            // In response to BUG #5
            retval;
        for(i=0; i<l; i++){
          if(_listeners[i]){
            var currentUpdates;
            if (_acceptLists[i]) {
              currentUpdates = [];
              for (var j = 0, updatesLength = _updates.length; j < updatesLength; j++) {
                if (_acceptLists[i].indexOf(_updates[j].type) !== -1) {
                  currentUpdates.push(_updates[j]);
                }
              }
            }
            else {
              currentUpdates = _updates;
            }
            if (currentUpdates.length) {
              if(_listeners[i]===console.log){
                console.log(currentUpdates);
              }else{
                _listeners[i](currentUpdates);
              }
            }
          }
        }
        _updates=[];
      };
      self.notify = function Notifier_notify(changeRecord) {
        if (typeof changeRecord !== "object" || typeof changeRecord.type !== "string") {
          throw new TypeError("Invalid changeRecord with non-string 'type' property");
        }
        changeRecord.object = watching;
        self.queueUpdates([changeRecord]);
      };
      self._checkPropertyListing(true);
    };

    var _notifiers=[], _indexes=[];
    extend.getNotifier = function Object_getNotifier(O){
    var idx = _indexes.indexOf(O), notifier = idx>-1?_notifiers[idx]:false;
      if(!notifier){
        idx = _indexes.length;
        _indexes[idx] = O;
        notifier = _notifiers[idx] = new Notifier(O);
      }
      return notifier;
    };
    extend.observe = function Object_observe(O, callback, accept){
      // For Bug 4, can't observe DOM elements tested against canry implementation and matches
      if(!isElement(O)){
        return new Observer(O, callback, accept);
      }
    };
    extend.unobserve = function Object_unobserve(O, callback){
      validateArguments(O, callback);
      var idx = _indexes.indexOf(O),
          notifier = idx>-1?_notifiers[idx]:false;
      if (!notifier){
        return;
      }
      notifier.removeListener(callback);
      if (notifier.listeners().length === 0){
        _indexes.splice(idx, 1);
        _notifiers.splice(idx, 1);
      }
    };
  })(Object, this);
}

module.exports = {
    Engine: require('./Engine'),
    Scene: require('./Scene'),
    Node: require('./Node')
};

},{"./Engine":4,"./Node":5,"./Scene":6}],8:[function(require,module,exports){
/**
* ScrollSync
*
* API for syncing mousewheel and touchmove Events.
*
* by Steve Belovarich
* Licensed under MIT, see license.txt or http://www.opensource.org/licenses/mit-license.php
**/

var ScrollSync = function(elem, cb, direction) {

  var ts,
      prop,
      to,
      pos;

  direction === 'hor' ? prop = ['pageX', 'deltaX'] : prop = ['pageY', 'deltaY'];

  elem.addEventListener('mousewheel', function(ev){

    ev.preventDefault();
    pos = ev[prop[1]]*0.125;
    cb(pos, false);

  });

  elem.addEventListener('touchstart', function (ev){

     ev.preventDefault();
     ts = ev[prop[0]];

  });

  elem.addEventListener('touchmove', function (ev){

     var te = ev[prop[0]];
     clearTimeout(to);

     if(te < ts){

       pos = (ts-te)*0.0325;
       cb(pos, false);

     } else if(te > ts){

       pos = (ts-te)*0.0325;
       cb(pos, false);

     }

  });

  elem.addEventListener('touchend', function (ev){

    to = setTimeout(function(){

      if((ev[prop[0]] < (ts - 260))){
        pos = pos + 400;
        cb(pos, true);
      }
      else if((ev[prop[0]] > (ts + 260))){
        pos = pos - 400;
        cb(pos, true);
      }
      else if((ev[prop[0]] < (ts - 200))){
        pos = pos + 200;
        cb(pos, true);
      }
      else if((ev[prop[0]] > (ts + 200))){
        pos = pos - 200;
        cb(pos, true);
      }

    }, 80);

  });

};

module.exports = ScrollSync;

},{}],9:[function(require,module,exports){
module.exports = {
    ScrollSync: require('./ScrollSync')
};

},{"./ScrollSync":8}],10:[function(require,module,exports){
module.exports = {
    core: require('./core'),
    components: require('./components'),
    events: require('./events'),
    math: require('./math'),
    transitions: require('./transitions')
};

},{"./components":3,"./core":7,"./events":9,"./math":17,"./transitions":20}],11:[function(require,module,exports){
/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2015 Famous Industries Inc.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

/**
 * A 3x3 numerical matrix, represented as an array.
 *
 * @class Mat33
 *
 * @param {Array} values a 3x3 matrix flattened
 */
function Mat33(values) {
    this.values = values || [1,0,0,0,1,0,0,0,1];
}

/**
 * Return the values in the Mat33 as an array.
 *
 * @method
 *
 * @return {Array} matrix values as array of rows.
 */
Mat33.prototype.get = function get() {
    return this.values;
};

/**
 * Set the values of the current Mat33.
 *
 * @method
 *
 * @param {Array} values Array of nine numbers to set in the Mat33.
 *
 * @return {Mat33} this
 */
Mat33.prototype.set = function set(values) {
    this.values = values;
    return this;
};

/**
 * Copy the values of the input Mat33.
 *
 * @method
 *
 * @param {Mat33} matrix The Mat33 to copy.
 * 
 * @return {Mat33} this
 */
Mat33.prototype.copy = function copy(matrix) {
    var A = this.values;
    var B = matrix.values;

    A[0] = B[0];
    A[1] = B[1];
    A[2] = B[2];
    A[3] = B[3];
    A[4] = B[4];
    A[5] = B[5];
    A[6] = B[6];
    A[7] = B[7];
    A[8] = B[8];

    return this;
};

/**
 * Take this Mat33 as A, input vector V as a column vector, and return Mat33 product (A)(V).
 *
 * @method
 *
 * @param {Vec3} v Vector to rotate.
 * @param {Vec3} output Vec3 in which to place the result.
 *
 * @return {Vec3} The input vector after multiplication.
 */
Mat33.prototype.vectorMultiply = function vectorMultiply(v, output) {
    var M = this.values;
    var v0 = v.x;
    var v1 = v.y;
    var v2 = v.z;

    output.x = M[0]*v0 + M[1]*v1 + M[2]*v2;
    output.y = M[3]*v0 + M[4]*v1 + M[5]*v2;
    output.z = M[6]*v0 + M[7]*v1 + M[8]*v2;

    return output;
};

/**
 * Multiply the provided Mat33 with the current Mat33.  Result is (this) * (matrix).
 *
 * @method
 *
 * @param {Mat33} matrix Input Mat33 to multiply on the right.
 *
 * @return {Mat33} this
 */
Mat33.prototype.multiply = function multiply(matrix) {
    var A = this.values;
    var B = matrix.values;

    var A0 = A[0];
    var A1 = A[1];
    var A2 = A[2];
    var A3 = A[3];
    var A4 = A[4];
    var A5 = A[5];
    var A6 = A[6];
    var A7 = A[7];
    var A8 = A[8];

    var B0 = B[0];
    var B1 = B[1];
    var B2 = B[2];
    var B3 = B[3];
    var B4 = B[4];
    var B5 = B[5];
    var B6 = B[6];
    var B7 = B[7];
    var B8 = B[8];

    A[0] = A0*B0 + A1*B3 + A2*B6;
    A[1] = A0*B1 + A1*B4 + A2*B7;
    A[2] = A0*B2 + A1*B5 + A2*B8;
    A[3] = A3*B0 + A4*B3 + A5*B6;
    A[4] = A3*B1 + A4*B4 + A5*B7;
    A[5] = A3*B2 + A4*B5 + A5*B8;
    A[6] = A6*B0 + A7*B3 + A8*B6;
    A[7] = A6*B1 + A7*B4 + A8*B7;
    A[8] = A6*B2 + A7*B5 + A8*B8;

    return this;
};

/**
 * Transposes the Mat33.
 *
 * @method
 *
 * @return {Mat33} this
 */
Mat33.prototype.transpose = function transpose() {
    var M = this.values;

    var M1 = M[1];
    var M2 = M[2];
    var M3 = M[3];
    var M5 = M[5];
    var M6 = M[6];
    var M7 = M[7];

    M[1] = M3;
    M[2] = M6;
    M[3] = M1;
    M[5] = M7;
    M[6] = M2;
    M[7] = M5;

    return this;
};

/**
 * The determinant of the Mat33.
 *
 * @method
 *
 * @return {Number} The determinant.
 */
Mat33.prototype.getDeterminant = function getDeterminant() {
    var M = this.values;

    var M3 = M[3];
    var M4 = M[4];
    var M5 = M[5];
    var M6 = M[6];
    var M7 = M[7];
    var M8 = M[8];

    var det = M[0]*(M4*M8 - M5*M7) -
              M[1]*(M3*M8 - M5*M6) +
              M[2]*(M3*M7 - M4*M6);

    return det;
};

/**
 * The inverse of the Mat33.
 *
 * @method
 *
 * @return {Mat33} this
 */
Mat33.prototype.inverse = function inverse() {
    var M = this.values;

    var M0 = M[0];
    var M1 = M[1];
    var M2 = M[2];
    var M3 = M[3];
    var M4 = M[4];
    var M5 = M[5];
    var M6 = M[6];
    var M7 = M[7];
    var M8 = M[8];

    var det = M0*(M4*M8 - M5*M7) -
              M1*(M3*M8 - M5*M6) +
              M2*(M3*M7 - M4*M6);

    if (Math.abs(det) < 1e-40) return null;

    det = 1 / det;

    M[0] = (M4*M8 - M5*M7) * det;
    M[3] = (-M3*M8 + M5*M6) * det;
    M[6] = (M3*M7 - M4*M6) * det;
    M[1] = (-M1*M8 + M2*M7) * det;
    M[4] = (M0*M8 - M2*M6) * det;
    M[7] = (-M0*M7 + M1*M6) * det;
    M[2] = (M1*M5 - M2*M4) * det;
    M[5] = (-M0*M5 + M2*M3) * det;
    M[8] = (M0*M4 - M1*M3) * det;

    return this;
};

/**
 * Clones the input Mat33.
 *
 * @method
 *
 * @param {Mat33} m Mat33 to clone.
 *
 * @return {Mat33} New copy of the original Mat33.
 */
Mat33.clone = function clone(m) {
    return new Mat33(m.values.slice());
};

/**
 * The inverse of the Mat33.
 *
 * @method
 *
 * @param {Mat33} matrix Mat33 to invert.
 * @param {Mat33} output Mat33 in which to place the result.
 *
 * @return {Mat33} The Mat33 after the invert.
 */
Mat33.inverse = function inverse(matrix, output) {
    var M = matrix.values;
    var result = output.values;

    var M0 = M[0];
    var M1 = M[1];
    var M2 = M[2];
    var M3 = M[3];
    var M4 = M[4];
    var M5 = M[5];
    var M6 = M[6];
    var M7 = M[7];
    var M8 = M[8];

    var det = M0*(M4*M8 - M5*M7) -
              M1*(M3*M8 - M5*M6) +
              M2*(M3*M7 - M4*M6);

    if (Math.abs(det) < 1e-40) return null;

    det = 1 / det;

    result[0] = (M4*M8 - M5*M7) * det;
    result[3] = (-M3*M8 + M5*M6) * det;
    result[6] = (M3*M7 - M4*M6) * det;
    result[1] = (-M1*M8 + M2*M7) * det;
    result[4] = (M0*M8 - M2*M6) * det;
    result[7] = (-M0*M7 + M1*M6) * det;
    result[2] = (M1*M5 - M2*M4) * det;
    result[5] = (-M0*M5 + M2*M3) * det;
    result[8] = (M0*M4 - M1*M3) * det;

    return output;
};

/**
 * Transposes the Mat33.
 *
 * @method
 *
 * @param {Mat33} matrix Mat33 to transpose.
 * @param {Mat33} output Mat33 in which to place the result.
 *
 * @return {Mat33} The Mat33 after the transpose.
 */
Mat33.transpose = function transpose(matrix, output) {
    var M = matrix.values;
    var result = output.values;

    var M0 = M[0];
    var M1 = M[1];
    var M2 = M[2];
    var M3 = M[3];
    var M4 = M[4];
    var M5 = M[5];
    var M6 = M[6];
    var M7 = M[7];
    var M8 = M[8];

    result[0] = M0;
    result[1] = M3;
    result[2] = M6;
    result[3] = M1;
    result[4] = M4;
    result[5] = M7;
    result[6] = M2;
    result[7] = M5;
    result[8] = M8;

    return output;
};

/**
 * Add the provided Mat33's.
 *
 * @method
 *
 * @param {Mat33} matrix1 The left Mat33.
 * @param {Mat33} matrix2 The right Mat33.
 * @param {Mat33} output Mat33 in which to place the result.
 *
 * @return {Mat33} The result of the addition.
 */
Mat33.add = function add(matrix1, matrix2, output) {
    var A = matrix1.values;
    var B = matrix2.values;
    var result = output.values;

    var A0 = A[0];
    var A1 = A[1];
    var A2 = A[2];
    var A3 = A[3];
    var A4 = A[4];
    var A5 = A[5];
    var A6 = A[6];
    var A7 = A[7];
    var A8 = A[8];

    var B0 = B[0];
    var B1 = B[1];
    var B2 = B[2];
    var B3 = B[3];
    var B4 = B[4];
    var B5 = B[5];
    var B6 = B[6];
    var B7 = B[7];
    var B8 = B[8];

    result[0] = A0 + B0;
    result[1] = A1 + B1;
    result[2] = A2 + B2;
    result[3] = A3 + B3;
    result[4] = A4 + B4;
    result[5] = A5 + B5;
    result[6] = A6 + B6;
    result[7] = A7 + B7;
    result[8] = A8 + B8;

    return output;
};

/**
 * Subtract the provided Mat33's.
 *
 * @method
 *
 * @param {Mat33} matrix1 The left Mat33.
 * @param {Mat33} matrix2 The right Mat33.
 * @param {Mat33} output Mat33 in which to place the result.
 *
 * @return {Mat33} The result of the subtraction.
 */
Mat33.subtract = function subtract(matrix1, matrix2, output) {
    var A = matrix1.values;
    var B = matrix2.values;
    var result = output.values;

    var A0 = A[0];
    var A1 = A[1];
    var A2 = A[2];
    var A3 = A[3];
    var A4 = A[4];
    var A5 = A[5];
    var A6 = A[6];
    var A7 = A[7];
    var A8 = A[8];

    var B0 = B[0];
    var B1 = B[1];
    var B2 = B[2];
    var B3 = B[3];
    var B4 = B[4];
    var B5 = B[5];
    var B6 = B[6];
    var B7 = B[7];
    var B8 = B[8];

    result[0] = A0 - B0;
    result[1] = A1 - B1;
    result[2] = A2 - B2;
    result[3] = A3 - B3;
    result[4] = A4 - B4;
    result[5] = A5 - B5;
    result[6] = A6 - B6;
    result[7] = A7 - B7;
    result[8] = A8 - B8;

    return output;
};
/**
 * Multiply the provided Mat33 M2 with this Mat33.  Result is (this) * (M2).
 *
 * @method
 * @param {Mat33} matrix1 The left Mat33.
 * @param {Mat33} matrix2 The right Mat33.
 * @param {Mat33} output Mat33 in which to place the result.
 *
 * @return {Mat33} the result of the multiplication.
 */
Mat33.multiply = function multiply(matrix1, matrix2, output) {
    var A = matrix1.values;
    var B = matrix2.values;
    var result = output.values;

    var A0 = A[0];
    var A1 = A[1];
    var A2 = A[2];
    var A3 = A[3];
    var A4 = A[4];
    var A5 = A[5];
    var A6 = A[6];
    var A7 = A[7];
    var A8 = A[8];

    var B0 = B[0];
    var B1 = B[1];
    var B2 = B[2];
    var B3 = B[3];
    var B4 = B[4];
    var B5 = B[5];
    var B6 = B[6];
    var B7 = B[7];
    var B8 = B[8];

    result[0] = A0*B0 + A1*B3 + A2*B6;
    result[1] = A0*B1 + A1*B4 + A2*B7;
    result[2] = A0*B2 + A1*B5 + A2*B8;
    result[3] = A3*B0 + A4*B3 + A5*B6;
    result[4] = A3*B1 + A4*B4 + A5*B7;
    result[5] = A3*B2 + A4*B5 + A5*B8;
    result[6] = A6*B0 + A7*B3 + A8*B6;
    result[7] = A6*B1 + A7*B4 + A8*B7;
    result[8] = A6*B2 + A7*B5 + A8*B8;

    return output;
};

module.exports = Mat33;

},{}],12:[function(require,module,exports){
/**
 * A really simple and basic 4x4 matrix implementation, compatible with CSS. Transform them, and
 * apply the toString() output to a node's transform style. Don't forget perspective :)
 *
 * By Peter Nederlof, https://github.com/peterned
 * Licensed under MIT, see license.txt or http://www.opensource.org/licenses/mit-license.php
 */

	   // _  __  __  __   ___  _____  _   _  __  _ \\
	  // | \/ |||  \/  ||/   \|_   _|| |_| ||| \/ | \\
	 //   \  // | |\/| ||  _  | | | ||  _  | \\  /   \\
	//     \//  |_|| |_||_| |_| |_| ||_| |_|  \\/     \\

	"use strict";

	var IDENTITY = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	];

	function multiply (
		a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p,
		A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P
	) {
		return [
			a * A + b * E + c * I + d * M,
			a * B + b * F + c * J + d * N,
			a * C + b * G + c * K + d * O,
			a * D + b * H + c * L + d * P,
			e * A + f * E + g * I + h * M,
			e * B + f * F + g * J + h * N,
			e * C + f * G + g * K + h * O,
			e * D + f * H + g * L + h * P,
			i * A + j * E + k * I + l * M,
			i * B + j * F + k * J + l * N,
			i * C + j * G + k * K + l * O,
			i * D + j * H + k * L + l * P,
			m * A + n * E + o * I + p * M,
			m * B + n * F + o * J + p * N,
			m * C + n * G + o * K + p * O,
			m * D + n * H + o * L + p * P
		];
	}

	var sin = Math.sin;
	var cos = Math.cos;

	/**
	 * Matrix
	 *
	 */

	var Matrix = function (entities) {
		this.entities = entities || IDENTITY;
	};

	Matrix.prototype = {
		multiply: function (entities) {
			return new Matrix(
				multiply.apply(window, this.entities.concat(entities))
			);
		},

		transform: function (matrix) {
			return this.multiply(matrix.entities);
		},

		scale: function (s) {
			return this.multiply([
				s, 0, 0, 0,
				0, s, 0, 0,
				0, 0, s, 0,
				0, 0, 0, 1
			]);
		},

		rotateX: function (a) {
			var c = cos(a);
			var s = sin(a);
			return this.multiply([
				1, 0,  0, 0,
				0, c, -s, 0,
				0, s,  c, 0,
				0, 0,  0, 1
			]);
		},

		rotateY: function (a) {
			var c = cos(a);
			var s = sin(a);
			return this.multiply([
				 c, 0, s, 0,
				 0, 1, 0, 0,
				-s, 0, c, 0,
				 0, 0, 0, 1
			]);
		},

		rotateZ: function (a) {
			var c = cos(a);
			var s = sin(a);
			return this.multiply([
				c, -s, 0, 0,
				s,  c, 0, 0,
				0,  0, 1, 0,
				0,  0, 0, 1
			]);
		},

		translate: function (x, y, z) {
			return this.multiply([
				1, 0, 0, 0,
				0, 1, 0, 0,
				0, 0, 1, 0,
				x, y, z, 1
			]);
		},

		toString: function () {
			return 'matrix3d(' + this.entities.join(',') + ')';
		}
	};

module.exports = Matrix;

},{}],13:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var sin = Math.sin;
var cos = Math.cos;
var asin = Math.asin;
var acos = Math.acos;
var atan2 = Math.atan2;
var sqrt = Math.sqrt;

/**
 * A vector-like object used to represent rotations. If theta is the angle of
 * rotation, and (x', y', z') is a normalized vector representing the axis of
 * rotation, then w = cos(theta/2), x = sin(theta/2)*x', y = sin(theta/2)*y',
 * and z = sin(theta/2)*z'.
 *
 * @class Quaternion
 *
 * @param {Number} w The w component.
 * @param {Number} x The x component.
 * @param {Number} y The y component.
 * @param {Number} z The z component.
 */
function Quaternion(w, x, y, z) {
    this.w = w || 1;
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
}

/**
 * Multiply the current Quaternion by input Quaternion q.
 * Left-handed multiplication.
 *
 * @method
 *
 * @param {Quaternion} q The Quaternion to multiply by on the right.
 *
 * @return {Quaternion} this
 */
Quaternion.prototype.multiply = function multiply(q) {
    var x1 = this.x;
    var y1 = this.y;
    var z1 = this.z;
    var w1 = this.w;
    var x2 = q.x;
    var y2 = q.y;
    var z2 = q.z;
    var w2 = q.w || 0;

    this.w = w1 * w2 - x1 * x2 - y1 * y2 - z1 * z2;
    this.x = x1 * w2 + x2 * w1 + y2 * z1 - y1 * z2;
    this.y = y1 * w2 + y2 * w1 + x1 * z2 - x2 * z1;
    this.z = z1 * w2 + z2 * w1 + x2 * y1 - x1 * y2;
    return this;
};

/**
 * Multiply the current Quaternion by input Quaternion q on the left, i.e. q * this.
 * Left-handed multiplication.
 *
 * @method
 *
 * @param {Quaternion} q The Quaternion to multiply by on the left.
 *
 * @return {Quaternion} this
 */
Quaternion.prototype.leftMultiply = function leftMultiply(q) {
    var x1 = q.x;
    var y1 = q.y;
    var z1 = q.z;
    var w1 = q.w || 0;
    var x2 = this.x;
    var y2 = this.y;
    var z2 = this.z;
    var w2 = this.w;

    this.w = w1*w2 - x1*x2 - y1*y2 - z1*z2;
    this.x = x1*w2 + x2*w1 + y2*z1 - y1*z2;
    this.y = y1*w2 + y2*w1 + x1*z2 - x2*z1;
    this.z = z1*w2 + z2*w1 + x2*y1 - x1*y2;
    return this;
};

/**
 * Apply the current Quaternion to input Vec3 v, according to
 * v' = ~q * v * q.
 *
 * @method
 *
 * @param {Vec3} v The reference Vec3.
 * @param {Vec3} output Vec3 in which to place the result.
 *
 * @return {Vec3} The rotated version of the Vec3.
 */
Quaternion.prototype.rotateVector = function rotateVector(v, output) {
    var cw = this.w;
    var cx = -this.x;
    var cy = -this.y;
    var cz = -this.z;

    var vx = v.x;
    var vy = v.y;
    var vz = v.z;

    var tw = -cx * vx - cy * vy - cz * vz;
    var tx = vx * cw + vy * cz - cy * vz;
    var ty = vy * cw + cx * vz - vx * cz;
    var tz = vz * cw + vx * cy - cx * vy;

    var w = cw;
    var x = -cx;
    var y = -cy;
    var z = -cz;

    output.x = tx * w + x * tw + y * tz - ty * z;
    output.y = ty * w + y * tw + tx * z - x * tz;
    output.z = tz * w + z * tw + x * ty - tx * y;
    return output;
};

/**
 * Invert the current Quaternion.
 *
 * @method
 *
 * @return {Quaternion} this
 */
Quaternion.prototype.invert = function invert() {
    this.w = -this.w;
    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z;
    return this;
};

/**
 * Conjugate the current Quaternion.
 *
 * @method
 *
 * @return {Quaternion} this
 */
Quaternion.prototype.conjugate = function conjugate() {
    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z;
    return this;
};

/**
 * Compute the length (norm) of the current Quaternion.
 *
 * @method
 *
 * @return {Number} length of the Quaternion
 */
Quaternion.prototype.length = function length() {
    var w = this.w;
    var x = this.x;
    var y = this.y;
    var z = this.z;
    return sqrt(w * w + x * x + y * y + z * z);
};

/**
 * Alter the current Quaternion to be of unit length;
 *
 * @method
 *
 * @return {Quaternion} this
 */
Quaternion.prototype.normalize = function normalize() {
    var w = this.w;
    var x = this.x;
    var y = this.y;
    var z = this.z;
    var length = sqrt(w * w + x * x + y * y + z * z);
    if (length === 0) return this;
    length = 1 / length;
    this.w *= length;
    this.x *= length;
    this.y *= length;
    this.z *= length;
    return this;
};

/**
 * Set the w, x, y, z components of the current Quaternion.
 *
 * @method
 *
 * @param {Number} w The w component.
 * @param {Number} x The x component.
 * @param {Number} y The y component.
 * @param {Number} z The z component.
 *
 * @return {Quaternion} this
 */
Quaternion.prototype.set = function set(w, x ,y, z) {
    if (w != null) this.w = w;
    if (x != null) this.x = x;
    if (y != null) this.y = y;
    if (z != null) this.z = z;
    return this;
};

/**
 * Copy input Quaternion q onto the current Quaternion.
 *
 * @method
 *
 * @param {Quaternion} q The reference Quaternion.
 *
 * @return {Quaternion} this
 */
Quaternion.prototype.copy = function copy(q) {
    this.w = q.w;
    this.x = q.x;
    this.y = q.y;
    this.z = q.z;
    return this;
};

/**
 * Reset the current Quaternion.
 *
 * @method
 *
 * @return {Quaternion} this
 */
Quaternion.prototype.clear = function clear() {
    this.w = 1;
    this.x = 0;
    this.y = 0;
    this.z = 0;
    return this;
};

/**
 * The dot product. Can be used to determine the cosine of the angle between
 * the two rotations, assuming both Quaternions are of unit length.
 *
 * @method
 *
 * @param {Quaternion} q The other Quaternion.
 *
 * @return {Number} the resulting dot product
 */
Quaternion.prototype.dot = function dot(q) {
    return this.w * q.w + this.x * q.x + this.y * q.y + this.z * q.z;
};

/**
 * Spherical linear interpolation.
 *
 * @method
 *
 * @param {Quaternion} q The final orientation.
 * @param {Number} t The tween parameter.
 * @param {Vec3} output Vec3 in which to put the result.
 *
 * @return {Quaternion} The quaternion the slerp results were saved to
 */
Quaternion.prototype.slerp = function slerp(q, t, output) {
    var w = this.w;
    var x = this.x;
    var y = this.y;
    var z = this.z;

    var qw = q.w;
    var qx = q.x;
    var qy = q.y;
    var qz = q.z;

    var omega;
    var cosomega;
    var sinomega;
    var scaleFrom;
    var scaleTo;

    cosomega = w * qw + x * qx + y * qy + z * qz;
    if ((1.0 - cosomega) > 1e-5) {
        omega = acos(cosomega);
        sinomega = sin(omega);
        scaleFrom = sin((1.0 - t) * omega) / sinomega;
        scaleTo = sin(t * omega) / sinomega;
    }
    else {
        scaleFrom = 1.0 - t;
        scaleTo = t;
    }

    output.w = w * scaleFrom + qw * scaleTo;
    output.x = x * scaleFrom + qx * scaleTo;
    output.y = y * scaleFrom + qy * scaleTo;
    output.z = z * scaleFrom + qz * scaleTo;

    return output;
};

/**
 * Get the Mat33 matrix corresponding to the current Quaternion.
 *
 * @method
 *
 * @param {Object} output Object to process the Transform matrix
 *
 * @return {Array} the Quaternion as a Transform matrix
 */
Quaternion.prototype.toMatrix = function toMatrix(output) {
    var w = this.w;
    var x = this.x;
    var y = this.y;
    var z = this.z;

    var xx = x*x;
    var yy = y*y;
    var zz = z*z;
    var xy = x*y;
    var xz = x*z;
    var yz = y*z;

    return output.set([
        1 - 2 * (yy + zz), 2 * (xy - w*z), 2 * (xz + w*y),
        2 * (xy + w*z), 1 - 2 * (xx + zz), 2 * (yz - w*x),
        2 * (xz - w*y), 2 * (yz + w*x), 1 - 2 * (xx + yy)
    ]);
};

/**
 * The rotation angles about the x, y, and z axes corresponding to the
 * current Quaternion, when applied in the ZYX order.
 *
 * @method
 *
 * @param {Vec3} output Vec3 in which to put the result.
 *
 * @return {Vec3} the Vec3 the result was stored in
 */
Quaternion.prototype.toEuler = function toEuler(output) {
    var w = this.w;
    var x = this.x;
    var y = this.y;
    var z = this.z;

    var xx = x * x;
    var yy = y * y;
    var zz = z * z;

    var ty = 2 * (x * z + y * w);
    ty = ty < -1 ? -1 : ty > 1 ? 1 : ty;

    output.x = atan2(2 * (x * w - y * z), 1 - 2 * (xx + yy));
    output.y = asin(ty);
    output.z = atan2(2 * (z * w - x * y), 1 - 2 * (yy + zz));

    return output;
};

/**
 * The Quaternion corresponding to the Euler angles x, y, and z,
 * applied in the ZYX order.
 *
 * @method
 *
 * @param {Number} x The angle of rotation about the x axis.
 * @param {Number} y The angle of rotation about the y axis.
 * @param {Number} z The angle of rotation about the z axis.
 * @param {Quaternion} output Quaternion in which to put the result.
 *
 * @return {Quaternion} The equivalent Quaternion.
 */
Quaternion.prototype.fromEuler = function fromEuler(x, y, z) {
    var hx = x * 0.5;
    var hy = y * 0.5;
    var hz = z * 0.5;

    var sx = sin(hx);
    var sy = sin(hy);
    var sz = sin(hz);
    var cx = cos(hx);
    var cy = cos(hy);
    var cz = cos(hz);

    this.w = cx * cy * cz - sx * sy * sz;
    this.x = sx * cy * cz + cx * sy * sz;
    this.y = cx * sy * cz - sx * cy * sz;
    this.z = cx * cy * sz + sx * sy * cz;

    return this;
};

/**
 * Alter the current Quaternion to reflect a rotation of input angle about
 * input axis x, y, and z.
 *
 * @method
 *
 * @param {Number} angle The angle of rotation.
 * @param {Vec3} x The axis of rotation.
 * @param {Vec3} y The axis of rotation.
 * @param {Vec3} z The axis of rotation.
 *
 * @return {Quaternion} this
 */
Quaternion.prototype.fromAngleAxis = function fromAngleAxis(angle, x, y, z) {
    var len = sqrt(x * x + y * y + z * z);
    if (len === 0) {
        this.w = 1;
        this.x = this.y = this.z = 0;
    }
    else {
        len = 1 / len;
        var halfTheta = angle * 0.5;
        var s = sin(halfTheta);
        this.w = cos(halfTheta);
        this.x = s * x * len;
        this.y = s * y * len;
        this.z = s * z * len;
    }
    return this;
};

/**
 * Multiply the input Quaternions.
 * Left-handed coordinate system multiplication.
 *
 * @method
 *
 * @param {Quaternion} q1 The left Quaternion.
 * @param {Quaternion} q2 The right Quaternion.
 * @param {Quaternion} output Quaternion in which to place the result.
 *
 * @return {Quaternion} The product of multiplication.
 */
Quaternion.multiply = function multiply(q1, q2, output) {
    var w1 = q1.w || 0;
    var x1 = q1.x;
    var y1 = q1.y;
    var z1 = q1.z;

    var w2 = q2.w || 0;
    var x2 = q2.x;
    var y2 = q2.y;
    var z2 = q2.z;

    output.w = w1 * w2 - x1 * x2 - y1 * y2 - z1 * z2;
    output.x = x1 * w2 + x2 * w1 + y2 * z1 - y1 * z2;
    output.y = y1 * w2 + y2 * w1 + x1 * z2 - x2 * z1;
    output.z = z1 * w2 + z2 * w1 + x2 * y1 - x1 * y2;
    return output;
};

/**
 * Normalize the input quaternion.
 *
 * @method
 *
 * @param {Quaternion} q The reference Quaternion.
 * @param {Quaternion} output Quaternion in which to place the result.
 *
 * @return {Quaternion} The normalized quaternion.
 */
Quaternion.normalize = function normalize(q, output) {
    var w = q.w;
    var x = q.x;
    var y = q.y;
    var z = q.z;
    var length = sqrt(w * w + x * x + y * y + z * z);
    if (length === 0) return this;
    length = 1 / length;
    output.w *= length;
    output.x *= length;
    output.y *= length;
    output.z *= length;
    return output;
};

/**
 * The conjugate of the input Quaternion.
 *
 * @method
 *
 * @param {Quaternion} q The reference Quaternion.
 * @param {Quaternion} output Quaternion in which to place the result.
 *
 * @return {Quaternion} The conjugate Quaternion.
 */
Quaternion.conjugate = function conjugate(q, output) {
    output.w = q.w;
    output.x = -q.x;
    output.y = -q.y;
    output.z = -q.z;
    return output;
};

/**
 * Clone the input Quaternion.
 *
 * @method
 *
 * @param {Quaternion} q the reference Quaternion.
 *
 * @return {Quaternion} The cloned Quaternion.
 */
Quaternion.clone = function clone(q) {
    return new Quaternion(q.w, q.x, q.y, q.z);
};

/**
 * The dot product of the two input Quaternions.
 *
 * @method
 *
 * @param {Quaternion} q1 The left Quaternion.
 * @param {Quaternion} q2 The right Quaternion.
 *
 * @return {Number} The dot product of the two Quaternions.
 */
Quaternion.dot = function dot(q1, q2) {
    return q1.w * q2.w + q1.x * q2.x + q1.y * q2.y + q1.z * q2.z;
};

module.exports = Quaternion;

},{}],14:[function(require,module,exports){
/**
* Ray
*
* API for raycasting, necessary to handle Events on GL Meshes.
*
* by Steve Belovarich
* Licensed under MIT, see license.txt or http://www.opensource.org/licenses/mit-license.php
**/


var Vec3 = require('./Vec3');


var Ray = function ( origin, direction ) {

	this.origin = ( origin !== undefined ) ?  new Vec3(origin[0],origin[1],origin[2]) : new Vec3();
	this.direction = ( direction !== undefined ) ? new Vec3(direction[0],direction[1],direction[2]) : new Vec3();

};

Ray.prototype.set = function ( origin, direction ) {

		this.origin.copy( origin );
		this.direction.copy( direction );

		return this;

};

Ray.prototype.copy = function ( ray ) {

		this.origin.copy( ray.origin );
		this.direction.copy( ray.direction );

		return this;

};

Ray.prototype.at =  function ( t ) {

    var result = new Vec3();

    return result.copy( this.direction ).scale( t ).add( this.origin );

};


Ray.prototype.intersectSphere = function (center, radius) {

	// from http://www.scratchapixel.com/lessons/3d-basic-lessons/lesson-7-intersecting-simple-shapes/ray-sphere-intersection/

	var vec = new Vec3();
    var c = new Vec3(center[0],center[1],center[2]);

	vec.subVectors( c, this.origin );

	var tca = vec.dot( this.direction );

	var d2 = vec.dot( vec ) - tca * tca;

	var radius2 = radius * radius;

	if ( d2 > radius2 ) return null;

	var thc = Math.sqrt( radius2 - d2 );

	// t0 = first intersect point - entrance on front of sphere
	var t0 = tca - thc;

	// t1 = second intersect point - exit point on back of sphere
	var t1 = tca + thc;

	// test to see if both t0 and t1 are behind the ray - if so, return null
	if ( t0 < 0 && t1 < 0 ) return null;

	// test to see if t0 is behind the ray:
	// if it is, the ray is inside the sphere, so return the second exit point scaled by t1,
	// in order to always return an intersect point that is in front of the ray.
	if ( t0 < 0 ) return this.at( t1 );

	// else t0 is in front of the ray, so return the first collision point scaled by t0
	return this.at( t0 );

};

Ray.prototype.intersectBox = function(center, size) {

    var tmin,
        tmax,
        tymin,
        tymax,
        tzmin,
        tzmax,
        box,
        out,
        invdirx = 1 / this.direction.x,
        invdiry = 1 / this.direction.y,
        invdirz = 1 / this.direction.z;

    box = {
        min: {
            x: center[0]-(size[0]/2),
            y: center[1]-(size[1]/2),
            z: center[2]-(size[2]/2)
        },
        max: {
            x: center[0]+(size[0]/2),
            y: center[1]+(size[1]/2),
            z: center[2]+(size[2]/2)
        }
    };

    if ( invdirx >= 0 ) {

        tmin = ( box.min.x - this.origin.x ) * invdirx;
        tmax = ( box.max.x - this.origin.x ) * invdirx;

    } else {

        tmin = ( box.max.x - this.origin.x ) * invdirx;
        tmax = ( box.min.x - this.origin.x ) * invdirx;
    }

    if ( invdiry >= 0 ) {

        tymin = ( box.min.y - this.origin.y ) * invdiry;
        tymax = ( box.max.y - this.origin.y ) * invdiry;

    } else {

        tymin = ( box.max.y - this.origin.y ) * invdiry;
        tymax = ( box.min.y - this.origin.y ) * invdiry;
    }

    if ( ( tmin > tymax ) || ( tymin > tmax ) ) return null;

    if ( tymin > tmin || tmin !== tmin ) tmin = tymin;

    if ( tymax < tmax || tmax !== tmax ) tmax = tymax;

    if ( invdirz >= 0 ) {

        tzmin = ( box.min.z - this.origin.z ) * invdirz;
        tzmax = ( box.max.z - this.origin.z ) * invdirz;

    } else {

        tzmin = ( box.max.z - this.origin.z ) * invdirz;
        tzmax = ( box.min.z - this.origin.z ) * invdirz;
    }

    if ( ( tmin > tzmax ) || ( tzmin > tmax ) ) return null;

    if ( tzmin > tmin || tmin !== tmin ) tmin = tzmin;

    if ( tzmax < tmax || tmax !== tmax ) tmax = tzmax;


    if ( tmax < 0 ) return null;

    out = this.direction.scale(tmin >= 0 ? tmin : tmax);
    return out.add(out, this.origin, out);

};


Ray.prototype.equals = function ( ray ) {

		return ray.origin.equals( this.origin ) && ray.direction.equals( this.direction );

};

Ray.prototype.clone = function () {

		return new Ray().copy( this );

};


module.exports = Ray;

},{"./Vec3":16}],15:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

/**
 * A two-dimensional vector.
 *
 * @class Vec2
 *
 * @param {Number} x The x component.
 * @param {Number} y The y component.
 */
var Vec2 = function(x, y) {
    if (x instanceof Array || x instanceof Float32Array) {
        this.x = x[0] || 0;
        this.y = x[1] || 0;
    }
    else {
        this.x = x || 0;
        this.y = y || 0;
    }
};

/**
 * Set the components of the current Vec2.
 *
 * @method
 *
 * @param {Number} x The x component.
 * @param {Number} y The y component.
 *
 * @return {Vec2} this
 */
Vec2.prototype.set = function set(x, y) {
    if (x != null) this.x = x;
    if (y != null) this.y = y;
    return this;
};

/**
 * Add the input v to the current Vec2.
 *
 * @method
 *
 * @param {Vec2} v The Vec2 to add.
 *
 * @return {Vec2} this
 */
Vec2.prototype.add = function add(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
};

/**
 * Subtract the input v from the current Vec2.
 *
 * @method
 *
 * @param {Vec2} v The Vec2 to subtract.
 *
 * @return {Vec2} this
 */
Vec2.prototype.subtract = function subtract(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
};

/**
 * Scale the current Vec2 by a scalar or Vec2.
 *
 * @method
 *
 * @param {Number|Vec2} s The Number or vec2 by which to scale.
 *
 * @return {Vec2} this
 */
Vec2.prototype.scale = function scale(s) {
    if (s instanceof Vec2) {
        this.x *= s.x;
        this.y *= s.y;
    }
    else {
        this.x *= s;
        this.y *= s;
    }
    return this;
};

/**
 * Rotate the Vec2 counter-clockwise by theta about the z-axis.
 *
 * @method
 *
 * @param {Number} theta Angle by which to rotate.
 *
 * @return {Vec2} this
 */
Vec2.prototype.rotate = function(theta) {
    var x = this.x;
    var y = this.y;

    var cosTheta = Math.cos(theta);
    var sinTheta = Math.sin(theta);

    this.x = x * cosTheta - y * sinTheta;
    this.y = x * sinTheta + y * cosTheta;

    return this;
};

/**
 * The dot product of of the current Vec2 with the input Vec2.
 *
 * @method
 *
 * @param {Number} v The other Vec2.
 *
 * @return {Vec2} this
 */
Vec2.prototype.dot = function(v) {
    return this.x * v.x + this.y * v.y;
};

/**
 * The cross product of of the current Vec2 with the input Vec2.
 *
 * @method
 *
 * @param {Number} v The other Vec2.
 *
 * @return {Vec2} this
 */
Vec2.prototype.cross = function(v) {
    return this.x * v.y - this.y * v.x;
};

/**
 * Preserve the magnitude but invert the orientation of the current Vec2.
 *
 * @method
 *
 * @return {Vec2} this
 */
Vec2.prototype.invert = function invert() {
    this.x *= -1;
    this.y *= -1;
    return this;
};

/**
 * Apply a function component-wise to the current Vec2.
 *
 * @method
 *
 * @param {Function} fn Function to apply.
 *
 * @return {Vec2} this
 */
Vec2.prototype.map = function map(fn) {
    this.x = fn(this.x);
    this.y = fn(this.y);
    return this;
};

/**
 * Get the magnitude of the current Vec2.
 *
 * @method
 *
 * @return {Number} the length of the vector
 */
Vec2.prototype.length = function length() {
    var x = this.x;
    var y = this.y;

    return Math.sqrt(x * x + y * y);
};

/**
 * Copy the input onto the current Vec2.
 *
 * @method
 *
 * @param {Vec2} v Vec2 to copy
 *
 * @return {Vec2} this
 */
Vec2.prototype.copy = function copy(v) {
    this.x = v.x;
    this.y = v.y;
    return this;
};

/**
 * Reset the current Vec2.
 *
 * @method
 *
 * @return {Vec2} this
 */
Vec2.prototype.clear = function clear() {
    this.x = 0;
    this.y = 0;
    return this;
};

/**
 * Check whether the magnitude of the current Vec2 is exactly 0.
 *
 * @method
 *
 * @return {Boolean} whether or not the length is 0
 */
Vec2.prototype.isZero = function isZero() {
    if (this.x !== 0 || this.y !== 0) return false;
    else return true;
};

/**
 * The array form of the current Vec2.
 *
 * @method
 *
 * @return {Array} the Vec to as an array
 */
Vec2.prototype.toArray = function toArray() {
    return [this.x, this.y];
};

/**
 * Normalize the input Vec2.
 *
 * @method
 *
 * @param {Vec2} v The reference Vec2.
 * @param {Vec2} output Vec2 in which to place the result.
 *
 * @return {Vec2} The normalized Vec2.
 */
Vec2.normalize = function normalize(v, output) {
    var x = v.x;
    var y = v.y;

    var length = Math.sqrt(x * x + y * y) || 1;
    length = 1 / length;
    output.x = v.x * length;
    output.y = v.y * length;

    return output;
};

/**
 * Clone the input Vec2.
 *
 * @method
 *
 * @param {Vec2} v The Vec2 to clone.
 *
 * @return {Vec2} The cloned Vec2.
 */
Vec2.clone = function clone(v) {
    return new Vec2(v.x, v.y);
};

/**
 * Add the input Vec2's.
 *
 * @method
 *
 * @param {Vec2} v1 The left Vec2.
 * @param {Vec2} v2 The right Vec2.
 * @param {Vec2} output Vec2 in which to place the result.
 *
 * @return {Vec2} The result of the addition.
 */
Vec2.add = function add(v1, v2, output) {
    output.x = v1.x + v2.x;
    output.y = v1.y + v2.y;

    return output;
};

/**
 * Subtract the second Vec2 from the first.
 *
 * @method
 *
 * @param {Vec2} v1 The left Vec2.
 * @param {Vec2} v2 The right Vec2.
 * @param {Vec2} output Vec2 in which to place the result.
 *
 * @return {Vec2} The result of the subtraction.
 */
Vec2.subtract = function subtract(v1, v2, output) {
    output.x = v1.x - v2.x;
    output.y = v1.y - v2.y;
    return output;
};

/**
 * Scale the input Vec2.
 *
 * @method
 *
 * @param {Vec2} v The reference Vec2.
 * @param {Number} s Number to scale by.
 * @param {Vec2} output Vec2 in which to place the result.
 *
 * @return {Vec2} The result of the scaling.
 */
Vec2.scale = function scale(v, s, output) {
    output.x = v.x * s;
    output.y = v.y * s;
    return output;
};

/**
 * The dot product of the input Vec2's.
 *
 * @method
 *
 * @param {Vec2} v1 The left Vec2.
 * @param {Vec2} v2 The right Vec2.
 *
 * @return {Number} The dot product.
 */
Vec2.dot = function dot(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y;
};

/**
 * The cross product of the input Vec2's.
 *
 * @method
 *
 * @param {Number} v1 The left Vec2.
 * @param {Number} v2 The right Vec2.
 *
 * @return {Number} The z-component of the cross product.
 */
Vec2.cross = function(v1,v2) {
    return v1.x * v2.y - v1.y * v2.x;
};

module.exports = Vec2;

},{}],16:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

/**
 * A three-dimensional vector.
 *
 * @class Vec3
 *
 * @param {Number} x The x component.
 * @param {Number} y The y component.
 * @param {Number} z The z component.
 */
var Vec3 = function(x, y, z){
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
};

/**
 * Set the components of the current Vec3.
 *
 * @method
 *
 * @param {Number} x The x component.
 * @param {Number} y The y component.
 * @param {Number} z The z component.
 *
 * @return {Vec3} this
 */
Vec3.prototype.set = function set(x, y, z) {
    if (x != null) this.x = x;
    if (y != null) this.y = y;
    if (z != null) this.z = z;

    return this;
};

/**
 * Add the input v to the current Vec3.
 *
 * @method
 *
 * @param {Vec3} v The Vec3 to add.
 *
 * @return {Vec3} this
 */
Vec3.prototype.add = function add(v) {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;

    return this;
};

/**
 * Subtract the input v from the current Vec3.
 *
 * @method
 *
 * @param {Vec3} v The Vec3 to subtract.
 *
 * @return {Vec3} this
 */
Vec3.prototype.subtract = function subtract(v) {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;

    return this;
};

/**
 * Subtract the input a from b and create new vector.
 *
 * @method
 *
 * @param {Vec3} a The Vec3 to subtract.
 * @param {Vec3} b The Vec3 to subtract.
 *
 * @return {Vec3} this
 */
Vec3.prototype.subVectors = function ( a, b ) {

	this.x = a.x - b.x;
	this.y = a.y - b.y;
	this.z = a.z - b.z;

	return this;

};

/**
 * Rotate the current Vec3 by theta clockwise about the x axis.
 *
 * @method
 *
 * @param {Number} theta Angle by which to rotate.
 *
 * @return {Vec3} this
 */
Vec3.prototype.rotateX = function rotateX(theta) {
    var y = this.y;
    var z = this.z;

    var cosTheta = Math.cos(theta);
    var sinTheta = Math.sin(theta);

    this.y = y * cosTheta - z * sinTheta;
    this.z = y * sinTheta + z * cosTheta;

    return this;
};

/**
 * Rotate the current Vec3 by theta clockwise about the y axis.
 *
 * @method
 *
 * @param {Number} theta Angle by which to rotate.
 *
 * @return {Vec3} this
 */
Vec3.prototype.rotateY = function rotateY(theta) {
    var x = this.x;
    var z = this.z;

    var cosTheta = Math.cos(theta);
    var sinTheta = Math.sin(theta);

    this.x = z * sinTheta + x * cosTheta;
    this.z = z * cosTheta - x * sinTheta;

    return this;
};

/**
 * Rotate the current Vec3 by theta clockwise about the z axis.
 *
 * @method
 *
 * @param {Number} theta Angle by which to rotate.
 *
 * @return {Vec3} this
 */
Vec3.prototype.rotateZ = function rotateZ(theta) {
    var x = this.x;
    var y = this.y;

    var cosTheta = Math.cos(theta);
    var sinTheta = Math.sin(theta);

    this.x = x * cosTheta - y * sinTheta;
    this.y = x * sinTheta + y * cosTheta;

    return this;
};

/**
 * The dot product of the current Vec3 with input Vec3 v.
 *
 * @method
 *
 * @param {Vec3} v The other Vec3.
 *
 * @return {Vec3} this
 */
Vec3.prototype.dot = function dot(v) {
    return this.x*v.x + this.y*v.y + this.z*v.z;
};

/**
 * The dot product of the current Vec3 with input Vec3 v.
 * Stores the result in the current Vec3.
 *
 * @method cross
 *
 * @param {Vec3} v The other Vec3
 *
 * @return {Vec3} this
 */
Vec3.prototype.cross = function cross(v) {
    var x = this.x;
    var y = this.y;
    var z = this.z;

    var vx = v.x;
    var vy = v.y;
    var vz = v.z;

    this.x = y * vz - z * vy;
    this.y = z * vx - x * vz;
    this.z = x * vy - y * vx;
    return this;
};

/**
 * Scale the current Vec3 by a scalar.
 *
 * @method
 *
 * @param {Number} s The Number by which to scale
 *
 * @return {Vec3} this
 */
Vec3.prototype.scale = function scale(s) {
    this.x *= s;
    this.y *= s;
    this.z *= s;

    return this;
};

/**
 * Preserve the magnitude but invert the orientation of the current Vec3.
 *
 * @method
 *
 * @return {Vec3} this
 */
Vec3.prototype.invert = function invert() {
    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z;

    return this;
};

/**
 * Apply a function component-wise to the current Vec3.
 *
 * @method
 *
 * @param {Function} fn Function to apply.
 *
 * @return {Vec3} this
 */
Vec3.prototype.map = function map(fn) {
    this.x = fn(this.x);
    this.y = fn(this.y);
    this.z = fn(this.z);

    return this;
};

/**
 * The magnitude of the current Vec3.
 *
 * @method
 *
 * @return {Number} the magnitude of the Vec3
 */
Vec3.prototype.length = function length() {
    var x = this.x;
    var y = this.y;
    var z = this.z;

    return Math.sqrt(x * x + y * y + z * z);
};

/**
 * The magnitude squared of the current Vec3.
 *
 * @method
 *
 * @return {Number} magnitude of the Vec3 squared
 */
Vec3.prototype.lengthSq = function lengthSq() {
    var x = this.x;
    var y = this.y;
    var z = this.z;

    return x * x + y * y + z * z;
};

/**
 * Copy the input onto the current Vec3.
 *
 * @method
 *
 * @param {Vec3} v Vec3 to copy
 *
 * @return {Vec3} this
 */
Vec3.prototype.copy = function copy(v) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
};

/**
 * Reset the current Vec3.
 *
 * @method
 *
 * @return {Vec3} this
 */
Vec3.prototype.clear = function clear() {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    return this;
};

/**
 * Check whether the magnitude of the current Vec3 is exactly 0.
 *
 * @method
 *
 * @return {Boolean} whether or not the magnitude is zero
 */
Vec3.prototype.isZero = function isZero() {
    return this.x === 0 && this.y === 0 && this.z === 0;
};

/**
 * The array form of the current Vec3.
 *
 * @method
 *
 * @return {Array} a three element array representing the components of the Vec3
 */
Vec3.prototype.toArray = function toArray() {
    return [this.x, this.y, this.z];
};

/**
 * Preserve the orientation but change the length of the current Vec3 to 1.
 *
 * @method
 *
 * @return {Vec3} this
 */
Vec3.prototype.normalize = function normalize() {
    var x = this.x;
    var y = this.y;
    var z = this.z;

    var len = Math.sqrt(x * x + y * y + z * z) || 1;
    len = 1 / len;

    this.x *= len;
    this.y *= len;
    this.z *= len;
    return this;
};

/**
 * Apply the rotation corresponding to the input (unit) Quaternion
 * to the current Vec3.
 *
 * @method
 *
 * @param {Quaternion} q Unit Quaternion representing the rotation to apply
 *
 * @return {Vec3} this
 */
Vec3.prototype.applyRotation = function applyRotation(q) {
    var cw = q.w;
    var cx = -q.x;
    var cy = -q.y;
    var cz = -q.z;

    var vx = this.x;
    var vy = this.y;
    var vz = this.z;

    var tw = -cx * vx - cy * vy - cz * vz;
    var tx = vx * cw + vy * cz - cy * vz;
    var ty = vy * cw + cx * vz - vx * cz;
    var tz = vz * cw + vx * cy - cx * vy;

    var w = cw;
    var x = -cx;
    var y = -cy;
    var z = -cz;

    this.x = tx * w + x * tw + y * tz - ty * z;
    this.y = ty * w + y * tw + tx * z - x * tz;
    this.z = tz * w + z * tw + x * ty - tx * y;
    return this;
};

/**
 * Apply the input Mat33 the the current Vec3.
 *
 * @method
 *
 * @param {Mat33} matrix Mat33 to apply
 *
 * @return {Vec3} this
 */
Vec3.prototype.applyMatrix = function applyMatrix(matrix) {
    var M = matrix.get();

    var x = this.x;
    var y = this.y;
    var z = this.z;

    this.x = M[0]*x + M[1]*y + M[2]*z;
    this.y = M[3]*x + M[4]*y + M[5]*z;
    this.z = M[6]*x + M[7]*y + M[8]*z;
    return this;
};

/**
 * Normalize the input Vec3.
 *
 * @method
 *
 * @param {Vec3} v The reference Vec3.
 * @param {Vec3} output Vec3 in which to place the result.
 *
 * @return {Vec3} The normalize Vec3.
 */
Vec3.normalize = function normalize(v, output) {
    var x = v.x;
    var y = v.y;
    var z = v.z;

    var length = Math.sqrt(x * x + y * y + z * z) || 1;
    length = 1 / length;

    output.x = x * length;
    output.y = y * length;
    output.z = z * length;
    return output;
};

/**
 * Apply a rotation to the input Vec3.
 *
 * @method
 *
 * @param {Vec3} v The reference Vec3.
 * @param {Quaternion} q Unit Quaternion representing the rotation to apply.
 * @param {Vec3} output Vec3 in which to place the result.
 *
 * @return {Vec3} The rotated version of the input Vec3.
 */
Vec3.applyRotation = function applyRotation(v, q, output) {
    var cw = q.w;
    var cx = -q.x;
    var cy = -q.y;
    var cz = -q.z;

    var vx = v.x;
    var vy = v.y;
    var vz = v.z;

    var tw = -cx * vx - cy * vy - cz * vz;
    var tx = vx * cw + vy * cz - cy * vz;
    var ty = vy * cw + cx * vz - vx * cz;
    var tz = vz * cw + vx * cy - cx * vy;

    var w = cw;
    var x = -cx;
    var y = -cy;
    var z = -cz;

    output.x = tx * w + x * tw + y * tz - ty * z;
    output.y = ty * w + y * tw + tx * z - x * tz;
    output.z = tz * w + z * tw + x * ty - tx * y;
    return output;
};

/**
 * Clone the input Vec3.
 *
 * @method
 *
 * @param {Vec3} v The Vec3 to clone.
 *
 * @return {Vec3} The cloned Vec3.
 */
Vec3.clone = function clone(v) {
    return new Vec3(v.x, v.y, v.z);
};

/**
 * Add the input Vec3's.
 *
 * @method
 *
 * @param {Vec3} v1 The left Vec3.
 * @param {Vec3} v2 The right Vec3.
 * @param {Vec3} output Vec3 in which to place the result.
 *
 * @return {Vec3} The result of the addition.
 */
Vec3.add = function add(v1, v2, output) {
    output.x = v1.x + v2.x;
    output.y = v1.y + v2.y;
    output.z = v1.z + v2.z;
    return output;
};

/**
 * Subtract the second Vec3 from the first.
 *
 * @method
 *
 * @param {Vec3} v1 The left Vec3.
 * @param {Vec3} v2 The right Vec3.
 * @param {Vec3} output Vec3 in which to place the result.
 *
 * @return {Vec3} The result of the subtraction.
 */
Vec3.subtract = function subtract(v1, v2, output) {
    output.x = v1.x - v2.x;
    output.y = v1.y - v2.y;
    output.z = v1.z - v2.z;
    return output;
};

/**
 * Scale the input Vec3.
 *
 * @method
 *
 * @param {Vec3} v The reference Vec3.
 * @param {Number} s Number to scale by.
 * @param {Vec3} output Vec3 in which to place the result.
 *
 * @return {Vec3} The result of the scaling.
 */
Vec3.scale = function scale(v, s, output) {
    output.x = v.x * s;
    output.y = v.y * s;
    output.z = v.z * s;
    return output;
};

/**
 * Scale and add the input Vec3.
 *
 * @method
 *
 * @param {Vec3} v The reference Vec3.
 * @param {Number} s Number to scale by.
 * @param {Vec3} output Vec3 in which to place the result.
 *
 * @return {Vec3} The result of the scaling.
 */
Vec3.prototype.scaleAndAdd = function scaleAndAdd(a, b, s) {
    this.x = a.x + (b.x * s);
    this.y = a.y + (b.y * s);
    this.z = a.z + (b.z * s);
};


/**
 * Calculates the squared euclidian distance between two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} squared distance between a and b
 */
Vec3.prototype.squaredDistance = function squaredDistance(b) {
    var x = b.x - this.x,
        y = b.y - this.y,
        z = b.z - this.z;
    return x*x + y*y + z*z
};

Vec3.prototype.distanceTo = function ( v ) {

    return Math.sqrt( this.squaredDistance( v ) );

};

/**
 * The dot product of the input Vec3's.
 *
 * @method
 *
 * @param {Vec3} v1 The left Vec3.
 * @param {Vec3} v2 The right Vec3.
 *
 * @return {Number} The dot product.
 */
Vec3.dot = function dot(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
};

/**
 * The (right-handed) cross product of the input Vec3's.
 * v1 x v2.
 *
 * @method
 *
 * @param {Vec3} v1 The left Vec3.
 * @param {Vec3} v2 The right Vec3.
 * @param {Vec3} output Vec3 in which to place the result.
 *
 * @return {Object} the object the result of the cross product was placed into
 */
Vec3.cross = function cross(v1, v2, output) {
    var x1 = v1.x;
    var y1 = v1.y;
    var z1 = v1.z;
    var x2 = v2.x;
    var y2 = v2.y;
    var z2 = v2.z;

    output.x = y1 * z2 - z1 * y2;
    output.y = z1 * x2 - x1 * z2;
    output.z = x1 * y2 - y1 * x2;
    return output;
};

/**
 * The projection of v1 onto v2.
 *
 * @method
 *
 * @param {Vec3} v1 The left Vec3.
 * @param {Vec3} v2 The right Vec3.
 * @param {Vec3} output Vec3 in which to place the result.
 *
 * @return {Object} the object the result of the cross product was placed into
 */
Vec3.project = function project(v1, v2, output) {
    var x1 = v1.x;
    var y1 = v1.y;
    var z1 = v1.z;
    var x2 = v2.x;
    var y2 = v2.y;
    var z2 = v2.z;

    var scale = x1 * x2 + y1 * y2 + z1 * z2;
    scale /= x2 * x2 + y2 * y2 + z2 * z2;

    output.x = x2 * scale;
    output.y = y2 * scale;
    output.z = z2 * scale;

    return output;
};

Vec3.prototype.createFromArray = function(a){
    this.x = a[0] || 0;
    this.y = a[1] || 0;
    this.z = a[2] || 0;
};

module.exports = Vec3;

},{}],17:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

module.exports = {
    Mat33: require('./Mat33'),
    Quaternion: require('./Quaternion'),
    Vec2: require('./Vec2'),
    Vec3: require('./Vec3'),
    Ray: require('./Ray'),
    Matrix: require('./Matrix')
};

},{"./Mat33":11,"./Matrix":12,"./Quaternion":13,"./Ray":14,"./Vec2":15,"./Vec3":16}],18:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/*jshint -W008 */

'use strict';

/**
 * A library of curves which map an animation explicitly as a function of time.
 *
 * @namespace
 * @property {Function} linear
 * @property {Function} easeIn
 * @property {Function} easeOut
 * @property {Function} easeInOut
 * @property {Function} easeOutBounce
 * @property {Function} spring
 * @property {Function} inQuad
 * @property {Function} outQuad
 * @property {Function} inOutQuad
 * @property {Function} inCubic
 * @property {Function} outCubic
 * @property {Function} inOutCubic
 * @property {Function} inQuart
 * @property {Function} outQuart
 * @property {Function} inOutQuart
 * @property {Function} inQuint
 * @property {Function} outQuint
 * @property {Function} inOutQuint
 * @property {Function} inSine
 * @property {Function} outSine
 * @property {Function} inOutSine
 * @property {Function} inExpo
 * @property {Function} outExpo
 * @property {Function} inOutExp
 * @property {Function} inCirc
 * @property {Function} outCirc
 * @property {Function} inOutCirc
 * @property {Function} inElastic
 * @property {Function} outElastic
 * @property {Function} inOutElastic
 * @property {Function} inBounce
 * @property {Function} outBounce
 * @property {Function} inOutBounce
 * @property {Function} flat            - Useful for delaying the execution of
 *                                        a subsequent transition.
 */
var Curves = {
    linear: function(t) {
        return t;
    },

    easeIn: function(t) {
        return t*t;
    },

    easeOut: function(t) {
        return t*(2-t);
    },

    easeInOut: function(t) {
        if (t <= 0.5) return 2*t*t;
        else return -2*t*t + 4*t - 1;
    },

    easeOutBounce: function(t) {
        return t*(3 - 2*t);
    },

    spring: function(t) {
        return (1 - t) * Math.sin(6 * Math.PI * t) + t;
    },

    inQuad: function(t) {
        return t*t;
    },

    outQuad: function(t) {
        return -(t-=1)*t+1;
    },

    inOutQuad: function(t) {
        if ((t/=.5) < 1) return .5*t*t;
        return -.5*((--t)*(t-2) - 1);
    },

    inCubic: function(t) {
        return t*t*t;
    },

    outCubic: function(t) {
        return ((--t)*t*t + 1);
    },

    inOutCubic: function(t) {
        if ((t/=.5) < 1) return .5*t*t*t;
        return .5*((t-=2)*t*t + 2);
    },

    inQuart: function(t) {
        return t*t*t*t;
    },

    outQuart: function(t) {
        return -((--t)*t*t*t - 1);
    },

    inOutQuart: function(t) {
        if ((t/=.5) < 1) return .5*t*t*t*t;
        return -.5 * ((t-=2)*t*t*t - 2);
    },

    inQuint: function(t) {
        return t*t*t*t*t;
    },

    outQuint: function(t) {
        return ((--t)*t*t*t*t + 1);
    },

    inOutQuint: function(t) {
        if ((t/=.5) < 1) return .5*t*t*t*t*t;
        return .5*((t-=2)*t*t*t*t + 2);
    },

    inSine: function(t) {
        return -1.0*Math.cos(t * (Math.PI/2)) + 1.0;
    },

    outSine: function(t) {
        return Math.sin(t * (Math.PI/2));
    },

    inOutSine: function(t) {
        return -.5*(Math.cos(Math.PI*t) - 1);
    },

    inExpo: function(t) {
        return (t===0) ? 0.0 : Math.pow(2, 10 * (t - 1));
    },

    outExpo: function(t) {
        return (t===1.0) ? 1.0 : (-Math.pow(2, -10 * t) + 1);
    },

    inOutExpo: function(t) {
        if (t===0) return 0.0;
        if (t===1.0) return 1.0;
        if ((t/=.5) < 1) return .5 * Math.pow(2, 10 * (t - 1));
        return .5 * (-Math.pow(2, -10 * --t) + 2);
    },

    inCirc: function(t) {
        return -(Math.sqrt(1 - t*t) - 1);
    },

    outCirc: function(t) {
        return Math.sqrt(1 - (--t)*t);
    },

    inOutCirc: function(t) {
        if ((t/=.5) < 1) return -.5 * (Math.sqrt(1 - t*t) - 1);
        return .5 * (Math.sqrt(1 - (t-=2)*t) + 1);
    },

    inElastic: function(t) {
        var s=1.70158;var p=0;var a=1.0;
        if (t===0) return 0.0;  if (t===1) return 1.0;  if (!p) p=.3;
        s = p/(2*Math.PI) * Math.asin(1.0/a);
        return -(a*Math.pow(2,10*(t-=1)) * Math.sin((t-s)*(2*Math.PI)/ p));
    },

    outElastic: function(t) {
        var s=1.70158;var p=0;var a=1.0;
        if (t===0) return 0.0;  if (t===1) return 1.0;  if (!p) p=.3;
        s = p/(2*Math.PI) * Math.asin(1.0/a);
        return a*Math.pow(2,-10*t) * Math.sin((t-s)*(2*Math.PI)/p) + 1.0;
    },

    inOutElastic: function(t) {
        var s=1.70158;var p=0;var a=1.0;
        if (t===0) return 0.0;  if ((t/=.5)===2) return 1.0;  if (!p) p=(.3*1.5);
        s = p/(2*Math.PI) * Math.asin(1.0/a);
        if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin((t-s)*(2*Math.PI)/p));
        return a*Math.pow(2,-10*(t-=1)) * Math.sin((t-s)*(2*Math.PI)/p)*.5 + 1.0;
    },

    inBack: function(t, s) {
        if (s === undefined) s = 1.70158;
        return t*t*((s+1)*t - s);
    },

    outBack: function(t, s) {
        if (s === undefined) s = 1.70158;
        return ((--t)*t*((s+1)*t + s) + 1);
    },

    inOutBack: function(t, s) {
        if (s === undefined) s = 1.70158;
        if ((t/=.5) < 1) return .5*(t*t*(((s*=(1.525))+1)*t - s));
        return .5*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2);
    },

    inBounce: function(t) {
        return 1.0 - Curves.outBounce(1.0-t);
    },

    outBounce: function(t) {
        if (t < (1/2.75)) {
            return (7.5625*t*t);
        }
        else if (t < (2/2.75)) {
            return (7.5625*(t-=(1.5/2.75))*t + .75);
        }
        else if (t < (2.5/2.75)) {
            return (7.5625*(t-=(2.25/2.75))*t + .9375);
        }
        else {
            return (7.5625*(t-=(2.625/2.75))*t + .984375);
        }
    },

    inOutBounce: function(t) {
        if (t < .5) return Curves.inBounce(t*2) * .5;
        return Curves.outBounce(t*2-1.0) * .5 + .5;
    },

    flat: function() {
        return 0;
    }
};

module.exports = Curves;

},{}],19:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Curves = require('./Curves');
var Engine = require('../core/Engine');

/**
 * A state maintainer for a smooth transition between
 *    numerically-specified states. Example numeric states include floats and
 *    arrays of floats objects.
 *
 * An initial state is set with the constructor or using
 *     {@link Transitionable#from}. Subsequent transitions consist of an
 *     intermediate state, easing curve, duration and callback. The final state
 *     of each transition is the initial state of the subsequent one. Calls to
 *     {@link Transitionable#get} provide the interpolated state along the way.
 *
 * Note that there is no event loop here - calls to {@link Transitionable#get}
 *    are the only way to find state projected to the current (or provided)
 *    time and are the only way to trigger callbacks and mutate the internal
 *    transition queue.
 *
 * @example
 * var t = new Transitionable([0, 0]);
 * t
 *     .to([100, 0], 'linear', 1000)
 *     .delay(1000)
 *     .to([200, 0], 'outBounce', 1000);
 *
 * var div = document.createElement('div');
 * div.style.background = 'blue';
 * div.style.width = '100px';
 * div.style.height = '100px';
 * document.body.appendChild(div);
 *
 * div.addEventListener('click', function() {
 *     t.isPaused() ? t.resume() : t.pause();
 * });
 *
 * requestAnimationFrame(function loop() {
 *     div.style.transform = 'translateX(' + t.get()[0] + 'px)' + ' translateY(' + t.get()[1] + 'px)';
 *     requestAnimationFrame(loop);
 * });
 *
 * @class Transitionable
 * @constructor
 * @param {Number|Array.Number} initialState    initial state to transition
 *                                              from - equivalent to a pursuant
 *                                              invocation of
 *                                              {@link Transitionable#from}
 */
 var performance = {};

 (function(){

   Date.now = (Date.now || function () {  // thanks IE8
 	  return new Date().getTime();
   });

   if ("now" in performance == false){

     var nowOffset = Date.now();

     if (performance.timing && performance.timing.navigationStart){
       nowOffset = performance.timing.navigationStart
     }

     performance.now = function now(){
       return Date.now() - nowOffset;
     }
   }

 })();

function Transitionable(initialState, param, loop) {
    this._queue = [];
    this._from = null;
    this._state = null;
    this._startedAt = null;
    this._pausedAt = null;
    this._loop = loop || null;
    this.id = null;
    param ? this.param = param : param = null;
    if (initialState != null) this.from(initialState);
    Engine.updateQueue.push(this);
}

/**
 * Registers a transition to be pushed onto the internal queue.
 *
 * @method to
 * @chainable
 *
 * @param  {Number|Array.Number}    finalState              final state to
 *                                                          transiton to
 * @param  {String|Function}        [curve=Curves.linear]   easing function
 *                                                          used for
 *                                                          interpolating
 *                                                          [0, 1]
 * @param  {Number}                 [duration=100]          duration of
 *                                                          transition
 * @param  {Function}               [callback]              callback function
 *                                                          to be called after
 *                                                          the transition is
 *                                                          complete
 * @param  {String}                 [method]                method used for
 *                                                          interpolation
 *                                                          (e.g. slerp)
 * @return {Transitionable}         this
 */
Transitionable.prototype.to = function to(finalState, curve, duration, callback, method) {

    curve = curve != null && curve.constructor === String ? Curves[curve] : curve;
    if (this._queue.length === 0) {
        this._startedAt = performance.now();
        this._pausedAt = null;
    }

    this._queue.push(
        finalState,
        curve != null ? curve : Curves.linear,
        duration != null ? duration : 100,
        callback,
        method
    );

    return this;
};

/**
 * Resets the transition queue to a stable initial state.
 *
 * @method from
 * @chainable
 *
 * @param  {Number|Array.Number}    initialState    initial state to
 *                                                  transition from
 * @return {Transitionable}         this
 */
Transitionable.prototype.from = function from(initialState) {
    this._state = initialState;
    this._from = this._sync(null, this._state);
    this._queue.length = 0;
    this._startedAt = performance.now();
    this._pausedAt = null;
    return this;
};

/**
 * Delays the execution of the subsequent transition for a certain period of
 * time.
 *
 * @method delay
 * @chainable
 *
 * @param {Number}      duration    delay time in ms
 * @param {Function}    [callback]  Zero-argument function to call on observed
 *                                  completion (t=1)
 * @return {Transitionable}         this
 */
Transitionable.prototype.delay = function delay(duration, callback) {
    var endState = this._queue.length > 0 ? this._queue[this._queue.length - 5] : this._state;
    return this.to(endState, Curves.flat, duration, callback);
};

/**
 * Overrides current transition.
 *
 * @method override
 * @chainable
 *
 * @param  {Number|Array.Number}    [finalState]    final state to transiton to
 * @param  {String|Function}        [curve]         easing function used for
 *                                                  interpolating [0, 1]
 * @param  {Number}                 [duration]      duration of transition
 * @param  {Function}               [callback]      callback function to be
 *                                                  called after the transition
 *                                                  is complete
 * @param {String}                  [method]        optional method used for
 *                                                  interpolating between the
 *                                                  values. Set to `slerp` for
 *                                                  spherical linear
 *                                                  interpolation.
 * @return {Transitionable}         this
 */
Transitionable.prototype.override = function override(finalState, curve, duration, callback, method) {
    if (this._queue.length > 0) {
        if (finalState != null) this._queue[0] = finalState;
        if (curve != null)      this._queue[1] = curve.constructor === String ? Curves[curve] : curve;
        if (duration != null)   this._queue[2] = duration;
        if (callback != null)   this._queue[3] = callback;
        if (method != null)     this._queue[4] = method;
    }
    return this;
};


/**
 * Used for interpolating between the start and end state of the currently
 * running transition
 *
 * @method  _interpolate
 * @private
 *
 * @param  {Object|Array|Number} output     Where to write to (in order to avoid
 *                                          object allocation and therefore GC).
 * @param  {Object|Array|Number} from       Start state of current transition.
 * @param  {Object|Array|Number} to         End state of current transition.
 * @param  {Number} progress                Progress of the current transition,
 *                                          in [0, 1]
 * @param  {String} method                  Method used for interpolation (e.g.
 *                                          slerp)
 * @return {Object|Array|Number}            output
 */
Transitionable.prototype._interpolate = function _interpolate(output, from, to, progress, method) {
    if (to instanceof Object) {
        if (method === 'slerp') {
            var x, y, z, w;
            var qx, qy, qz, qw;
            var omega, cosomega, sinomega, scaleFrom, scaleTo;

            x = from[0];
            y = from[1];
            z = from[2];
            w = from[3];

            qx = to[0];
            qy = to[1];
            qz = to[2];
            qw = to[3];

            if (progress === 1) {
                output[0] = qx;
                output[1] = qy;
                output[2] = qz;
                output[3] = qw;
                return output;
            }

            cosomega = w * qw + x * qx + y * qy + z * qz;
            if ((1.0 - cosomega) > 1e-5) {
                omega = Math.acos(cosomega);
                sinomega = Math.sin(omega);
                scaleFrom = Math.sin((1.0 - progress) * omega) / sinomega;
                scaleTo = Math.sin(progress * omega) / sinomega;
            }
            else {
                scaleFrom = 1.0 - progress;
                scaleTo = progress;
            }

            output[0] = x * scaleFrom + qx * scaleTo;
            output[1] = y * scaleFrom + qy * scaleTo;
            output[2] = z * scaleFrom + qz * scaleTo;
            output[3] = w * scaleFrom + qw * scaleTo;
        }
        else if (to instanceof Array) {
            for (var i = 0, len = to.length; i < len; i++) {
                output[i] = this._interpolate(output[i], from[i], to[i], progress, method);
            }
        }
        else {
            for (var key in to) {
                output[key] = this._interpolate(output[key], from[key], to[key], progress, method);
            }
        }
    }
    else {
        output = from + progress * (to - from);
    }
    return output;
};


/**
 * Internal helper method used for synchronizing the current, absolute state of
 * a transition to a given output array, object literal or number. Supports
 * nested state objects by through recursion.
 *
 * @method  _sync
 * @private
 *
 * @param  {Number|Array|Object} output     Where to write to (in order to avoid
 *                                          object allocation and therefore GC).
 * @param  {Number|Array|Object} input      Input state to proxy onto the
 *                                          output.
 * @return {Number|Array|Object} output     Passed in output object.
 */
Transitionable.prototype._sync = function _sync(output, input) {
    if (typeof input === 'number') output = input;
    else if (input instanceof Array) {
        if (output == null) output = [];
        for (var i = 0, len = input.length; i < len; i++) {
            output[i] = _sync(output[i], input[i]);
        }
    }
    else if (input instanceof Object) {
        if (output == null) output = {};
        for (var key in input) {
            output[key] = _sync(output[key], input[key]);
        }
    }
    return output;
};

/**
 * Get interpolated state of current action at provided time. If the last
 *    action has completed, invoke its callback.
 *
 * @method get
 *
 * @param {Number=} t               Evaluate the curve at a normalized version
 *                                  of this time. If omitted, use current time
 *                                  (Unix epoch time retrieved from Clock).
 * @return {Number|Array.Number}    Beginning state interpolated to this point
 *                                  in time.
 */
Transitionable.prototype.get = function get(t) {
    if (this._queue.length === 0) return this._state;

    t = this._pausedAt ? this._pausedAt : t;
    t = t ? t : performance.now();

    var progress = (t - this._startedAt) / this._queue[2];
    this._state = this._interpolate(
        this._state,
        this._from,
        this._queue[0],
        this._queue[1](progress > 1 ? 1 : progress),
        this._queue[4]
    );
    var state = this._state;
    if (progress >= 1) {
        this._startedAt = this._startedAt + this._queue[2];
        this._from = this._sync(this._from, this._state);
        this._queue.shift();
        this._queue.shift();
        this._queue.shift();
        var callback = this._queue.shift();
        this._queue.shift();
        if (callback) callback();
    }
    return progress > 1 ? this.get() : state;
};

/**
 * Is there at least one transition pending completion?
 *
 * @method isActive
 *
 * @return {Boolean}    Boolean indicating whether there is at least one pending
 *                      transition. Paused transitions are still being
 *                      considered active.
 */
Transitionable.prototype.isActive = function isActive() {
    return this._queue.length > 0;
};

/**
 * Halt transition at current state and erase all pending actions.
 *
 * @method halt
 * @chainable
 *
 * @return {Transitionable} this
 */
Transitionable.prototype.halt = function halt() {
    return this.from(this.get());
};

/**
 * Pause transition. This will not erase any actions.
 *
 * @method pause
 * @chainable
 *
 * @return {Transitionable} this
 */
Transitionable.prototype.pause = function pause() {
    this._pausedAt = performance.now();
    return this;
};

/**
 * Has the current action been paused?
 *
 * @method isPaused
 * @chainable
 *
 * @return {Boolean} if the current action has been paused
 */
Transitionable.prototype.isPaused = function isPaused() {
    return !!this._pausedAt;
};

/**
 * Resume a previously paused transition.
 *
 * @method resume
 * @chainable
 *
 * @return {Transitionable} this
 */
Transitionable.prototype.resume = function resume() {
    var diff = this._pausedAt - this._startedAt;
    this._startedAt = performance.now() - diff;
    this._pausedAt = null;
    return this;
};

/**
 * Cancel all transitions and reset to a stable state
 *
 * @method reset
 * @chainable
 * @deprecated Use `.from` instead!
 *
 * @param {Number|Array.Number|Object.<number, number>} start
 *    stable state to set to
 * @return {Transitionable}                             this
 */
Transitionable.prototype.reset = function(start) {
    return this.from(start);
};

/**
 * Add transition to end state to the queue of pending transitions. Special
 *    Use: calling without a transition resets the object to that state with
 *    no pending actions
 *
 * @method set
 * @chainable
 * @deprecated Use `.to` instead!
 *
 * @param {Number|FamousEngineMatrix|Array.Number|Object.<number, number>} state
 *    end state to which we interpolate
 * @param {transition=} transition object of type {duration: number, curve:
 *    f[0,1] -> [0,1] or name}. If transition is omitted, change will be
 *    instantaneous.
 * @param {function()=} callback Zero-argument function to call on observed
 *    completion (t=1)
 * @return {Transitionable} this
 */
Transitionable.prototype.set = function(state, transition, callback) {
    if (transition == null) {
        this.from(state);
        if (callback) callback();
    }
    else {
        this.to(state, transition.curve, transition.duration, callback, transition.method);
    }
    return this;
};


module.exports = Transitionable;

},{"../core/Engine":4,"./Curves":18}],20:[function(require,module,exports){
module.exports = {
    Curves: require('./Curves'),
    Transitionable: require('./Transitionable')
};

},{"./Curves":18,"./Transitionable":19}]},{},[10])(10)
});
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInNyYy9jb21wb25lbnRzL0NvbXBvbmVudC5qcyIsInNyYy9jb21wb25lbnRzL0RPTUNvbXBvbmVudC5qcyIsInNyYy9jb21wb25lbnRzL2luZGV4LmpzIiwic3JjL2NvcmUvRW5naW5lLmpzIiwic3JjL2NvcmUvTm9kZS5qcyIsInNyYy9jb3JlL1NjZW5lLmpzIiwic3JjL2NvcmUvaW5kZXguanMiLCJzcmMvZXZlbnRzL1Njcm9sbFN5bmMuanMiLCJzcmMvZXZlbnRzL2luZGV4LmpzIiwic3JjL2luZGV4LmpzIiwic3JjL21hdGgvTWF0MzMuanMiLCJzcmMvbWF0aC9NYXRyaXguanMiLCJzcmMvbWF0aC9RdWF0ZXJuaW9uLmpzIiwic3JjL21hdGgvUmF5LmpzIiwic3JjL21hdGgvVmVjMi5qcyIsInNyYy9tYXRoL1ZlYzMuanMiLCJzcmMvbWF0aC9pbmRleC5qcyIsInNyYy90cmFuc2l0aW9ucy9DdXJ2ZXMuanMiLCJzcmMvdHJhbnNpdGlvbnMvVHJhbnNpdGlvbmFibGUuanMiLCJzcmMvdHJhbnNpdGlvbnMvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcFFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEZBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxZUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwaUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5cEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4qIENvbXBvbmVudFxuKlxuKiBBIHNpbXBsZSBBUEkgZm9yIGFsbCBDb21wb25lbnRzIHRoYXQgb3BlcmF0ZSB2aWEgdGhlIEVuZ2luZS5cbiogVGhpcyBjbGFzcyBzaG91bGQgY29udGFpbiBwcm9wZXJ0aWVzIHNoYXJlZCBieSBhbGwgQ29tcG9uZW50cyxcbiogZm9yIGV4YW1wbGUgRE9NQ29tcG9uZW50LCBTVkdDb21wb25lbnQsIGFuZCBNZXNoQ29tcG9uZW50LlxuKlxuKiBieSBTdGV2ZSBCZWxvdmFyaWNoXG4qIExpY2Vuc2VkIHVuZGVyIE1JVCwgc2VlIGxpY2Vuc2UudHh0IG9yIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG4qKi9cblxudmFyIENvbXBvbmVudCA9IGZ1bmN0aW9uKG5vZGUpe1xuICAgIHRoaXMubm9kZSA9IG5vZGUgPyBub2RlIDogbnVsbDtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ29tcG9uZW50O1xuIiwiLyoqXG4qIERPTUNvbXBvbmVudFxuKlxuKiBIYW5kbGVzIHVwZGF0aW5nIGEgNHg0IE1hdHJpeCBtYXBwZWQgdG8gTWF0cml4M0QgdHJhbnNmb3JtcyBvbiBhIERPTUVsZW1lbnQuXG4qXG4qIGJ5IFN0ZXZlIEJlbG92YXJpY2hcbiogTGljZW5zZWQgdW5kZXIgTUlULCBzZWUgbGljZW5zZS50eHQgb3IgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcbioqL1xuXG52YXIgQ29tcG9uZW50ID0gcmVxdWlyZSgnLi9Db21wb25lbnQnKTtcbnZhciBNYXRyaXggPSByZXF1aXJlKCcuLi9tYXRoL01hdHJpeCcpO1xuXG52YXIgRE9NQ29tcG9uZW50ID0gZnVuY3Rpb24obm9kZSwgZWxlbSwgY29udGFpbmVyKXtcblxuICAgIHRoaXMubm9kZSA9IG5vZGUuaWQgPyBub2RlLmlkIDogbm9kZTtcbiAgICB0aGlzLl9ub2RlID0gbm9kZTtcbiAgICB0aGlzLmVsZW0gPSBlbGVtID8gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChlbGVtKSA6IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXG4gICAgdmFyIGNvbnRhaW5lciA9IGNvbnRhaW5lciA/IGNvbnRhaW5lciA6IGRvY3VtZW50LmJvZHk7XG5cbiAgICB0aGlzLmVsZW0uZGF0YXNldC5ub2RlID0gdGhpcy5ub2RlO1xuICAgIHRoaXMuZWxlbS5jbGFzc0xpc3QuYWRkKHRoaXMubm9kZSk7XG4gICAgdGhpcy5lbGVtLmNsYXNzTGlzdC5hZGQoJ25vZGUnKTtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5lbGVtKTtcblxuICAgIE9iamVjdC5vYnNlcnZlKHRoaXMuX25vZGUsIGZ1bmN0aW9uKGNoYW5nZXMpe1xuICAgICAgICB0aGlzLnRyYW5zZm9ybSh0aGlzLl9ub2RlKTtcbiAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgdmFyIHByZWZpeCA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdmFyIHN0eWxlcyA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCwgJycpLFxuICAgICAgICB0cmFuc2Zvcm0sXG4gICAgICAgIG9yaWdpbixcbiAgICAgICAgcGVyc3BlY3RpdmUsXG4gICAgICAgIHByZSA9IChBcnJheS5wcm90b3R5cGUuc2xpY2VcbiAgICAgICAgICAuY2FsbChzdHlsZXMpXG4gICAgICAgICAgLmpvaW4oJycpXG4gICAgICAgICAgLm1hdGNoKC8tKG1venx3ZWJraXR8bXMpLS8pIHx8IChzdHlsZXMuT0xpbmsgPT09ICcnICYmIFsnJywgJ28nXSlcbiAgICAgICAgKVsxXSxcbiAgICAgICAgZG9tID0gKCdXZWJLaXR8TW96fE1TfE8nKS5tYXRjaChuZXcgUmVnRXhwKCcoJyArIHByZSArICcpJywgJ2knKSlbMV07XG4gICAgICAgIGlmKGRvbSA9PT0nTW96Jyl7XG4gICAgICAgICAgdHJhbnNmb3JtID0gJ3RyYW5zZm9ybSc7XG4gICAgICAgICAgb3JpZ2luID0gJ3RyYW5zZm9ybU9yaWdpbic7XG4gICAgICAgICAgcGVyc3BlY3RpdmUgPSAncGVyc3BlY3RpdmUnO1xuICAgICAgICB9IGVsc2UgaWYoZG9tID09PSdXZWJLaXQnKXtcbiAgICAgICAgICB0cmFuc2Zvcm0gPSAnd2Via2l0VHJhbnNmb3JtJztcbiAgICAgICAgICBvcmlnaW4gPSAnd2Via2l0VHJhbnNmb3JtT3JpZ2luJztcbiAgICAgICAgICBwZXJzcGVjdGl2ZSA9ICdwZXJzcGVjdGl2ZSc7XG4gICAgICAgIH0gZWxzZSBpZihkb20gPT09J01TJyl7XG4gICAgICAgICAgdHJhbnNmb3JtID0gJ21zVHJhbnNmb3JtJztcbiAgICAgICAgICBvcmlnaW4gPSAnbXNUcmFuc2Zvcm1PcmlnaW4nO1xuICAgICAgICAgIHBlcnNwZWN0aXZlID0gJ3BlcnNwZWN0aXZlJztcbiAgICAgICAgfSBlbHNlIGlmIChkb20gPT09J08nKXtcbiAgICAgICAgICB0cmFuc2Zvcm0gPSAnT1RyYW5zZm9ybSc7XG4gICAgICAgICAgb3JpZ2luID0gJ3RyYW5zZm9ybU9yaWdpbic7XG4gICAgICAgICAgcGVyc3BlY3RpdmUgPSAncGVyc3BlY3RpdmUnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRyYW5zZm9ybSA9ICd0cmFuc2Zvcm0nO1xuICAgICAgICAgIG9yaWdpbiA9ICd0cmFuc2Zvcm1PcmlnaW4nO1xuICAgICAgICAgIHBlcnNwZWN0aXZlID0gJ3BlcnNwZWN0aXZlJztcbiAgICAgICAgfVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZG9tOiBkb20sXG4gICAgICAgIGxvd2VyY2FzZTogcHJlLFxuICAgICAgICBjc3M6ICctJyArIHByZSArICctJyxcbiAgICAgICAganM6IHByZVswXS50b1VwcGVyQ2FzZSgpICsgcHJlLnN1YnN0cigxKSxcbiAgICAgICAgdHJhbnNmb3JtOiB0cmFuc2Zvcm0sXG4gICAgICAgIG9yaWdpbjogb3JpZ2luXG4gICAgICB9O1xuXG4gICAgfTtcblxuICAgIHRoaXMudmVuZG9yID0gcHJlZml4KCk7XG5cbiAgICBpZihub2RlLmNvbnRlbnQpIHtcbiAgICAgIHRoaXMuc2V0Q29udGVudChub2RlLmNvbnRlbnQpO1xuICAgIH1cblxuICAgIGlmKG5vZGUuY2xhc3Nlcykge1xuICAgICAgZm9yKHZhciBpPTA7IGk8bm9kZS5jbGFzc2VzLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgdGhpcy5hZGRDbGFzcyhub2RlLmNsYXNzZXNbaV0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMudHJhbnNmb3JtKG5vZGUpO1xufTtcblxuRE9NQ29tcG9uZW50LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQ29tcG9uZW50LnByb3RvdHlwZSk7XG5ET01Db21wb25lbnQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQ29tcG9uZW50O1xuXG5ET01Db21wb25lbnQucHJvdG90eXBlLmNvbmZpZ3VyZSA9IGZ1bmN0aW9uKG4pe1xuXG4gIG4ub3JpZ2luID0gbi5vcmlnaW4gfHwgWzAuMCwwLjAsMC4wXTtcbiAgbi5hbGlnbiA9IG4uYWxpZ24gfHwgWzAuMCwwLjAsMC4wXTtcbiAgbi5zaXplID0gbi5zaXplIHx8IFsxLjAsMS4wLDEuMF07XG4gIG4uc2NhbGUgPSBuLnNjYWxlIHx8IFsxLjAsMS4wLDEuMF07XG4gIG4ucm90YXRlID0gbi5yb3RhdGUgfHwgWzAsMCwwXTtcbiAgbi5vcGFjaXR5ID0gbi5vcGFjaXR5IHx8IDEuMDtcblxufVxuXG5ET01Db21wb25lbnQucHJvdG90eXBlLmlzSW50ID0gZnVuY3Rpb24obil7XG5cbiAgICByZXR1cm4gTnVtYmVyKG4pID09PSBuICYmIG4gJSAxID09PSAwO1xuXG59XG5cbkRPTUNvbXBvbmVudC5wcm90b3R5cGUuaXNGbG9hdCA9IGZ1bmN0aW9uKG4pe1xuXG4gICAgaWYobiA9PT0gcGFyc2VGbG9hdCgxLjApKSByZXR1cm4gdHJ1ZTtcbiAgICByZXR1cm4gbiA9PT0gTnVtYmVyKG4pICYmIG4gJSAxICE9PSAwO1xuXG59XG5cbkRPTUNvbXBvbmVudC5wcm90b3R5cGUuc2V0Q29udGVudCA9IGZ1bmN0aW9uKGNvbnRlbnQpe1xuXG4gIHRoaXMuZWxlbS5pbm5lckhUTUwgPSBjb250ZW50O1xuXG59XG5cbkRPTUNvbXBvbmVudC5wcm90b3R5cGUuYWRkQ2xhc3MgPSBmdW5jdGlvbihjbCl7XG5cbiAgdGhpcy5lbGVtLmNsYXNzTGlzdC5hZGQoY2wpO1xuXG59XG5cbkRPTUNvbXBvbmVudC5wcm90b3R5cGUucmVtb3ZlQ2xhc3MgPSBmdW5jdGlvbihjbCl7XG5cbiAgdGhpcy5lbGVtLmNsYXNzTGlzdC5yZW1vdmUoY2wpO1xuXG59XG5cbkRPTUNvbXBvbmVudC5wcm90b3R5cGUuZGVncmVlc1RvUmFkaWFucyA9IGZ1bmN0aW9uKGRlZ3JlZXMpIHtcblxuICByZXR1cm4gZGVncmVlcyAqIChNYXRoLlBJIC8gMTgwKTtcblxufTtcblxuRE9NQ29tcG9uZW50LnByb3RvdHlwZS50cmFuc2Zvcm0gPSBmdW5jdGlvbihub2RlKXtcblxuICB2YXIgZCA9IHRoaXM7XG5cbiAgaWYobm9kZS5vcmlnaW4pIHtcblxuICAgIHRoaXMuZWxlbS5zdHlsZVt0aGlzLnZlbmRvci5vcmlnaW5dID0gKG5vZGUub3JpZ2luWzBdKjEwMCkrJyUgJysobm9kZS5vcmlnaW5bMV0qMTAwKSsnJSc7XG5cbiAgfVxuXG5cbiAgaWYobm9kZS5zaXplKSB7XG5cbiAgICBpZihub2RlLnNpemVbMF0gPT09IDEpIG5vZGUuc2l6ZVswXSA9IHBhcnNlRmxvYXQoMS4wKTtcbiAgICBpZihub2RlLnNpemVbMV0gPT09IDEpIG5vZGUuc2l6ZVsxXSA9IHBhcnNlRmxvYXQoMS4wKTtcblxuICAgIGlmKG5vZGUuc2l6ZVswXSA9PT0gbnVsbCkge1xuICAgICAgICB0aGlzLmVsZW0uc3R5bGUud2lkdGggPSBub2RlLnNpemVbMV0qMTAwKyd2aCc7XG4gICAgfSBlbHNlIGlmKG5vZGUuc2l6ZVswXSA9PT0gJ2F1dG8nKSB7XG4gICAgICAgIHRoaXMuZWxlbS5zdHlsZS53aWR0aCA9ICdhdXRvJztcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmlzRmxvYXQobm9kZS5zaXplWzBdKSA/IHRoaXMuZWxlbS5zdHlsZS53aWR0aCA9IG5vZGUuc2l6ZVswXSoxMDArJyUnIDogdGhpcy5lbGVtLnN0eWxlLndpZHRoID0gbm9kZS5zaXplWzBdKydweCc7XG4gICAgfVxuICAgIGlmKG5vZGUuc2l6ZVsxXSA9PT0gbnVsbCkge1xuICAgICAgICB0aGlzLmVsZW0uc3R5bGUuaGVpZ2h0ID0gbm9kZS5zaXplWzBdKjEwMCsndncnO1xuICAgIH0gZWxzZSBpZihub2RlLnNpemVbMV0gPT09ICdhdXRvJykge1xuICAgICAgICB0aGlzLmVsZW0uc3R5bGUuaGVpZ2h0ID0gJ2F1dG8nO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuaXNGbG9hdChub2RlLnNpemVbMV0pID8gdGhpcy5lbGVtLnN0eWxlLmhlaWdodCA9IG5vZGUuc2l6ZVsxXSoxMDArJyUnIDogdGhpcy5lbGVtLnN0eWxlLmhlaWdodCA9IG5vZGUuc2l6ZVsxXSsncHgnO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhub2RlLnNpemVbMV0qMTAwKyclJyk7XG4gICAgICAgIC8vIHRoaXMuZWxlbS5zdHlsZS5oZWlnaHQgPSBub2RlLnNpemVbMV0qMTAwKyclJztcbiAgICB9XG5cbiAgICAvL1RPRE86IGZpeCBpc0Zsb2F0IGFuZCBpc0ludCwgaXRzIG5vdCB3b3JraW5nIVxuXG4gIH1cblxuICBpZihub2RlLm9wYWNpdHkpIHtcblxuICAgIHRoaXMuZWxlbS5zdHlsZS5vcGFjaXR5ID0gbm9kZS5vcGFjaXR5O1xuXG4gIH1cblxuICBpZihub2RlLnBvc2l0aW9uKSB7XG5cbiAgICB0aGlzLmVsZW0uc3R5bGUucG9zaXRpb24gPSBub2RlLnBvc2l0aW9uO1xuXG4gIH1cblxuICBpZihub2RlLnRyYW5zZm9ybSkge1xuXG4gICAgdGhpcy5lbGVtLnN0eWxlW3RoaXMudmVuZG9yLnRyYW5zZm9ybV0gPSBub2RlLnRyYW5zZm9ybTtcblxuICB9IGVsc2Uge1xuXG4gIHZhciBtYXRyaXggPSBuZXcgTWF0cml4KCk7XG5cbiAgaWYobm9kZS50cmFuc2xhdGUgJiYgbm9kZS5hbGlnbikge1xuXG4gICAgbWF0cml4ID0gbWF0cml4LnRyYW5zbGF0ZSgobm9kZS5hbGlnblswXSAqIHRoaXMuZWxlbS5wYXJlbnROb2RlLmNsaWVudFdpZHRoKStub2RlLnRyYW5zbGF0ZVswXSwgKG5vZGUuYWxpZ25bMV0gKiB0aGlzLmVsZW0ucGFyZW50Tm9kZS5jbGllbnRIZWlnaHQpK25vZGUudHJhbnNsYXRlWzFdLCBub2RlLmFsaWduWzJdKyBub2RlLnRyYW5zbGF0ZVsyXSA9PT0gMCA/IDEgOiBub2RlLnRyYW5zbGF0ZVsyXSApO1xuXG4gIH0gZWxzZSBpZihub2RlLmFsaWduKSB7XG5cbiAgICBtYXRyaXggPSBtYXRyaXgudHJhbnNsYXRlKG5vZGUuYWxpZ25bMF0gKiB0aGlzLmVsZW0ucGFyZW50Tm9kZS5jbGllbnRXaWR0aCwgbm9kZS5hbGlnblsxXSAqIHRoaXMuZWxlbS5wYXJlbnROb2RlLmNsaWVudEhlaWdodCwgbm9kZS5hbGlnblsyXSApO1xuXG4gIH0gZWxzZSBpZihub2RlLnRyYW5zbGF0ZSkge1xuXG4gICAgbWF0cml4ID0gbWF0cml4LnRyYW5zbGF0ZShub2RlLnRyYW5zbGF0ZVswXSwgbm9kZS50cmFuc2xhdGVbMV0sIG5vZGUudHJhbnNsYXRlWzJdID09PSAwID8gMSA6IG5vZGUudHJhbnNsYXRlWzJdKTtcblxuICB9IGVsc2Uge1xuXG4gICAgbWF0cml4ID0gbWF0cml4LnRyYW5zbGF0ZSgwLCAwLCAxKTtcblxuICB9XG5cbiAgaWYobm9kZS5zY2FsZSkge1xuXG4gICAgICBtYXRyaXguc2NhbGUobm9kZS5zY2FsZVswXSB8fCAxLCBub2RlLnNjYWxlWzFdIHx8IDEsIG5vZGUuc2NhbGVbMl0gfHwgMSk7XG5cbiAgfVxuICBpZihub2RlLnJvdGF0ZSkge1xuXG4gICAgICBpZihub2RlLnJvdGF0ZVswXSkge1xuICAgICAgICBtYXRyaXggPSBtYXRyaXgucm90YXRlWChkLmRlZ3JlZXNUb1JhZGlhbnMobm9kZS5yb3RhdGVbMF0pKTtcbiAgICAgIH1cbiAgICAgIGlmKG5vZGUucm90YXRlWzFdKSB7XG4gICAgICAgIG1hdHJpeCA9IG1hdHJpeC5yb3RhdGVZKGQuZGVncmVlc1RvUmFkaWFucyhub2RlLnJvdGF0ZVsxXSkpO1xuICAgICAgfVxuICAgICAgaWYobm9kZS5yb3RhdGVbMl0pIHtcbiAgICAgICAgbWF0cml4ID0gbWF0cml4LnJvdGF0ZVooZC5kZWdyZWVzVG9SYWRpYW5zKG5vZGUucm90YXRlWzJdKSk7XG4gICAgICB9XG5cbiAgfVxuXG4gIHRoaXMuZWxlbS5zdHlsZVt0aGlzLnZlbmRvci50cmFuc2Zvcm1dID0gbWF0cml4LnRvU3RyaW5nKCk7XG5cbiAgfVxuXG59O1xuXG5ET01Db21wb25lbnQucHJvdG90eXBlLnNldFBlcnNwZWN0aXZlID0gZnVuY3Rpb24ocCl7XG5cbiAgdGhpcy5lbGVtLnN0eWxlWydwZXJzcGVjdGl2ZSddID0gcDtcblxufTtcblxuRE9NQ29tcG9uZW50LnByb3RvdHlwZS5zeW5jID0gZnVuY3Rpb24oc3luYyl7XG5cbiAgdGhpcy5zeW5jID0gc3luYztcbiAgLy9UT0RPOiBNYWtlIGEgU3luYyBDbGFzcyBhbmQgcHJvcGVybHkgc3luYyBtb3VzZXdoZWVsIGFuZCB0b3VjaCBkcmFnXG5cbn07XG5cblxuRE9NQ29tcG9uZW50LnByb3RvdHlwZS5yZXNpemUgPSBmdW5jdGlvbigpe1xuXG4gIHRoaXMudHJhbnNmb3JtKHRoaXMuX25vZGUpO1xuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IERPTUNvbXBvbmVudDtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICAgIENvbXBvbmVudDogcmVxdWlyZSgnLi9Db21wb25lbnQnKSxcbiAgICBET01Db21wb25lbnQ6IHJlcXVpcmUoJy4vRE9NQ29tcG9uZW50Jylcbn07XG4iLCIvKipcbiogRW5naW5lXG4qXG4qIEEgc2ltcGxlIFJlbmRlcmluZyBFbmdpbmUgdGhhdCB1c2VzIHJlcXVlc3RBbmltYXRpb25GcmFtZSB0byB1cGRhdGUuXG4qXG4qIGJ5IFN0ZXZlIEJlbG92YXJpY2hcbiogTGljZW5zZWQgdW5kZXIgTUlULCBzZWUgbGljZW5zZS50eHQgb3IgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcbioqL1xuXG52YXIgRW5naW5lID0gZnVuY3Rpb24oKXtcblxuICAgIHRoaXMudGltZSA9IDA7XG4gICAgdGhpcy5fd29ya2VyID0gbnVsbDtcbiAgICB0aGlzLnVwZGF0ZVF1ZXVlID0gW107XG5cbn1cblxuRW5naW5lLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24od29ya2VyKXtcbiAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMudGljay5iaW5kKHRoaXMpKTtcbiAgICBpZih3b3JrZXIpe1xuICAgICAgICB0aGlzLl93b3JrZXIgPSB3b3JrZXI7XG4gICAgfVxuICAgIGlmKHdvcmtlci5jb25zdHJ1Y3Rvci5uYW1lID09PSAnV29ya2VyJyl7XG4gICAgICAgIHRoaXMuX3dvcmtlci5wb3N0TWVzc2FnZSh7aW5pdDonZG9uZSd9KTtcbiAgICB9XG59XG5cbkVuZ2luZS5wcm90b3R5cGUudGljayA9IGZ1bmN0aW9uKHRpbWUpe1xuXG4gICAgdmFyIGl0ZW07XG4gICAgdGhpcy50aW1lID0gcGVyZm9ybWFuY2Uubm93KCk7XG5cbiAgICBpZih0aGlzLl93b3JrZXIuY29uc3RydWN0b3IubmFtZSA9PT0gJ1dvcmtlcicpe1xuICAgICAgdGhpcy5fd29ya2VyLnBvc3RNZXNzYWdlKHtmcmFtZTp0aGlzLnRpbWV9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fd29ya2VyLnRpY2sodGltZSk7XG4gICAgfVxuXG4gICAgd2hpbGUgKHRoaXMudXBkYXRlUXVldWUubGVuZ3RoKSB7XG4gICAgICBpdGVtID0gdGhpcy51cGRhdGVRdWV1ZS5zaGlmdCgpO1xuICAgICAgaWYgKGl0ZW0gJiYgaXRlbS51cGRhdGUpIGl0ZW0udXBkYXRlKHRoaXMudGltZSk7XG4gICAgICBpZiAoaXRlbSAmJiBpdGVtLm9uVXBkYXRlKSBpdGVtLm9uVXBkYXRlKHRoaXMudGltZSk7XG4gICAgfVxuXG4gICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLnRpY2suYmluZCh0aGlzKSk7XG5cbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBFbmdpbmUoKTtcbiIsIi8qKlxuKiBOb2RlXG4qXG4qIEEgbW9kZWwgdGhhdCBkZXRlcm1pbmVzIHByb3BlcnRpZXMgdGhhdCBjYW4gYmUgYW5pbWF0ZWQgb3IgY2hhbmdlZCBwZXJmb3JtYW50bHkuXG4qIFRoaXMgbW9kZWwgY2FuIGJlIGFwcGxpZWQgdG8gQ29tcG9uZW50cyB0aGF0IHVzZSBpdCB0byBhbmltYXRlIERPTUVsZW1lbnQgb3IgTWVzaC5cbipcbiogYnkgU3RldmUgQmVsb3ZhcmljaFxuKiBMaWNlbnNlZCB1bmRlciBNSVQsIHNlZSBsaWNlbnNlLnR4dCBvciBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuKiovXG5cbnZhciBUcmFuc2l0aW9uYWJsZSA9IHJlcXVpcmUoJy4uL3RyYW5zaXRpb25zL1RyYW5zaXRpb25hYmxlJyk7XG52YXIgQ3VydmVzID0gcmVxdWlyZSgnLi4vdHJhbnNpdGlvbnMvQ3VydmVzJyk7XG5cbnZhciBfb2JzZXJ2YWJsZUNhbGxiYWNrID0ge307XG5cbnZhciBOb2RlID0gZnVuY3Rpb24oY29uZiwgcGFyZW50KXtcblxuICAgIHRoaXMudHJhbnNpdGlvbmFibGVzID0ge307XG5cbiAgICBpZihjb25mKXtcbiAgICAgICAgdGhpcy5zZXJpYWxpemUoY29uZik7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zZXREZWZhdWx0cygpO1xuICAgIH1cbiAgICBwYXJlbnQgPyB0aGlzLnBhcmVudCA9IHBhcmVudCA6IHRoaXMucGFyZW50ID0gbnVsbDtcblxufTtcblxuTm9kZS5wcm90b3R5cGUuc2V0RGVmYXVsdHMgPSBmdW5jdGlvbihjb25mKXtcbiAgICB0aGlzLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICB0aGlzLnRyYW5zbGF0ZSA9IG51bGw7XG4gICAgdGhpcy5vcmlnaW4gPSBbMC4wLDAuMCwwLjBdO1xuICAgIHRoaXMuYWxpZ24gPSBudWxsO1xuICAgIHRoaXMuc2l6ZSA9IFswLDAsMF07XG4gICAgdGhpcy5zY2FsZSA9IFsxLjAsMS4wLDEuMF07XG4gICAgdGhpcy5yb3RhdGUgPSBbMCwwLDBdO1xuICAgIHRoaXMub3BhY2l0eSA9IDEuMDtcbiAgICB0aGlzLnRyYW5zZm9ybSA9IG51bGw7XG59O1xuXG5Ob2RlLnByb3RvdHlwZS5zZXJpYWxpemUgPSBmdW5jdGlvbihjb25mKXtcbiAgICB0aGlzLmlkID0gY29uZi5pZCA/IGNvbmYuaWQgOiBudWxsO1xuICAgIHRoaXMucG9zaXRpb24gPSBjb25mLnBvc2l0aW9uID8gY29uZi5wb3NpdGlvbiA6ICdhYnNvbHV0ZSc7XG4gICAgdGhpcy50cmFuc2xhdGUgPSBjb25mLnRyYW5zbGF0ZSA/IGNvbmYudHJhbnNsYXRlIDogbnVsbDtcbiAgICB0aGlzLm9yaWdpbiA9IGNvbmYub3JpZ2luID8gY29uZi5vcmlnaW4gOiBbMC4wLDAuMCwwLjBdO1xuICAgIHRoaXMuYWxpZ24gPSBjb25mLmFsaWduID8gY29uZi5hbGlnbiA6IG51bGw7XG4gICAgdGhpcy5zaXplID0gY29uZi5zaXplID8gY29uZi5zaXplIDogWzAsMCwwXTtcbiAgICB0aGlzLnNjYWxlID0gY29uZi5zY2FsZSA/IGNvbmYuc2NhbGUgOiBbMS4wLDEuMCwxLjBdO1xuICAgIHRoaXMucm90YXRlID0gY29uZi5yb3RhdGUgPyBjb25mLnJvdGF0ZSA6IFswLDAsMF07XG4gICAgdGhpcy5vcGFjaXR5ID0gY29uZi5vcGFjaXR5ID8gY29uZi5vcGFjaXR5IDogMS4wO1xuICAgIHRoaXMudHJhbnNmb3JtID0gY29uZi50cmFuc2Zvcm0gPyBjb25mLnRyYW5zZm9ybSA6IG51bGw7XG4gICAgdGhpcy5vYnNlcnZlKHRoaXMuaWQsIHRoaXMpO1xuICAgIGNvbmYudHJhbnNpdGlvbiA/IHRoaXMuc2V0VHJhbnNpdGlvbmFibGUoY29uZi50cmFuc2l0aW9uKSA6IGZhbHNlO1xufTtcblxuTm9kZS5wcm90b3R5cGUuZ2V0UHJvcGVydGllcyA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcG9zaXRpb246IHRoaXMucG9zaXRpb24sXG4gICAgICAgIHRyYW5zbGF0ZTogdGhpcy50cmFuc2xhdGUsXG4gICAgICAgIG9yaWdpbjogdGhpcy5vcmlnaW4sXG4gICAgICAgIGFsaWduOiB0aGlzLmFsaWduLFxuICAgICAgICBzaXplOiB0aGlzLnNpemUsXG4gICAgICAgIHNjYWxlOiB0aGlzLnNjYWxlLFxuICAgICAgICByb3RhdGU6IHRoaXMucm90YXRlLFxuICAgICAgICBvcGFjaXR5OiB0aGlzLm9wYWNpdHksXG4gICAgICAgIHRyYW5zaXRpb25hYmxlczogdGhpcy50cmFuc2l0aW9uYWJsZXMvLyxcbiAgICAgICAgLy9vYnNlcnZhYmxlczogdGhpcy5vYnNlcnZhYmxlc1xuICAgIH1cbn07XG5cbk5vZGUucHJvdG90eXBlLnNldFBvc2l0aW9uID0gZnVuY3Rpb24ocG9zKXtcbiAgICB0aGlzLnBvc2l0aW9uID0gcG9zO1xufTtcblxuTm9kZS5wcm90b3R5cGUuZ2V0UG9zaXRpb24gPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLnBvc2l0aW9uO1xufTtcblxuTm9kZS5wcm90b3R5cGUuc2V0VHJhbnNsYXRpb24gPSBmdW5jdGlvbihwb3Mpe1xuICAgIHRoaXMudHJhbnNsYXRlID0gcG9zO1xufTtcblxuTm9kZS5wcm90b3R5cGUuZ2V0VHJhbnNsYXRpb24gPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLnRyYW5zbGF0ZTtcbn07XG5cbk5vZGUucHJvdG90eXBlLnNldFNpemUgPSBmdW5jdGlvbihzaXplKXtcbiAgICB0aGlzLnNpemUgPSBzaXplO1xufTtcblxuTm9kZS5wcm90b3R5cGUuZ2V0U2l6ZSA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMuc2l6ZTtcbn07XG5cbk5vZGUucHJvdG90eXBlLnNldFNjYWxlID0gZnVuY3Rpb24oc2NhbGUpe1xuICAgIHRoaXMuc2NhbGUgPSBzY2FsZTtcbn07XG5cbk5vZGUucHJvdG90eXBlLmdldFNjYWxlID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5zY2FsZTtcbn07XG5cbk5vZGUucHJvdG90eXBlLnNldE9yaWdpbiA9IGZ1bmN0aW9uKG9yaWdpbil7XG4gICAgdGhpcy5vcmlnaW4gPSBvcmlnaW47XG59O1xuXG5Ob2RlLnByb3RvdHlwZS5nZXRPcmlnaW4gPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLm9yaWdpbjtcbn07XG5cbk5vZGUucHJvdG90eXBlLnNldEFsaWduID0gZnVuY3Rpb24oYWxpZ24pe1xuICAgIHRoaXMuYWxpZ24gPSBhbGlnbjtcbn07XG5cbk5vZGUucHJvdG90eXBlLmdldEFsaWduID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5hbGlnbjtcbn07XG5cbk5vZGUucHJvdG90eXBlLnNldFJvdGF0aW9uID0gZnVuY3Rpb24ocm90YXRpb24pe1xuICAgIHRoaXMucm90YXRpb24gPSByb3RhdGlvbjtcbn07XG5cbk5vZGUucHJvdG90eXBlLmdldFJvdGF0aW9uID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5yb3RhdGlvbjtcbn07XG5cbk5vZGUucHJvdG90eXBlLnNldE9wYWNpdHkgPSBmdW5jdGlvbihvcGFjaXR5KXtcbiAgICB0aGlzLm9wYWNpdHkgPSBvcGFjaXR5O1xufTtcblxuTm9kZS5wcm90b3R5cGUuZ2V0T3BhY2l0eSA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMub3BhY2l0eTtcbn07XG5cbk5vZGUucHJvdG90eXBlLnRyYW5zaXRpb24gPSBmdW5jdGlvbihjb25mKSB7XG4gIHRoaXMuc2V0VHJhbnNpdGlvbmFibGUoY29uZik7XG59O1xuXG5Ob2RlLnByb3RvdHlwZS5zZXRUcmFuc2l0aW9uYWJsZSA9IGZ1bmN0aW9uKGNvbmYpe1xuICAgIHZhciBuICA9IHRoaXM7XG5cbiAgICBuLnRyYW5zaXRpb25hYmxlc1tjb25mLmtleV0gPSBjb25mO1xuICAgIG4udHJhbnNpdGlvbmFibGVzW2NvbmYua2V5XS50cmFuc2l0aW9uID0gbmV3IFRyYW5zaXRpb25hYmxlKGNvbmYuZnJvbSk7XG4gICAgbi50cmFuc2l0aW9uYWJsZXNbY29uZi5rZXldLnRyYW5zaXRpb24uc2V0KGNvbmYudG8pO1xuICAgIC8vbi50cmFuc2l0aW9uYWJsZXNbY29uZi5rZXldLnRyYW5zaXRpb24uc2V0KGNvbmYudG8pO1xuICAgIGlmKGNvbmYuZGVsYXkpIHtcbiAgICAgIG4udHJhbnNpdChjb25mKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbi50cmFuc2l0aW9uYWJsZXNbY29uZi5rZXldXG4gICAgICAgLnRyYW5zaXRpb25cbiAgICAgICAuZnJvbShjb25mLmZyb20pXG4gICAgICAgLnRvKGNvbmYudG8sIGNvbmYuY3VydmUsIGNvbmYuZHVyYXRpb24pO1xuICAgIH1cblxuICAgIHRoaXNbY29uZi5rZXldID0gY29uZi50bztcblxuICAgIG4udHJhbnNpdGlvbmFibGVzW2NvbmYua2V5XS50cmFuc2l0aW9uLmlkID0gdGhpcy5pZDtcbiAgICBuLnRyYW5zaXRpb25hYmxlc1tjb25mLmtleV0udHJhbnNpdGlvbi5wYXJhbSA9IGNvbmYua2V5O1xuICAgIHRoaXMub2JzZXJ2ZShjb25mLmtleSwgbi50cmFuc2l0aW9uYWJsZXNbY29uZi5rZXldLnRyYW5zaXRpb24uZ2V0KCksIGNvbmYpO1xuXG4gICAgLy9UT0RPOiBmaWd1cmUgb3V0IGEgYmV0dGVyIHdheSB0byB1cGRhdGUgVHJhbnNpdGlvbmFibGVcbiAgICAvL1RPRE86IHVub2JzZXJ2ZSBvYmplY3QsIGNsZWFySW5lcnZhbFxuXG5cbn07XG5cbk5vZGUucHJvdG90eXBlLnRyYW5zaXQgPSBmdW5jdGlvbihjb25mKXtcbiAgICB2YXIgbiAgPSB0aGlzO1xuICAgIGlmKGNvbmYuZGVsYXkpIHtcblxuICAgICAgbi50cmFuc2l0aW9uYWJsZXNbY29uZi5rZXldLnRyYW5zaXRpb24uZnJvbShjb25mLmZyb20pLmRlbGF5KGNvbmYuZGVsYXkpLnRvKGNvbmYudG8sIGNvbmYuY3VydmUsIGNvbmYuZHVyYXRpb24pO1xuICAgIH1cbn07XG5cbk5vZGUucHJvdG90eXBlLm9ic2VydmUgPSBmdW5jdGlvbihpZCwgb2JqLCBjb25mKSB7XG4gICAgICB2YXIgbiA9IHRoaXM7XG5cbiAgICAgIF9vYnNlcnZhYmxlQ2FsbGJhY2tbaWRdID0gZnVuY3Rpb24oY2hhbmdlcyl7XG4gICAgICAgICAgY2hhbmdlcy5mb3JFYWNoKGZ1bmN0aW9uKGNoYW5nZSkge1xuICAgICAgICAgICAgaWYoY2hhbmdlLnR5cGUgPT09ICd1cGRhdGUnICYmIGNoYW5nZS5uYW1lICE9PSAnaWQnKSB7XG5cbiAgICAgICAgICAgICAgaWYoY2hhbmdlLm9iamVjdC5jb25zdHJ1Y3Rvci5uYW1lID09PSAnQXJyYXknKXtcblxuICAgICAgICAgICAgICAgIG4ucGFyZW50LnVwZGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOntcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcDogaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbDogY2hhbmdlLm9iamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGU6IG4uaWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBlbHNlIGlmKGNoYW5nZS5vYmplY3QuY29uc3RydWN0b3IubmFtZSA9PT0gJ1RyYW5zaXRpb25hYmxlJyl7XG4gICAgICAgICAgICAgICAgbltjaGFuZ2Uub2JqZWN0LnBhcmFtXSA9IGNoYW5nZS5vbGRWYWx1ZTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBuLnBhcmVudC51cGRhdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTp7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3A6IGNoYW5nZS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWw6IGNoYW5nZS5vbGRWYWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGU6IG4uaWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICB9O1xuXG4gICAgICBPYmplY3Qub2JzZXJ2ZShvYmosIF9vYnNlcnZhYmxlQ2FsbGJhY2tbaWRdKTtcblxufTtcblxuTm9kZS5wcm90b3R5cGUudW5vYnNlcnZlID0gZnVuY3Rpb24ocGFyYW0pIHtcbiAgICBPYmplY3QudW5vYnNlcnZlKHRoaXMsIF9vYnNlcnZhYmxlQ2FsbGJhY2tbdGhpcy5pZF0pO1xufTtcblxuXG5Ob2RlLnByb3RvdHlwZS5ldmVudE1hbmFnZXIgPSBmdW5jdGlvbigpe1xuXG4gIHZhciBldmVudHMgPSB7fTtcbiAgdmFyIGhhc0V2ZW50ID0gZXZlbnRzLmhhc093blByb3BlcnR5O1xuXG4gIHJldHVybiB7XG4gICAgc3ViOiBmdW5jdGlvbihldiwgbGlzdGVuZXIpIHtcblxuICAgICAgdGhpcy5vYnNlcnZlKGV2LCB0aGlzKTtcbiAgICAgIC8vIENyZWF0ZSB0aGUgZXZlbnQncyBvYmplY3QgaWYgbm90IHlldCBjcmVhdGVkXG4gICAgICBpZighaGFzRXZlbnQuY2FsbChldmVudHMsIGV2KSkgZXZlbnRzW2V2XSA9IFtdO1xuXG4gICAgICAvLyBBZGQgdGhlIGxpc3RlbmVyIHRvIHF1ZXVlXG4gICAgICB2YXIgaW5kZXggPSBldmVudHNbZXZdLnB1c2gobGlzdGVuZXIpIC0gMTtcblxuICAgICAgLy8gUHJvdmlkZSBoYW5kbGUgYmFjayBmb3IgcmVtb3ZhbCBvZiB0b3BpY1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICB0aGlzLnVub2JzZXJ2ZShldik7XG4gICAgICAgICAgZGVsZXRlIGV2ZW50c1tldl1baW5kZXhdO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0sXG4gICAgcHViOiBmdW5jdGlvbihldiwgaW5mbykge1xuICAgICAgLy8gSWYgdGhlIGV2ZW50IGRvZXNuJ3QgZXhpc3QsIG9yIHRoZXJlJ3Mgbm8gbGlzdGVuZXJzIGluIHF1ZXVlLCBqdXN0IGxlYXZlXG4gICAgICBpZighaGFzRXZlbnQuY2FsbChldmVudHMsIGV2KSkgcmV0dXJuO1xuXG4gICAgICAvLyBDeWNsZSB0aHJvdWdoIGV2ZW50cyBxdWV1ZSwgZmlyZSFcbiAgICAgIGV2ZW50c1tldl0uZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XG4gICAgICBcdFx0aXRlbShpbmZvICE9IHVuZGVmaW5lZCA/IGluZm8gOiB7fSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59O1xuXG5Ob2RlLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihmcmFtZSl7XG4gIGZvcih2YXIgaWQgaW4gdGhpcy50cmFuc2l0aW9uYWJsZXMpIHtcbiAgICB0aGlzLnRyYW5zaXRpb25hYmxlc1tpZF0udHJhbnNpdGlvbi5nZXQoKTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBOb2RlO1xuIiwiLyoqXG4qIFNjZW5lXG4qXG4qIEFQSSBmb3Igc3RvcmluZyBOb2RlcyBvbiBhIFNjZW5lIEdyYXBoLiBDdXJyZW50bHkgdGhlIFNjZW5lIGlzIGZsYXQsIGJ1dCB0aGF0IGNvdWxkIHZlcnkgd2VsbCBjaGFuZ2UgaW4gdGhlIG5lYXIgZnV0dXJlIHRvIGtlZXAgdHJhY2sgb2YgcGFyZW50IGNoaWxkIHJlbGF0aW9uc2hpcHMgYmV0d2VlbiBOb2Rlcy5cbipcbiogYnkgU3RldmUgQmVsb3ZhcmljaFxuKiBMaWNlbnNlZCB1bmRlciBNSVQsIHNlZSBsaWNlbnNlLnR4dCBvciBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuKiovXG5cbnZhciBjeHQgPSBzZWxmO1xuXG52YXIgU2NlbmUgPSBmdW5jdGlvbihncmFwaCl7XG5cbiAgICB0aGlzLmdyYXBoID0gZ3JhcGggfHwge307XG4gICAgdGhpcy5sZW5ndGggPSAwO1xuXG59XG5cblNjZW5lLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24od29ya2VyKSB7XG4gICAgaWYod29ya2VyKXtcbiAgICAgICAgdGhpcy53b3JrZXIgPSB3b3JrZXI7XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKHRoaXMud29ya2VyKTtcbn1cblxuU2NlbmUucHJvdG90eXBlLmFkZENoaWxkID0gZnVuY3Rpb24obm9kZSl7XG4gICAgbm9kZS5pZCA9IG5vZGUuaWQgfHwgJ25vZGUtJyt0aGlzLmxlbmd0aDtcbiAgICB0aGlzLmxlbmd0aCsrO1xuICAgIHRoaXMuZ3JhcGhbbm9kZS5pZF0gPSBub2RlO1xufVxuXG5cblNjZW5lLnByb3RvdHlwZS5mZXRjaE5vZGUgPSBmdW5jdGlvbihpZCkge1xuICAgIHJldHVybiB0aGlzLmdyYXBoW2lkXTtcbn1cblxuU2NlbmUucHJvdG90eXBlLmZpbmQgPSBmdW5jdGlvbihxdWVyeSkge1xuICAgIHZhciBxdWVyeUFycmF5ID0gW107XG4gICAgZm9yKHEgaW4gcXVlcnkpe1xuICAgICAgICBmb3IocHJvcCBpbiB0aGlzLmdyYXBoKSB7XG4gICAgICAgICAgICBmb3IocCBpbiB0aGlzLmdyYXBoW3Byb3BdKXtcbiAgICAgICAgICAgICAgICBpZiAocCA9PT0gcSAmJiB0aGlzLmdyYXBoW3Byb3BdW3BdID09PSBxdWVyeVtxXSkge1xuICAgICAgICAgICAgICAgICAgICBxdWVyeUFycmF5LnB1c2godGhpcy5ncmFwaFtwcm9wXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBxdWVyeUFycmF5O1xufVxuXG5TY2VuZS5wcm90b3R5cGUuZmluZE9uZSA9IGZ1bmN0aW9uKHF1ZXJ5KSB7XG5cbiAgICBmb3IocSBpbiBxdWVyeSl7XG4gICAgICAgIGZvcihwcm9wIGluIHRoaXMuZ3JhcGgpIHtcbiAgICAgICAgICAgIGZvcihwIGluIHRoaXMuZ3JhcGhbcHJvcF0pe1xuICAgICAgICAgICAgICAgIGlmIChwID09PSBxICYmIHRoaXMuZ3JhcGhbcHJvcF1bcF0gPT09IHF1ZXJ5W3FdKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdyYXBoW3Byb3BdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxufVxuXG5TY2VuZS5wcm90b3R5cGUudGljayA9IGZ1bmN0aW9uKGZyYW1lKXtcbiAgZm9yKHZhciBub2RlIGluIHRoaXMuZ3JhcGgpIHtcbiAgICB0aGlzLmdyYXBoW25vZGVdLnVwZGF0ZShmcmFtZSk7XG4gIH1cbn1cblxuU2NlbmUucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGNoYW5nZSl7XG4gIC8vIGlmKGN4dC5jb25zdHJ1Y3Rvci5uYW1lID09PSAnRGVkaWNhdGVkV29ya2VyR2xvYmFsU2NvcGUnKSB7XG4gIC8vICAgY3h0LnBvc3RNZXNzYWdlKEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoY2hhbmdlKSkpO1xuICAvLyB9IGVsc2Uge1xuICAgIHRoaXMub25tZXNzYWdlKEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoY2hhbmdlKSkpO1xuICAvLyB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IFNjZW5lKCk7XG4iLCIvKlxuICBUZXN0ZWQgYWdhaW5zdCBDaHJvbWl1bSBidWlsZCB3aXRoIE9iamVjdC5vYnNlcnZlIGFuZCBhY3RzIEVYQUNUTFkgdGhlIHNhbWUsXG4gIHRob3VnaCBDaHJvbWl1bSBidWlsZCBpcyBNVUNIIGZhc3RlclxuXG4gIFRyeWluZyB0byBzdGF5IGFzIGNsb3NlIHRvIHRoZSBzcGVjIGFzIHBvc3NpYmxlLFxuICB0aGlzIGlzIGEgd29yayBpbiBwcm9ncmVzcywgZmVlbCBmcmVlIHRvIGNvbW1lbnQvdXBkYXRlXG5cbiAgU3BlY2lmaWNhdGlvbjpcbiAgICBodHRwOi8vd2lraS5lY21hc2NyaXB0Lm9yZy9kb2t1LnBocD9pZD1oYXJtb255Om9ic2VydmVcblxuICBCdWlsdCB1c2luZyBwYXJ0cyBvZjpcbiAgICBodHRwczovL2dpdGh1Yi5jb20vdHZjdXRzZW0vaGFybW9ueS1yZWZsZWN0L2Jsb2IvbWFzdGVyL2V4YW1wbGVzL29ic2VydmVyLmpzXG5cbiAgTGltaXRzIHNvIGZhcjtcbiAgICBCdWlsdCB1c2luZyBwb2xsaW5nLi4uIFdpbGwgdXBkYXRlIGFnYWluIHdpdGggcG9sbGluZy9nZXR0ZXImc2V0dGVycyB0byBtYWtlIHRoaW5ncyBiZXR0ZXIgYXQgc29tZSBwb2ludFxuXG5UT0RPOlxuICBBZGQgc3VwcG9ydCBmb3IgT2JqZWN0LnByb3RvdHlwZS53YXRjaCAtPiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9PYmplY3Qvd2F0Y2hcbiovXG5pZighT2JqZWN0Lm9ic2VydmUpe1xuICAoZnVuY3Rpb24oZXh0ZW5kLCBnbG9iYWwpe1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIHZhciBpc0NhbGxhYmxlID0gKGZ1bmN0aW9uKHRvU3RyaW5nKXtcbiAgICAgICAgdmFyIHMgPSB0b1N0cmluZy5jYWxsKHRvU3RyaW5nKSxcbiAgICAgICAgICAgIHUgPSB0eXBlb2YgdTtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiBnbG9iYWwuYWxlcnQgPT09IFwib2JqZWN0XCIgP1xuICAgICAgICAgIGZ1bmN0aW9uIGlzQ2FsbGFibGUoZil7XG4gICAgICAgICAgICByZXR1cm4gcyA9PT0gdG9TdHJpbmcuY2FsbChmKSB8fCAoISFmICYmIHR5cGVvZiBmLnRvU3RyaW5nID09IHUgJiYgdHlwZW9mIGYudmFsdWVPZiA9PSB1ICYmIC9eXFxzKlxcYmZ1bmN0aW9uXFxiLy50ZXN0KFwiXCIgKyBmKSk7XG4gICAgICAgICAgfTpcbiAgICAgICAgICBmdW5jdGlvbiBpc0NhbGxhYmxlKGYpe1xuICAgICAgICAgICAgcmV0dXJuIHMgPT09IHRvU3RyaW5nLmNhbGwoZik7XG4gICAgICAgICAgfVxuICAgICAgICA7XG4gICAgfSkoZXh0ZW5kLnByb3RvdHlwZS50b1N0cmluZyk7XG4gICAgLy8gaXNOb2RlICYgaXNFbGVtZW50IGZyb20gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8zODQyODYvamF2YXNjcmlwdC1pc2RvbS1ob3ctZG8teW91LWNoZWNrLWlmLWEtamF2YXNjcmlwdC1vYmplY3QtaXMtYS1kb20tb2JqZWN0XG4gICAgLy9SZXR1cm5zIHRydWUgaWYgaXQgaXMgYSBET00gbm9kZVxuICAgIHZhciBpc05vZGUgPSBmdW5jdGlvbiBpc05vZGUobyl7XG4gICAgICByZXR1cm4gKFxuICAgICAgICB0eXBlb2YgTm9kZSA9PT0gXCJvYmplY3RcIiA/IG8gaW5zdGFuY2VvZiBOb2RlIDpcbiAgICAgICAgbyAmJiB0eXBlb2YgbyA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2Ygby5ub2RlVHlwZSA9PT0gXCJudW1iZXJcIiAmJiB0eXBlb2Ygby5ub2RlTmFtZT09PVwic3RyaW5nXCJcbiAgICAgICk7XG4gICAgfVxuICAgIC8vUmV0dXJucyB0cnVlIGlmIGl0IGlzIGEgRE9NIGVsZW1lbnRcbiAgICB2YXIgaXNFbGVtZW50ID0gZnVuY3Rpb24gaXNFbGVtZW50KG8pe1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgdHlwZW9mIEhUTUxFbGVtZW50ID09PSBcIm9iamVjdFwiID8gbyBpbnN0YW5jZW9mIEhUTUxFbGVtZW50IDogLy9ET00yXG4gICAgICAgIG8gJiYgdHlwZW9mIG8gPT09IFwib2JqZWN0XCIgJiYgbyAhPT0gbnVsbCAmJiBvLm5vZGVUeXBlID09PSAxICYmIHR5cGVvZiBvLm5vZGVOYW1lPT09XCJzdHJpbmdcIlxuICAgICk7XG4gICAgfVxuICAgIHZhciBfaXNJbW1lZGlhdGVTdXBwb3J0ZWQgPSAoZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiAhIWdsb2JhbC5zZXRJbW1lZGlhdGU7XG4gICAgfSkoKTtcbiAgICB2YXIgX2RvQ2hlY2tDYWxsYmFjayA9IChmdW5jdGlvbigpe1xuICAgICAgaWYoX2lzSW1tZWRpYXRlU3VwcG9ydGVkKXtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIF9kb0NoZWNrQ2FsbGJhY2soZil7XG4gICAgICAgICAgcmV0dXJuIHNldEltbWVkaWF0ZShmKTtcbiAgICAgICAgfTtcbiAgICAgIH1lbHNle1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gX2RvQ2hlY2tDYWxsYmFjayhmKXtcbiAgICAgICAgICByZXR1cm4gc2V0VGltZW91dChmLCAxMCk7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfSkoKTtcbiAgICB2YXIgX2NsZWFyQ2hlY2tDYWxsYmFjayA9IChmdW5jdGlvbigpe1xuICAgICAgaWYoX2lzSW1tZWRpYXRlU3VwcG9ydGVkKXtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIF9jbGVhckNoZWNrQ2FsbGJhY2soaWQpe1xuICAgICAgICAgIGNsZWFySW1tZWRpYXRlKGlkKTtcbiAgICAgICAgfTtcbiAgICAgIH1lbHNle1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gX2NsZWFyQ2hlY2tDYWxsYmFjayhpZCl7XG4gICAgICAgICAgY2xlYXJUaW1lb3V0KGlkKTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9KSgpO1xuICAgIHZhciBpc051bWVyaWM9ZnVuY3Rpb24gaXNOdW1lcmljKG4pe1xuICAgICAgcmV0dXJuICFpc05hTihwYXJzZUZsb2F0KG4pKSAmJiBpc0Zpbml0ZShuKTtcbiAgICB9O1xuICAgIHZhciBzYW1lVmFsdWUgPSBmdW5jdGlvbiBzYW1lVmFsdWUoeCwgeSl7XG4gICAgICBpZih4PT09eSl7XG4gICAgICAgIHJldHVybiB4ICE9PSAwIHx8IDEgLyB4ID09PSAxIC8geTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB4ICE9PSB4ICYmIHkgIT09IHk7XG4gICAgfTtcbiAgICB2YXIgaXNBY2Nlc3NvckRlc2NyaXB0b3IgPSBmdW5jdGlvbiBpc0FjY2Vzc29yRGVzY3JpcHRvcihkZXNjKXtcbiAgICAgIGlmICh0eXBlb2YoZGVzYykgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuICgnZ2V0JyBpbiBkZXNjIHx8ICdzZXQnIGluIGRlc2MpO1xuICAgIH07XG4gICAgdmFyIGlzRGF0YURlc2NyaXB0b3IgPSBmdW5jdGlvbiBpc0RhdGFEZXNjcmlwdG9yKGRlc2Mpe1xuICAgICAgaWYgKHR5cGVvZihkZXNjKSA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gKCd2YWx1ZScgaW4gZGVzYyB8fCAnd3JpdGFibGUnIGluIGRlc2MpO1xuICAgIH07XG5cbiAgICB2YXIgdmFsaWRhdGVBcmd1bWVudHMgPSBmdW5jdGlvbiB2YWxpZGF0ZUFyZ3VtZW50cyhPLCBjYWxsYmFjaywgYWNjZXB0KXtcbiAgICAgIGlmKHR5cGVvZihPKSE9PSdvYmplY3QnKXtcbiAgICAgICAgLy8gVGhyb3cgRXJyb3JcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIk9iamVjdC5vYnNlcnZlT2JqZWN0IGNhbGxlZCBvbiBub24tb2JqZWN0XCIpO1xuICAgICAgfVxuICAgICAgaWYoaXNDYWxsYWJsZShjYWxsYmFjayk9PT1mYWxzZSl7XG4gICAgICAgIC8vIFRocm93IEVycm9yXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJPYmplY3Qub2JzZXJ2ZU9iamVjdDogRXhwZWN0aW5nIGZ1bmN0aW9uXCIpO1xuICAgICAgfVxuICAgICAgaWYoT2JqZWN0LmlzRnJvemVuKGNhbGxiYWNrKT09PXRydWUpe1xuICAgICAgICAvLyBUaHJvdyBFcnJvclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiT2JqZWN0Lm9ic2VydmVPYmplY3Q6IEV4cGVjdGluZyB1bmZyb3plbiBmdW5jdGlvblwiKTtcbiAgICAgIH1cbiAgICAgIGlmIChhY2NlcHQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkoYWNjZXB0KSkge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJPYmplY3Qub2JzZXJ2ZU9iamVjdDogRXhwZWN0aW5nIGFjY2VwdExpc3QgaW4gdGhlIGZvcm0gb2YgYW4gYXJyYXlcIik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIE9ic2VydmVyID0gKGZ1bmN0aW9uIE9ic2VydmVyKCl7XG4gICAgICB2YXIgd3JhcGVkID0gW107XG4gICAgICB2YXIgT2JzZXJ2ZXIgPSBmdW5jdGlvbiBPYnNlcnZlcihPLCBjYWxsYmFjaywgYWNjZXB0KXtcbiAgICAgICAgdmFsaWRhdGVBcmd1bWVudHMoTywgY2FsbGJhY2ssIGFjY2VwdCk7XG4gICAgICAgIGlmICghYWNjZXB0KSB7XG4gICAgICAgICAgYWNjZXB0ID0gW1wiYWRkXCIsIFwidXBkYXRlXCIsIFwiZGVsZXRlXCIsIFwicmVjb25maWd1cmVcIiwgXCJzZXRQcm90b3R5cGVcIiwgXCJwcmV2ZW50RXh0ZW5zaW9uc1wiXTtcbiAgICAgICAgfVxuICAgICAgICBPYmplY3QuZ2V0Tm90aWZpZXIoTykuYWRkTGlzdGVuZXIoY2FsbGJhY2ssIGFjY2VwdCk7XG4gICAgICAgIGlmKHdyYXBlZC5pbmRleE9mKE8pPT09LTEpe1xuICAgICAgICAgIHdyYXBlZC5wdXNoKE8pO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBPYmplY3QuZ2V0Tm90aWZpZXIoTykuX2NoZWNrUHJvcGVydHlMaXN0aW5nKCk7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIE9ic2VydmVyLnByb3RvdHlwZS5kZWxpdmVyQ2hhbmdlUmVjb3JkcyA9IGZ1bmN0aW9uIE9ic2VydmVyX2RlbGl2ZXJDaGFuZ2VSZWNvcmRzKE8pe1xuICAgICAgICBPYmplY3QuZ2V0Tm90aWZpZXIoTykuZGVsaXZlckNoYW5nZVJlY29yZHMoKTtcbiAgICAgIH07XG5cbiAgICAgIHdyYXBlZC5sYXN0U2Nhbm5lZCA9IDA7XG4gICAgICB2YXIgZiA9IChmdW5jdGlvbiBmKHdyYXBwZWQpe1xuICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gX2YoKXtcbiAgICAgICAgICAgICAgICB2YXIgaSA9IDAsIGwgPSB3cmFwcGVkLmxlbmd0aCwgc3RhcnRUaW1lID0gbmV3IERhdGUoKSwgdGFraW5nVG9vTG9uZz1mYWxzZTtcbiAgICAgICAgICAgICAgICBmb3IoaT13cmFwcGVkLmxhc3RTY2FubmVkOyAoaTxsKSYmKCF0YWtpbmdUb29Mb25nKTsgaSsrKXtcbiAgICAgICAgICAgICAgICAgIGlmKF9pbmRleGVzLmluZGV4T2Yod3JhcHBlZFtpXSkgPiAtMSl7XG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5nZXROb3RpZmllcih3cmFwcGVkW2ldKS5fY2hlY2tQcm9wZXJ0eUxpc3RpbmcoKTtcbiAgICAgICAgICAgICAgICAgICAgdGFraW5nVG9vTG9uZz0oKG5ldyBEYXRlKCkpLXN0YXJ0VGltZSk+MTAwOyAvLyBtYWtlIHN1cmUgd2UgZG9uJ3QgdGFrZSBtb3JlIHRoYW4gMTAwIG1pbGxpc2Vjb25kcyB0byBzY2FuIGFsbCBvYmplY3RzXG4gICAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgd3JhcHBlZC5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgIGktLTtcbiAgICAgICAgICAgICAgICAgICAgbC0tO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB3cmFwcGVkLmxhc3RTY2FubmVkPWk8bD9pOjA7IC8vIHJlc2V0IHdyYXBwZWQgc28gd2UgY2FuIG1ha2Ugc3VyZSB0aGF0IHdlIHBpY2sgdGhpbmdzIGJhY2sgdXBcbiAgICAgICAgICAgICAgICBfZG9DaGVja0NhbGxiYWNrKF9mKTtcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pKHdyYXBlZCk7XG4gICAgICBfZG9DaGVja0NhbGxiYWNrKGYpO1xuICAgICAgcmV0dXJuIE9ic2VydmVyO1xuICAgIH0pKCk7XG5cbiAgICB2YXIgTm90aWZpZXIgPSBmdW5jdGlvbiBOb3RpZmllcih3YXRjaGluZyl7XG4gICAgdmFyIF9saXN0ZW5lcnMgPSBbXSwgX2FjY2VwdExpc3RzID0gW10sIF91cGRhdGVzID0gW10sIF91cGRhdGVyID0gZmFsc2UsIHByb3BlcnRpZXMgPSBbXSwgdmFsdWVzID0gW107XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoc2VsZiwgJ193YXRjaGluZycsIHtcbiAgICAgICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICBnZXQ6IChmdW5jdGlvbih3YXRjaGVkKXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHdhdGNoZWQ7XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICB9KSh3YXRjaGluZylcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgIHZhciB3cmFwUHJvcGVydHkgPSBmdW5jdGlvbiB3cmFwUHJvcGVydHkob2JqZWN0LCBwcm9wKXtcbiAgICAgICAgdmFyIHByb3BUeXBlID0gdHlwZW9mKG9iamVjdFtwcm9wXSksIGRlc2NyaXB0b3IgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcCk7XG4gICAgICAgIGlmKChwcm9wPT09J2dldE5vdGlmaWVyJyl8fGlzQWNjZXNzb3JEZXNjcmlwdG9yKGRlc2NyaXB0b3IpfHwoIWRlc2NyaXB0b3IuZW51bWVyYWJsZSkpe1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZigob2JqZWN0IGluc3RhbmNlb2YgQXJyYXkpJiZpc051bWVyaWMocHJvcCkpe1xuICAgICAgICAgIHZhciBpZHggPSBwcm9wZXJ0aWVzLmxlbmd0aDtcbiAgICAgICAgICBwcm9wZXJ0aWVzW2lkeF0gPSBwcm9wO1xuICAgICAgICAgIHZhbHVlc1tpZHhdID0gb2JqZWN0W3Byb3BdO1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIChmdW5jdGlvbihpZHgsIHByb3Ape1xuICAgICAgICAgIHByb3BlcnRpZXNbaWR4XSA9IHByb3A7XG4gICAgICAgICAgdmFsdWVzW2lkeF0gPSBvYmplY3RbcHJvcF07XG4gICAgICAgICAgZnVuY3Rpb24gZ2V0dGVyKCl7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWVzW2dldHRlci5pbmZvLmlkeF07XG4gICAgICAgICAgfVxuICAgICAgICAgIGZ1bmN0aW9uIHNldHRlcih2YWx1ZSl7XG4gICAgICAgICAgICBpZighc2FtZVZhbHVlKHZhbHVlc1tzZXR0ZXIuaW5mby5pZHhdLCB2YWx1ZSkpe1xuICAgICAgICAgICAgICBPYmplY3QuZ2V0Tm90aWZpZXIob2JqZWN0KS5xdWV1ZVVwZGF0ZShvYmplY3QsIHByb3AsICd1cGRhdGUnLCB2YWx1ZXNbc2V0dGVyLmluZm8uaWR4XSk7XG4gICAgICAgICAgICAgIHZhbHVlc1tzZXR0ZXIuaW5mby5pZHhdID0gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGdldHRlci5pbmZvID0gc2V0dGVyLmluZm8gPSB7XG4gICAgICAgICAgICBpZHg6IGlkeFxuICAgICAgICAgIH07XG4gICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iamVjdCwgcHJvcCwge1xuICAgICAgICAgICAgZ2V0OiBnZXR0ZXIsXG4gICAgICAgICAgICBzZXQ6IHNldHRlclxuICAgICAgICAgIH0pO1xuICAgICAgICB9KShwcm9wZXJ0aWVzLmxlbmd0aCwgcHJvcCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfTtcbiAgICAgIHNlbGYuX2NoZWNrUHJvcGVydHlMaXN0aW5nID0gZnVuY3Rpb24gX2NoZWNrUHJvcGVydHlMaXN0aW5nKGRvbnRRdWV1ZVVwZGF0ZXMpe1xuICAgICAgICB2YXIgb2JqZWN0ID0gc2VsZi5fd2F0Y2hpbmcsIGtleXMgPSBPYmplY3Qua2V5cyhvYmplY3QpLCBpPTAsIGw9a2V5cy5sZW5ndGg7XG4gICAgICAgIHZhciBuZXdLZXlzID0gW10sIG9sZEtleXMgPSBwcm9wZXJ0aWVzLnNsaWNlKDApLCB1cGRhdGVzID0gW107XG4gICAgICAgIHZhciBwcm9wLCBxdWV1ZVVwZGF0ZXMgPSAhZG9udFF1ZXVlVXBkYXRlcywgcHJvcFR5cGUsIHZhbHVlLCBpZHgsIGFMZW5ndGg7XG5cbiAgICAgICAgaWYob2JqZWN0IGluc3RhbmNlb2YgQXJyYXkpe1xuICAgICAgICAgIGFMZW5ndGggPSBzZWxmLl9vbGRMZW5ndGg7Ly9vYmplY3QubGVuZ3RoO1xuICAgICAgICAgIC8vYUxlbmd0aCA9IG9iamVjdC5sZW5ndGg7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IoaT0wOyBpPGw7IGkrKyl7XG4gICAgICAgICAgcHJvcCA9IGtleXNbaV07XG4gICAgICAgICAgdmFsdWUgPSBvYmplY3RbcHJvcF07XG4gICAgICAgICAgcHJvcFR5cGUgPSB0eXBlb2YodmFsdWUpO1xuICAgICAgICAgIGlmKChpZHggPSBwcm9wZXJ0aWVzLmluZGV4T2YocHJvcCkpPT09LTEpe1xuICAgICAgICAgICAgaWYod3JhcFByb3BlcnR5KG9iamVjdCwgcHJvcCkmJnF1ZXVlVXBkYXRlcyl7XG4gICAgICAgICAgICAgIHNlbGYucXVldWVVcGRhdGUob2JqZWN0LCBwcm9wLCAnYWRkJywgbnVsbCwgb2JqZWN0W3Byb3BdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIGlmKCEob2JqZWN0IGluc3RhbmNlb2YgQXJyYXkpfHwoaXNOdW1lcmljKHByb3ApKSl7XG4gICAgICAgICAgICAgIGlmKHZhbHVlc1tpZHhdICE9PSB2YWx1ZSl7XG4gICAgICAgICAgICAgICAgaWYocXVldWVVcGRhdGVzKXtcbiAgICAgICAgICAgICAgICAgIHNlbGYucXVldWVVcGRhdGUob2JqZWN0LCBwcm9wLCAndXBkYXRlJywgdmFsdWVzW2lkeF0sIHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFsdWVzW2lkeF0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb2xkS2V5cy5zcGxpY2Uob2xkS2V5cy5pbmRleE9mKHByb3ApLCAxKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZihvYmplY3QgaW5zdGFuY2VvZiBBcnJheSAmJiBvYmplY3QubGVuZ3RoICE9PSBhTGVuZ3RoKXtcbiAgICAgICAgICBpZihxdWV1ZVVwZGF0ZXMpe1xuICAgICAgICAgICAgc2VsZi5xdWV1ZVVwZGF0ZShvYmplY3QsICdsZW5ndGgnLCAndXBkYXRlJywgYUxlbmd0aCwgb2JqZWN0KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgc2VsZi5fb2xkTGVuZ3RoID0gb2JqZWN0Lmxlbmd0aDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKHF1ZXVlVXBkYXRlcyl7XG4gICAgICAgICAgbCA9IG9sZEtleXMubGVuZ3RoO1xuICAgICAgICAgIGZvcihpPTA7IGk8bDsgaSsrKXtcbiAgICAgICAgICAgIGlkeCA9IHByb3BlcnRpZXMuaW5kZXhPZihvbGRLZXlzW2ldKTtcbiAgICAgICAgICAgIHNlbGYucXVldWVVcGRhdGUob2JqZWN0LCBvbGRLZXlzW2ldLCAnZGVsZXRlJywgdmFsdWVzW2lkeF0pO1xuICAgICAgICAgICAgcHJvcGVydGllcy5zcGxpY2UoaWR4LDEpO1xuICAgICAgICAgICAgdmFsdWVzLnNwbGljZShpZHgsMSk7XG4gICAgICAgICAgICBmb3IodmFyIGk9aWR4O2k8cHJvcGVydGllcy5sZW5ndGg7aSsrKXtcbiAgICAgICAgICAgICAgaWYoIShwcm9wZXJ0aWVzW2ldIGluIG9iamVjdCkpXG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgIHZhciBnZXR0ZXIgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCxwcm9wZXJ0aWVzW2ldKS5nZXQ7XG4gICAgICAgICAgICAgIGlmKCFnZXR0ZXIpXG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgIHZhciBpbmZvID0gZ2V0dGVyLmluZm87XG4gICAgICAgICAgICAgIGluZm8uaWR4ID0gaTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgc2VsZi5hZGRMaXN0ZW5lciA9IGZ1bmN0aW9uIE5vdGlmaWVyX2FkZExpc3RlbmVyKGNhbGxiYWNrLCBhY2NlcHQpe1xuICAgICAgICB2YXIgaWR4ID0gX2xpc3RlbmVycy5pbmRleE9mKGNhbGxiYWNrKTtcbiAgICAgICAgaWYoaWR4PT09LTEpe1xuICAgICAgICAgIF9saXN0ZW5lcnMucHVzaChjYWxsYmFjayk7XG4gICAgICAgICAgX2FjY2VwdExpc3RzLnB1c2goYWNjZXB0KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBfYWNjZXB0TGlzdHNbaWR4XSA9IGFjY2VwdDtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIHNlbGYucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbiBOb3RpZmllcl9yZW1vdmVMaXN0ZW5lcihjYWxsYmFjayl7XG4gICAgICAgIHZhciBpZHggPSBfbGlzdGVuZXJzLmluZGV4T2YoY2FsbGJhY2spO1xuICAgICAgICBpZihpZHg+LTEpe1xuICAgICAgICAgIF9saXN0ZW5lcnMuc3BsaWNlKGlkeCwgMSk7XG4gICAgICAgICAgX2FjY2VwdExpc3RzLnNwbGljZShpZHgsIDEpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgc2VsZi5saXN0ZW5lcnMgPSBmdW5jdGlvbiBOb3RpZmllcl9saXN0ZW5lcnMoKXtcbiAgICAgICAgcmV0dXJuIF9saXN0ZW5lcnM7XG4gICAgICB9O1xuICAgICAgc2VsZi5xdWV1ZVVwZGF0ZSA9IGZ1bmN0aW9uIE5vdGlmaWVyX3F1ZXVlVXBkYXRlKHdoYXQsIHByb3AsIHR5cGUsIHdhcyl7XG4gICAgICAgIHRoaXMucXVldWVVcGRhdGVzKFt7XG4gICAgICAgICAgdHlwZTogdHlwZSxcbiAgICAgICAgICBvYmplY3Q6IHdoYXQsXG4gICAgICAgICAgbmFtZTogcHJvcCxcbiAgICAgICAgICBvbGRWYWx1ZTogd2FzXG4gICAgICAgIH1dKTtcbiAgICAgIH07XG4gICAgICBzZWxmLnF1ZXVlVXBkYXRlcyA9IGZ1bmN0aW9uIE5vdGlmaWVyX3F1ZXVlVXBkYXRlcyh1cGRhdGVzKXtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzLCBpID0gMCwgbCA9IHVwZGF0ZXMubGVuZ3RofHwwLCB1cGRhdGU7XG4gICAgICAgIGZvcihpPTA7IGk8bDsgaSsrKXtcbiAgICAgICAgICB1cGRhdGUgPSB1cGRhdGVzW2ldO1xuICAgICAgICAgIF91cGRhdGVzLnB1c2godXBkYXRlKTtcbiAgICAgICAgfVxuICAgICAgICBpZihfdXBkYXRlcil7XG4gICAgICAgICAgX2NsZWFyQ2hlY2tDYWxsYmFjayhfdXBkYXRlcik7XG4gICAgICAgIH1cbiAgICAgICAgX3VwZGF0ZXIgPSBfZG9DaGVja0NhbGxiYWNrKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgX3VwZGF0ZXIgPSBmYWxzZTtcbiAgICAgICAgICBzZWxmLmRlbGl2ZXJDaGFuZ2VSZWNvcmRzKCk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICAgIHNlbGYuZGVsaXZlckNoYW5nZVJlY29yZHMgPSBmdW5jdGlvbiBOb3RpZmllcl9kZWxpdmVyQ2hhbmdlUmVjb3Jkcygpe1xuICAgICAgICB2YXIgaSA9IDAsIGwgPSBfbGlzdGVuZXJzLmxlbmd0aCxcbiAgICAgICAgICAgIC8va2VlcFJ1bm5pbmcgPSB0cnVlLCByZW1vdmVkIGFzIGl0IHNlZW1zIHRoZSBhY3R1YWwgaW1wbGVtZW50YXRpb24gZG9lc24ndCBkbyB0aGlzXG4gICAgICAgICAgICAvLyBJbiByZXNwb25zZSB0byBCVUcgIzVcbiAgICAgICAgICAgIHJldHZhbDtcbiAgICAgICAgZm9yKGk9MDsgaTxsOyBpKyspe1xuICAgICAgICAgIGlmKF9saXN0ZW5lcnNbaV0pe1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRVcGRhdGVzO1xuICAgICAgICAgICAgaWYgKF9hY2NlcHRMaXN0c1tpXSkge1xuICAgICAgICAgICAgICBjdXJyZW50VXBkYXRlcyA9IFtdO1xuICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMCwgdXBkYXRlc0xlbmd0aCA9IF91cGRhdGVzLmxlbmd0aDsgaiA8IHVwZGF0ZXNMZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgIGlmIChfYWNjZXB0TGlzdHNbaV0uaW5kZXhPZihfdXBkYXRlc1tqXS50eXBlKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgIGN1cnJlbnRVcGRhdGVzLnB1c2goX3VwZGF0ZXNbal0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgIGN1cnJlbnRVcGRhdGVzID0gX3VwZGF0ZXM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoY3VycmVudFVwZGF0ZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIGlmKF9saXN0ZW5lcnNbaV09PT1jb25zb2xlLmxvZyl7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coY3VycmVudFVwZGF0ZXMpO1xuICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICBfbGlzdGVuZXJzW2ldKGN1cnJlbnRVcGRhdGVzKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBfdXBkYXRlcz1bXTtcbiAgICAgIH07XG4gICAgICBzZWxmLm5vdGlmeSA9IGZ1bmN0aW9uIE5vdGlmaWVyX25vdGlmeShjaGFuZ2VSZWNvcmQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBjaGFuZ2VSZWNvcmQgIT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIGNoYW5nZVJlY29yZC50eXBlICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkludmFsaWQgY2hhbmdlUmVjb3JkIHdpdGggbm9uLXN0cmluZyAndHlwZScgcHJvcGVydHlcIik7XG4gICAgICAgIH1cbiAgICAgICAgY2hhbmdlUmVjb3JkLm9iamVjdCA9IHdhdGNoaW5nO1xuICAgICAgICBzZWxmLnF1ZXVlVXBkYXRlcyhbY2hhbmdlUmVjb3JkXSk7XG4gICAgICB9O1xuICAgICAgc2VsZi5fY2hlY2tQcm9wZXJ0eUxpc3RpbmcodHJ1ZSk7XG4gICAgfTtcblxuICAgIHZhciBfbm90aWZpZXJzPVtdLCBfaW5kZXhlcz1bXTtcbiAgICBleHRlbmQuZ2V0Tm90aWZpZXIgPSBmdW5jdGlvbiBPYmplY3RfZ2V0Tm90aWZpZXIoTyl7XG4gICAgdmFyIGlkeCA9IF9pbmRleGVzLmluZGV4T2YoTyksIG5vdGlmaWVyID0gaWR4Pi0xP19ub3RpZmllcnNbaWR4XTpmYWxzZTtcbiAgICAgIGlmKCFub3RpZmllcil7XG4gICAgICAgIGlkeCA9IF9pbmRleGVzLmxlbmd0aDtcbiAgICAgICAgX2luZGV4ZXNbaWR4XSA9IE87XG4gICAgICAgIG5vdGlmaWVyID0gX25vdGlmaWVyc1tpZHhdID0gbmV3IE5vdGlmaWVyKE8pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5vdGlmaWVyO1xuICAgIH07XG4gICAgZXh0ZW5kLm9ic2VydmUgPSBmdW5jdGlvbiBPYmplY3Rfb2JzZXJ2ZShPLCBjYWxsYmFjaywgYWNjZXB0KXtcbiAgICAgIC8vIEZvciBCdWcgNCwgY2FuJ3Qgb2JzZXJ2ZSBET00gZWxlbWVudHMgdGVzdGVkIGFnYWluc3QgY2FucnkgaW1wbGVtZW50YXRpb24gYW5kIG1hdGNoZXNcbiAgICAgIGlmKCFpc0VsZW1lbnQoTykpe1xuICAgICAgICByZXR1cm4gbmV3IE9ic2VydmVyKE8sIGNhbGxiYWNrLCBhY2NlcHQpO1xuICAgICAgfVxuICAgIH07XG4gICAgZXh0ZW5kLnVub2JzZXJ2ZSA9IGZ1bmN0aW9uIE9iamVjdF91bm9ic2VydmUoTywgY2FsbGJhY2spe1xuICAgICAgdmFsaWRhdGVBcmd1bWVudHMoTywgY2FsbGJhY2spO1xuICAgICAgdmFyIGlkeCA9IF9pbmRleGVzLmluZGV4T2YoTyksXG4gICAgICAgICAgbm90aWZpZXIgPSBpZHg+LTE/X25vdGlmaWVyc1tpZHhdOmZhbHNlO1xuICAgICAgaWYgKCFub3RpZmllcil7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIG5vdGlmaWVyLnJlbW92ZUxpc3RlbmVyKGNhbGxiYWNrKTtcbiAgICAgIGlmIChub3RpZmllci5saXN0ZW5lcnMoKS5sZW5ndGggPT09IDApe1xuICAgICAgICBfaW5kZXhlcy5zcGxpY2UoaWR4LCAxKTtcbiAgICAgICAgX25vdGlmaWVycy5zcGxpY2UoaWR4LCAxKTtcbiAgICAgIH1cbiAgICB9O1xuICB9KShPYmplY3QsIHRoaXMpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBFbmdpbmU6IHJlcXVpcmUoJy4vRW5naW5lJyksXG4gICAgU2NlbmU6IHJlcXVpcmUoJy4vU2NlbmUnKSxcbiAgICBOb2RlOiByZXF1aXJlKCcuL05vZGUnKVxufTtcbiIsIi8qKlxuKiBTY3JvbGxTeW5jXG4qXG4qIEFQSSBmb3Igc3luY2luZyBtb3VzZXdoZWVsIGFuZCB0b3VjaG1vdmUgRXZlbnRzLlxuKlxuKiBieSBTdGV2ZSBCZWxvdmFyaWNoXG4qIExpY2Vuc2VkIHVuZGVyIE1JVCwgc2VlIGxpY2Vuc2UudHh0IG9yIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG4qKi9cblxudmFyIFNjcm9sbFN5bmMgPSBmdW5jdGlvbihlbGVtLCBjYiwgZGlyZWN0aW9uKSB7XG5cbiAgdmFyIHRzLFxuICAgICAgcHJvcCxcbiAgICAgIHRvLFxuICAgICAgcG9zO1xuXG4gIGRpcmVjdGlvbiA9PT0gJ2hvcicgPyBwcm9wID0gWydwYWdlWCcsICdkZWx0YVgnXSA6IHByb3AgPSBbJ3BhZ2VZJywgJ2RlbHRhWSddO1xuXG4gIGVsZW0uYWRkRXZlbnRMaXN0ZW5lcignbW91c2V3aGVlbCcsIGZ1bmN0aW9uKGV2KXtcblxuICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgcG9zID0gZXZbcHJvcFsxXV0qMC4xMjU7XG4gICAgY2IocG9zLCBmYWxzZSk7XG5cbiAgfSk7XG5cbiAgZWxlbS5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgZnVuY3Rpb24gKGV2KXtcblxuICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICB0cyA9IGV2W3Byb3BbMF1dO1xuXG4gIH0pO1xuXG4gIGVsZW0uYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgZnVuY3Rpb24gKGV2KXtcblxuICAgICB2YXIgdGUgPSBldltwcm9wWzBdXTtcbiAgICAgY2xlYXJUaW1lb3V0KHRvKTtcblxuICAgICBpZih0ZSA8IHRzKXtcblxuICAgICAgIHBvcyA9ICh0cy10ZSkqMC4wMzI1O1xuICAgICAgIGNiKHBvcywgZmFsc2UpO1xuXG4gICAgIH0gZWxzZSBpZih0ZSA+IHRzKXtcblxuICAgICAgIHBvcyA9ICh0cy10ZSkqMC4wMzI1O1xuICAgICAgIGNiKHBvcywgZmFsc2UpO1xuXG4gICAgIH1cblxuICB9KTtcblxuICBlbGVtLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgZnVuY3Rpb24gKGV2KXtcblxuICAgIHRvID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuXG4gICAgICBpZigoZXZbcHJvcFswXV0gPCAodHMgLSAyNjApKSl7XG4gICAgICAgIHBvcyA9IHBvcyArIDQwMDtcbiAgICAgICAgY2IocG9zLCB0cnVlKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYoKGV2W3Byb3BbMF1dID4gKHRzICsgMjYwKSkpe1xuICAgICAgICBwb3MgPSBwb3MgLSA0MDA7XG4gICAgICAgIGNiKHBvcywgdHJ1ZSk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmKChldltwcm9wWzBdXSA8ICh0cyAtIDIwMCkpKXtcbiAgICAgICAgcG9zID0gcG9zICsgMjAwO1xuICAgICAgICBjYihwb3MsIHRydWUpO1xuICAgICAgfVxuICAgICAgZWxzZSBpZigoZXZbcHJvcFswXV0gPiAodHMgKyAyMDApKSl7XG4gICAgICAgIHBvcyA9IHBvcyAtIDIwMDtcbiAgICAgICAgY2IocG9zLCB0cnVlKTtcbiAgICAgIH1cblxuICAgIH0sIDgwKTtcblxuICB9KTtcblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTY3JvbGxTeW5jO1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgU2Nyb2xsU3luYzogcmVxdWlyZSgnLi9TY3JvbGxTeW5jJylcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBjb3JlOiByZXF1aXJlKCcuL2NvcmUnKSxcbiAgICBjb21wb25lbnRzOiByZXF1aXJlKCcuL2NvbXBvbmVudHMnKSxcbiAgICBldmVudHM6IHJlcXVpcmUoJy4vZXZlbnRzJyksXG4gICAgbWF0aDogcmVxdWlyZSgnLi9tYXRoJyksXG4gICAgdHJhbnNpdGlvbnM6IHJlcXVpcmUoJy4vdHJhbnNpdGlvbnMnKVxufTtcbiIsIi8qKlxuICogVGhlIE1JVCBMaWNlbnNlIChNSVQpXG4gKiBcbiAqIENvcHlyaWdodCAoYykgMjAxNSBGYW1vdXMgSW5kdXN0cmllcyBJbmMuXG4gKiBcbiAqIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbiAqIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbiAqIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbiAqIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbiAqIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuICogZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbiAqIFxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbiAqIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuICogXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAqIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAqIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbiAqIFRIRSBTT0ZUV0FSRS5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQSAzeDMgbnVtZXJpY2FsIG1hdHJpeCwgcmVwcmVzZW50ZWQgYXMgYW4gYXJyYXkuXG4gKlxuICogQGNsYXNzIE1hdDMzXG4gKlxuICogQHBhcmFtIHtBcnJheX0gdmFsdWVzIGEgM3gzIG1hdHJpeCBmbGF0dGVuZWRcbiAqL1xuZnVuY3Rpb24gTWF0MzModmFsdWVzKSB7XG4gICAgdGhpcy52YWx1ZXMgPSB2YWx1ZXMgfHwgWzEsMCwwLDAsMSwwLDAsMCwxXTtcbn1cblxuLyoqXG4gKiBSZXR1cm4gdGhlIHZhbHVlcyBpbiB0aGUgTWF0MzMgYXMgYW4gYXJyYXkuXG4gKlxuICogQG1ldGhvZFxuICpcbiAqIEByZXR1cm4ge0FycmF5fSBtYXRyaXggdmFsdWVzIGFzIGFycmF5IG9mIHJvd3MuXG4gKi9cbk1hdDMzLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiBnZXQoKSB7XG4gICAgcmV0dXJuIHRoaXMudmFsdWVzO1xufTtcblxuLyoqXG4gKiBTZXQgdGhlIHZhbHVlcyBvZiB0aGUgY3VycmVudCBNYXQzMy5cbiAqXG4gKiBAbWV0aG9kXG4gKlxuICogQHBhcmFtIHtBcnJheX0gdmFsdWVzIEFycmF5IG9mIG5pbmUgbnVtYmVycyB0byBzZXQgaW4gdGhlIE1hdDMzLlxuICpcbiAqIEByZXR1cm4ge01hdDMzfSB0aGlzXG4gKi9cbk1hdDMzLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiBzZXQodmFsdWVzKSB7XG4gICAgdGhpcy52YWx1ZXMgPSB2YWx1ZXM7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIENvcHkgdGhlIHZhbHVlcyBvZiB0aGUgaW5wdXQgTWF0MzMuXG4gKlxuICogQG1ldGhvZFxuICpcbiAqIEBwYXJhbSB7TWF0MzN9IG1hdHJpeCBUaGUgTWF0MzMgdG8gY29weS5cbiAqIFxuICogQHJldHVybiB7TWF0MzN9IHRoaXNcbiAqL1xuTWF0MzMucHJvdG90eXBlLmNvcHkgPSBmdW5jdGlvbiBjb3B5KG1hdHJpeCkge1xuICAgIHZhciBBID0gdGhpcy52YWx1ZXM7XG4gICAgdmFyIEIgPSBtYXRyaXgudmFsdWVzO1xuXG4gICAgQVswXSA9IEJbMF07XG4gICAgQVsxXSA9IEJbMV07XG4gICAgQVsyXSA9IEJbMl07XG4gICAgQVszXSA9IEJbM107XG4gICAgQVs0XSA9IEJbNF07XG4gICAgQVs1XSA9IEJbNV07XG4gICAgQVs2XSA9IEJbNl07XG4gICAgQVs3XSA9IEJbN107XG4gICAgQVs4XSA9IEJbOF07XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogVGFrZSB0aGlzIE1hdDMzIGFzIEEsIGlucHV0IHZlY3RvciBWIGFzIGEgY29sdW1uIHZlY3RvciwgYW5kIHJldHVybiBNYXQzMyBwcm9kdWN0IChBKShWKS5cbiAqXG4gKiBAbWV0aG9kXG4gKlxuICogQHBhcmFtIHtWZWMzfSB2IFZlY3RvciB0byByb3RhdGUuXG4gKiBAcGFyYW0ge1ZlYzN9IG91dHB1dCBWZWMzIGluIHdoaWNoIHRvIHBsYWNlIHRoZSByZXN1bHQuXG4gKlxuICogQHJldHVybiB7VmVjM30gVGhlIGlucHV0IHZlY3RvciBhZnRlciBtdWx0aXBsaWNhdGlvbi5cbiAqL1xuTWF0MzMucHJvdG90eXBlLnZlY3Rvck11bHRpcGx5ID0gZnVuY3Rpb24gdmVjdG9yTXVsdGlwbHkodiwgb3V0cHV0KSB7XG4gICAgdmFyIE0gPSB0aGlzLnZhbHVlcztcbiAgICB2YXIgdjAgPSB2Lng7XG4gICAgdmFyIHYxID0gdi55O1xuICAgIHZhciB2MiA9IHYuejtcblxuICAgIG91dHB1dC54ID0gTVswXSp2MCArIE1bMV0qdjEgKyBNWzJdKnYyO1xuICAgIG91dHB1dC55ID0gTVszXSp2MCArIE1bNF0qdjEgKyBNWzVdKnYyO1xuICAgIG91dHB1dC56ID0gTVs2XSp2MCArIE1bN10qdjEgKyBNWzhdKnYyO1xuXG4gICAgcmV0dXJuIG91dHB1dDtcbn07XG5cbi8qKlxuICogTXVsdGlwbHkgdGhlIHByb3ZpZGVkIE1hdDMzIHdpdGggdGhlIGN1cnJlbnQgTWF0MzMuICBSZXN1bHQgaXMgKHRoaXMpICogKG1hdHJpeCkuXG4gKlxuICogQG1ldGhvZFxuICpcbiAqIEBwYXJhbSB7TWF0MzN9IG1hdHJpeCBJbnB1dCBNYXQzMyB0byBtdWx0aXBseSBvbiB0aGUgcmlnaHQuXG4gKlxuICogQHJldHVybiB7TWF0MzN9IHRoaXNcbiAqL1xuTWF0MzMucHJvdG90eXBlLm11bHRpcGx5ID0gZnVuY3Rpb24gbXVsdGlwbHkobWF0cml4KSB7XG4gICAgdmFyIEEgPSB0aGlzLnZhbHVlcztcbiAgICB2YXIgQiA9IG1hdHJpeC52YWx1ZXM7XG5cbiAgICB2YXIgQTAgPSBBWzBdO1xuICAgIHZhciBBMSA9IEFbMV07XG4gICAgdmFyIEEyID0gQVsyXTtcbiAgICB2YXIgQTMgPSBBWzNdO1xuICAgIHZhciBBNCA9IEFbNF07XG4gICAgdmFyIEE1ID0gQVs1XTtcbiAgICB2YXIgQTYgPSBBWzZdO1xuICAgIHZhciBBNyA9IEFbN107XG4gICAgdmFyIEE4ID0gQVs4XTtcblxuICAgIHZhciBCMCA9IEJbMF07XG4gICAgdmFyIEIxID0gQlsxXTtcbiAgICB2YXIgQjIgPSBCWzJdO1xuICAgIHZhciBCMyA9IEJbM107XG4gICAgdmFyIEI0ID0gQls0XTtcbiAgICB2YXIgQjUgPSBCWzVdO1xuICAgIHZhciBCNiA9IEJbNl07XG4gICAgdmFyIEI3ID0gQls3XTtcbiAgICB2YXIgQjggPSBCWzhdO1xuXG4gICAgQVswXSA9IEEwKkIwICsgQTEqQjMgKyBBMipCNjtcbiAgICBBWzFdID0gQTAqQjEgKyBBMSpCNCArIEEyKkI3O1xuICAgIEFbMl0gPSBBMCpCMiArIEExKkI1ICsgQTIqQjg7XG4gICAgQVszXSA9IEEzKkIwICsgQTQqQjMgKyBBNSpCNjtcbiAgICBBWzRdID0gQTMqQjEgKyBBNCpCNCArIEE1KkI3O1xuICAgIEFbNV0gPSBBMypCMiArIEE0KkI1ICsgQTUqQjg7XG4gICAgQVs2XSA9IEE2KkIwICsgQTcqQjMgKyBBOCpCNjtcbiAgICBBWzddID0gQTYqQjEgKyBBNypCNCArIEE4KkI3O1xuICAgIEFbOF0gPSBBNipCMiArIEE3KkI1ICsgQTgqQjg7XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogVHJhbnNwb3NlcyB0aGUgTWF0MzMuXG4gKlxuICogQG1ldGhvZFxuICpcbiAqIEByZXR1cm4ge01hdDMzfSB0aGlzXG4gKi9cbk1hdDMzLnByb3RvdHlwZS50cmFuc3Bvc2UgPSBmdW5jdGlvbiB0cmFuc3Bvc2UoKSB7XG4gICAgdmFyIE0gPSB0aGlzLnZhbHVlcztcblxuICAgIHZhciBNMSA9IE1bMV07XG4gICAgdmFyIE0yID0gTVsyXTtcbiAgICB2YXIgTTMgPSBNWzNdO1xuICAgIHZhciBNNSA9IE1bNV07XG4gICAgdmFyIE02ID0gTVs2XTtcbiAgICB2YXIgTTcgPSBNWzddO1xuXG4gICAgTVsxXSA9IE0zO1xuICAgIE1bMl0gPSBNNjtcbiAgICBNWzNdID0gTTE7XG4gICAgTVs1XSA9IE03O1xuICAgIE1bNl0gPSBNMjtcbiAgICBNWzddID0gTTU7XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogVGhlIGRldGVybWluYW50IG9mIHRoZSBNYXQzMy5cbiAqXG4gKiBAbWV0aG9kXG4gKlxuICogQHJldHVybiB7TnVtYmVyfSBUaGUgZGV0ZXJtaW5hbnQuXG4gKi9cbk1hdDMzLnByb3RvdHlwZS5nZXREZXRlcm1pbmFudCA9IGZ1bmN0aW9uIGdldERldGVybWluYW50KCkge1xuICAgIHZhciBNID0gdGhpcy52YWx1ZXM7XG5cbiAgICB2YXIgTTMgPSBNWzNdO1xuICAgIHZhciBNNCA9IE1bNF07XG4gICAgdmFyIE01ID0gTVs1XTtcbiAgICB2YXIgTTYgPSBNWzZdO1xuICAgIHZhciBNNyA9IE1bN107XG4gICAgdmFyIE04ID0gTVs4XTtcblxuICAgIHZhciBkZXQgPSBNWzBdKihNNCpNOCAtIE01Kk03KSAtXG4gICAgICAgICAgICAgIE1bMV0qKE0zKk04IC0gTTUqTTYpICtcbiAgICAgICAgICAgICAgTVsyXSooTTMqTTcgLSBNNCpNNik7XG5cbiAgICByZXR1cm4gZGV0O1xufTtcblxuLyoqXG4gKiBUaGUgaW52ZXJzZSBvZiB0aGUgTWF0MzMuXG4gKlxuICogQG1ldGhvZFxuICpcbiAqIEByZXR1cm4ge01hdDMzfSB0aGlzXG4gKi9cbk1hdDMzLnByb3RvdHlwZS5pbnZlcnNlID0gZnVuY3Rpb24gaW52ZXJzZSgpIHtcbiAgICB2YXIgTSA9IHRoaXMudmFsdWVzO1xuXG4gICAgdmFyIE0wID0gTVswXTtcbiAgICB2YXIgTTEgPSBNWzFdO1xuICAgIHZhciBNMiA9IE1bMl07XG4gICAgdmFyIE0zID0gTVszXTtcbiAgICB2YXIgTTQgPSBNWzRdO1xuICAgIHZhciBNNSA9IE1bNV07XG4gICAgdmFyIE02ID0gTVs2XTtcbiAgICB2YXIgTTcgPSBNWzddO1xuICAgIHZhciBNOCA9IE1bOF07XG5cbiAgICB2YXIgZGV0ID0gTTAqKE00Kk04IC0gTTUqTTcpIC1cbiAgICAgICAgICAgICAgTTEqKE0zKk04IC0gTTUqTTYpICtcbiAgICAgICAgICAgICAgTTIqKE0zKk03IC0gTTQqTTYpO1xuXG4gICAgaWYgKE1hdGguYWJzKGRldCkgPCAxZS00MCkgcmV0dXJuIG51bGw7XG5cbiAgICBkZXQgPSAxIC8gZGV0O1xuXG4gICAgTVswXSA9IChNNCpNOCAtIE01Kk03KSAqIGRldDtcbiAgICBNWzNdID0gKC1NMypNOCArIE01Kk02KSAqIGRldDtcbiAgICBNWzZdID0gKE0zKk03IC0gTTQqTTYpICogZGV0O1xuICAgIE1bMV0gPSAoLU0xKk04ICsgTTIqTTcpICogZGV0O1xuICAgIE1bNF0gPSAoTTAqTTggLSBNMipNNikgKiBkZXQ7XG4gICAgTVs3XSA9ICgtTTAqTTcgKyBNMSpNNikgKiBkZXQ7XG4gICAgTVsyXSA9IChNMSpNNSAtIE0yKk00KSAqIGRldDtcbiAgICBNWzVdID0gKC1NMCpNNSArIE0yKk0zKSAqIGRldDtcbiAgICBNWzhdID0gKE0wKk00IC0gTTEqTTMpICogZGV0O1xuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIENsb25lcyB0aGUgaW5wdXQgTWF0MzMuXG4gKlxuICogQG1ldGhvZFxuICpcbiAqIEBwYXJhbSB7TWF0MzN9IG0gTWF0MzMgdG8gY2xvbmUuXG4gKlxuICogQHJldHVybiB7TWF0MzN9IE5ldyBjb3B5IG9mIHRoZSBvcmlnaW5hbCBNYXQzMy5cbiAqL1xuTWF0MzMuY2xvbmUgPSBmdW5jdGlvbiBjbG9uZShtKSB7XG4gICAgcmV0dXJuIG5ldyBNYXQzMyhtLnZhbHVlcy5zbGljZSgpKTtcbn07XG5cbi8qKlxuICogVGhlIGludmVyc2Ugb2YgdGhlIE1hdDMzLlxuICpcbiAqIEBtZXRob2RcbiAqXG4gKiBAcGFyYW0ge01hdDMzfSBtYXRyaXggTWF0MzMgdG8gaW52ZXJ0LlxuICogQHBhcmFtIHtNYXQzM30gb3V0cHV0IE1hdDMzIGluIHdoaWNoIHRvIHBsYWNlIHRoZSByZXN1bHQuXG4gKlxuICogQHJldHVybiB7TWF0MzN9IFRoZSBNYXQzMyBhZnRlciB0aGUgaW52ZXJ0LlxuICovXG5NYXQzMy5pbnZlcnNlID0gZnVuY3Rpb24gaW52ZXJzZShtYXRyaXgsIG91dHB1dCkge1xuICAgIHZhciBNID0gbWF0cml4LnZhbHVlcztcbiAgICB2YXIgcmVzdWx0ID0gb3V0cHV0LnZhbHVlcztcblxuICAgIHZhciBNMCA9IE1bMF07XG4gICAgdmFyIE0xID0gTVsxXTtcbiAgICB2YXIgTTIgPSBNWzJdO1xuICAgIHZhciBNMyA9IE1bM107XG4gICAgdmFyIE00ID0gTVs0XTtcbiAgICB2YXIgTTUgPSBNWzVdO1xuICAgIHZhciBNNiA9IE1bNl07XG4gICAgdmFyIE03ID0gTVs3XTtcbiAgICB2YXIgTTggPSBNWzhdO1xuXG4gICAgdmFyIGRldCA9IE0wKihNNCpNOCAtIE01Kk03KSAtXG4gICAgICAgICAgICAgIE0xKihNMypNOCAtIE01Kk02KSArXG4gICAgICAgICAgICAgIE0yKihNMypNNyAtIE00Kk02KTtcblxuICAgIGlmIChNYXRoLmFicyhkZXQpIDwgMWUtNDApIHJldHVybiBudWxsO1xuXG4gICAgZGV0ID0gMSAvIGRldDtcblxuICAgIHJlc3VsdFswXSA9IChNNCpNOCAtIE01Kk03KSAqIGRldDtcbiAgICByZXN1bHRbM10gPSAoLU0zKk04ICsgTTUqTTYpICogZGV0O1xuICAgIHJlc3VsdFs2XSA9IChNMypNNyAtIE00Kk02KSAqIGRldDtcbiAgICByZXN1bHRbMV0gPSAoLU0xKk04ICsgTTIqTTcpICogZGV0O1xuICAgIHJlc3VsdFs0XSA9IChNMCpNOCAtIE0yKk02KSAqIGRldDtcbiAgICByZXN1bHRbN10gPSAoLU0wKk03ICsgTTEqTTYpICogZGV0O1xuICAgIHJlc3VsdFsyXSA9IChNMSpNNSAtIE0yKk00KSAqIGRldDtcbiAgICByZXN1bHRbNV0gPSAoLU0wKk01ICsgTTIqTTMpICogZGV0O1xuICAgIHJlc3VsdFs4XSA9IChNMCpNNCAtIE0xKk0zKSAqIGRldDtcblxuICAgIHJldHVybiBvdXRwdXQ7XG59O1xuXG4vKipcbiAqIFRyYW5zcG9zZXMgdGhlIE1hdDMzLlxuICpcbiAqIEBtZXRob2RcbiAqXG4gKiBAcGFyYW0ge01hdDMzfSBtYXRyaXggTWF0MzMgdG8gdHJhbnNwb3NlLlxuICogQHBhcmFtIHtNYXQzM30gb3V0cHV0IE1hdDMzIGluIHdoaWNoIHRvIHBsYWNlIHRoZSByZXN1bHQuXG4gKlxuICogQHJldHVybiB7TWF0MzN9IFRoZSBNYXQzMyBhZnRlciB0aGUgdHJhbnNwb3NlLlxuICovXG5NYXQzMy50cmFuc3Bvc2UgPSBmdW5jdGlvbiB0cmFuc3Bvc2UobWF0cml4LCBvdXRwdXQpIHtcbiAgICB2YXIgTSA9IG1hdHJpeC52YWx1ZXM7XG4gICAgdmFyIHJlc3VsdCA9IG91dHB1dC52YWx1ZXM7XG5cbiAgICB2YXIgTTAgPSBNWzBdO1xuICAgIHZhciBNMSA9IE1bMV07XG4gICAgdmFyIE0yID0gTVsyXTtcbiAgICB2YXIgTTMgPSBNWzNdO1xuICAgIHZhciBNNCA9IE1bNF07XG4gICAgdmFyIE01ID0gTVs1XTtcbiAgICB2YXIgTTYgPSBNWzZdO1xuICAgIHZhciBNNyA9IE1bN107XG4gICAgdmFyIE04ID0gTVs4XTtcblxuICAgIHJlc3VsdFswXSA9IE0wO1xuICAgIHJlc3VsdFsxXSA9IE0zO1xuICAgIHJlc3VsdFsyXSA9IE02O1xuICAgIHJlc3VsdFszXSA9IE0xO1xuICAgIHJlc3VsdFs0XSA9IE00O1xuICAgIHJlc3VsdFs1XSA9IE03O1xuICAgIHJlc3VsdFs2XSA9IE0yO1xuICAgIHJlc3VsdFs3XSA9IE01O1xuICAgIHJlc3VsdFs4XSA9IE04O1xuXG4gICAgcmV0dXJuIG91dHB1dDtcbn07XG5cbi8qKlxuICogQWRkIHRoZSBwcm92aWRlZCBNYXQzMydzLlxuICpcbiAqIEBtZXRob2RcbiAqXG4gKiBAcGFyYW0ge01hdDMzfSBtYXRyaXgxIFRoZSBsZWZ0IE1hdDMzLlxuICogQHBhcmFtIHtNYXQzM30gbWF0cml4MiBUaGUgcmlnaHQgTWF0MzMuXG4gKiBAcGFyYW0ge01hdDMzfSBvdXRwdXQgTWF0MzMgaW4gd2hpY2ggdG8gcGxhY2UgdGhlIHJlc3VsdC5cbiAqXG4gKiBAcmV0dXJuIHtNYXQzM30gVGhlIHJlc3VsdCBvZiB0aGUgYWRkaXRpb24uXG4gKi9cbk1hdDMzLmFkZCA9IGZ1bmN0aW9uIGFkZChtYXRyaXgxLCBtYXRyaXgyLCBvdXRwdXQpIHtcbiAgICB2YXIgQSA9IG1hdHJpeDEudmFsdWVzO1xuICAgIHZhciBCID0gbWF0cml4Mi52YWx1ZXM7XG4gICAgdmFyIHJlc3VsdCA9IG91dHB1dC52YWx1ZXM7XG5cbiAgICB2YXIgQTAgPSBBWzBdO1xuICAgIHZhciBBMSA9IEFbMV07XG4gICAgdmFyIEEyID0gQVsyXTtcbiAgICB2YXIgQTMgPSBBWzNdO1xuICAgIHZhciBBNCA9IEFbNF07XG4gICAgdmFyIEE1ID0gQVs1XTtcbiAgICB2YXIgQTYgPSBBWzZdO1xuICAgIHZhciBBNyA9IEFbN107XG4gICAgdmFyIEE4ID0gQVs4XTtcblxuICAgIHZhciBCMCA9IEJbMF07XG4gICAgdmFyIEIxID0gQlsxXTtcbiAgICB2YXIgQjIgPSBCWzJdO1xuICAgIHZhciBCMyA9IEJbM107XG4gICAgdmFyIEI0ID0gQls0XTtcbiAgICB2YXIgQjUgPSBCWzVdO1xuICAgIHZhciBCNiA9IEJbNl07XG4gICAgdmFyIEI3ID0gQls3XTtcbiAgICB2YXIgQjggPSBCWzhdO1xuXG4gICAgcmVzdWx0WzBdID0gQTAgKyBCMDtcbiAgICByZXN1bHRbMV0gPSBBMSArIEIxO1xuICAgIHJlc3VsdFsyXSA9IEEyICsgQjI7XG4gICAgcmVzdWx0WzNdID0gQTMgKyBCMztcbiAgICByZXN1bHRbNF0gPSBBNCArIEI0O1xuICAgIHJlc3VsdFs1XSA9IEE1ICsgQjU7XG4gICAgcmVzdWx0WzZdID0gQTYgKyBCNjtcbiAgICByZXN1bHRbN10gPSBBNyArIEI3O1xuICAgIHJlc3VsdFs4XSA9IEE4ICsgQjg7XG5cbiAgICByZXR1cm4gb3V0cHV0O1xufTtcblxuLyoqXG4gKiBTdWJ0cmFjdCB0aGUgcHJvdmlkZWQgTWF0MzMncy5cbiAqXG4gKiBAbWV0aG9kXG4gKlxuICogQHBhcmFtIHtNYXQzM30gbWF0cml4MSBUaGUgbGVmdCBNYXQzMy5cbiAqIEBwYXJhbSB7TWF0MzN9IG1hdHJpeDIgVGhlIHJpZ2h0IE1hdDMzLlxuICogQHBhcmFtIHtNYXQzM30gb3V0cHV0IE1hdDMzIGluIHdoaWNoIHRvIHBsYWNlIHRoZSByZXN1bHQuXG4gKlxuICogQHJldHVybiB7TWF0MzN9IFRoZSByZXN1bHQgb2YgdGhlIHN1YnRyYWN0aW9uLlxuICovXG5NYXQzMy5zdWJ0cmFjdCA9IGZ1bmN0aW9uIHN1YnRyYWN0KG1hdHJpeDEsIG1hdHJpeDIsIG91dHB1dCkge1xuICAgIHZhciBBID0gbWF0cml4MS52YWx1ZXM7XG4gICAgdmFyIEIgPSBtYXRyaXgyLnZhbHVlcztcbiAgICB2YXIgcmVzdWx0ID0gb3V0cHV0LnZhbHVlcztcblxuICAgIHZhciBBMCA9IEFbMF07XG4gICAgdmFyIEExID0gQVsxXTtcbiAgICB2YXIgQTIgPSBBWzJdO1xuICAgIHZhciBBMyA9IEFbM107XG4gICAgdmFyIEE0ID0gQVs0XTtcbiAgICB2YXIgQTUgPSBBWzVdO1xuICAgIHZhciBBNiA9IEFbNl07XG4gICAgdmFyIEE3ID0gQVs3XTtcbiAgICB2YXIgQTggPSBBWzhdO1xuXG4gICAgdmFyIEIwID0gQlswXTtcbiAgICB2YXIgQjEgPSBCWzFdO1xuICAgIHZhciBCMiA9IEJbMl07XG4gICAgdmFyIEIzID0gQlszXTtcbiAgICB2YXIgQjQgPSBCWzRdO1xuICAgIHZhciBCNSA9IEJbNV07XG4gICAgdmFyIEI2ID0gQls2XTtcbiAgICB2YXIgQjcgPSBCWzddO1xuICAgIHZhciBCOCA9IEJbOF07XG5cbiAgICByZXN1bHRbMF0gPSBBMCAtIEIwO1xuICAgIHJlc3VsdFsxXSA9IEExIC0gQjE7XG4gICAgcmVzdWx0WzJdID0gQTIgLSBCMjtcbiAgICByZXN1bHRbM10gPSBBMyAtIEIzO1xuICAgIHJlc3VsdFs0XSA9IEE0IC0gQjQ7XG4gICAgcmVzdWx0WzVdID0gQTUgLSBCNTtcbiAgICByZXN1bHRbNl0gPSBBNiAtIEI2O1xuICAgIHJlc3VsdFs3XSA9IEE3IC0gQjc7XG4gICAgcmVzdWx0WzhdID0gQTggLSBCODtcblxuICAgIHJldHVybiBvdXRwdXQ7XG59O1xuLyoqXG4gKiBNdWx0aXBseSB0aGUgcHJvdmlkZWQgTWF0MzMgTTIgd2l0aCB0aGlzIE1hdDMzLiAgUmVzdWx0IGlzICh0aGlzKSAqIChNMikuXG4gKlxuICogQG1ldGhvZFxuICogQHBhcmFtIHtNYXQzM30gbWF0cml4MSBUaGUgbGVmdCBNYXQzMy5cbiAqIEBwYXJhbSB7TWF0MzN9IG1hdHJpeDIgVGhlIHJpZ2h0IE1hdDMzLlxuICogQHBhcmFtIHtNYXQzM30gb3V0cHV0IE1hdDMzIGluIHdoaWNoIHRvIHBsYWNlIHRoZSByZXN1bHQuXG4gKlxuICogQHJldHVybiB7TWF0MzN9IHRoZSByZXN1bHQgb2YgdGhlIG11bHRpcGxpY2F0aW9uLlxuICovXG5NYXQzMy5tdWx0aXBseSA9IGZ1bmN0aW9uIG11bHRpcGx5KG1hdHJpeDEsIG1hdHJpeDIsIG91dHB1dCkge1xuICAgIHZhciBBID0gbWF0cml4MS52YWx1ZXM7XG4gICAgdmFyIEIgPSBtYXRyaXgyLnZhbHVlcztcbiAgICB2YXIgcmVzdWx0ID0gb3V0cHV0LnZhbHVlcztcblxuICAgIHZhciBBMCA9IEFbMF07XG4gICAgdmFyIEExID0gQVsxXTtcbiAgICB2YXIgQTIgPSBBWzJdO1xuICAgIHZhciBBMyA9IEFbM107XG4gICAgdmFyIEE0ID0gQVs0XTtcbiAgICB2YXIgQTUgPSBBWzVdO1xuICAgIHZhciBBNiA9IEFbNl07XG4gICAgdmFyIEE3ID0gQVs3XTtcbiAgICB2YXIgQTggPSBBWzhdO1xuXG4gICAgdmFyIEIwID0gQlswXTtcbiAgICB2YXIgQjEgPSBCWzFdO1xuICAgIHZhciBCMiA9IEJbMl07XG4gICAgdmFyIEIzID0gQlszXTtcbiAgICB2YXIgQjQgPSBCWzRdO1xuICAgIHZhciBCNSA9IEJbNV07XG4gICAgdmFyIEI2ID0gQls2XTtcbiAgICB2YXIgQjcgPSBCWzddO1xuICAgIHZhciBCOCA9IEJbOF07XG5cbiAgICByZXN1bHRbMF0gPSBBMCpCMCArIEExKkIzICsgQTIqQjY7XG4gICAgcmVzdWx0WzFdID0gQTAqQjEgKyBBMSpCNCArIEEyKkI3O1xuICAgIHJlc3VsdFsyXSA9IEEwKkIyICsgQTEqQjUgKyBBMipCODtcbiAgICByZXN1bHRbM10gPSBBMypCMCArIEE0KkIzICsgQTUqQjY7XG4gICAgcmVzdWx0WzRdID0gQTMqQjEgKyBBNCpCNCArIEE1KkI3O1xuICAgIHJlc3VsdFs1XSA9IEEzKkIyICsgQTQqQjUgKyBBNSpCODtcbiAgICByZXN1bHRbNl0gPSBBNipCMCArIEE3KkIzICsgQTgqQjY7XG4gICAgcmVzdWx0WzddID0gQTYqQjEgKyBBNypCNCArIEE4KkI3O1xuICAgIHJlc3VsdFs4XSA9IEE2KkIyICsgQTcqQjUgKyBBOCpCODtcblxuICAgIHJldHVybiBvdXRwdXQ7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1hdDMzO1xuIiwiLyoqXG4gKiBBIHJlYWxseSBzaW1wbGUgYW5kIGJhc2ljIDR4NCBtYXRyaXggaW1wbGVtZW50YXRpb24sIGNvbXBhdGlibGUgd2l0aCBDU1MuIFRyYW5zZm9ybSB0aGVtLCBhbmRcbiAqIGFwcGx5IHRoZSB0b1N0cmluZygpIG91dHB1dCB0byBhIG5vZGUncyB0cmFuc2Zvcm0gc3R5bGUuIERvbid0IGZvcmdldCBwZXJzcGVjdGl2ZSA6KVxuICpcbiAqIEJ5IFBldGVyIE5lZGVybG9mLCBodHRwczovL2dpdGh1Yi5jb20vcGV0ZXJuZWRcbiAqIExpY2Vuc2VkIHVuZGVyIE1JVCwgc2VlIGxpY2Vuc2UudHh0IG9yIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG4gKi9cblxuXHQgICAvLyBfICBfXyAgX18gIF9fICAgX19fICBfX19fXyAgXyAgIF8gIF9fICBfIFxcXFxcblx0ICAvLyB8IFxcLyB8fHwgIFxcLyAgfHwvICAgXFx8XyAgIF98fCB8X3wgfHx8IFxcLyB8IFxcXFxcblx0IC8vICAgXFwgIC8vIHwgfFxcL3wgfHwgIF8gIHwgfCB8IHx8ICBfICB8IFxcXFwgIC8gICBcXFxcXG5cdC8vICAgICBcXC8vICB8X3x8IHxffHxffCB8X3wgfF98IHx8X3wgfF98ICBcXFxcLyAgICAgXFxcXFxuXG5cdFwidXNlIHN0cmljdFwiO1xuXG5cdHZhciBJREVOVElUWSA9IFtcblx0XHQxLCAwLCAwLCAwLFxuXHRcdDAsIDEsIDAsIDAsXG5cdFx0MCwgMCwgMSwgMCxcblx0XHQwLCAwLCAwLCAxXG5cdF07XG5cblx0ZnVuY3Rpb24gbXVsdGlwbHkgKFxuXHRcdGEsIGIsIGMsIGQsIGUsIGYsIGcsIGgsIGksIGosIGssIGwsIG0sIG4sIG8sIHAsXG5cdFx0QSwgQiwgQywgRCwgRSwgRiwgRywgSCwgSSwgSiwgSywgTCwgTSwgTiwgTywgUFxuXHQpIHtcblx0XHRyZXR1cm4gW1xuXHRcdFx0YSAqIEEgKyBiICogRSArIGMgKiBJICsgZCAqIE0sXG5cdFx0XHRhICogQiArIGIgKiBGICsgYyAqIEogKyBkICogTixcblx0XHRcdGEgKiBDICsgYiAqIEcgKyBjICogSyArIGQgKiBPLFxuXHRcdFx0YSAqIEQgKyBiICogSCArIGMgKiBMICsgZCAqIFAsXG5cdFx0XHRlICogQSArIGYgKiBFICsgZyAqIEkgKyBoICogTSxcblx0XHRcdGUgKiBCICsgZiAqIEYgKyBnICogSiArIGggKiBOLFxuXHRcdFx0ZSAqIEMgKyBmICogRyArIGcgKiBLICsgaCAqIE8sXG5cdFx0XHRlICogRCArIGYgKiBIICsgZyAqIEwgKyBoICogUCxcblx0XHRcdGkgKiBBICsgaiAqIEUgKyBrICogSSArIGwgKiBNLFxuXHRcdFx0aSAqIEIgKyBqICogRiArIGsgKiBKICsgbCAqIE4sXG5cdFx0XHRpICogQyArIGogKiBHICsgayAqIEsgKyBsICogTyxcblx0XHRcdGkgKiBEICsgaiAqIEggKyBrICogTCArIGwgKiBQLFxuXHRcdFx0bSAqIEEgKyBuICogRSArIG8gKiBJICsgcCAqIE0sXG5cdFx0XHRtICogQiArIG4gKiBGICsgbyAqIEogKyBwICogTixcblx0XHRcdG0gKiBDICsgbiAqIEcgKyBvICogSyArIHAgKiBPLFxuXHRcdFx0bSAqIEQgKyBuICogSCArIG8gKiBMICsgcCAqIFBcblx0XHRdO1xuXHR9XG5cblx0dmFyIHNpbiA9IE1hdGguc2luO1xuXHR2YXIgY29zID0gTWF0aC5jb3M7XG5cblx0LyoqXG5cdCAqIE1hdHJpeFxuXHQgKlxuXHQgKi9cblxuXHR2YXIgTWF0cml4ID0gZnVuY3Rpb24gKGVudGl0aWVzKSB7XG5cdFx0dGhpcy5lbnRpdGllcyA9IGVudGl0aWVzIHx8IElERU5USVRZO1xuXHR9O1xuXG5cdE1hdHJpeC5wcm90b3R5cGUgPSB7XG5cdFx0bXVsdGlwbHk6IGZ1bmN0aW9uIChlbnRpdGllcykge1xuXHRcdFx0cmV0dXJuIG5ldyBNYXRyaXgoXG5cdFx0XHRcdG11bHRpcGx5LmFwcGx5KHdpbmRvdywgdGhpcy5lbnRpdGllcy5jb25jYXQoZW50aXRpZXMpKVxuXHRcdFx0KTtcblx0XHR9LFxuXG5cdFx0dHJhbnNmb3JtOiBmdW5jdGlvbiAobWF0cml4KSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5tdWx0aXBseShtYXRyaXguZW50aXRpZXMpO1xuXHRcdH0sXG5cblx0XHRzY2FsZTogZnVuY3Rpb24gKHMpIHtcblx0XHRcdHJldHVybiB0aGlzLm11bHRpcGx5KFtcblx0XHRcdFx0cywgMCwgMCwgMCxcblx0XHRcdFx0MCwgcywgMCwgMCxcblx0XHRcdFx0MCwgMCwgcywgMCxcblx0XHRcdFx0MCwgMCwgMCwgMVxuXHRcdFx0XSk7XG5cdFx0fSxcblxuXHRcdHJvdGF0ZVg6IGZ1bmN0aW9uIChhKSB7XG5cdFx0XHR2YXIgYyA9IGNvcyhhKTtcblx0XHRcdHZhciBzID0gc2luKGEpO1xuXHRcdFx0cmV0dXJuIHRoaXMubXVsdGlwbHkoW1xuXHRcdFx0XHQxLCAwLCAgMCwgMCxcblx0XHRcdFx0MCwgYywgLXMsIDAsXG5cdFx0XHRcdDAsIHMsICBjLCAwLFxuXHRcdFx0XHQwLCAwLCAgMCwgMVxuXHRcdFx0XSk7XG5cdFx0fSxcblxuXHRcdHJvdGF0ZVk6IGZ1bmN0aW9uIChhKSB7XG5cdFx0XHR2YXIgYyA9IGNvcyhhKTtcblx0XHRcdHZhciBzID0gc2luKGEpO1xuXHRcdFx0cmV0dXJuIHRoaXMubXVsdGlwbHkoW1xuXHRcdFx0XHQgYywgMCwgcywgMCxcblx0XHRcdFx0IDAsIDEsIDAsIDAsXG5cdFx0XHRcdC1zLCAwLCBjLCAwLFxuXHRcdFx0XHQgMCwgMCwgMCwgMVxuXHRcdFx0XSk7XG5cdFx0fSxcblxuXHRcdHJvdGF0ZVo6IGZ1bmN0aW9uIChhKSB7XG5cdFx0XHR2YXIgYyA9IGNvcyhhKTtcblx0XHRcdHZhciBzID0gc2luKGEpO1xuXHRcdFx0cmV0dXJuIHRoaXMubXVsdGlwbHkoW1xuXHRcdFx0XHRjLCAtcywgMCwgMCxcblx0XHRcdFx0cywgIGMsIDAsIDAsXG5cdFx0XHRcdDAsICAwLCAxLCAwLFxuXHRcdFx0XHQwLCAgMCwgMCwgMVxuXHRcdFx0XSk7XG5cdFx0fSxcblxuXHRcdHRyYW5zbGF0ZTogZnVuY3Rpb24gKHgsIHksIHopIHtcblx0XHRcdHJldHVybiB0aGlzLm11bHRpcGx5KFtcblx0XHRcdFx0MSwgMCwgMCwgMCxcblx0XHRcdFx0MCwgMSwgMCwgMCxcblx0XHRcdFx0MCwgMCwgMSwgMCxcblx0XHRcdFx0eCwgeSwgeiwgMVxuXHRcdFx0XSk7XG5cdFx0fSxcblxuXHRcdHRvU3RyaW5nOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4gJ21hdHJpeDNkKCcgKyB0aGlzLmVudGl0aWVzLmpvaW4oJywnKSArICcpJztcblx0XHR9XG5cdH07XG5cbm1vZHVsZS5leHBvcnRzID0gTWF0cml4O1xuIiwiLyoqXG4gKiBUaGUgTUlUIExpY2Vuc2UgKE1JVClcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUgRmFtb3VzIEluZHVzdHJpZXMgSW5jLlxuICpcbiAqIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbiAqIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbiAqIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbiAqIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbiAqIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuICogZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbiAqXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuICogYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4gKlxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuICogSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gKiBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbiAqIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbiAqIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4gKiBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4gKiBUSEUgU09GVFdBUkUuXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgc2luID0gTWF0aC5zaW47XG52YXIgY29zID0gTWF0aC5jb3M7XG52YXIgYXNpbiA9IE1hdGguYXNpbjtcbnZhciBhY29zID0gTWF0aC5hY29zO1xudmFyIGF0YW4yID0gTWF0aC5hdGFuMjtcbnZhciBzcXJ0ID0gTWF0aC5zcXJ0O1xuXG4vKipcbiAqIEEgdmVjdG9yLWxpa2Ugb2JqZWN0IHVzZWQgdG8gcmVwcmVzZW50IHJvdGF0aW9ucy4gSWYgdGhldGEgaXMgdGhlIGFuZ2xlIG9mXG4gKiByb3RhdGlvbiwgYW5kICh4JywgeScsIHonKSBpcyBhIG5vcm1hbGl6ZWQgdmVjdG9yIHJlcHJlc2VudGluZyB0aGUgYXhpcyBvZlxuICogcm90YXRpb24sIHRoZW4gdyA9IGNvcyh0aGV0YS8yKSwgeCA9IHNpbih0aGV0YS8yKSp4JywgeSA9IHNpbih0aGV0YS8yKSp5JyxcbiAqIGFuZCB6ID0gc2luKHRoZXRhLzIpKnonLlxuICpcbiAqIEBjbGFzcyBRdWF0ZXJuaW9uXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHcgVGhlIHcgY29tcG9uZW50LlxuICogQHBhcmFtIHtOdW1iZXJ9IHggVGhlIHggY29tcG9uZW50LlxuICogQHBhcmFtIHtOdW1iZXJ9IHkgVGhlIHkgY29tcG9uZW50LlxuICogQHBhcmFtIHtOdW1iZXJ9IHogVGhlIHogY29tcG9uZW50LlxuICovXG5mdW5jdGlvbiBRdWF0ZXJuaW9uKHcsIHgsIHksIHopIHtcbiAgICB0aGlzLncgPSB3IHx8IDE7XG4gICAgdGhpcy54ID0geCB8fCAwO1xuICAgIHRoaXMueSA9IHkgfHwgMDtcbiAgICB0aGlzLnogPSB6IHx8IDA7XG59XG5cbi8qKlxuICogTXVsdGlwbHkgdGhlIGN1cnJlbnQgUXVhdGVybmlvbiBieSBpbnB1dCBRdWF0ZXJuaW9uIHEuXG4gKiBMZWZ0LWhhbmRlZCBtdWx0aXBsaWNhdGlvbi5cbiAqXG4gKiBAbWV0aG9kXG4gKlxuICogQHBhcmFtIHtRdWF0ZXJuaW9ufSBxIFRoZSBRdWF0ZXJuaW9uIHRvIG11bHRpcGx5IGJ5IG9uIHRoZSByaWdodC5cbiAqXG4gKiBAcmV0dXJuIHtRdWF0ZXJuaW9ufSB0aGlzXG4gKi9cblF1YXRlcm5pb24ucHJvdG90eXBlLm11bHRpcGx5ID0gZnVuY3Rpb24gbXVsdGlwbHkocSkge1xuICAgIHZhciB4MSA9IHRoaXMueDtcbiAgICB2YXIgeTEgPSB0aGlzLnk7XG4gICAgdmFyIHoxID0gdGhpcy56O1xuICAgIHZhciB3MSA9IHRoaXMudztcbiAgICB2YXIgeDIgPSBxLng7XG4gICAgdmFyIHkyID0gcS55O1xuICAgIHZhciB6MiA9IHEuejtcbiAgICB2YXIgdzIgPSBxLncgfHwgMDtcblxuICAgIHRoaXMudyA9IHcxICogdzIgLSB4MSAqIHgyIC0geTEgKiB5MiAtIHoxICogejI7XG4gICAgdGhpcy54ID0geDEgKiB3MiArIHgyICogdzEgKyB5MiAqIHoxIC0geTEgKiB6MjtcbiAgICB0aGlzLnkgPSB5MSAqIHcyICsgeTIgKiB3MSArIHgxICogejIgLSB4MiAqIHoxO1xuICAgIHRoaXMueiA9IHoxICogdzIgKyB6MiAqIHcxICsgeDIgKiB5MSAtIHgxICogeTI7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIE11bHRpcGx5IHRoZSBjdXJyZW50IFF1YXRlcm5pb24gYnkgaW5wdXQgUXVhdGVybmlvbiBxIG9uIHRoZSBsZWZ0LCBpLmUuIHEgKiB0aGlzLlxuICogTGVmdC1oYW5kZWQgbXVsdGlwbGljYXRpb24uXG4gKlxuICogQG1ldGhvZFxuICpcbiAqIEBwYXJhbSB7UXVhdGVybmlvbn0gcSBUaGUgUXVhdGVybmlvbiB0byBtdWx0aXBseSBieSBvbiB0aGUgbGVmdC5cbiAqXG4gKiBAcmV0dXJuIHtRdWF0ZXJuaW9ufSB0aGlzXG4gKi9cblF1YXRlcm5pb24ucHJvdG90eXBlLmxlZnRNdWx0aXBseSA9IGZ1bmN0aW9uIGxlZnRNdWx0aXBseShxKSB7XG4gICAgdmFyIHgxID0gcS54O1xuICAgIHZhciB5MSA9IHEueTtcbiAgICB2YXIgejEgPSBxLno7XG4gICAgdmFyIHcxID0gcS53IHx8IDA7XG4gICAgdmFyIHgyID0gdGhpcy54O1xuICAgIHZhciB5MiA9IHRoaXMueTtcbiAgICB2YXIgejIgPSB0aGlzLno7XG4gICAgdmFyIHcyID0gdGhpcy53O1xuXG4gICAgdGhpcy53ID0gdzEqdzIgLSB4MSp4MiAtIHkxKnkyIC0gejEqejI7XG4gICAgdGhpcy54ID0geDEqdzIgKyB4Mip3MSArIHkyKnoxIC0geTEqejI7XG4gICAgdGhpcy55ID0geTEqdzIgKyB5Mip3MSArIHgxKnoyIC0geDIqejE7XG4gICAgdGhpcy56ID0gejEqdzIgKyB6Mip3MSArIHgyKnkxIC0geDEqeTI7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFwcGx5IHRoZSBjdXJyZW50IFF1YXRlcm5pb24gdG8gaW5wdXQgVmVjMyB2LCBhY2NvcmRpbmcgdG9cbiAqIHYnID0gfnEgKiB2ICogcS5cbiAqXG4gKiBAbWV0aG9kXG4gKlxuICogQHBhcmFtIHtWZWMzfSB2IFRoZSByZWZlcmVuY2UgVmVjMy5cbiAqIEBwYXJhbSB7VmVjM30gb3V0cHV0IFZlYzMgaW4gd2hpY2ggdG8gcGxhY2UgdGhlIHJlc3VsdC5cbiAqXG4gKiBAcmV0dXJuIHtWZWMzfSBUaGUgcm90YXRlZCB2ZXJzaW9uIG9mIHRoZSBWZWMzLlxuICovXG5RdWF0ZXJuaW9uLnByb3RvdHlwZS5yb3RhdGVWZWN0b3IgPSBmdW5jdGlvbiByb3RhdGVWZWN0b3Iodiwgb3V0cHV0KSB7XG4gICAgdmFyIGN3ID0gdGhpcy53O1xuICAgIHZhciBjeCA9IC10aGlzLng7XG4gICAgdmFyIGN5ID0gLXRoaXMueTtcbiAgICB2YXIgY3ogPSAtdGhpcy56O1xuXG4gICAgdmFyIHZ4ID0gdi54O1xuICAgIHZhciB2eSA9IHYueTtcbiAgICB2YXIgdnogPSB2Lno7XG5cbiAgICB2YXIgdHcgPSAtY3ggKiB2eCAtIGN5ICogdnkgLSBjeiAqIHZ6O1xuICAgIHZhciB0eCA9IHZ4ICogY3cgKyB2eSAqIGN6IC0gY3kgKiB2ejtcbiAgICB2YXIgdHkgPSB2eSAqIGN3ICsgY3ggKiB2eiAtIHZ4ICogY3o7XG4gICAgdmFyIHR6ID0gdnogKiBjdyArIHZ4ICogY3kgLSBjeCAqIHZ5O1xuXG4gICAgdmFyIHcgPSBjdztcbiAgICB2YXIgeCA9IC1jeDtcbiAgICB2YXIgeSA9IC1jeTtcbiAgICB2YXIgeiA9IC1jejtcblxuICAgIG91dHB1dC54ID0gdHggKiB3ICsgeCAqIHR3ICsgeSAqIHR6IC0gdHkgKiB6O1xuICAgIG91dHB1dC55ID0gdHkgKiB3ICsgeSAqIHR3ICsgdHggKiB6IC0geCAqIHR6O1xuICAgIG91dHB1dC56ID0gdHogKiB3ICsgeiAqIHR3ICsgeCAqIHR5IC0gdHggKiB5O1xuICAgIHJldHVybiBvdXRwdXQ7XG59O1xuXG4vKipcbiAqIEludmVydCB0aGUgY3VycmVudCBRdWF0ZXJuaW9uLlxuICpcbiAqIEBtZXRob2RcbiAqXG4gKiBAcmV0dXJuIHtRdWF0ZXJuaW9ufSB0aGlzXG4gKi9cblF1YXRlcm5pb24ucHJvdG90eXBlLmludmVydCA9IGZ1bmN0aW9uIGludmVydCgpIHtcbiAgICB0aGlzLncgPSAtdGhpcy53O1xuICAgIHRoaXMueCA9IC10aGlzLng7XG4gICAgdGhpcy55ID0gLXRoaXMueTtcbiAgICB0aGlzLnogPSAtdGhpcy56O1xuICAgIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBDb25qdWdhdGUgdGhlIGN1cnJlbnQgUXVhdGVybmlvbi5cbiAqXG4gKiBAbWV0aG9kXG4gKlxuICogQHJldHVybiB7UXVhdGVybmlvbn0gdGhpc1xuICovXG5RdWF0ZXJuaW9uLnByb3RvdHlwZS5jb25qdWdhdGUgPSBmdW5jdGlvbiBjb25qdWdhdGUoKSB7XG4gICAgdGhpcy54ID0gLXRoaXMueDtcbiAgICB0aGlzLnkgPSAtdGhpcy55O1xuICAgIHRoaXMueiA9IC10aGlzLno7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIENvbXB1dGUgdGhlIGxlbmd0aCAobm9ybSkgb2YgdGhlIGN1cnJlbnQgUXVhdGVybmlvbi5cbiAqXG4gKiBAbWV0aG9kXG4gKlxuICogQHJldHVybiB7TnVtYmVyfSBsZW5ndGggb2YgdGhlIFF1YXRlcm5pb25cbiAqL1xuUXVhdGVybmlvbi5wcm90b3R5cGUubGVuZ3RoID0gZnVuY3Rpb24gbGVuZ3RoKCkge1xuICAgIHZhciB3ID0gdGhpcy53O1xuICAgIHZhciB4ID0gdGhpcy54O1xuICAgIHZhciB5ID0gdGhpcy55O1xuICAgIHZhciB6ID0gdGhpcy56O1xuICAgIHJldHVybiBzcXJ0KHcgKiB3ICsgeCAqIHggKyB5ICogeSArIHogKiB6KTtcbn07XG5cbi8qKlxuICogQWx0ZXIgdGhlIGN1cnJlbnQgUXVhdGVybmlvbiB0byBiZSBvZiB1bml0IGxlbmd0aDtcbiAqXG4gKiBAbWV0aG9kXG4gKlxuICogQHJldHVybiB7UXVhdGVybmlvbn0gdGhpc1xuICovXG5RdWF0ZXJuaW9uLnByb3RvdHlwZS5ub3JtYWxpemUgPSBmdW5jdGlvbiBub3JtYWxpemUoKSB7XG4gICAgdmFyIHcgPSB0aGlzLnc7XG4gICAgdmFyIHggPSB0aGlzLng7XG4gICAgdmFyIHkgPSB0aGlzLnk7XG4gICAgdmFyIHogPSB0aGlzLno7XG4gICAgdmFyIGxlbmd0aCA9IHNxcnQodyAqIHcgKyB4ICogeCArIHkgKiB5ICsgeiAqIHopO1xuICAgIGlmIChsZW5ndGggPT09IDApIHJldHVybiB0aGlzO1xuICAgIGxlbmd0aCA9IDEgLyBsZW5ndGg7XG4gICAgdGhpcy53ICo9IGxlbmd0aDtcbiAgICB0aGlzLnggKj0gbGVuZ3RoO1xuICAgIHRoaXMueSAqPSBsZW5ndGg7XG4gICAgdGhpcy56ICo9IGxlbmd0aDtcbiAgICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2V0IHRoZSB3LCB4LCB5LCB6IGNvbXBvbmVudHMgb2YgdGhlIGN1cnJlbnQgUXVhdGVybmlvbi5cbiAqXG4gKiBAbWV0aG9kXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHcgVGhlIHcgY29tcG9uZW50LlxuICogQHBhcmFtIHtOdW1iZXJ9IHggVGhlIHggY29tcG9uZW50LlxuICogQHBhcmFtIHtOdW1iZXJ9IHkgVGhlIHkgY29tcG9uZW50LlxuICogQHBhcmFtIHtOdW1iZXJ9IHogVGhlIHogY29tcG9uZW50LlxuICpcbiAqIEByZXR1cm4ge1F1YXRlcm5pb259IHRoaXNcbiAqL1xuUXVhdGVybmlvbi5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gc2V0KHcsIHggLHksIHopIHtcbiAgICBpZiAodyAhPSBudWxsKSB0aGlzLncgPSB3O1xuICAgIGlmICh4ICE9IG51bGwpIHRoaXMueCA9IHg7XG4gICAgaWYgKHkgIT0gbnVsbCkgdGhpcy55ID0geTtcbiAgICBpZiAoeiAhPSBudWxsKSB0aGlzLnogPSB6O1xuICAgIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBDb3B5IGlucHV0IFF1YXRlcm5pb24gcSBvbnRvIHRoZSBjdXJyZW50IFF1YXRlcm5pb24uXG4gKlxuICogQG1ldGhvZFxuICpcbiAqIEBwYXJhbSB7UXVhdGVybmlvbn0gcSBUaGUgcmVmZXJlbmNlIFF1YXRlcm5pb24uXG4gKlxuICogQHJldHVybiB7UXVhdGVybmlvbn0gdGhpc1xuICovXG5RdWF0ZXJuaW9uLnByb3RvdHlwZS5jb3B5ID0gZnVuY3Rpb24gY29weShxKSB7XG4gICAgdGhpcy53ID0gcS53O1xuICAgIHRoaXMueCA9IHEueDtcbiAgICB0aGlzLnkgPSBxLnk7XG4gICAgdGhpcy56ID0gcS56O1xuICAgIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZXNldCB0aGUgY3VycmVudCBRdWF0ZXJuaW9uLlxuICpcbiAqIEBtZXRob2RcbiAqXG4gKiBAcmV0dXJuIHtRdWF0ZXJuaW9ufSB0aGlzXG4gKi9cblF1YXRlcm5pb24ucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gY2xlYXIoKSB7XG4gICAgdGhpcy53ID0gMTtcbiAgICB0aGlzLnggPSAwO1xuICAgIHRoaXMueSA9IDA7XG4gICAgdGhpcy56ID0gMDtcbiAgICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogVGhlIGRvdCBwcm9kdWN0LiBDYW4gYmUgdXNlZCB0byBkZXRlcm1pbmUgdGhlIGNvc2luZSBvZiB0aGUgYW5nbGUgYmV0d2VlblxuICogdGhlIHR3byByb3RhdGlvbnMsIGFzc3VtaW5nIGJvdGggUXVhdGVybmlvbnMgYXJlIG9mIHVuaXQgbGVuZ3RoLlxuICpcbiAqIEBtZXRob2RcbiAqXG4gKiBAcGFyYW0ge1F1YXRlcm5pb259IHEgVGhlIG90aGVyIFF1YXRlcm5pb24uXG4gKlxuICogQHJldHVybiB7TnVtYmVyfSB0aGUgcmVzdWx0aW5nIGRvdCBwcm9kdWN0XG4gKi9cblF1YXRlcm5pb24ucHJvdG90eXBlLmRvdCA9IGZ1bmN0aW9uIGRvdChxKSB7XG4gICAgcmV0dXJuIHRoaXMudyAqIHEudyArIHRoaXMueCAqIHEueCArIHRoaXMueSAqIHEueSArIHRoaXMueiAqIHEuejtcbn07XG5cbi8qKlxuICogU3BoZXJpY2FsIGxpbmVhciBpbnRlcnBvbGF0aW9uLlxuICpcbiAqIEBtZXRob2RcbiAqXG4gKiBAcGFyYW0ge1F1YXRlcm5pb259IHEgVGhlIGZpbmFsIG9yaWVudGF0aW9uLlxuICogQHBhcmFtIHtOdW1iZXJ9IHQgVGhlIHR3ZWVuIHBhcmFtZXRlci5cbiAqIEBwYXJhbSB7VmVjM30gb3V0cHV0IFZlYzMgaW4gd2hpY2ggdG8gcHV0IHRoZSByZXN1bHQuXG4gKlxuICogQHJldHVybiB7UXVhdGVybmlvbn0gVGhlIHF1YXRlcm5pb24gdGhlIHNsZXJwIHJlc3VsdHMgd2VyZSBzYXZlZCB0b1xuICovXG5RdWF0ZXJuaW9uLnByb3RvdHlwZS5zbGVycCA9IGZ1bmN0aW9uIHNsZXJwKHEsIHQsIG91dHB1dCkge1xuICAgIHZhciB3ID0gdGhpcy53O1xuICAgIHZhciB4ID0gdGhpcy54O1xuICAgIHZhciB5ID0gdGhpcy55O1xuICAgIHZhciB6ID0gdGhpcy56O1xuXG4gICAgdmFyIHF3ID0gcS53O1xuICAgIHZhciBxeCA9IHEueDtcbiAgICB2YXIgcXkgPSBxLnk7XG4gICAgdmFyIHF6ID0gcS56O1xuXG4gICAgdmFyIG9tZWdhO1xuICAgIHZhciBjb3NvbWVnYTtcbiAgICB2YXIgc2lub21lZ2E7XG4gICAgdmFyIHNjYWxlRnJvbTtcbiAgICB2YXIgc2NhbGVUbztcblxuICAgIGNvc29tZWdhID0gdyAqIHF3ICsgeCAqIHF4ICsgeSAqIHF5ICsgeiAqIHF6O1xuICAgIGlmICgoMS4wIC0gY29zb21lZ2EpID4gMWUtNSkge1xuICAgICAgICBvbWVnYSA9IGFjb3MoY29zb21lZ2EpO1xuICAgICAgICBzaW5vbWVnYSA9IHNpbihvbWVnYSk7XG4gICAgICAgIHNjYWxlRnJvbSA9IHNpbigoMS4wIC0gdCkgKiBvbWVnYSkgLyBzaW5vbWVnYTtcbiAgICAgICAgc2NhbGVUbyA9IHNpbih0ICogb21lZ2EpIC8gc2lub21lZ2E7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBzY2FsZUZyb20gPSAxLjAgLSB0O1xuICAgICAgICBzY2FsZVRvID0gdDtcbiAgICB9XG5cbiAgICBvdXRwdXQudyA9IHcgKiBzY2FsZUZyb20gKyBxdyAqIHNjYWxlVG87XG4gICAgb3V0cHV0LnggPSB4ICogc2NhbGVGcm9tICsgcXggKiBzY2FsZVRvO1xuICAgIG91dHB1dC55ID0geSAqIHNjYWxlRnJvbSArIHF5ICogc2NhbGVUbztcbiAgICBvdXRwdXQueiA9IHogKiBzY2FsZUZyb20gKyBxeiAqIHNjYWxlVG87XG5cbiAgICByZXR1cm4gb3V0cHV0O1xufTtcblxuLyoqXG4gKiBHZXQgdGhlIE1hdDMzIG1hdHJpeCBjb3JyZXNwb25kaW5nIHRvIHRoZSBjdXJyZW50IFF1YXRlcm5pb24uXG4gKlxuICogQG1ldGhvZFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvdXRwdXQgT2JqZWN0IHRvIHByb2Nlc3MgdGhlIFRyYW5zZm9ybSBtYXRyaXhcbiAqXG4gKiBAcmV0dXJuIHtBcnJheX0gdGhlIFF1YXRlcm5pb24gYXMgYSBUcmFuc2Zvcm0gbWF0cml4XG4gKi9cblF1YXRlcm5pb24ucHJvdG90eXBlLnRvTWF0cml4ID0gZnVuY3Rpb24gdG9NYXRyaXgob3V0cHV0KSB7XG4gICAgdmFyIHcgPSB0aGlzLnc7XG4gICAgdmFyIHggPSB0aGlzLng7XG4gICAgdmFyIHkgPSB0aGlzLnk7XG4gICAgdmFyIHogPSB0aGlzLno7XG5cbiAgICB2YXIgeHggPSB4Kng7XG4gICAgdmFyIHl5ID0geSp5O1xuICAgIHZhciB6eiA9IHoqejtcbiAgICB2YXIgeHkgPSB4Knk7XG4gICAgdmFyIHh6ID0geCp6O1xuICAgIHZhciB5eiA9IHkqejtcblxuICAgIHJldHVybiBvdXRwdXQuc2V0KFtcbiAgICAgICAgMSAtIDIgKiAoeXkgKyB6eiksIDIgKiAoeHkgLSB3KnopLCAyICogKHh6ICsgdyp5KSxcbiAgICAgICAgMiAqICh4eSArIHcqeiksIDEgLSAyICogKHh4ICsgenopLCAyICogKHl6IC0gdyp4KSxcbiAgICAgICAgMiAqICh4eiAtIHcqeSksIDIgKiAoeXogKyB3KngpLCAxIC0gMiAqICh4eCArIHl5KVxuICAgIF0pO1xufTtcblxuLyoqXG4gKiBUaGUgcm90YXRpb24gYW5nbGVzIGFib3V0IHRoZSB4LCB5LCBhbmQgeiBheGVzIGNvcnJlc3BvbmRpbmcgdG8gdGhlXG4gKiBjdXJyZW50IFF1YXRlcm5pb24sIHdoZW4gYXBwbGllZCBpbiB0aGUgWllYIG9yZGVyLlxuICpcbiAqIEBtZXRob2RcbiAqXG4gKiBAcGFyYW0ge1ZlYzN9IG91dHB1dCBWZWMzIGluIHdoaWNoIHRvIHB1dCB0aGUgcmVzdWx0LlxuICpcbiAqIEByZXR1cm4ge1ZlYzN9IHRoZSBWZWMzIHRoZSByZXN1bHQgd2FzIHN0b3JlZCBpblxuICovXG5RdWF0ZXJuaW9uLnByb3RvdHlwZS50b0V1bGVyID0gZnVuY3Rpb24gdG9FdWxlcihvdXRwdXQpIHtcbiAgICB2YXIgdyA9IHRoaXMudztcbiAgICB2YXIgeCA9IHRoaXMueDtcbiAgICB2YXIgeSA9IHRoaXMueTtcbiAgICB2YXIgeiA9IHRoaXMuejtcblxuICAgIHZhciB4eCA9IHggKiB4O1xuICAgIHZhciB5eSA9IHkgKiB5O1xuICAgIHZhciB6eiA9IHogKiB6O1xuXG4gICAgdmFyIHR5ID0gMiAqICh4ICogeiArIHkgKiB3KTtcbiAgICB0eSA9IHR5IDwgLTEgPyAtMSA6IHR5ID4gMSA/IDEgOiB0eTtcblxuICAgIG91dHB1dC54ID0gYXRhbjIoMiAqICh4ICogdyAtIHkgKiB6KSwgMSAtIDIgKiAoeHggKyB5eSkpO1xuICAgIG91dHB1dC55ID0gYXNpbih0eSk7XG4gICAgb3V0cHV0LnogPSBhdGFuMigyICogKHogKiB3IC0geCAqIHkpLCAxIC0gMiAqICh5eSArIHp6KSk7XG5cbiAgICByZXR1cm4gb3V0cHV0O1xufTtcblxuLyoqXG4gKiBUaGUgUXVhdGVybmlvbiBjb3JyZXNwb25kaW5nIHRvIHRoZSBFdWxlciBhbmdsZXMgeCwgeSwgYW5kIHosXG4gKiBhcHBsaWVkIGluIHRoZSBaWVggb3JkZXIuXG4gKlxuICogQG1ldGhvZFxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSB4IFRoZSBhbmdsZSBvZiByb3RhdGlvbiBhYm91dCB0aGUgeCBheGlzLlxuICogQHBhcmFtIHtOdW1iZXJ9IHkgVGhlIGFuZ2xlIG9mIHJvdGF0aW9uIGFib3V0IHRoZSB5IGF4aXMuXG4gKiBAcGFyYW0ge051bWJlcn0geiBUaGUgYW5nbGUgb2Ygcm90YXRpb24gYWJvdXQgdGhlIHogYXhpcy5cbiAqIEBwYXJhbSB7UXVhdGVybmlvbn0gb3V0cHV0IFF1YXRlcm5pb24gaW4gd2hpY2ggdG8gcHV0IHRoZSByZXN1bHQuXG4gKlxuICogQHJldHVybiB7UXVhdGVybmlvbn0gVGhlIGVxdWl2YWxlbnQgUXVhdGVybmlvbi5cbiAqL1xuUXVhdGVybmlvbi5wcm90b3R5cGUuZnJvbUV1bGVyID0gZnVuY3Rpb24gZnJvbUV1bGVyKHgsIHksIHopIHtcbiAgICB2YXIgaHggPSB4ICogMC41O1xuICAgIHZhciBoeSA9IHkgKiAwLjU7XG4gICAgdmFyIGh6ID0geiAqIDAuNTtcblxuICAgIHZhciBzeCA9IHNpbihoeCk7XG4gICAgdmFyIHN5ID0gc2luKGh5KTtcbiAgICB2YXIgc3ogPSBzaW4oaHopO1xuICAgIHZhciBjeCA9IGNvcyhoeCk7XG4gICAgdmFyIGN5ID0gY29zKGh5KTtcbiAgICB2YXIgY3ogPSBjb3MoaHopO1xuXG4gICAgdGhpcy53ID0gY3ggKiBjeSAqIGN6IC0gc3ggKiBzeSAqIHN6O1xuICAgIHRoaXMueCA9IHN4ICogY3kgKiBjeiArIGN4ICogc3kgKiBzejtcbiAgICB0aGlzLnkgPSBjeCAqIHN5ICogY3ogLSBzeCAqIGN5ICogc3o7XG4gICAgdGhpcy56ID0gY3ggKiBjeSAqIHN6ICsgc3ggKiBzeSAqIGN6O1xuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFsdGVyIHRoZSBjdXJyZW50IFF1YXRlcm5pb24gdG8gcmVmbGVjdCBhIHJvdGF0aW9uIG9mIGlucHV0IGFuZ2xlIGFib3V0XG4gKiBpbnB1dCBheGlzIHgsIHksIGFuZCB6LlxuICpcbiAqIEBtZXRob2RcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gYW5nbGUgVGhlIGFuZ2xlIG9mIHJvdGF0aW9uLlxuICogQHBhcmFtIHtWZWMzfSB4IFRoZSBheGlzIG9mIHJvdGF0aW9uLlxuICogQHBhcmFtIHtWZWMzfSB5IFRoZSBheGlzIG9mIHJvdGF0aW9uLlxuICogQHBhcmFtIHtWZWMzfSB6IFRoZSBheGlzIG9mIHJvdGF0aW9uLlxuICpcbiAqIEByZXR1cm4ge1F1YXRlcm5pb259IHRoaXNcbiAqL1xuUXVhdGVybmlvbi5wcm90b3R5cGUuZnJvbUFuZ2xlQXhpcyA9IGZ1bmN0aW9uIGZyb21BbmdsZUF4aXMoYW5nbGUsIHgsIHksIHopIHtcbiAgICB2YXIgbGVuID0gc3FydCh4ICogeCArIHkgKiB5ICsgeiAqIHopO1xuICAgIGlmIChsZW4gPT09IDApIHtcbiAgICAgICAgdGhpcy53ID0gMTtcbiAgICAgICAgdGhpcy54ID0gdGhpcy55ID0gdGhpcy56ID0gMDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGxlbiA9IDEgLyBsZW47XG4gICAgICAgIHZhciBoYWxmVGhldGEgPSBhbmdsZSAqIDAuNTtcbiAgICAgICAgdmFyIHMgPSBzaW4oaGFsZlRoZXRhKTtcbiAgICAgICAgdGhpcy53ID0gY29zKGhhbGZUaGV0YSk7XG4gICAgICAgIHRoaXMueCA9IHMgKiB4ICogbGVuO1xuICAgICAgICB0aGlzLnkgPSBzICogeSAqIGxlbjtcbiAgICAgICAgdGhpcy56ID0gcyAqIHogKiBsZW47XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBNdWx0aXBseSB0aGUgaW5wdXQgUXVhdGVybmlvbnMuXG4gKiBMZWZ0LWhhbmRlZCBjb29yZGluYXRlIHN5c3RlbSBtdWx0aXBsaWNhdGlvbi5cbiAqXG4gKiBAbWV0aG9kXG4gKlxuICogQHBhcmFtIHtRdWF0ZXJuaW9ufSBxMSBUaGUgbGVmdCBRdWF0ZXJuaW9uLlxuICogQHBhcmFtIHtRdWF0ZXJuaW9ufSBxMiBUaGUgcmlnaHQgUXVhdGVybmlvbi5cbiAqIEBwYXJhbSB7UXVhdGVybmlvbn0gb3V0cHV0IFF1YXRlcm5pb24gaW4gd2hpY2ggdG8gcGxhY2UgdGhlIHJlc3VsdC5cbiAqXG4gKiBAcmV0dXJuIHtRdWF0ZXJuaW9ufSBUaGUgcHJvZHVjdCBvZiBtdWx0aXBsaWNhdGlvbi5cbiAqL1xuUXVhdGVybmlvbi5tdWx0aXBseSA9IGZ1bmN0aW9uIG11bHRpcGx5KHExLCBxMiwgb3V0cHV0KSB7XG4gICAgdmFyIHcxID0gcTEudyB8fCAwO1xuICAgIHZhciB4MSA9IHExLng7XG4gICAgdmFyIHkxID0gcTEueTtcbiAgICB2YXIgejEgPSBxMS56O1xuXG4gICAgdmFyIHcyID0gcTIudyB8fCAwO1xuICAgIHZhciB4MiA9IHEyLng7XG4gICAgdmFyIHkyID0gcTIueTtcbiAgICB2YXIgejIgPSBxMi56O1xuXG4gICAgb3V0cHV0LncgPSB3MSAqIHcyIC0geDEgKiB4MiAtIHkxICogeTIgLSB6MSAqIHoyO1xuICAgIG91dHB1dC54ID0geDEgKiB3MiArIHgyICogdzEgKyB5MiAqIHoxIC0geTEgKiB6MjtcbiAgICBvdXRwdXQueSA9IHkxICogdzIgKyB5MiAqIHcxICsgeDEgKiB6MiAtIHgyICogejE7XG4gICAgb3V0cHV0LnogPSB6MSAqIHcyICsgejIgKiB3MSArIHgyICogeTEgLSB4MSAqIHkyO1xuICAgIHJldHVybiBvdXRwdXQ7XG59O1xuXG4vKipcbiAqIE5vcm1hbGl6ZSB0aGUgaW5wdXQgcXVhdGVybmlvbi5cbiAqXG4gKiBAbWV0aG9kXG4gKlxuICogQHBhcmFtIHtRdWF0ZXJuaW9ufSBxIFRoZSByZWZlcmVuY2UgUXVhdGVybmlvbi5cbiAqIEBwYXJhbSB7UXVhdGVybmlvbn0gb3V0cHV0IFF1YXRlcm5pb24gaW4gd2hpY2ggdG8gcGxhY2UgdGhlIHJlc3VsdC5cbiAqXG4gKiBAcmV0dXJuIHtRdWF0ZXJuaW9ufSBUaGUgbm9ybWFsaXplZCBxdWF0ZXJuaW9uLlxuICovXG5RdWF0ZXJuaW9uLm5vcm1hbGl6ZSA9IGZ1bmN0aW9uIG5vcm1hbGl6ZShxLCBvdXRwdXQpIHtcbiAgICB2YXIgdyA9IHEudztcbiAgICB2YXIgeCA9IHEueDtcbiAgICB2YXIgeSA9IHEueTtcbiAgICB2YXIgeiA9IHEuejtcbiAgICB2YXIgbGVuZ3RoID0gc3FydCh3ICogdyArIHggKiB4ICsgeSAqIHkgKyB6ICogeik7XG4gICAgaWYgKGxlbmd0aCA9PT0gMCkgcmV0dXJuIHRoaXM7XG4gICAgbGVuZ3RoID0gMSAvIGxlbmd0aDtcbiAgICBvdXRwdXQudyAqPSBsZW5ndGg7XG4gICAgb3V0cHV0LnggKj0gbGVuZ3RoO1xuICAgIG91dHB1dC55ICo9IGxlbmd0aDtcbiAgICBvdXRwdXQueiAqPSBsZW5ndGg7XG4gICAgcmV0dXJuIG91dHB1dDtcbn07XG5cbi8qKlxuICogVGhlIGNvbmp1Z2F0ZSBvZiB0aGUgaW5wdXQgUXVhdGVybmlvbi5cbiAqXG4gKiBAbWV0aG9kXG4gKlxuICogQHBhcmFtIHtRdWF0ZXJuaW9ufSBxIFRoZSByZWZlcmVuY2UgUXVhdGVybmlvbi5cbiAqIEBwYXJhbSB7UXVhdGVybmlvbn0gb3V0cHV0IFF1YXRlcm5pb24gaW4gd2hpY2ggdG8gcGxhY2UgdGhlIHJlc3VsdC5cbiAqXG4gKiBAcmV0dXJuIHtRdWF0ZXJuaW9ufSBUaGUgY29uanVnYXRlIFF1YXRlcm5pb24uXG4gKi9cblF1YXRlcm5pb24uY29uanVnYXRlID0gZnVuY3Rpb24gY29uanVnYXRlKHEsIG91dHB1dCkge1xuICAgIG91dHB1dC53ID0gcS53O1xuICAgIG91dHB1dC54ID0gLXEueDtcbiAgICBvdXRwdXQueSA9IC1xLnk7XG4gICAgb3V0cHV0LnogPSAtcS56O1xuICAgIHJldHVybiBvdXRwdXQ7XG59O1xuXG4vKipcbiAqIENsb25lIHRoZSBpbnB1dCBRdWF0ZXJuaW9uLlxuICpcbiAqIEBtZXRob2RcbiAqXG4gKiBAcGFyYW0ge1F1YXRlcm5pb259IHEgdGhlIHJlZmVyZW5jZSBRdWF0ZXJuaW9uLlxuICpcbiAqIEByZXR1cm4ge1F1YXRlcm5pb259IFRoZSBjbG9uZWQgUXVhdGVybmlvbi5cbiAqL1xuUXVhdGVybmlvbi5jbG9uZSA9IGZ1bmN0aW9uIGNsb25lKHEpIHtcbiAgICByZXR1cm4gbmV3IFF1YXRlcm5pb24ocS53LCBxLngsIHEueSwgcS56KTtcbn07XG5cbi8qKlxuICogVGhlIGRvdCBwcm9kdWN0IG9mIHRoZSB0d28gaW5wdXQgUXVhdGVybmlvbnMuXG4gKlxuICogQG1ldGhvZFxuICpcbiAqIEBwYXJhbSB7UXVhdGVybmlvbn0gcTEgVGhlIGxlZnQgUXVhdGVybmlvbi5cbiAqIEBwYXJhbSB7UXVhdGVybmlvbn0gcTIgVGhlIHJpZ2h0IFF1YXRlcm5pb24uXG4gKlxuICogQHJldHVybiB7TnVtYmVyfSBUaGUgZG90IHByb2R1Y3Qgb2YgdGhlIHR3byBRdWF0ZXJuaW9ucy5cbiAqL1xuUXVhdGVybmlvbi5kb3QgPSBmdW5jdGlvbiBkb3QocTEsIHEyKSB7XG4gICAgcmV0dXJuIHExLncgKiBxMi53ICsgcTEueCAqIHEyLnggKyBxMS55ICogcTIueSArIHExLnogKiBxMi56O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBRdWF0ZXJuaW9uO1xuIiwiLyoqXG4qIFJheVxuKlxuKiBBUEkgZm9yIHJheWNhc3RpbmcsIG5lY2Vzc2FyeSB0byBoYW5kbGUgRXZlbnRzIG9uIEdMIE1lc2hlcy5cbipcbiogYnkgU3RldmUgQmVsb3ZhcmljaFxuKiBMaWNlbnNlZCB1bmRlciBNSVQsIHNlZSBsaWNlbnNlLnR4dCBvciBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuKiovXG5cblxudmFyIFZlYzMgPSByZXF1aXJlKCcuL1ZlYzMnKTtcblxuXG52YXIgUmF5ID0gZnVuY3Rpb24gKCBvcmlnaW4sIGRpcmVjdGlvbiApIHtcblxuXHR0aGlzLm9yaWdpbiA9ICggb3JpZ2luICE9PSB1bmRlZmluZWQgKSA/ICBuZXcgVmVjMyhvcmlnaW5bMF0sb3JpZ2luWzFdLG9yaWdpblsyXSkgOiBuZXcgVmVjMygpO1xuXHR0aGlzLmRpcmVjdGlvbiA9ICggZGlyZWN0aW9uICE9PSB1bmRlZmluZWQgKSA/IG5ldyBWZWMzKGRpcmVjdGlvblswXSxkaXJlY3Rpb25bMV0sZGlyZWN0aW9uWzJdKSA6IG5ldyBWZWMzKCk7XG5cbn07XG5cblJheS5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gKCBvcmlnaW4sIGRpcmVjdGlvbiApIHtcblxuXHRcdHRoaXMub3JpZ2luLmNvcHkoIG9yaWdpbiApO1xuXHRcdHRoaXMuZGlyZWN0aW9uLmNvcHkoIGRpcmVjdGlvbiApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cbn07XG5cblJheS5wcm90b3R5cGUuY29weSA9IGZ1bmN0aW9uICggcmF5ICkge1xuXG5cdFx0dGhpcy5vcmlnaW4uY29weSggcmF5Lm9yaWdpbiApO1xuXHRcdHRoaXMuZGlyZWN0aW9uLmNvcHkoIHJheS5kaXJlY3Rpb24gKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG59O1xuXG5SYXkucHJvdG90eXBlLmF0ID0gIGZ1bmN0aW9uICggdCApIHtcblxuICAgIHZhciByZXN1bHQgPSBuZXcgVmVjMygpO1xuXG4gICAgcmV0dXJuIHJlc3VsdC5jb3B5KCB0aGlzLmRpcmVjdGlvbiApLnNjYWxlKCB0ICkuYWRkKCB0aGlzLm9yaWdpbiApO1xuXG59O1xuXG5cblJheS5wcm90b3R5cGUuaW50ZXJzZWN0U3BoZXJlID0gZnVuY3Rpb24gKGNlbnRlciwgcmFkaXVzKSB7XG5cblx0Ly8gZnJvbSBodHRwOi8vd3d3LnNjcmF0Y2hhcGl4ZWwuY29tL2xlc3NvbnMvM2QtYmFzaWMtbGVzc29ucy9sZXNzb24tNy1pbnRlcnNlY3Rpbmctc2ltcGxlLXNoYXBlcy9yYXktc3BoZXJlLWludGVyc2VjdGlvbi9cblxuXHR2YXIgdmVjID0gbmV3IFZlYzMoKTtcbiAgICB2YXIgYyA9IG5ldyBWZWMzKGNlbnRlclswXSxjZW50ZXJbMV0sY2VudGVyWzJdKTtcblxuXHR2ZWMuc3ViVmVjdG9ycyggYywgdGhpcy5vcmlnaW4gKTtcblxuXHR2YXIgdGNhID0gdmVjLmRvdCggdGhpcy5kaXJlY3Rpb24gKTtcblxuXHR2YXIgZDIgPSB2ZWMuZG90KCB2ZWMgKSAtIHRjYSAqIHRjYTtcblxuXHR2YXIgcmFkaXVzMiA9IHJhZGl1cyAqIHJhZGl1cztcblxuXHRpZiAoIGQyID4gcmFkaXVzMiApIHJldHVybiBudWxsO1xuXG5cdHZhciB0aGMgPSBNYXRoLnNxcnQoIHJhZGl1czIgLSBkMiApO1xuXG5cdC8vIHQwID0gZmlyc3QgaW50ZXJzZWN0IHBvaW50IC0gZW50cmFuY2Ugb24gZnJvbnQgb2Ygc3BoZXJlXG5cdHZhciB0MCA9IHRjYSAtIHRoYztcblxuXHQvLyB0MSA9IHNlY29uZCBpbnRlcnNlY3QgcG9pbnQgLSBleGl0IHBvaW50IG9uIGJhY2sgb2Ygc3BoZXJlXG5cdHZhciB0MSA9IHRjYSArIHRoYztcblxuXHQvLyB0ZXN0IHRvIHNlZSBpZiBib3RoIHQwIGFuZCB0MSBhcmUgYmVoaW5kIHRoZSByYXkgLSBpZiBzbywgcmV0dXJuIG51bGxcblx0aWYgKCB0MCA8IDAgJiYgdDEgPCAwICkgcmV0dXJuIG51bGw7XG5cblx0Ly8gdGVzdCB0byBzZWUgaWYgdDAgaXMgYmVoaW5kIHRoZSByYXk6XG5cdC8vIGlmIGl0IGlzLCB0aGUgcmF5IGlzIGluc2lkZSB0aGUgc3BoZXJlLCBzbyByZXR1cm4gdGhlIHNlY29uZCBleGl0IHBvaW50IHNjYWxlZCBieSB0MSxcblx0Ly8gaW4gb3JkZXIgdG8gYWx3YXlzIHJldHVybiBhbiBpbnRlcnNlY3QgcG9pbnQgdGhhdCBpcyBpbiBmcm9udCBvZiB0aGUgcmF5LlxuXHRpZiAoIHQwIDwgMCApIHJldHVybiB0aGlzLmF0KCB0MSApO1xuXG5cdC8vIGVsc2UgdDAgaXMgaW4gZnJvbnQgb2YgdGhlIHJheSwgc28gcmV0dXJuIHRoZSBmaXJzdCBjb2xsaXNpb24gcG9pbnQgc2NhbGVkIGJ5IHQwXG5cdHJldHVybiB0aGlzLmF0KCB0MCApO1xuXG59O1xuXG5SYXkucHJvdG90eXBlLmludGVyc2VjdEJveCA9IGZ1bmN0aW9uKGNlbnRlciwgc2l6ZSkge1xuXG4gICAgdmFyIHRtaW4sXG4gICAgICAgIHRtYXgsXG4gICAgICAgIHR5bWluLFxuICAgICAgICB0eW1heCxcbiAgICAgICAgdHptaW4sXG4gICAgICAgIHR6bWF4LFxuICAgICAgICBib3gsXG4gICAgICAgIG91dCxcbiAgICAgICAgaW52ZGlyeCA9IDEgLyB0aGlzLmRpcmVjdGlvbi54LFxuICAgICAgICBpbnZkaXJ5ID0gMSAvIHRoaXMuZGlyZWN0aW9uLnksXG4gICAgICAgIGludmRpcnogPSAxIC8gdGhpcy5kaXJlY3Rpb24uejtcblxuICAgIGJveCA9IHtcbiAgICAgICAgbWluOiB7XG4gICAgICAgICAgICB4OiBjZW50ZXJbMF0tKHNpemVbMF0vMiksXG4gICAgICAgICAgICB5OiBjZW50ZXJbMV0tKHNpemVbMV0vMiksXG4gICAgICAgICAgICB6OiBjZW50ZXJbMl0tKHNpemVbMl0vMilcbiAgICAgICAgfSxcbiAgICAgICAgbWF4OiB7XG4gICAgICAgICAgICB4OiBjZW50ZXJbMF0rKHNpemVbMF0vMiksXG4gICAgICAgICAgICB5OiBjZW50ZXJbMV0rKHNpemVbMV0vMiksXG4gICAgICAgICAgICB6OiBjZW50ZXJbMl0rKHNpemVbMl0vMilcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBpZiAoIGludmRpcnggPj0gMCApIHtcblxuICAgICAgICB0bWluID0gKCBib3gubWluLnggLSB0aGlzLm9yaWdpbi54ICkgKiBpbnZkaXJ4O1xuICAgICAgICB0bWF4ID0gKCBib3gubWF4LnggLSB0aGlzLm9yaWdpbi54ICkgKiBpbnZkaXJ4O1xuXG4gICAgfSBlbHNlIHtcblxuICAgICAgICB0bWluID0gKCBib3gubWF4LnggLSB0aGlzLm9yaWdpbi54ICkgKiBpbnZkaXJ4O1xuICAgICAgICB0bWF4ID0gKCBib3gubWluLnggLSB0aGlzLm9yaWdpbi54ICkgKiBpbnZkaXJ4O1xuICAgIH1cblxuICAgIGlmICggaW52ZGlyeSA+PSAwICkge1xuXG4gICAgICAgIHR5bWluID0gKCBib3gubWluLnkgLSB0aGlzLm9yaWdpbi55ICkgKiBpbnZkaXJ5O1xuICAgICAgICB0eW1heCA9ICggYm94Lm1heC55IC0gdGhpcy5vcmlnaW4ueSApICogaW52ZGlyeTtcblxuICAgIH0gZWxzZSB7XG5cbiAgICAgICAgdHltaW4gPSAoIGJveC5tYXgueSAtIHRoaXMub3JpZ2luLnkgKSAqIGludmRpcnk7XG4gICAgICAgIHR5bWF4ID0gKCBib3gubWluLnkgLSB0aGlzLm9yaWdpbi55ICkgKiBpbnZkaXJ5O1xuICAgIH1cblxuICAgIGlmICggKCB0bWluID4gdHltYXggKSB8fCAoIHR5bWluID4gdG1heCApICkgcmV0dXJuIG51bGw7XG5cbiAgICBpZiAoIHR5bWluID4gdG1pbiB8fCB0bWluICE9PSB0bWluICkgdG1pbiA9IHR5bWluO1xuXG4gICAgaWYgKCB0eW1heCA8IHRtYXggfHwgdG1heCAhPT0gdG1heCApIHRtYXggPSB0eW1heDtcblxuICAgIGlmICggaW52ZGlyeiA+PSAwICkge1xuXG4gICAgICAgIHR6bWluID0gKCBib3gubWluLnogLSB0aGlzLm9yaWdpbi56ICkgKiBpbnZkaXJ6O1xuICAgICAgICB0em1heCA9ICggYm94Lm1heC56IC0gdGhpcy5vcmlnaW4ueiApICogaW52ZGlyejtcblxuICAgIH0gZWxzZSB7XG5cbiAgICAgICAgdHptaW4gPSAoIGJveC5tYXgueiAtIHRoaXMub3JpZ2luLnogKSAqIGludmRpcno7XG4gICAgICAgIHR6bWF4ID0gKCBib3gubWluLnogLSB0aGlzLm9yaWdpbi56ICkgKiBpbnZkaXJ6O1xuICAgIH1cblxuICAgIGlmICggKCB0bWluID4gdHptYXggKSB8fCAoIHR6bWluID4gdG1heCApICkgcmV0dXJuIG51bGw7XG5cbiAgICBpZiAoIHR6bWluID4gdG1pbiB8fCB0bWluICE9PSB0bWluICkgdG1pbiA9IHR6bWluO1xuXG4gICAgaWYgKCB0em1heCA8IHRtYXggfHwgdG1heCAhPT0gdG1heCApIHRtYXggPSB0em1heDtcblxuXG4gICAgaWYgKCB0bWF4IDwgMCApIHJldHVybiBudWxsO1xuXG4gICAgb3V0ID0gdGhpcy5kaXJlY3Rpb24uc2NhbGUodG1pbiA+PSAwID8gdG1pbiA6IHRtYXgpO1xuICAgIHJldHVybiBvdXQuYWRkKG91dCwgdGhpcy5vcmlnaW4sIG91dCk7XG5cbn07XG5cblxuUmF5LnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbiAoIHJheSApIHtcblxuXHRcdHJldHVybiByYXkub3JpZ2luLmVxdWFscyggdGhpcy5vcmlnaW4gKSAmJiByYXkuZGlyZWN0aW9uLmVxdWFscyggdGhpcy5kaXJlY3Rpb24gKTtcblxufTtcblxuUmF5LnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uICgpIHtcblxuXHRcdHJldHVybiBuZXcgUmF5KCkuY29weSggdGhpcyApO1xuXG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gUmF5O1xuIiwiLyoqXG4gKiBUaGUgTUlUIExpY2Vuc2UgKE1JVClcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUgRmFtb3VzIEluZHVzdHJpZXMgSW5jLlxuICpcbiAqIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbiAqIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbiAqIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbiAqIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbiAqIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuICogZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbiAqXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuICogYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4gKlxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuICogSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gKiBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbiAqIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbiAqIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4gKiBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4gKiBUSEUgU09GVFdBUkUuXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEEgdHdvLWRpbWVuc2lvbmFsIHZlY3Rvci5cbiAqXG4gKiBAY2xhc3MgVmVjMlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSB4IFRoZSB4IGNvbXBvbmVudC5cbiAqIEBwYXJhbSB7TnVtYmVyfSB5IFRoZSB5IGNvbXBvbmVudC5cbiAqL1xudmFyIFZlYzIgPSBmdW5jdGlvbih4LCB5KSB7XG4gICAgaWYgKHggaW5zdGFuY2VvZiBBcnJheSB8fCB4IGluc3RhbmNlb2YgRmxvYXQzMkFycmF5KSB7XG4gICAgICAgIHRoaXMueCA9IHhbMF0gfHwgMDtcbiAgICAgICAgdGhpcy55ID0geFsxXSB8fCAwO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdGhpcy54ID0geCB8fCAwO1xuICAgICAgICB0aGlzLnkgPSB5IHx8IDA7XG4gICAgfVxufTtcblxuLyoqXG4gKiBTZXQgdGhlIGNvbXBvbmVudHMgb2YgdGhlIGN1cnJlbnQgVmVjMi5cbiAqXG4gKiBAbWV0aG9kXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHggVGhlIHggY29tcG9uZW50LlxuICogQHBhcmFtIHtOdW1iZXJ9IHkgVGhlIHkgY29tcG9uZW50LlxuICpcbiAqIEByZXR1cm4ge1ZlYzJ9IHRoaXNcbiAqL1xuVmVjMi5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gc2V0KHgsIHkpIHtcbiAgICBpZiAoeCAhPSBudWxsKSB0aGlzLnggPSB4O1xuICAgIGlmICh5ICE9IG51bGwpIHRoaXMueSA9IHk7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFkZCB0aGUgaW5wdXQgdiB0byB0aGUgY3VycmVudCBWZWMyLlxuICpcbiAqIEBtZXRob2RcbiAqXG4gKiBAcGFyYW0ge1ZlYzJ9IHYgVGhlIFZlYzIgdG8gYWRkLlxuICpcbiAqIEByZXR1cm4ge1ZlYzJ9IHRoaXNcbiAqL1xuVmVjMi5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gYWRkKHYpIHtcbiAgICB0aGlzLnggKz0gdi54O1xuICAgIHRoaXMueSArPSB2Lnk7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFN1YnRyYWN0IHRoZSBpbnB1dCB2IGZyb20gdGhlIGN1cnJlbnQgVmVjMi5cbiAqXG4gKiBAbWV0aG9kXG4gKlxuICogQHBhcmFtIHtWZWMyfSB2IFRoZSBWZWMyIHRvIHN1YnRyYWN0LlxuICpcbiAqIEByZXR1cm4ge1ZlYzJ9IHRoaXNcbiAqL1xuVmVjMi5wcm90b3R5cGUuc3VidHJhY3QgPSBmdW5jdGlvbiBzdWJ0cmFjdCh2KSB7XG4gICAgdGhpcy54IC09IHYueDtcbiAgICB0aGlzLnkgLT0gdi55O1xuICAgIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTY2FsZSB0aGUgY3VycmVudCBWZWMyIGJ5IGEgc2NhbGFyIG9yIFZlYzIuXG4gKlxuICogQG1ldGhvZFxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfFZlYzJ9IHMgVGhlIE51bWJlciBvciB2ZWMyIGJ5IHdoaWNoIHRvIHNjYWxlLlxuICpcbiAqIEByZXR1cm4ge1ZlYzJ9IHRoaXNcbiAqL1xuVmVjMi5wcm90b3R5cGUuc2NhbGUgPSBmdW5jdGlvbiBzY2FsZShzKSB7XG4gICAgaWYgKHMgaW5zdGFuY2VvZiBWZWMyKSB7XG4gICAgICAgIHRoaXMueCAqPSBzLng7XG4gICAgICAgIHRoaXMueSAqPSBzLnk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB0aGlzLnggKj0gcztcbiAgICAgICAgdGhpcy55ICo9IHM7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSb3RhdGUgdGhlIFZlYzIgY291bnRlci1jbG9ja3dpc2UgYnkgdGhldGEgYWJvdXQgdGhlIHotYXhpcy5cbiAqXG4gKiBAbWV0aG9kXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHRoZXRhIEFuZ2xlIGJ5IHdoaWNoIHRvIHJvdGF0ZS5cbiAqXG4gKiBAcmV0dXJuIHtWZWMyfSB0aGlzXG4gKi9cblZlYzIucHJvdG90eXBlLnJvdGF0ZSA9IGZ1bmN0aW9uKHRoZXRhKSB7XG4gICAgdmFyIHggPSB0aGlzLng7XG4gICAgdmFyIHkgPSB0aGlzLnk7XG5cbiAgICB2YXIgY29zVGhldGEgPSBNYXRoLmNvcyh0aGV0YSk7XG4gICAgdmFyIHNpblRoZXRhID0gTWF0aC5zaW4odGhldGEpO1xuXG4gICAgdGhpcy54ID0geCAqIGNvc1RoZXRhIC0geSAqIHNpblRoZXRhO1xuICAgIHRoaXMueSA9IHggKiBzaW5UaGV0YSArIHkgKiBjb3NUaGV0YTtcblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBUaGUgZG90IHByb2R1Y3Qgb2Ygb2YgdGhlIGN1cnJlbnQgVmVjMiB3aXRoIHRoZSBpbnB1dCBWZWMyLlxuICpcbiAqIEBtZXRob2RcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gdiBUaGUgb3RoZXIgVmVjMi5cbiAqXG4gKiBAcmV0dXJuIHtWZWMyfSB0aGlzXG4gKi9cblZlYzIucHJvdG90eXBlLmRvdCA9IGZ1bmN0aW9uKHYpIHtcbiAgICByZXR1cm4gdGhpcy54ICogdi54ICsgdGhpcy55ICogdi55O1xufTtcblxuLyoqXG4gKiBUaGUgY3Jvc3MgcHJvZHVjdCBvZiBvZiB0aGUgY3VycmVudCBWZWMyIHdpdGggdGhlIGlucHV0IFZlYzIuXG4gKlxuICogQG1ldGhvZFxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSB2IFRoZSBvdGhlciBWZWMyLlxuICpcbiAqIEByZXR1cm4ge1ZlYzJ9IHRoaXNcbiAqL1xuVmVjMi5wcm90b3R5cGUuY3Jvc3MgPSBmdW5jdGlvbih2KSB7XG4gICAgcmV0dXJuIHRoaXMueCAqIHYueSAtIHRoaXMueSAqIHYueDtcbn07XG5cbi8qKlxuICogUHJlc2VydmUgdGhlIG1hZ25pdHVkZSBidXQgaW52ZXJ0IHRoZSBvcmllbnRhdGlvbiBvZiB0aGUgY3VycmVudCBWZWMyLlxuICpcbiAqIEBtZXRob2RcbiAqXG4gKiBAcmV0dXJuIHtWZWMyfSB0aGlzXG4gKi9cblZlYzIucHJvdG90eXBlLmludmVydCA9IGZ1bmN0aW9uIGludmVydCgpIHtcbiAgICB0aGlzLnggKj0gLTE7XG4gICAgdGhpcy55ICo9IC0xO1xuICAgIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBBcHBseSBhIGZ1bmN0aW9uIGNvbXBvbmVudC13aXNlIHRvIHRoZSBjdXJyZW50IFZlYzIuXG4gKlxuICogQG1ldGhvZFxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIEZ1bmN0aW9uIHRvIGFwcGx5LlxuICpcbiAqIEByZXR1cm4ge1ZlYzJ9IHRoaXNcbiAqL1xuVmVjMi5wcm90b3R5cGUubWFwID0gZnVuY3Rpb24gbWFwKGZuKSB7XG4gICAgdGhpcy54ID0gZm4odGhpcy54KTtcbiAgICB0aGlzLnkgPSBmbih0aGlzLnkpO1xuICAgIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBHZXQgdGhlIG1hZ25pdHVkZSBvZiB0aGUgY3VycmVudCBWZWMyLlxuICpcbiAqIEBtZXRob2RcbiAqXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IHRoZSBsZW5ndGggb2YgdGhlIHZlY3RvclxuICovXG5WZWMyLnByb3RvdHlwZS5sZW5ndGggPSBmdW5jdGlvbiBsZW5ndGgoKSB7XG4gICAgdmFyIHggPSB0aGlzLng7XG4gICAgdmFyIHkgPSB0aGlzLnk7XG5cbiAgICByZXR1cm4gTWF0aC5zcXJ0KHggKiB4ICsgeSAqIHkpO1xufTtcblxuLyoqXG4gKiBDb3B5IHRoZSBpbnB1dCBvbnRvIHRoZSBjdXJyZW50IFZlYzIuXG4gKlxuICogQG1ldGhvZFxuICpcbiAqIEBwYXJhbSB7VmVjMn0gdiBWZWMyIHRvIGNvcHlcbiAqXG4gKiBAcmV0dXJuIHtWZWMyfSB0aGlzXG4gKi9cblZlYzIucHJvdG90eXBlLmNvcHkgPSBmdW5jdGlvbiBjb3B5KHYpIHtcbiAgICB0aGlzLnggPSB2Lng7XG4gICAgdGhpcy55ID0gdi55O1xuICAgIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZXNldCB0aGUgY3VycmVudCBWZWMyLlxuICpcbiAqIEBtZXRob2RcbiAqXG4gKiBAcmV0dXJuIHtWZWMyfSB0aGlzXG4gKi9cblZlYzIucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gY2xlYXIoKSB7XG4gICAgdGhpcy54ID0gMDtcbiAgICB0aGlzLnkgPSAwO1xuICAgIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBDaGVjayB3aGV0aGVyIHRoZSBtYWduaXR1ZGUgb2YgdGhlIGN1cnJlbnQgVmVjMiBpcyBleGFjdGx5IDAuXG4gKlxuICogQG1ldGhvZFxuICpcbiAqIEByZXR1cm4ge0Jvb2xlYW59IHdoZXRoZXIgb3Igbm90IHRoZSBsZW5ndGggaXMgMFxuICovXG5WZWMyLnByb3RvdHlwZS5pc1plcm8gPSBmdW5jdGlvbiBpc1plcm8oKSB7XG4gICAgaWYgKHRoaXMueCAhPT0gMCB8fCB0aGlzLnkgIT09IDApIHJldHVybiBmYWxzZTtcbiAgICBlbHNlIHJldHVybiB0cnVlO1xufTtcblxuLyoqXG4gKiBUaGUgYXJyYXkgZm9ybSBvZiB0aGUgY3VycmVudCBWZWMyLlxuICpcbiAqIEBtZXRob2RcbiAqXG4gKiBAcmV0dXJuIHtBcnJheX0gdGhlIFZlYyB0byBhcyBhbiBhcnJheVxuICovXG5WZWMyLnByb3RvdHlwZS50b0FycmF5ID0gZnVuY3Rpb24gdG9BcnJheSgpIHtcbiAgICByZXR1cm4gW3RoaXMueCwgdGhpcy55XTtcbn07XG5cbi8qKlxuICogTm9ybWFsaXplIHRoZSBpbnB1dCBWZWMyLlxuICpcbiAqIEBtZXRob2RcbiAqXG4gKiBAcGFyYW0ge1ZlYzJ9IHYgVGhlIHJlZmVyZW5jZSBWZWMyLlxuICogQHBhcmFtIHtWZWMyfSBvdXRwdXQgVmVjMiBpbiB3aGljaCB0byBwbGFjZSB0aGUgcmVzdWx0LlxuICpcbiAqIEByZXR1cm4ge1ZlYzJ9IFRoZSBub3JtYWxpemVkIFZlYzIuXG4gKi9cblZlYzIubm9ybWFsaXplID0gZnVuY3Rpb24gbm9ybWFsaXplKHYsIG91dHB1dCkge1xuICAgIHZhciB4ID0gdi54O1xuICAgIHZhciB5ID0gdi55O1xuXG4gICAgdmFyIGxlbmd0aCA9IE1hdGguc3FydCh4ICogeCArIHkgKiB5KSB8fCAxO1xuICAgIGxlbmd0aCA9IDEgLyBsZW5ndGg7XG4gICAgb3V0cHV0LnggPSB2LnggKiBsZW5ndGg7XG4gICAgb3V0cHV0LnkgPSB2LnkgKiBsZW5ndGg7XG5cbiAgICByZXR1cm4gb3V0cHV0O1xufTtcblxuLyoqXG4gKiBDbG9uZSB0aGUgaW5wdXQgVmVjMi5cbiAqXG4gKiBAbWV0aG9kXG4gKlxuICogQHBhcmFtIHtWZWMyfSB2IFRoZSBWZWMyIHRvIGNsb25lLlxuICpcbiAqIEByZXR1cm4ge1ZlYzJ9IFRoZSBjbG9uZWQgVmVjMi5cbiAqL1xuVmVjMi5jbG9uZSA9IGZ1bmN0aW9uIGNsb25lKHYpIHtcbiAgICByZXR1cm4gbmV3IFZlYzIodi54LCB2LnkpO1xufTtcblxuLyoqXG4gKiBBZGQgdGhlIGlucHV0IFZlYzIncy5cbiAqXG4gKiBAbWV0aG9kXG4gKlxuICogQHBhcmFtIHtWZWMyfSB2MSBUaGUgbGVmdCBWZWMyLlxuICogQHBhcmFtIHtWZWMyfSB2MiBUaGUgcmlnaHQgVmVjMi5cbiAqIEBwYXJhbSB7VmVjMn0gb3V0cHV0IFZlYzIgaW4gd2hpY2ggdG8gcGxhY2UgdGhlIHJlc3VsdC5cbiAqXG4gKiBAcmV0dXJuIHtWZWMyfSBUaGUgcmVzdWx0IG9mIHRoZSBhZGRpdGlvbi5cbiAqL1xuVmVjMi5hZGQgPSBmdW5jdGlvbiBhZGQodjEsIHYyLCBvdXRwdXQpIHtcbiAgICBvdXRwdXQueCA9IHYxLnggKyB2Mi54O1xuICAgIG91dHB1dC55ID0gdjEueSArIHYyLnk7XG5cbiAgICByZXR1cm4gb3V0cHV0O1xufTtcblxuLyoqXG4gKiBTdWJ0cmFjdCB0aGUgc2Vjb25kIFZlYzIgZnJvbSB0aGUgZmlyc3QuXG4gKlxuICogQG1ldGhvZFxuICpcbiAqIEBwYXJhbSB7VmVjMn0gdjEgVGhlIGxlZnQgVmVjMi5cbiAqIEBwYXJhbSB7VmVjMn0gdjIgVGhlIHJpZ2h0IFZlYzIuXG4gKiBAcGFyYW0ge1ZlYzJ9IG91dHB1dCBWZWMyIGluIHdoaWNoIHRvIHBsYWNlIHRoZSByZXN1bHQuXG4gKlxuICogQHJldHVybiB7VmVjMn0gVGhlIHJlc3VsdCBvZiB0aGUgc3VidHJhY3Rpb24uXG4gKi9cblZlYzIuc3VidHJhY3QgPSBmdW5jdGlvbiBzdWJ0cmFjdCh2MSwgdjIsIG91dHB1dCkge1xuICAgIG91dHB1dC54ID0gdjEueCAtIHYyLng7XG4gICAgb3V0cHV0LnkgPSB2MS55IC0gdjIueTtcbiAgICByZXR1cm4gb3V0cHV0O1xufTtcblxuLyoqXG4gKiBTY2FsZSB0aGUgaW5wdXQgVmVjMi5cbiAqXG4gKiBAbWV0aG9kXG4gKlxuICogQHBhcmFtIHtWZWMyfSB2IFRoZSByZWZlcmVuY2UgVmVjMi5cbiAqIEBwYXJhbSB7TnVtYmVyfSBzIE51bWJlciB0byBzY2FsZSBieS5cbiAqIEBwYXJhbSB7VmVjMn0gb3V0cHV0IFZlYzIgaW4gd2hpY2ggdG8gcGxhY2UgdGhlIHJlc3VsdC5cbiAqXG4gKiBAcmV0dXJuIHtWZWMyfSBUaGUgcmVzdWx0IG9mIHRoZSBzY2FsaW5nLlxuICovXG5WZWMyLnNjYWxlID0gZnVuY3Rpb24gc2NhbGUodiwgcywgb3V0cHV0KSB7XG4gICAgb3V0cHV0LnggPSB2LnggKiBzO1xuICAgIG91dHB1dC55ID0gdi55ICogcztcbiAgICByZXR1cm4gb3V0cHV0O1xufTtcblxuLyoqXG4gKiBUaGUgZG90IHByb2R1Y3Qgb2YgdGhlIGlucHV0IFZlYzIncy5cbiAqXG4gKiBAbWV0aG9kXG4gKlxuICogQHBhcmFtIHtWZWMyfSB2MSBUaGUgbGVmdCBWZWMyLlxuICogQHBhcmFtIHtWZWMyfSB2MiBUaGUgcmlnaHQgVmVjMi5cbiAqXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IFRoZSBkb3QgcHJvZHVjdC5cbiAqL1xuVmVjMi5kb3QgPSBmdW5jdGlvbiBkb3QodjEsIHYyKSB7XG4gICAgcmV0dXJuIHYxLnggKiB2Mi54ICsgdjEueSAqIHYyLnk7XG59O1xuXG4vKipcbiAqIFRoZSBjcm9zcyBwcm9kdWN0IG9mIHRoZSBpbnB1dCBWZWMyJ3MuXG4gKlxuICogQG1ldGhvZFxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSB2MSBUaGUgbGVmdCBWZWMyLlxuICogQHBhcmFtIHtOdW1iZXJ9IHYyIFRoZSByaWdodCBWZWMyLlxuICpcbiAqIEByZXR1cm4ge051bWJlcn0gVGhlIHotY29tcG9uZW50IG9mIHRoZSBjcm9zcyBwcm9kdWN0LlxuICovXG5WZWMyLmNyb3NzID0gZnVuY3Rpb24odjEsdjIpIHtcbiAgICByZXR1cm4gdjEueCAqIHYyLnkgLSB2MS55ICogdjIueDtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVmVjMjtcbiIsIi8qKlxuICogVGhlIE1JVCBMaWNlbnNlIChNSVQpXG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDE1IEZhbW91cyBJbmR1c3RyaWVzIEluYy5cbiAqXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4gKiBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4gKiBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4gKiB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4gKiBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbiAqIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4gKlxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbiAqIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuICpcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiAqIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuICogRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gKiBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4gKiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuICogT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuICogVEhFIFNPRlRXQVJFLlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBBIHRocmVlLWRpbWVuc2lvbmFsIHZlY3Rvci5cbiAqXG4gKiBAY2xhc3MgVmVjM1xuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSB4IFRoZSB4IGNvbXBvbmVudC5cbiAqIEBwYXJhbSB7TnVtYmVyfSB5IFRoZSB5IGNvbXBvbmVudC5cbiAqIEBwYXJhbSB7TnVtYmVyfSB6IFRoZSB6IGNvbXBvbmVudC5cbiAqL1xudmFyIFZlYzMgPSBmdW5jdGlvbih4LCB5LCB6KXtcbiAgICB0aGlzLnggPSB4IHx8IDA7XG4gICAgdGhpcy55ID0geSB8fCAwO1xuICAgIHRoaXMueiA9IHogfHwgMDtcbn07XG5cbi8qKlxuICogU2V0IHRoZSBjb21wb25lbnRzIG9mIHRoZSBjdXJyZW50IFZlYzMuXG4gKlxuICogQG1ldGhvZFxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSB4IFRoZSB4IGNvbXBvbmVudC5cbiAqIEBwYXJhbSB7TnVtYmVyfSB5IFRoZSB5IGNvbXBvbmVudC5cbiAqIEBwYXJhbSB7TnVtYmVyfSB6IFRoZSB6IGNvbXBvbmVudC5cbiAqXG4gKiBAcmV0dXJuIHtWZWMzfSB0aGlzXG4gKi9cblZlYzMucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uIHNldCh4LCB5LCB6KSB7XG4gICAgaWYgKHggIT0gbnVsbCkgdGhpcy54ID0geDtcbiAgICBpZiAoeSAhPSBudWxsKSB0aGlzLnkgPSB5O1xuICAgIGlmICh6ICE9IG51bGwpIHRoaXMueiA9IHo7XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQWRkIHRoZSBpbnB1dCB2IHRvIHRoZSBjdXJyZW50IFZlYzMuXG4gKlxuICogQG1ldGhvZFxuICpcbiAqIEBwYXJhbSB7VmVjM30gdiBUaGUgVmVjMyB0byBhZGQuXG4gKlxuICogQHJldHVybiB7VmVjM30gdGhpc1xuICovXG5WZWMzLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiBhZGQodikge1xuICAgIHRoaXMueCArPSB2Lng7XG4gICAgdGhpcy55ICs9IHYueTtcbiAgICB0aGlzLnogKz0gdi56O1xuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFN1YnRyYWN0IHRoZSBpbnB1dCB2IGZyb20gdGhlIGN1cnJlbnQgVmVjMy5cbiAqXG4gKiBAbWV0aG9kXG4gKlxuICogQHBhcmFtIHtWZWMzfSB2IFRoZSBWZWMzIHRvIHN1YnRyYWN0LlxuICpcbiAqIEByZXR1cm4ge1ZlYzN9IHRoaXNcbiAqL1xuVmVjMy5wcm90b3R5cGUuc3VidHJhY3QgPSBmdW5jdGlvbiBzdWJ0cmFjdCh2KSB7XG4gICAgdGhpcy54IC09IHYueDtcbiAgICB0aGlzLnkgLT0gdi55O1xuICAgIHRoaXMueiAtPSB2Lno7XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU3VidHJhY3QgdGhlIGlucHV0IGEgZnJvbSBiIGFuZCBjcmVhdGUgbmV3IHZlY3Rvci5cbiAqXG4gKiBAbWV0aG9kXG4gKlxuICogQHBhcmFtIHtWZWMzfSBhIFRoZSBWZWMzIHRvIHN1YnRyYWN0LlxuICogQHBhcmFtIHtWZWMzfSBiIFRoZSBWZWMzIHRvIHN1YnRyYWN0LlxuICpcbiAqIEByZXR1cm4ge1ZlYzN9IHRoaXNcbiAqL1xuVmVjMy5wcm90b3R5cGUuc3ViVmVjdG9ycyA9IGZ1bmN0aW9uICggYSwgYiApIHtcblxuXHR0aGlzLnggPSBhLnggLSBiLng7XG5cdHRoaXMueSA9IGEueSAtIGIueTtcblx0dGhpcy56ID0gYS56IC0gYi56O1xuXG5cdHJldHVybiB0aGlzO1xuXG59O1xuXG4vKipcbiAqIFJvdGF0ZSB0aGUgY3VycmVudCBWZWMzIGJ5IHRoZXRhIGNsb2Nrd2lzZSBhYm91dCB0aGUgeCBheGlzLlxuICpcbiAqIEBtZXRob2RcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gdGhldGEgQW5nbGUgYnkgd2hpY2ggdG8gcm90YXRlLlxuICpcbiAqIEByZXR1cm4ge1ZlYzN9IHRoaXNcbiAqL1xuVmVjMy5wcm90b3R5cGUucm90YXRlWCA9IGZ1bmN0aW9uIHJvdGF0ZVgodGhldGEpIHtcbiAgICB2YXIgeSA9IHRoaXMueTtcbiAgICB2YXIgeiA9IHRoaXMuejtcblxuICAgIHZhciBjb3NUaGV0YSA9IE1hdGguY29zKHRoZXRhKTtcbiAgICB2YXIgc2luVGhldGEgPSBNYXRoLnNpbih0aGV0YSk7XG5cbiAgICB0aGlzLnkgPSB5ICogY29zVGhldGEgLSB6ICogc2luVGhldGE7XG4gICAgdGhpcy56ID0geSAqIHNpblRoZXRhICsgeiAqIGNvc1RoZXRhO1xuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJvdGF0ZSB0aGUgY3VycmVudCBWZWMzIGJ5IHRoZXRhIGNsb2Nrd2lzZSBhYm91dCB0aGUgeSBheGlzLlxuICpcbiAqIEBtZXRob2RcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gdGhldGEgQW5nbGUgYnkgd2hpY2ggdG8gcm90YXRlLlxuICpcbiAqIEByZXR1cm4ge1ZlYzN9IHRoaXNcbiAqL1xuVmVjMy5wcm90b3R5cGUucm90YXRlWSA9IGZ1bmN0aW9uIHJvdGF0ZVkodGhldGEpIHtcbiAgICB2YXIgeCA9IHRoaXMueDtcbiAgICB2YXIgeiA9IHRoaXMuejtcblxuICAgIHZhciBjb3NUaGV0YSA9IE1hdGguY29zKHRoZXRhKTtcbiAgICB2YXIgc2luVGhldGEgPSBNYXRoLnNpbih0aGV0YSk7XG5cbiAgICB0aGlzLnggPSB6ICogc2luVGhldGEgKyB4ICogY29zVGhldGE7XG4gICAgdGhpcy56ID0geiAqIGNvc1RoZXRhIC0geCAqIHNpblRoZXRhO1xuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJvdGF0ZSB0aGUgY3VycmVudCBWZWMzIGJ5IHRoZXRhIGNsb2Nrd2lzZSBhYm91dCB0aGUgeiBheGlzLlxuICpcbiAqIEBtZXRob2RcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gdGhldGEgQW5nbGUgYnkgd2hpY2ggdG8gcm90YXRlLlxuICpcbiAqIEByZXR1cm4ge1ZlYzN9IHRoaXNcbiAqL1xuVmVjMy5wcm90b3R5cGUucm90YXRlWiA9IGZ1bmN0aW9uIHJvdGF0ZVoodGhldGEpIHtcbiAgICB2YXIgeCA9IHRoaXMueDtcbiAgICB2YXIgeSA9IHRoaXMueTtcblxuICAgIHZhciBjb3NUaGV0YSA9IE1hdGguY29zKHRoZXRhKTtcbiAgICB2YXIgc2luVGhldGEgPSBNYXRoLnNpbih0aGV0YSk7XG5cbiAgICB0aGlzLnggPSB4ICogY29zVGhldGEgLSB5ICogc2luVGhldGE7XG4gICAgdGhpcy55ID0geCAqIHNpblRoZXRhICsgeSAqIGNvc1RoZXRhO1xuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFRoZSBkb3QgcHJvZHVjdCBvZiB0aGUgY3VycmVudCBWZWMzIHdpdGggaW5wdXQgVmVjMyB2LlxuICpcbiAqIEBtZXRob2RcbiAqXG4gKiBAcGFyYW0ge1ZlYzN9IHYgVGhlIG90aGVyIFZlYzMuXG4gKlxuICogQHJldHVybiB7VmVjM30gdGhpc1xuICovXG5WZWMzLnByb3RvdHlwZS5kb3QgPSBmdW5jdGlvbiBkb3Qodikge1xuICAgIHJldHVybiB0aGlzLngqdi54ICsgdGhpcy55KnYueSArIHRoaXMueip2Lno7XG59O1xuXG4vKipcbiAqIFRoZSBkb3QgcHJvZHVjdCBvZiB0aGUgY3VycmVudCBWZWMzIHdpdGggaW5wdXQgVmVjMyB2LlxuICogU3RvcmVzIHRoZSByZXN1bHQgaW4gdGhlIGN1cnJlbnQgVmVjMy5cbiAqXG4gKiBAbWV0aG9kIGNyb3NzXG4gKlxuICogQHBhcmFtIHtWZWMzfSB2IFRoZSBvdGhlciBWZWMzXG4gKlxuICogQHJldHVybiB7VmVjM30gdGhpc1xuICovXG5WZWMzLnByb3RvdHlwZS5jcm9zcyA9IGZ1bmN0aW9uIGNyb3NzKHYpIHtcbiAgICB2YXIgeCA9IHRoaXMueDtcbiAgICB2YXIgeSA9IHRoaXMueTtcbiAgICB2YXIgeiA9IHRoaXMuejtcblxuICAgIHZhciB2eCA9IHYueDtcbiAgICB2YXIgdnkgPSB2Lnk7XG4gICAgdmFyIHZ6ID0gdi56O1xuXG4gICAgdGhpcy54ID0geSAqIHZ6IC0geiAqIHZ5O1xuICAgIHRoaXMueSA9IHogKiB2eCAtIHggKiB2ejtcbiAgICB0aGlzLnogPSB4ICogdnkgLSB5ICogdng7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNjYWxlIHRoZSBjdXJyZW50IFZlYzMgYnkgYSBzY2FsYXIuXG4gKlxuICogQG1ldGhvZFxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBzIFRoZSBOdW1iZXIgYnkgd2hpY2ggdG8gc2NhbGVcbiAqXG4gKiBAcmV0dXJuIHtWZWMzfSB0aGlzXG4gKi9cblZlYzMucHJvdG90eXBlLnNjYWxlID0gZnVuY3Rpb24gc2NhbGUocykge1xuICAgIHRoaXMueCAqPSBzO1xuICAgIHRoaXMueSAqPSBzO1xuICAgIHRoaXMueiAqPSBzO1xuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFByZXNlcnZlIHRoZSBtYWduaXR1ZGUgYnV0IGludmVydCB0aGUgb3JpZW50YXRpb24gb2YgdGhlIGN1cnJlbnQgVmVjMy5cbiAqXG4gKiBAbWV0aG9kXG4gKlxuICogQHJldHVybiB7VmVjM30gdGhpc1xuICovXG5WZWMzLnByb3RvdHlwZS5pbnZlcnQgPSBmdW5jdGlvbiBpbnZlcnQoKSB7XG4gICAgdGhpcy54ID0gLXRoaXMueDtcbiAgICB0aGlzLnkgPSAtdGhpcy55O1xuICAgIHRoaXMueiA9IC10aGlzLno7XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQXBwbHkgYSBmdW5jdGlvbiBjb21wb25lbnQtd2lzZSB0byB0aGUgY3VycmVudCBWZWMzLlxuICpcbiAqIEBtZXRob2RcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBGdW5jdGlvbiB0byBhcHBseS5cbiAqXG4gKiBAcmV0dXJuIHtWZWMzfSB0aGlzXG4gKi9cblZlYzMucHJvdG90eXBlLm1hcCA9IGZ1bmN0aW9uIG1hcChmbikge1xuICAgIHRoaXMueCA9IGZuKHRoaXMueCk7XG4gICAgdGhpcy55ID0gZm4odGhpcy55KTtcbiAgICB0aGlzLnogPSBmbih0aGlzLnopO1xuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFRoZSBtYWduaXR1ZGUgb2YgdGhlIGN1cnJlbnQgVmVjMy5cbiAqXG4gKiBAbWV0aG9kXG4gKlxuICogQHJldHVybiB7TnVtYmVyfSB0aGUgbWFnbml0dWRlIG9mIHRoZSBWZWMzXG4gKi9cblZlYzMucHJvdG90eXBlLmxlbmd0aCA9IGZ1bmN0aW9uIGxlbmd0aCgpIHtcbiAgICB2YXIgeCA9IHRoaXMueDtcbiAgICB2YXIgeSA9IHRoaXMueTtcbiAgICB2YXIgeiA9IHRoaXMuejtcblxuICAgIHJldHVybiBNYXRoLnNxcnQoeCAqIHggKyB5ICogeSArIHogKiB6KTtcbn07XG5cbi8qKlxuICogVGhlIG1hZ25pdHVkZSBzcXVhcmVkIG9mIHRoZSBjdXJyZW50IFZlYzMuXG4gKlxuICogQG1ldGhvZFxuICpcbiAqIEByZXR1cm4ge051bWJlcn0gbWFnbml0dWRlIG9mIHRoZSBWZWMzIHNxdWFyZWRcbiAqL1xuVmVjMy5wcm90b3R5cGUubGVuZ3RoU3EgPSBmdW5jdGlvbiBsZW5ndGhTcSgpIHtcbiAgICB2YXIgeCA9IHRoaXMueDtcbiAgICB2YXIgeSA9IHRoaXMueTtcbiAgICB2YXIgeiA9IHRoaXMuejtcblxuICAgIHJldHVybiB4ICogeCArIHkgKiB5ICsgeiAqIHo7XG59O1xuXG4vKipcbiAqIENvcHkgdGhlIGlucHV0IG9udG8gdGhlIGN1cnJlbnQgVmVjMy5cbiAqXG4gKiBAbWV0aG9kXG4gKlxuICogQHBhcmFtIHtWZWMzfSB2IFZlYzMgdG8gY29weVxuICpcbiAqIEByZXR1cm4ge1ZlYzN9IHRoaXNcbiAqL1xuVmVjMy5wcm90b3R5cGUuY29weSA9IGZ1bmN0aW9uIGNvcHkodikge1xuICAgIHRoaXMueCA9IHYueDtcbiAgICB0aGlzLnkgPSB2Lnk7XG4gICAgdGhpcy56ID0gdi56O1xuICAgIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZXNldCB0aGUgY3VycmVudCBWZWMzLlxuICpcbiAqIEBtZXRob2RcbiAqXG4gKiBAcmV0dXJuIHtWZWMzfSB0aGlzXG4gKi9cblZlYzMucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gY2xlYXIoKSB7XG4gICAgdGhpcy54ID0gMDtcbiAgICB0aGlzLnkgPSAwO1xuICAgIHRoaXMueiA9IDA7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIENoZWNrIHdoZXRoZXIgdGhlIG1hZ25pdHVkZSBvZiB0aGUgY3VycmVudCBWZWMzIGlzIGV4YWN0bHkgMC5cbiAqXG4gKiBAbWV0aG9kXG4gKlxuICogQHJldHVybiB7Qm9vbGVhbn0gd2hldGhlciBvciBub3QgdGhlIG1hZ25pdHVkZSBpcyB6ZXJvXG4gKi9cblZlYzMucHJvdG90eXBlLmlzWmVybyA9IGZ1bmN0aW9uIGlzWmVybygpIHtcbiAgICByZXR1cm4gdGhpcy54ID09PSAwICYmIHRoaXMueSA9PT0gMCAmJiB0aGlzLnogPT09IDA7XG59O1xuXG4vKipcbiAqIFRoZSBhcnJheSBmb3JtIG9mIHRoZSBjdXJyZW50IFZlYzMuXG4gKlxuICogQG1ldGhvZFxuICpcbiAqIEByZXR1cm4ge0FycmF5fSBhIHRocmVlIGVsZW1lbnQgYXJyYXkgcmVwcmVzZW50aW5nIHRoZSBjb21wb25lbnRzIG9mIHRoZSBWZWMzXG4gKi9cblZlYzMucHJvdG90eXBlLnRvQXJyYXkgPSBmdW5jdGlvbiB0b0FycmF5KCkge1xuICAgIHJldHVybiBbdGhpcy54LCB0aGlzLnksIHRoaXMuel07XG59O1xuXG4vKipcbiAqIFByZXNlcnZlIHRoZSBvcmllbnRhdGlvbiBidXQgY2hhbmdlIHRoZSBsZW5ndGggb2YgdGhlIGN1cnJlbnQgVmVjMyB0byAxLlxuICpcbiAqIEBtZXRob2RcbiAqXG4gKiBAcmV0dXJuIHtWZWMzfSB0aGlzXG4gKi9cblZlYzMucHJvdG90eXBlLm5vcm1hbGl6ZSA9IGZ1bmN0aW9uIG5vcm1hbGl6ZSgpIHtcbiAgICB2YXIgeCA9IHRoaXMueDtcbiAgICB2YXIgeSA9IHRoaXMueTtcbiAgICB2YXIgeiA9IHRoaXMuejtcblxuICAgIHZhciBsZW4gPSBNYXRoLnNxcnQoeCAqIHggKyB5ICogeSArIHogKiB6KSB8fCAxO1xuICAgIGxlbiA9IDEgLyBsZW47XG5cbiAgICB0aGlzLnggKj0gbGVuO1xuICAgIHRoaXMueSAqPSBsZW47XG4gICAgdGhpcy56ICo9IGxlbjtcbiAgICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQXBwbHkgdGhlIHJvdGF0aW9uIGNvcnJlc3BvbmRpbmcgdG8gdGhlIGlucHV0ICh1bml0KSBRdWF0ZXJuaW9uXG4gKiB0byB0aGUgY3VycmVudCBWZWMzLlxuICpcbiAqIEBtZXRob2RcbiAqXG4gKiBAcGFyYW0ge1F1YXRlcm5pb259IHEgVW5pdCBRdWF0ZXJuaW9uIHJlcHJlc2VudGluZyB0aGUgcm90YXRpb24gdG8gYXBwbHlcbiAqXG4gKiBAcmV0dXJuIHtWZWMzfSB0aGlzXG4gKi9cblZlYzMucHJvdG90eXBlLmFwcGx5Um90YXRpb24gPSBmdW5jdGlvbiBhcHBseVJvdGF0aW9uKHEpIHtcbiAgICB2YXIgY3cgPSBxLnc7XG4gICAgdmFyIGN4ID0gLXEueDtcbiAgICB2YXIgY3kgPSAtcS55O1xuICAgIHZhciBjeiA9IC1xLno7XG5cbiAgICB2YXIgdnggPSB0aGlzLng7XG4gICAgdmFyIHZ5ID0gdGhpcy55O1xuICAgIHZhciB2eiA9IHRoaXMuejtcblxuICAgIHZhciB0dyA9IC1jeCAqIHZ4IC0gY3kgKiB2eSAtIGN6ICogdno7XG4gICAgdmFyIHR4ID0gdnggKiBjdyArIHZ5ICogY3ogLSBjeSAqIHZ6O1xuICAgIHZhciB0eSA9IHZ5ICogY3cgKyBjeCAqIHZ6IC0gdnggKiBjejtcbiAgICB2YXIgdHogPSB2eiAqIGN3ICsgdnggKiBjeSAtIGN4ICogdnk7XG5cbiAgICB2YXIgdyA9IGN3O1xuICAgIHZhciB4ID0gLWN4O1xuICAgIHZhciB5ID0gLWN5O1xuICAgIHZhciB6ID0gLWN6O1xuXG4gICAgdGhpcy54ID0gdHggKiB3ICsgeCAqIHR3ICsgeSAqIHR6IC0gdHkgKiB6O1xuICAgIHRoaXMueSA9IHR5ICogdyArIHkgKiB0dyArIHR4ICogeiAtIHggKiB0ejtcbiAgICB0aGlzLnogPSB0eiAqIHcgKyB6ICogdHcgKyB4ICogdHkgLSB0eCAqIHk7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFwcGx5IHRoZSBpbnB1dCBNYXQzMyB0aGUgdGhlIGN1cnJlbnQgVmVjMy5cbiAqXG4gKiBAbWV0aG9kXG4gKlxuICogQHBhcmFtIHtNYXQzM30gbWF0cml4IE1hdDMzIHRvIGFwcGx5XG4gKlxuICogQHJldHVybiB7VmVjM30gdGhpc1xuICovXG5WZWMzLnByb3RvdHlwZS5hcHBseU1hdHJpeCA9IGZ1bmN0aW9uIGFwcGx5TWF0cml4KG1hdHJpeCkge1xuICAgIHZhciBNID0gbWF0cml4LmdldCgpO1xuXG4gICAgdmFyIHggPSB0aGlzLng7XG4gICAgdmFyIHkgPSB0aGlzLnk7XG4gICAgdmFyIHogPSB0aGlzLno7XG5cbiAgICB0aGlzLnggPSBNWzBdKnggKyBNWzFdKnkgKyBNWzJdKno7XG4gICAgdGhpcy55ID0gTVszXSp4ICsgTVs0XSp5ICsgTVs1XSp6O1xuICAgIHRoaXMueiA9IE1bNl0qeCArIE1bN10qeSArIE1bOF0qejtcbiAgICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogTm9ybWFsaXplIHRoZSBpbnB1dCBWZWMzLlxuICpcbiAqIEBtZXRob2RcbiAqXG4gKiBAcGFyYW0ge1ZlYzN9IHYgVGhlIHJlZmVyZW5jZSBWZWMzLlxuICogQHBhcmFtIHtWZWMzfSBvdXRwdXQgVmVjMyBpbiB3aGljaCB0byBwbGFjZSB0aGUgcmVzdWx0LlxuICpcbiAqIEByZXR1cm4ge1ZlYzN9IFRoZSBub3JtYWxpemUgVmVjMy5cbiAqL1xuVmVjMy5ub3JtYWxpemUgPSBmdW5jdGlvbiBub3JtYWxpemUodiwgb3V0cHV0KSB7XG4gICAgdmFyIHggPSB2Lng7XG4gICAgdmFyIHkgPSB2Lnk7XG4gICAgdmFyIHogPSB2Lno7XG5cbiAgICB2YXIgbGVuZ3RoID0gTWF0aC5zcXJ0KHggKiB4ICsgeSAqIHkgKyB6ICogeikgfHwgMTtcbiAgICBsZW5ndGggPSAxIC8gbGVuZ3RoO1xuXG4gICAgb3V0cHV0LnggPSB4ICogbGVuZ3RoO1xuICAgIG91dHB1dC55ID0geSAqIGxlbmd0aDtcbiAgICBvdXRwdXQueiA9IHogKiBsZW5ndGg7XG4gICAgcmV0dXJuIG91dHB1dDtcbn07XG5cbi8qKlxuICogQXBwbHkgYSByb3RhdGlvbiB0byB0aGUgaW5wdXQgVmVjMy5cbiAqXG4gKiBAbWV0aG9kXG4gKlxuICogQHBhcmFtIHtWZWMzfSB2IFRoZSByZWZlcmVuY2UgVmVjMy5cbiAqIEBwYXJhbSB7UXVhdGVybmlvbn0gcSBVbml0IFF1YXRlcm5pb24gcmVwcmVzZW50aW5nIHRoZSByb3RhdGlvbiB0byBhcHBseS5cbiAqIEBwYXJhbSB7VmVjM30gb3V0cHV0IFZlYzMgaW4gd2hpY2ggdG8gcGxhY2UgdGhlIHJlc3VsdC5cbiAqXG4gKiBAcmV0dXJuIHtWZWMzfSBUaGUgcm90YXRlZCB2ZXJzaW9uIG9mIHRoZSBpbnB1dCBWZWMzLlxuICovXG5WZWMzLmFwcGx5Um90YXRpb24gPSBmdW5jdGlvbiBhcHBseVJvdGF0aW9uKHYsIHEsIG91dHB1dCkge1xuICAgIHZhciBjdyA9IHEudztcbiAgICB2YXIgY3ggPSAtcS54O1xuICAgIHZhciBjeSA9IC1xLnk7XG4gICAgdmFyIGN6ID0gLXEuejtcblxuICAgIHZhciB2eCA9IHYueDtcbiAgICB2YXIgdnkgPSB2Lnk7XG4gICAgdmFyIHZ6ID0gdi56O1xuXG4gICAgdmFyIHR3ID0gLWN4ICogdnggLSBjeSAqIHZ5IC0gY3ogKiB2ejtcbiAgICB2YXIgdHggPSB2eCAqIGN3ICsgdnkgKiBjeiAtIGN5ICogdno7XG4gICAgdmFyIHR5ID0gdnkgKiBjdyArIGN4ICogdnogLSB2eCAqIGN6O1xuICAgIHZhciB0eiA9IHZ6ICogY3cgKyB2eCAqIGN5IC0gY3ggKiB2eTtcblxuICAgIHZhciB3ID0gY3c7XG4gICAgdmFyIHggPSAtY3g7XG4gICAgdmFyIHkgPSAtY3k7XG4gICAgdmFyIHogPSAtY3o7XG5cbiAgICBvdXRwdXQueCA9IHR4ICogdyArIHggKiB0dyArIHkgKiB0eiAtIHR5ICogejtcbiAgICBvdXRwdXQueSA9IHR5ICogdyArIHkgKiB0dyArIHR4ICogeiAtIHggKiB0ejtcbiAgICBvdXRwdXQueiA9IHR6ICogdyArIHogKiB0dyArIHggKiB0eSAtIHR4ICogeTtcbiAgICByZXR1cm4gb3V0cHV0O1xufTtcblxuLyoqXG4gKiBDbG9uZSB0aGUgaW5wdXQgVmVjMy5cbiAqXG4gKiBAbWV0aG9kXG4gKlxuICogQHBhcmFtIHtWZWMzfSB2IFRoZSBWZWMzIHRvIGNsb25lLlxuICpcbiAqIEByZXR1cm4ge1ZlYzN9IFRoZSBjbG9uZWQgVmVjMy5cbiAqL1xuVmVjMy5jbG9uZSA9IGZ1bmN0aW9uIGNsb25lKHYpIHtcbiAgICByZXR1cm4gbmV3IFZlYzModi54LCB2LnksIHYueik7XG59O1xuXG4vKipcbiAqIEFkZCB0aGUgaW5wdXQgVmVjMydzLlxuICpcbiAqIEBtZXRob2RcbiAqXG4gKiBAcGFyYW0ge1ZlYzN9IHYxIFRoZSBsZWZ0IFZlYzMuXG4gKiBAcGFyYW0ge1ZlYzN9IHYyIFRoZSByaWdodCBWZWMzLlxuICogQHBhcmFtIHtWZWMzfSBvdXRwdXQgVmVjMyBpbiB3aGljaCB0byBwbGFjZSB0aGUgcmVzdWx0LlxuICpcbiAqIEByZXR1cm4ge1ZlYzN9IFRoZSByZXN1bHQgb2YgdGhlIGFkZGl0aW9uLlxuICovXG5WZWMzLmFkZCA9IGZ1bmN0aW9uIGFkZCh2MSwgdjIsIG91dHB1dCkge1xuICAgIG91dHB1dC54ID0gdjEueCArIHYyLng7XG4gICAgb3V0cHV0LnkgPSB2MS55ICsgdjIueTtcbiAgICBvdXRwdXQueiA9IHYxLnogKyB2Mi56O1xuICAgIHJldHVybiBvdXRwdXQ7XG59O1xuXG4vKipcbiAqIFN1YnRyYWN0IHRoZSBzZWNvbmQgVmVjMyBmcm9tIHRoZSBmaXJzdC5cbiAqXG4gKiBAbWV0aG9kXG4gKlxuICogQHBhcmFtIHtWZWMzfSB2MSBUaGUgbGVmdCBWZWMzLlxuICogQHBhcmFtIHtWZWMzfSB2MiBUaGUgcmlnaHQgVmVjMy5cbiAqIEBwYXJhbSB7VmVjM30gb3V0cHV0IFZlYzMgaW4gd2hpY2ggdG8gcGxhY2UgdGhlIHJlc3VsdC5cbiAqXG4gKiBAcmV0dXJuIHtWZWMzfSBUaGUgcmVzdWx0IG9mIHRoZSBzdWJ0cmFjdGlvbi5cbiAqL1xuVmVjMy5zdWJ0cmFjdCA9IGZ1bmN0aW9uIHN1YnRyYWN0KHYxLCB2Miwgb3V0cHV0KSB7XG4gICAgb3V0cHV0LnggPSB2MS54IC0gdjIueDtcbiAgICBvdXRwdXQueSA9IHYxLnkgLSB2Mi55O1xuICAgIG91dHB1dC56ID0gdjEueiAtIHYyLno7XG4gICAgcmV0dXJuIG91dHB1dDtcbn07XG5cbi8qKlxuICogU2NhbGUgdGhlIGlucHV0IFZlYzMuXG4gKlxuICogQG1ldGhvZFxuICpcbiAqIEBwYXJhbSB7VmVjM30gdiBUaGUgcmVmZXJlbmNlIFZlYzMuXG4gKiBAcGFyYW0ge051bWJlcn0gcyBOdW1iZXIgdG8gc2NhbGUgYnkuXG4gKiBAcGFyYW0ge1ZlYzN9IG91dHB1dCBWZWMzIGluIHdoaWNoIHRvIHBsYWNlIHRoZSByZXN1bHQuXG4gKlxuICogQHJldHVybiB7VmVjM30gVGhlIHJlc3VsdCBvZiB0aGUgc2NhbGluZy5cbiAqL1xuVmVjMy5zY2FsZSA9IGZ1bmN0aW9uIHNjYWxlKHYsIHMsIG91dHB1dCkge1xuICAgIG91dHB1dC54ID0gdi54ICogcztcbiAgICBvdXRwdXQueSA9IHYueSAqIHM7XG4gICAgb3V0cHV0LnogPSB2LnogKiBzO1xuICAgIHJldHVybiBvdXRwdXQ7XG59O1xuXG4vKipcbiAqIFNjYWxlIGFuZCBhZGQgdGhlIGlucHV0IFZlYzMuXG4gKlxuICogQG1ldGhvZFxuICpcbiAqIEBwYXJhbSB7VmVjM30gdiBUaGUgcmVmZXJlbmNlIFZlYzMuXG4gKiBAcGFyYW0ge051bWJlcn0gcyBOdW1iZXIgdG8gc2NhbGUgYnkuXG4gKiBAcGFyYW0ge1ZlYzN9IG91dHB1dCBWZWMzIGluIHdoaWNoIHRvIHBsYWNlIHRoZSByZXN1bHQuXG4gKlxuICogQHJldHVybiB7VmVjM30gVGhlIHJlc3VsdCBvZiB0aGUgc2NhbGluZy5cbiAqL1xuVmVjMy5wcm90b3R5cGUuc2NhbGVBbmRBZGQgPSBmdW5jdGlvbiBzY2FsZUFuZEFkZChhLCBiLCBzKSB7XG4gICAgdGhpcy54ID0gYS54ICsgKGIueCAqIHMpO1xuICAgIHRoaXMueSA9IGEueSArIChiLnkgKiBzKTtcbiAgICB0aGlzLnogPSBhLnogKyAoYi56ICogcyk7XG59O1xuXG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBldWNsaWRpYW4gZGlzdGFuY2UgYmV0d2VlbiB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBzcXVhcmVkIGRpc3RhbmNlIGJldHdlZW4gYSBhbmQgYlxuICovXG5WZWMzLnByb3RvdHlwZS5zcXVhcmVkRGlzdGFuY2UgPSBmdW5jdGlvbiBzcXVhcmVkRGlzdGFuY2UoYikge1xuICAgIHZhciB4ID0gYi54IC0gdGhpcy54LFxuICAgICAgICB5ID0gYi55IC0gdGhpcy55LFxuICAgICAgICB6ID0gYi56IC0gdGhpcy56O1xuICAgIHJldHVybiB4KnggKyB5KnkgKyB6Knpcbn07XG5cblZlYzMucHJvdG90eXBlLmRpc3RhbmNlVG8gPSBmdW5jdGlvbiAoIHYgKSB7XG5cbiAgICByZXR1cm4gTWF0aC5zcXJ0KCB0aGlzLnNxdWFyZWREaXN0YW5jZSggdiApICk7XG5cbn07XG5cbi8qKlxuICogVGhlIGRvdCBwcm9kdWN0IG9mIHRoZSBpbnB1dCBWZWMzJ3MuXG4gKlxuICogQG1ldGhvZFxuICpcbiAqIEBwYXJhbSB7VmVjM30gdjEgVGhlIGxlZnQgVmVjMy5cbiAqIEBwYXJhbSB7VmVjM30gdjIgVGhlIHJpZ2h0IFZlYzMuXG4gKlxuICogQHJldHVybiB7TnVtYmVyfSBUaGUgZG90IHByb2R1Y3QuXG4gKi9cblZlYzMuZG90ID0gZnVuY3Rpb24gZG90KHYxLCB2Mikge1xuICAgIHJldHVybiB2MS54ICogdjIueCArIHYxLnkgKiB2Mi55ICsgdjEueiAqIHYyLno7XG59O1xuXG4vKipcbiAqIFRoZSAocmlnaHQtaGFuZGVkKSBjcm9zcyBwcm9kdWN0IG9mIHRoZSBpbnB1dCBWZWMzJ3MuXG4gKiB2MSB4IHYyLlxuICpcbiAqIEBtZXRob2RcbiAqXG4gKiBAcGFyYW0ge1ZlYzN9IHYxIFRoZSBsZWZ0IFZlYzMuXG4gKiBAcGFyYW0ge1ZlYzN9IHYyIFRoZSByaWdodCBWZWMzLlxuICogQHBhcmFtIHtWZWMzfSBvdXRwdXQgVmVjMyBpbiB3aGljaCB0byBwbGFjZSB0aGUgcmVzdWx0LlxuICpcbiAqIEByZXR1cm4ge09iamVjdH0gdGhlIG9iamVjdCB0aGUgcmVzdWx0IG9mIHRoZSBjcm9zcyBwcm9kdWN0IHdhcyBwbGFjZWQgaW50b1xuICovXG5WZWMzLmNyb3NzID0gZnVuY3Rpb24gY3Jvc3ModjEsIHYyLCBvdXRwdXQpIHtcbiAgICB2YXIgeDEgPSB2MS54O1xuICAgIHZhciB5MSA9IHYxLnk7XG4gICAgdmFyIHoxID0gdjEuejtcbiAgICB2YXIgeDIgPSB2Mi54O1xuICAgIHZhciB5MiA9IHYyLnk7XG4gICAgdmFyIHoyID0gdjIuejtcblxuICAgIG91dHB1dC54ID0geTEgKiB6MiAtIHoxICogeTI7XG4gICAgb3V0cHV0LnkgPSB6MSAqIHgyIC0geDEgKiB6MjtcbiAgICBvdXRwdXQueiA9IHgxICogeTIgLSB5MSAqIHgyO1xuICAgIHJldHVybiBvdXRwdXQ7XG59O1xuXG4vKipcbiAqIFRoZSBwcm9qZWN0aW9uIG9mIHYxIG9udG8gdjIuXG4gKlxuICogQG1ldGhvZFxuICpcbiAqIEBwYXJhbSB7VmVjM30gdjEgVGhlIGxlZnQgVmVjMy5cbiAqIEBwYXJhbSB7VmVjM30gdjIgVGhlIHJpZ2h0IFZlYzMuXG4gKiBAcGFyYW0ge1ZlYzN9IG91dHB1dCBWZWMzIGluIHdoaWNoIHRvIHBsYWNlIHRoZSByZXN1bHQuXG4gKlxuICogQHJldHVybiB7T2JqZWN0fSB0aGUgb2JqZWN0IHRoZSByZXN1bHQgb2YgdGhlIGNyb3NzIHByb2R1Y3Qgd2FzIHBsYWNlZCBpbnRvXG4gKi9cblZlYzMucHJvamVjdCA9IGZ1bmN0aW9uIHByb2plY3QodjEsIHYyLCBvdXRwdXQpIHtcbiAgICB2YXIgeDEgPSB2MS54O1xuICAgIHZhciB5MSA9IHYxLnk7XG4gICAgdmFyIHoxID0gdjEuejtcbiAgICB2YXIgeDIgPSB2Mi54O1xuICAgIHZhciB5MiA9IHYyLnk7XG4gICAgdmFyIHoyID0gdjIuejtcblxuICAgIHZhciBzY2FsZSA9IHgxICogeDIgKyB5MSAqIHkyICsgejEgKiB6MjtcbiAgICBzY2FsZSAvPSB4MiAqIHgyICsgeTIgKiB5MiArIHoyICogejI7XG5cbiAgICBvdXRwdXQueCA9IHgyICogc2NhbGU7XG4gICAgb3V0cHV0LnkgPSB5MiAqIHNjYWxlO1xuICAgIG91dHB1dC56ID0gejIgKiBzY2FsZTtcblxuICAgIHJldHVybiBvdXRwdXQ7XG59O1xuXG5WZWMzLnByb3RvdHlwZS5jcmVhdGVGcm9tQXJyYXkgPSBmdW5jdGlvbihhKXtcbiAgICB0aGlzLnggPSBhWzBdIHx8IDA7XG4gICAgdGhpcy55ID0gYVsxXSB8fCAwO1xuICAgIHRoaXMueiA9IGFbMl0gfHwgMDtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVmVjMztcbiIsIi8qKlxuICogVGhlIE1JVCBMaWNlbnNlIChNSVQpXG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDE1IEZhbW91cyBJbmR1c3RyaWVzIEluYy5cbiAqXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4gKiBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4gKiBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4gKiB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4gKiBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbiAqIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4gKlxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbiAqIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuICpcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiAqIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuICogRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gKiBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4gKiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuICogT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuICogVEhFIFNPRlRXQVJFLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIE1hdDMzOiByZXF1aXJlKCcuL01hdDMzJyksXG4gICAgUXVhdGVybmlvbjogcmVxdWlyZSgnLi9RdWF0ZXJuaW9uJyksXG4gICAgVmVjMjogcmVxdWlyZSgnLi9WZWMyJyksXG4gICAgVmVjMzogcmVxdWlyZSgnLi9WZWMzJyksXG4gICAgUmF5OiByZXF1aXJlKCcuL1JheScpLFxuICAgIE1hdHJpeDogcmVxdWlyZSgnLi9NYXRyaXgnKVxufTtcbiIsIi8qKlxuICogVGhlIE1JVCBMaWNlbnNlIChNSVQpXG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDE1IEZhbW91cyBJbmR1c3RyaWVzIEluYy5cbiAqXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4gKiBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4gKiBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4gKiB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4gKiBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbiAqIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4gKlxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbiAqIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuICpcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiAqIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuICogRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gKiBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4gKiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuICogT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuICogVEhFIFNPRlRXQVJFLlxuICovXG5cbi8qanNoaW50IC1XMDA4ICovXG5cbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBBIGxpYnJhcnkgb2YgY3VydmVzIHdoaWNoIG1hcCBhbiBhbmltYXRpb24gZXhwbGljaXRseSBhcyBhIGZ1bmN0aW9uIG9mIHRpbWUuXG4gKlxuICogQG5hbWVzcGFjZVxuICogQHByb3BlcnR5IHtGdW5jdGlvbn0gbGluZWFyXG4gKiBAcHJvcGVydHkge0Z1bmN0aW9ufSBlYXNlSW5cbiAqIEBwcm9wZXJ0eSB7RnVuY3Rpb259IGVhc2VPdXRcbiAqIEBwcm9wZXJ0eSB7RnVuY3Rpb259IGVhc2VJbk91dFxuICogQHByb3BlcnR5IHtGdW5jdGlvbn0gZWFzZU91dEJvdW5jZVxuICogQHByb3BlcnR5IHtGdW5jdGlvbn0gc3ByaW5nXG4gKiBAcHJvcGVydHkge0Z1bmN0aW9ufSBpblF1YWRcbiAqIEBwcm9wZXJ0eSB7RnVuY3Rpb259IG91dFF1YWRcbiAqIEBwcm9wZXJ0eSB7RnVuY3Rpb259IGluT3V0UXVhZFxuICogQHByb3BlcnR5IHtGdW5jdGlvbn0gaW5DdWJpY1xuICogQHByb3BlcnR5IHtGdW5jdGlvbn0gb3V0Q3ViaWNcbiAqIEBwcm9wZXJ0eSB7RnVuY3Rpb259IGluT3V0Q3ViaWNcbiAqIEBwcm9wZXJ0eSB7RnVuY3Rpb259IGluUXVhcnRcbiAqIEBwcm9wZXJ0eSB7RnVuY3Rpb259IG91dFF1YXJ0XG4gKiBAcHJvcGVydHkge0Z1bmN0aW9ufSBpbk91dFF1YXJ0XG4gKiBAcHJvcGVydHkge0Z1bmN0aW9ufSBpblF1aW50XG4gKiBAcHJvcGVydHkge0Z1bmN0aW9ufSBvdXRRdWludFxuICogQHByb3BlcnR5IHtGdW5jdGlvbn0gaW5PdXRRdWludFxuICogQHByb3BlcnR5IHtGdW5jdGlvbn0gaW5TaW5lXG4gKiBAcHJvcGVydHkge0Z1bmN0aW9ufSBvdXRTaW5lXG4gKiBAcHJvcGVydHkge0Z1bmN0aW9ufSBpbk91dFNpbmVcbiAqIEBwcm9wZXJ0eSB7RnVuY3Rpb259IGluRXhwb1xuICogQHByb3BlcnR5IHtGdW5jdGlvbn0gb3V0RXhwb1xuICogQHByb3BlcnR5IHtGdW5jdGlvbn0gaW5PdXRFeHBcbiAqIEBwcm9wZXJ0eSB7RnVuY3Rpb259IGluQ2lyY1xuICogQHByb3BlcnR5IHtGdW5jdGlvbn0gb3V0Q2lyY1xuICogQHByb3BlcnR5IHtGdW5jdGlvbn0gaW5PdXRDaXJjXG4gKiBAcHJvcGVydHkge0Z1bmN0aW9ufSBpbkVsYXN0aWNcbiAqIEBwcm9wZXJ0eSB7RnVuY3Rpb259IG91dEVsYXN0aWNcbiAqIEBwcm9wZXJ0eSB7RnVuY3Rpb259IGluT3V0RWxhc3RpY1xuICogQHByb3BlcnR5IHtGdW5jdGlvbn0gaW5Cb3VuY2VcbiAqIEBwcm9wZXJ0eSB7RnVuY3Rpb259IG91dEJvdW5jZVxuICogQHByb3BlcnR5IHtGdW5jdGlvbn0gaW5PdXRCb3VuY2VcbiAqIEBwcm9wZXJ0eSB7RnVuY3Rpb259IGZsYXQgICAgICAgICAgICAtIFVzZWZ1bCBmb3IgZGVsYXlpbmcgdGhlIGV4ZWN1dGlvbiBvZlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYSBzdWJzZXF1ZW50IHRyYW5zaXRpb24uXG4gKi9cbnZhciBDdXJ2ZXMgPSB7XG4gICAgbGluZWFyOiBmdW5jdGlvbih0KSB7XG4gICAgICAgIHJldHVybiB0O1xuICAgIH0sXG5cbiAgICBlYXNlSW46IGZ1bmN0aW9uKHQpIHtcbiAgICAgICAgcmV0dXJuIHQqdDtcbiAgICB9LFxuXG4gICAgZWFzZU91dDogZnVuY3Rpb24odCkge1xuICAgICAgICByZXR1cm4gdCooMi10KTtcbiAgICB9LFxuXG4gICAgZWFzZUluT3V0OiBmdW5jdGlvbih0KSB7XG4gICAgICAgIGlmICh0IDw9IDAuNSkgcmV0dXJuIDIqdCp0O1xuICAgICAgICBlbHNlIHJldHVybiAtMip0KnQgKyA0KnQgLSAxO1xuICAgIH0sXG5cbiAgICBlYXNlT3V0Qm91bmNlOiBmdW5jdGlvbih0KSB7XG4gICAgICAgIHJldHVybiB0KigzIC0gMip0KTtcbiAgICB9LFxuXG4gICAgc3ByaW5nOiBmdW5jdGlvbih0KSB7XG4gICAgICAgIHJldHVybiAoMSAtIHQpICogTWF0aC5zaW4oNiAqIE1hdGguUEkgKiB0KSArIHQ7XG4gICAgfSxcblxuICAgIGluUXVhZDogZnVuY3Rpb24odCkge1xuICAgICAgICByZXR1cm4gdCp0O1xuICAgIH0sXG5cbiAgICBvdXRRdWFkOiBmdW5jdGlvbih0KSB7XG4gICAgICAgIHJldHVybiAtKHQtPTEpKnQrMTtcbiAgICB9LFxuXG4gICAgaW5PdXRRdWFkOiBmdW5jdGlvbih0KSB7XG4gICAgICAgIGlmICgodC89LjUpIDwgMSkgcmV0dXJuIC41KnQqdDtcbiAgICAgICAgcmV0dXJuIC0uNSooKC0tdCkqKHQtMikgLSAxKTtcbiAgICB9LFxuXG4gICAgaW5DdWJpYzogZnVuY3Rpb24odCkge1xuICAgICAgICByZXR1cm4gdCp0KnQ7XG4gICAgfSxcblxuICAgIG91dEN1YmljOiBmdW5jdGlvbih0KSB7XG4gICAgICAgIHJldHVybiAoKC0tdCkqdCp0ICsgMSk7XG4gICAgfSxcblxuICAgIGluT3V0Q3ViaWM6IGZ1bmN0aW9uKHQpIHtcbiAgICAgICAgaWYgKCh0Lz0uNSkgPCAxKSByZXR1cm4gLjUqdCp0KnQ7XG4gICAgICAgIHJldHVybiAuNSooKHQtPTIpKnQqdCArIDIpO1xuICAgIH0sXG5cbiAgICBpblF1YXJ0OiBmdW5jdGlvbih0KSB7XG4gICAgICAgIHJldHVybiB0KnQqdCp0O1xuICAgIH0sXG5cbiAgICBvdXRRdWFydDogZnVuY3Rpb24odCkge1xuICAgICAgICByZXR1cm4gLSgoLS10KSp0KnQqdCAtIDEpO1xuICAgIH0sXG5cbiAgICBpbk91dFF1YXJ0OiBmdW5jdGlvbih0KSB7XG4gICAgICAgIGlmICgodC89LjUpIDwgMSkgcmV0dXJuIC41KnQqdCp0KnQ7XG4gICAgICAgIHJldHVybiAtLjUgKiAoKHQtPTIpKnQqdCp0IC0gMik7XG4gICAgfSxcblxuICAgIGluUXVpbnQ6IGZ1bmN0aW9uKHQpIHtcbiAgICAgICAgcmV0dXJuIHQqdCp0KnQqdDtcbiAgICB9LFxuXG4gICAgb3V0UXVpbnQ6IGZ1bmN0aW9uKHQpIHtcbiAgICAgICAgcmV0dXJuICgoLS10KSp0KnQqdCp0ICsgMSk7XG4gICAgfSxcblxuICAgIGluT3V0UXVpbnQ6IGZ1bmN0aW9uKHQpIHtcbiAgICAgICAgaWYgKCh0Lz0uNSkgPCAxKSByZXR1cm4gLjUqdCp0KnQqdCp0O1xuICAgICAgICByZXR1cm4gLjUqKCh0LT0yKSp0KnQqdCp0ICsgMik7XG4gICAgfSxcblxuICAgIGluU2luZTogZnVuY3Rpb24odCkge1xuICAgICAgICByZXR1cm4gLTEuMCpNYXRoLmNvcyh0ICogKE1hdGguUEkvMikpICsgMS4wO1xuICAgIH0sXG5cbiAgICBvdXRTaW5lOiBmdW5jdGlvbih0KSB7XG4gICAgICAgIHJldHVybiBNYXRoLnNpbih0ICogKE1hdGguUEkvMikpO1xuICAgIH0sXG5cbiAgICBpbk91dFNpbmU6IGZ1bmN0aW9uKHQpIHtcbiAgICAgICAgcmV0dXJuIC0uNSooTWF0aC5jb3MoTWF0aC5QSSp0KSAtIDEpO1xuICAgIH0sXG5cbiAgICBpbkV4cG86IGZ1bmN0aW9uKHQpIHtcbiAgICAgICAgcmV0dXJuICh0PT09MCkgPyAwLjAgOiBNYXRoLnBvdygyLCAxMCAqICh0IC0gMSkpO1xuICAgIH0sXG5cbiAgICBvdXRFeHBvOiBmdW5jdGlvbih0KSB7XG4gICAgICAgIHJldHVybiAodD09PTEuMCkgPyAxLjAgOiAoLU1hdGgucG93KDIsIC0xMCAqIHQpICsgMSk7XG4gICAgfSxcblxuICAgIGluT3V0RXhwbzogZnVuY3Rpb24odCkge1xuICAgICAgICBpZiAodD09PTApIHJldHVybiAwLjA7XG4gICAgICAgIGlmICh0PT09MS4wKSByZXR1cm4gMS4wO1xuICAgICAgICBpZiAoKHQvPS41KSA8IDEpIHJldHVybiAuNSAqIE1hdGgucG93KDIsIDEwICogKHQgLSAxKSk7XG4gICAgICAgIHJldHVybiAuNSAqICgtTWF0aC5wb3coMiwgLTEwICogLS10KSArIDIpO1xuICAgIH0sXG5cbiAgICBpbkNpcmM6IGZ1bmN0aW9uKHQpIHtcbiAgICAgICAgcmV0dXJuIC0oTWF0aC5zcXJ0KDEgLSB0KnQpIC0gMSk7XG4gICAgfSxcblxuICAgIG91dENpcmM6IGZ1bmN0aW9uKHQpIHtcbiAgICAgICAgcmV0dXJuIE1hdGguc3FydCgxIC0gKC0tdCkqdCk7XG4gICAgfSxcblxuICAgIGluT3V0Q2lyYzogZnVuY3Rpb24odCkge1xuICAgICAgICBpZiAoKHQvPS41KSA8IDEpIHJldHVybiAtLjUgKiAoTWF0aC5zcXJ0KDEgLSB0KnQpIC0gMSk7XG4gICAgICAgIHJldHVybiAuNSAqIChNYXRoLnNxcnQoMSAtICh0LT0yKSp0KSArIDEpO1xuICAgIH0sXG5cbiAgICBpbkVsYXN0aWM6IGZ1bmN0aW9uKHQpIHtcbiAgICAgICAgdmFyIHM9MS43MDE1ODt2YXIgcD0wO3ZhciBhPTEuMDtcbiAgICAgICAgaWYgKHQ9PT0wKSByZXR1cm4gMC4wOyAgaWYgKHQ9PT0xKSByZXR1cm4gMS4wOyAgaWYgKCFwKSBwPS4zO1xuICAgICAgICBzID0gcC8oMipNYXRoLlBJKSAqIE1hdGguYXNpbigxLjAvYSk7XG4gICAgICAgIHJldHVybiAtKGEqTWF0aC5wb3coMiwxMCoodC09MSkpICogTWF0aC5zaW4oKHQtcykqKDIqTWF0aC5QSSkvIHApKTtcbiAgICB9LFxuXG4gICAgb3V0RWxhc3RpYzogZnVuY3Rpb24odCkge1xuICAgICAgICB2YXIgcz0xLjcwMTU4O3ZhciBwPTA7dmFyIGE9MS4wO1xuICAgICAgICBpZiAodD09PTApIHJldHVybiAwLjA7ICBpZiAodD09PTEpIHJldHVybiAxLjA7ICBpZiAoIXApIHA9LjM7XG4gICAgICAgIHMgPSBwLygyKk1hdGguUEkpICogTWF0aC5hc2luKDEuMC9hKTtcbiAgICAgICAgcmV0dXJuIGEqTWF0aC5wb3coMiwtMTAqdCkgKiBNYXRoLnNpbigodC1zKSooMipNYXRoLlBJKS9wKSArIDEuMDtcbiAgICB9LFxuXG4gICAgaW5PdXRFbGFzdGljOiBmdW5jdGlvbih0KSB7XG4gICAgICAgIHZhciBzPTEuNzAxNTg7dmFyIHA9MDt2YXIgYT0xLjA7XG4gICAgICAgIGlmICh0PT09MCkgcmV0dXJuIDAuMDsgIGlmICgodC89LjUpPT09MikgcmV0dXJuIDEuMDsgIGlmICghcCkgcD0oLjMqMS41KTtcbiAgICAgICAgcyA9IHAvKDIqTWF0aC5QSSkgKiBNYXRoLmFzaW4oMS4wL2EpO1xuICAgICAgICBpZiAodCA8IDEpIHJldHVybiAtLjUqKGEqTWF0aC5wb3coMiwxMCoodC09MSkpICogTWF0aC5zaW4oKHQtcykqKDIqTWF0aC5QSSkvcCkpO1xuICAgICAgICByZXR1cm4gYSpNYXRoLnBvdygyLC0xMCoodC09MSkpICogTWF0aC5zaW4oKHQtcykqKDIqTWF0aC5QSSkvcCkqLjUgKyAxLjA7XG4gICAgfSxcblxuICAgIGluQmFjazogZnVuY3Rpb24odCwgcykge1xuICAgICAgICBpZiAocyA9PT0gdW5kZWZpbmVkKSBzID0gMS43MDE1ODtcbiAgICAgICAgcmV0dXJuIHQqdCooKHMrMSkqdCAtIHMpO1xuICAgIH0sXG5cbiAgICBvdXRCYWNrOiBmdW5jdGlvbih0LCBzKSB7XG4gICAgICAgIGlmIChzID09PSB1bmRlZmluZWQpIHMgPSAxLjcwMTU4O1xuICAgICAgICByZXR1cm4gKCgtLXQpKnQqKChzKzEpKnQgKyBzKSArIDEpO1xuICAgIH0sXG5cbiAgICBpbk91dEJhY2s6IGZ1bmN0aW9uKHQsIHMpIHtcbiAgICAgICAgaWYgKHMgPT09IHVuZGVmaW5lZCkgcyA9IDEuNzAxNTg7XG4gICAgICAgIGlmICgodC89LjUpIDwgMSkgcmV0dXJuIC41Kih0KnQqKCgocyo9KDEuNTI1KSkrMSkqdCAtIHMpKTtcbiAgICAgICAgcmV0dXJuIC41KigodC09MikqdCooKChzKj0oMS41MjUpKSsxKSp0ICsgcykgKyAyKTtcbiAgICB9LFxuXG4gICAgaW5Cb3VuY2U6IGZ1bmN0aW9uKHQpIHtcbiAgICAgICAgcmV0dXJuIDEuMCAtIEN1cnZlcy5vdXRCb3VuY2UoMS4wLXQpO1xuICAgIH0sXG5cbiAgICBvdXRCb3VuY2U6IGZ1bmN0aW9uKHQpIHtcbiAgICAgICAgaWYgKHQgPCAoMS8yLjc1KSkge1xuICAgICAgICAgICAgcmV0dXJuICg3LjU2MjUqdCp0KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0IDwgKDIvMi43NSkpIHtcbiAgICAgICAgICAgIHJldHVybiAoNy41NjI1Kih0LT0oMS41LzIuNzUpKSp0ICsgLjc1KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0IDwgKDIuNS8yLjc1KSkge1xuICAgICAgICAgICAgcmV0dXJuICg3LjU2MjUqKHQtPSgyLjI1LzIuNzUpKSp0ICsgLjkzNzUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuICg3LjU2MjUqKHQtPSgyLjYyNS8yLjc1KSkqdCArIC45ODQzNzUpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGluT3V0Qm91bmNlOiBmdW5jdGlvbih0KSB7XG4gICAgICAgIGlmICh0IDwgLjUpIHJldHVybiBDdXJ2ZXMuaW5Cb3VuY2UodCoyKSAqIC41O1xuICAgICAgICByZXR1cm4gQ3VydmVzLm91dEJvdW5jZSh0KjItMS4wKSAqIC41ICsgLjU7XG4gICAgfSxcblxuICAgIGZsYXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gMDtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEN1cnZlcztcbiIsIi8qKlxuICogVGhlIE1JVCBMaWNlbnNlIChNSVQpXG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDE1IEZhbW91cyBJbmR1c3RyaWVzIEluYy5cbiAqXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4gKiBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4gKiBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4gKiB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4gKiBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbiAqIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4gKlxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbiAqIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuICpcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiAqIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuICogRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gKiBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4gKiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuICogT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuICogVEhFIFNPRlRXQVJFLlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIEN1cnZlcyA9IHJlcXVpcmUoJy4vQ3VydmVzJyk7XG52YXIgRW5naW5lID0gcmVxdWlyZSgnLi4vY29yZS9FbmdpbmUnKTtcblxuLyoqXG4gKiBBIHN0YXRlIG1haW50YWluZXIgZm9yIGEgc21vb3RoIHRyYW5zaXRpb24gYmV0d2VlblxuICogICAgbnVtZXJpY2FsbHktc3BlY2lmaWVkIHN0YXRlcy4gRXhhbXBsZSBudW1lcmljIHN0YXRlcyBpbmNsdWRlIGZsb2F0cyBhbmRcbiAqICAgIGFycmF5cyBvZiBmbG9hdHMgb2JqZWN0cy5cbiAqXG4gKiBBbiBpbml0aWFsIHN0YXRlIGlzIHNldCB3aXRoIHRoZSBjb25zdHJ1Y3RvciBvciB1c2luZ1xuICogICAgIHtAbGluayBUcmFuc2l0aW9uYWJsZSNmcm9tfS4gU3Vic2VxdWVudCB0cmFuc2l0aW9ucyBjb25zaXN0IG9mIGFuXG4gKiAgICAgaW50ZXJtZWRpYXRlIHN0YXRlLCBlYXNpbmcgY3VydmUsIGR1cmF0aW9uIGFuZCBjYWxsYmFjay4gVGhlIGZpbmFsIHN0YXRlXG4gKiAgICAgb2YgZWFjaCB0cmFuc2l0aW9uIGlzIHRoZSBpbml0aWFsIHN0YXRlIG9mIHRoZSBzdWJzZXF1ZW50IG9uZS4gQ2FsbHMgdG9cbiAqICAgICB7QGxpbmsgVHJhbnNpdGlvbmFibGUjZ2V0fSBwcm92aWRlIHRoZSBpbnRlcnBvbGF0ZWQgc3RhdGUgYWxvbmcgdGhlIHdheS5cbiAqXG4gKiBOb3RlIHRoYXQgdGhlcmUgaXMgbm8gZXZlbnQgbG9vcCBoZXJlIC0gY2FsbHMgdG8ge0BsaW5rIFRyYW5zaXRpb25hYmxlI2dldH1cbiAqICAgIGFyZSB0aGUgb25seSB3YXkgdG8gZmluZCBzdGF0ZSBwcm9qZWN0ZWQgdG8gdGhlIGN1cnJlbnQgKG9yIHByb3ZpZGVkKVxuICogICAgdGltZSBhbmQgYXJlIHRoZSBvbmx5IHdheSB0byB0cmlnZ2VyIGNhbGxiYWNrcyBhbmQgbXV0YXRlIHRoZSBpbnRlcm5hbFxuICogICAgdHJhbnNpdGlvbiBxdWV1ZS5cbiAqXG4gKiBAZXhhbXBsZVxuICogdmFyIHQgPSBuZXcgVHJhbnNpdGlvbmFibGUoWzAsIDBdKTtcbiAqIHRcbiAqICAgICAudG8oWzEwMCwgMF0sICdsaW5lYXInLCAxMDAwKVxuICogICAgIC5kZWxheSgxMDAwKVxuICogICAgIC50byhbMjAwLCAwXSwgJ291dEJvdW5jZScsIDEwMDApO1xuICpcbiAqIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAqIGRpdi5zdHlsZS5iYWNrZ3JvdW5kID0gJ2JsdWUnO1xuICogZGl2LnN0eWxlLndpZHRoID0gJzEwMHB4JztcbiAqIGRpdi5zdHlsZS5oZWlnaHQgPSAnMTAwcHgnO1xuICogZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkaXYpO1xuICpcbiAqIGRpdi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICogICAgIHQuaXNQYXVzZWQoKSA/IHQucmVzdW1lKCkgOiB0LnBhdXNlKCk7XG4gKiB9KTtcbiAqXG4gKiByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24gbG9vcCgpIHtcbiAqICAgICBkaXYuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZVgoJyArIHQuZ2V0KClbMF0gKyAncHgpJyArICcgdHJhbnNsYXRlWSgnICsgdC5nZXQoKVsxXSArICdweCknO1xuICogICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShsb29wKTtcbiAqIH0pO1xuICpcbiAqIEBjbGFzcyBUcmFuc2l0aW9uYWJsZVxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge051bWJlcnxBcnJheS5OdW1iZXJ9IGluaXRpYWxTdGF0ZSAgICBpbml0aWFsIHN0YXRlIHRvIHRyYW5zaXRpb25cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyb20gLSBlcXVpdmFsZW50IHRvIGEgcHVyc3VhbnRcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGludm9jYXRpb24gb2ZcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtAbGluayBUcmFuc2l0aW9uYWJsZSNmcm9tfVxuICovXG4gdmFyIHBlcmZvcm1hbmNlID0ge307XG5cbiAoZnVuY3Rpb24oKXtcblxuICAgRGF0ZS5ub3cgPSAoRGF0ZS5ub3cgfHwgZnVuY3Rpb24gKCkgeyAgLy8gdGhhbmtzIElFOFxuIFx0ICByZXR1cm4gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICB9KTtcblxuICAgaWYgKFwibm93XCIgaW4gcGVyZm9ybWFuY2UgPT0gZmFsc2Upe1xuXG4gICAgIHZhciBub3dPZmZzZXQgPSBEYXRlLm5vdygpO1xuXG4gICAgIGlmIChwZXJmb3JtYW5jZS50aW1pbmcgJiYgcGVyZm9ybWFuY2UudGltaW5nLm5hdmlnYXRpb25TdGFydCl7XG4gICAgICAgbm93T2Zmc2V0ID0gcGVyZm9ybWFuY2UudGltaW5nLm5hdmlnYXRpb25TdGFydFxuICAgICB9XG5cbiAgICAgcGVyZm9ybWFuY2Uubm93ID0gZnVuY3Rpb24gbm93KCl7XG4gICAgICAgcmV0dXJuIERhdGUubm93KCkgLSBub3dPZmZzZXQ7XG4gICAgIH1cbiAgIH1cblxuIH0pKCk7XG5cbmZ1bmN0aW9uIFRyYW5zaXRpb25hYmxlKGluaXRpYWxTdGF0ZSwgcGFyYW0sIGxvb3ApIHtcbiAgICB0aGlzLl9xdWV1ZSA9IFtdO1xuICAgIHRoaXMuX2Zyb20gPSBudWxsO1xuICAgIHRoaXMuX3N0YXRlID0gbnVsbDtcbiAgICB0aGlzLl9zdGFydGVkQXQgPSBudWxsO1xuICAgIHRoaXMuX3BhdXNlZEF0ID0gbnVsbDtcbiAgICB0aGlzLl9sb29wID0gbG9vcCB8fCBudWxsO1xuICAgIHRoaXMuaWQgPSBudWxsO1xuICAgIHBhcmFtID8gdGhpcy5wYXJhbSA9IHBhcmFtIDogcGFyYW0gPSBudWxsO1xuICAgIGlmIChpbml0aWFsU3RhdGUgIT0gbnVsbCkgdGhpcy5mcm9tKGluaXRpYWxTdGF0ZSk7XG4gICAgRW5naW5lLnVwZGF0ZVF1ZXVlLnB1c2godGhpcyk7XG59XG5cbi8qKlxuICogUmVnaXN0ZXJzIGEgdHJhbnNpdGlvbiB0byBiZSBwdXNoZWQgb250byB0aGUgaW50ZXJuYWwgcXVldWUuXG4gKlxuICogQG1ldGhvZCB0b1xuICogQGNoYWluYWJsZVxuICpcbiAqIEBwYXJhbSAge051bWJlcnxBcnJheS5OdW1iZXJ9ICAgIGZpbmFsU3RhdGUgICAgICAgICAgICAgIGZpbmFsIHN0YXRlIHRvXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2l0b24gdG9cbiAqIEBwYXJhbSAge1N0cmluZ3xGdW5jdGlvbn0gICAgICAgIFtjdXJ2ZT1DdXJ2ZXMubGluZWFyXSAgIGVhc2luZyBmdW5jdGlvblxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlZCBmb3JcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGludGVycG9sYXRpbmdcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFswLCAxXVxuICogQHBhcmFtICB7TnVtYmVyfSAgICAgICAgICAgICAgICAgW2R1cmF0aW9uPTEwMF0gICAgICAgICAgZHVyYXRpb24gb2ZcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb25cbiAqIEBwYXJhbSAge0Z1bmN0aW9ufSAgICAgICAgICAgICAgIFtjYWxsYmFja10gICAgICAgICAgICAgIGNhbGxiYWNrIGZ1bmN0aW9uXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0byBiZSBjYWxsZWQgYWZ0ZXJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZSB0cmFuc2l0aW9uIGlzXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZVxuICogQHBhcmFtICB7U3RyaW5nfSAgICAgICAgICAgICAgICAgW21ldGhvZF0gICAgICAgICAgICAgICAgbWV0aG9kIHVzZWQgZm9yXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnRlcnBvbGF0aW9uXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoZS5nLiBzbGVycClcbiAqIEByZXR1cm4ge1RyYW5zaXRpb25hYmxlfSAgICAgICAgIHRoaXNcbiAqL1xuVHJhbnNpdGlvbmFibGUucHJvdG90eXBlLnRvID0gZnVuY3Rpb24gdG8oZmluYWxTdGF0ZSwgY3VydmUsIGR1cmF0aW9uLCBjYWxsYmFjaywgbWV0aG9kKSB7XG5cbiAgICBjdXJ2ZSA9IGN1cnZlICE9IG51bGwgJiYgY3VydmUuY29uc3RydWN0b3IgPT09IFN0cmluZyA/IEN1cnZlc1tjdXJ2ZV0gOiBjdXJ2ZTtcbiAgICBpZiAodGhpcy5fcXVldWUubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHRoaXMuX3N0YXJ0ZWRBdCA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgICAgICB0aGlzLl9wYXVzZWRBdCA9IG51bGw7XG4gICAgfVxuXG4gICAgdGhpcy5fcXVldWUucHVzaChcbiAgICAgICAgZmluYWxTdGF0ZSxcbiAgICAgICAgY3VydmUgIT0gbnVsbCA/IGN1cnZlIDogQ3VydmVzLmxpbmVhcixcbiAgICAgICAgZHVyYXRpb24gIT0gbnVsbCA/IGR1cmF0aW9uIDogMTAwLFxuICAgICAgICBjYWxsYmFjayxcbiAgICAgICAgbWV0aG9kXG4gICAgKTtcblxuICAgIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZXNldHMgdGhlIHRyYW5zaXRpb24gcXVldWUgdG8gYSBzdGFibGUgaW5pdGlhbCBzdGF0ZS5cbiAqXG4gKiBAbWV0aG9kIGZyb21cbiAqIEBjaGFpbmFibGVcbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ8QXJyYXkuTnVtYmVyfSAgICBpbml0aWFsU3RhdGUgICAgaW5pdGlhbCBzdGF0ZSB0b1xuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb24gZnJvbVxuICogQHJldHVybiB7VHJhbnNpdGlvbmFibGV9ICAgICAgICAgdGhpc1xuICovXG5UcmFuc2l0aW9uYWJsZS5wcm90b3R5cGUuZnJvbSA9IGZ1bmN0aW9uIGZyb20oaW5pdGlhbFN0YXRlKSB7XG4gICAgdGhpcy5fc3RhdGUgPSBpbml0aWFsU3RhdGU7XG4gICAgdGhpcy5fZnJvbSA9IHRoaXMuX3N5bmMobnVsbCwgdGhpcy5fc3RhdGUpO1xuICAgIHRoaXMuX3F1ZXVlLmxlbmd0aCA9IDA7XG4gICAgdGhpcy5fc3RhcnRlZEF0ID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgdGhpcy5fcGF1c2VkQXQgPSBudWxsO1xuICAgIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBEZWxheXMgdGhlIGV4ZWN1dGlvbiBvZiB0aGUgc3Vic2VxdWVudCB0cmFuc2l0aW9uIGZvciBhIGNlcnRhaW4gcGVyaW9kIG9mXG4gKiB0aW1lLlxuICpcbiAqIEBtZXRob2QgZGVsYXlcbiAqIEBjaGFpbmFibGVcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gICAgICBkdXJhdGlvbiAgICBkZWxheSB0aW1lIGluIG1zXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSAgICBbY2FsbGJhY2tdICBaZXJvLWFyZ3VtZW50IGZ1bmN0aW9uIHRvIGNhbGwgb24gb2JzZXJ2ZWRcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBsZXRpb24gKHQ9MSlcbiAqIEByZXR1cm4ge1RyYW5zaXRpb25hYmxlfSAgICAgICAgIHRoaXNcbiAqL1xuVHJhbnNpdGlvbmFibGUucHJvdG90eXBlLmRlbGF5ID0gZnVuY3Rpb24gZGVsYXkoZHVyYXRpb24sIGNhbGxiYWNrKSB7XG4gICAgdmFyIGVuZFN0YXRlID0gdGhpcy5fcXVldWUubGVuZ3RoID4gMCA/IHRoaXMuX3F1ZXVlW3RoaXMuX3F1ZXVlLmxlbmd0aCAtIDVdIDogdGhpcy5fc3RhdGU7XG4gICAgcmV0dXJuIHRoaXMudG8oZW5kU3RhdGUsIEN1cnZlcy5mbGF0LCBkdXJhdGlvbiwgY2FsbGJhY2spO1xufTtcblxuLyoqXG4gKiBPdmVycmlkZXMgY3VycmVudCB0cmFuc2l0aW9uLlxuICpcbiAqIEBtZXRob2Qgb3ZlcnJpZGVcbiAqIEBjaGFpbmFibGVcbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ8QXJyYXkuTnVtYmVyfSAgICBbZmluYWxTdGF0ZV0gICAgZmluYWwgc3RhdGUgdG8gdHJhbnNpdG9uIHRvXG4gKiBAcGFyYW0gIHtTdHJpbmd8RnVuY3Rpb259ICAgICAgICBbY3VydmVdICAgICAgICAgZWFzaW5nIGZ1bmN0aW9uIHVzZWQgZm9yXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW50ZXJwb2xhdGluZyBbMCwgMV1cbiAqIEBwYXJhbSAge051bWJlcn0gICAgICAgICAgICAgICAgIFtkdXJhdGlvbl0gICAgICBkdXJhdGlvbiBvZiB0cmFuc2l0aW9uXG4gKiBAcGFyYW0gIHtGdW5jdGlvbn0gICAgICAgICAgICAgICBbY2FsbGJhY2tdICAgICAgY2FsbGJhY2sgZnVuY3Rpb24gdG8gYmVcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsZWQgYWZ0ZXIgdGhlIHRyYW5zaXRpb25cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpcyBjb21wbGV0ZVxuICogQHBhcmFtIHtTdHJpbmd9ICAgICAgICAgICAgICAgICAgW21ldGhvZF0gICAgICAgIG9wdGlvbmFsIG1ldGhvZCB1c2VkIGZvclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGludGVycG9sYXRpbmcgYmV0d2VlbiB0aGVcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZXMuIFNldCB0byBgc2xlcnBgIGZvclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwaGVyaWNhbCBsaW5lYXJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnRlcnBvbGF0aW9uLlxuICogQHJldHVybiB7VHJhbnNpdGlvbmFibGV9ICAgICAgICAgdGhpc1xuICovXG5UcmFuc2l0aW9uYWJsZS5wcm90b3R5cGUub3ZlcnJpZGUgPSBmdW5jdGlvbiBvdmVycmlkZShmaW5hbFN0YXRlLCBjdXJ2ZSwgZHVyYXRpb24sIGNhbGxiYWNrLCBtZXRob2QpIHtcbiAgICBpZiAodGhpcy5fcXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICBpZiAoZmluYWxTdGF0ZSAhPSBudWxsKSB0aGlzLl9xdWV1ZVswXSA9IGZpbmFsU3RhdGU7XG4gICAgICAgIGlmIChjdXJ2ZSAhPSBudWxsKSAgICAgIHRoaXMuX3F1ZXVlWzFdID0gY3VydmUuY29uc3RydWN0b3IgPT09IFN0cmluZyA/IEN1cnZlc1tjdXJ2ZV0gOiBjdXJ2ZTtcbiAgICAgICAgaWYgKGR1cmF0aW9uICE9IG51bGwpICAgdGhpcy5fcXVldWVbMl0gPSBkdXJhdGlvbjtcbiAgICAgICAgaWYgKGNhbGxiYWNrICE9IG51bGwpICAgdGhpcy5fcXVldWVbM10gPSBjYWxsYmFjaztcbiAgICAgICAgaWYgKG1ldGhvZCAhPSBudWxsKSAgICAgdGhpcy5fcXVldWVbNF0gPSBtZXRob2Q7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xufTtcblxuXG4vKipcbiAqIFVzZWQgZm9yIGludGVycG9sYXRpbmcgYmV0d2VlbiB0aGUgc3RhcnQgYW5kIGVuZCBzdGF0ZSBvZiB0aGUgY3VycmVudGx5XG4gKiBydW5uaW5nIHRyYW5zaXRpb25cbiAqXG4gKiBAbWV0aG9kICBfaW50ZXJwb2xhdGVcbiAqIEBwcml2YXRlXG4gKlxuICogQHBhcmFtICB7T2JqZWN0fEFycmF5fE51bWJlcn0gb3V0cHV0ICAgICBXaGVyZSB0byB3cml0ZSB0byAoaW4gb3JkZXIgdG8gYXZvaWRcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0IGFsbG9jYXRpb24gYW5kIHRoZXJlZm9yZSBHQykuXG4gKiBAcGFyYW0gIHtPYmplY3R8QXJyYXl8TnVtYmVyfSBmcm9tICAgICAgIFN0YXJ0IHN0YXRlIG9mIGN1cnJlbnQgdHJhbnNpdGlvbi5cbiAqIEBwYXJhbSAge09iamVjdHxBcnJheXxOdW1iZXJ9IHRvICAgICAgICAgRW5kIHN0YXRlIG9mIGN1cnJlbnQgdHJhbnNpdGlvbi5cbiAqIEBwYXJhbSAge051bWJlcn0gcHJvZ3Jlc3MgICAgICAgICAgICAgICAgUHJvZ3Jlc3Mgb2YgdGhlIGN1cnJlbnQgdHJhbnNpdGlvbixcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW4gWzAsIDFdXG4gKiBAcGFyYW0gIHtTdHJpbmd9IG1ldGhvZCAgICAgICAgICAgICAgICAgIE1ldGhvZCB1c2VkIGZvciBpbnRlcnBvbGF0aW9uIChlLmcuXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNsZXJwKVxuICogQHJldHVybiB7T2JqZWN0fEFycmF5fE51bWJlcn0gICAgICAgICAgICBvdXRwdXRcbiAqL1xuVHJhbnNpdGlvbmFibGUucHJvdG90eXBlLl9pbnRlcnBvbGF0ZSA9IGZ1bmN0aW9uIF9pbnRlcnBvbGF0ZShvdXRwdXQsIGZyb20sIHRvLCBwcm9ncmVzcywgbWV0aG9kKSB7XG4gICAgaWYgKHRvIGluc3RhbmNlb2YgT2JqZWN0KSB7XG4gICAgICAgIGlmIChtZXRob2QgPT09ICdzbGVycCcpIHtcbiAgICAgICAgICAgIHZhciB4LCB5LCB6LCB3O1xuICAgICAgICAgICAgdmFyIHF4LCBxeSwgcXosIHF3O1xuICAgICAgICAgICAgdmFyIG9tZWdhLCBjb3NvbWVnYSwgc2lub21lZ2EsIHNjYWxlRnJvbSwgc2NhbGVUbztcblxuICAgICAgICAgICAgeCA9IGZyb21bMF07XG4gICAgICAgICAgICB5ID0gZnJvbVsxXTtcbiAgICAgICAgICAgIHogPSBmcm9tWzJdO1xuICAgICAgICAgICAgdyA9IGZyb21bM107XG5cbiAgICAgICAgICAgIHF4ID0gdG9bMF07XG4gICAgICAgICAgICBxeSA9IHRvWzFdO1xuICAgICAgICAgICAgcXogPSB0b1syXTtcbiAgICAgICAgICAgIHF3ID0gdG9bM107XG5cbiAgICAgICAgICAgIGlmIChwcm9ncmVzcyA9PT0gMSkge1xuICAgICAgICAgICAgICAgIG91dHB1dFswXSA9IHF4O1xuICAgICAgICAgICAgICAgIG91dHB1dFsxXSA9IHF5O1xuICAgICAgICAgICAgICAgIG91dHB1dFsyXSA9IHF6O1xuICAgICAgICAgICAgICAgIG91dHB1dFszXSA9IHF3O1xuICAgICAgICAgICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvc29tZWdhID0gdyAqIHF3ICsgeCAqIHF4ICsgeSAqIHF5ICsgeiAqIHF6O1xuICAgICAgICAgICAgaWYgKCgxLjAgLSBjb3NvbWVnYSkgPiAxZS01KSB7XG4gICAgICAgICAgICAgICAgb21lZ2EgPSBNYXRoLmFjb3MoY29zb21lZ2EpO1xuICAgICAgICAgICAgICAgIHNpbm9tZWdhID0gTWF0aC5zaW4ob21lZ2EpO1xuICAgICAgICAgICAgICAgIHNjYWxlRnJvbSA9IE1hdGguc2luKCgxLjAgLSBwcm9ncmVzcykgKiBvbWVnYSkgLyBzaW5vbWVnYTtcbiAgICAgICAgICAgICAgICBzY2FsZVRvID0gTWF0aC5zaW4ocHJvZ3Jlc3MgKiBvbWVnYSkgLyBzaW5vbWVnYTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHNjYWxlRnJvbSA9IDEuMCAtIHByb2dyZXNzO1xuICAgICAgICAgICAgICAgIHNjYWxlVG8gPSBwcm9ncmVzcztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgb3V0cHV0WzBdID0geCAqIHNjYWxlRnJvbSArIHF4ICogc2NhbGVUbztcbiAgICAgICAgICAgIG91dHB1dFsxXSA9IHkgKiBzY2FsZUZyb20gKyBxeSAqIHNjYWxlVG87XG4gICAgICAgICAgICBvdXRwdXRbMl0gPSB6ICogc2NhbGVGcm9tICsgcXogKiBzY2FsZVRvO1xuICAgICAgICAgICAgb3V0cHV0WzNdID0gdyAqIHNjYWxlRnJvbSArIHF3ICogc2NhbGVUbztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0byBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gdG8ubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICBvdXRwdXRbaV0gPSB0aGlzLl9pbnRlcnBvbGF0ZShvdXRwdXRbaV0sIGZyb21baV0sIHRvW2ldLCBwcm9ncmVzcywgbWV0aG9kKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGZvciAodmFyIGtleSBpbiB0bykge1xuICAgICAgICAgICAgICAgIG91dHB1dFtrZXldID0gdGhpcy5faW50ZXJwb2xhdGUob3V0cHV0W2tleV0sIGZyb21ba2V5XSwgdG9ba2V5XSwgcHJvZ3Jlc3MsIG1ldGhvZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIG91dHB1dCA9IGZyb20gKyBwcm9ncmVzcyAqICh0byAtIGZyb20pO1xuICAgIH1cbiAgICByZXR1cm4gb3V0cHV0O1xufTtcblxuXG4vKipcbiAqIEludGVybmFsIGhlbHBlciBtZXRob2QgdXNlZCBmb3Igc3luY2hyb25pemluZyB0aGUgY3VycmVudCwgYWJzb2x1dGUgc3RhdGUgb2ZcbiAqIGEgdHJhbnNpdGlvbiB0byBhIGdpdmVuIG91dHB1dCBhcnJheSwgb2JqZWN0IGxpdGVyYWwgb3IgbnVtYmVyLiBTdXBwb3J0c1xuICogbmVzdGVkIHN0YXRlIG9iamVjdHMgYnkgdGhyb3VnaCByZWN1cnNpb24uXG4gKlxuICogQG1ldGhvZCAgX3N5bmNcbiAqIEBwcml2YXRlXG4gKlxuICogQHBhcmFtICB7TnVtYmVyfEFycmF5fE9iamVjdH0gb3V0cHV0ICAgICBXaGVyZSB0byB3cml0ZSB0byAoaW4gb3JkZXIgdG8gYXZvaWRcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0IGFsbG9jYXRpb24gYW5kIHRoZXJlZm9yZSBHQykuXG4gKiBAcGFyYW0gIHtOdW1iZXJ8QXJyYXl8T2JqZWN0fSBpbnB1dCAgICAgIElucHV0IHN0YXRlIHRvIHByb3h5IG9udG8gdGhlXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dC5cbiAqIEByZXR1cm4ge051bWJlcnxBcnJheXxPYmplY3R9IG91dHB1dCAgICAgUGFzc2VkIGluIG91dHB1dCBvYmplY3QuXG4gKi9cblRyYW5zaXRpb25hYmxlLnByb3RvdHlwZS5fc3luYyA9IGZ1bmN0aW9uIF9zeW5jKG91dHB1dCwgaW5wdXQpIHtcbiAgICBpZiAodHlwZW9mIGlucHV0ID09PSAnbnVtYmVyJykgb3V0cHV0ID0gaW5wdXQ7XG4gICAgZWxzZSBpZiAoaW5wdXQgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICBpZiAob3V0cHV0ID09IG51bGwpIG91dHB1dCA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gaW5wdXQubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgIG91dHB1dFtpXSA9IF9zeW5jKG91dHB1dFtpXSwgaW5wdXRbaV0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKGlucHV0IGluc3RhbmNlb2YgT2JqZWN0KSB7XG4gICAgICAgIGlmIChvdXRwdXQgPT0gbnVsbCkgb3V0cHV0ID0ge307XG4gICAgICAgIGZvciAodmFyIGtleSBpbiBpbnB1dCkge1xuICAgICAgICAgICAgb3V0cHV0W2tleV0gPSBfc3luYyhvdXRwdXRba2V5XSwgaW5wdXRba2V5XSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG91dHB1dDtcbn07XG5cbi8qKlxuICogR2V0IGludGVycG9sYXRlZCBzdGF0ZSBvZiBjdXJyZW50IGFjdGlvbiBhdCBwcm92aWRlZCB0aW1lLiBJZiB0aGUgbGFzdFxuICogICAgYWN0aW9uIGhhcyBjb21wbGV0ZWQsIGludm9rZSBpdHMgY2FsbGJhY2suXG4gKlxuICogQG1ldGhvZCBnZXRcbiAqXG4gKiBAcGFyYW0ge051bWJlcj19IHQgICAgICAgICAgICAgICBFdmFsdWF0ZSB0aGUgY3VydmUgYXQgYSBub3JtYWxpemVkIHZlcnNpb25cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9mIHRoaXMgdGltZS4gSWYgb21pdHRlZCwgdXNlIGN1cnJlbnQgdGltZVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKFVuaXggZXBvY2ggdGltZSByZXRyaWV2ZWQgZnJvbSBDbG9jaykuXG4gKiBAcmV0dXJuIHtOdW1iZXJ8QXJyYXkuTnVtYmVyfSAgICBCZWdpbm5pbmcgc3RhdGUgaW50ZXJwb2xhdGVkIHRvIHRoaXMgcG9pbnRcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluIHRpbWUuXG4gKi9cblRyYW5zaXRpb25hYmxlLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiBnZXQodCkge1xuICAgIGlmICh0aGlzLl9xdWV1ZS5sZW5ndGggPT09IDApIHJldHVybiB0aGlzLl9zdGF0ZTtcblxuICAgIHQgPSB0aGlzLl9wYXVzZWRBdCA/IHRoaXMuX3BhdXNlZEF0IDogdDtcbiAgICB0ID0gdCA/IHQgOiBwZXJmb3JtYW5jZS5ub3coKTtcblxuICAgIHZhciBwcm9ncmVzcyA9ICh0IC0gdGhpcy5fc3RhcnRlZEF0KSAvIHRoaXMuX3F1ZXVlWzJdO1xuICAgIHRoaXMuX3N0YXRlID0gdGhpcy5faW50ZXJwb2xhdGUoXG4gICAgICAgIHRoaXMuX3N0YXRlLFxuICAgICAgICB0aGlzLl9mcm9tLFxuICAgICAgICB0aGlzLl9xdWV1ZVswXSxcbiAgICAgICAgdGhpcy5fcXVldWVbMV0ocHJvZ3Jlc3MgPiAxID8gMSA6IHByb2dyZXNzKSxcbiAgICAgICAgdGhpcy5fcXVldWVbNF1cbiAgICApO1xuICAgIHZhciBzdGF0ZSA9IHRoaXMuX3N0YXRlO1xuICAgIGlmIChwcm9ncmVzcyA+PSAxKSB7XG4gICAgICAgIHRoaXMuX3N0YXJ0ZWRBdCA9IHRoaXMuX3N0YXJ0ZWRBdCArIHRoaXMuX3F1ZXVlWzJdO1xuICAgICAgICB0aGlzLl9mcm9tID0gdGhpcy5fc3luYyh0aGlzLl9mcm9tLCB0aGlzLl9zdGF0ZSk7XG4gICAgICAgIHRoaXMuX3F1ZXVlLnNoaWZ0KCk7XG4gICAgICAgIHRoaXMuX3F1ZXVlLnNoaWZ0KCk7XG4gICAgICAgIHRoaXMuX3F1ZXVlLnNoaWZ0KCk7XG4gICAgICAgIHZhciBjYWxsYmFjayA9IHRoaXMuX3F1ZXVlLnNoaWZ0KCk7XG4gICAgICAgIHRoaXMuX3F1ZXVlLnNoaWZ0KCk7XG4gICAgICAgIGlmIChjYWxsYmFjaykgY2FsbGJhY2soKTtcbiAgICB9XG4gICAgcmV0dXJuIHByb2dyZXNzID4gMSA/IHRoaXMuZ2V0KCkgOiBzdGF0ZTtcbn07XG5cbi8qKlxuICogSXMgdGhlcmUgYXQgbGVhc3Qgb25lIHRyYW5zaXRpb24gcGVuZGluZyBjb21wbGV0aW9uP1xuICpcbiAqIEBtZXRob2QgaXNBY3RpdmVcbiAqXG4gKiBAcmV0dXJuIHtCb29sZWFufSAgICBCb29sZWFuIGluZGljYXRpbmcgd2hldGhlciB0aGVyZSBpcyBhdCBsZWFzdCBvbmUgcGVuZGluZ1xuICogICAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbi4gUGF1c2VkIHRyYW5zaXRpb25zIGFyZSBzdGlsbCBiZWluZ1xuICogICAgICAgICAgICAgICAgICAgICAgY29uc2lkZXJlZCBhY3RpdmUuXG4gKi9cblRyYW5zaXRpb25hYmxlLnByb3RvdHlwZS5pc0FjdGl2ZSA9IGZ1bmN0aW9uIGlzQWN0aXZlKCkge1xuICAgIHJldHVybiB0aGlzLl9xdWV1ZS5sZW5ndGggPiAwO1xufTtcblxuLyoqXG4gKiBIYWx0IHRyYW5zaXRpb24gYXQgY3VycmVudCBzdGF0ZSBhbmQgZXJhc2UgYWxsIHBlbmRpbmcgYWN0aW9ucy5cbiAqXG4gKiBAbWV0aG9kIGhhbHRcbiAqIEBjaGFpbmFibGVcbiAqXG4gKiBAcmV0dXJuIHtUcmFuc2l0aW9uYWJsZX0gdGhpc1xuICovXG5UcmFuc2l0aW9uYWJsZS5wcm90b3R5cGUuaGFsdCA9IGZ1bmN0aW9uIGhhbHQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZnJvbSh0aGlzLmdldCgpKTtcbn07XG5cbi8qKlxuICogUGF1c2UgdHJhbnNpdGlvbi4gVGhpcyB3aWxsIG5vdCBlcmFzZSBhbnkgYWN0aW9ucy5cbiAqXG4gKiBAbWV0aG9kIHBhdXNlXG4gKiBAY2hhaW5hYmxlXG4gKlxuICogQHJldHVybiB7VHJhbnNpdGlvbmFibGV9IHRoaXNcbiAqL1xuVHJhbnNpdGlvbmFibGUucHJvdG90eXBlLnBhdXNlID0gZnVuY3Rpb24gcGF1c2UoKSB7XG4gICAgdGhpcy5fcGF1c2VkQXQgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogSGFzIHRoZSBjdXJyZW50IGFjdGlvbiBiZWVuIHBhdXNlZD9cbiAqXG4gKiBAbWV0aG9kIGlzUGF1c2VkXG4gKiBAY2hhaW5hYmxlXG4gKlxuICogQHJldHVybiB7Qm9vbGVhbn0gaWYgdGhlIGN1cnJlbnQgYWN0aW9uIGhhcyBiZWVuIHBhdXNlZFxuICovXG5UcmFuc2l0aW9uYWJsZS5wcm90b3R5cGUuaXNQYXVzZWQgPSBmdW5jdGlvbiBpc1BhdXNlZCgpIHtcbiAgICByZXR1cm4gISF0aGlzLl9wYXVzZWRBdDtcbn07XG5cbi8qKlxuICogUmVzdW1lIGEgcHJldmlvdXNseSBwYXVzZWQgdHJhbnNpdGlvbi5cbiAqXG4gKiBAbWV0aG9kIHJlc3VtZVxuICogQGNoYWluYWJsZVxuICpcbiAqIEByZXR1cm4ge1RyYW5zaXRpb25hYmxlfSB0aGlzXG4gKi9cblRyYW5zaXRpb25hYmxlLnByb3RvdHlwZS5yZXN1bWUgPSBmdW5jdGlvbiByZXN1bWUoKSB7XG4gICAgdmFyIGRpZmYgPSB0aGlzLl9wYXVzZWRBdCAtIHRoaXMuX3N0YXJ0ZWRBdDtcbiAgICB0aGlzLl9zdGFydGVkQXQgPSBwZXJmb3JtYW5jZS5ub3coKSAtIGRpZmY7XG4gICAgdGhpcy5fcGF1c2VkQXQgPSBudWxsO1xuICAgIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBDYW5jZWwgYWxsIHRyYW5zaXRpb25zIGFuZCByZXNldCB0byBhIHN0YWJsZSBzdGF0ZVxuICpcbiAqIEBtZXRob2QgcmVzZXRcbiAqIEBjaGFpbmFibGVcbiAqIEBkZXByZWNhdGVkIFVzZSBgLmZyb21gIGluc3RlYWQhXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ8QXJyYXkuTnVtYmVyfE9iamVjdC48bnVtYmVyLCBudW1iZXI+fSBzdGFydFxuICogICAgc3RhYmxlIHN0YXRlIHRvIHNldCB0b1xuICogQHJldHVybiB7VHJhbnNpdGlvbmFibGV9ICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzXG4gKi9cblRyYW5zaXRpb25hYmxlLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uKHN0YXJ0KSB7XG4gICAgcmV0dXJuIHRoaXMuZnJvbShzdGFydCk7XG59O1xuXG4vKipcbiAqIEFkZCB0cmFuc2l0aW9uIHRvIGVuZCBzdGF0ZSB0byB0aGUgcXVldWUgb2YgcGVuZGluZyB0cmFuc2l0aW9ucy4gU3BlY2lhbFxuICogICAgVXNlOiBjYWxsaW5nIHdpdGhvdXQgYSB0cmFuc2l0aW9uIHJlc2V0cyB0aGUgb2JqZWN0IHRvIHRoYXQgc3RhdGUgd2l0aFxuICogICAgbm8gcGVuZGluZyBhY3Rpb25zXG4gKlxuICogQG1ldGhvZCBzZXRcbiAqIEBjaGFpbmFibGVcbiAqIEBkZXByZWNhdGVkIFVzZSBgLnRvYCBpbnN0ZWFkIVxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfEZhbW91c0VuZ2luZU1hdHJpeHxBcnJheS5OdW1iZXJ8T2JqZWN0LjxudW1iZXIsIG51bWJlcj59IHN0YXRlXG4gKiAgICBlbmQgc3RhdGUgdG8gd2hpY2ggd2UgaW50ZXJwb2xhdGVcbiAqIEBwYXJhbSB7dHJhbnNpdGlvbj19IHRyYW5zaXRpb24gb2JqZWN0IG9mIHR5cGUge2R1cmF0aW9uOiBudW1iZXIsIGN1cnZlOlxuICogICAgZlswLDFdIC0+IFswLDFdIG9yIG5hbWV9LiBJZiB0cmFuc2l0aW9uIGlzIG9taXR0ZWQsIGNoYW5nZSB3aWxsIGJlXG4gKiAgICBpbnN0YW50YW5lb3VzLlxuICogQHBhcmFtIHtmdW5jdGlvbigpPX0gY2FsbGJhY2sgWmVyby1hcmd1bWVudCBmdW5jdGlvbiB0byBjYWxsIG9uIG9ic2VydmVkXG4gKiAgICBjb21wbGV0aW9uICh0PTEpXG4gKiBAcmV0dXJuIHtUcmFuc2l0aW9uYWJsZX0gdGhpc1xuICovXG5UcmFuc2l0aW9uYWJsZS5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24oc3RhdGUsIHRyYW5zaXRpb24sIGNhbGxiYWNrKSB7XG4gICAgaWYgKHRyYW5zaXRpb24gPT0gbnVsbCkge1xuICAgICAgICB0aGlzLmZyb20oc3RhdGUpO1xuICAgICAgICBpZiAoY2FsbGJhY2spIGNhbGxiYWNrKCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB0aGlzLnRvKHN0YXRlLCB0cmFuc2l0aW9uLmN1cnZlLCB0cmFuc2l0aW9uLmR1cmF0aW9uLCBjYWxsYmFjaywgdHJhbnNpdGlvbi5tZXRob2QpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSBUcmFuc2l0aW9uYWJsZTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICAgIEN1cnZlczogcmVxdWlyZSgnLi9DdXJ2ZXMnKSxcbiAgICBUcmFuc2l0aW9uYWJsZTogcmVxdWlyZSgnLi9UcmFuc2l0aW9uYWJsZScpXG59O1xuIl19
