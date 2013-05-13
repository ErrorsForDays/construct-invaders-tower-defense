function ciTower(game, tile){
	/** @constructor*/
	this.id = ciTower.prototype.idCounter++;
	this.game = game;
	
	this.position = new THREE.Vector3();
	if(tile !== undefined && tile != null) this.setTile(tile);
	this.radius = this.game.tileRadius;
	this.foundationHeight = 0;

	this.evolutions = [];
	this.upgrades = [	{name: "Range", value: 0.2, level: 0, maxLevel: 5, price: 10},
				{name: "Damage", value: 0.2, level: 0, maxLevel: 5, price: 10}];

	this.baseMesh = null;
	this.weaponMesh = null;
	this.rangeMesh = null;

	this.INFO = ciTower.prototype.TOWER_INFO[this.type];	
	this.TOWER_INFO = ciTower.prototype.TOWER_INFO;	
	this.title = this.INFO.title;
	this.totalPrice = 0;
	this.damageDone = 0;
	this.kills = 0;

	this.setDamage(this.INFO.baseDamage, 1);
	this.setRange(this.INFO.baseRangeInTileRadiuses * this.game.tileRadius || 0, 1);
	this.setRateOfFire(this.INFO.baseRateOfFire || 1, 1);

	this.flashFadeMultiplier = this.INFO.flashFadeMultiplier || 1;
	this.targetingMethod = ciTower.prototype.TARGETING_METHODS.FRONTRUNNER;
	this.target = null;
	this.onTarget = false;
	this.theta = Math.random()*2*Math.PI;
	this.timeSinceLastFire = 10000; 
	this.trackingSpeed = this.INFO.trackingSpeed;

	ciTower.prototype.towers.push(this);
}

ciTower.prototype.idCounter = 0;
ciTower.prototype.towers = [];
ciTower.prototype.defaultHeight = 50;
ciTower.prototype.rangeGeometry = new THREE.SphereGeometry(1, 10, 10);
ciTower.prototype.toSide = Math.round(Math.cos(Math.PI/6)*1000000)/1000000;
ciTower.prototype.baseGeometry = new THREE.CylinderGeometry(1, 1, 1, 6, 1, false);
ciTower.prototype.baseGeometry.computeFaceNormals();
for(var i in ciTower.prototype.baseGeometry.faces){ ciTower.prototype.baseGeometry.faces[i].materialIndex = 0;}

ciTower.prototype.TOWER_TYPES = {HOLO: 0, FOUNDATION: 1, GUN: 2, CANNON: 3, MORTAR: 4, DOUBLE_GUN: 5, GATLING: 6, LASER: 7, FREEZERAY: 8, UVLASER: 9, EMP: 10, SOLARPANEL: 11, WINDMILL: 12};
Object.freeze(ciTower.prototype.TOWER_TYPES);
ciTower.prototype.TARGETING_METHODS = {FRONTRUNNER: 0, TAIL: 1, STRONGEST: 2, WEAKEST: 3, FASTEST: 4};
Object.freeze(ciTower.prototype.TARGETING_METHODS);
ciTower.prototype.TARGETING_METHOD_NAMES = ["First", "Last", "Strongest", "Weakest", "Fastest"];
Object.freeze(ciTower.prototype.TARGETING_METHOD_NAMES);
ciTower.prototype.TOWER_INFO = {};
ciTower.prototype.TOWER_INFO[ciTower.prototype.TOWER_TYPES.HOLO] = {		price: 0,
										title: "Empty Space.",
										description: "So much room for activities!"};
ciTower.prototype.TOWER_INFO[ciTower.prototype.TOWER_TYPES.FOUNDATION] = {	price: 5,
										title: "Foundation",
										description: "Blocks enemies.<br>Nice and level."};
ciTower.prototype.TOWER_INFO[ciTower.prototype.TOWER_TYPES.GUN] = {		price: 25,
										title: "Gun",
										description: "Pew pew!",
										baseDamage: 1,
										baseRangeInTileRadiuses: 3,
										baseRateOfFire: 1,
										flashFadeMultiplier: 2,
										trackingSpeed: Math.PI/2};
ciTower.prototype.TOWER_INFO[ciTower.prototype.TOWER_TYPES.DOUBLE_GUN] = {	price: 60,
										title: "Double Gun",
										description: "Pew pew pew pew!",
										baseDamage: 1.25,
										baseRangeInTileRadiuses: 3,
										baseRateOfFire: 0.5,
										flashFadeMultiplier: 2,
										trackingSpeed: 1.5*Math.PI};
ciTower.prototype.TOWER_INFO[ciTower.prototype.TOWER_TYPES.GATLING] = {	price: 500,
										title: "Gatling",
										description: "Pa-pa-pa-pa-pa-pa-pa-pa-pa-pa-pa-pa-pew!",
										baseDamage: 1.5,
										baseRangeInTileRadiuses: 3,
										baseRateOfFire: 0.125,
										flashFadeMultiplier: 3,
										trackingSpeed: Math.PI};
ciTower.prototype.TOWER_INFO[ciTower.prototype.TOWER_TYPES.CANNON] = {	price: 90,
										title: "Cannon",
										description: "Slow tracking, hard hitting.",
										baseDamage: 5,
										baseRangeInTileRadiuses: 3,
										baseRateOfFire: 1.4,
										flashFadeMultiplier: 0.5,
										trackingSpeed: Math.PI/2};
ciTower.prototype.TOWER_INFO[ciTower.prototype.TOWER_TYPES.MORTAR] = {	price: 1000,
										title: "Artillery",
										description: "Slow tracking, slow firing.<br>Damages and knocks back enemies near target.",
										baseDamage: 10,
										baseRangeInTileRadiuses: 5,
										baseRateOfFire: 4,
										flashFadeMultiplier: 0.2,
										trackingSpeed: Math.PI/2};
ciTower.prototype.TOWER_INFO[ciTower.prototype.TOWER_TYPES.LASER] = {		price: 50,
										title: "Laser",
										description: "Zap!<br>Lasers are not affected by shields.",
										baseDamage: 0.2,
										shieldPenetrating: true,
										baseRangeInTileRadiuses: 4,
										baseRateOfFire: 0.2,
										flashFadeMultiplier: 2,
										trackingSpeed: Math.PI};
ciTower.prototype.TOWER_INFO[ciTower.prototype.TOWER_TYPES.FREEZERAY] = {	price: 50,
										title: "Electron beam",
										description: "Slows target movement.",
										baseDamage: 0,
										shieldPenetrating: true,
										baseRangeInTileRadiuses: 2.5,
										baseRateOfFire: 0.1,
										flashFadeMultiplier: 2,
										trackingSpeed: Math.PI};
ciTower.prototype.TOWER_INFO[ciTower.prototype.TOWER_TYPES.UVLASER] = {	price: 250,
										title: "UV Laser",
										description: "Purple nurple.",
										baseDamage: 2,
										shieldPenetrating: true,
										baseRangeInTileRadiuses: 4,
										baseRateOfFire: 0.2,
										flashFadeMultiplier: 2,
										trackingSpeed: Math.PI};
ciTower.prototype.TOWER_INFO[ciTower.prototype.TOWER_TYPES.EMP] = {		price: 400,
										title: "EMP Cannon",
										description: "Does damage over time.",
										baseDamage: 8,
										baseRangeInTileRadiuses: 3,
										baseRateOfFire: 2,
										flashFadeMultiplier: 0.5,
										trackingSpeed: Math.PI};
ciTower.prototype.TOWER_INFO[ciTower.prototype.TOWER_TYPES.SOLARPANEL] = {	price: 75,
										title: "Solar panel",
										description: "Sunny days.",
										baseDamage: 5,
										baseRateOfFire: 10,
										trackingSpeed: Math.PI/12};
ciTower.prototype.TOWER_INFO[ciTower.prototype.TOWER_TYPES.WINDMILL] = {	price: 75,
										title: "Windmill",
										description: "Pray for wind.",
										baseDamage: 1,
										baseRateOfFire: 3,
										trackingSpeed: Math.PI/24};
Object.freeze(ciTower.prototype.TOWER_INFO);

ciTower.prototype.getTowerByMesh = function(mesh){
	for(var i in ciTower.prototype.towers){
		if(mesh === ciTower.prototype.towers[i].baseMesh || mesh === ciTower.prototype.towers[i].weaponMesh){
			return ciTower.prototype.towers[i];
		}
	}
	return null;
}

