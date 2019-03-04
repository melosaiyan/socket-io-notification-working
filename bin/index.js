var express	=	require('express');
var app		=	express();
var http	=	require('http').Server(app);
var io		=	require('socket.io')(http);
var router	=	express.Router();

var mssql = require("mssql");

require('events').EventEmitter.prototype._maxListeners = 100;

var mspool = {
	user: 'melosaiyan',
	password: 'S5p6u7r8$',
	server: 'localhost',
	database: 'testnotify',
    pool: {
        max: 100,
        min: 0,
        idleTimeoutMillis: 30000
    },

	options:{
		encrypt: false //set to true if on Windows Azure
	}
}

router.get('/',function(req,res){
	res.sendFile(__dirname + '/index.html');
});

router.get('/getStatus',function(req,res){
/* TODO figure out what goes here */
});

app.use('/',router);

io.on('connection',function(socket){
	console.log('We have user connected !');

    socket.on('user validate',function(data){
        var pool3 = new mssql.ConnectionPool(mspool).connect().then(pool => {
            console.log('Received user name! Validating input...');
            return pool.query`select count(UserName) as nameCount from UserData where Username = (${data.userNameLogin1})`;
        }).then(result => {
            io.emit("username result",{loginUser: data.userNameLogin1, userResult : result.recordset[0].nameCount});
        }).catch(err => {
            console.log('Boo errors! Result is ' + err);
        });
    });

	socket.on('comment added',function(data){
        var pool3 = new mssql.ConnectionPool(mspool).connect().then(pool => {
            console.log('Received user data! Validating input...');
            return pool.query`insert into  UserPost1 (UserPostContent) values (${data.comment})`;
        }).then(result => {
            io.emit("notify everyone",{fromUser : data.fromUser, toUser : data.toUser, comment : data.comment});
            console.log('No errors! Result is ' + result);
        }).catch(err => {
            io.emit('error');
            console.log('Boo errors! Result is ' + err);
        });
	});

});


http.listen(3000,function(){
    console.log("Listening on 3000");
});
