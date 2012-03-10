

function Player(scene, id, color) {
  this.id = id;
  this.color = color;
  
  var sphereMaterial = new THREE.MeshLambertMaterial({color: color});
  var sphere = new THREE.Mesh(new THREE.SphereGeometry(10, 8, 8), sphereMaterial);

  scene.add(sphere);
  this.gone = function () { scene.remove(sphere); }
    
  sphere.position.x = WIDTH / 2;
  sphere.position.y = HEIGHT / 2;
  sphere.position.z = 0;

  this.move = function (data) {
    sphere.position.x = data[0]; sphere.position.y = data[1];
  };
    
}