ciTower.prototype.destroy = function(){
	this.game.threeObjects.scene.remove(this.baseMesh);
	this.game.level.collidableMeshes.splice(this.game.level.collidableMeshes.indexOf(this.baseMesh), 1);
	this.game.threeObjects.scene.remove(this.weaponMesh);
	this.game.threeObjects.scene.remove(this.rangeMesh);
	ciTower.prototype.towers.splice(ciTower.prototype.towers.indexOf(this), 1);
}

ciTower.prototype.setDamage = function(baseDamage, damageMultiplier){
	if(baseDamage !== undefined) this.baseDamage = baseDamage;
	if(damageMultiplier !== undefined) this.damageMultiplier = damageMultiplier;
	this.damageMultiplier = Math.round(this.damageMultiplier * 10)/10;
	this.damage = Math.round(baseDamage * damageMultiplier * 100)/100;
}

ciTower.prototype.setRange = function(baseRange, rangeMultiplier){
	if(baseRange !== undefined) this.baseRange = baseRange;
	if(rangeMultiplier !== undefined) this.rangeMultiplier = rangeMultiplier;
	this.rangeMultiplier = Math.round(this.rangeMultiplier * 10)/10;
	this.range = Math.round(this.baseRange * this.rangeMultiplier);
	if(this.range > 0){
		if(this.rangeMesh == null) this.rangeMesh = this.getRangeMesh();
		this.rangeMesh.scale.set(1, 1, 1);
		this.rangeMesh.scale.multiplyScalar(this.range);
	}
}

ciTower.prototype.setRateOfFire = function(baseRateOfFire, rateOfFireMultiplier){
	if(baseRateOfFire !== undefined) this.baseRateOfFire = baseRateOfFire;
	if(rateOfFireMultiplier !== undefined) this.rateOfFireMultiplier = rateOfFireMultiplier;
	this.rateOfFire = Math.round(100*this.baseRateOfFire/this.rateOfFireMultiplier)/100;
}

ciTower.prototype.getRangeMesh = function(){
	//var rangeMesh = new THREE.SceneUtils.createMultiMaterialObject(ciTower.prototype.rangeGeometry,
	//								[this.game.materialSets[this.game.level.materialSetIndex].materials.range1,
	//this.game.materialSets[this.game.level.materialSetIndex].materials.range2]);
	var rangeMesh = new THREE.Mesh(ciTower.prototype.rangeGeometry, this.game.materialSets[this.game.level.materialSetIndex].materials.range2);
	
	rangeMesh.position.copy(this.position);
	rangeMesh.rotation.x = Math.PI/2;
	rangeMesh.visible = false;
	this.game.threeObjects.scene.add(rangeMesh);
	return rangeMesh;
}

ciTower.prototype.findTarget = function(){
	var tmpTarget = null;
	var mobs = ciMob.prototype.mobs;
	for(var i in mobs){
		if(this.position.distanceTo(mobs[i].mesh.position) < this.range){
			if(tmpTarget == null){
				tmpTarget = mobs[i];
			}else{
				switch(this.targetingMethod){
					case ciTower.prototype.TARGETING_METHODS.FRONTRUNNER:
						if(mobs[i].distanceRemaining < tmpTarget.distanceRemaining){
							tmpTarget = mobs[i];
						}
						break;
					case ciTower.prototype.TARGETING_METHODS.TAIL:
						if(mobs[i].distanceRemaining > tmpTarget.distanceRemaining){
							tmpTarget = mobs[i];
						}
						break;
					case ciTower.prototype.TARGETING_METHODS.STRONGEST:
						if(mobs[i].maxHp > tmpTarget.maxHp){
							tmpTarget = mobs[i];
						}
						break;
					case ciTower.prototype.TARGETING_METHODS.WEAKEST:
						if(mobs[i].hp < tmpTarget.hp){
							tmpTarget = mobs[i];
						}
						break;
					case ciTower.prototype.TARGETING_METHODS.FASTEST:
						if(mobs[i].speed > tmpTarget.speed){
							tmpTarget = mobs[i];
						}
						break;
					case null: 
						alert("trying to find a target without a targeting method.");
				}
			}
		}
	}
	this.target = tmpTarget;
	this.onTarget = false;
}

ciTower.prototype.track = function(time, timeDelta){
	if(this.target != null){
		var targetPosition = this.target.mesh.position;
		var angleOfTarget = Math.PI - Math.atan2(targetPosition.x - this.position.x, targetPosition.y - this.position.y);
		var angleToMove = angleOfTarget - this.theta;
		if(angleToMove > Math.PI){
			angleToMove -= 2*Math.PI;
		}else if(angleToMove < -1 * Math.PI){
			angleToMove += 2*Math.PI;
		}
		if(angleToMove > this.trackingSpeed*timeDelta/1000){
			angleToMove = this.trackingSpeed*timeDelta/1000;
			this.onTarget = false;
		}else if(angleToMove < -1 * this.trackingSpeed*timeDelta/1000){
			angleToMove = -1 * this.trackingSpeed*timeDelta/1000;
			this.onTarget = false;
		}else{
			this.onTarget = true;
		}
		if(angleToMove < 0) angleToMove += 2*Math.PI;
		this.theta += angleToMove;
		var horizontalDistance = Math.sqrt(Math.pow(targetPosition.x - this.position.x, 2) + Math.pow(targetPosition.y - this.position.y, 2));
		if(this.type == ciTower.prototype.TOWER_TYPES.MORTAR){
			var v = Math.sqrt(this.range * this.game.gravity);
			var x = horizontalDistance;
			var y = targetPosition.z - this.position.z;
			var g = this.game.gravity;
			var root = Math.sqrt(Math.pow(v, 4) - g * (g * Math.pow(x, 2) + 2 * y * Math.pow(v, 2)));
			if(!isNaN(root)){
				var angle = Math.atan((Math.pow(v, 2) + root)/(g*x));
				this.weaponMesh.rotation.x = -1 * angle;
				this.firingSolution.set(targetPosition.x - this.position.x, targetPosition.y - this.position.y, 0);
				this.firingSolution.normalize();
				this.firingSolution.z = Math.tan(angle);
				this.firingSolution.setLength(v);
				this.onTarget = true;
			}else{
				this.onTarget = false;
			}
		}else{
			this.weaponMesh.rotation.x = -1 * Math.atan((targetPosition.z - this.position.z)/horizontalDistance);
		}
	}else{
		this.theta += ((this.trackingSpeed/2)*timeDelta/1000);
		if(this.weaponMesh.rotation.x > 0.01){
			this.weaponMesh.rotation.x -= 0.01;
		}else if(this.weaponMesh.rotation.x < -0.01){
			this.weaponMesh.rotation.x += 0.01;
		}else{
			this.weaponMesh.rotation.x = 0;
		}
	}
	if(this.theta > 2*Math.PI) this.theta -= 2*Math.PI;
	this.weaponMesh.rotation.z = this.theta;

	if(this.flash.opacity > 0){
		this.flash.opacity -= this.flashFadeMultiplier*timeDelta/1000;
	}
}

ciTower.prototype.fire = function(time, timeDelta){
	this.damageDone += this.damage;
	if(this.target.ouchAmIDead(this.damage, this.INFO.shieldPenetrating)){
		this.target = null;
		this.onTarget = false;
		this.kills++;
		if(this.game.selectedItem === this) $('#killCountSpan').empty().append(this.kills);
	}
	this.flash.opacity = 0.8;
	this.timeSinceLastFire = 0;
}

ciTower.prototype.getBaseMaterial = function(){
	return new THREE.MeshFaceMaterial([this.game.materialSets[this.game.level.materialSetIndex].materials.foundation, this.game.materialSets[this.game.level.materialSetIndex].materials.mount]);
}

ciTower.prototype.getBaseMesh = function(){
	var mesh =  new THREE.Mesh(ciTower.prototype.baseGeometry, this.getBaseMaterial());
	mesh.scale.multiplyScalar(this.game.tileRadius);
	mesh.rotation.x = Math.PI/2;
	mesh.rotation.y = Math.PI/6;
	return mesh;
}

ciTower.prototype.showTower = function(){
	this.showBase();
	this.showWeapon();
}

