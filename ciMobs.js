function ciMob(game, spawnTile){
	/** @constructor*/
	this.id = ciMob.prototype.idCounter++;
	this.game = game;
	this.destroyed = false;
	this.falling = false;
	this.fallDirection = new THREE.Vector3();
	this.fallRotation = new THREE.Vector3();

	this.INFO = ciMob.prototype.MOB_INFO[this.type];
	this.title = this.INFO.title || "Missing title";
	this.description = this.INFO.description || "Missing description";
	this.energy = this.INFO.energy || 1;
	this.mass = this.INFO.mass || 1;
	this.maxHp = this.INFO.maxHp || 1;
	this.hp = this.maxHp;
	this.shield = this.INFO.shield || 0;
	this.babies = this.INFO.babies || 0;
	this.speed = this.INFO.speedInTileRadiuses * this.game.tileRadius || this.game.tileRadius;
	this.radius = this.INFO.radiusInTileRadiuses * this.game.tileRadius || this.game.tileRadius;

	this.empSparks = [];
	this.hpMesh = null;
	this.mesh = this.getMesh();
	this.mesh.scale.multiplyScalar(this.radius);
	this.game.threeObjects.scene.add(this.mesh);
	this.position = new THREE.Vector3(); //this is the position projected onto the map
	this.position.set(spawnTile.position.x + Math.random()*this.game.tileRadius - this.game.tileRadius/2,
				spawnTile.position.y + Math.random()*this.game.tileRadius - this.game.tileRadius/2,
				spawnTile.position.z);
	this.mesh.position.set(this.position.x, this.position.y, this.position.z + this.radius);
	if(game.timeDelta < game.tickTimelimit) this.blast(spawnTile.position, 2*this.game.tileRadius, 150);

	this.currentTile = spawnTile;
	this.pathToHomeBase = this.game.level.pathsToHomeBase[this.currentTile.id];
	this.moveOffset = new THREE.Vector3();
	this.nextTile = this.currentTile.neighbors[this.game.level.pathsToHomeBase[this.currentTile.id].side];
	this.nextPosition = new THREE.Vector3();
	this.nextPosition.copy(spawnTile.position);
	this.nextPositionIsTileCenter = true;
	this.distanceTravelled = 0;
	this.distanceRemaining = 10000;
	this.direction = 0;
	this.moveTime = 0;
	
	ciMob.prototype.mobs.push(this);
}
ciMob.prototype.idCounter = 0;
ciMob.prototype.mobs = [];
ciMob.prototype.MOB_TYPES = {TRIANGLE: 0, TETRAHEDRON: 1, OCTAHEDRON: 2, ICOSAHEDRON: 3, SPHERE: 4, SQUARE: 5, CUBE: 6, SUPERCUBE: 7, MEGACUBE: 8, HYPERCUBE: 9};
ciMob.prototype.materials = [new THREE.MeshNormalMaterial({side: THREE.DoubleSide})];
ciMob.prototype.MOB_INFO = [];
ciMob.prototype.MOB_INFO[ciMob.prototype.MOB_TYPES.TRIANGLE] = {	title: "Triangle",
									description: "Mostly pointy.",
									difficulty: 3,
									energy: 1,
									mass: 0.8,
									maxHp: 3,
									speedInTileRadiuses: 1.2,
									radiusInTileRadiuses: 0.2};
ciMob.prototype.MOB_INFO[ciMob.prototype.MOB_TYPES.TETRAHEDRON] = {	title: "Tetrahedron",
									description: "Pyramids are creepy.",
									difficulty: 24,
									energy: 2,
									mass: 1,
									maxHp: 12,
									babies: 4,
									speedInTileRadiuses: 1.5,
									radiusInTileRadiuses: 0.2};
ciMob.prototype.MOB_INFO[ciMob.prototype.MOB_TYPES.OCTAHEDRON] = {	title: "Octahedron",
									description: "8 Slices of pizza.",
									difficulty: 136,
									energy: 4,
									mass: 1,
									maxHp: 36,
									babies: 4,
									speedInTileRadiuses: 0.55,
									radiusInTileRadiuses: 0.25};
ciMob.prototype.MOB_INFO[ciMob.prototype.MOB_TYPES.ICOSAHEDRON] = {	title: "Icosahedron",
									description: "Come here!",
									difficulty: 600,
									energy: 10,
									mass: 1,
									maxHp: 100,
									babies: 4,
									speedInTileRadiuses: 0.50,
									radiusInTileRadiuses: 0.33};
