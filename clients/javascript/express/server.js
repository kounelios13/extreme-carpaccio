const path = require('path');
const http = require('http');
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const feedback = require('./lib/feedback');
const order = require('./lib/order');
require('dotenv').config();

function Server(doLogRequests) {
  const app = express();
  app.set('json spaces', 2);

  if (doLogRequests) {
    app.use(morgan('dev'));
  }
  app.use(bodyParser.json());
  app.set('views',path.join(__dirname,'views'));
  app.set('view engine','pug');
  app.get('/status', function(req, res) {
    res.json({
      up: true
    })
  })


  app.get('/',(req,res)=>{
    res.render('index');
  });

  app.use('/order',order);
  app.use('/feedback', feedback);

  const server = http.createServer(app);
  server.start = server.listen.bind(server, parseInt(process.env.PORT) || 3000);
  server.stop = server.close.bind(server);
  return server;
}


if (!module.parent) {
  const server = new Server(true);
  server.start(function() {
    console.log('server listening on port', server.address().port);
  });
}
module.exports = Server;
