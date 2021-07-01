// call by af
function onConnect () {
  console.log("onConnect", new Date());
  if (isHosting) startVideo();

  fetch('./assets/data/questionlist.json')
    .then(res => { return res.json() })
    .then(data => {questionList = data; console.log(questionList); })
}

function startVideo() {
  if (navigator.mediaDevices.getUserMedia) {
      navigator.getUserMedia({video: true, audio: false},

      function (stream) {
        const video = document.createElement('video');
        video.setAttribute('id', 'myVideo');
        video.setAttribute('autoplay', true);
        video.setAttribute('playsinline', true);
        video.setAttribute('muted', true);
        video.srcObject = stream;
        document.querySelector('body').appendChild(video); 

        let skybox = document.querySelector("a-sky");
        skybox.setAttribute('src', '#myVideo');
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
NAF.schemas.add({template: '#body-template', components: ['position', 'rotation', 'visible']});
NAF.schemas.add({template: '#video-template', components: ['position']});
// On mobile remove elements that are resource heavy
const isMobile = AFRAME.utils.device.isMobile();
if (isMobile) {
  // TODO 
}
