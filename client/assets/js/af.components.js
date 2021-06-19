function findWithAttr(array, attr, value) {  // find a
  for (var i = 0; i < array.length; i += 1) {
      if(array[i][attr] === value) {
          return i;
      }
  }
  return -1;
}

// for a given array, find the largest value and return the value of the index thereof (0-based index)
function indexOfMax(arr) {
  if (arr.length === 0) {
      return -1;
  }
  var max = arr[0];
  var maxIndex = 0;
  for (var i = 1; i < arr.length; i++) {
      if (arr[i] > max) {
          maxIndex = i;
          max = arr[i];
      }
  }
  return maxIndex;
}

// provide a valid Index for an Array if the desiredIndex is greater or less than an array's length by "looping" around
function loopIndex(desiredIndex, arrayLength) {   // expects a 0 based index
if (desiredIndex > (arrayLength - 1)) {
  return desiredIndex - arrayLength;
}
if (desiredIndex < 0) {
  return arrayLength + desiredIndex;
}
return desiredIndex;
}
// Ghetto testing of loopIndex helper function
function assert(condition, message) {
//    console.log(condition.stringify);
  if (!condition) {
      message = message || "Assertion failed";
      if (typeof Error !== "undefined") {
          throw new Error(message);
      }
      throw message; // Fallback
  }
}
var testLoopArray = [0,1,2,3,4,5,6,7,8,9];
assert(loopIndex(9, testLoopArray.length) == 9);
assert(loopIndex(10, testLoopArray.length) == 0);
assert(loopIndex(11, testLoopArray.length) == 1);
assert(loopIndex(0, testLoopArray.length) == 0);
assert(loopIndex(-1, testLoopArray.length) == 9);
assert(loopIndex(-2, testLoopArray.length) == 8);

  AFRAME.registerComponent('dynamic-room', {
    init: function () {
      var el = this.el;
      var params = this.getUrlParams();
  
      if (!params.room) {
        window.alert('Please add a room name in the URL, eg. ?room=myroom');
      }
  
      var webrtc = params.hasOwnProperty('webrtc');
      var adapter = webrtc ? 'easyrtc' : 'wseasyrtc';
      var voice = params.hasOwnProperty('voice');
      
      // Set local user's name
      var myNametag = document.querySelector('.nametag');
      myNametag.setAttribute('text', 'value', params.username);
      
      // Setup networked-scene
      var networkedComp = {
        room: params.room,
        adapter: adapter,
        audio: voice,
        video: true,
      };
      console.info('Init settings:', networkedComp);
      el.setAttribute('networked-scene', networkedComp);
    },
  
    getUrlParams: function () {
      var match;
      var pl = /\+/g;  // Regex for replacing addition symbol with a space
      var search = /([^&=]+)=?([^&]*)/g;
      var decode = function (s) { return decodeURIComponent(s.replace(pl, ' ')); };
      var query = window.location.search.substring(1);
      var urlParams = {};
  
      match = search.exec(query);
      while (match) {
        urlParams[decode(match[1])] = decode(match[2]);
        match = search.exec(query);
      }
      return urlParams;
    }
  });

  AFRAME.registerComponent('spawn-in-circle', {
      schema: {
        radius: {type: 'number', default: 1}
      },
    
      init: function() {
        var el = this.el;
        var center = el.getAttribute('position');
    
        var angleRad = this.getRandomAngleInRadians();
        var circlePoint = this.randomPointOnCircle(this.data.radius, angleRad);
        var worldPoint = {x: circlePoint.x + center.x, y: center.y, z: circlePoint.y + center.z};
        el.setAttribute('position', worldPoint);
    
        var angleDeg = angleRad * 180 / Math.PI;
        var angleToCenter = -1 * angleDeg + 90;
        var rotationStr = '0 ' + angleToCenter + ' 0';
        el.setAttribute('rotation', rotationStr);
      },
    
      getRandomAngleInRadians: function() {
        return Math.random()*Math.PI*2;
      },
    
      randomPointOnCircle: function (radius, angleRad) {
        var x = Math.cos(angleRad)*radius;
        var y = Math.sin(angleRad)*radius;
        return {x: x, y: y};
      }
  });

  // Managing skybox src attribute like a boss
  AFRAME.registerComponent('set-sky', {
    schema: {default:''},
    init: function() {
      this.timeout = setTimeout(this.updateSky.bind(this), 100);
      this.sky = this.el;
    },
    remove: function() {
      clearInterval(this.timeout);
      this.el.removeObject3D(this.object3D);
    },
    updateSky: function() {
      if(this.data == 'null') 
        this.sky.removeAttribute('src');
      else
        this.sky.setAttribute('src', this.data);
    }
  });

  // Grid components
  AFRAME.registerComponent('grid', {
    init: function(){
      this.grid = this.el;
      this.grid.setAttribute('geometry', 'primitive: plane; width: 10000; height: 10000;');
      this.grid.setAttribute('material', 'src: '+this.data.src+'; repeat: 10000 10000; transparent: true; metalness:0.6; roughness: 0.1; sphericalEnvMap: '+this.data.envMap+';');
      this.grid.setAttribute('position', '0 0 0');
      this.grid.setAttribute('rotation', '-90 0 0');
    },
    remove: function(){
      this.el.removeObject3D(this.object3D);
    },
  
  
  });

  AFRAME.registerComponent('videosphereexpand', {
    
    init: function () {
      let videosphere = document.querySelector("a-sky");
      // let homeworldelements = document.querySelectorAll(".homeworld");

      let videosphereloader = () => {    
        videosphere.setAttribute('src', '#myVideo');
        console.log("clicked")
        // homeworldelements.forEach((homeworldelement) => {
        //   homeworldelement.setAttribute("visible", false)
        // })
      }

      this.el.addEventListener('click', videosphereloader);
    }
  });

  // Angle the body slightly downward so the avatar neck is not stiff
  AFRAME.registerComponent('body', {
    init: function () {
      this.head = this.el.parentNode;
    },

    tick: function (time, delta) {
      if (!this.head) return;
      var rot = this.head.getAttribute('rotation');
      this.el.setAttribute('rotation', {x: -rot.x * 0.3, y: 0, z: -rot.z * 0.3});
    }
  });


  // Painting on the surface using the controller 
  AFRAME.registerComponent('painter', {

    schema: {
        color: {
          default: 'red',
          type: 'color'
        }
    },
  
    init: function () {
      
      let first = true;
      this.userData = {};

      this.initPaint();

      this.el.addEventListener('triggerdown', () => {
        if (first) {
          first = false;   
          return;
        }
        
        this.initPaint();
        this.userData.isSelecting = true;
        // set start
        this.cursor.setFromMatrixPosition(this.hand.object3D.matrixWorld);
        this.painter.moveTo(this.cursor);
      });

      this.el.addEventListener('triggerup', () => {
        this.userData.isSelecting = false;
        this.painter.removeInTime(this.hand.sceneEl.object3D, 5);
      });


      this.userData.isSelecting = false;
    },

    initPaint() {
      this.painter = new TubePainter();
      this.painter.setSize( 0.4 );
      this.painter.mesh.material.side = THREE.DoubleSide;
      this.painter.setColor(new THREE.Color(this.data.color));
      
      this.cursor = new THREE.Vector3();
      this.hand = this.el;
      this.hand.sceneEl.object3D.add(this.painter.mesh);
    },
  
    update() {
      this.painter.setColor(new THREE.Color(this.data.color));
    },
  
    tick: function () {
      var userData = this.userData;
      var painter = this.painter;
  
      if (userData.isSelecting === true) {
        this.cursor.setFromMatrixPosition(this.hand.object3D.matrixWorld);
        painter.lineTo(this.cursor);
        painter.update();
      }
    }
  
  });

  // Sync painting with other users
  AFRAME.registerSystem('sync', {
    init: function () {
      var brushSystem = this.el.systems.brush;
      this.previousStrokes = null;
  
      var toVector3 = function (obj) {
        return new THREE.Vector3(obj.x, obj.y, obj.z)
      }
  
      var toQuat = function (obj) {
        return new THREE.Vector4(obj._x, obj._y, obj._z, obj._w);
      }
   
      /* Sending */
  
      this.el.addEventListener('stroke-started', function (evt) {
        var json = evt.detail.stroke.getJSON(brushSystem);
        NAF.connection.broadcastDataGuaranteed('stroke-started', json);
      });
  
      this.el.addEventListener('stroke-point-added', function(evt) {
        delete evt.detail.target;
        NAF.connection.broadcastDataGuaranteed('stroke-point-added', evt.detail);
      });
  
      /* Receiving */
  
      NAF.connection.subscribeToDataChannel('stroke-started', function (senderId, type, data, targetId) {
        var brush = data.brush;
        var color = new THREE.Color().fromArray(brush.color);
        brushSystem.addNewStroke(brush.name, color, brush.size, brush.owner, brush.timestamp);
      });
  
      NAF.connection.subscribeToDataChannel('stroke-point-added', function (senderId, type, data, targetId) {
        data.position = toVector3(data.position);
        data.pointerPosition = toVector3(data.pointerPosition);
        data.orientation = toQuat(data.orientation);
  
        brushSystem.addPointToStroke(data);
      });
    }
  });

  // Just for some unneccessary fun e.g. phew phew phew... 
  AFRAME.registerComponent('gun', {
    schema: {
      bulletTemplate: {default: '#bullet-template'},
      triggerKeyCode: {default: 32} // spacebar
    },
  
    init: function() {
      var that = this;
      this.el.addEventListener('triggerdown', () => {
        that.shoot();
      });

      this.el.addEventListener('triggerup', () => {
        
      });
      
    },
  
    shoot: function() {
      this.createBullet();
    },
  
    createBullet: function() {
      var el = document.createElement('a-entity');
      el.setAttribute('networked', 'template:' + this.data.bulletTemplate);
      el.setAttribute('remove-in-seconds', 3);
      el.setAttribute('forward', 'speed:0.3');
  
      var tip = this.el;
      el.setAttribute('position', this.getInitialBulletPosition(tip));
      el.setAttribute('rotation', this.getInitialBulletRotation(tip));
  
      this.el.sceneEl.appendChild(el);
    },
  
    getInitialBulletPosition: function(spawnerEl) {
      var worldPos = new THREE.Vector3();
      worldPos.setFromMatrixPosition(spawnerEl.object3D.matrixWorld);
      return worldPos;
    },
  
    getInitialBulletRotation: function(spawnerEl) {
      var worldDirection = new THREE.Vector3();
  
      spawnerEl.object3D.getWorldDirection(worldDirection);
      worldDirection.multiplyScalar(-1);
      this.vec3RadToDeg(worldDirection);
  
      return worldDirection;
    },
  
    vec3RadToDeg: function(rad) {
      rad.set(rad.y * 90, -90 + (-THREE.Math.radToDeg(Math.atan2(rad.z, rad.x))), 0);
    }
  });

  // Its physics, the bullet always moves forward, duh! 
  AFRAME.registerComponent('forward', {
    schema: {
      speed: {default: 0.1},
    },
  
    init: function() {
      var worldDirection = new THREE.Vector3();
  
      this.el.object3D.getWorldDirection(worldDirection);
      worldDirection.multiplyScalar(-1);
  
      this.worldDirection = worldDirection;
      console.error(this.worldDirection);
    },
  
    tick: function() {
      var el = this.el;
  
      var currentPosition = el.getAttribute('position');
      var newPosition = this.worldDirection
        .clone()
        .multiplyScalar(this.data.speed)
        .add(currentPosition);
      el.setAttribute('position', newPosition);
    }
  });

  // Remove something after some seconds 
  AFRAME.registerComponent('remove-in-seconds', {
    schema: {
      default: 1
    },
  
    init: function() {
      setTimeout(this.destroy.bind(this), this.data * 1000);
    },
  
    destroy: function() {
      var el = this.el;
      el.parentNode.removeChild(el);
    }
  });

  // ...
  AFRAME.registerComponent('select-bar', {
	  schema: {
	    controls: { type: 'boolean', default: true },
	    controllerID: { type: 'string', default: 'rightController' }
	  },

	  // for a given optgroup, make the children
	  makeSelectOptionsRow: function makeSelectOptionsRow(selectedOptgroupEl, parentEl, index, offsetY, idPrefix) {

	    // make the optgroup label
	    var optgroupLabelEl = document.createElement("a-entity");

	    optgroupLabelEl.id = idPrefix + "optgroupLabel" + index;
	    optgroupLabelEl.setAttribute("position", "0.07 " + (0.045 + offsetY) + " -0.003");
	    optgroupLabelEl.setAttribute("scale", "0.5 0.5 0.5");
	    optgroupLabelEl.setAttribute("text", "value", selectedOptgroupEl.getAttribute('label'));
	    optgroupLabelEl.setAttribute("text", "color", "#747474");
	    parentEl.appendChild(optgroupLabelEl);

	    // get the options available for this optgroup row
	    var optionsElements = selectedOptgroupEl.getElementsByTagName("option"); // the actual JS children elements

	    // convert the NodeList of matching option elements into a Javascript Array
	    var optionsElementsArray = Array.prototype.slice.call(optionsElements);

	    var firstArray = optionsElementsArray.slice(0, 4); // get items 0 - 4
	    var previewArray = optionsElementsArray.slice(-3); // get the 3 LAST items of the array

	    // Combine into "menuArray", a list of currently visible options where the middle index is the currently selected object
	    var menuArray = previewArray.concat(firstArray);

	    var selectOptionsHTML = "";
	    var startPositionX = -0.225;
	    var deltaX = 0.075;

	    // For each menu option, create a preview element and its appropriate children
	    menuArray.forEach(function (element, menuArrayIndex) {
	      var visible = menuArrayIndex === 0 || menuArrayIndex === 6 ? false : true;
	      var selected = menuArrayIndex === 3;
	      // index of the optionsElementsArray where optionsElementsArray.element.getattribute("value") = element.getattribute("value")
	      var originalOptionsArrayIndex = findWithAttr(optionsElementsArray, "value", element.getAttribute("value"));
	      selectOptionsHTML += '\n      <a-entity id="' + idPrefix + originalOptionsArrayIndex + '" visible="' + visible + '" class="preview' + (selected ? " selected" : "") + '" optionid="' + originalOptionsArrayIndex + '" value="' + element.getAttribute("value") + '" optgroup="' + selectedOptgroupEl.getAttribute("value") + '" position="' + startPositionX + ' ' + offsetY + ' 0">\n        <a-box class="previewFrame" position="0 0 -0.003" scale="0.06 0.06 0.005" material="color: ' + (selected ? "yellow" : "#222222") + '"></a-box>\n        <a-image class="previewImage" scale="0.05 0.05 0.05" src="' + element.getAttribute("src") + '" ></a-image>\n        <a-entity class="objectName" position="0.065 -0.04 -0.003" scale="0.18 0.18 0.18" text="value: ' + element.text + '; color: ' + (selected ? "yellow" : "#747474") + '"></a-entity>\n      </a-entity>';
	      startPositionX += deltaX;
	    });

	    // Append these menu options to a new element with id of "selectOptionsRow"
	    var selectOptionsRowEl = document.createElement("a-entity");
	    selectOptionsRowEl.id = idPrefix + "selectOptionsRow" + index;
	    selectOptionsRowEl.innerHTML = selectOptionsHTML;
	    parentEl.appendChild(selectOptionsRowEl);
	  },

	  init: function init() {
	    // Create select bar menu from html child `option` elements beneath parent entity inspired by the html5 spec: http://www.w3schools.com/tags/tag_optgroup.asp
	    var selectEl = this.el; // Reference to the component's element.
	    this.lastTime = new Date();
	    this.selectedOptgroupValue = null;
	    this.selectedOptgroupIndex = 0;
	    this.selectedOptionValue = null;
	    this.selectedOptionIndex = 0;

	    // we want a consistent prefix when creating IDs
	    // if the parent has an id, use that; otherwise, use the string "menu"
	    this.idPrefix = selectEl.id ? selectEl.id : "menu";

	    // Create the "frame" of the select menu bar
	    var selectRenderEl = document.createElement("a-entity");
	    selectRenderEl.id = this.idPrefix + "selectRender";
	    selectRenderEl.innerHTML = '\n      <a-box id="' + this.idPrefix + 'Frame" scale="0.4 0.15 0.005" position="0 0 -0.0075"  material="opacity: 0.5; transparent: true; color: #000000"></a-box>\n      <a-entity id="' + this.idPrefix + 'arrowRight" position="0.225 0 0" rotation="90 180 0" scale="-0.004 0.002 0.004" obj-model="obj:#env_arrow" material="opacity: 0.5; transparent: true; color: #000000"></a-entity>\n      <a-entity id="' + this.idPrefix + 'arrowLeft" position="-0.225 0 0" rotation="90 180 0" scale="0.004 0.002 0.004" obj-model="obj:#env_arrow" material="opacity:0.5; transparent:true; color:#000000"></a-entity>\n      <a-entity id="' + this.idPrefix + 'arrowUp" position="0 0.1 0" rotation="0 270 90" scale="0.004 0.002 0.004" obj-model="obj:#env_arrow" material="opacity: 0.5; transparent: true; color: #000000"></a-entity>\n      <a-entity id="' + this.idPrefix + 'arrowDown" position="0 -0.1 0" rotation="0 270 90" scale="-0.004 0.002 0.004" obj-model="obj:#env_arrow" material="opacity: 0.5; transparent: true; color: #000000"></a-entity>\n      ';
	    selectEl.appendChild(selectRenderEl);

	    var optgroups = selectEl.getElementsByTagName("optgroup"); // Get the optgroups
	    var selectedOptgroupEl = optgroups[this.selectedOptgroupIndex]; // fetch the currently selected optgroup
	    this.selectedOptgroupValue = selectedOptgroupEl.getAttribute("value"); // set component property to opgroup value

	    this.makeSelectOptionsRow(selectedOptgroupEl, selectRenderEl, this.selectedOptgroupIndex, 0, this.idPrefix);

	    var options = selectedOptgroupEl.getElementsByTagName("option");
	    var selectedOptionEl = options[this.selectedOptionIndex];
	    this.selectedOptionValue = selectedOptionEl.getAttribute("value");
	  },

  });

  AFRAME.registerComponent('networked-video-src', {

    schema: {
    },
  
    dependencies: ['material'],
  
    init: function () {
      this.videoTexture = null;
      this.video = null;
      this.stream = null;
  
      this._setMediaStream = this._setMediaStream.bind(this);
  
      NAF.utils.getNetworkedEntity(this.el).then((networkedEl) => {
        const ownerId = networkedEl.components.networked.data.owner;
  
        if (ownerId) {
          NAF.connection.adapter.getMediaStream(ownerId, "video")
            .then(this._setMediaStream)
            .catch((e) => console.log(`Error getting media stream for ${ownerId}`, e));
        } else {
          // Correctly configured local entity, perhaps do something here for enabling debug audio loopback
        }
      });
    },
  
    _setMediaStream(newStream) {
  
      if(!this.video) {
        this.setupVideo();
      }
  
      if(newStream != this.stream) {
        if (this.stream) {
          this._clearMediaStream();
        }
  
        if (newStream) {
          this.video.srcObject = newStream;
  
          const playResult = this.video.play();
          if (playResult instanceof Promise) {
            playResult.catch((e) => console.log(`Error play video stream`, e));
          }
  
          if (this.videoTexture) {
            this.videoTexture.dispose();
          }
  
          this.videoTexture = new THREE.VideoTexture(this.video);
  
          const mesh = this.el.getObject3D('mesh');
          mesh.material.map = this.videoTexture;
          mesh.material.needsUpdate = true;
        }
  
        this.stream = newStream;
      }
    },
  
    _clearMediaStream() {
  
      this.stream = null;
  
      if (this.videoTexture) {
  
        if (this.videoTexture.image instanceof HTMLVideoElement) {
          // Note: this.videoTexture.image === this.video
          const video = this.videoTexture.image;
          video.pause();
          video.srcObject = null;
          video.load();
        }
  
        this.videoTexture.dispose();
        this.videoTexture = null;
      }
    },
  
    remove: function() {
        this._clearMediaStream();
    },
  
    setupVideo: function() {
      if (!this.video) {
        const video = document.createElement('video');
        video.setAttribute('autoplay', true);
        video.setAttribute('playsinline', true);
        video.setAttribute('muted', true);
        this.video = video;
      }
    }
  });