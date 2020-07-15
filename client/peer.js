const net = require("net");
const dgram = require("dgram");
const events = require("./events");

const servers = {
  local: "127.0.0.1",
  server: "198.58.122.111",
  mobile: "177.79.105.48"
};

const udpSocket = dgram.createSocket("udp4");
let server = "local";

const client = {
  name: ""
};

const connections = [];

const SERVER_ADDRESS = servers[server];
console.log(SERVER_ADDRESS);
const SERVER_PORT = 3601;

const connect = () => {
  const message = {
    client,
    action: "connect"
  };

  sendPacket(message, SERVER_PORT, SERVER_ADDRESS, err =>
    console.log(("Error: ", err))
  );
};

const sendPacket = (message, port, address, cb) => {
  console.log("OUT: ", message);

  const data = JSON.stringify(message);
  udpSocket.send(data, 0, data.length, port, address, cb);
};

udpSocket.on("message", (data, info) => {
  const message = JSON.parse(data.toString());
  console.log("IN: ", message);

  if (message.action === "newPeer") {
    connections.push(message.client);

    sendPacket(
      "Hey new one",
      message.client.port,
      message.client.address,
      err => console.log(err)
    );
  } else if (message.action === "peers") {
    message.peers.map(peer => {
      sendPacket("Im new here", peer.port, peer.address, err =>
        console.log(err)
      );
    });

    connections.push(...message.peers);
  } else {
    console.log("REMOTE MESSAGE", message);
    events.emit("remote::message", { message });
  }
});

const init = (userName, choosenServer) => {
  client.name = userName;
  server = choosenServer;
  return udpSocket;
};

events.on("local::message", data => {
  console.log(data);
  console.log("Broadcasting message");
  const packetContent = {
    action: "message",
    peer: client.name,
    content: data.message
  };

  connections.map(peer => {
    sendPacket(packetContent, peer.port, peer.address, err => console.log(err));
  });
});

udpSocket.bind();

// USE THIS TO SEND MESSAGES FROM TERMINAL
// process.stdin.on("data", data => {
//   const message = data.toString().trim();

//   const packetContent = {
//     action: "message",
//     message
//   };

//   connections.map(peer => {
//     sendPacket(packetContent, peer.port, peer.address, err => console.log(err));
//   });
// });

module.exports = { connect, socket: init };
