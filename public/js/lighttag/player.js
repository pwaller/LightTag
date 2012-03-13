
function Player(scene, id, name, color) {
    console.log("New player: ", id, name, color);

    this.id = id;
    this.color = color;
    
    var shells = new Shells(this, scene);
    this.shells = shells;

    var sphere_material = new THREE.MeshLambertMaterial({color: color});
    var sphere = new THREE.Mesh(new THREE.SphereGeometry(10, 8, 8), sphere_material);

    scene.add(sphere);
    this.gone = function () {
        console.log("Player gone: ", this);
        scene.remove(sphere);
        shells.gone();
    };

    sphere.position.x = WIDTH / 2;
    sphere.position.y = HEIGHT / 2;
    sphere.position.z = 0;

    this.move = function (data) {
        sphere.position.x = data[0];
        sphere.position.y = data[1];
        shells.spawn(data[0], data[1]);
    };
    
    this.tick = function (elapsed) {
        shells.evolve(elapsed);
        //shells.highlight_closest(50, 50);
    };
}
