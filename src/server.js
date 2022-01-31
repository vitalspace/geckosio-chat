// import other libraries as CJS
const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const port = 3000;

const main = async () => {
  // import geckos as ESM
  const { geckos } = await import('@geckos.io/server');
  const io = geckos();

  let players = {};

  io.addServer(server)
  io.onConnection(channel => {
  
    console.log(`${channel.id} got connected`)

    players[channel.id] = {
      playerId: channel.id,
    }

    channel.on('new_nick_name', (data) => {
      players[channel.id].name = data;
      channel.room.emit('current_users', players);
    });

    channel.on('message', (data) => {
      const obj = { message: data, info: players[channel.id] }
      channel.room.emit('message_to_room', obj)
    });

    channel.room.emit('current_users', players);

    channel.onDisconnect(() => {
      delete players[channel.id];
      console.log(`${channel.id} got disconnected`)
      channel.room.emit('current_users', players);
    })

  });

  app.use(express.static('www'));

  server.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  });
}

main();