function ciLevel(game, tileRadius, nextLevelObject) {
	/** @constructor*/
	this.game = game;
	if(nextLevelObject === undefined) return;
	if(nextLevelObject.mapIndex >= 0) $.getJSON("maps/" + this.game.maps[nextLevelObject.mapIndex].filename, function(data){ game.receiveLevelMap(data);});
	this.centerHex = null;
	this.homeBaseTile = null;
	this.spawnTiles = [];
	this.pathsToHomeBase = {};
	this.pathsMesh = null;
	this.mapGeometry = new THREE.Geometry();
	this.mapMesh = null;
	this.borderCollisionGeometry = new THREE.Geometry();
	this.borderCollisionMesh = null;
	this.edgeBarrierGeometry = new THREE.Geometry();
	this.edgeBarrierMesh = null;
	this.collidableMeshes = [];
	this.materials = [];
	var particleGeometry = new THREE.Geometry();
	for(var i = 0; i < 1000; i++){ particleGeometry.vertices.push(new THREE.Vector3(0, 0, 10000));}
	this.particleSystem = new THREE.ParticleSystem(particleGeometry, new THREE.ParticleBasicMaterial({color: 0xFF1FE5, size: 5}));
	this.game.threeObjects.scene.add(this.particleSystem);

	this.tileRadius = tileRadius;
	this.halfTileRadius = this.tileRadius/2;
	this.toSide = this.tileRadius * hexTile.prototype.toSide;
	this.bounds = {lower: {x: 0, y:0}, upper: {x: 0, y:0}};

	this.tileOffset = [{}, {}, {}, {}, {}, {}];
	for(var i = 0; i < 6; i++){
		this.tileOffset[i].x = this.tileRadius * hexTile.prototype.neighborOffset[i].x;
		this.tileOffset[i].y = this.tileRadius * hexTile.prototype.neighborOffset[i].y;
	}
	
	this.name = nextLevelObject.name;
	this.story = nextLevelObject.story;
	this.nextLevelIndex = nextLevelObject.nextLevelIndex;
	if(nextLevelObject.startingCash === undefined) nextLevelObject.startingCash = 100;
	this.startingCash = nextLevelObject.startingCash;
	this.allowedTowers = nextLevelObject.allowedTowers || null;
	this.timeBetweenWaves = nextLevelObject.timeBetweenWaves;
	this.waves = this.game.waveSets[nextLevelObject.waveSetIndex].waves;
	this.game.tilt = nextLevelObject.tilt;
	this.game.theta = nextLevelObject.theta;
	this.game.cameraDistance = nextLevelObject.cameraDistance;
	this.rotateOnStory = true;
	this.game.updateCamera();

	ciTriangleMob.prototype.initGeometry();
	ciSquareMob.prototype.initGeometry();
	this.materialSetIndex = nextLevelObject.materialSetIndex || 0;

	while(hexTile.prototype.tiles.length > 0){
		if(hexTile.prototype.tiles[0].gameEntityMesh != null){
			this.game.threeObjects.scene.remove(hexTile.prototype.tiles[0].gameEntityMesh);
		}
		hexTile.prototype.tiles[0].destroy();
	}
	
	//this.logWaveStats();
}
ciLevel.prototype.levelOfDetail = {TERRAIN: 0, SPLIT: 1, WALL: 2, PILLAR: 3, GAME_ENTITIES: 4};

ciLevel.prototype.initMap = function(mapObject){
	for(var i in mapObject.materials){
		this.addMaterial(mapObject.materials[i].name,
					mapObject.materials[i].index,
					mapObject.materials[i].type,
					mapObject.materials[i].color,
					mapObject.materials[i].emissive,
					mapObject.materials[i].wireframe);
	}
	this.faceMaterial = new THREE.MeshFaceMaterial(this.materials);

	this.objectsToLoad = [];
	this.loadedObjects = [];
	this.objectsToLoad = mapObject.tiles;
	this.continueLoading(1);

	this.restart();
}

ciLevel.prototype.destroy = function(){
	while(hexTile.prototype.tiles.length > 0){
		if(hexTile.prototype.tiles[0].gameEntityMesh != null){
			this.game.threeObjects.scene.remove(hexTile.prototype.tiles[0].gameEntityMesh);
		}
		hexTile.prototype.tiles[0].destroy();
	}
	while(ciTower.prototype.towers.length > 0){
		ciTower.prototype.towers[0].destroy();
	}
	while(ciMob.prototype.mobs.length > 0){
		ciMob.prototype.mobs[0].destroy();
	}
	this.game.threeObjects.scene.remove(this.particleSystem);
	this.particleSystem = null;
	this.centerHex = null;
	this.homeBaseTile = null;
	this.spawnTiles = null;
	if(this.pathsMesh != null){
		this.game.threeObjects.scene.remove(this.pathsMesh);
		this.pathsMesh = null;
	}
	if(this.mapMesh != null){
		this.game.threeObjects.scene.remove(this.mapMesh);
		this.mapMesh = null;
	}
	this.mapGeometry = null;
	if(this.borderCollisionMesh != null){
		this.game.threeObjects.scene.remove(this.borderCollisionMesh);
		this.borderCollisionMesh = null;
	}
	this.borderCollisionGeometry = null;
	if(this.edgeBarrierMesh != null){
		this.game.threeObjects.scene.remove(this.edgeBarrierMesh);
		this.edgeBarrierMesh = null;
	}
	this.collidableMeshes.length = 0;
	this.collidableMeshes = null;
	this.edgeBarrierGeometry = null;
	this.pathsToHomeBase = null;
	this.materials = null;
	this.objectsToLoad = null;
}

ciLevel.prototype.makeMaterial = function(materialType, color, emissive, wireframe){
	var parameters = {};
	if(color !== undefined && color != null) parameters.color = color;
	if(emissive !== undefined && emissive != null) parameters.emissive = emissive;
	if(wireframe !== undefined && wireframe != null) parameters.wireframe = wireframe;

	switch(materialType){
		case 0: return new THREE.MeshBasicMaterial(parameters);
		case 1: return new THREE.MeshLambertMaterial(parameters);
		case 2: return new THREE.MeshPhongMaterial(parameters);
		case 3: return new THREE.MeshNormalMaterial(parameters);
        }
}

ciLevel.prototype.addMaterial = function(name, materialIndex, materialType, color, emissive, wireframe){
	var numToRemove = 0;
	if(materialIndex == null){
		materialIndex = this.materials.length;
	}else{
		numToRemove = 1;
	}
	this.materials.splice(materialIndex, numToRemove, this.makeMaterial(materialType, color, emissive, wireframe));
}