ciMob.prototype.MOB_INFO[ciMob.prototype.MOB_TYPES.SPHERE] = {	title: "Sphere",
									description: "This planet contains mostly triangles.",
									difficulty: 2650,
									energy: 25,
									mass: 1.5,
									maxHp: 250,
									babies: 4,
									speedInTileRadiuses: 0.35,
									radiusInTileRadiuses: 0.5};
ciMob.prototype.MOB_INFO[ciMob.prototype.MOB_TYPES.SQUARE] = {	title: "Square",
									description: "Shielded",
									difficulty: 5,
									energy: 1.5,
									mass: 1,
									maxHp: 3,
									shield: 0.5,
									speedInTileRadiuses: 1,
									radiusInTileRadiuses: 0.2};
ciMob.prototype.MOB_INFO[ciMob.prototype.MOB_TYPES.CUBE] = {		title: "Cube",
									description: "Shielded",
									difficulty: 50,
									energy: 3,
									mass: 1.2,
									maxHp: 12,
									babies: 6,
									shield: 1,
									speedInTileRadiuses: 0.55,
									radiusInTileRadiuses: 0.2};
ciMob.prototype.MOB_INFO[ciMob.prototype.MOB_TYPES.SUPERCUBE] = {	title: "Super Cube",
									description: "Shielded",
									difficulty: 400,
									energy: 6,
									mass: 12,
									maxHp: 20,
									shield: 2,
									babies: 8,
									speedInTileRadiuses: 0.35,
									radiusInTileRadiuses: 0.4};
ciMob.prototype.MOB_INFO[ciMob.prototype.MOB_TYPES.MEGACUBE] = {	title: "Mega Cube",
									description: "Shielded",
									difficulty: 1400,
									energy: 12,
									mass: 2,
									maxHp: 100,
									babies: 27,
									shield: 4,
									speedInTileRadiuses: 0.35,
									radiusInTileRadiuses: 0.6};
ciMob.prototype.MOB_INFO[ciMob.prototype.MOB_TYPES.HYPERCUBE] = {	title: "Hyper Cube",
									description: "Shielded",
									difficulty: 6000,
									energy: 25,
									mass: 0.5,
									maxHp: 250,
									babies: 4,
									shield: 6,
									speedInTileRadiuses: 0.5,
									radiusInTileRadiuses: 0.6};




ciMob.prototype.getMobByMesh = function(mesh){
	for(var i in ciMob.prototype.mobs){
		if(mesh === ciMob.prototype.mobs[i].mesh){
			return ciMob.prototype.mobs[i];
		}
	}
	return null;
}

ciMob.prototype.getInfo = function(){
        var html =  this.title;
        if(!this.game.showSelectedItemDetail){
                html += "<button class='button' onclick='" + this.game.JSName + ".showSelectedItemDetail = true; " + this.game.JSName + ".showSelectedItemInfo();'>Show Detail</button>";
        }
        html += "<button class='closeButton' onclick='" + this.game.JSName + ".unselectSelectedItem();'><img src='images/close.png' height='16' class='energyImg'></button>";
        return html;
}

ciMob.prototype.getInfoDetail = function(){
	var html = "Health: <span id='mobHpSpan'>" + this.hp + "</span>/" + this.maxHp + "<br>";
	html += "Shield: " + this.shield + "<br>";
	html += "Speed: " + this.speed + "<br>";
	html += "<button class='closeButton' onclick='" + this.game.JSName + ".showSelectedItemDetail = false; " + this.game.JSName + ".showSelectedItemInfo();'><img src='images/close.png' height='16' class='energyImg'></button>";
	return html;
}

ciMob.prototype.noLongerSelected = function(){
	//do nothing
}

ciMob.prototype.blast = function(origin, blastRadius, force){
	this.fallDirection.subVectors(this.position, origin);
	this.fallDirection.z += blastRadius - this.fallDirection.length();
	this.fallDirection.normalize();
	this.fallDirection.setLength(force/this.mass);
	this.falling = true;
	this.fallRotation.set(Math.random(), Math.random(), Math.random());
	this.mesh.rotation.copy(this.fallRotation);
}

ciMob.prototype.land = function(position){
	this.position.copy(position);
	var tmpTile = hexTile.prototype.getTileByPosition(position, 3*this.game.tileRadius);

	if(tmpTile != null && this.game.level.pathsToHomeBase[tmpTile.id] !== undefined){
		this.currentTile = tmpTile;
		this.pathToHomeBase = this.game.level.pathsToHomeBase[this.currentTile.id];
	}
	this.nextPosition.addVectors(this.currentTile.sidePoints[this.pathToHomeBase.side], this.currentTile.position);
	this.nextPositionIsTileCenter = false;
	this.nextTile = this.currentTile.neighbors[this.pathToHomeBase.side];
	this.falling = false;
}

