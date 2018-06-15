var express = require('express');
var sassMiddleware = require('node-sass-middleware')
var bodyParser = require('body-parser');


var app = express();
var server;
//https
if (process.env.HTTPS == 'true') {
    var fs = require('fs');
    var options = {
        key : fs.readFileSync('/etc/letsencrypt/live/hoonga.kr/privkey.pem', {flag : 'r'}),
        cert : fs.readFileSync('/etc/letsencrypt/live/hoonga.kr/cert.pem', {flag : 'r'})
    }
    server = require('https').Server(options, app);
}
else
    server = require('http').Server(app);
var io = require('./socket/io').init(server)

var api = {}; api.question = require('./api/question'); api.script = require('./api/script'); api.time = require('./api/time'); api.alert = require('./api/alert');
var socket = {}; socket.question = require('./socket/question');
var script = require('./socket/script');
var slide = require('./socket/slide');
var feedback = require('./socket/feedback');
var time = require('./socket/time');
 users = [];
connections = [];

app.set('view engine', 'ejs');
app.set('views', 'view');
app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(bodyParser.urlencoded({extended:true}));
app.use('/api/question', api.question);
app.use('/api/question', socket.question);
app.use('/api/script', api.script);
app.use('/api/time', api.time);
app.use('/api/alert', api.alert);

app.use('/public/stylesheets',
    sassMiddleware({
        src: __dirname + '/public/stylesheets/sass', //where the sass files are
        dest: __dirname + '/public/stylesheets', //where css should go
        debug: true // obvious
    })
);

// for custom reveal js theme (bulma.scss)
app.use('/public/lib/reveal/css/theme',
    sassMiddleware({
        src: __dirname + '/public/lib/reveal/css/theme/source',
        dest: __dirname + '/public/lib/reveal/css/theme',
        debug: true
    })
)

app.use('/public', express.static('public'));


app.get('/', function(req, res, next) {
    return res.render('main.ejs');
});

app.post('/', function(req, res, next) {
    console.log(req.body);
    var personInfo = req.body;

    if(!personInfo.email || !personInfo.username || ! personInfo.password || !personInfo.passwordConf) {
        res.send();
    }else {
        if(personInfo.password == personInfo.passwordConf) {
            User.findOne({email:personInfo.email}, function(err, data) {
                if(!data) {
                    var c;
                    User.findOne({}, function(err, data) {
                            if(data) {
                                console.log("if");
                                c = data.unique_id + 1;
                            } else {
                                c = 1;
                            }
                            var newPerson = new User({
                                    unique_id:c,
                                    email:personInfo.email,
                                    username:personInfo.username,
                                    password:personInfo.password,
                                    passwordConf:personInfo.passwordConf
                            });
                            
                            newPerson.save(function(err, Person) {
                              if(err)
                                console.log(err);
                              else
                                console.log('Success');  
                            })
                        }).sort({_id:-1}).limit(1);
                        res.send({"Success":"You are registed, You can login to our system now."});
                }else{
                        res.send({"Success": "Email is already used."});
                }
            });
        }else{
            res.send({"Success":"Password is not matched"});
        }
    }
});        

var store = {};
var idstore = {};
var chathistory = [];

io.sockets.on('connection', function(socket){

        socket.on('join', function(data){
                    if(chathistory[data.roomname] == null)
                chathistory[data.roomname] = [];
            
            var usrobj = {
                'room': data.roomname,
                'name': data.username
                };

            store[data.roomname] = usrobj;
            idstore[socket.id] = {'id': data.roomname};
            socket.join(data.roomname);
            io.to(store[data.roomname].room).emit('join', chathistory[data.roomname]);

            socket.username = data.username;
        users[socket.username] = socket;
     
            io.to(store[data.roomname].room).emit('get users', Object.keys(users));
            console.log(data);       
        });

    //message
    socket.on('message', function(message){
            chathistory[message.roomname].push(message.username + ': ' + message.message);
            console.log(chathistory[message.roomname]);
            io.to(store[message.roomname].room).emit('message', {msg: message.message, user: message.username});
    });

    socket.on('leave chat', function(data){
        if (idstore[socket.id]) {
          var _roomid = store[idstore[socket.id].id].room;
          
          io.to(_roomid).emit('leave chat', {
            id: idstore[socket.id].id,
            name: data.username,
            text: 'left the chat'
                });
                socket.leave(_roomid);
          
          delete users[socket.username];
          io.to(store[data.roomname].room).emit('get users', Object.keys(users));
          delete idstore[socket.id];

          console.log('left the chat');

            }
    }); 
    //Disconnect
    socket.on('disconnect', function(data){
   
    });
    //New user


    
});

var mongoose = require('mongoose');
var session = require('express-session');
var ejs = require('ejs');
var path = require('path');
var MongoStore = require('connect-mongo')(session);


mongoose.connect('mongodb://localhost/ManualAuth', { useMongoClient: true });

var dblog = mongoose.connection;
dblog.on('error', console.error.bind(console, 'connection error:'));
dblog.once('open', function () {
});

app.use(session({
  secret: 'work hard',
  resave: true,
  saveUninitialized: true,
  resave: false,
  store: new MongoStore({
    mongooseConnection: dblog
  })
}));



var index = require('./routes/index');
app.use('/', index);

var db = require('./db');
db.conn();
var port = 8000;
server.listen(port, () => {
    console.log(`listening on port ${port}`);
});

module.exports = app;
