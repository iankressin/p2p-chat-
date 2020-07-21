function handleFakeClick() {
  console.log("RUNNING FROM JS FILE");
}

const { ipcRenderer } = require("electron");

ipcRenderer.on("remote::message", (event, message) => {
  addMessageToBoard("from-others", message.message.content);
});

function send(event) {
  event.preventDefault();

  const message = document.getElementById("message").value;

  addMessageToBoard("from-me", message);

  ipcRenderer.send("interface::message", { message });

  document.getElementById("message").value = "";
}

function addMessageToBoard(source, message) {
  const messageTemplate = document.getElementById(source);
  const messageTemplateClone = messageTemplate.content.cloneNode(true);
  const board = document.getElementById("board");

  messageTemplateClone.querySelector(".message-content").innerHTML = message;

  board.appendChild(messageTemplateClone);
}