ciLevel.prototype.showStory = function(pageIndex){
	this.game.currentState = this.game.GAME_STATES.STORY;
	this.game.unselectSelectedItem();
	if(this.story[pageIndex].rotateOnStory !== undefined) this.rotateOnStory = this.story[pageIndex].rotateOnStory;
	if(this.story[pageIndex].tilt !== undefined) this.game.tilt = this.story[pageIndex].tilt;
	if(this.story[pageIndex].theta !== undefined) this.game.theta = this.story[pageIndex].theta;
	if(this.story[pageIndex].cameraDistance !== undefined) this.game.cameraDistance = this.story[pageIndex].cameraDistance;
	if(this.story[pageIndex].offsetInTileRadiuses !== undefined){
		this.game.cameraAimPoint.x = this.story[pageIndex].offsetInTileRadiuses.x * this.game.tileRadius;
		this.game.cameraAimPoint.y = this.story[pageIndex].offsetInTileRadiuses.y * this.game.tileRadius;
	}
	this.game.updateCamera();
	if(this.story[pageIndex].allowedTowers !== undefined){
		this.allowedTowers = this.allowedTowers.concat(this.story[pageIndex].allowedTowers);
	}
	var html = this.story[pageIndex].text;
	html += "<br>";
	for(var i in this.story[pageIndex].choices){
		html += "<button class='button' ";
		if(this.story[pageIndex].choices[i].storyIndex == -1){
			html += "onclick='document.game.level.hideStory();'";
		}else{
			html += "onclick='document.game.level.showStory(" + this.story[pageIndex].choices[i].storyIndex + ");'";
		}
		html += ">" + this.story[pageIndex].choices[i].text + "</button>";
	}
	if(this.story[pageIndex].flipSide){
		$('#storyImageDiv').css({"left" : "10px", "right" : ""});
		html = "<div style='position: absolute; bottom: 5px; left: 10px; right: 10px; text-align: left; height: 190px;'>" + html + "</div>";
	}else{
		$('#storyImageDiv').css({"left" : "", "right" : "10px"});
		html = "<div style='position: absolute; bottom: 5px; left: 10px; right: 10px; text-align: right; height: 190px;'>" + html + "</div>";
	}
	$('#storyImageDiv .contentDiv').empty().append("<img src='" + this.story[pageIndex].image + "'>");
	$('#storyDiv .contentDiv').empty().append(html);
	if(this.story[pageIndex].color !== undefined) $('#storyDiv, #storyImageDiv').children('.backgroundDiv').css("background-color", this.story[pageIndex].color);
	$('#storyDiv, #storyImageDiv').toggle(true);
	$('#storyImageDiv .contentDiv img').css("position", "relative");
	$('#hudDiv').toggle(false);
}

ciLevel.prototype.hideStory = function(){
	$('#storyDiv, #storyImageDiv').toggle(false);
	$('#hudDiv').toggle(true);
	this.game.resume();
}

ciLevel.prototype.showMap = function(){
	this.showTile(this.centerHex, 0, 0, 0);
	
	this.mapMesh = new THREE.Mesh(this.mapGeometry, this.faceMaterial);
	this.mapMesh.position.set(0, 0, 0);
	this.game.threeObjects.scene.add(this.mapMesh);
}

