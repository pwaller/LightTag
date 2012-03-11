
function hypot(a, b) {
    return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
}

var INITIAL_SHELL_RADIUS = 10;
var N_CIRCLE_POINTS = 50;

var circle_shape = new THREE.Shape();
circle_shape.moveTo(0, 0);
circle_shape.arc(0, 0, INITIAL_SHELL_RADIUS, 0, Math.PI*2, false);


var sphere_material = new THREE.MeshLambertMaterial({color: 0xFFFFFF});
var sphere = new THREE.Mesh(new THREE.SphereGeometry(10, 8, 8), sphere_material);

var circle_points = circle_shape.createPointsGeometry(N_CIRCLE_POINTS);

function Shell(shell_container, color, x, y) {
    var material = new THREE.LineBasicMaterial({color: color, linewidth: 1, opacity: 0.2})
    var line = this.line = new THREE.Line(circle_points, material);
    shell_container.add(line);

    line.position.set(x, y, -100);
    var s = 1;
    this.expired = false;
    
    function radius() {
        return s * INITIAL_SHELL_RADIUS;
    }

    this.expire = function () {
        this.expired = true;
        shell_container.remove(line);
    };

    this.evolve = function (elapsed) {
        s += 0.02 * elapsed;
        this.line.scale.set(s, s, s);
        // TODO(pwaller): precompute shell termination length == longest path to corner
        if (radius() > DIAGONAL)
            this.expire();
    };
    
    // Gives the distance from the edge of the shell to (testx, testy).
    // Negative means we're inside the shell
    this.distance = function (testx, testy) {
        return hypot(testx - x, testy - y) - radius();
    };
    
    this.highlight = function () {
        sphere.position.x = x; sphere.position.y = y;
        material.opacity = 1;
        material.linewidth = 5;
    };
    
    this.unhighlight = function () {
        material.opacity = 0.2;
        material.linewidth = 1;
    };
}

function Shells(player, scene) {
    this.player = player;
    this.scene = scene;
    
    scene.add(sphere);
    
    shell_container = new THREE.Object3D();
    scene.add(shell_container);
            
    var shells = [];
    
    function prune_dead_shells () {
        not_expired = []
        for (i in shells)
            if (!shells[i].expired)
                not_expired.push(shells[i])
        if (not_expired.length != shells.length)
            shells = not_expired;
    };
    
    this.evolve = function (elapsed) {
        for (i in shells)
            shells[i].evolve(elapsed);
        prune_dead_shells();
    };
    
    this.spawn = function (x, y) {
        //if (shells.length != 0) return;
        shells.push(new Shell(shell_container, player.color, x, y));
    };
    
    this.gone = function () {
        for (i in shells)
            shells[i].expire();
        scene.remove(shell_container);
    };
    
    this.unhighlight = null;
    this.highlighted = null;
    
    this.highlight_closest = function (x, y) {
        if (shells.length == 0) return;
        var shells_copy = shells.slice(0);
        for (i in shells_copy)
            shells_copy[i] = [shells_copy[i].distance(x, y), shells_copy[i]];
        
        shells_copy.sort(function (l, r) { return l[0] > r [0]; });
        //console.log(shells_copy[0][0], shells_copy[shells_copy.length - 1][0]);
        closest_shell = shells_copy[0][1];
        if (this.highlighted != closest_shell) {
            if (this.highlighted)
                this.highlighted.unhighlight();
            this.highlighted = closest_shell;
            closest_shell.highlight();
        }
    };
}