ciMob.prototype.move = function(time){
	if(this.falling){
		var fallDirectionLength = this.fallDirection.length();
		var remainingDistance = fallDirectionLength * time/1000;
		var remainingDirection = this.fallDirection.clone().normalize();
		var raycaster = null;
		var intersections = null;
		if(this.mesh.position.z < -100){
			this.position.z = 0;
			this.land(this.position);
			remainingDistance = 0;
		}
		var bounces = 0;
		while(remainingDistance > 0){

			raycaster = new THREE.Raycaster(this.mesh.position, remainingDirection, 0, remainingDistance + this.radius);
			intersections = raycaster.intersectObjects(this.game.level.collidableMeshes);
			if(intersections.length > 0 && intersections[0].distance < remainingDistance + this.radius){
				if(bounces++ > 2){
					this.land(this.position);
					break;
				}
				if(hexTile.prototype.getTileByMesh(intersections[0].object) !== null){
					this.fallDirection.multiplyScalar(this.game.bounce);
					fallDirectionLength *= this.game.bounce;
					if(fallDirectionLength < 20){
                                        	this.land(intersections[0].point);
						break;
                                	}
				}

				//still bouncing
				if(intersections[0].distance > this.radius){
					this.position.add(remainingDirection.clone().normalize().multiplyScalar(intersections[0].distance - this.radius));
					remainingDistance -= intersections[0].distance - this.radius;
					this.mesh.position.set(this.position.x, this.position.y, this.position.z + this.radius);
				}

				if(intersections[0].object.rotation.length() > 0){
					var rotationMatrix = new THREE.Matrix4();
					rotationMatrix.setRotationFromEuler(intersections[0].object.rotation, intersections[0].object.eulerOrder);

					var rotatedNormal = intersections[0].face.normal.clone();
					rotatedNormal.transformDirection(rotationMatrix);
				}else{
					var rotatedNormal = intersections[0].face.normal.clone();
				}
				remainingDirection = rotatedNormal.multiplyScalar(-2*remainingDirection.dot(rotatedNormal)).add(remainingDirection);

				this.fallRotation.set(Math.random(), Math.random(), Math.random());
			}else{
				remainingDirection.multiplyScalar(remainingDistance);
				this.position.add(remainingDirection);
				remainingDistance = 0;
				if(bounces > 0) this.fallDirection = remainingDirection.clone().setLength(this.fallDirection.length());
				this.fallDirection.z -= this.game.gravity*time/1000;
				this.mesh.rotation.z = (this.mesh.rotation.z + this.fallRotation.z*time/300)%(2*Math.PI);
				this.mesh.rotation.y = (this.mesh.rotation.y + this.fallRotation.y*time/300)%(2*Math.PI);
				this.mesh.rotation.x = (this.mesh.rotation.x + this.fallRotation.x*time/300)%(2*Math.PI);
			}
		}
	}else{
		var distance = this.speed*time/1000;
		this.distanceTravelled += distance;
		var toNext = this.position.distanceTo(this.nextPosition);
		while(toNext < distance){
			this.position.copy(this.nextPosition);
			distance -= toNext;
			if(!this.nextPositionIsTileCenter){
				//do not move to a tile that no longer has a path
				if(this.game.level.pathsToHomeBase[this.nextTile.id] !== undefined){
					this.currentTile = this.nextTile;
				}
				this.pathToHomeBase = this.game.level.pathsToHomeBase[this.currentTile.id];
				if(this.currentTile === this.game.level.homeBaseTile){
					this.game.addCash(-3 * this.energy - this.game.level.timesBurned++);
					this.ouchAmIDead(this.hp, true);
					this.game.playSound("spark");
					return;
				}
				this.nextPosition.copy(this.currentTile.position);
				this.moveOffset.copy(this.currentTile.cornerPoints[(this.pathToHomeBase.side + 1)%6]);
				this.moveOffset.multiplyScalar(Math.random() - 0.5);
				this.nextPosition.add(this.moveOffset);
				this.nextPositionIsTileCenter = true;
				this.nextTile = this.currentTile.neighbors[this.pathToHomeBase.side];
				this.distanceRemaining = this.pathToHomeBase.steps * 2 * this.game.tileRadius;
			}else{
				this.nextPosition.addVectors(this.currentTile.sidePoints[this.pathToHomeBase.side],
							this.currentTile.position);
				this.moveOffset.subVectors(this.currentTile.cornerPoints[this.pathToHomeBase.side], this.currentTile.cornerPoints[(this.pathToHomeBase.side + 5)%6]);
				this.moveOffset.multiplyScalar(Math.random() - 0.5);
				this.nextPosition.add(this.moveOffset);
				this.nextPositionIsTileCenter = false;
				this.distanceRemaining = ((this.pathToHomeBase.steps - 1) * 2 + 1) * this.game.tileRadius;
				this.direction = (2*Math.PI/3 + this.pathToHomeBase.side * Math.PI/3)%(2*Math.PI);
			}
			var toNext = this.position.distanceTo(this.nextPosition);
		}
		this.distanceRemaining -= distance;
		var moveVector = new THREE.Vector3();
		moveVector.subVectors(this.nextPosition, this.position);
		moveVector.setLength(distance);
		this.position.add(moveVector);
	}

	this.mesh.position.set(this.position.x, this.position.y, this.position.z + this.radius);
	if(!this.falling){
		this.mesh.rotation.set(0, 0, 0);
		this.mesh.rotation.z = this.direction;
		this.mesh.rotation.x = -1*this.distanceTravelled/this.radius;
	}
	if(this.hpMesh != null){
		this.hpMesh.position.set(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z + this.radius * 1.5);
		this.hpMesh.rotation.z = this.game.theta * Math.PI/180;
	}
	if(this === this.game.selectedItem) this.game.updateSelectedItemMarkupMeshPosition();
	this.moveTime = 0;
}