ciLevel.prototype.showTile = function(tile, x, y, z){
	var wallSideHeight = 0; var wallOppositeSideHeight = 0; var pillarHeight = 0;
	var insidesAreUp = false;
	var geometry = new THREE.Geometry();

	tile.cornerPoints[0].set(this.halfTileRadius, this.toSide, tile.cornerHeight[0] - tile.height);
	tile.cornerPoints[1].set(this.tileRadius, 0, tile.cornerHeight[1] - tile.height);
	tile.cornerPoints[2].set(this.halfTileRadius, -1*this.toSide, tile.cornerHeight[2] - tile.height);
	tile.cornerPoints[3].set(-1*this.halfTileRadius, -1*this.toSide, tile.cornerHeight[3] - tile.height);
	tile.cornerPoints[4].set(-1*this.tileRadius, 0, tile.cornerHeight[4] - tile.height);
	tile.cornerPoints[5].set(-1*this.halfTileRadius, this.toSide, tile.cornerHeight[5] - tile.height);
	
	geometry.vertices.push(new THREE.Vector3(0, 0, 0));
	for(var i = 0; i < 6; i++){
		tile.sidePoints[i].addVectors(tile.cornerPoints[i], tile.cornerPoints[(i+5)%6]);
		tile.sidePoints[i].divideScalar(2);
		geometry.vertices.push(tile.cornerPoints[i]);
	}

	if(tile.pillar){
		if(tile.pillarRelativeHeight){
			pillarHeight = tile.pillarHeight;
		}else{
			pillarHeight = tile.pillarHeight - tile.height;
		}
		
		tile.minMarkupHeight = tile.height + pillarHeight;

		geometry.vertices.push(new THREE.Vector3(0, 0, pillarHeight));
		geometry.vertices.push(new THREE.Vector3((1-tile.pillarTaper) * geometry.vertices[(tile.pillarSide + 2)%6 + 1].x,
							(1-tile.pillarTaper) * geometry.vertices[(tile.pillarSide + 2)%6 + 1].y,
							pillarHeight));
		geometry.vertices.push(new THREE.Vector3((1-tile.pillarTaper) * geometry.vertices[(tile.pillarSide + 3)%6 + 1].x,
							(1-tile.pillarTaper) * geometry.vertices[(tile.pillarSide + 3)%6 + 1].y,
							pillarHeight));
		geometry.vertices.push(new THREE.Vector3((1-tile.pillarTaper) * geometry.vertices[(tile.pillarSide + 1)%6 + 1].x,
							(1-tile.pillarTaper) * geometry.vertices[(tile.pillarSide + 1)%6 + 1].y,
							pillarHeight));
		geometry.vertices.push(new THREE.Vector3((1-tile.pillarTaper) * geometry.vertices[(tile.pillarSide + 4)%6 + 1].x,
							(1-tile.pillarTaper) * geometry.vertices[(tile.pillarSide + 4)%6 + 1].y,
							pillarHeight));
		geometry.vertices.push(new THREE.Vector3((1-tile.pillarTaper) * geometry.vertices[tile.pillarSide + 1].x,
							(1-tile.pillarTaper) * geometry.vertices[tile.pillarSide + 1].y,
							pillarHeight));
		geometry.vertices.push(new THREE.Vector3((1-tile.pillarTaper) * geometry.vertices[(tile.pillarSide + 5)%6 + 1].x,
							(1-tile.pillarTaper) * geometry.vertices[(tile.pillarSide + 5)%6 + 1].y,
							pillarHeight));
		
		geometry.faces.push(new THREE.Face3(0, 1, 6));
		geometry.faces.push(new THREE.Face3(0, 2, 1));
		geometry.faces.push(new THREE.Face3(0, 3, 2));
		geometry.faces.push(new THREE.Face3(0, 4, 3));
		geometry.faces.push(new THREE.Face3(0, 5, 4));
		geometry.faces.push(new THREE.Face3(0, 6, 5));
			
		switch(tile.pillarSize){
			case 3: geometry.faces.push(new THREE.Face3(7, 9, 8));
				geometry.faces.push(new THREE.Face4(8, 9, (tile.pillarSide + 3)%6 + 1, (tile.pillarSide + 2)%6 + 1));
				insidesAreUp = true;
			case 2:	geometry.faces.push(new THREE.Face3(7, 8, 10));
				geometry.faces.push(new THREE.Face4(10, 8, (tile.pillarSide + 2)%6 + 1, (tile.pillarSide + 1)%6 + 1));
				geometry.faces.push(new THREE.Face3(7, 11, 9));
				geometry.faces.push(new THREE.Face4(9, 11, (tile.pillarSide + 4)%6 + 1, (tile.pillarSide + 3)%6 + 1));
				if(!insidesAreUp){
					geometry.faces.push(new THREE.Face4(7, 0, (tile.pillarSide + 2)%6 + 1, 8));
					geometry.faces.push(new THREE.Face4(0, 7, 9, (tile.pillarSide + 3)%6 + 1));
					insidesAreUp = true;
				}
			case 1:	geometry.faces.push(new THREE.Face3(7, 10, 12));
				geometry.faces.push(new THREE.Face4(12, 10, (tile.pillarSide + 1)%6 + 1, tile.pillarSide + 1));
				geometry.faces.push(new THREE.Face3(7, 13, 11));
				geometry.faces.push(new THREE.Face4(11, 13, (tile.pillarSide + 5)%6 + 1, (tile.pillarSide + 4)%6 + 1));
				if(!insidesAreUp){
					geometry.faces.push(new THREE.Face4(7, 0, (tile.pillarSide + 1)%6 + 1, 10));
					geometry.faces.push(new THREE.Face4(0, 7, 11, (tile.pillarSide + 4)%6 + 1));
					insidesAreUp = true;
				}
			case 0:	geometry.faces.push(new THREE.Face3(7, 12, 13));
				geometry.faces.push(new THREE.Face4(13, 12, tile.pillarSide + 1, (tile.pillarSide + 5)%6 + 1));
				if(!insidesAreUp){
					geometry.faces.push(new THREE.Face4(7, 0, tile.pillarSide + 1, 12));
					geometry.faces.push(new THREE.Face4(0, 7, 13, (tile.pillarSide + 5)%6 + 1));
				}
		}

	}else if(tile.wall){
		if(tile.wallRelativeHeight){
			wallSideHeight = 1 + Math.max(tile.cornerHeight[(tile.wallSide + 5)%6],
						tile.cornerHeight[tile.wallSide])
						+ tile.wallHeight - tile.height;
			wallOppositeSideHeight = 1 + Math.max(tile.cornerHeight[(tile.wallSide + 2)%6],
						tile.cornerHeight[(tile.wallSide + 3)%6])
						+ tile.wallHeight - tile.height;
		}else{
			wallSideHeight = 1 + Math.max(tile.wallHeight,
						Math.max(tile.cornerHeight[(tile.wallSide + 5)%6],
						tile.cornerHeight[tile.wallSide]))
						- tile.height;
			wallOppositeSideHeight = 1 + Math.max(tile.wallHeight,
							Math.max(tile.cornerHeight[(tile.wallSide + 2)%6],
							tile.cornerHeight[(tile.wallSide + 3)%6]))
							- tile.height;
		}
		tile.minMarkupHeight = tile.height + (wallSideHeight + wallOppositeSideHeight)/2;

		geometry.vertices.push(new THREE.Vector3(0.625 * geometry.vertices[tile.wallSide + 2].x,
							0.625 * geometry.vertices[tile.wallSide + 2].y,
							(tile.cornerHeight[tile.wallSide + 1] - tile.height)/2));
		geometry.vertices.push(new THREE.Vector3(0.625 * geometry.vertices[(tile.wallSide + 4)%6 + 1].x,
							0.625 * geometry.vertices[(tile.wallSide + 4)%6 + 1].y,
							(tile.cornerHeight[(tile.wallSide + 4)%6] - tile.height)/2));
		geometry.vertices.push(new THREE.Vector3(0.5 * geometry.vertices[tile.wallSide + 2].x,
							0.5 * geometry.vertices[tile.wallSide + 2].y,
							Math.min((wallSideHeight + wallOppositeSideHeight)/2 - 5, geometry.vertices[7].z + 5)));
		geometry.vertices.push(new THREE.Vector3(0.5 * geometry.vertices[(tile.wallSide + 4)%6 + 1].x,
							0.5 * geometry.vertices[(tile.wallSide + 4)%6 + 1].y,
							Math.min((wallSideHeight + wallOppositeSideHeight)/2 - 5, geometry.vertices[8].z + 5)));
		
		geometry.vertices.push(new THREE.Vector3((1-tile.wallTaper) * geometry.vertices[tile.wallSide + 1].x,
							(1-tile.wallTaper) * geometry.vertices[tile.wallSide + 1].y,
							wallSideHeight));

		geometry.vertices.push(new THREE.Vector3((1-tile.wallTaper) * geometry.vertices[tile.wallSide + 3].x,
							(1-tile.wallTaper) * geometry.vertices[tile.wallSide + 3].y,
							wallOppositeSideHeight));

		geometry.vertices.push(new THREE.Vector3((1-tile.wallTaper) * geometry.vertices[tile.wallSide + 4].x,
							(1-tile.wallTaper) * geometry.vertices[tile.wallSide + 4].y,
							wallOppositeSideHeight));

		geometry.vertices.push(new THREE.Vector3((1-tile.wallTaper) * geometry.vertices[(tile.wallSide + 5)%6 + 1].x,
							(1-tile.wallTaper) * geometry.vertices[(tile.wallSide + 5)%6 + 1].y,
							wallSideHeight));

		//first and fourth face are placeholders to calculate split hex terrain materials
		geometry.faces.push(new THREE.Face3(7, tile.wallSide + 2, tile.wallSide + 1));
		geometry.faces.push(new THREE.Face3(7, tile.wallSide + 2, tile.wallSide + 1));
		geometry.faces.push(new THREE.Face3(7, tile.wallSide + 3, tile.wallSide + 2));
		geometry.faces.push(new THREE.Face3(8, (tile.wallSide + 4)%6 + 1, (tile.wallSide + 3)%6 + 1));
		geometry.faces.push(new THREE.Face3(8, (tile.wallSide + 4)%6 + 1, (tile.wallSide + 3)%6 + 1));
		geometry.faces.push(new THREE.Face3(8, (tile.wallSide + 5)%6 + 1, (tile.wallSide + 4)%6 + 1));

		geometry.faces.push(new THREE.Face3(9, 7, tile.wallSide + 1));
		geometry.faces.push(new THREE.Face3(7, 9, tile.wallSide + 3));
		geometry.faces.push(new THREE.Face3(10, 8, (tile.wallSide + 3)%6 + 1));
		geometry.faces.push(new THREE.Face3(8, 10, (tile.wallSide + 5)%6 + 1));

		geometry.faces.push(new THREE.Face3(9, tile.wallSide + 1, 11));
		geometry.faces.push(new THREE.Face3(9, 11, 12));
		geometry.faces.push(new THREE.Face3(9, 12, tile.wallSide + 3));

		geometry.faces.push(new THREE.Face3(10, (tile.wallSide + 3)%6 + 1, 13));
		geometry.faces.push(new THREE.Face3(10, 13, 14));
		geometry.faces.push(new THREE.Face3(10, 14, (tile.wallSide + 5)%6 + 1));

		geometry.faces.push(new THREE.Face4(14, 13, 12, 11));

		if(tile.neighbors[tile.wallSide] == null || tile.wallTaper != 0 || (tile.neighbors[tile.wallSide] != null && !(tile.neighbors[tile.wallSide].wall && tile.wallSide == tile.neighbors[tile.wallSide].wallSide && tile.wallRelativeHeight == tile.neighbors[tile.wallSide].wallRelativeHeight && tile.wallHeight == tile.neighbors[tile.wallSide].wallHeight))) geometry.faces.push(new THREE.Face4(tile.wallSide + 1, (tile.wallSide + 5)%6 + 1, 14, 11));
		if(tile.neighbors[tile.wallSide + 3] == null || tile.wallTaper != 0 || (tile.neighbors[tile.wallSide + 3] != null && !(tile.neighbors[tile.wallSide + 3].wall && tile.wallSide == tile.neighbors[tile.wallSide + 3].wallSide && tile.wallRelativeHeight == tile.neighbors[tile.wallSide + 3].wallRelativeHeight && tile.wallHeight == tile.neighbors[tile.wallSide + 3].wallHeight))) geometry.faces.push(new THREE.Face4(tile.wallSide + 3, 12, 13, (tile.wallSide + 3)%6 + 1));
	 
	}else{
		geometry.faces.push(new THREE.Face3(0, 1, 6));
		geometry.faces.push(new THREE.Face3(0, 2, 1));
		geometry.faces.push(new THREE.Face3(0, 3, 2));
		geometry.faces.push(new THREE.Face3(0, 4, 3));
		geometry.faces.push(new THREE.Face3(0, 5, 4));
		geometry.faces.push(new THREE.Face3(0, 6, 5));
		tile.minMarkupHeight = tile.height;
	}
	
	for(var i in geometry.faces){
		if(i < 6){
			geometry.faces[i].materialIndex = tile.materialIndex;
		}else{
			if(tile.wall){
				geometry.faces[i].materialIndex = tile.wallMaterialIndex;
			}else if(tile.pillar){
				geometry.faces[i].materialIndex = tile.pillarMaterialIndex;
			}
		}
	}

	if(tile.splitHex){
		switch(tile.splitHexSize){
			case 2:	geometry.faces[(tile.splitHexSide + 4)%6].materialIndex = tile.splitHexMaterialIndex;
				geometry.faces[(tile.splitHexSide + 2)%6].materialIndex = tile.splitHexMaterialIndex;
			case 1:	geometry.faces[(tile.splitHexSide + 5)%6].materialIndex = tile.splitHexMaterialIndex;
				geometry.faces[(tile.splitHexSide + 1)%6].materialIndex = tile.splitHexMaterialIndex;
			case 0:	geometry.faces[tile.splitHexSide].materialIndex = tile.splitHexMaterialIndex;
		}
	}

	if(tile.wall){
		geometry.faces.splice(3, 1);
		geometry.faces.splice(0, 1);
		geometry.faces[4].materialIndex = geometry.faces[0].materialIndex;
		geometry.faces[5].materialIndex = geometry.faces[1].materialIndex;
		geometry.faces[6].materialIndex = geometry.faces[2].materialIndex;
		geometry.faces[7].materialIndex = geometry.faces[3].materialIndex;
	}else if(tile.pillar){
		for(var i = 5; i >= 0; i--){
			if(tile.pillarSide == i ||
				(tile.pillarSize >= 1 && ((tile.pillarSide + 1)%6 == i || (tile.pillarSide + 5)%6 == i)) ||
				(tile.pillarSize >= 2 && ((tile.pillarSide + 2)%6 == i || (tile.pillarSide + 4)%6 == i)) ||
				tile.pillarSize == 3){
				geometry.faces.splice(i, 1);
			}
		}
	}

	if(x < this.bounds.lower.x){
		this.bounds.lower.x = x;
	}else if(x > this.bounds.upper.x){
		this.bounds.upper.x = x;
	}
	if(y < this.bounds.lower.y){
		this.bounds.lower.y = y;
	}else if(y > this.bounds.upper.y){
		this.bounds.upper.y = y;
	}

	tile.position.x = x;
	tile.position.y = y;
	tile.position.z = tile.height;
	
	if(tile.gameEntity != null){
		if(tile.gameEntityMesh == null){
			switch(tile.gameEntity){
				case 0:		//World edge barrier
						//Edge barrier creation moved to initEdges to avoid transparency flicker
						tile.gameEntityMesh = null;
						break;
				case 1:		//Home Base
						tile.gameEntityMesh = this.getHomeBaseMesh(tile);
						this.homeBaseTile = tile;
						break;
				case 2:		//Bad guys 1
						tile.gameEntityMesh = this.getSpawnMesh(tile);
						this.spawnTiles[0] = tile;
						break;
				case 3:		//Bad guys 2
						tile.gameEntityMesh = this.getSpawnMesh(tile);
						this.spawnTiles[1] = tile;
						break;
				case 4:		//Bad guys 3
						tile.gameEntityMesh = this.getSpawnMesh(tile);
						this.spawnTiles[2] = tile;
						break;
				case 5:		//Bad guys 4
						tile.gameEntityMesh = this.getSpawnMesh(tile);
						this.spawnTiles[3] = tile;
						break;
				case 6:		//Tree (tile, trunkLength, branchLength, branchFactor, angleDampening, leafSize, branchSteps)
						tile.gameEntityMesh = this.getTreeMesh(tile, 4*this.game.tileRadius, 2*this.game.tileRadius, 1, 0.4, 5*this.game.tileRadius, 6);
						break;
				case 7:		//Tree (tile, trunkLength, branchLength, branchFactor, leafSize, branchSteps)
						tile.gameEntityMesh = this.getTreeMesh(tile, 4*this.game.tileRadius, 2*this.game.tileRadius, 3, 0.8, 2*this.game.tileRadius, 3);
						break;
				case 8:		//Tree (tile, trunkLength, branchLength, branchFactor, leafSize, branchSteps)
						tile.gameEntityMesh = this.getTreeMesh(tile, 4*this.game.tileRadius, 2*this.game.tileRadius, 3, 0.4, this.game.tileRadius, 3);
						break;
				case 9:		//Tree (tile, trunkLength, branchLength, branchFactor, leafSize, branchSteps)
						tile.gameEntityMesh = this.getTreeMesh(tile, 4*this.game.tileRadius, 1.5*this.game.tileRadius, 2, 0.8, this.game.tileRadius/2, 5);
						break;
				case 10:	//Hydrant
						tile.gameEntityMesh = this.getHydrantMesh(tile);
						break;
				case 11:	//Mailbox
						tile.gameEntityMesh = this.getMailboxMesh(tile);
						break;
			}
		}
		if(tile.gameEntityMesh != null){
			this.game.threeObjects.scene.add(tile.gameEntityMesh);
		}
	}

	geometry.computeFaceNormals();
	geometry.mergeVertices();
	var mesh = new THREE.Mesh(geometry, this.faceMaterial);
	mesh.position.set(x, y, tile.height);

	THREE.GeometryUtils.merge(this.mapGeometry, mesh);
	tile.mesh = mesh;
	tile.mesh.visible = false;
	this.game.threeObjects.scene.add(tile.mesh);

	for(var i = 0; i < 6; i++){
		if(tile.neighbors[i] != null && tile.neighbors[i].mesh == null){
			this.showTile(tile.neighbors[i], x + this.tileOffset[i].x, y + this.tileOffset[i].y, z);
		}
	}
}