ciTower.prototype.showBase = function(){
	var bottomHeight = this.tile.getLowestCornerHeight();
	var topHeight = 25 + Math.max(this.tile.height, this.tile.getHighestCornerHeight());
	this.foundationHeight = topHeight;
	
	if(this.baseMesh == null){
		this.baseMesh = this.getBaseMesh();
		if(this.type != ciTower.prototype.TOWER_TYPES.HOLO && this.type != ciTower.prototype.TOWER_TYPES.FOUNDATION){
			var mountGeometry = new THREE.Geometry();
			var tmpGeometry = null;
			var tmpMesh = null;
			
			tmpGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.05, 6, 1, false);
			for(var i in tmpGeometry.faces){ tmpGeometry.faces[i].materialIndex = 0;}
			tmpMesh = new THREE.Mesh(tmpGeometry);
			tmpMesh.position.x = 0.6;
			tmpGeometry = new THREE.Geometry();
			THREE.GeometryUtils.merge(tmpGeometry, tmpMesh);
			tmpMesh = new THREE.Mesh(tmpGeometry);
			tmpMesh.position.y = -0.375;
			tmpMesh.rotation.y += Math.PI/6
			for(var i = 0; i < 6; i ++){
				tmpMesh.rotation.y += Math.PI/3;
				THREE.GeometryUtils.merge(mountGeometry, tmpMesh);
			}

			tmpGeometry = new THREE.CylinderGeometry(0.75, 0.75, 0.1, 6, 1, false);
			for(var i in tmpGeometry.faces){ tmpGeometry.faces[i].materialIndex = 1;}
			tmpMesh = new THREE.Mesh(tmpGeometry);
			tmpMesh.position.y = -0.45;
			THREE.GeometryUtils.merge(mountGeometry, tmpMesh);

			tmpGeometry = new THREE.CylinderGeometry(0.25, 0.4, 0.3, 8, 1, false);
			for(var i in tmpGeometry.faces){ tmpGeometry.faces[i].materialIndex = 1;}
			tmpMesh = new THREE.Mesh(tmpGeometry);
			tmpMesh.position.y = -0.25;
			THREE.GeometryUtils.merge(mountGeometry, tmpMesh);

			tmpGeometry = new THREE.CylinderGeometry(0.08, 0.15, 0.6, 6, 1, false);
			for(var i in tmpGeometry.faces){ tmpGeometry.faces[i].materialIndex = 1;}
			tmpMesh = new THREE.Mesh(tmpGeometry);
			tmpMesh.position.y = 0.2;
			THREE.GeometryUtils.merge(mountGeometry, tmpMesh);

			mountMesh = new THREE.Mesh(mountGeometry);
			mountMesh.scale.multiplyScalar(this.game.tileRadius);
			mountMesh.rotation.y += Math.PI/6;
			mountMesh.rotation.x += Math.PI/2;
			mountMesh.position.z += this.game.tileRadius/2 + (topHeight - bottomHeight)/2;
			mountGeometry = new THREE.Geometry();
			THREE.GeometryUtils.merge(mountGeometry, mountMesh);
			this.baseMesh.scale.y = topHeight - bottomHeight;
			THREE.GeometryUtils.merge(mountGeometry, this.baseMesh);
			this.baseMesh = new THREE.Mesh(mountGeometry, this.getBaseMaterial());
			this.baseMesh.position.copy(this.tile.position);
			this.baseMesh.position.z = bottomHeight + (topHeight - bottomHeight)/2;
		}
		this.game.threeObjects.scene.add(this.baseMesh);
		if(this.type != ciTower.prototype.TOWER_TYPES.HOLO){
			this.game.level.collidableMeshes.push(this.baseMesh);
		}
	}
	if(this.type == ciTower.prototype.TOWER_TYPES.HOLO || this.type == ciTower.prototype.TOWER_TYPES.FOUNDATION){
		this.baseMesh.position.copy(this.tile.position);
		this.baseMesh.scale.y = topHeight - bottomHeight + 2;
		this.baseMesh.position.z = bottomHeight + (topHeight - bottomHeight)/2 - 1;
	}
}

ciTower.prototype.showWeapon = function(){
	if(this.weaponMesh == null){
		this.weaponMesh = this.getWeaponMesh();
	}
	if(this.weaponMesh == null){
		return;
	}else{
		this.weaponMesh.eulerOrder = "ZXY";
		this.game.threeObjects.scene.add(this.weaponMesh);
		if(this.weaponMesh.children[0] !== undefined) this.flash = this.weaponMesh.children[0].material;
	}
	this.weaponMesh.position.copy(this.tile.position);
	this.weaponMesh.position.z = this.foundationHeight + this.game.tileRadius;
	this.position.copy(this.weaponMesh.position);
}

ciTower.prototype.setTile = function(tile){
	if(this.tile !== tile){
		this.tile = tile;
		this.position.copy(tile.position);
	}
}

ciTower.prototype.getInfo = function(){
	var html = "<b>" + this.INFO.title + "</b>";
	html += "<button class='closeButton' onclick='" + this.game.JSName + ".unselectSelectedItem();'><img src='images/close.svg' height='16' class='energyImg'></button><br>";
	html += "<span id='towerPurchaseButtons'>";
	html += this.getTowerPurchaseButtons();
	html += "</span>";
	if(!this.game.showSelectedItemDetail){
		html += "<button class='button' onclick='" + this.game.JSName + ".showSelectedItemDetail = true; " + this.game.JSName + ".showSelectedItemInfo();'>Show Details</button>";
	}
	return html;
}

ciTower.prototype.getTowerPurchaseButtons = function(){
	var html = "";
	for(var i in this.upgrades){
		if(this.upgrades[i].level >= this.upgrades[i].maxLevel){
			html += "<button class='button disabledButton'>" + this.upgrades[i].name + ": max </button><br>";
		}else if(this.game.cash < this.upgrades[i].price){
			html += "<button class='button disabledButton'>";
			html += "<span class='keyboard'>" + (parseInt(i) + 1) + "</span>+" + Math.round(this.upgrades[i].value * (this.upgrades[i].level + 1) * 100) + "% " + this.upgrades[i].name + ": " + this.upgrades[i].price + this.game.energyImage + "</button><br>";
		}else{
			html += "<button class='button' onclick='" + this.game.JSName + ".buyUpgrade(" + i + ");'>";
			html += "<span class='keyboard'>" + (parseInt(i) + 1) + "</span>+" + Math.round(this.upgrades[i].value * (this.upgrades[i].level + 1) * 100) + "% " + this.upgrades[i].name + ": " + this.upgrades[i].price + this.game.energyImage + "</button><br>";
		}
	}
	for(var i in this.evolutions){
		if(this.game.level.allowedTowers != null && $.inArray(this.evolutions[i], this.game.level.allowedTowers) == -1 && this.evolutions[i] != ciTower.prototype.TOWER_TYPES.FOUNDATION) continue;
		if(this.game.cash < this.TOWER_INFO[this.evolutions[i]].price){
			html += "<button class='button disabledButton'>";
		}else{
			html += "<button id='evolutionButton_" + i + "' class='button' onclick='" + this.game.JSName + ".buyEvolution(" + i + ");'>";
		}
		html += "<span class='keyboard'>" + (parseInt(i) + 1 + this.upgrades.length) + "</span>";
		html += this.TOWER_INFO[this.evolutions[i]].title + ": " + this.TOWER_INFO[this.evolutions[i]].price + this.game.energyImage + "</button><br>";
	}
	if(this.totalPrice > 0){
		html += "<button class='button' onclick='" + this.game.JSName + ".sellTower();'>Sell: " + Math.max(0, this.totalPrice/2 - 10) + this.game.energyImage + "</button><br>";
	}
	return html;
}

ciTower.prototype.getInfoDetail = function(){
	var html = this.INFO.description + "<br>";
	html += "Range: " + this.range + "(" + this.baseRange + " + " + (this.rangeMultiplier*100 - 100) + "%)<br>";
	html += "Damage: " + Math.round(this.damage*100)/100 + "(" + this.baseDamage + " + " + (this.damageMultiplier*100 - 100) + "%)<br>";
	html += "Rate of Fire: " + Math.round(100/this.rateOfFire)/100 + " RPS<br>";
	html += "DPS: " + Math.round(100*this.damage/this.rateOfFire)/100 + "<br>";
	html += this.game.energyImage + " spent: " + this.totalPrice + "<br>";
	html += "DPS/100" + this.game.energyImage + ": " + Math.round(100*((this.damage/this.rateOfFire)*100)/this.totalPrice)/100 + "<br>";
	html += "Kills: <span id='killCountSpan'>" + this.kills + "</span><br>";
	html += "Targeting:<br><button id='targetingMethodButton' class='button' onclick='" + this.game.JSName + ".toggleSelectedTowerTargetingMethod();'>";
	html += "<span class='keyboard'>Tab</span>" + ciTower.prototype.TARGETING_METHOD_NAMES[this.targetingMethod];
	html += "</button><br>";
	html += "<button class='closeButton' onclick='" + this.game.JSName + ".showSelectedItemDetail = false; " + this.game.JSName + ".showSelectedItemInfo();'><img src='images/close.svg' height='16' class='energyImg'></button><br>";
	return html;
}

