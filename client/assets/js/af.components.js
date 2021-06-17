
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
      var player = document.getElementById('player');
      var myNametag = player.querySelector('.nametag');
      //myNametag.setAttribute('text', 'value', params.username);
      
      // Setup networked-scene
      var networkedComp = {
        room: params.room,
        adapter: adapter,
        audio: voice,
        video: true,
      };
      console.info('Init networked-aframe with settings:', networkedComp);
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
      this.timeout = setInterval(this.updateSky.bind(this), 100);
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

  // It physics, bullet always moves forward duh! 
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