ciMob.prototype.destroy = function(){
	if(this.game.selectedItem === this) this.game.unselectSelectedItem();
	this.game.threeObjects.scene.remove(this.mesh);
	if(this.hpMesh != null) this.game.threeObjects.scene.remove(this.hpMesh);
	while(this.empSparks.length > 0){ this.empSparks[0].destroy();}
	ciMob.prototype.mobs.splice(ciMob.prototype.mobs.indexOf(this), 1);
	this.destroyed = true;
}

ciMob.prototype.ouchAmIDead = function(damage, ignoreShields){
	if(ignoreShields){
		this.hp -= damage;
	}else{
		this.hp -= Math.max(0, damage - this.shield);
	}
	if(this.hp <= 0){
		var baby = null;
		var sparksPerBaby = this.empSparks.length/this.babies;
		for(var i = 0; i < this.babies; i++){
			baby = new this.BabyConstructor(this.game, this.currentTile);
			baby.position.add(this.position);
			baby.position.sub(this.currentTile.position);
			for(var j = 0; j < sparksPerBaby && this.empSparks.length > 0; j++){
				baby.empSparks.push(this.empSparks[0]);
				baby.sparkTimer = this.sparkTimer;
				this.empSparks[0].target = baby;
				this.empSparks.splice(0, 1);
			}
		}

		this.game.addCash(this.energy);
		this.destroy();
		if(this.babies > 0) this.game.playSound("pop");

		return true;
	}else{
		if(this.hpMesh == null) this.hpMesh = this.getHpMesh();
		this.hpMesh.scale.x = this.hp/this.maxHp * 2 * this.radius * 1.5;
		this.hpMesh.material.color.r = 1 - this.hp/this.maxHp;
		this.hpMesh.material.color.g = this.hp/this.maxHp;
		if(this.game.selectedItem === this) $('#mobHpSpan').empty().append(Math.round(this.hp*100)/100);
		return false;
	}
}

ciMob.prototype.getMesh = function(){
	var mesh = new THREE.Mesh(this.geometry, this.material);
	mesh.eulerOrder = "ZXY";
	return mesh;
}

ciMob.prototype.getHpMesh = function(){
	var geometry = new THREE.CubeGeometry(1, (this.radius*1.5)/5, (this.radius*1.5)/10);
	var mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: 0x000000}));
	this.game.threeObjects.scene.add(mesh);
	return mesh;
}

