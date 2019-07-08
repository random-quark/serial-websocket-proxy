const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8080 });

let number = 0;
let increasing = true;

sendInteger = () => {
  setTimeout(() => {
    if (increasing) {
      number++;
    } else {
      number--;
    }
    if (number > 100) {
      increasing = false;
    }
    if (number < 0) {
      increasing = true;
    }

    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(number);
      } else {
        console.error(
          "A client did not get a message because readyState was false"
        );
      }
    });
    sendInteger();
  }, 50);
};

sendInteger();
