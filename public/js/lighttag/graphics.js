function Graphics() {
    var container = $('#container');
    
    // TODO(pwaller): Show message of some sort if webgl fails
    // TODO(pwaller): Implement canvas fallback, use less points on shells
    //                 Maybe just have to render fewer shells.. 
    //                 What doesn't help: Disabling lighting
    if (options.usecanvas) {
        var renderer = new THREE.CanvasRenderer();
    } else {
        var renderer = new THREE.WebGLRenderer();
    }
    
    this.renderer_element = $(renderer.domElement);
    renderer.setSize(WIDTH, HEIGHT);
    renderer.sortObjects = false;

    container.append(renderer.domElement);
    var stats = new Stats();
    stats.domElement.style.position = 'relative';
    stats.domElement.style.top = '-530px';
    container.append(stats.domElement);

    renderer.domElement.onselectstart = function () { return false; }
    this.renderer_element.attr("style", "display:inline; background: black; cursor:none;");

    this.scene = new THREE.Scene();
    var scene = this.scene;

    var camera = new THREE.OrthographicCamera(0, WIDTH, 0, HEIGHT, -100, 400);
    scene.add(camera);
    
    if (!options.nolighting) {
        var pointLight = new THREE.PointLight(0xFFFFFF);
        pointLight.position.x = WIDTH / 2;
        pointLight.position.y = HEIGHT / 2;
        pointLight.position.z = -200;
        scene.add(pointLight);    
        scene.add(new THREE.AmbientLight(0x111111));
    }
        
    function animate() {
        renderer.render(scene, camera);
        stats.update();
        requestAnimationFrame(animate);
    }

    animate();
}