function ciTriangleMob(game, spawnTile){
	/** @constructor*/
	this.type = ciMob.prototype.MOB_TYPES.TRIANGLE;
	this.geometry = ciTriangleMob.prototype.geometry;
	this.material = game.materialSets[game.level.materialSetIndex].materials.triangleDouble;
	this.ParentConstructor(game, spawnTile);
}
ciTriangleMob.prototype = Object.create(ciMob.prototype);
ciTriangleMob.prototype.ParentConstructor = ciMob;
ciTriangleMob.prototype.initGeometry = function(){
	var geometry = new THREE.Geometry();
	geometry.vertices.push(new THREE.Vector3(0, 1, 0));
	geometry.vertices.push(new THREE.Vector3(Math.sin(Math.PI*2/3), Math.cos(Math.PI*2/3), 0));
	geometry.vertices.push(new THREE.Vector3(Math.sin(Math.PI*4/3), Math.cos(Math.PI*4/3), 0));
	geometry.faces.push(new THREE.Face3(0, 1, 2));
	geometry.computeFaceNormals();
	ciTriangleMob.prototype.geometry = geometry;
}
ciTriangleMob.prototype.initGeometry();

function ciTetrahedronMob(game, spawnTile){
	/** @constructor*/
	this.type = ciMob.prototype.MOB_TYPES.TETRAHEDRON;
	this.geometry = ciTetrahedronMob.prototype.geometry;
	this.material = game.materialSets[game.level.materialSetIndex].materials.triangle;
	this.ParentConstructor(game, spawnTile);
}
ciTetrahedronMob.prototype = Object.create(ciMob.prototype);
ciTetrahedronMob.prototype.ParentConstructor = ciMob;
ciTetrahedronMob.prototype.BabyConstructor = ciTriangleMob;
ciTetrahedronMob.prototype.geometry = new THREE.TetrahedronGeometry(1);
ciTetrahedronMob.prototype.geometry.computeFaceNormals();

function ciOctahedronMob(game, spawnTile){
	/** @constructor*/
	this.type = ciMob.prototype.MOB_TYPES.OCTAHEDRON;
	this.geometry = ciOctahedronMob.prototype.geometry;
	this.material = game.materialSets[game.level.materialSetIndex].materials.triangle;
	this.ParentConstructor(game, spawnTile);
}
ciOctahedronMob.prototype = Object.create(ciMob.prototype);
ciOctahedronMob.prototype.ParentConstructor = ciMob;
ciOctahedronMob.prototype.BabyConstructor = ciTetrahedronMob;
ciOctahedronMob.prototype.geometry = new THREE.OctahedronGeometry(1);
ciOctahedronMob.prototype.geometry.computeFaceNormals();

function ciIcosahedronMob(game, spawnTile){
	/** @constructor*/
	this.type = ciMob.prototype.MOB_TYPES.ICOSAHEDRON;
	this.geometry = ciIcosahedronMob.prototype.geometry;
	this.material = game.materialSets[game.level.materialSetIndex].materials.triangle;
	this.ParentConstructor(game, spawnTile);
}
ciIcosahedronMob.prototype = Object.create(ciMob.prototype);
ciIcosahedronMob.prototype.ParentConstructor = ciMob;
ciIcosahedronMob.prototype.BabyConstructor = ciOctahedronMob;
ciIcosahedronMob.prototype.geometry = new THREE.IcosahedronGeometry(1);
ciIcosahedronMob.prototype.geometry.computeFaceNormals();

function ciSphereMob(game, spawnTile){
	/** @constructor*/
	this.type = ciMob.prototype.MOB_TYPES.SPHERE;
	this.geometry = ciSphereMob.prototype.geometry;
	this.material = game.materialSets[game.level.materialSetIndex].materials.triangle;
	this.ParentConstructor(game, spawnTile);
}
ciSphereMob.prototype = Object.create(ciMob.prototype);
ciSphereMob.prototype.ParentConstructor = ciMob;
ciSphereMob.prototype.BabyConstructor = ciIcosahedronMob;
ciSphereMob.prototype.geometry = new THREE.SphereGeometry(1);
ciSphereMob.prototype.geometry.computeFaceNormals();

function ciSquareMob(game, spawnTile){
	/** @constructor*/
	this.type = ciMob.prototype.MOB_TYPES.SQUARE;
	this.geometry = ciSquareMob.prototype.geometry;
	this.material = game.materialSets[game.level.materialSetIndex].materials.squareDouble;
	this.ParentConstructor(game, spawnTile);
}
ciSquareMob.prototype = Object.create(ciMob.prototype);
ciSquareMob.prototype.ParentConstructor = ciMob;
ciSquareMob.prototype.initGeometry = function(){
	var geometry = new THREE.Geometry();
	geometry.vertices.push(new THREE.Vector3(0.71, 0.71, 0));
	geometry.vertices.push(new THREE.Vector3(-0.71, 0.71, 0));
	geometry.vertices.push(new THREE.Vector3(-0.71, -0.71, 0));
	geometry.vertices.push(new THREE.Vector3(0.71, -0.71, 0));
	geometry.faces.push(new THREE.Face4(0, 1, 2, 3));
	geometry.computeFaceNormals();
	ciSquareMob.prototype.geometry = geometry;
}
ciSquareMob.prototype.initGeometry();

