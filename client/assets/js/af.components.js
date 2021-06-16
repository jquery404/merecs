
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

  // manage skybox src
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

  // grid components
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
  
  
  })