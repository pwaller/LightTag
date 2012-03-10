
var INITIAL_SHELL_RADIUS = 10;

var shells = [];

var circleShape = new THREE.Shape();
circleShape.moveTo( 0, 0 );
circleShape.arc( 0, 0, INITIAL_SHELL_RADIUS, 0, Math.PI*2, false );
var circlePoints = circleShape.createPointsGeometry(50);
    
function update_nshells() { $("#ncirc").text(shells.length); }

function Shell(color, x, y) {
  update_nshells();
    
  var line = this.line = new THREE.Line(circlePoints, 
    new THREE.LineBasicMaterial({color: color, linewidth: 2, opacity:0.2}));
  parent.add(line);
    
  line.position.set(x, y, -100);
  this.s = 1;
  this.expired = false;
  
  this.expire = function () {
    this.expired = true;
    parent.remove(line);
  };
  
  this.evolve = function (elapsed) {
    this.s += 0.02 * elapsed;
    this.line.scale.set(this.s, this.s, this.s);
    if (this.s * INITIAL_SHELL_RADIUS > DIAGONAL) {
      this.expire();
    }
  };
}


function prune_dead_shells() {
  not_expired = []
  for (i in shells)
    if (!shells[i].expired)
      not_expired.push(shells[i])
  if (not_expired.length != shells.length)
    shells = not_expired;
  update_nshells();
}

var last_update = 0; 

function evolve_shells() {
  window.setTimeout(evolve_shells, 10);
  now = (new Date()).getTime();
  elapsed = now - last_update;
  if (last_update == 0) { last_update = now; return; }
  last_update = now;
        
  for (i in shells)
    shells[i].evolve(elapsed);
  prune_dead_shells();
}