ciLevel.prototype.initEdges = function(){
	for(var i in hexTile.prototype.tiles){
		if(hexTile.prototype.tiles[i].gameEntity == 0) this.addEdgeBarrierGeometry(hexTile.prototype.tiles[i]);
	}

	this.edgeBarrierGeometry.computeFaceNormals();
	this.edgeBarrierMesh = new THREE.Mesh(this.edgeBarrierGeometry, this.game.materialSets[this.materialSetIndex].materials.edgeBarrier);
	this.game.threeObjects.scene.add(this.edgeBarrierMesh);
}

ciLevel.prototype.addEdgeBarrierGeometry = function(tile){
	var edgeBarrierHeight = this.game.tileRadius/3;
	var collisionBarrierHeight = 500;
	var sideOne = -1;
	var sideTwo = -1;
	var afterSideOne = false;
	var afterSideTwo = false;
	for(var i = 0; i < 6; i++){
		if(tile.neighbors[i] === undefined || tile.neighbors[i] == null) continue;
		if(tile.neighbors[i].gameEntity == 0){
			if(sideOne == -1){
				sideOne = i;
			}else if(sideTwo == -1){
				sideTwo = i;
			}else if(sideTwo - sideOne == 1 || i - sideTwo == 1){
				sideTwo = i;
			}else if(i == 5 && sideOne == 0 && sideTwo == 2){
				sideOne = 5;
			}
		}else if(this.pathsToHomeBase[tile.neighbors[i].id] !== undefined){
			if(sideOne == -1 || sideTwo != -1){
				afterSideTwo = true;
			}else{
				afterSideOne = true;
			}
		}
	}
	if(sideOne >= 0 && sideTwo >= 0){
		var geometry = new THREE.Geometry();
		geometry.vertices.push(new THREE.Vector3(0, 0, 0));
		geometry.vertices.push(new THREE.Vector3(0, 0, edgeBarrierHeight));
		this.addEdgeBarrierVertices(tile, geometry.vertices, sideOne, edgeBarrierHeight);
		this.addEdgeBarrierVertices(tile, geometry.vertices, sideTwo, edgeBarrierHeight);
		geometry.faces.push(new THREE.Face4(0, 2, 3, 1));
		geometry.faces.push(new THREE.Face4(0, 1, 5, 4));

		var mesh = new THREE.Mesh(geometry);
		mesh.position.copy(tile.position);
		THREE.GeometryUtils.merge(this.edgeBarrierGeometry, mesh);
	
		var collisionGeometry = new THREE.Geometry();
		collisionGeometry.vertices.push(new THREE.Vector3(0, 0, -1*(collisionBarrierHeight/2)));
		collisionGeometry.vertices.push(new THREE.Vector3(0, 0, collisionBarrierHeight/2));
		collisionGeometry.vertices.push(new THREE.Vector3(geometry.vertices[3].x, geometry.vertices[3].y, -1*(collisionBarrierHeight/2)));
		collisionGeometry.vertices.push(new THREE.Vector3(geometry.vertices[3].x, geometry.vertices[3].y, collisionBarrierHeight/2));
		collisionGeometry.vertices.push(new THREE.Vector3(geometry.vertices[5].x, geometry.vertices[5].y, -1*(collisionBarrierHeight/2)));
		collisionGeometry.vertices.push(new THREE.Vector3(geometry.vertices[5].x, geometry.vertices[5].y, collisionBarrierHeight/2));
		if(afterSideOne && !afterSideTwo){
			collisionGeometry.faces.push(new THREE.Face4(0, 2, 3, 1));
			collisionGeometry.faces.push(new THREE.Face4(0, 1, 5, 4));
		}else if(!afterSideOne && afterSideTwo){
			collisionGeometry.faces.push(new THREE.Face4(0, 1, 3, 2));
			collisionGeometry.faces.push(new THREE.Face4(0, 4, 5, 1));
		}else{
			var tmpMesh = new THREE.Mesh(new THREE.SphereGeometry(100));
			tmpMesh.position.copy(tile.position);
			this.game.threeObjects.scene.add(tmpMesh);
		}
		
		collisionGeometry.computeFaceNormals();
		mesh = new THREE.Mesh(collisionGeometry);
		mesh.position.copy(tile.position);
		mesh.position.z += collisionBarrierHeight/2;
		tile.gameEntityMesh = mesh;
		this.collidableMeshes.push(mesh);
		mesh.visible = false;
		this.game.threeObjects.scene.add(mesh);
		return null;
	}
	return null;
}

