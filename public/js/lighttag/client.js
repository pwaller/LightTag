function getQueryString() {
  var result = {}, queryString = location.search.substring(1),
      re = /([^&=]+)=([^&]*)/g, m;

  while (m = re.exec(queryString)) {
    result[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
  }

  return result;
}

var options = getQueryString();

var players = {};
    
function Client(myname, mycolor, graphics) {
    var scene = graphics.scene,
        renderer_element = graphics.renderer_element;

    function new_player(id, name, color) {
        player = new Player(scene, id, name, color);
        players[player.id] = player;
        return player;
    }
    
    var me = new_player(0, myname, mycolor);
    
    if (options.testmass) {
        var fake_player = new_player(1, "testmass", 0x00FF22);
        fake_player.move([200, 200]);
        
        var t = 0;
        
        function wobble() {
            t++;
            speed = 1/80.;
            fake_player.move([300 + 100 * Math.sin(t*speed), 
                              200 + 100 * Math.cos(t*speed)]);
            window.setTimeout(wobble, 1);
        }
        wobble();
    }
    
    var last_update = 0;
    function tick_players() {
        now = (new Date()).getTime();
        elapsed = now - last_update;
        if (last_update != 0) {
            for (i in players)
                players[i].tick(elapsed);
        }
        last_update = now;

        // TODO(pwaller): Put this at the beginning
        window.setTimeout(tick_players, 10);
    }
    tick_players();
    
    renderer_element
        .mousemove(function (e) {
            data = [e.pageX - renderer_element.offset().left, 
                    e.pageY - renderer_element.offset().top];
            me.move(data);
            socket.emit("move", data);
        })
        .click(function (e) {
            data = [e.pageX - renderer_element.offset().left, 
                    e.pageY - renderer_element.offset().top];
        });

    var socket = io.connect('http://' + window.document.domain);

    socket.on('connect', function() {
        socket.emit('player info', [myname, mycolor]);
    });

    socket.on('player connected', function(data) {
        console.log("player connected", data);
        new_player(data[0], data[1], data[2]);
    });

    socket.on('connected players', function (data) {
        console.log("connected players", data);
        for (who in data) {
            player = data[who];
            new_player(player[0], player[1], player[2])
        }
    });

    socket.on('position update', function (who, where) {
        player = players[who];
        player.move(where);
    });

    socket.on('player disconnected', function (who) {
        console.log("Player disconnected", who);
        players[who].gone();
        delete players[who];
    });
    
    socket.on('disconnect', function () {
        console.log("Server disconnected");
        if (options.reload) {
            window.setTimeout(function () {
                window.location.reload();
            }, 500);
        }
    });

}