ciTower.prototype.toggleTargetingMethod = function(method){
	if(method === undefined){
		this.targetingMethod = (this.targetingMethod + 1)%ciTower.prototype.TARGETING_METHOD_NAMES.length;
	}else{
		this.targetingMethod = method;
	}
	$('#targetingMethodButton').empty().append("<span class='keyboard'>Tab</span>" + ciTower.prototype.TARGETING_METHOD_NAMES[this.targetingMethod]);
	this.target = null;
	this.onTarget = false;
}

ciTower.prototype.upgrade = function(upgradeIndex){
	if(upgradeIndex === undefined || upgradeIndex < 0 || upgradeIndex >= this.upgrades.length) return 0;
	if(this.upgrades[upgradeIndex].level >= this.upgrades[upgradeIndex].maxLevel) return 0;
	var price = this.upgrades[upgradeIndex].price;
	this.upgrades[upgradeIndex].level++;
	this.upgrades[upgradeIndex].price = this.upgrades[upgradeIndex].price * 2;
	switch(this.upgrades[upgradeIndex].name){
		case "Range":	this.setRange(this.baseRange, this.rangeMultiplier + this.upgrades[upgradeIndex].value);
				break;
		case "Damage":	this.setDamage(this.baseDamage, this.damageMultiplier + this.upgrades[upgradeIndex].value);
				break;
		case "RoF":	this.setRateOfFire(this.baseRateOfFire, this.rateOfFireMultiplier + this.upgrades[upgradeIndex].value);
				break;
	}
	this.game.playSound("upgrade");
	this.totalPrice += price;
	return price;
}

ciTower.prototype.evolve = function(evolutionIndex){
	if(evolutionIndex === undefined || evolutionIndex < 0 || evolutionIndex >= this.evolutions.length) return 0;
	switch(this.evolutions[evolutionIndex]){
		case ciTower.prototype.TOWER_TYPES.FOUNDATION:
			var newTower = new ciFoundationTower(this.game, this.tile);
			for(var i in ciMob.prototype.mobs){
				if(ciMob.prototype.mobs[i].currentTile === this.tile){
					this.game.playSound("denied");
					newTower.destroy();
					return 0;
				}
			}
			if(!this.game.level.calculatePathsToHomeBase()){
				newTower.destroy();
				return 0;
			}
			break;
		case ciTower.prototype.TOWER_TYPES.GUN:
			var newTower = new ciGunTower(this.game, this.tile);
			break;
		case ciTower.prototype.TOWER_TYPES.DOUBLE_GUN:
			var newTower = new ciDoublegunTower(this.game, this.tile);
			break;
		case ciTower.prototype.TOWER_TYPES.GATLING:
			var newTower = new ciGatlingTower(this.game, this.tile);
			break;
		case ciTower.prototype.TOWER_TYPES.CANNON:
			var newTower = new ciCannonTower(this.game, this.tile);
			break;
		case ciTower.prototype.TOWER_TYPES.MORTAR:
			var newTower = new ciMortarTower(this.game, this.tile);
			break;
		case ciTower.prototype.TOWER_TYPES.LASER:
			var newTower = new ciLaserTower(this.game, this.tile);
			break;
		case ciTower.prototype.TOWER_TYPES.FREEZERAY:
			var newTower = new ciFreezerayTower(this.game, this.tile);
			break;
		case ciTower.prototype.TOWER_TYPES.UVLASER:
			var newTower = new ciUvlaserTower(this.game, this.tile);
			break;
		case ciTower.prototype.TOWER_TYPES.EMP:
			var newTower = new ciEmpTower(this.game, this.tile);
			break;
		case ciTower.prototype.TOWER_TYPES.SOLARPANEL:
			var newTower = new ciSolarpanelTower(this.game, this.tile);
			break;
		case ciTower.prototype.TOWER_TYPES.WINDMILL:
			var newTower = new ciWindmillTower(this.game, this.tile);
			break;
	}
	this.destroy();
	newTower.kills = this.kills;
	this.game.selectItem(newTower);
	for(var i in this.upgrades){
		for(var j = 0; j < this.upgrades[i].level; j++){
			newTower.upgrade(i);
		}
	}
	newTower.totalPrice = 0;
	newTower.totalPrice += this.totalPrice;
	newTower.totalPrice += this.TOWER_INFO[this.evolutions[evolutionIndex]].price;
	if(this.targetingMethod != null) newTower.targetingMethod = this.targetingMethod;
	return this.TOWER_INFO[this.evolutions[evolutionIndex]].price;
}

ciTower.prototype.noLongerSelected = function(){
	//tbd
}

function ciHoloTower(game, tile){
	/** @constructor*/
	this.type = ciTower.prototype.TOWER_TYPES.HOLO;
	this.ParentConstructor(game, tile);
	ciTower.prototype.towers.splice(ciTower.prototype.towers.indexOf(this), 1);
	this.targetingMethod = null;
	this.upgrades.length = 0;
	this.evolutions.push(ciTower.prototype.TOWER_TYPES.FOUNDATION);
}
ciHoloTower.prototype = Object.create(ciTower.prototype);
ciHoloTower.prototype.ParentConstructor = ciTower;

ciHoloTower.prototype.destroy = function(){
	this.noLongerSelected();
}

ciHoloTower.prototype.getBaseMesh = function(){
	var mesh = new THREE.SceneUtils.createMultiMaterialObject(new THREE.CylinderGeometry(1, 1, 1, 6, 1, false),
							[this.game.materialSets[this.game.level.materialSetIndex].materials.holo1,
							this.game.materialSets[this.game.level.materialSetIndex].materials.holo2]);
	mesh.scale.multiplyScalar(this.game.tileRadius);
	mesh.rotation.x = Math.PI/2;
	mesh.rotation.y = Math.PI/6;
	return mesh;
}

ciHoloTower.prototype.noLongerSelected = function(){
	this.baseMesh.position.z = this.game.maxCameraDistance + 500;
}

ciHoloTower.prototype.getInfoDetail = function(){
	html =  "There's so much room for activities.<br>";
	html += "<button class='closeButton' onclick='" + this.game.JSName + ".showSelectedItemDetail = false; " + this.game.JSName + ".showSelectedItemInfo();'><img src='images/close.svg' class='energyImg' height='16'></button>";
	return html;
}

function ciFoundationTower(game, tile){
	/** @constructor*/
	this.type = ciTower.prototype.TOWER_TYPES.FOUNDATION;
	this.ParentConstructor(game, tile);
	this.targetingMethod = null;
	this.upgrades.length = 0;
	this.showTower();
	this.evolutions.push(ciTower.prototype.TOWER_TYPES.GUN);
	this.evolutions.push(ciTower.prototype.TOWER_TYPES.LASER);
	this.evolutions.push(ciTower.prototype.TOWER_TYPES.WINDMILL);
}
ciFoundationTower.prototype = Object.create(ciTower.prototype);
ciFoundationTower.prototype.ParentConstructor = ciTower;

ciFoundationTower.prototype.getWeaponMesh = function(){ return null;}

ciFoundationTower.prototype.getInfoDetail = function(){
	var html = "Blocks enemies.<br>Nice and level.<br>";
	html += this.game.energyImage + " spent: " + this.totalPrice + "<br>";
	html += "<button class='closeButton' onclick='" + this.game.JSName + ".showSelectedItemDetail = false; " + this.game.JSName + ".showSelectedItemInfo();'><img src='images/close.svg' height='16' class='energyImg'></button>";
	return html;
}

