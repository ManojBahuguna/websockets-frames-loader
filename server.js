// Imports
const path = require('path');
const express = require('express');
const http = require('http');
const config = require('./config');
const WebSocket = require('ws');
var database = require('mongodb').MongoClient;

database.connect(config.mlabURL, { useNewUrlParser: true }, (err, client) => {
  if (err) throw err;

  const db = client.db();
  const master = db.collection('master');

  // Configure server
  const app = express();
  const server = http.createServer(app);


  // Serve public folder
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.json());

  app.post('/login', async (req, res) => {
    try {
      const doc = await master.findOne();
      console.log(req.body);
      if (!doc) throw new Error('Nothing in database');
      if (doc.password === req.body.password) {
        const updated = await master.updateOne(
          { _id: doc._id },
          { $set: { status: 'active' } }
        );
        if (!updated.result.n) throw new Error('Status not updated!')
        res.json({ success: true });
        return;
      }

      res.status(401).json({ success: false, message: "Passwords don't match" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: error.message });
    }
  });


  // Sockets
  const wss = new WebSocket.Server({
    server
  });
  const broadcastFrame = (frame, ws) => {
    wss.clients.forEach((client) => {
      if (client !== ws) {
        client.send(frame);
        console.log(frame);
      }
    });
  };

  wss.on('connection', (ws) => {
    ws.binaryType = 'blob';
    console.log('socket connected!');

    ws.on('message', (frame) => {
      console.log('received frame');
      broadcastFrame(frame, ws);
    });

    ws.on('disconnect', () => {
      console.log('disconnected ' + id);
    });
  });


  // Start Server
  server.listen(config.port, () => {
    console.info(`Server started on port ${server.address().port}`);
  });

});