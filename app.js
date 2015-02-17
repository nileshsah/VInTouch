var express = require('express')
  , app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);

server.listen(8080);

var count = 0;
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

var len = 200;
var users = new Array(len);
var rooms = new Array(len);

for(var c=0; c < len; c++)
{
  users[c] = 0;
  rooms[c] = 0;
}


io.sockets.on('connection', function (socket) {

	
	
	socket.on('stopchat', function(){
	
	if( socket.room != "null")
	  { io.sockets.in(socket.room).emit('updatechat', 'server', 'disconnect'); }
		
		var r = socket.roomindex;
	io.sockets.clients(socket.room).forEach(function(s) {
		s.stat = "idle";
		s.leave(s.room);
		s.room = "null";
		s.roomindex = "null";
     });
	 
	 socket.leave(r);
	 rooms[r] = 0;
	});

	
socket.on('counter', function(){
	  socket.emit('updatechat', 'server', count);
	});
	
	
	socket.on('adduser', function(){
	
	var i = 0;
	
	for(i = 0; i < users.length; i++)
		{
		 if( users[i] != 1)
		 { socket.username = i;
		   users[i] = 1;
		   break;
		 }
		}
		 socket.emit('updatechat', 'server', count);
		 socket.emit('updatechat', 'username', i);
		 socket.stat = "idle";
		 socket.room = "null";
		 count++; 
	 });
	 
	 socket.on('newconn', function(){
	   var i=0;
	   
	   socket.emit('updatechat', 'server', count);
	   var freearr = new Array(len);
	   var c = 0;
	   
	 for(i=0; i < rooms.length; i++)
		{
		   if( rooms[i] == 1 )
		   {
			 freearr[c] = i;
			 c++;
		   }
		 
		}
			  if( c > 0 )
		   {
			 var a = Math.floor( Math.random() * (c - 0) + 0 );
			 i = freearr[a];
			 rooms[i] = 2;
			 socket.room = i.toString();
		     socket.join(socket.room);
			 socket.roomindex = i;
			 socket.stat = "connected";
			 socket.broadcast.to(socket.room).emit('updatechat', 'server', 'connected');
			 socket.emit('updatechat', 'server', 'connected');
			 
		   }
		   
		   
		if( socket.stat != "connected" )
		{
			c = 0;
		   for(i=0; i < rooms.length; i++)
		    {
			   if( rooms[i] == 0 )
			   { 
				  rooms[i] = 1;	
			      socket.room = i.toString();
				  socket.join(socket.room);			  
				  socket.roomindex = i;
				  socket.stat = "waiting";
				  socket.emit('updatechat', 'server', socket.stat);
                  //socket.emit('updatechat', 'strange', socket.room);
         		  break;
			   }
			  
			}
	
        }
		
	   });

	socket.on('sendchat', function (data) {
		if(socket.room != "null")
		 { io.sockets.in(socket.room).emit('updatechat', socket.username, data); }
	});

	socket.on('disconnect', function(){

	if( socket.room != 'null' && socket.stat != 'waiting' )
	{ io.sockets.in(socket.room).emit('updatechat', 'server', 'disconnect'); }
	
	var r = socket.roomindesx;
	io.sockets.clients(socket.room).forEach(function(s) {
		s.stat = "idle";
		s.leave(s.room);
		s.room = "null";
     });
	 socket.leave(r);
	  users[socket.username] = 0;
	  rooms[socket.roomindex] = 0;
	  
	 delete users[socket.username];
	 
	 users[socket.username] = 0;
	  
	
 	 
	 if( count > 1 )
     	{ count--; }
	  
	});
	

	
});
