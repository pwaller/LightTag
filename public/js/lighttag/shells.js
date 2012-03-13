
function hypot(a, b) {
    return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
}

var INITIAL_SHELL_RADIUS = 10;
var N_CIRCLE_POINTS = 50;
var LIGHTSPEED = 0.2;
var Infinity = parseFloat("Infinity");

var circle_shape = new THREE.Shape();
circle_shape.moveTo(0, 0);
circle_shape.arc(0, 0, INITIAL_SHELL_RADIUS, 0, Math.PI*2, false);


var sphere_material = new THREE.MeshLambertMaterial({color: 0xFFFFFF});
var sphere_geometry = new THREE.SphereGeometry(10, 2, 2);

var circle_points = circle_shape.createPointsGeometry(N_CIRCLE_POINTS);

function Shell(shell_container, color, x, y, t) {
    var material = new THREE.LineBasicMaterial({color: color, linewidth: 1, opacity: 0.2})
    var line = this.line = new THREE.Line(circle_points, material);
    
    if (!options.hide_cones)
        shell_container.add(line);

    line.position.set(x, y, -100);
    this.expired = false;
    this.time = t;

    
    var show_sphere = false;

    this.view_x = 50;
    this.view_y = 50;
    this.x = x;
    this.y = y;

    function radius(time) {
        return (time - t) * LIGHTSPEED;
    }

    this.expire = function () {
        this.expired = true;
        shell_container.remove(line);
        this.sphere_off();
    };
    
    this.update = function (elapsed_time, next_shell) {
        r = radius(elapsed_time);
        s = r/INITIAL_SHELL_RADIUS;
        this.line.scale.set(s, s, s);

        // TODO(pwaller): This needs to become part of an "observe" process.
        //                for a given set of light cones we may want to observe
        //                from multiple points.
        this_distance = this.distance(this.view_x, this.view_y, elapsed_time);
        has_arrived = (this_distance < 0);
        if (!next_shell) {
            if (has_arrived) 
                this.sphere_on();
            else
                this.sphere_off();
            return;
        }
        next_distance = next_shell.distance(this.view_x, this.view_y, elapsed_time);
        is_obsolete = (next_distance < 0);

        // TODO(pwaller): precompute shell termination length == longest path to corner
        if (is_obsolete && r > DIAGONAL)
            this.expire();

        if (has_arrived && !is_obsolete) {
            f = - this_distance / (next_distance - this_distance);
            new_x = (1-f)*x + f*next_shell.x;
            new_y = (1-f)*y + f*next_shell.y;
            this.sphere_on();
            this.sphere.position.set(new_x, new_y, -100);
        } else {
            this.sphere_off();
        }
    };
    
    // Gives the distance from the edge of the shell to (testx, testy).
    // Negative means we're inside the shell
    this.distance = function (testx, testy, time) {
        return hypot(testx - x, testy - y) - radius(time);
    };
    
    this.highlight = function () {
        material.opacity = 1;
        material.linewidth = 5;
    };
    
    this.unhighlight = function () {
        material.opacity = 0.2;
        material.linewidth = 1;
    };

    this.sphere_on = function() {
        if (!show_sphere) {
            var sphere_material = new THREE.MeshLambertMaterial({color: color});
            this.sphere = new THREE.Mesh(sphere_geometry, sphere_material);
            this.sphere.position.set(x, y, -100);
            show_sphere = true;
            shell_container.add(this.sphere);
        }
    };

    this.sphere_off = function() {
        if (show_sphere) {
            show_sphere = false;
            shell_container.remove(this.sphere);
        }
    }
}

function Shells(player, scene) {
    this.player = player;
    this.scene = scene;
    this.elapsed_time = 0.0;
    
    shell_container = new THREE.Object3D();
    scene.add(shell_container);
            
    //var shells = [];
    this.shells = []; //shells;
    
    this.prune_dead_shells = function () {
        not_expired = []
        for (i in this.shells)
            if (!this.shells[i].expired)
                not_expired.push(this.shells[i])
        if (not_expired.length != this.shells.length)
            this.shells = not_expired;
    };
    
    this.evolve = function (elapsed) {
        this.elapsed_time += elapsed
        for (var i=0, len=this.shells.length; i < len; i++) {
            if (i < len-1) {
                this.shells[i].update(this.elapsed_time, this.shells[i+1]);
            } else {
                this.shells[i].update(this.elapsed_time);
            }
        }
        this.prune_dead_shells();
    };
    
    this.spawn = function (x, y) {
        //if (shells.length != 0) return;
        this.shells.push(new Shell(id++, shell_container, player.color, x, y, this.elapsed_time));
    };
    
    this.gone = function () {
        for (i in this.shells)
            this.shells[i].expire();
        scene.remove(shell_container);
    };
    
    this.unhighlight = null;
    this.highlighted = null;
    
    this.highlight_closest = function (x, y) {
        if (this.shells.length == 0) return;
        var shells_copy = this.shells.slice(0);
        for (i in shells_copy)
            shells_copy[i] = [Math.abs(shells_copy[i].distance(x, y)), shells_copy[i]];
        
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

