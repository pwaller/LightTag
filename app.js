express = require('express');

TAG_DISTANCE_PX = 100;
TAG_COOLOFF_MILLISECONDS = 5000;

function hypot(a, b) {
    return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
}

app = express.createServer();
io = require('socket.io').listen(app);

app.listen(8081);

app.configure(function () {
    app.use(express.static(__dirname + "/public"));
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    
    var players = {};
    
    // TODO(pwaller): Serialization of player name and colour.
    function Player(socket, name, color) {
        this.id = socket.id;
        this.socket = socket;
        this.name = name;
        this.color = color;
        this.x = 0;
        this.y = 0;
        this.move = function (data) {
            this.x = data[0]; this.y = data[1];
        };
        this.gone = function () {
            delete players[this.id];
        };
        this.distance_from = function (rhs) {
            return hypot(this.x - rhs.x, this.y - rhs.y);
        };
        this.tag = function (rhs) {
            
        }
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
    
    var tag_time = new Date();

    io.sockets.on('connection', function (socket) {
    // The party doesn't begin until the player tells us who they are.
    socket.on('player info', function(playerinfo) {
        
        var ps = [];
        for (var key in players) 
            ps.push([key, players[key].name, players[key].color]);
            
        socket.emit("connected players", ps);
        console.log("Connected: ", ps);
        
        var player = new Player(socket, playerinfo[0], playerinfo[1]);
        players[player.id] = player;
        socket.broadcast.emit("player connected", [player.id, player.name, player.color]);
        
        socket.on('move', function(data) {
            player.move(data);
            socket.broadcast.emit('position update', socket.id, data);
            for (p in players) {
                if (p == player.id) continue;
                if (player.distance_from(players[p]) < TAG_DISTANCE_PX
                    && (new Date() - tag_time) > TAG_COOLOFF_MILLISECONDS) {
                    
                    player.tag(players[p])
                    tag_time = new Date();
                    socket.broadcast.emit('tag', p);
                    socket.emit('tag', p);
                }
            }
            
        });
        
        socket.on('disconnect', function() {
            player.gone();
            socket.broadcast.emit('player disconnected', socket.id);
        });
        
    }); // socket .on 'player info'
    }); // sockets.on connection
});

