/*'use strict';

const amqplib = require('amqplib/callback_api');
const config = require('./config');

// Create connection to AMQP server
amqplib.connect(config.amqp, (err, connection) => {
    if (err) {
        console.error(err.stack);
        return process.exit(1);
    }

    // Create channel
    connection.createChannel((err, channel) => {
        if (err) {
            console.error(err.stack);
            return process.exit(1);
        }

        // Ensure queue for messages
        channel.assertQueue(config.queue, {
            // Ensure that the queue is not deleted when server restarts
            durable: true
        }, err => {
            if (err) {
                console.error(err.stack);
                return process.exit(1);
            }

            // Create a function to send objects to the queue
            // Javascript opbject is converted to JSON and the into a Buffer
            let sender = (content, next) => {
                let sent = channel.sendToQueue(config.queue, Buffer.from(JSON.stringify(content)), {
                    // Store queued elements on disk
                    persistent: true,
                    contentType: 'application/json'
                });
                if (sent) {
                    return next();
                } else {
                    channel.once('drain', () => next());
                }
            };

            // push 100 messages to queue
            let sent = 0;
            let sendNext = () => {
                if (sent >= 100) {
                    console.log('All messages sent!');
                    // Close connection to AMQP server
                    // We need to call channel.close first, otherwise pending
                    // messages are not written to the queue
                    return channel.close(() => connection.close());
                }
                sent++;
                sender({
                    to: 'recipient@example.com',
                    subject: 'Test message #' + sent,
                    text: 'hello world!'
                }, sendNext);
            };

            sendNext();

        });
    });
});*/


var express = require('express');
var routes = require('./routes');
var logger =require('morgan');
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');



//Including controller/dao for testtable
var testtable = require('./routes.js'); 
var app = express();
var connection  = require('express-myconnection'); 
var mysql = require('mysql');
// all environments
app.set('port', process.env.PORT || 8080);
app.set('views', path.join(__dirname, 'testtable'));
app.set('view engine', 'ejs');
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.use(
    connection(mysql,{

        host: 'localhost',
        user: 'root',
        password : 'root',
        port : 3306, //port mysql
        database:'dbname'
},'pool')
);
app.get('/testtable', testtable.list);
app.use(app.router);
http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});
