// call by af
function onConnect () {
  console.log("onConnect", new Date());

  //startVideo();
}

function startVideo() {
  if (navigator.mediaDevices.getUserMedia) {
      navigator.getUserMedia({video: true, audio: true},

      function (stream) {
          var video = document.querySelector("#myVideo");
          video.srcObject = stream;
          //localStream = stream;
      },

      function (err) {
          console.log("The following error occured: " + err);
      });
  }
}

function changeVideoSrc(devId){
  navigator.mediaDevices.getUserMedia({video: {deviceId: {exact: devId}}, audio:toggleMute})
      .then(function(stream){
          var video = document.querySelector("#myVideo");
          video.srcObject = stream;
          video.play();
          localStream = stream;
      })
      .catch(function(err){
          console.log(err);
      });
}


NAF.schemas.add({
  template: '#avatar-template', 
  components: [
    'position', 
    'rotation',
    {
      selector: '.nametag',
      component: 'text',
      property: 'value'
    }
  ]
});

NAF.schemas.add({template: '#player-template', components: ['position', 'rotation']});
NAF.schemas.add({template: '#hand-template', components: ['position', 'rotation']});
NAF.schemas.add({template: '#video-template', components: ['position']});

// On mobile remove elements that are resource heavy
const isMobile = AFRAME.utils.device.isMobile();
if (isMobile) {
  // TODO 
}
