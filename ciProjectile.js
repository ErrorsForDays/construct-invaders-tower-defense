function ciProjectile(game, tower, position, speed){
	this.id = ciProjectile.prototype.idCounter++;
	this.game = game;
	this.tower = tower;
	this.position = position.clone();
	this.speed = speed.clone();

	this.mesh = this.getMesh();
	this.game.threeObjects.scene.add(this.mesh);

	ciProjectile.prototype.projectiles.push(this);
}
ciProjectile.prototype.idCounter = 0;
ciProjectile.prototype.projectiles = [];
ciProjectile.prototype.PROJECTILE_TYPES = {MORTAR: 0};
Object.freeze(ciProjectile.prototype.PROJECTILE_TYPES);

ciProjectile.prototype.destroy = function(){
	this.game.threeObjects.scene.remove(this.mesh);
	ciProjectile.prototype.projectiles.splice(ciProjectile.prototype.projectiles.indexOf(this), 1);
}

ciProjectile.prototype.move = function(time){
	var raycaster = new THREE.Raycaster(this.position, this.speed.clone().normalize());
	var intersections = raycaster.intersectObjects(this.game.level.collidableMeshes);
	if(intersections.length > 0 && intersections[0].distance < this.speed.length()*time/1000){
		this.strike(intersections[0].point);
	}else{
		this.position.add(this.speed.clone().multiplyScalar(time/1000));
		this.speed.z -= this.game.gravity*time/1000;
	}
	this.mesh.position.copy(this.position);
}

function ciMortarProjectile(game, tower, position, speed, damage){
	this.type = ciProjectile.prototype.PROJECTILE_TYPES.MORTAR;
	this.ParentConstructor(game, tower, position, speed);
	this.damage = damage;
}
ciMortarProjectile.prototype = Object.create(ciProjectile.prototype);
ciMortarProjectile.prototype.ParentConstructor = ciProjectile;

ciMortarProjectile.prototype.getMesh = function(){
	var geometry = new THREE.SphereGeometry(25);
	return new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: 0x444444}));
}

ciMortarProjectile.prototype.strike = function(point){
	var blastRadius = 2*this.game.tileRadius;
	var distanceToStrike = null;
	var mobs = ciMob.prototype.mobs;
	var killedSome = false;
	for(var i in mobs){
		distanceToStrike = mobs[i].mesh.position.distanceTo(point);
		if(distanceToStrike < blastRadius){
			if(!mobs[i].ouchAmIDead(this.damage * (blastRadius - distanceToStrike)/blastRadius)){
				mobs[i].blast(point, blastRadius, 250);
			}else{
				this.tower.kills++;
				killedSome = true;
			}
		}
	}
	if(killedSome && this.game.selectedItem === this.tower) $('#killCountSpan').empty().append(this.tower.kills);
	this.destroy();
}

function ciEmpSpark(target, originPosition, tower){
	this.id = ciEmpSpark.prototype.idCounter++;
	this.target = target;
	this.tower = tower;
	this.particleSystem = target.game.level.particleSystem;
	this.particleGeometry = this.particleSystem.geometry;
	this.particleVertices = this.particleSystem.geometry.vertices;
	this.destroyed = false;

	for(var i in this.particleVertices){
		if(this.particleVertices[i].x == 0 && this.particleVertices[i].y == 0 && this.particleVertices[i].z > 1000){
			this.particlePosition = this.particleVertices[i];
			break;
		}
	}

	this.particlePosition.copy(originPosition);
	this.particleGeometry.verticesNeedUpdate = true;

	this.moveTime = 0;
	this.speed = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
	this.speed.setLength(100);

	ciEmpSpark.prototype.empSparks.push(this);
}
ciEmpSpark.prototype.idCounter = 0;
ciEmpSpark.prototype.empSparks = [];
ciEmpSpark.prototype.material = new THREE.ParticleBasicMaterial({color: 0xffffff, size: 50});

ciEmpSpark.prototype.destroy = function(){
	this.destroyed = true;
	this.particlePosition.set(0, 0, 10000);
	this.particleGeometry.verticesNeedUpdate = true;
	this.particlePosition = null;
	this.target.empSparks.splice(this.target.empSparks.indexOf(this), 1);
	ciEmpSpark.prototype.empSparks.splice(ciEmpSpark.prototype.empSparks.indexOf(this), 1);
}

ciEmpSpark.prototype.move = function(){
	this.particlePosition.add(this.speed.clone().multiplyScalar(this.moveTime/1000));
	var pull = new THREE.Vector3();
	pull.subVectors(this.target.mesh.position, this.particlePosition);
	var length = Math.max(200, 100/Math.pow(pull.length(), 2));
	length *= this.moveTime/1000;
	pull.setLength(length);
	this.speed.add(pull);
	if(this.speed.length() > 100){
		this.speed.setLength(100);
	}else if(this.speed.length() < 40){
		this.speed.setLength(40);
	}
	this.moveTime = 0;
	this.particleGeometry.verticesNeedUpdate = true;
}


