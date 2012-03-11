function getQueryString() {
  var result = {}, queryString = location.search.substring(1),
      re = /([^&=]+)=([^&]*)/g, m;

  while (m = re.exec(queryString)) {
    result[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
  }

  return result;
}

var debug = getQueryString()["debug"];

//var myParam = getQueryString()["myParam"];


function Client(graphics) {
    var scene = graphics.scene,
        renderer_element = graphics.renderer_element;

    var players = {};
    function new_player(who, color) {
        player = new Player(scene, who, color);
        players[player.id] = player;
        return player;
    }
    
    var mycolor = parseInt($("input[name=color]:checked").val(), 16);
    var me = new_player(0, mycolor);
    //players[0] = me;
    
    if (debug) {
        var fake_player = new_player(1, 0x00FF22);
        fake_player.move([200, 200]);
        
        var t = 0;
        
        function wobble() {
            t++;
            fake_player.move([300 + 100 * Math.sin(t / 20), 200+ 100 * Math.cos(t / 20)]);
            window.setTimeout(wobble, 15);
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

    // TODO(pwaller): Pick this up automatically :-/
    var socket = io.connect('http://192.168.0.7');

    socket.on('player connected', new_player);

    socket.on('connected players', function (data) {
        for (who in data) {
            new_player(data[who], 0xff0000)
        }
    });

    socket.on('position update', function (who, where) {
        player = players[who];
        player.move(where);
    });

    socket.on('player disconnected', function (who) {
        players[who].gone();
        delete players[who];
    });
    
    socket.on('disconnect', function () {
        if (debug) {
            window.setTimeout(function () {
                window.location.reload();
            }, 1000);
        }
    });

}
