function Graphics() {
    var container = $('#container');

    var renderer = new THREE.WebGLRenderer();
    // TODO(pwaller): Implement fallback, use less points on shells
    //var renderer = new THREE.CanvasRenderer();
    this.renderer_element = $(renderer.domElement);
    renderer.setSize(WIDTH, HEIGHT);

    container.append(renderer.domElement);
    var stats = new Stats();
    stats.domElement.style.position = 'relative';
    stats.domElement.style.top = '-530px';
    container.append(stats.domElement);

    renderer.domElement.onselectstart = function () { return false; }
    this.renderer_element.attr("style", "display:inline; background: black; cursor:none;");
    // border: 2px solid grey; margin: 0 auto");

    this.scene = new THREE.Scene();
    var scene = this.scene;

    var camera = new THREE.OrthographicCamera(0, WIDTH, 0, HEIGHT, -100, 400);
    scene.add(camera);
        
    var pointLight = new THREE.PointLight(0xFFFFFF);
    pointLight.position.x = WIDTH / 2;
    pointLight.position.y = HEIGHT / 2;
    pointLight.position.z = -130;
    scene.add(pointLight);    
    scene.add(new THREE.AmbientLight(0x000f00));
        
    function animate() {
        renderer.render(scene, camera);
        stats.update();
        requestAnimationFrame(animate);
    }

    animate();
}