function ciCubeMob(game, spawnTile){
	/** @constructor*/
	this.type = ciMob.prototype.MOB_TYPES.CUBE;
	this.geometry = ciCubeMob.prototype.geometry;
	this.material = game.materialSets[game.level.materialSetIndex].materials.square;
	this.ParentConstructor(game, spawnTile);
}
ciCubeMob.prototype = Object.create(ciMob.prototype);
ciCubeMob.prototype.ParentConstructor = ciMob;
ciCubeMob.prototype.BabyConstructor = ciSquareMob;
ciCubeMob.prototype.geometry = new THREE.CubeGeometry(1.42, 1.42, 1.42);
ciCubeMob.prototype.geometry.computeFaceNormals();

function ciSupercubeMob(game, spawnTile){
	/** @constructor*/
	this.type = ciMob.prototype.MOB_TYPES.SUPERCUBE;
	this.geometry = ciSupercubeMob.prototype.geometry;
	this.material = game.materialSets[game.level.materialSetIndex].materials.square;
	this.ParentConstructor(game, spawnTile);
}
ciSupercubeMob.prototype = Object.create(ciMob.prototype);
ciSupercubeMob.prototype.ParentConstructor = ciMob;
ciSupercubeMob.prototype.BabyConstructor = ciCubeMob;
ciSupercubeMob.prototype.geometry = new THREE.Geometry();
var tmpGeometry = new THREE.CubeGeometry(1, 1, 1);
var tmpMesh = new THREE.Mesh(tmpGeometry);
tmpMesh.position.set(0.55, 0.55, 0.55);
THREE.GeometryUtils.merge(ciSupercubeMob.prototype.geometry, tmpMesh);
tmpMesh.position.set(-0.55, 0.55, 0.55);
THREE.GeometryUtils.merge(ciSupercubeMob.prototype.geometry, tmpMesh);
tmpMesh.position.set(-0.55, -0.55, 0.55);
THREE.GeometryUtils.merge(ciSupercubeMob.prototype.geometry, tmpMesh);
tmpMesh.position.set(0.55, -0.55, 0.55);
THREE.GeometryUtils.merge(ciSupercubeMob.prototype.geometry, tmpMesh);
tmpMesh.position.set(0.55, 0.55, -0.55);
THREE.GeometryUtils.merge(ciSupercubeMob.prototype.geometry, tmpMesh);
tmpMesh.position.set(-0.55, 0.55, -0.55);
THREE.GeometryUtils.merge(ciSupercubeMob.prototype.geometry, tmpMesh);
tmpMesh.position.set(-0.55, -0.55, -0.55);
THREE.GeometryUtils.merge(ciSupercubeMob.prototype.geometry, tmpMesh);
tmpMesh.position.set(0.55, -0.55, -0.55);
THREE.GeometryUtils.merge(ciSupercubeMob.prototype.geometry, tmpMesh);
tmpMesh = new THREE.Mesh(ciSupercubeMob.prototype.geometry);
tmpMesh.scale.multiplyScalar(0.676);
ciSupercubeMob.prototype.geometry = new THREE.Geometry();
THREE.GeometryUtils.merge(ciSupercubeMob.prototype.geometry, tmpMesh);
ciSupercubeMob.prototype.geometry.computeFaceNormals();