function ciGunTower(game, tile){
	/** @constructor*/
	this.type = ciTower.prototype.TOWER_TYPES.GUN;
	this.ParentConstructor(game, tile);

	this.showTower();
	this.evolutions.push(ciTower.prototype.TOWER_TYPES.DOUBLE_GUN);
	this.evolutions.push(ciTower.prototype.TOWER_TYPES.CANNON);
}
ciGunTower.prototype = Object.create(ciTower.prototype);
ciGunTower.prototype.ParentConstructor = ciTower;
ciGunTower.prototype.ParentFire = ciTower.prototype.fire;
ciGunTower.prototype.flashGeometry = new THREE.SphereGeometry(1, 6, 3);
var tmpGeometry = new THREE.CylinderGeometry(0.125, 0.125, 0.2, 8, 1, false);
for(var i in tmpGeometry.faces){ tmpGeometry.faces[i].materialIndex = 1;}
var tmpMesh = new THREE.Mesh(tmpGeometry);
ciGunTower.prototype.geometry = new THREE.CylinderGeometry(0.125, 0.1, 1, 8, 1, true);
for(var i in ciGunTower.prototype.geometry.faces){ ciGunTower.prototype.geometry.faces[i].materialIndex = 0;}
tmpMesh.position.y = -0.5;
THREE.GeometryUtils.merge(ciGunTower.prototype.geometry, tmpMesh);
tmpMesh.position.y = 0.4;
tmpMesh.scale.multiplyScalar(1.2);
tmpMesh.scale.y = 2;
THREE.GeometryUtils.merge(ciGunTower.prototype.geometry, tmpMesh);

ciGunTower.prototype.getWeaponMesh = function(){
	var flashMesh = new THREE.Mesh(ciGunTower.prototype.flashGeometry, this.game.materialSets[this.game.level.materialSetIndex].materials.flash.clone());
	flashMesh.position.y -= this.game.tileRadius/2 + this.game.tileRadius/5;
	flashMesh.scale.multiplyScalar(this.game.tileRadius/10);
	flashMesh.scale.y *= 4;

	var gunMesh = new THREE.Mesh(ciGunTower.prototype.geometry, new THREE.MeshFaceMaterial([this.game.materialSets[this.game.level.materialSetIndex].materials.gun, this.game.materialSets[this.game.level.materialSetIndex].materials.gunHighlight1]));
	gunMesh.scale.multiplyScalar(this.game.tileRadius);

	var weaponObject = new THREE.Object3D();
	weaponObject.add(flashMesh);
	weaponObject.add(gunMesh);

	return weaponObject;
}

ciGunTower.prototype.fire = function(time, timeDelta){
	this.ParentFire(time, timeDelta);
	this.game.playSound("gun");
}

function ciDoublegunTower(game, tile){
	/** @constructor*/
	this.type = ciTower.prototype.TOWER_TYPES.DOUBLE_GUN;
	this.ParentConstructor(game, tile);
	this.showTower();
	this.evolutions.push(ciTower.prototype.TOWER_TYPES.GATLING);
}
ciDoublegunTower.prototype = Object.create(ciTower.prototype);
ciDoublegunTower.prototype.ParentConstructor = ciTower;
ciDoublegunTower.prototype.ParentFire = ciTower.prototype.fire;

ciDoublegunTower.prototype.getWeaponMesh = function(){
	var flashMesh = new THREE.Mesh(ciGunTower.prototype.flashGeometry);
	flashMesh.scale.multiplyScalar(this.game.tileRadius/10);
	flashMesh.position.x -= this.game.tileRadius/3;
	flashGeometry = new THREE.Geometry();
	THREE.GeometryUtils.merge(flashGeometry, flashMesh);
	var flashMesh = new THREE.Mesh(flashGeometry, this.game.materialSets[this.game.level.materialSetIndex].materials.flash.clone());
	flashMesh.position.y -= this.game.tileRadius/2 + this.game.tileRadius/5;
	flashMesh.scale.y *= 4;

	var gunMesh = new THREE.Mesh(ciGunTower.prototype.geometry);
	gunMesh.scale.multiplyScalar(this.game.tileRadius);
	var doublegunGeometry = new THREE.Geometry();
	gunMesh.position.x -= this.game.tileRadius/3;
	THREE.GeometryUtils.merge(doublegunGeometry, gunMesh);
	gunMesh.position.x += this.game.tileRadius*2/3;
	THREE.GeometryUtils.merge(doublegunGeometry, gunMesh);
	gunMesh.position.x -= this.game.tileRadius/3;
	gunMesh.scale.y *= 0.2;
	gunMesh.scale.x *= 2;
	THREE.GeometryUtils.merge(doublegunGeometry, gunMesh);
	gunMesh = new THREE.Mesh(doublegunGeometry, new THREE.MeshFaceMaterial([this.game.materialSets[this.game.level.materialSetIndex].materials.gun, this.game.materialSets[this.game.level.materialSetIndex].materials.gunHighlight1]));

	var weaponObject = new THREE.Object3D();
	weaponObject.add(flashMesh);
	weaponObject.add(gunMesh);

	return weaponObject;
}

ciDoublegunTower.prototype.fire = function(time, timeDelta){
	this.weaponMesh.children[0].rotation.y += Math.PI;
	this.ParentFire(time, timeDelta);
	this.game.playSound("gun");
}

function ciGatlingTower(game, tile){
	/** @constructor*/
	this.type = ciTower.prototype.TOWER_TYPES.GATLING;
	this.ParentConstructor(game, tile);
	this.showTower();
}
ciGatlingTower.prototype = Object.create(ciTower.prototype);
ciGatlingTower.prototype.ParentConstructor = ciTower;
ciGatlingTower.prototype.ParentFire = ciTower.prototype.fire;

ciGatlingTower.prototype.getWeaponMesh = function(){
	var flashMesh = new THREE.Mesh(ciGunTower.prototype.flashGeometry);
	flashMesh.scale.multiplyScalar(this.game.tileRadius/10);
	flashMesh.position.x -= this.game.tileRadius/3;
	flashGeometry = new THREE.Geometry();
	THREE.GeometryUtils.merge(flashGeometry, flashMesh);
	flashMesh = new THREE.Mesh(flashGeometry, this.game.materialSets[this.game.level.materialSetIndex].materials.flash.clone());
	flashMesh.position.y -= this.game.tileRadius/2 + this.game.tileRadius/5;
	flashMesh.scale.y *= 4;

	var gunMesh = new THREE.Mesh(ciGunTower.prototype.geometry);
	gunMesh.scale.multiplyScalar(this.game.tileRadius);
	gunMesh.position.x -= this.game.tileRadius/3;
	var gunGeometry = new THREE.Geometry();
	THREE.GeometryUtils.merge(gunGeometry, gunMesh);
	gunMesh = new THREE.Mesh(gunGeometry);
	var gatlingGeometry = new THREE.Geometry();
	for(var i = 0; i < 8; i ++){
		THREE.GeometryUtils.merge(gatlingGeometry, gunMesh);
		gunMesh.rotation.y += Math.PI/4;
	}
	var gunGeometry = new THREE.CylinderGeometry(this.game.tileRadius/4, this.game.tileRadius/8, this.game.tileRadius/4, 8, 1, false);
	for(var i in gunGeometry.faces){ gunGeometry.faces[i].materialIndex = 1;}
	gunMesh = new THREE.Mesh(gunGeometry);
	THREE.GeometryUtils.merge(gatlingGeometry, gunMesh);
	gunMesh = new THREE.Mesh(gatlingGeometry, new THREE.MeshFaceMaterial([this.game.materialSets[this.game.level.materialSetIndex].materials.gun, this.game.materialSets[this.game.level.materialSetIndex].materials.gunHighlight1]));

	var weaponObject = new THREE.Object3D();
	weaponObject.add(flashMesh);
	weaponObject.add(gunMesh);

	return weaponObject;
}

ciGatlingTower.prototype.fire = function(time, timeDelta){
	this.weaponMesh.children[0].rotation.y += Math.PI/4;
	this.ParentFire(time, timeDelta);
	this.game.playSound("gun");
}