ciLevel.prototype.addEdgeBarrierVertices = function(tile, vertices, side, edgeBarrierHeight){
		vertices.push(tile.sidePoints[side]);
		vertices.push(new THREE.Vector3(tile.sidePoints[side].x, tile.sidePoints[side].y, tile.sidePoints[side].z + edgeBarrierHeight));
}

ciLevel.prototype.getHomeBaseMesh = function(tile){
	var tempHeight = tile.getHighestCornerHeight() + this.game.tileRadius/10 - tile.height;
	var geometry = new THREE.Geometry();
	geometry.vertices.push(new THREE.Vector3(0, 0, tempHeight));
	for(var i = 0; i < 6; i++){
		geometry.vertices.push(new THREE.Vector3(tile.cornerPoints[i].x *4/5, tile.cornerPoints[i].y * 4/5, tempHeight));
		geometry.vertices.push(tile.cornerPoints[i]);

		geometry.faces.push(new THREE.Face3(0, (i*2)+1, ((i+5)%6)*2+1));
		geometry.faces.push(new THREE.Face4((i*2)+1, (i*2)+1+1, ((i+5)%6)*2+1+1, ((i+5)%6)*2+1));
	}
	geometry.computeFaceNormals();
	mesh = new THREE.Mesh(geometry, this.game.materialSets[this.materialSetIndex].materials.homeBase);
	mesh.position.copy(tile.position);
	
	return mesh;
}

ciLevel.prototype.getSpawnMesh = function(tile){
	var tempHeight = tile.getHighestCornerHeight() + this.game.tileRadius/10 - tile.height;
	var geometry = new THREE.Geometry();
	geometry.vertices.push(new THREE.Vector3(0, 0, tempHeight));
	for(var i = 0; i < 6; i++){
		geometry.vertices.push(new THREE.Vector3(tile.cornerPoints[i].x *4/5, tile.cornerPoints[i].y * 4/5, tempHeight));
		geometry.vertices.push(tile.cornerPoints[i]);

		geometry.faces.push(new THREE.Face3(0, (i*2)+1, ((i+5)%6)*2+1));
		geometry.faces.push(new THREE.Face4((i*2)+1, (i*2)+1+1, ((i+5)%6)*2+1+1, ((i+5)%6)*2+1));
	}
	geometry.computeFaceNormals();
	mesh = new THREE.Mesh(geometry, this.game.materialSets[this.materialSetIndex].materials.spawn);
	mesh.position.copy(tile.position);
	return mesh;
}

