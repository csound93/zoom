// > npm run dev
const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");

const call = document.getElementById("call");
call.hidden = true;

let myStream;
let muted = false;
let cameraOff = false;
let roomName;

async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");
    const currentCamera = myStream.getVideoTracks()[0];
    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.getDeviceId;
      option.innerText = camera.label;
      if (currentCamera.label == camera.label) {
        option.selected = true;
      }
      camerasSelect.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
}

async function getMedia(deviceId) {
  const initConstraints = { audio: true, video: { facingMode: "user" } }; //browser에서 정한 video로 설정
  const cameraConstraints = { audio: true, video: { deviceId: deviceId } }; //browser에서 정한 video로 설정

  try {
    myStream = await navigator.mediaDevices.getUserMedia(deviceId ? cameraConstraints : initConstraints);
    myFace.srcObject = myStream;
    if (!deviceId) {
      await getCameras();
    }
    /* 스트림 사용 */
  } catch (err) {
    console.log(err);
    /* 오류 처리 */
  }
}

function handleMuteClick() {
  myStream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
  if (!muted) {
    muteBtn.innerText = "Unmute";
    muted = true;
  } else {
    muteBtn.innerText = "Mute";
    muted = false;
  }
}
function handleCameraClick() {
  myStream.getVideoTracks().forEach((track) => {
    track.enabled = !track.enabled; //video track enable이 true 이면 false로 토글
  });
  if (cameraOff) {
    cameraBtn.innerText = "Turn Camera Off";
    cameraOff = false;
  } else {
    cameraBtn.innerText = "Turn Camera On";
    cameraOff = true;
  }
}

function handleCameraChange() {
  getMedia(camerasSelect.value);
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);

// Welcome Form (join a room)

const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("#welcome form");

function startMedia() {
  welcome.hidden = true;
  call.hidden = false;
  getMedia();
}

function handleWelcomeSubmit(event) {
  event.preventDefault();
  const input = welcomeForm.querySelector("input");
  socket.emit("join_room", input.value, startMedia);
  roomName = input.value;
  input.value = "";
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);

// Socket Code

socket.on("welcome", () => {
  console.log("someone join");
});