function ciCannonTower(game, tile){
	/** @constructor*/
	this.type = ciTower.prototype.TOWER_TYPES.CANNON;
	this.ParentConstructor(game, tile);
	this.showTower();
	this.evolutions.push(ciTower.prototype.TOWER_TYPES.MORTAR);
}
ciCannonTower.prototype = Object.create(ciTower.prototype);
ciCannonTower.prototype.ParentConstructor = ciTower;
ciCannonTower.prototype.ParentFire = ciTower.prototype.fire;
ciCannonTower.prototype.geometry = new THREE.Geometry();
tmpGeometry = new THREE.CylinderGeometry(0.2, 0.33, 0.2, 8, 1, false);
for(var i in tmpGeometry.faces){ tmpGeometry.faces[i].materialIndex = 0;}
tmpMesh = new THREE.Mesh(tmpGeometry);
tmpMesh.position.y = 0.4;
THREE.GeometryUtils.merge(ciCannonTower.prototype.geometry, tmpMesh);
tmpGeometry = new THREE.CylinderGeometry(0.33, 0.33, 0.2, 8, 1, true);
for(var i in tmpGeometry.faces){ tmpGeometry.faces[i].materialIndex = 1;}
tmpMesh = new THREE.Mesh(tmpGeometry);
tmpMesh.position.y = 0.2;
THREE.GeometryUtils.merge(ciCannonTower.prototype.geometry, tmpMesh);
tmpGeometry = new THREE.CylinderGeometry(0.33, 0.2, 0.5, 8, 1, true);
for(var i in tmpGeometry.faces){ tmpGeometry.faces[i].materialIndex = 0;}
tmpMesh = new THREE.Mesh(tmpGeometry);
tmpMesh.position.y = -0.15;
THREE.GeometryUtils.merge(ciCannonTower.prototype.geometry, tmpMesh);
tmpGeometry = new THREE.CylinderGeometry(0.22, 0.2, 0.1, 8, 1, false);
for(var i in tmpGeometry.faces){ tmpGeometry.faces[i].materialIndex = 1;}
tmpMesh = new THREE.Mesh(tmpGeometry);
tmpMesh.position.y = -0.45;
THREE.GeometryUtils.merge(ciCannonTower.prototype.geometry, tmpMesh);

ciCannonTower.prototype.getWeaponMesh = function(){
	var flashMesh = new THREE.Mesh(ciGunTower.prototype.flashGeometry, this.game.materialSets[this.game.level.materialSetIndex].materials.flash.clone());
	flashMesh.scale.multiplyScalar(this.game.tileRadius/5);
	flashMesh.position.y -= this.game.tileRadius/2 + this.game.tileRadius/5;
	flashMesh.scale.y *= 2;
	
	var gunMesh = new THREE.Mesh(ciCannonTower.prototype.geometry, new THREE.MeshFaceMaterial([this.game.materialSets[this.game.level.materialSetIndex].materials.gun, this.game.materialSets[this.game.level.materialSetIndex].materials.gunHighlight1]));
	gunMesh.scale.multiplyScalar(this.game.tileRadius);

	var weaponObject = new THREE.Object3D();
	weaponObject.add(flashMesh);
	weaponObject.add(gunMesh);

	return weaponObject;
}

ciCannonTower.prototype.fire = function(time, timeDelta){
	this.ParentFire(time, timeDelta);
	this.game.playSound("cannon");
}

function ciMortarTower(game, tile){
	/** @constructor*/
	this.type = ciTower.prototype.TOWER_TYPES.MORTAR;
	this.ParentConstructor(game, tile);
	this.showTower();
	this.firingSolution = new THREE.Vector3();
}
ciMortarTower.prototype = Object.create(ciTower.prototype);
ciMortarTower.prototype.ParentConstructor = ciTower;

ciMortarTower.prototype.getWeaponMesh = function(){
	var flashGeometry = new THREE.SphereGeometry(this.game.tileRadius/2, 6, 3);
	var flashMesh = new THREE.Mesh(flashGeometry, this.game.materialSets[this.game.level.materialSetIndex].materials.flash.clone());
	flashMesh.position.y -= this.game.tileRadius;
	
	var tubeGeometry = new THREE.CylinderGeometry(this.game.tileRadius/2, this.game.tileRadius/2, this.game.tileRadius, 12, 1, false);
	var tubeMesh = new THREE.Mesh(tubeGeometry);
	tubeMesh.position.y -= this.game.tileRadius/2;
	
	var bellGeometry = new THREE.SphereGeometry(this.game.tileRadius/2, 12, 6, 0, 2*Math.PI, 0, Math.PI/2);
	THREE.GeometryUtils.merge(bellGeometry, tubeMesh);
	var gunMesh = new THREE.Mesh(bellGeometry);
	gunMesh.position.y += this.game.tileRadius/2;
	var gunGeometry = new THREE.Geometry();
	THREE.GeometryUtils.merge(gunGeometry, gunMesh);
	var gunMesh = new THREE.Mesh(gunGeometry, this.game.materialSets[this.game.level.materialSetIndex].materials.gun);

	var weaponObject = new THREE.Object3D();
	weaponObject.add(flashMesh);
	weaponObject.add(gunMesh);

	return weaponObject;
}

ciMortarTower.prototype.fire = function(time, timeDelta){
	var mortar = new ciMortarProjectile(this.game, this, this.position, this.firingSolution, this.damage);
	mortar.move(timeDelta);
	this.flash.opacity = 0.8;
	this.timeSinceLastFire = 0;
	this.game.playSound("cannon");
}

function ciLaserTower(game, tile){
	/** @constructor*/
	this.type = ciTower.prototype.TOWER_TYPES.LASER;
	this.ParentConstructor(game, tile);
	this.showTower();
	this.evolutions.push(ciTower.prototype.TOWER_TYPES.FREEZERAY);
	this.evolutions.push(ciTower.prototype.TOWER_TYPES.UVLASER);
	this.evolutions.push(ciTower.prototype.TOWER_TYPES.EMP);
}
ciLaserTower.prototype = Object.create(ciTower.prototype);
ciLaserTower.prototype.ParentConstructor = ciTower;
ciLaserTower.prototype.ParentFire = ciTower.prototype.fire;
var tmpGeometry = new THREE.CylinderGeometry(0.26, 0.24, 0.1, 3, 1, true);
for(var i in tmpGeometry.faces){
	tmpGeometry.faces[i].materialIndex = 1;
}
var tmpMesh = new THREE.Mesh(tmpGeometry);
tmpMesh.position.y = 0.2;
ciLaserTower.prototype.geometry = new THREE.CylinderGeometry(0.25, 0.166, 1, 3, 1, false);
for(var i in ciLaserTower.prototype.geometry.faces){
	ciLaserTower.prototype.geometry.faces[i].materialIndex = 0;
}
THREE.GeometryUtils.merge(ciLaserTower.prototype.geometry, tmpMesh);
tmpMesh.position.y = 0.4;
tmpMesh.scale.multiplyScalar(1.1);
THREE.GeometryUtils.merge(ciLaserTower.prototype.geometry, tmpMesh);
ciLaserTower.prototype.geometry.computeFaceNormals();
ciLaserTower.prototype.lineGeometry = new THREE.Geometry();
ciLaserTower.prototype.lineGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
ciLaserTower.prototype.lineGeometry.vertices.push(new THREE.Vector3(0, -1, 0));

ciLaserTower.prototype.getWeaponMesh = function(){
	var gunMesh = new THREE.Mesh(ciLaserTower.prototype.geometry, new THREE.MeshFaceMaterial([this.game.materialSets[this.game.level.materialSetIndex].materials.laserGun, this.game.materialSets[this.game.level.materialSetIndex].materials.laserGunHighlight1]));
	gunMesh.scale.multiplyScalar(this.game.tileRadius);
	var line = new THREE.Line(ciLaserTower.prototype.lineGeometry, this.game.materialSets[this.game.level.materialSetIndex].materials.laser1.clone());

	var weaponObject = new THREE.Object3D();
	weaponObject.add(line);
	weaponObject.add(gunMesh);
	return weaponObject;
}

ciLaserTower.prototype.fire = function(time, timeDelta){
	if(this.game.cash > 10){
		this.weaponMesh.children[0].scale.y = this.position.distanceTo(this.target.mesh.position);
		this.ParentFire(time, timeDelta);
		this.game.addCash(-1 * this.damage);
	}
}	

function ciFreezerayTower(game, tile){
	/** @constructor*/
	this.type = ciTower.prototype.TOWER_TYPES.FREEZERAY;
	this.ParentConstructor(game, tile);
	this.showTower();
}
ciFreezerayTower.prototype = Object.create(ciTower.prototype);
ciFreezerayTower.prototype.ParentConstructor = ciTower;
ciFreezerayTower.prototype.ParentFire = ciTower.prototype.fire;