ciLevel.prototype.generateTreeBranchesGeometry = function(geometry, direction, branchLength, branchFactor, angleDampening, leafSize, branchSteps){
	var point1Index = geometry.vertices.length - 3;
	var point2Index = geometry.vertices.length - 2;
	var point3Index = geometry.vertices.length - 1;
	var point1 = geometry.vertices[point1Index];
	var point2 = geometry.vertices[point2Index];
	var point3 = geometry.vertices[point3Index];
	var centerPoint = point1.clone();
	centerPoint.add(point2);
	centerPoint.add(point3);
	centerPoint.multiplyScalar(1/3);

	for(var b = 0; b < branchFactor; b++){
		var branchDirection = direction.clone();
		var branchRotation = new THREE.Matrix4();
		branchRotation.rotateX((Math.random() - 0.5) * Math.PI * angleDampening);
		branchRotation.rotateY((Math.random() - 0.5) * Math.PI * angleDampening);
		branchRotation.rotateZ((Math.random() - 0.5) * Math.PI * angleDampening);
		branchDirection.transformDirection(branchRotation);

		branchDirection.multiplyScalar(branchLength * (0.5 + Math.random()));

		if(branchSteps <= 1){
			var tip1 = new THREE.Vector3();
			tip1.addVectors(centerPoint, branchDirection);
			geometry.vertices.push(tip1);
			var tip1Index = geometry.vertices.length - 1;
			geometry.faces.push(new THREE.Face3(point1Index, tip1Index, point2Index));
			geometry.faces[geometry.faces.length - 1].materialIndex = 0;
			geometry.faces.push(new THREE.Face3(point2Index, tip1Index, point3Index));
			geometry.faces[geometry.faces.length - 1].materialIndex = 0;
			geometry.faces.push(new THREE.Face3(point3Index, tip1Index, point1Index));
			geometry.faces[geometry.faces.length - 1].materialIndex = 0;

			var leaves = new THREE.Mesh(new THREE.SphereGeometry(leafSize * 1.5));
			leaves.position.copy(tip1);
			var flipflop = 0;
			for(var f in leaves.geometry.faces){
				if(flipflop++%2 == 0){
					leaves.geometry.faces[f].materialIndex = 1;
				}else{
					leaves.geometry.faces[f].materialIndex = 2;
				}
				if(flipflop%8 == 0) flipflop++;
			}
			leaves.scale.x = 0.5 + 0.5 * Math.random();
			leaves.scale.y = 0.5 + 0.5 * Math.random();
			leaves.scale.z = 0.5 + 0.5 * Math.random();
			THREE.GeometryUtils.merge(geometry, leaves);
		}else{
			var tip1 = new THREE.Vector3();
			tip1.subVectors(point1, centerPoint);
			tip1.transformDirection(branchRotation);
			tip1.multiplyScalar(point1.distanceTo(centerPoint)*(branchSteps - 1)/branchSteps);
			tip1.add(centerPoint);
			tip1.add(branchDirection);

			var tip2 = new THREE.Vector3();
			tip2.subVectors(point2, centerPoint);
			tip2.transformDirection(branchRotation);
			tip2.multiplyScalar(point2.distanceTo(centerPoint)*(branchSteps - 1)/branchSteps);
			tip2.add(centerPoint);
			tip2.add(branchDirection);

			var tip3 = new THREE.Vector3();
			tip3.subVectors(point3, centerPoint);
			tip3.transformDirection(branchRotation);
			tip3.multiplyScalar(point3.distanceTo(centerPoint)*(branchSteps - 1)/branchSteps);
			tip3.add(centerPoint);
			tip3.add(branchDirection);

			geometry.vertices.push(tip1);
			geometry.vertices.push(tip2);
			geometry.vertices.push(tip3);
			var tip1Index = geometry.vertices.length - 3;
			var tip2Index = geometry.vertices.length - 2;
			var tip3Index = geometry.vertices.length - 1;

			geometry.faces.push(new THREE.Face4(point1Index, tip1Index, tip2Index, point2Index));
			geometry.faces[geometry.faces.length - 1].materialIndex = 0;
			geometry.faces.push(new THREE.Face4(point2Index, tip2Index, tip3Index, point3Index));
			geometry.faces[geometry.faces.length - 1].materialIndex = 0;
			geometry.faces.push(new THREE.Face4(point3Index, tip3Index, tip1Index, point1Index));
			geometry.faces[geometry.faces.length - 1].materialIndex = 0;

			this.generateTreeBranchesGeometry(geometry, branchDirection, branchLength, branchFactor, angleDampening, leafSize, branchSteps - 1);
		}
	}
}

ciLevel.prototype.getTreeMesh = function(tile, trunkLength, branchLength, branchFactor, angleDampening, leafSize, branchSteps){
	var trunkLenght = trunkLength || this.game.tileRadius * 6;
	var branchLength = branchLength || trunkLength/2;
	var branchFactor = branchFactor || 2;
	var angleDampening = angleDampening || 1;
	var leafSize = leafSize || branchLength/2;
	var branchSteps = branchSteps || 3;

	var trunklean = new THREE.Vector3(angleDampening * trunkLength * (Math.random() - 0.5),
						angleDampening * trunkLength * (Math.random() - 0.5),
						Math.max(this.game.tileRadius, trunkLength + 2 * this.game.tileRadius * (Math.random() - 0.5)));


	var geometry = new THREE.Geometry();
	geometry.vertices.push(tile.sidePoints[0]);
	geometry.vertices.push(tile.sidePoints[2]);
	geometry.vertices.push(tile.sidePoints[4]);
	geometry.vertices.push(tile.sidePoints[0].clone().add(trunklean));
	geometry.vertices.push(tile.sidePoints[2].clone().add(trunklean));
	geometry.vertices.push(tile.sidePoints[4].clone().add(trunklean));
	geometry.faces.push(new THREE.Face4(0, 3, 4, 1));
	geometry.faces.push(new THREE.Face4(1, 4, 5, 2));
	geometry.faces.push(new THREE.Face4(2, 5, 3, 0));
	for(var i in geometry.faces){ geometry.faces[i].materialIndex = 0;}

	this.generateTreeBranchesGeometry(geometry, new THREE.Vector3(0, 0, 1), branchLength, branchFactor, angleDampening, leafSize, branchSteps);
	geometry.computeFaceNormals();

	var mesh = new THREE.Mesh(geometry, this.game.materialSets[this.materialSetIndex].materials.tree);
	if(tile != null) mesh.position.copy(tile.position);
	return mesh;
}

ciLevel.prototype.getHydrantMesh = function(tile){
	var hydrantGeometry = new THREE.Geometry();
	var geometry = new THREE.SphereGeometry(0.4, 8, 6, 0, 2*Math.PI, 0, Math.PI/2);
	var mesh = new THREE.Mesh(geometry);
	mesh.position.y = 1.4;
	THREE.GeometryUtils.merge(hydrantGeometry, mesh);
	
	geometry = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 8, 1, false);
	mesh = new THREE.Mesh(geometry);
	mesh.position.y = 1.3;
	THREE.GeometryUtils.merge(hydrantGeometry, mesh);
	mesh.position.y = 0.1;
	THREE.GeometryUtils.merge(hydrantGeometry, mesh);

	geometry = new THREE.CylinderGeometry(0.4, 0.4, 1, 8, 1, true);
	mesh = new THREE.Mesh(geometry);
	mesh.position.y = 0.7;
	THREE.GeometryUtils.merge(hydrantGeometry, mesh);
	
	geometry = new THREE.CylinderGeometry(0.2, 0.2, 0.5, 8, 1, false);
	mesh = new THREE.Mesh(geometry);
	mesh.position.y = 0.7;
	mesh.position.z = 0.25;
	mesh.rotation.x = Math.PI/2;
	THREE.GeometryUtils.merge(hydrantGeometry, mesh);
	
	geometry = new THREE.CylinderGeometry(0.15, 0.15, 1, 6, 1, false);
	mesh = new THREE.Mesh(geometry);
	mesh.position.y = 0.85;
	mesh.rotation.z = Math.PI/2;
	THREE.GeometryUtils.merge(hydrantGeometry, mesh);
	
	
	var hydrantMesh = new THREE.Mesh(hydrantGeometry, this.game.materialSets[this.materialSetIndex].materials.hydrant);
	hydrantMesh.scale.multiplyScalar(this.game.tileRadius);
	hydrantMesh.rotation.x = Math.PI/2;
	if(tile !== undefined) hydrantMesh.position.copy(tile.position);
	return hydrantMesh;
}

