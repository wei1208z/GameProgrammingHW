var T=1;

function clamp (val, min, max) { // min <= val <= max
   return Math.min(Math.max(val,min),max);
}

class man{
constructor(){
     
     this.pos=new THREE.Vector3(0,0,0);
     this.vel=new THREE.Vector3(0,0,0);
     this.force=new THREE.Vector3(0,0,0);
     this.power=0.5;
     this.angle=0;   
     this.target=null;

     this.MAXSPEED = 80;
     this.ARRIVAL_R = 30;

this.pose1 = {
  lThigh: Math.PI/6,
  rThigh: -Math.PI/6
}
this.pose2 = {
  lThigh: -Math.PI/6,
  rThigh: +Math.PI/6
}
this.keys = [
  [0, this.pose1],
  [0.5, this.pose2],
  [1, this.pose1]
];
}

update(dt){
    this.setTarget (agent.model.position.x+100,50,agent.model.position.z+100);
    this.accumulateForce();
    this.vel.add(this.force.clone().multiplyScalar(dt));

    // ARRIVAL: velocity modulation
    if (this.target !== null) {   
      let dst = this.target.distanceTo(this.pos);
      if (dst < this.ARRIVAL_R) {  // close enough
        this.vel.setLength(dst);
      }
    }
    
    // MAXSPEED modulation
    let speed = this.vel.length()
    this.vel.setLength(clamp (speed, 0, this.MAXSPEED))
    this.pos.add(this.vel.clone().multiplyScalar(dt))
    this.torso.position.copy(this.pos)

    // for orientable agent
    // non PD version
    if (this.vel.length() > 0.1) {
        this.angle = Math.atan2 (-this.vel.z, this.vel.x)
        this.torso.rotation.y = this.angle
        let intKey=this.keyframe(clock.getElapsedTime());
                this.lArm.rotation.z = intKey[1];
                this.rArm.rotation.z = intKey[0];
                this.lLeg.rotation.z = intKey[0];
                this.rLeg.rotation.z = intKey[1];
    }
}
   
  keyframe(t){
  var s = ((t - ts) % T) / T;

  for (var i = 1; i < this.keys.length; i++) {
    if (this.keys[i][0] > s) break;
  }
  // take i-1
  var ii = i - 1;
  var a = (s - this.keys[ii][0]) / (this.keys[ii + 1][0] - this.keys[ii][0]);
  let intKey = [this.keys[ii][1].lThigh * (1 - a) + this.keys[ii + 1][1].lThigh * a,
            this.keys[ii][1].rThigh * (1 - a) + this.keys[ii + 1][1].rThigh * a
  ];
  return intKey;
  } 

  buildman(WW,HH){

  this.head = this.buildHead(WW,HH);
  this.torso = this.buildTorso(WW,HH);
  this.lLeg = this.buildLLeg(WW,HH);
  this.rLeg = this.buildRLeg(WW,HH);
  this.lArm = this.buildLArm(WW,HH);
  this.rArm = this.buildRArm(WW,HH);

  this.torso.add (this.head,this.lLeg,this.rLeg,this.lArm,this.rArm);
  this.head.position.y = HH;
  this.torso.position.set (0, HH, 0);
  this.lLeg.position.set (0, 0, WW/2);
  this.rLeg.position.set (0, 0, -WW/2);
  this.lArm.position.set (0, HH, WW+2);
  this.rArm.position.set (0, HH, -WW-2);

  scene.add (this.torso);
  this.lLeg.rotation.z = Math.PI/6;
  this.rLeg.rotation.z =-Math.PI/6;
  }
   buildHead(WW,HH) {
  let head = new THREE.Group();
  let mesh = new THREE.Mesh (new THREE.BoxGeometry(2*WW,2*WW,2*WW), new THREE.MeshNormalMaterial());
  head.add (mesh);
  mesh.position.y = WW;
  return head;
  }

  buildLLeg(WW,HH) {
  let lLeg = new THREE.Group();
  let mesh = new THREE.Mesh (new THREE.BoxGeometry(WW,HH,WW), new THREE.MeshNormalMaterial());
  lLeg.add (mesh);
  mesh.position.y = -HH/2;
  return lLeg;
  }
  buildRLeg(WW,HH) {
  let rLeg = new THREE.Group();
  let mesh = new THREE.Mesh (new THREE.BoxGeometry(WW,HH,WW), new THREE.MeshNormalMaterial());
  rLeg.add (mesh);
  mesh.position.y = -HH/2;
  return rLeg;
  }

  buildTorso(WW,HH) {
  let torso = new THREE.Group();
  let mesh = new THREE.Mesh (new THREE.BoxGeometry(1*WW,HH,2*WW), new THREE.MeshNormalMaterial());
  torso.add (mesh);
  mesh.position.y = HH/2;

  return torso;
  }

  buildLArm(WW,HH){
  let lArm = new THREE.Group();
  let mesh = new THREE.Mesh (new THREE.BoxGeometry(WW,HH,WW), new THREE.MeshNormalMaterial());
  lArm.add (mesh);
  mesh.position.y = -HH/2;
  return lArm;
  }

  buildRArm(WW,HH){
  let rArm = new THREE.Group();
  let mesh = new THREE.Mesh (new THREE.BoxGeometry(WW,HH,WW), new THREE.MeshNormalMaterial());
  rArm.add (mesh);
  mesh.position.y = -HH/2;
  return rArm;
  }

  setTarget(x,y,z) {
    if (this.target !== null)
      this.target.copy(agent.model.localToWorld(new THREE.Vector3(35,-25,-4)));
    else {
      this.target = new THREE.Vector3(x,y,z);
    }
  }
  
  targetInducedForce(targetPos) { // seek
    return targetPos.clone().sub(this.pos).setLength(this.MAXSPEED).sub(this.vel);
  }

  accumulateForce() {
    if (this.target) 
      this.force.copy(this.targetInducedForce(this.target));
  }

}