ciFreezerayTower.prototype.getWeaponMesh = function(){
	var gunMesh = new THREE.Mesh(ciLaserTower.prototype.geometry, new THREE.MeshFaceMaterial([this.game.materialSets[this.game.level.materialSetIndex].materials.laserGun, this.game.materialSets[this.game.level.materialSetIndex].materials.laserGunHighlight2]));
	gunMesh.scale.multiplyScalar(this.game.tileRadius);
	var line = new THREE.Line(ciLaserTower.prototype.lineGeometry, this.game.materialSets[this.game.level.materialSetIndex].materials.laser2.clone());

	var weaponObject = new THREE.Object3D();
	weaponObject.add(line);
	weaponObject.add(gunMesh);
	return weaponObject;
}

ciFreezerayTower.prototype.fire = function(time, timeDelta){
	this.weaponMesh.children[0].scale.y = this.position.distanceTo(this.target.mesh.position);
	this.target.moveTime -= 60;
	this.flash.opacity = 0.8;
	this.timeSinceLastFire = 0;
}

function ciUvlaserTower(game, tile){
	/** @constructor*/
	this.type = ciTower.prototype.TOWER_TYPES.UVLASER;
	this.ParentConstructor(game, tile);
	this.showTower();
}
ciUvlaserTower.prototype = Object.create(ciTower.prototype);
ciUvlaserTower.prototype.ParentConstructor = ciTower;
ciUvlaserTower.prototype.ParentFire = ciTower.prototype.fire;

ciUvlaserTower.prototype.getWeaponMesh = function(){
	var gunMesh = new THREE.Mesh(ciLaserTower.prototype.geometry, new THREE.MeshFaceMaterial([this.game.materialSets[this.game.level.materialSetIndex].materials.laserGun, this.game.materialSets[this.game.level.materialSetIndex].materials.laserGunHighlight3]));
	gunMesh.scale.multiplyScalar(this.game.tileRadius);
	var line = new THREE.Line(ciLaserTower.prototype.lineGeometry, this.game.materialSets[this.game.level.materialSetIndex].materials.laser3.clone());

	var weaponObject = new THREE.Object3D();
	weaponObject.add(line);
	weaponObject.add(gunMesh);
	return weaponObject;
}

ciUvlaserTower.prototype.fire = ciLaserTower.prototype.fire;

function ciEmpTower(game, tile){
	/** @constructor*/
	this.type = ciTower.prototype.TOWER_TYPES.EMP;
	this.ParentConstructor(game, tile);
	this.showTower();
}
ciEmpTower.prototype = Object.create(ciTower.prototype);
ciEmpTower.prototype.ParentConstructor = ciTower;
ciEmpTower.prototype.geometry = new THREE.SphereGeometry(0.3);
for(var i in ciEmpTower.prototype.geometry.faces){ ciEmpTower.prototype.geometry.faces[i].materialIndex = 1; }
tmpGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1, 4, 1, true);
for(var i in tmpGeometry.faces){ tmpGeometry.faces[i].materialIndex = 0; }
tmpMesh = new THREE.Mesh(tmpGeometry);
tmpMesh.position.y = -0.5;
THREE.GeometryUtils.merge(ciEmpTower.prototype.geometry, tmpMesh);
tmpGeometry = new THREE.SphereGeometry(0.15, 6, 4);
for(var i in tmpGeometry.faces){ tmpGeometry.faces[i].materialIndex = 1; }
tmpMesh = new THREE.Mesh(tmpGeometry);
tmpMesh.position.y = -1.1;
THREE.GeometryUtils.merge(ciEmpTower.prototype.geometry, tmpMesh);
tmpGeometry = new THREE.TorusGeometry(0.4, 0.065, 3, 6);
for(var i in tmpGeometry.faces){ tmpGeometry.faces[i].materialIndex = 0; }
tmpMesh = new THREE.Mesh(tmpGeometry);
tmpMesh.scale.y = 0.8;
tmpMesh.position.y = -0.4;
tmpMesh.rotation.x = Math.PI/2;
THREE.GeometryUtils.merge(ciEmpTower.prototype.geometry, tmpMesh);
tmpMesh.position.y = -0.6;
tmpMesh.scale.multiplyScalar(0.8);
THREE.GeometryUtils.merge(ciEmpTower.prototype.geometry, tmpMesh);
tmpMesh.position.y = -0.8;
tmpMesh.scale.multiplyScalar(0.8);
THREE.GeometryUtils.merge(ciEmpTower.prototype.geometry, tmpMesh);

ciEmpTower.prototype.flashGeometry = new THREE.Geometry();
tmpGeometry = new THREE.TorusGeometry(0.4, 0.1, 3, 6);
tmpMesh = new THREE.Mesh(tmpGeometry);
tmpMesh.scale.y = 0.8;
tmpMesh.position.y = -0.4;
tmpMesh.rotation.x = Math.PI/2;
THREE.GeometryUtils.merge(ciEmpTower.prototype.flashGeometry, tmpMesh);
tmpMesh.position.y = -0.6;
tmpMesh.scale.multiplyScalar(0.8);
THREE.GeometryUtils.merge(ciEmpTower.prototype.flashGeometry, tmpMesh);
tmpMesh.position.y = -0.8;
tmpMesh.scale.multiplyScalar(0.8);
THREE.GeometryUtils.merge(ciEmpTower.prototype.flashGeometry, tmpMesh);

ciEmpTower.prototype.getWeaponMesh = function(){
	var gunMesh = new THREE.Mesh(ciEmpTower.prototype.geometry, new THREE.MeshFaceMaterial([this.game.materialSets[this.game.level.materialSetIndex].materials.gun, this.game.materialSets[this.game.level.materialSetIndex].materials.gunHighlight1]));
	gunMesh.scale.multiplyScalar(this.game.tileRadius);
	
	var flashMesh = new THREE.Mesh(ciEmpTower.prototype.flashGeometry, this.game.materialSets[this.game.level.materialSetIndex].materials.emp.clone());
	flashMesh.scale.multiplyScalar(this.game.tileRadius);
	var weaponObject = new THREE.Object3D();
	weaponObject.add(flashMesh);
	weaponObject.add(gunMesh);
	return weaponObject;
}

ciEmpTower.prototype.fire = function(time, timeDelta){
	var gunPoint = new THREE.Vector3(0, -1, 0);
	gunPoint.transformDirection(this.weaponMesh.matrix);
	gunPoint.multiplyScalar(this.game.tileRadius);
	gunPoint.add(this.position);
	var sparkCount = 0;
	var targetSparks = this.target.empSparks;
	for(var i = 0; i < Math.floor(this.damage) && targetSparks.length < this.target.maxHp; i++){
		targetSparks.push(new ciEmpSpark(this.target, gunPoint, this));
		this.target.sparkTimer = time + 1000;
		sparkCount++;
	}
	this.game.addCash(-0.5 * sparkCount);
	if(targetSparks.length >= this.target.maxHp){
		this.target = null;
		this.onTarget = false;
	}
	this.flash.opacity = 0.8;
	this.timeSinceLastFire = 0;
	this.game.playSound("buzz");
}

function ciSolarpanelTower(game, tile){
	/** @constructor*/
	this.type = ciTower.prototype.TOWER_TYPES.SOLARPANEL;
	this.ParentConstructor(game, tile);
	this.upgrades.length = 0;
	this.target = this;
	this.onTarget = true;
	this.showTower();
}
ciSolarpanelTower.prototype = Object.create(ciTower.prototype);
ciSolarpanelTower.prototype.ParentConstructor = ciTower;
ciSolarpanelTower.prototype.geometry = new THREE.SphereGeometry(0.15);
tmpGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 3, 1, false);
THREE.GeometryUtils.merge(ciSolarpanelTower.prototype.geometry, tmpGeometry);
for(var i in ciSolarpanelTower.prototype.geometry.faces){ ciSolarpanelTower.prototype.geometry.faces[i].materialIndex = 0;}
tmpGeometry = new THREE.Geometry();
tmpGeometry.vertices.push(new THREE.Vector3(0.09, 0.04, 0.15));
tmpGeometry.vertices.push(new THREE.Vector3(-0.09, 0.04, 0.15));
tmpGeometry.vertices.push(new THREE.Vector3(-0.09, -0.04, 0.15));
tmpGeometry.vertices.push(new THREE.Vector3(0.09, -0.04, 0.15));
tmpGeometry.faces.push(new THREE.Face4(0, 1, 2, 3));
tmpGeometry.computeFaceNormals();
tmpMesh = new THREE.Mesh(tmpGeometry);
for(var y = 0.3; y < 1; y += 0.1){
	for(var x = -0.6; x < 0.7; x += 0.2){
		tmpMesh.geometry.faces[0].materialIndex = 2 + Math.floor(3 * Math.random());
		tmpMesh.position.x = x;
		tmpMesh.position.y = -1 * y;
		THREE.GeometryUtils.merge(ciSolarpanelTower.prototype.geometry, tmpMesh);
		tmpMesh.position.y = y;
		THREE.GeometryUtils.merge(ciSolarpanelTower.prototype.geometry, tmpMesh);
	}
}
tmpMesh.geometry.faces[0].materialIndex = 1;
tmpMesh.scale.x = 8;
tmpMesh.scale.y = 10.5;
tmpMesh.position.x = 0;
tmpMesh.position.z = -0.01;
tmpMesh.position.y = -0.65;
THREE.GeometryUtils.merge(ciSolarpanelTower.prototype.geometry, tmpMesh);
tmpMesh.position.y = 0.65;
THREE.GeometryUtils.merge(ciSolarpanelTower.prototype.geometry, tmpMesh);