function ciMegacubeMob(game, spawnTile){
	/** @constructor*/
	this.type = ciMob.prototype.MOB_TYPES.MEGACUBE;
	this.geometry = ciMegacubeMob.prototype.geometry;
	this.material = game.materialSets[game.level.materialSetIndex].materials.square;
	this.ParentConstructor(game, spawnTile);
}
ciMegacubeMob.prototype = Object.create(ciMob.prototype);
ciMegacubeMob.prototype.ParentConstructor = ciMob;
ciMegacubeMob.prototype.BabyConstructor = ciCubeMob;
ciMegacubeMob.prototype.geometry = new THREE.Geometry();
tmpMesh = new THREE.Mesh(tmpGeometry);
tmpMesh.position.set(1.1, 1.1, 1.1);
THREE.GeometryUtils.merge(ciMegacubeMob.prototype.geometry, tmpMesh);
tmpMesh.position.set(1.1, 0, 1.1);
THREE.GeometryUtils.merge(ciMegacubeMob.prototype.geometry, tmpMesh);
tmpMesh.position.set(1.1, -1.1, 1.1);
THREE.GeometryUtils.merge(ciMegacubeMob.prototype.geometry, tmpMesh);
tmpMesh.position.set(0, 1.1, 1.1);
THREE.GeometryUtils.merge(ciMegacubeMob.prototype.geometry, tmpMesh);
tmpMesh.position.set(0, 0, 1.1);
THREE.GeometryUtils.merge(ciMegacubeMob.prototype.geometry, tmpMesh);
tmpMesh.position.set(0, -1.1, 1.1);
THREE.GeometryUtils.merge(ciMegacubeMob.prototype.geometry, tmpMesh);
tmpMesh.position.set(-1.1, 1.1, 1.1);
THREE.GeometryUtils.merge(ciMegacubeMob.prototype.geometry, tmpMesh);
tmpMesh.position.set(-1.1, 0, 1.1);
THREE.GeometryUtils.merge(ciMegacubeMob.prototype.geometry, tmpMesh);
tmpMesh.position.set(-1.1, -1.1, 1.1);
THREE.GeometryUtils.merge(ciMegacubeMob.prototype.geometry, tmpMesh);
tmpMesh.position.set(1.1, 1.1, 0);
THREE.GeometryUtils.merge(ciMegacubeMob.prototype.geometry, tmpMesh);
tmpMesh.position.set(1.1, 0, 0);
THREE.GeometryUtils.merge(ciMegacubeMob.prototype.geometry, tmpMesh);
tmpMesh.position.set(1.1, -1.1, 0);
THREE.GeometryUtils.merge(ciMegacubeMob.prototype.geometry, tmpMesh);
tmpMesh.position.set(0, 1.1, 0);
THREE.GeometryUtils.merge(ciMegacubeMob.prototype.geometry, tmpMesh);
tmpMesh.position.set(0, -1.1, 0);
THREE.GeometryUtils.merge(ciMegacubeMob.prototype.geometry, tmpMesh);
tmpMesh.position.set(-1.1, 1.1, 0);
THREE.GeometryUtils.merge(ciMegacubeMob.prototype.geometry, tmpMesh);
tmpMesh.position.set(-1.1, 0, 0);
THREE.GeometryUtils.merge(ciMegacubeMob.prototype.geometry, tmpMesh);
tmpMesh.position.set(-1.1, -1.1, 0);
THREE.GeometryUtils.merge(ciMegacubeMob.prototype.geometry, tmpMesh);
tmpMesh.position.set(1.1, 1.1, -1.1);
THREE.GeometryUtils.merge(ciMegacubeMob.prototype.geometry, tmpMesh);
tmpMesh.position.set(1.1, 0, -1.1);
THREE.GeometryUtils.merge(ciMegacubeMob.prototype.geometry, tmpMesh);
tmpMesh.position.set(1.1, -1.1, -1.1);
THREE.GeometryUtils.merge(ciMegacubeMob.prototype.geometry, tmpMesh);
tmpMesh.position.set(0, 1.1, -1.1);
THREE.GeometryUtils.merge(ciMegacubeMob.prototype.geometry, tmpMesh);
tmpMesh.position.set(0, 0, -1.1);
THREE.GeometryUtils.merge(ciMegacubeMob.prototype.geometry, tmpMesh);
tmpMesh.position.set(0, -1.1, -1.1);
THREE.GeometryUtils.merge(ciMegacubeMob.prototype.geometry, tmpMesh);
tmpMesh.position.set(-1.1, 1.1, -1.1);
THREE.GeometryUtils.merge(ciMegacubeMob.prototype.geometry, tmpMesh);
tmpMesh.position.set(-1.1, 0, -1.1);
THREE.GeometryUtils.merge(ciMegacubeMob.prototype.geometry, tmpMesh);
tmpMesh.position.set(-1.1, -1.1, -1.1);
THREE.GeometryUtils.merge(ciMegacubeMob.prototype.geometry, tmpMesh);
tmpMesh = new THREE.Mesh(ciMegacubeMob.prototype.geometry);
tmpMesh.scale.multiplyScalar(0.444);
ciMegacubeMob.prototype.geometry = new THREE.Geometry();
THREE.GeometryUtils.merge(ciMegacubeMob.prototype.geometry, tmpMesh);
ciMegacubeMob.prototype.geometry.computeFaceNormals();

