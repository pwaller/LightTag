function add_sidebar() {
    var name = $("#name").val();
    $("#players").append(
    $("<div>").addClass("alert alert-info")
        .append($("<div>").text("Le " + name))
        .append($("<div>").addClass("progress progress-success")
            .append($("<div>").addClass("bar").attr("style", "width: 20%")))
    );
}

function SidebarEntry(player) {
    this.player = player;
    
    this.player_elem = $("#player-template").clone().show();
    
    $("#players").append(this.player_elem);
    $("#name", this.player_elem).text(player.name);
    this.gone = function() {
        this.player_elem.remove();
    }
}

function Player(scene, id, name, color) {
    console.log("New player: ", id, name, color);

    this.id = id;
    this.color = color;
    this.name = name;
    
    this.sidebar_entry = new SidebarEntry(this);
    
    var shells = new Shells(this, scene);
    this.shells = shells;

    var sphere_material = new THREE.MeshLambertMaterial({color: color});
    var sphere = new THREE.Mesh(new THREE.SphereGeometry(10, 3, 3), sphere_material);

    if (id == options.primary)
        scene.add(sphere)

    this.gone = function () {
        console.log("Player gone: ", this);
        scene.remove(sphere);
        shells.gone();
        this.sidebar_entry.gone();
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