ciSolarpanelTower.prototype.getWeaponMesh = function(){
	var gunMesh = new THREE.Mesh(ciSolarpanelTower.prototype.geometry, new THREE.MeshFaceMaterial(
						[this.game.materialSets[this.game.level.materialSetIndex].materials.gun,
						this.game.materialSets[this.game.level.materialSetIndex].materials.solarpanelBack,
						this.game.materialSets[this.game.level.materialSetIndex].materials.solarpanelFace1,
						this.game.materialSets[this.game.level.materialSetIndex].materials.solarpanelFace2,
						this.game.materialSets[this.game.level.materialSetIndex].materials.solarpanelFace3
						]));
	gunMesh.scale.multiplyScalar(this.game.tileRadius);
	gunMesh.rotation.z = Math.PI * Math.random();
	return gunMesh;
}

ciSolarpanelTower.prototype.track = function(time, timeDelta){
	this.weaponMesh.rotation.y = Math.max(0, 0.75 * (Math.sin(0.4*Math.PI + this.weaponMesh.rotation.z)));
	this.weaponMesh.rotation.z += this.trackingSpeed * timeDelta/1000;
}

ciSolarpanelTower.prototype.fire = function(time, timeDelta){
	this.game.addCash(this.damage);
	this.timeSinceLastFire = 0;
}

ciSolarpanelTower.prototype.getInfoDetail = function(){
	html =  this.INFO.description + "<br>";
	html += "Generates " + this.damage + this.game.energyImage + " every " + this.rateOfFire + " seconds.<br>";
	html += "<button class='closeButton' onclick='" + this.game.JSName + ".showSelectedItemDetail = false; " + this.game.JSName + ".showSelectedItemInfo();'><img src='images/close.svg' class='energyImg' height='16'></button>";
	return html;
}

function ciWindmillTower(game, tile){
	/** @constructor*/
	this.type = ciTower.prototype.TOWER_TYPES.WINDMILL;
	this.ParentConstructor(game, tile);
	this.upgrades.length = 0;
	this.evolutions.push(ciTower.prototype.TOWER_TYPES.SOLARPANEL);
	this.target = this;
	this.onTarget = true;
	this.showTower();
}
ciWindmillTower.prototype = Object.create(ciTower.prototype);
ciWindmillTower.prototype.ParentConstructor = ciTower;
tmpGeometry = new THREE.CylinderGeometry(0.3, 0.25, 0.1, 6, 1, false);
ciWindmillTower.prototype.bladeGeometry = new THREE.Geometry();
tmpMesh = new THREE.Mesh(tmpGeometry);
tmpMesh.position.y = -0.6;
tmpMesh.rotation.y = Math.PI/6;
THREE.GeometryUtils.merge(ciWindmillTower.prototype.bladeGeometry, tmpMesh);
tmpGeometry = new THREE.Geometry();
tmpGeometry.vertices.push(new THREE.Vector3(-0.1, 0, 0.1));
tmpGeometry.vertices.push(new THREE.Vector3(-0.1, 0, -2));
tmpGeometry.vertices.push(new THREE.Vector3(0, 0, -1.9));
tmpGeometry.vertices.push(new THREE.Vector3(0.25, 0.1, -0.5));
tmpGeometry.faces.push(new THREE.Face4(1, 2, 3, 0));
tmpGeometry.computeFaceNormals();
tmpMesh = new THREE.Mesh(tmpGeometry);
tmpMesh.position.y = -0.625;
THREE.GeometryUtils.merge(ciWindmillTower.prototype.bladeGeometry, tmpMesh);
tmpMesh.rotation.y = Math.PI * 2/3;
THREE.GeometryUtils.merge(ciWindmillTower.prototype.bladeGeometry, tmpMesh);
tmpMesh.rotation.y = Math.PI * -2/3;
THREE.GeometryUtils.merge(ciWindmillTower.prototype.bladeGeometry, tmpMesh);

ciWindmillTower.prototype.geometry = new THREE.Geometry();
tmpGeometry = new THREE.SphereGeometry(0.25);
for(var i in tmpGeometry.faces){
	if(i%8 == 3 || i%8 == 0 || i%8 == 5 || i%8 == 6){
		tmpGeometry.faces[i].materialIndex = 1;
	}else{
		tmpGeometry.faces[i].materialIndex = 0;
	}
}
tmpMesh = new THREE.Mesh(tmpGeometry);
tmpMesh.scale.y = 3;
tmpMesh.position.y = -0.2;
tmpMesh.position.z = 2;
THREE.GeometryUtils.merge(ciWindmillTower.prototype.geometry, tmpMesh);
tmpGeometry = new THREE.CylinderGeometry(0.05, 0.1, 0.5, 3, 1, false);
for(var i in tmpGeometry.faces){ tmpGeometry.faces[i].materialIndex = 0;}
tmpMesh = new THREE.Mesh(tmpGeometry);
tmpMesh.position.y = 0.6;
tmpMesh.position.z = 2;
THREE.GeometryUtils.merge(ciWindmillTower.prototype.geometry, tmpMesh);
tmpGeometry = new THREE.Geometry();
tmpGeometry.vertices.push(new THREE.Vector3(0, 0.8, 0));
tmpGeometry.vertices.push(new THREE.Vector3(0, 1.2, 0.5));
tmpGeometry.vertices.push(new THREE.Vector3(0, 1.1, 0));
tmpGeometry.vertices.push(new THREE.Vector3(0, 1.2, -0.5));
tmpGeometry.faces.push(new THREE.Face3(0, 1, 2));
tmpGeometry.faces.push(new THREE.Face3(0, 2, 3));
for(var i in tmpGeometry.faces){ tmpGeometry.faces[i].materialIndex = 2;}
tmpGeometry.computeFaceNormals();
tmpMesh = new THREE.Mesh(tmpGeometry);
tmpMesh.position.z = 2;
THREE.GeometryUtils.merge(ciWindmillTower.prototype.geometry, tmpMesh);
tmpGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2, 6, 1, true);
for(var i in tmpGeometry.faces){ tmpGeometry.faces[i].materialIndex = 0;}
tmpMesh = new THREE.Mesh(tmpGeometry);
tmpMesh.rotation.x = Math.PI/2;
tmpMesh.position.z = 1;
THREE.GeometryUtils.merge(ciWindmillTower.prototype.geometry, tmpMesh);

ciWindmillTower.prototype.getWeaponMesh = function(){
	var bladeMesh = new THREE.Mesh(ciWindmillTower.prototype.bladeGeometry, this.game.materialSets[this.game.level.materialSetIndex].materials.windmill.materials[0]);
	bladeMesh.scale.multiplyScalar(this.game.tileRadius);
	bladeMesh.position.z += 2*this.game.tileRadius;

	var mesh = new THREE.Mesh(ciWindmillTower.prototype.geometry, this.game.materialSets[this.game.level.materialSetIndex].materials.windmill);
	mesh.scale.multiplyScalar(this.game.tileRadius);
	
	var windmill = new THREE.Object3D();
	windmill.add(bladeMesh);
	windmill.add(mesh);
	windmill.rotation.z = Math.random() * Math.PI;
	return windmill;
}

ciWindmillTower.prototype.track = function(time, timeDelta){
	this.weaponMesh.rotation.z += this.trackingSpeed * timeDelta/1000;
	this.weaponMesh.children[0].rotation.y += Math.PI * timeDelta/1000;
}

ciWindmillTower.prototype.fire = ciSolarpanelTower.prototype.fire;
ciWindmillTower.prototype.getInfoDetail = ciSolarpanelTower.prototype.getInfoDetail;