function ciHypercubeMob(game, spawnTile){
	/** @constructor*/
	this.type = ciMob.prototype.MOB_TYPES.HYPERCUBE;
	this.geometry = ciHypercubeMob.prototype.geometry;
	this.material = game.materialSets[game.level.materialSetIndex].materials.squareDouble;
	this.ParentConstructor(game, spawnTile);
}
ciHypercubeMob.prototype = Object.create(ciMob.prototype);
ciHypercubeMob.prototype.ParentConstructor = ciMob;
ciHypercubeMob.prototype.BabyConstructor = ciMegacubeMob;
ciHypercubeMob.prototype.geometry = new THREE.Geometry();
ciHypercubeMob.prototype.geometry.vertices.push(new THREE.Vector3(0.355, 0.355, 0.355));
ciHypercubeMob.prototype.geometry.vertices.push(new THREE.Vector3(-0.355, 0.355, 0.355));
ciHypercubeMob.prototype.geometry.vertices.push(new THREE.Vector3(-0.355, -0.355, 0.355));
ciHypercubeMob.prototype.geometry.vertices.push(new THREE.Vector3(0.355, -0.355, 0.355));
ciHypercubeMob.prototype.geometry.vertices.push(new THREE.Vector3(0.355, 0.355, -0.355));
ciHypercubeMob.prototype.geometry.vertices.push(new THREE.Vector3(-0.355, 0.355, -0.355));
ciHypercubeMob.prototype.geometry.vertices.push(new THREE.Vector3(-0.355, -0.355, -0.355));
ciHypercubeMob.prototype.geometry.vertices.push(new THREE.Vector3(0.355, -0.355, -0.355));
ciHypercubeMob.prototype.geometry.vertices.push(new THREE.Vector3(0.71, 0.71, 0.71));
ciHypercubeMob.prototype.geometry.vertices.push(new THREE.Vector3(-0.71, 0.71, 0.71));
ciHypercubeMob.prototype.geometry.vertices.push(new THREE.Vector3(-0.71, -0.71, 0.71));
ciHypercubeMob.prototype.geometry.vertices.push(new THREE.Vector3(0.71, -0.71, 0.71));
ciHypercubeMob.prototype.geometry.vertices.push(new THREE.Vector3(0.71, 0.71, -0.71));
ciHypercubeMob.prototype.geometry.vertices.push(new THREE.Vector3(-0.71, 0.71, -0.71));
ciHypercubeMob.prototype.geometry.vertices.push(new THREE.Vector3(-0.71, -0.71, -0.71));
ciHypercubeMob.prototype.geometry.vertices.push(new THREE.Vector3(0.71, -0.71, -0.71));
ciHypercubeMob.prototype.geometry.faces.push(new THREE.Face4(0, 1, 2, 3));
ciHypercubeMob.prototype.geometry.faces.push(new THREE.Face4(4, 7, 6, 5));
ciHypercubeMob.prototype.geometry.faces.push(new THREE.Face4(4, 0, 3, 7));
ciHypercubeMob.prototype.geometry.faces.push(new THREE.Face4(7, 3, 2, 6));
ciHypercubeMob.prototype.geometry.faces.push(new THREE.Face4(6, 2, 1, 5));
ciHypercubeMob.prototype.geometry.faces.push(new THREE.Face4(5, 1, 0, 4));
ciHypercubeMob.prototype.geometry.faces.push(new THREE.Face4(0, 1, 9, 8));
ciHypercubeMob.prototype.geometry.faces.push(new THREE.Face4(1, 2, 10, 9));
ciHypercubeMob.prototype.geometry.faces.push(new THREE.Face4(2, 3, 11, 10));
ciHypercubeMob.prototype.geometry.faces.push(new THREE.Face4(3, 0, 8, 11));
ciHypercubeMob.prototype.geometry.faces.push(new THREE.Face4(4, 5, 13, 12));
ciHypercubeMob.prototype.geometry.faces.push(new THREE.Face4(5, 6, 14, 13));
ciHypercubeMob.prototype.geometry.faces.push(new THREE.Face4(6, 7, 15, 14));
ciHypercubeMob.prototype.geometry.faces.push(new THREE.Face4(7, 4, 12, 15));
ciHypercubeMob.prototype.geometry.faces.push(new THREE.Face4(0, 4, 12, 8));
ciHypercubeMob.prototype.geometry.faces.push(new THREE.Face4(1, 5, 13, 9));
ciHypercubeMob.prototype.geometry.faces.push(new THREE.Face4(2, 6, 14, 10));
ciHypercubeMob.prototype.geometry.faces.push(new THREE.Face4(3, 7, 15, 11));
ciHypercubeMob.prototype.geometry.computeFaceNormals();




