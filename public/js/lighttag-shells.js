
var INITIAL_SHELL_RADIUS = 10;

var circle_shape = new THREE.Shape();
circle_shape.moveTo(0, 0);
circle_shape.arc(0, 0, INITIAL_SHELL_RADIUS, 0, Math.PI*2, false);
var circle_points = circle_shape.createPointsGeometry(50);
    
function update_nshells() {
    //$("#ncirc").text(shells.length);
}

function Shell(three_object, color, x, y) {
    update_nshells();

    material = new THREE.LineBasicMaterial({color: color, linewidth: 2, opacity:0.2})
    var line = this.line = new THREE.Line(circle_points, material);
    three_object.add(line);

    line.position.set(x, y, -100);
    this.s = 1;
    this.expired = false;

    this.expire = function () {
        this.expired = true;
        three_object.remove(line);
    };

    this.evolve = function (elapsed) {
        this.s += 0.02 * elapsed;
        this.line.scale.set(this.s, this.s, this.s);
        // TODO(pwaller): precompute shell termination length == longest path to corner
        if (this.s * INITIAL_SHELL_RADIUS > DIAGONAL)
            this.expire();
    };
}

function Shells(player, scene) {
    this.player = player;
    this.scene = scene;
    this.three_object = new THREE.Object3D();
    scene.add(this.three_object);
            
    var shells = [];
    
    function prune_dead_shells () {
        not_expired = []
        for (i in shells)
            if (!shells[i].expired)
                not_expired.push(shells[i])
        if (not_expired.length != shells.length)
            shells = not_expired;
        //update_nshells();
    }
    
    this.evolve = function (elapsed) {
        for (i in shells)
            shells[i].evolve(elapsed);
        prune_dead_shells();
    }
    
    this.spawn = function (x, y) {
        shells.push(new Shell(this.three_object, player.color, x, y));
    }
    
    this.gone = function () {}
    
}