ciLevel.prototype.getMailboxMesh = function(tile){
	var mailboxGeometry = new THREE.Geometry();
	var geometry = new THREE.CylinderGeometry(0.3, 0.3, 1, 8, 1, false);
	for(var i in geometry.faces){ geometry.faces[i].materialIndex = 0;}
	var mesh = new THREE.Mesh(geometry);
	mesh.position.z = 3;
	THREE.GeometryUtils.merge(mailboxGeometry, mesh);

	geometry = new THREE.CubeGeometry(0.6, 1, 0.3, 1, 1, 1);
	for(var i in geometry.faces){ geometry.faces[i].materialIndex = 0;}
	mesh = new THREE.Mesh(geometry);
	mesh.position.z = 2.85;
	THREE.GeometryUtils.merge(mailboxGeometry, mesh);

	geometry = new THREE.CubeGeometry(0.15, 0.15, 3, 1, 1, 1);
	for(var i in geometry.faces){ geometry.faces[i].materialIndex = 1;}
	mesh = new THREE.Mesh(geometry);
	mesh.position.z = 1.5;
	THREE.GeometryUtils.merge(mailboxGeometry, mesh);

	geometry = new THREE.Geometry();
	geometry.vertices.push(new THREE.Vector3(0, 0, 0));
	geometry.vertices.push(new THREE.Vector3(0, 0.1, 0));
	geometry.vertices.push(new THREE.Vector3(0, 0.1, 0.3));
	geometry.vertices.push(new THREE.Vector3(0, 0, 0.3));
	geometry.vertices.push(new THREE.Vector3(0, 0.3, 0.3));
	geometry.vertices.push(new THREE.Vector3(0, 0.3, 0.5));
	geometry.vertices.push(new THREE.Vector3(0, 0, 0.5));
	geometry.faces.push(new THREE.Face4(0, 1, 2, 3));
	geometry.faces.push(new THREE.Face4(3, 4, 5, 6));
	for(var i in geometry.faces){ geometry.faces[i].materialIndex = 2;}
	mesh = new THREE.Mesh(geometry);
	mesh.position.z = 2.85;
	mesh.position.x = 0.31;
	mesh.position.y = -0.25;
	THREE.GeometryUtils.merge(mailboxGeometry, mesh);

	mailboxGeometry.computeFaceNormals();
	var mailboxMesh = new THREE.Mesh(mailboxGeometry, this.game.materialSets[this.materialSetIndex].materials.mailbox);
	mailboxMesh.scale.multiplyScalar(this.game.tileRadius);
	mailboxMesh.rotation.z = Math.PI;
	if(tile !== undefined) mailboxMesh.position.copy(tile.position);
	return mailboxMesh;
}

ciLevel.prototype.hideMap = function(){
	this.game.threeObjects.scene.remove(this.borderCollisionMesh);
	this.game.threeObjects.scene.remove(this.edgeBarrierMesh);
	this.collidableMeshes.length = 0;
	
	this.game.threeObjects.scene.remove(this.mapMesh);
	for(var i in hexTile.prototype.tiles){
		hexTile.prototype.tiles[i].mesh = null;
	}
}

ciLevel.prototype.addMapTilesToCollidableObjects = function(){
	var tiles = hexTile.prototype.tiles;
	for(var i in tiles){
		if(this.pathsToHomeBase[tiles[i].id] !== undefined || tiles[i].gameEntity != null || tiles[i].wall || tiles[i].pillar){
			this.collidableMeshes.push(tiles[i].mesh);
		}
	}
}

ciLevel.prototype.continueLoading = function(limit){
	if(this.objectsToLoad.length == 0){
		this.centerHex.calculateHeights(true);
		this.showMap();
		this.calculatePathsToHomeBase();
		this.addMapTilesToCollidableObjects();
		this.initEdges();
		this.loadedObjects.length = 0;
	}else if(limit == 0){
		return;
	}else{
		for(var i in this.objectsToLoad){
			i = parseInt(i);
			if(this.centerHex == null && this.objectsToLoad[i][1] == null){
				this.centerHex = new hexTile(this.objectsToLoad[i][3], 0);
				var newTile = this.centerHex;
			}else{
				if(this.loadedObjects[this.objectsToLoad[i][1]] === undefined) continue;
				var parentTile = this.loadedObjects[this.objectsToLoad[i][1]];
				parentTile.neighbors[(this.objectsToLoad[i][2] + 3)%6] = new hexTile(this.objectsToLoad[i][3], 0, parentTile, this.objectsToLoad[i][2]);
				var newTile = parentTile.neighbors[(this.objectsToLoad[i][2] + 3)%6];
			}
			newTile.setFromImport(this.objectsToLoad[i]);
			this.loadedObjects[this.objectsToLoad[i][0]] = newTile;
			this.objectsToLoad.splice(i, 1);
			this.continueLoading(limit - 1);
			return;
		}
	}
}

ciLevel.prototype.calculatePathsToHomeBase = function(){
	var tilesToSkip = [];
	var checkMe;
	var tempPathsToHomeBase = {};
	var flipFlop = false;
	var clockwise = 0;
	var counterClockwise = 0;

	for(var i in ciTower.prototype.towers){
		tilesToSkip.push(ciTower.prototype.towers[i].tile);
	}

	tempPathsToHomeBase[this.homeBaseTile.id] = {side: 0, steps: 0};
	var tilesToCheckNext = [this.homeBaseTile];
	tilesToSkip.push(this.homeBaseTile);

	while(checkMe = tilesToCheckNext.shift()){
		if(checkMe === undefined) break;
		flipFlop = tempPathsToHomeBase[checkMe.id].steps % 2;
		for(clockwise = 0; clockwise < 6; clockwise++){
			counterClockwise = 5 - clockwise;
			if(flipFlop){
				i = counterClockwise;
			}else{
				i = clockwise;
			}
			if(checkMe.neighbors[i] == null) continue;
			if(checkMe.neighbors[i].wall || checkMe.neighbors[i].pillar) continue;
			if(checkMe.neighbors[i].gameEntity != null && $.inArray(checkMe.neighbors[i], this.spawnTiles) == -1) continue;
			if($.inArray(checkMe.neighbors[i], tilesToSkip) != -1) continue;
			tempPathsToHomeBase[checkMe.neighbors[i].id] = {side: (i+3)%6, steps: tempPathsToHomeBase[checkMe.id].steps + 1};
			tilesToCheckNext.push(checkMe.neighbors[i]);
			tilesToSkip.push(checkMe.neighbors[i]);
		}
	}
	for(var i in this.spawnTiles){
		if(tempPathsToHomeBase[this.spawnTiles[i].id] === undefined) return false;
	}

	this.pathsToHomeBase = tempPathsToHomeBase;

	if(this.pathsMesh != null) this.game.threeObjects.scene.remove(this.pathsMesh);
	this.pathsMesh = this.getPathsMesh();
	if(this.pathsMesh instanceof THREE.Mesh) this.pathsMesh.position.z = this.game.maxCameraDistance + 500;
	if(this.pathsMesh instanceof THREE.Mesh){
		this.game.threeObjects.scene.add(this.pathsMesh);
	}
	return true;
}

