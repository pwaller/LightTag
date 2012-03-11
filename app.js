express = require('express');

/*
aObject.prototype.keys = function ()
{
  var keys = [];
  for(var i in this) if (this.hasOwnProperty(i))
  {
    keys.push(i);
  }
  return keys;
}
*/

app = express.createServer();
io = require('socket.io').listen(app);

app.listen(8081);

app.configure(function () {
    app.use(express.static(__dirname + "/public"));
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    
    var players = {};
    
    function Player(socket) {
        this.id = socket.id;
        this.socket = socket;
        this.x = 0;
        this.y = 0;
        this.move = function (data) {
            this.x = data[0]; this.y = data[1];
        };
        this.gone = function () {
            delete players[this.id];
        };
    }

    app.get('/', function (req, res) {
        res.local("title", "Light Speed Tag");
        res.local("colors", [
            "E802B4",
            "529836",
            "BFC7D7",
            "EC880F",
            "CCC8FC",
        ]);
        res.render("home");
    });

    io.sockets.on('connection', function (socket) {
        
        var ps = [];
        for (var key in players) ps.push(key);
        socket.emit("connected players", ps);
        console.log("Connected: ", ps);
        
        var player = new Player(socket);
        players[player.id] = player;
        socket.broadcast.emit("player connected", player.id, 0xff0000);
                
        socket.on('move', function(data) {
            player.move(data);
            socket.broadcast.emit('position update', socket.id, data);
        });
        
        socket.on('disconnect', function() {
            player.gone();
            socket.broadcast.emit('player disconnected', socket.id);
        });
    });
});

