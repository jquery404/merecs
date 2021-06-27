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


  const usersMap = {};
  let streamerList = [];
  let isHosting;

  AFRAME.registerComponent('merecs-room', {
    init: function () {
      var el = this.el;
      var params = this.getUrlParams();
  
      if (!params.room) {
        window.alert('Please add a room name in the URL, eg. ?room=myroom');
      }
  
      var host = params.hasOwnProperty('host');
      var webrtc = params.hasOwnProperty('webrtc');
      var adapter = webrtc ? 'easyrtc' : 'wseasyrtc';
      var voice = params.hasOwnProperty('voice');
      isHosting = host ? true : false;
      
      // Set local user's name
      var myNametag = document.querySelector('.nametag');
      myNametag.setAttribute('text', 'value', (host?'(HOST)': '') + params.username);
      
      // Setup networked-scene
      var networkedComp = {
        room: params.room,
        adapter: adapter,
        audio: true,
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

  // Switching camera src of the skybox 
  AFRAME.registerComponent('videosphereexpand', {
    
    init: function () {
      this.vdo = this.el;
      let skybox = document.querySelector("a-sky");
      let videosphere = document.querySelector("a-videosphere");
      // let homeworldelements = document.querySelectorAll(".homeworld");
      
      
      let videosphereloader = () => { 
        skybox.getObject3D('mesh').material.map = videosphere.getObject3D('mesh').material.map;
        videosphere.setAttribute('visible', false);

        console.log("clicked")
        // homeworldelements.forEach((homeworldelement) => {
        //   homeworldelement.setAttribute("visible", false)
        // })
      }

      this.el.addEventListener('click', videosphereloader);
    }
  });

  // Tilt the body down slightly so that the avatar's neck is not stiff.
  AFRAME.registerComponent('body', {
    init: function () {
      this.head = this.el.parentNode;
    },

    tick: function (time, delta) {
      if (!this.head) return;
      var rot = this.head.getAttribute('rotation');
      this.el.setAttribute('rotation', {x: -rot.x * 0.5, y: 0, z: -rot.z * 0.5});
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
        NAF.connection.broadcastDataGuaranteed("stroke-start", this.hand.object3D.matrixWorld);
      });
      
      this.el.addEventListener('triggerup', () => {
        this.userData.isSelecting = false;
        NAF.connection.broadcastDataGuaranteed("stroke-ended", this.hand.object3D.matrixWorld);
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

    mapping: {
      axis0: 'trackpad',
      axis1: 'trackpad',
      button0: 'trackpad',
      button1: 'trigger',
      button2: 'grip',
      button3: 'menu',
      button4: 'system'
    },

    onButtonEvent: function (id, evtName) {
      var buttonName = this.mapping['button' + id];
      this.el.emit(buttonName + evtName);
      this.updateModel(buttonName, evtName);
    },
  
    updateModel: function (buttonName, state) {
      console.log(buttonName, state);
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
        NAF.connection.broadcastDataGuaranteed("stroke-started", this.hand.object3D.matrixWorld);
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
    },
  
    init: function() {
      this.el.addEventListener('gun-fire', this.onGunFire.bind(this));
    },

    onGunFire: function() {
      this.shoot();
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
	    controllerID: { type: 'string', default: 'leftHandController' }
	  },

	  // for a given optgroup, make the children
	  makeSelectOptionsRow: function (selectedOptgroupEl, parentEl, index, offsetY, idPrefix) {

	    // make the optgroup label
	    var optgroupLabelEl = document.createElement("a-entity");

	    optgroupLabelEl.id = idPrefix + "optgroupLabel" + index;
	    optgroupLabelEl.setAttribute("position", "0.07 " + (0.045 + offsetY) + " -0.003");
	    optgroupLabelEl.setAttribute("scale", "0.5 0.5 0.5");
	    optgroupLabelEl.setAttribute("text", "value", selectedOptgroupEl.getAttribute('label'));
	    optgroupLabelEl.setAttribute("text", "color", "#747474");
	    parentEl.appendChild(optgroupLabelEl);

	    var optionsElements = selectedOptgroupEl.getElementsByTagName("option"); 
	    var optionsElementsArray = Array.prototype.slice.call(optionsElements);

	    var firstArray = optionsElementsArray.slice(0, 4); // get items 0 - 4
	    var previewArray = optionsElementsArray.slice(-3); // get the 3 LAST items of the array
      var menuArray = previewArray.concat(firstArray);

	    var selectOptionsHTML = "";
	    var startPositionX = -0.225;
	    var deltaX = 0.075;

	    menuArray.forEach(function (element, menuArrayIndex) {
	      var visible = menuArrayIndex === 0 || menuArrayIndex === 6 ? false : true;
	      var selected = menuArrayIndex === 3;
	      var originalOptionsArrayIndex = findWithAttr(optionsElementsArray, "value", element.getAttribute("value"));
	      selectOptionsHTML += '\n<a-entity id="' + idPrefix + originalOptionsArrayIndex + '" visible="' + visible + '" class="preview' + (selected ? " selected" : "") + '" optionid="' + originalOptionsArrayIndex + '" value="' + element.getAttribute("value") + '" optgroup="' + selectedOptgroupEl.getAttribute("value") + '" position="' + startPositionX + ' ' + offsetY + ' 0">\n        <a-box class="previewFrame" position="0 0 -0.003" scale="0.06 0.06 0.005" material="color: ' + (selected ? "yellow" : "#222222") + '"></a-box>\n        <a-image class="previewImage" scale="0.05 0.05 0.05" src="' + element.getAttribute("src") + '" ></a-image>\n        <a-entity class="objectName" position="0.065 -0.04 -0.003" scale="0.18 0.18 0.18" text="value: ' + element.text + '; color: ' + (selected ? "yellow" : "#747474") + '"></a-entity>\n</a-entity>';
	      startPositionX += deltaX;
	    });

	    var selectOptionsRowEl = document.createElement("a-entity");
	    selectOptionsRowEl.id = idPrefix + "selectOptionsRow" + index;
	    selectOptionsRowEl.innerHTML = selectOptionsHTML;
	    parentEl.appendChild(selectOptionsRowEl);
	  },

	  init: function () {
      var selectEl = this.el; 
      this.lastTime = new Date();
      this.selectedOptgroupValue = null;
      this.selectedOptgroupIndex = 0;
      this.selectedOptionValue = null;
      this.selectedOptionIndex = 0;
      this.idPrefix = selectEl.id ? selectEl.id : "menu";
  
      var selectRenderEl = document.createElement("a-entity");
      selectRenderEl.id = this.idPrefix + "selectRender";
      
      selectRenderEl.innerHTML = `
        <a-box id="${this.idPrefix}Frame" scale="0.4 0.15 0.005" position="0 0 -0.0075"  material="opacity: 0.5; transparent: true; color: #000000"></a-box>
        <a-entity id="${this.idPrefix}arrowRight" position="0.225 0 0" rotation="90 180 0" scale="-0.004 0.002 0.004" obj-model="obj:#env_arrow" material="opacity: 0.5; transparent: true; color: #000000"></a-entity>
        <a-entity id="${this.idPrefix}arrowLeft" position="-0.225 0 0" rotation="90 180 0" scale="0.004 0.002 0.004" obj-model="obj:#env_arrow" material="opacity:0.5; transparent:true; color:#000000"></a-entity>
        <a-entity id="${this.idPrefix}arrowUp" position="0 0.1 0" rotation="0 270 90" scale="0.004 0.002 0.004" obj-model="obj:#env_arrow" material="opacity: 0.5; transparent: true; color: #000000"></a-entity>
        <a-entity id="${this.idPrefix}arrowDown" position="0 -0.1 0" rotation="0 270 90" scale="-0.004 0.002 0.004" obj-model="obj:#env_arrow" material="opacity: 0.5; transparent: true; color: #000000"></a-entity>
        `;
      selectEl.appendChild(selectRenderEl);
  
      var optgroups = selectEl.getElementsByTagName("optgroup");  
      var selectedOptgroupEl = optgroups[this.selectedOptgroupIndex];  
      this.selectedOptgroupValue = selectedOptgroupEl.getAttribute("value");
  
      this.makeSelectOptionsRow(selectedOptgroupEl, selectRenderEl, this.selectedOptgroupIndex, 0, this.idPrefix);
  
      var options = selectedOptgroupEl.getElementsByTagName("option");
      var selectedOptionEl = options[this.selectedOptionIndex];
      this.selectedOptionValue = selectedOptionEl.getAttribute("value");
    },

    addEventListeners: function () {
      if (this.data.controls && this.data.controllerID) {
        var controllerEl = document.getElementById(this.data.controllerID);
        controllerEl.addEventListener('trackpaddown', this.onTrackpadDown.bind(this));
        controllerEl.addEventListener('axismove', this.onAxisMove.bind(this));
        controllerEl.addEventListener('triggerdown', this.onTriggerDown.bind(this));
      }
  
      var el = this.el;
      el.addEventListener('onHoverLeft', this.onHoverLeft.bind(this));
      el.addEventListener('onHoverRight', this.onHoverRight.bind(this));
      el.addEventListener('onOptionSwitch', this.onOptionSwitch.bind(this));
      el.addEventListener('onOptionNext', this.onOptionNext.bind(this));
      el.addEventListener('onOptionPrevious', this.onOptionPrevious.bind(this));
      el.addEventListener('onOptgroupNext', this.onOptgroupNext.bind(this));
      el.addEventListener('onOptgroupPrevious', this.onOptgroupPrevious.bind(this));
    },

    removeEventListeners: function () {
      if (this.data.controls && this.data.controllerID) {
        var controllerEl = document.getElementById(this.data.controllerID);
        controllerEl.removeEventListener('trackpaddown', this.onTrackpadDown);
        controllerEl.removeEventListener('axismove', this.onAxisMove);
        controllerEl.removeEventListener('triggerdown', this.onTriggerDown);
      }
  
      var el = this.el;
      el.removeEventListener('onOptionSwitch', this.onOptionSwitch);
      el.removeEventListener('onHoverRight', this.onHoverRight);
      el.removeEventListener('onHoverLeft', this.onHoverLeft);
      el.removeEventListener('onOptionNext', this.onOptionNext);
      el.removeEventListener('onOptionPrevious', this.onOptionPrevious);
      el.removeEventListener('onOptgroupNext', this.onOptgroupNext);
      el.removeEventListener('onOptgroupPrevious', this.onOptgroupPrevious);
  
    },

    play: function () {
      this.addEventListeners();
    },

    pause: function () {
      this.removeEventListeners();
    },

    remove: function () {
      this.removeEventListeners();
    },

    onTriggerDown: function(evt) {
      if (evt.target.id != this.data.controllerID) { 
        return;
      }
      this.el.emit("menuSelected");
    },
  
    onAxisMove: function(evt) { 
      if (evt.target.id != this.data.controllerID) { 
        return;
      }
      
      // only run this function if there is some value for at least one axis
      // if (evt.detail.axis[0] === 0 && evt.detail.axis[1] === 0) {
      //   return;
      // }
  
      var isOculus = false;
      var gamepads = navigator.getGamepads();
      if (gamepads) {
        for (var i = 0; i < gamepads.length; i++) {
          var gamepad = gamepads[i];
          if (gamepad) {
            if (gamepad.id.indexOf('Oculus Touch') === 0) {
             console.log("isOculus");
              isOculus = true;
            }
          }
        }
      }
  
    //  console.log("axis[2]: " + evt.detail.axis[2] + " left -1; right +1");
    //  console.log("axis[3]: " + evt.detail.axis[3] + " down -1; up +1");
    //  console.log(evt.target.id);
  
      // which axis has largest absolute value? then use that axis value to determine hover position
  //    console.log(evt.detail.axis[0]);
      if (Math.abs(evt.detail.axis[2]) > Math.abs(evt.detail.axis[3])) { // if x axis absolute value (left/right) is greater than y axis (down/up)
        if (evt.detail.axis[2] > 0) { // if the right axis is greater than 0 (midpoint)
          this.onHoverRight();
        } else {
          this.onHoverLeft();
        }
      } else {
  
        if (isOculus) {
          var yAxis = -evt.detail.axis[3];
        } else {
          var yAxis = evt.detail.axis[3];
        }
  
        if (yAxis > 0) { // if the up axis is greater than 0 (midpoint)
          this.onHoverUp();
        } else {
          this.onHoverDown();
        }
      }
  
      // if using the oculus touch controls, and thumbstick is >85% in any direction then fire ontrackpaddown
      var gamepads = navigator.getGamepads();
      if (gamepads) {
        for (var i = 0; i < gamepads.length; i++) {
          var gamepad = gamepads[i];
          if (gamepad) {
            if (gamepad.id.indexOf('Oculus Touch') === 0) {
              if (Math.abs(evt.detail.axis[2]) > 0.85 || Math.abs(evt.detail.axis[3]) > 0.85) {
  
                // debounce (throttle) such that this only runs once every 1/2 second max
                var thisTime = new Date();
                if ( Math.floor(thisTime - this.lastTime) > 500 ) {
                  this.lastTime = thisTime;
                  this.onTrackpadDown(evt);
                }
  
                return;
  
              }
            }
          }
        }
      }
    },

    onHoverRight: function () {
      this.el.emit("menuHoverRight");
      var arrow = document.getElementById(this.idPrefix + "arrowRight");
      var currentArrowColor = new THREE.Color(arrow.getAttribute("material").color);
      if (currentArrowColor.r === 0) { // if not already some shade of yellow (which indicates recent button press) then animate green hover
        arrow.removeAttribute('animation__color');
        arrow.removeAttribute('animation__opacity');
        arrow.setAttribute('animation__color', { property: 'material.color', dur: 500, from: "#00FF00", to: "#000000" });
        arrow.setAttribute('animation__opacity', { property: 'material.opacity', dur: 500, from: "1", to: "0.5" });
      }
      this.onOptionSwitch("next");
    },
  
    onHoverLeft: function () {
      this.el.emit("menuHoverLeft");
      var arrow = document.getElementById(this.idPrefix + "arrowLeft");
      var currentArrowColor = new THREE.Color(arrow.getAttribute("material").color);
      if (currentArrowColor.r === 0) { 
        arrow.removeAttribute('animation__color');
        arrow.removeAttribute('animation__opacity');
        arrow.setAttribute('animation__color', { property: 'material.color', dur: 500, from: "#00FF00", to: "#000000" });
        arrow.setAttribute('animation__opacity', { property: 'material.opacity', dur: 500, from: "1", to: "0.5" });
      }
      this.onOptionSwitch("prev");
    },
  
    onHoverDown: function () {
      this.el.emit("menuHoverDown");
      var selectEl = this.el;
      var optgroups = selectEl.getElementsByTagName("optgroup");  // Get the optgroups
  
      var arrow = document.getElementById(this.idPrefix + "arrowDown");
      var currentArrowColor = new THREE.Color(arrow.getAttribute("material").color);
      if ( !(currentArrowColor.r > 0 && currentArrowColor.g > 0) ) {
        if (this.selectedOptgroupIndex + 2 > optgroups.length) {
          var arrowColor = "#FF0000";
        } else {
          var arrowColor = "#00FF00";
        }
        arrow.removeAttribute('animation__color');
        arrow.removeAttribute('animation__opacity');
        arrow.setAttribute('animation__color', { property: 'material.color', dur: 500, from: arrowColor, to: "#000000" });
        arrow.setAttribute('animation__opacity', { property: 'material.opacity', dur: 500, from: "1", to: "0.5" });
      }
    },
  
    onHoverUp: function () {
      this.el.emit("menuHoverUp");
  //    var selectEl = this.el;
  //    var optgroups = selectEl.getElementsByTagName("optgroup");  // Get the optgroups
  
      var arrow = document.getElementById(this.idPrefix + "arrowUp");
      var currentArrowColor = new THREE.Color(arrow.getAttribute("material").color);
      if ( !(currentArrowColor.r > 0 && currentArrowColor.g > 0) ) { // if not already some shade of yellow (which indicates recent button press) then animate green hover
        if (this.selectedOptgroupIndex - 1 < 0) {
           // CAN'T DO - ALREADY AT END OF LIST
           var arrowColor = "#FF0000";
         } else {
           var arrowColor = "#00FF00";
         }
         arrow.removeAttribute('animation__color');
         arrow.removeAttribute('animation__opacity');
         arrow.setAttribute('animation__color', { property: 'material.color', dur: 500, from: arrowColor, to: "#000000" });
         arrow.setAttribute('animation__opacity', { property: 'material.opacity', dur: 500, from: "1", to: "0.5" });
      }
    },
  
    onOptionNext: function (evt) {
      this.onOptionSwitch("next");
      console.log("next");
    },
  
    onOptionPrevious: function (evt) {
      this.onOptionSwitch("previous");
      console.log("prev");
    },
  
    onOptgroupNext: function(evt) {
      var selectEl = this.el;
      var optgroups = selectEl.getElementsByTagName("optgroup");  // Get the optgroups
      var selectRenderEl = document.getElementById(this.idPrefix + "selectRender");
  
      if (this.selectedOptgroupIndex + 2 > optgroups.length) {
        // CAN'T DO THIS, show red arrow
        var arrow = document.getElementById(this.idPrefix + "arrowDown");
        arrow.removeAttribute('animation__color');
        arrow.removeAttribute('animation__opacity');
        arrow.removeAttribute('animation__scale');
        arrow.setAttribute('animation__color', { property: 'material.color', dur: 500, from: "#FF0000", to: "#000000" });
        arrow.setAttribute('animation__opacity', { property: 'material.opacity', dur: 500, from: "1", to: "0.5" });
        arrow.setAttribute('animation__scale', { property: 'scale', dur: 500, from: "-0.006 0.003 0.006", to: "-0.004 0.002 0.004" });
  
      } else {
        // CAN DO THIS, show next optgroup
  
        this.removeSelectOptionsRow(this.selectedOptgroupIndex); // remove the old optgroup row
  
        this.selectedOptgroupIndex += 1;
        var selectedOptgroupEl = optgroups[this.selectedOptgroupIndex];  // fetch the currently selected optgroup
        this.selectedOptgroupValue = selectedOptgroupEl.getAttribute("value"); // set component property to opgroup value
  
        this.el.flushToDOM();
  
        var nextSelectedOptgroupEl = optgroups[this.selectedOptgroupIndex];  // fetch the currently selected optgroup
        // this.makeSelectOptionsRow(nextSelectedOptgroupEl, selectRenderEl, this.selectedOptgroupIndex, -0.15);
        this.makeSelectOptionsRow(nextSelectedOptgroupEl, selectRenderEl, this.selectedOptgroupIndex, 0, this.idPrefix);
  
        // Change selected option element when optgroup is changed
        var selectOptionsRowEl = document.getElementById(this.idPrefix + 'selectOptionsRow' + this.selectedOptgroupIndex);
        var newlySelectedMenuEl = selectOptionsRowEl.getElementsByClassName('selected')[0];
  
        // update selectOptionsValue and Index
        this.selectedOptionValue = newlySelectedMenuEl.getAttribute("value");
        this.selectedOptionIndex = newlySelectedMenuEl.getAttribute("optionid");
  
        this.el.flushToDOM();
  
        this.el.emit("menuOptgroupNext");
        this.el.emit("menuChanged");
  
        var arrow = document.getElementById(this.idPrefix + "arrowDown");
        arrow.removeAttribute('animation__color');
        arrow.removeAttribute('animation__opacity');
        arrow.removeAttribute('animation__scale');
        arrow.setAttribute('animation__color', { property: 'material.color', dur: 500, from: "#FFFF00", to: "#000000" });
        arrow.setAttribute('animation__opacity', { property: 'material.opacity', dur: 500, from: "1", to: "0.5" });
        arrow.setAttribute('animation__scale', { property: 'scale', dur: 500, from: "-0.006 0.003 0.006", to: "-0.004 0.002 0.004" });
      }
  
    },
  
    onOptgroupPrevious: function(evt) {
      var selectEl = this.el;
      var optgroups = selectEl.getElementsByTagName("optgroup");  // Get the optgroups
      var selectRenderEl = document.getElementById(this.idPrefix + "selectRender");
  
      if (this.selectedOptgroupIndex - 1 < 0) {
        // CAN'T DO THIS, show red arrow
        var arrow = document.getElementById(this.idPrefix + "arrowUp");
        arrow.removeAttribute('animation__color');
        arrow.removeAttribute('animation__opacity');
        arrow.removeAttribute('animation__scale');
        arrow.setAttribute('animation__color', { property: 'material.color', dur: 500, from: "#FF0000", to: "#000000" });
        arrow.setAttribute('animation__opacity', { property: 'material.opacity', dur: 500, from: "1", to: "0.5" });
        arrow.setAttribute('animation__scale', { property: 'scale', dur: 500, from: "0.006 0.003 0.006", to: "0.004 0.002 0.004" });
  
      } else {
        // CAN DO THIS, show previous optgroup
  
        this.removeSelectOptionsRow(this.selectedOptgroupIndex); // remove the old optgroup row
  
        this.selectedOptgroupIndex -= 1;
        var selectedOptgroupEl = optgroups[this.selectedOptgroupIndex];  // fetch the currently selected optgroup
        this.selectedOptgroupValue = selectedOptgroupEl.getAttribute("value"); // set component property to opgroup value
  
        this.el.flushToDOM();
  
        var nextSelectedOptgroupEl = optgroups[this.selectedOptgroupIndex];  // fetch the currently selected optgroup
        // this.makeSelectOptionsRow(nextSelectedOptgroupEl, selectRenderEl, this.selectedOptgroupIndex, -0.15);
        this.makeSelectOptionsRow(nextSelectedOptgroupEl, selectRenderEl, this.selectedOptgroupIndex, 0, this.idPrefix);
  
        // Change selected option element when optgroup is changed
        var selectOptionsRowEl = document.getElementById(this.idPrefix + 'selectOptionsRow' + this.selectedOptgroupIndex);
        var newlySelectedMenuEl = selectOptionsRowEl.getElementsByClassName('selected')[0];
  
        // update selectOptionsValue and Index
        this.selectedOptionValue = newlySelectedMenuEl.getAttribute("value");
        this.selectedOptionIndex = newlySelectedMenuEl.getAttribute("optionid");
  
        this.el.flushToDOM();
  
        this.el.emit("menuOptgroupPrevious");
        this.el.emit("menuChanged");
  
        var arrow = document.getElementById(this.idPrefix + "arrowUp");
        arrow.removeAttribute('animation__color');
        arrow.removeAttribute('animation__opacity');
        arrow.removeAttribute('animation__scale');
        arrow.setAttribute('animation__color', { property: 'material.color', dur: 500, from: "#FFFF00", to: "#000000" });
        arrow.setAttribute('animation__opacity', { property: 'material.opacity', dur: 500, from: "1", to: "0.5" });
        arrow.setAttribute('animation__scale', { property: 'scale', dur: 500, from: "0.006 0.003 0.006", to: "0.004 0.002 0.004" });
      }
  
    },
  
    onTrackpadDown: function (evt) {
      //menu: only deal with trackpad events from controller specified in component property
      if (evt.target.id != this.data.controllerID) {
        return;
      }
      // Which direction should the trackpad trigger?
  
      // Each of the 4 arrow's green intensity is inversely correlated with time elapsed since last hover event on that axis
      // To determine which direction to move upon button press, move in the direction with the most green color intensity
  
      // Fetch all 4 green values and place in an array starting with up, right, down, left arrow colors (clockwise from top)
      var arrowUpColor = new THREE.Color(document.getElementById(this.idPrefix + "arrowUp").getAttribute("material").color);
      var arrowRightColor = new THREE.Color(document.getElementById(this.idPrefix + "arrowRight").getAttribute("material").color);
      var arrowDownColor = new THREE.Color(document.getElementById(this.idPrefix + "arrowDown").getAttribute("material").color);
      var arrowLeftColor = new THREE.Color(document.getElementById(this.idPrefix + "arrowLeft").getAttribute("material").color);
  //    var arrowColorArray = [arrowUpColor, arrowRightColor, arrowDownColor, arrowLeftColor];
      var arrowColorArrayGreen = [arrowUpColor.g, arrowRightColor.g, arrowDownColor.g, arrowLeftColor.g];
  
      if ( arrowColorArrayGreen.reduce((a, b) => a + b, 0) > 0) { // if at least one value is > 0
        switch (indexOfMax(arrowColorArrayGreen)) {         // Determine which value in the array is the largest
          case 0:        // up
            this.onOptgroupPrevious();
  //          console.log("PRESSup");
            return; // without this return the other cases are fired - weird!
          case 1:        // right
            this.onOptionSwitch("next");
  //          console.log("PRESSright");
            return;
          case 2:        // down
            this.onOptgroupNext();
  //          console.log("PRESSdown");
            return;
          case 3:        // left
            this.onOptionSwitch("previous");
  //          console.log("PRESSleft");
            return;
        }
      }
  
    },
  
    onOptionSwitch: function (direction) {
      var selectOptionsRowEl = document.getElementById(this.idPrefix + 'selectOptionsRow' + this.selectedOptgroupIndex);
  
      const oldMenuEl = selectOptionsRowEl.getElementsByClassName('selected')[0];
        
      var oldSelectedOptionIndex = parseInt(oldMenuEl.getAttribute("optionid"));
      var selectedOptionIndex = oldSelectedOptionIndex;
        
      var selectEl = this.el;
      var optgroups = selectEl.getElementsByTagName("optgroup");  
      var selectedOptgroupEl = optgroups[this.selectedOptgroupIndex];
  
      if (direction == 'previous') {
        this.el.emit("menuPrevious");
        selectedOptionIndex = loopIndex(selectedOptionIndex -= 1, selectedOptgroupEl.childElementCount);
        
        // menu: animate arrow LEFT
        var arrowLeft = document.getElementById(this.idPrefix + "arrowLeft");
        arrowLeft.removeAttribute('animation__color');
        arrowLeft.removeAttribute('animation__opacity');
        arrowLeft.removeAttribute('animation__scale');
        arrowLeft.setAttribute('animation__color', { property: 'material.color', dur: 500, from: "#FFFF00", to: "#000000" });
        arrowLeft.setAttribute('animation__opacity', { property: 'material.opacity', dur: 500, from: "1", to: "0.5" });
        // arrowLeft.setAttribute('animation__scale', { property: 'scale', dur: 500, from: "0.006 0.003 0.006", to: "0.004 0.002 0.004" });
  
        // menu: get the newly selected menu element
        const newMenuEl = selectOptionsRowEl.querySelectorAll("[optionid='" + selectedOptionIndex + "']")[0];
  
        // menu: remove selected class and change colors
        oldMenuEl.classList.remove("selected");
        newMenuEl.classList.add("selected");
        this.selectedOptionValue = newMenuEl.getAttribute("value");
        console.log(this.selectedOptionValue);
        this.selectedOptionIndex = selectedOptionIndex;
        this.el.flushToDOM();
        this.el.emit("menuChanged");
        oldMenuEl.getElementsByClassName("objectName")[0].setAttribute('text', 'color', 'gray');
        newMenuEl.getElementsByClassName("objectName")[0].setAttribute('text', 'color', 'yellow');
        oldMenuEl.getElementsByClassName("previewFrame")[0].setAttribute('material', 'color', '#222222');
        newMenuEl.getElementsByClassName("previewFrame")[0].setAttribute('material', 'color', 'yellow');
  
        // menu: slide the menu list row RIGHT by 1
        if (selectOptionsRowEl.hasAttribute("desiredPosition")) {
          var oldPosition = selectOptionsRowEl.getAttribute("desiredPosition");
          var newX = parseFloat(oldPosition.split(" ")[0]) + 0.075;
          var newPositionString = newX.toString() + " " + oldPosition.split(" ")[1] + " " + oldPosition.split(" ")[2];
        } else {
          var oldPosition = selectOptionsRowEl.object3D.position;
          var newX = oldPosition.x + 0.075; 
          var newPositionString = newX.toString() + " " + oldPosition.y + " " + oldPosition.z;
        }
        selectOptionsRowEl.removeAttribute('animation__slide');
        selectOptionsRowEl.setAttribute('animation__slide', { property: 'position', dur: 500, from: oldPosition, to: newPositionString });
        selectOptionsRowEl.setAttribute('desiredPosition', newPositionString);
  
        // menu: make the hidden most LEFTmost object (-3 from oldMenuEl index) visible
        var newlyVisibleOptionIndex = loopIndex(oldSelectedOptionIndex - 3, selectedOptgroupEl.childElementCount);
        var newlyVisibleOptionEl = selectOptionsRowEl.querySelectorAll("[optionid='" + newlyVisibleOptionIndex + "']")[0];
  
        // make visible and animate
        newlyVisibleOptionEl.setAttribute('visible','true');
        newlyVisibleOptionEl.removeAttribute('animation');
        // newlyVisibleOptionEl.setAttribute('animation', { property: 'scale', dur: 500, from: '0.5 0.5 0.5', to: '1.0 1.0 1.0' });
        newlyVisibleOptionEl.flushToDOM();
  
        // menu: destroy the hidden most RIGHTmost object (+3 from oldMenuEl index)
        var newlyRemovedOptionIndex = loopIndex(oldSelectedOptionIndex + 3, selectedOptgroupEl.childElementCount);
        var newlyRemovedOptionEl = selectOptionsRowEl.querySelectorAll("[optionid='" + newlyRemovedOptionIndex + "']")[0];
        newlyRemovedOptionEl.flushToDOM();
        newlyRemovedOptionEl.parentNode.removeChild(newlyRemovedOptionEl);
  
        // menu: make the second RIGHTmost object (+2 from oldMenuEl index) invisible
        var newlyInvisibleOptionIndex = loopIndex(oldSelectedOptionIndex + 2, selectedOptgroupEl.childElementCount);
        var newlyInvisibleOptionEl = selectOptionsRowEl.querySelectorAll("[optionid='" + newlyInvisibleOptionIndex + "']")[0];
        newlyInvisibleOptionEl.setAttribute('visible', 'false');
        newlyInvisibleOptionEl.flushToDOM();
  
        // menu: Create the next LEFTmost object preview (-4 from oldMenuEl index) but keep it hidden until it's needed
        var newlyCreatedOptionEl = newlyVisibleOptionEl.cloneNode(true);
        newlyCreatedOptionEl.setAttribute('visible', 'false');
        var newlyCreatedOptionIndex = loopIndex(oldSelectedOptionIndex - 4, selectedOptgroupEl.childElementCount);
  
        // get the actual "option" element that is the source of truth for value, image src and label so that we can populate the new menu option
        var sourceOptionEl = selectedOptgroupEl.children[newlyCreatedOptionIndex];
  
        newlyCreatedOptionEl.setAttribute('optionid', newlyCreatedOptionIndex);
        newlyCreatedOptionEl.setAttribute('id', this.idPrefix + newlyCreatedOptionIndex);
        newlyCreatedOptionEl.setAttribute('value', sourceOptionEl.getAttribute("value"));
  
        var newlyVisibleOptionPosition = newlyVisibleOptionEl.object3D.position;
        newlyCreatedOptionEl.setAttribute('position', (newlyVisibleOptionPosition.x - 0.075) + " " + newlyVisibleOptionPosition.y + " " + newlyVisibleOptionPosition.z);
        newlyCreatedOptionEl.flushToDOM();
  
        // menu: add the newly cloned and modified menu object preview to the dom
        selectOptionsRowEl.insertBefore( newlyCreatedOptionEl, selectOptionsRowEl.firstChild );
  
        // menu: get child elements for image and name, populate both appropriately
        var appendedNewlyCreatedOptionEl = selectOptionsRowEl.querySelectorAll("[optionid='" + newlyCreatedOptionIndex + "']")[0];
        appendedNewlyCreatedOptionEl.getElementsByClassName("previewImage")[0].setAttribute('src', sourceOptionEl.getAttribute("src"))
        appendedNewlyCreatedOptionEl.getElementsByClassName("objectName")[0].setAttribute('text', 'value', sourceOptionEl.text);
        appendedNewlyCreatedOptionEl.getElementsByClassName("objectName")[0].setAttribute('text', 'color', '#747474');
        appendedNewlyCreatedOptionEl.flushToDOM();
  
      } else {
        this.el.emit("menuNext");
        // NEXT OPTION MENU START ===============================
        selectedOptionIndex = loopIndex(selectedOptionIndex += 1, selectedOptgroupEl.childElementCount);
  
        // menu: animate arrow right
        var arrowRight = document.getElementById(this.idPrefix + "arrowRight");
        arrowRight.removeAttribute('animation__color');
        arrowRight.removeAttribute('animation__opacity');
        arrowRight.removeAttribute('animation__scale');
        arrowRight.setAttribute('animation__color', { property: 'material.color', dur: 500, from: "#FFFF00", to: "#000000" });
        arrowRight.setAttribute('animation__opacity', { property: 'material.opacity', dur: 500, from: "1", to: "0.5" });
        // arrowRight.setAttribute('animation__scale', { property: 'scale', dur: 500, from: "-0.006 0.003 0.006", to: "-0.004 0.002 0.004" });
  
        // menu: get the newly selected menu element
        const newMenuEl = selectOptionsRowEl.querySelectorAll("[optionid='" + selectedOptionIndex + "']")[0];
  
        // menu: remove selected class and change colors
        oldMenuEl.classList.remove("selected");
        newMenuEl.classList.add("selected");
        this.selectedOptionValue = newMenuEl.getAttribute("value");
        this.selectedOptionIndex = selectedOptionIndex;
        this.el.flushToDOM();
        this.el.emit("menuChanged");
        oldMenuEl.getElementsByClassName("objectName")[0].setAttribute('text', 'color', 'gray');
        newMenuEl.getElementsByClassName("objectName")[0].setAttribute('text', 'color', 'yellow');
        oldMenuEl.getElementsByClassName("previewFrame")[0].setAttribute('material', 'color', '#222222');
        newMenuEl.getElementsByClassName("previewFrame")[0].setAttribute('material', 'color', 'yellow');
  
        // menu: slide the menu list left by 1
  //      const selectOptionsRowEl = document.querySelector("#selectOptionsRow");
        // use the desiredPosition attribute (if exists) instead of object3D position as animation may not be done yet
        // TODO - error with this code when looping through index
  
  //      console.log("'true' old position");
  //      console.log(selectOptionsRowEl.object3D.position);
  
        if (selectOptionsRowEl.hasAttribute("desiredPosition")) {
          var oldPosition = selectOptionsRowEl.getAttribute("desiredPosition");
          var newX = parseFloat(oldPosition.split(" ")[0]) - 0.075;
          var newPositionString = newX.toString() + " " + oldPosition.split(" ")[1] + " " + oldPosition.split(" ")[2];
        } else {
          var oldPosition = selectOptionsRowEl.object3D.position;
          var newX = oldPosition.x - 0.075; // this could be a variable soon
          var newPositionString = newX.toString() + " " + oldPosition.y + " " + oldPosition.z;
        }
        selectOptionsRowEl.removeAttribute('animation__slide');
        selectOptionsRowEl.setAttribute('animation__slide', { property: 'position', dur: 500, from: oldPosition, to: newPositionString });
        selectOptionsRowEl.setAttribute('desiredPosition', newPositionString);
  
        // menu: make the hidden most rightmost object (+3 from oldMenuEl index) visible
        var newlyVisibleOptionIndex = loopIndex(oldSelectedOptionIndex + 3, selectedOptgroupEl.childElementCount);
        var newlyVisibleOptionEl = selectOptionsRowEl.querySelectorAll("[optionid='" + newlyVisibleOptionIndex + "']")[0];
  
        // make visible and animate
        newlyVisibleOptionEl.setAttribute('visible','true');
        newlyVisibleOptionEl.removeAttribute('animation');
        // newlyVisibleOptionEl.setAttribute('animation', { property: 'scale', dur: 500, from: '0.5 0.5 0.5', to: '1.0 1.0 1.0' });
        newlyVisibleOptionEl.flushToDOM();
  
        // menu: destroy the hidden most leftmost object (-3 from oldMenuEl index)
        var newlyRemovedOptionIndex = loopIndex(oldSelectedOptionIndex - 3, selectedOptgroupEl.childElementCount);
        var newlyRemovedOptionEl = selectOptionsRowEl.querySelectorAll("[optionid='" + newlyRemovedOptionIndex + "']")[0];
        newlyRemovedOptionEl.flushToDOM();
        newlyRemovedOptionEl.parentNode.removeChild(newlyRemovedOptionEl);
  
        // menu: make the second leftmost object (-2 from oldMenuEl index) invisible
        var newlyInvisibleOptionIndex = loopIndex(oldSelectedOptionIndex - 2, selectedOptgroupEl.childElementCount);
        var newlyInvisibleOptionEl = selectOptionsRowEl.querySelectorAll("[optionid='" + newlyInvisibleOptionIndex + "']")[0];
        newlyInvisibleOptionEl.setAttribute('visible', 'false');
        newlyInvisibleOptionEl.flushToDOM();
  
        // menu: Create the next rightmost object preview (+4 from oldMenuEl index) but keep it hidden until it's needed
        var newlyCreatedOptionEl = newlyVisibleOptionEl.cloneNode(true);
        newlyCreatedOptionEl.setAttribute('visible', 'false');
        var newlyCreatedOptionIndex = loopIndex(oldSelectedOptionIndex + 4, selectedOptgroupEl.childElementCount);
  //      console.log("newlyCreatedOptionIndex: " + newlyCreatedOptionIndex);
        // get the actual "option" element that is the source of truth for value, image src and label so that we can populate the new menu option
        var sourceOptionEl = selectedOptgroupEl.children[newlyCreatedOptionIndex];
  //      console.log("sourceOptionEl");
  //      console.log(sourceOptionEl);
  
        newlyCreatedOptionEl.setAttribute('optionid', newlyCreatedOptionIndex);
        newlyCreatedOptionEl.setAttribute('id', this.idPrefix + newlyCreatedOptionIndex);
        newlyCreatedOptionEl.setAttribute('value', sourceOptionEl.getAttribute("value"));
  
        var newlyVisibleOptionPosition = newlyVisibleOptionEl.object3D.position;
        newlyCreatedOptionEl.setAttribute('position', (newlyVisibleOptionPosition.x + 0.075) + " " + newlyVisibleOptionPosition.y + " " + newlyVisibleOptionPosition.z);
        newlyCreatedOptionEl.flushToDOM();
  
        // menu: add the newly cloned and modified menu object preview
        selectOptionsRowEl.insertBefore( newlyCreatedOptionEl, selectOptionsRowEl.firstChild );
  
        // menu: get child elements for image and name, populate both appropriately
        var appendedNewlyCreatedOptionEl = selectOptionsRowEl.querySelectorAll("[optionid='" + newlyCreatedOptionIndex + "']")[0];
  
        appendedNewlyCreatedOptionEl.getElementsByClassName("previewImage")[0].setAttribute('src', sourceOptionEl.getAttribute("src"))
        appendedNewlyCreatedOptionEl.getElementsByClassName("objectName")[0].setAttribute('text', 'value', sourceOptionEl.text);
        appendedNewlyCreatedOptionEl.getElementsByClassName("objectName")[0].setAttribute('text', 'color', '#747474');
        appendedNewlyCreatedOptionEl.flushToDOM();
  
      }
  
    }
  });

  AFRAME.registerComponent('debug-controls', {
    schema: {
      menuID: {type: "string", default: "menu"}
    },
    multiple: false,
  
    addEventListeners: function () {
      var menuEl = document.getElementById(this.data.menuID);
      menuEl.addEventListener('menuChanged', this.onActionChange.bind(this));
      menuEl.addEventListener('menuSelected', this.onActionSelect.bind(this));
    },

    removeEventListeners: function () {
      var menuEl = document.getElementById(this.data.menuID);
      menuEl.removeEventListener('menuChanged', this.onActionChange);
      // menuEl.removeEventListener('menuSelected', this.onPlaceObject);
    },
  
    init: function () {
      var menuEl = document.getElementById(this.data.menuID);
  
      console.log("debug-controls: INIT; menu element: " + menuEl);
      // get currently selected action
      var optionValue = menuEl.components['select-bar'].selectedOptionValue;
      console.log("debug-controls: optionValue:" + optionValue);
      // console.log(optionValue);
  
      // do the thing associated with the action
      this.handleActionStart(optionValue);
    },
  
    onActionSelect: function () {
      var menuEl = document.getElementById(this.data.menuID);

      // currently selected action
      var optionValue = menuEl.components['select-bar'].selectedOptionValue;
      console.log(optionValue);
      switch(optionValue){
        case 'annotation': break; 
        case 'pieces': this.el.emit("lego-pieces"); break;
        case 'goal': this.el.emit("lego-goal"); break;
        case 'shooter': this.el.emit("gun-fire"); break;
        default: break;
      }
  
    },
  
    onActionChange: function () {
      // undo old one
      this.handleActionEnd(this.previousAction);
  
      var menuEl = document.getElementById(this.data.menuID);
      // get currently selected action
      var optionValue = menuEl.components['select-bar'].selectedOptionValue;
      console.log("debug-controls: new optionValue: " + optionValue);
      // do new one
      this.handleActionStart(optionValue);
    },
  
    play: function () {
      this.addEventListeners();
    },
  
    pause: function () {
      this.removeEventListeners();
    },
  
    remove: function () {
      this.removeEventListeners();
    },
  
    handleActionStart: function(optionValue) {
      this.previousAction = optionValue;
  
      // for given optionValue, do something
      switch (optionValue) {
        case "teleport":
          console.log("debug-controls: teleportStart");
          return; // without this return the other cases are fired - weird!
        case "save":
          console.log("debug-controls: saveStart");
          return;
        case "saveAs":
          console.log("debug-controls: saveAsStart");
          return;
        case "new":
          console.log("debug-controls: newStart");
          return;
      }
    },
  
    handleActionEnd: function(optionValue) {
      // for given optionValue, do something
      switch (optionValue) {
        case "teleport":
          console.log("debug-controls: teleportEnd");
          return; // without this return the other cases are fired - weird!
        case "save":
          console.log("debug-controls: saveStartEnd");
          return;
        case "saveAs":
          console.log("debug-controls: saveAsStartEnd");
          return;
        case "new":
          console.log("debug-controls: newStartEnd");
          return;
      }
    }
  });

  // Synchronize drawing for all participants
  AFRAME.registerComponent('sync-paint', {
    init: function() {
      // keep track of each avatar / networkID / clientID

      this.userData = {};
      let that = this;

      document.body.addEventListener("entityCreated", function(evt) {
        console.log("entityCreated event. clientId =", evt.detail.el);
        const el = evt.detail.el;
        const networkedComponent = el.getAttribute("networked");
        usersMap[networkedComponent.creator] = {
          networkId: networkedComponent.networkId,
          el: el,
        };
        let currentOwnerId = usersMap[''].el.components.networked.data.owner;
      });

      document.body.addEventListener("clientDisconnected", function(evt) {
        if (usersMap[evt.detail.clientId])
          delete usersMap[evt.detail.clientId];
      });
      
      // receive and react

      function createIndicator(parent) {
        var indicator = document.createElement("a-entity");
        indicator.setAttribute("position", "0 1 0");
        
        var sphere = document.createElement("a-sphere");
        sphere.setAttribute("radius", "0.1");
        sphere.setAttribute("position", "0 -0.4 0");
        indicator.appendChild(sphere);

        var box = document.createElement("a-box");
        box.setAttribute("scale", "0.1 0.7 0.1");
        box.setAttribute("position", "0 0.1 0");
        indicator.appendChild(box);

        parent.appendChild(indicator);
        return indicator;
      }
      

      NAF.connection.subscribeToDataChannel("stroke-start", function newData(sender, type, data, target) {
        if (!usersMap[sender]) {
          console.log("unknown sender");
          return;
        }
        let clientData = usersMap[sender];

        if (clientData.indicator) {
          clientData.el.removeChild(clientData.indicator);
          clientData.indicator = null;
        } else {
          clientData.indicator = createIndicator(clientData.el);
        }

        that.initPaint();
        that.userData.isSelecting = true;
        // set start
        that.cursor.setFromMatrixPosition(data);
        that.painter.moveTo(that.cursor);
      });

      NAF.connection.subscribeToDataChannel("stroke-started", function newData(sender, type, data, target) {
        if (!usersMap[sender]) {
          console.log("unknown sender");
          return;
        }
        // set start
        var userData = that.userData;
        var painter = that.painter;
    
        if (userData.isSelecting === true) {
          that.cursor.setFromMatrixPosition(data);
          painter.lineTo(that.cursor);
          painter.update();          
        }
      });

      NAF.connection.subscribeToDataChannel("stroke-ended", function newData(sender, type, data, target) {
        if (!usersMap[sender]) {
          console.log("unknown sender");
          return;
        }
        let clientData = usersMap[sender];
        
        that.userData.isSelecting = false;
        that.painter.update();
        that.painter.removeInTime(that.el.sceneEl.object3D, 5);
      });

      this.userData.isSelecting = false;
    },

    initPaint() {
      this.painter = new TubePainter();
      this.painter.setSize( 0.4 );
      this.painter.mesh.material.side = THREE.DoubleSide;
      this.painter.setColor(new THREE.Color('red'));
      
      this.cursor = new THREE.Vector3();
      this.hand = this.el;
      this.hand.sceneEl.object3D.add(this.painter.mesh);
    },
  });

  // ...
  AFRAME.registerComponent('merecs-stream-src', {

    schema: {
    },
  
    dependencies: ['material'],
    
    init: function () {
      this.videoTexture = null;
      this.video = null;
      this.stream = null;
      this.current_owner_id = null;
      let that = this;
      this._setMediaStream = this._setMediaStream.bind(this);
      
      // receiving other participant streams
      NAF.utils.getNetworkedEntity(this.el).then((networkedEl) => {
        
        const ownerId = networkedEl.components.networked.data.owner;
        const currentOwnerId = usersMap[""].el.components.networked.data.owner;
        
        /** keeping track of all streaming IDs that receive */
        this.current_owner_id = ownerId;
        streamerList.push(this.current_owner_id);

        // check if this stream from a host
        console.log('video coming from ', ownerId);
        console.log('video list ', streamerList);

        if (ownerId && isHosting) {
          that.el.components.material.material.color = new THREE.Color( 0x0000ff );
          // NAF.connection.adapter.getMediaStream(ownerId, "video")
          //   .then(this._setMediaStream)
          //   .catch((e) => naf.log.error(`Error getting media stream for ${ownerId}`, e));
        
        //} else if(ownerId && !isHosting && streamerList[0] == ownerId){
        } else if(ownerId && !isHosting){
          NAF.connection.adapter.getMediaStream(ownerId, "video")
            .then(this._setMediaStream)
            .catch((e) => naf.log.error(`Error getting media stream for ${ownerId}`, e));
        } else {
          that.el.components.material.material.color = new THREE.Color( 0xff0000 );
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
            playResult.catch((e) => naf.log.error(`Error play video stream`, e));
          }
  
          if (this.videoTexture) {
            this.videoTexture.dispose();
          }
  
          this.videoTexture = new THREE.VideoTexture(this.video);
  
          const mesh = this.el.getObject3D('mesh');
          mesh.material.map = this.videoTexture;
          mesh.material.needsUpdate = true;

          //  set skybox
          let skybox = document.querySelector("a-sky");
          skybox.getObject3D('mesh').material.map =  this.videoTexture;
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
        streamerList.pop(this.current_owner_id);
        console.log(streamerList);

    },
  
    setupVideo: function() {
      if (!this.video) {
        const video = document.createElement('video');
        video.setAttribute('autoplay', true);
        video.setAttribute('playsinline', true);
        video.setAttribute('muted', true);
        this.video = video
      }
    }
  });

  AFRAME.registerComponent('merecs-audio-src', {
    schema: {
      positional: { default: false },
      distanceModel: {
        default: "inverse",
        oneOf: ["linear", "inverse", "exponential"]
      },
      maxDistance: { default: 10000 },
      refDistance: { default: 1 },
      rolloffFactor: { default: 1 }
    },
  
    init: function () {
      this.listener = null;
      this.stream = null;
  
      this._setMediaStream = this._setMediaStream.bind(this);
  
      NAF.utils.getNetworkedEntity(this.el).then((networkedEl) => {
        const ownerId = networkedEl.components.networked.data.owner;
  
        if (ownerId) {
          NAF.connection.adapter.getMediaStream(ownerId)
            .then(this._setMediaStream)
            .catch((e) => naf.log.error(`Error getting media stream for ${ownerId}`, e));
        } else {
          
        }
      });
    },
  
    update() {
      this._setPannerProperties();
    },
  
    _setMediaStream(newStream) {
      if(!this.sound) {
        this.setupSound();
      }
  
      if(newStream != this.stream) {
        if(this.stream) {
          this.sound.disconnect();
        }
        if(newStream) {
          if (/chrome/i.test(navigator.userAgent)) {
            this.audioEl = new Audio();
            this.audioEl.setAttribute("autoplay", "autoplay");
            this.audioEl.setAttribute("playsinline", "playsinline");
            this.audioEl.srcObject = newStream;
            this.audioEl.volume = 0;
          }
  
          const soundSource = this.sound.context.createMediaStreamSource(newStream); 
          this.sound.setNodeSource(soundSource);
          this.el.emit('sound-source-set', { soundSource });
        }
        this.stream = newStream;
      }
    },
  
    _setPannerProperties() {
      if (this.sound && this.data.positional) {
        this.sound.setDistanceModel(this.data.distanceModel);
        this.sound.setMaxDistance(this.data.maxDistance);
        this.sound.setRefDistance(this.data.refDistance);
        this.sound.setRolloffFactor(this.data.rolloffFactor);
      }
    },
  
    remove: function() {
      if (!this.sound) return;
  
      this.el.removeObject3D(this.attrName);
      if (this.stream) {
        this.sound.disconnect();
      }
    },
  
    setupSound: function() {
      var el = this.el;
      var sceneEl = el.sceneEl;
  
      if (this.sound) {
        el.removeObject3D(this.attrName);
      }
  
      if (!sceneEl.audioListener) {
        sceneEl.audioListener = new THREE.AudioListener();
        sceneEl.camera && sceneEl.camera.add(sceneEl.audioListener);
        sceneEl.addEventListener('camera-set-active', function(evt) {
          evt.detail.cameraEl.getObject3D('camera').add(sceneEl.audioListener);
        });
      }
      this.listener = sceneEl.audioListener;
  
      this.sound = this.data.positional
        ? new THREE.PositionalAudio(this.listener)
        : new THREE.Audio(this.listener);
      el.setObject3D(this.attrName, this.sound);
      this._setPannerProperties();
    }
  });
  

  // questionarries
  AFRAME.registerComponent('questions', {
    schema: {
        question: {
          parse: JSON.parse, stringify: JSON.stringify
        },
    },

    init: function () {
      var self = this;
      this.eventHandlerFn = function () { console.log(data.stringify); };
    },

    update: function (oldData) {
      var data = this.data;
      var el = this.el;

      el.setAttribute('value',  data.question.qus);
      
    }

  });


  // Toast for the lego model that you will be building
  AFRAME.registerComponent('lego-model', {
    schema: {
      legoTemplate: {default: '#lego-template'},
      isShowing: {default: false},
    },

    init: function () {
      this.el.addEventListener('lego-goal', this.onLegoGoalToggle.bind(this));
    },

    onLegoGoalToggle: function() {
      console.log(this.data.isShowing);

      if(!this.data.isShowing){
        var el = document.createElement('a-box');
        el.setAttribute('scale', '.1 .1 .1');
        el.setAttribute('position', '0 .2 0');
        setTimeout(this.toggleShowing.bind(this), 3 * 1000);
        el.setAttribute('remove-in-seconds', 3);
        this.data.isShowing = true;
        this.el.appendChild(el);
      }
      
    },

    toggleShowing: function(){
      var el = this.el;
      this.data.isShowing = false;
    },

    update: function (oldData) {   
      
    }

  });



  