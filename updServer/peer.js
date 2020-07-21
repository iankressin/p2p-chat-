const net = require("net");
const dgram = require("dgram");
const events = require("./events");

class UdpServer {
  SERVER_ADDRESS = "198.58.122.111";
  SERVER_PORT = 3601;

  client = { name: "" };
  udpSocket;
  connections = [];
  unfinishedConnections = [];

  constructor() {
    this.udpSocket = dgram.createSocket("udp4");
    this.udpSocket.bind();

    this.registerLocalEvents();
    this.registerUpdSocketEvents();
  }

  connectToServer = () => {
    const message = { client: this.client, action: "connect" };

    this.sendPacket(message, this.SERVER_PORT, this.SERVER_ADDRESS, error =>
      console.error("Error >>> ", error)
    );
  };

  registerEvents = () => {
    registerUpdSocketEvents();
    registerLocalEvents();
  };

  registerUpdSocketEvents = () => {
    this.udpSocket.on("message", (data, info) => {
      const message = JSON.parse(data.toString());
      console.log("In    >>> ", message);

      switch (message.action) {
        case "server::newPeer":
          this.handleNewPeer(message);
          this.handleNewPeer(message);
          break;
        // Receive from the server all the node in the network and introduce itselfe
        case "server::announceMe":
          this.handleAnnounceMe(message);
          this.handleAnnounceMe(message);
          this.handleAnnounceMe(message);
          this.handleAnnounceMe(message);
          this.handleAnnounceMe(message);
          this.handleAnnounceMe(message);
          break;
        case "remote::newMessage":
          this.handleNewMessage(message);
          break;
        case "remote::announcing":
          this.handleConnection(message);
          this.handleConnection(message);
          this.handleConnection(message);
          this.handleConnection(message);
          this.handleConnection(message);
      }
    });
  };

  handleNewPeer = message => {
    this.connections.push(message.client);

    // The first packet will probably got rejected
    // Due to the firewall from the other peer, so we need to try again
    this.sendPacket(
      "remote::connection".toString(2),
      message.client.port,
      message.client.address,
      error => {
        console.log("Error >>> ", error);
      }
    );
  };

  handleAnnounceMe = message => {
    message.peers.forEach(peer =>
      this.sendPacket(
        "remote::announcing".toString(2),
        peer.port,
        peer.address,
        error => console.log("Error >>>", error)
      )
    );
  };

  handleNewMessage = message => {
    events.emit("remote::message", { message });
  };

  handleConnection = message => {
    this.sendPacket(
      "remote::connection".toString(2),
      message.client.port,
      message.client.address,
      error => {
        console.log("Error >>> ", error);
      }
    );
  };

  registerLocalEvents = () => {
    events.on("local::message", data => {
      const packetContent = {
        action: "remote::newMessage",
        peer: this.client,
        content: data.message
      };

      this.connections.map(peer => {
        this.sendPacket(packetContent, peer.port, peer.address, error =>
          console.log(error)
        );
      });
    });
  };

  sendPacket = (message, port, address, cb) => {
    console.log("Out   >>> ", message, port, address);

    const data = JSON.stringify(message);

    this.udpSocket.send(data, 0, data.length, port, address, cb);
  };
}

module.exports = UdpServer;
