const HEALTHCHECK_INTERVAL = 60000;

var SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline;
const parser = new Readline();
const WebSocket = require('ws');
const fetch = require('node-fetch');

const wss = new WebSocket.Server({ port: 8080 });

SerialPort.list()
  .then(availablePorts => {
    availablePorts.map(({ comName }) => setupPort(comName));
  })
  .catch(err => {
    console.error(err);
    process.exit();
  });

const setupPort = comName => {
  console.log(`Port ${comName} opening`);

  var port = new SerialPort(comName, {
    baudRate: 9600,
  });
  port.pipe(parser);

  port.on('open', () => {
    console.info(`Port ${comName} opened`);
  });

  port.on('error', err => {
    console.error('ERROR', err.message);
  });

  wss.on('connection', ws => {
    console.log('New client connected');

    parser.on('data', data => {
      console.log('Incoming data ->', data);
      ws.send(data, err => console.error);
    });
  });
};

/* healthcheck */
const doHealthcheck = () => {
  fetch(process.env.HEALTHCHECK_URL).then(
    () => {
      console.info('Healthcheck ping sent successfully');
    },
    err => {
      console.error('Healthcheck ping failed', err);
    }
  );
  setTimeout(doHealthcheck, HEALTHCHECK_INTERVAL);
};

if (process.env.HEALTHCHECK_URL) {
  doHealthcheck();
} else {
  console.info(
    'HEALTHCHECK_URL env var not provided, healthcheck will not be called'
  );
}