ciLevel.prototype.getPathsMesh = function(){
	var pathTiles = [];
	var tileInPath = null;
	var material = new THREE.MeshBasicMaterial({color: 0xffffff, opacity: 0.3, transparent: true, side: THREE.DoubleSide});
	var material_inPath = new THREE.MeshBasicMaterial({color: 0xb4ff33, opacity: 0.6, transparent: true, side: THREE.DoubleSide});
	var geometry = new THREE.Geometry();
	var arrowGeometry = new THREE.Geometry();
	arrowGeometry.vertices.push(new THREE.Vector3(0, 0, this.game.tileRadius/5));
	arrowGeometry.vertices.push(new THREE.Vector3(this.game.tileRadius/5, 0, 0));
	arrowGeometry.vertices.push(new THREE.Vector3(0, 0, this.game.tileRadius*4/5));
	arrowGeometry.vertices.push(new THREE.Vector3(-1*this.game.tileRadius/5, 0, 0));
	arrowGeometry.faces.push(new THREE.Face3(0, 1, 2));
	arrowGeometry.faces.push(new THREE.Face3(0, 2, 3));
	arrowGeometry.faces[0].materialIndex = 0;
	arrowGeometry.faces[1].materialIndex = 0;
	var mesh = null;
	var arrowMesh = new THREE.Mesh(arrowGeometry);
	arrowMesh.up.copy(this.game.threeObjects.camera.up);
	for(var i in this.spawnTiles){
		pathTiles.push(this.spawnTiles[i]);
		tileInPath = this.spawnTiles[i].neighbors[this.pathsToHomeBase[this.spawnTiles[i].id].side];
		while(tileInPath != null){
			arrowMesh.position.set(0, 0, 0);
			arrowMesh.lookAt(tileInPath.sidePoints[this.pathsToHomeBase[tileInPath.id].side]);
			arrowMesh.position.copy(tileInPath.position);
			arrowMesh.position.z += this.game.tileRadius/10;
			THREE.GeometryUtils.merge(geometry, arrowMesh);
			pathTiles.push(tileInPath);
			if(this.pathsToHomeBase[tileInPath.id].steps > 1){
				tileInPath = tileInPath.neighbors[this.pathsToHomeBase[tileInPath.id].side];
			}else{
				tileInPath = null;
			}
		}
	}
	arrowGeometry.faces[0].materialIndex = 1;
	arrowGeometry.faces[1].materialIndex = 1;
	var tempTile = null;
	for(var i in this.pathsToHomeBase){
		tempTile = hexTile.prototype.getTileById(parseInt(i));
		if($.inArray(tempTile, pathTiles) >= 0) continue;
		if(tempTile == this.homeBaseTile) continue;
		arrowMesh.position.set(0, 0, 0);
		arrowMesh.lookAt(tempTile.sidePoints[this.pathsToHomeBase[i].side]);
		arrowMesh.position.copy(tempTile.position);
		arrowMesh.position.z += this.game.tileRadius/10;
		THREE.GeometryUtils.merge(geometry, arrowMesh);
	}
	geometry.computeFaceNormals();
	return new THREE.Mesh(geometry, new THREE.MeshFaceMaterial([material_inPath, material]));
}

ciLevel.prototype.startNextWave = function(){
	if(this.game.currentState == this.game.GAME_STATES.SETUP){
		this.game.currentState = this.game.GAME_STATES.PLAY;
	}
	if(this.game.currentState != this.game.GAME_STATES.PLAY) return;
	if(this.nextWave < this.waves.length){
		if(this.waves[this.nextWave].spawnIndex === undefined || this.waves[this.nextWave].spawnIndex >= this.spawnTiles.length){
			var spawnIndex = 0;
		}else if(this.waves[this.nextWave].spawnIndex == -1){
			var spawnIndex = Math.floor(Math.random() * this.spawnTiles.length);
		}else{
			var spawnIndex = this.waves[this.nextWave].spawnIndex;
		}
		if(this.waves[this.nextWave].separation === undefined) this.waves[this.nextWave].separation = 1;
		this.spawningMobs.push({lastSpawnTime: (Date.now() - this.waves[this.nextWave].separation * 1000),
					spawnIndex: spawnIndex,
					separation: this.waves[this.nextWave].separation,
					mobs: this.waves[this.nextWave].mobs.slice(0)});
		for(var i in this.story){
			if(this.story[i].wave == this.nextWave){
				this.showStory(i);
				break;
			}
		}
		this.nextWave++;
	}else{
		return;
	}
	this.game.addCash(Math.max(0, Math.floor(this.timeToNextWave)));
	if(this.nextWave == this.waves.length){
		this.allWavesAreOut = true;
		$('#hudWaveTimer').empty().append("---");
	}else{
		this.timeToNextWave = this.timeBetweenWaves;
		this.displayTimeToNextWave = 10000;
	}
	this.game.playSound("nextwave");
}

ciLevel.prototype.restart = function(){
	while(ciTower.prototype.towers.length > 0){
		ciTower.prototype.towers[0].destroy();
	}
	while(ciMob.prototype.mobs.length > 0){
		ciMob.prototype.mobs[0].destroy();
	}
	while(ciProjectile.prototype.projectiles.length > 0){
		ciProjectile.prototype.projectiles[0].destroy();
	}
	for(var i in this.particleSystem.geometry.vertices){
		this.particleSystem.geometry.vertices[i].set(0, 0, 10000);
	}
	this.particleSystem.geometry.verticesNeedUpdate = true;
	if(this.objectsToLoad.length == 0) this.calculatePathsToHomeBase();
	this.timeToNextWave = 0;
	this.displayTimeToNextWave = 0;
	this.nextWave = 0;
	this.timesBurned = 0;
	this.spawningMobs = [];
	this.allWavesAreOut = false;
	$('#hudWaveTimer').empty().append("Start<span class='keyboard'>SPACE</span>");
	this.game.cash = 0;
	this.game.addCash(this.startingCash);
	this.showStory(0);
}

ciLevel.prototype.logWaveStats = function(){
	for(var i in this.waves){
		var difficulty = 0;
		for(var j in this.waves[i].mobs){
			difficulty += ciMob.prototype.MOB_INFO[this.waves[i].mobs[j]].difficulty;
		}
		console.log(i, difficulty, this.waves[i]);
	}
}
