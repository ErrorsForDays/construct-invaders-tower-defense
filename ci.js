if(!window.requestAnimationFrame){
	window.requestAnimationFrame = ( function(){
		return window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function(callback, element){ 
			window.setTimeout(callback, 1000/60);
		};
	})();
}

function ci(){
	this.JSName = "document.game";
	this.energyImage = "<img src='images/energy.png' class='energyImg'>";
	this.GAME_STATES = {MENU: 0, STORY: 1, SETUP: 2, PLAY: 3, PAUSED: 4, GAME_OVER: 5};
	Object.freeze(this.GAME_STATES);
	this.currentState = this.GAME_STATES.MENU;

	this.isCameraMoving = false;
	this.isCameraRotating = false;
	this.isHeightDragging = false;
	this.isShiftDown = false;
	this.dontClickMeBro = false;
	this.isAnaglyphToggled = false;
	this.playSounds = true;
	this.playMusic = true;
	this.showStats = false;
	
	this.time = 0; this.lastTime = Date.now(); this.timeDelta = 0;
	this.tickTimelimit = 25;
	this.gravity = 250; //axis units/s^2
	this.bounce = 0.5;
	this.selectedItem = null;
	this.showSelectedItemDetail = false;
	this.nextMobToMoveIndex = 0;
	this.mouse2D = {x: 0, y: 0};
	this.dragStart = {x: 0, y: 0};
	this.cameraAimPoint = {x: 0, y: 0, z: 0};
	this.cameraMovementMultiplier = 1;
	this.cameraRotationMultiplier = 100;
	this.cameraTiltMultiplier = 50;
	this.cameraZoomMultiplier = 0.5;
	this.maxCameraDistance = 5000;
	this.dragDelay = 25;
	this.clickIntersects = [];
	
	this.theta = 0;
	this.tilt = 0;
	this.cameraDistance = 700;
	this.tileRadius = 50;

	this.level = null;
	this.maps = [];
	this.maps.push({name: "Retro Tutorial", filename: "map1.json"});
	this.maps.push({name: "Backyard", filename: "map2.json"});
	this.maps.push({name: "Road", filename: "map3.json"});
	this.maps.push({name: "Intersection", filename: "map4.json"});
	this.maps.push({name: "Baseball", filename: "map5.json"});
	this.maps.push({name: "Arena", filename: "arena.json"});
	this.maps.push({name: "Tao", filename: "tao.json"});
	this.maps.push({name: "Traditional", filename: "traditional.json"});
	this.maps.push({name: "King of the Hill", filename: "koth.json"});
	this.nextLevelObject = levels[0];
	this.cash = 0;

	this.allowedTowersSets = [];
	this.allowedTowersSets.push({name: "All Towers", allowedTowers: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]});
	this.allowedTowersSets.push({name: "No Solar/Wind", allowedTowers: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]});
	this.allowedTowersSets.push({name: "Only Kinetic", allowedTowers: [0, 1, 2, 3, 4, 5, 6]});
	this.allowedTowersSets.push({name: "Only Energy", allowedTowers: [0, 1, 7, 8, 9, 10, 11, 12]});
	this.allowedTowersSets.push({name: "Only Lasers", allowedTowers: [0, 1, 7, 9, 11, 12]});

	this.initThreeObjects();
	this.initMaterialSets();
	this.initStats();
	this.initMenuBackground();
	this.initEndingDivs();
	this.initWaves();
	this.initCustomGameDiv();
	this.initSettingsDiv();
	this.initSounds();
	this.toggleMenuBackground(true);
	$('#menuDiv').css({"left":"50%", "bottom":"20px", "margin": "0 0 0 -" + ($('#menuDiv').width()/2) + "px"});
};

ci.prototype.postInit = function(gameObject){
	$('#startButton').click(function(){ gameObject.start.call(gameObject, event);});
	$('#customGameButton').click(function(){ gameObject.showCustomGameDiv.call(gameObject, event);});
	$('#creditsButton').click(function(){ gameObject.showCreditsDiv.call(gameObject, event);});
	$('#hideCreditsButton').click(function(){ gameObject.hideCreditsDiv.call(gameObject, event);});
	$('#hudWaveTimer').click(function(){ gameObject.level.startNextWave(gameObject.level, event);});
	$('#settingsToggleDiv').click(function(){ gameObject.showSettings.call(gameObject, event);});
	document.addEventListener('mousemove', function(){ gameObject.onMouseMove.call(gameObject, event);}, false);
	document.addEventListener('keydown', function(){ gameObject.onKeyDown.call(gameObject, event);}, false);
	document.addEventListener('keyup', function(){ gameObject.onKeyUp.call(gameObject, event);}, false);
	document.addEventListener('keypress', function(){ gameObject.onKeyPress.call(gameObject, event);}, false);
	document.addEventListener('mousewheel', function(){ gameObject.onMouseWheel.call(gameObject, event);}, false);
	document.addEventListener('contextmenu', function (event) { event.preventDefault(); }, false );
	$(this.threeObjects.renderer.domElement).dblclick(function(){ gameObject.onMouseDoubleClick.call(gameObject, event);});
	$(this.threeObjects.renderer.domElement).click(function(){ gameObject.onMouseClick.call(gameObject, event);});
	$(this.threeObjects.renderer.domElement).mousedown(function(){ gameObject.onMouseDown.call(gameObject, event);});
	$(this.threeObjects.renderer.domElement).mouseup(function(){ gameObject.onMouseUp.call(gameObject, event);});
	window.addEventListener('resize', function(){ gameObject.onWindowResize.call(gameObject, event);}, false);

	this.hudCashJQO = $('#hudCash');
	this.hudWaveTimerJQO = $('#hudWaveTimer');
	
	this.animate();
	$('#loadingDiv').toggle(false);
}

ci.prototype.receiveLevelMap = function(mapObject){
	this.level.initMap.call(this.level, mapObject);
}

ci.prototype.initStats = function(){
	this.stats = new Stats();
	this.stats.domElement.style.position = 'absolute';
	this.stats.domElement.style.bottom = '10px';
	this.stats.domElement.style.left = '10px';
	document.body.appendChild(this.stats.domElement);
	$(this.stats.domElement).toggle(false);
}

ci.prototype.initThreeObjects = function(){
	var width = window.innerWidth, height = window.innerHeight;
	var viewAngle = 45, aspect = width/height, near = 10, far = 10000;

	this.threeObjects = {};
	this.threeObjects.renderer = new THREE.WebGLRenderer({'antialias': false});
	this.threeObjects.renderer.setSize(width, height);
	this.threeObjects.effect = new THREE.AnaglyphEffect(this.threeObjects.renderer);
	this.threeObjects.effect.setSize(width, height);
	this.threeObjects.camera = new THREE.PerspectiveCamera(viewAngle, aspect, near, far);
	this.threeObjects.camera.up.set(0, 0, 1);
	this.threeObjects.scene = new THREE.Scene();
	this.threeObjects.scene.add(this.camera);
	this.threeObjects.projector = new THREE.Projector();
	document.body.appendChild(this.threeObjects.renderer.domElement);
	this.moveCamera();
	
	this.threeObjects.ambientLight = new THREE.AmbientLight(0x202020);
	this.threeObjects.scene.add(this.threeObjects.ambientLight);
	var directionalLight = new THREE.DirectionalLight(0xA0A0BB, 1.6);
	directionalLight.position.set(0.6, -0.6, 1).normalize();
	this.threeObjects.scene.add(directionalLight);

	this.holoTower = new ciHoloTower(this, null);
	var geometry = new THREE.Geometry();
	var arms = 6;
	var angle = Math.PI/arms;
	var outer = this.tileRadius * 1.7;
	var inner = this.tileRadius * 1.2;
	var outerColor = new THREE.Color(0xffffff);
	var innerColor = new THREE.Color(0xffffff);
	this.selectedItemMarkupMeshColors = [outerColor, innerColor];
	for(var i = 0; i < 13; i++){
		var r = (i & 1) == 0 ? outer: inner;
		var c = (i & 1) == 0 ? outerColor: innerColor;
		geometry.vertices.push(new THREE.Vector3(Math.cos(i*angle) * r, Math.sin(i*angle) * r, 0));
		geometry.colors.push(c);
	}
	this.selectedItemMarkupMesh = new THREE.Line(geometry, new THREE.LineBasicMaterial({vertexColors: true, linewidth: 3}));
	
	this.selectedItemMarkupMesh.scale.z = 3;
	this.threeObjects.scene.add(this.selectedItemMarkupMesh);
	this.updateSelectedItemMarkupMeshPosition();
}

ci.prototype.initMaterialSets = function(){
	this.materialSets = [];
	this.materialSets[0] = {name: "Default", materials: {}};
	this.materialSets[0].materials.triangleDouble = new THREE.MeshNormalMaterial({side: THREE.DoubleSide}); //triangle mobs
	this.materialSets[0].materials.triangle = new THREE.MeshNormalMaterial(); //triangle construct mobs
	this.materialSets[0].materials.squareDouble = new THREE.MeshNormalMaterial({side: THREE.DoubleSide}); //square mobs
	this.materialSets[0].materials.square = new THREE.MeshNormalMaterial(); //square construct mobs
	this.materialSets[0].materials.edgeBarrier = new THREE.MeshBasicMaterial({color: 0xff0000, side: THREE.DoubleSide});
	this.materialSets[0].materials.foundation = new THREE.MeshLambertMaterial({color: 0x999999});
	this.materialSets[0].materials.homeBase = new THREE.MeshLambertMaterial({color: 0x999999});
	this.materialSets[0].materials.spawn = new THREE.MeshNormalMaterial();
	this.materialSets[0].materials.mount = new THREE.MeshLambertMaterial({color: 0x9999ff});
	this.materialSets[0].materials.gun = new THREE.MeshLambertMaterial({color: 0x95b2bb, emissive: 0x2e4148});
	this.materialSets[0].materials.gunHighlight1 = new THREE.MeshLambertMaterial({color: 0x74aa9b, emissive: 0x213630});
	this.materialSets[0].materials.laserGun = new THREE.MeshLambertMaterial({color: 0x555555, emissive: 0x000000});
	this.materialSets[0].materials.laserGunHighlight1 = new THREE.MeshLambertMaterial({color: 0xBB2200, emissive: 0x991100});
	this.materialSets[0].materials.laserGunHighlight2 = new THREE.MeshLambertMaterial({color: 0x0164d5, emissive: 0x001d3d});
	this.materialSets[0].materials.laserGunHighlight3 = new THREE.MeshLambertMaterial({color: 0x8F00F5, emissive: 0x24003d});
	this.materialSets[0].materials.flash = new THREE.MeshBasicMaterial({color: 0xFFDC16, opacity: 0, transparent: true});
	this.materialSets[0].materials.emp = new THREE.MeshBasicMaterial({color: 0xFF1FE5, opacity: 0, transparent: true});
	this.materialSets[0].materials.holo1 = new THREE.MeshBasicMaterial({color: 0x000000, shading: THREE.FlatShading, wireframe: true, wireframeLinewidth: 1, transparent: true});
	this.materialSets[0].materials.holo2 = new THREE.MeshBasicMaterial({color: 0xffffff, opacity: 0.4, transparent: true});
	this.materialSets[0].materials.range1 = new THREE.MeshBasicMaterial({color: 0xFFFFFF, shading: THREE.FlatShading, wireframe: true, transparent: true});
	this.materialSets[0].materials.range2 = new THREE.MeshBasicMaterial({color: 0xffffff, opacity: 0.4, transparent: true});
	this.materialSets[0].materials.laser1 = new THREE.LineBasicMaterial({color: 0xBB2200, linewidth: 2, transparent: true});
	this.materialSets[0].materials.laser2 = new THREE.LineBasicMaterial({color: 0x0164d5, linewidth: 3, transparent: true});
	this.materialSets[0].materials.laser3 = new THREE.LineBasicMaterial({color: 0x8F00F5, linewidth: 5, transparent: true});
	this.materialSets[0].materials.solarpanelBack = new THREE.MeshLambertMaterial({color: 0xffffff, emissive: 0x555555, side: THREE.DoubleSide});
	this.materialSets[0].materials.solarpanelFace1 = new THREE.MeshLambertMaterial({color: 0x24263B});
	this.materialSets[0].materials.solarpanelFace2 = new THREE.MeshLambertMaterial({color: 0x355D77});
	this.materialSets[0].materials.solarpanelFace3 = new THREE.MeshLambertMaterial({color: 0x4D88A8});
        this.materialSets[0].materials.tree = new THREE.MeshFaceMaterial(
                                                        [new THREE.MeshLambertMaterial({color: 0x7C3D09}),
                                                        new THREE.MeshLambertMaterial({color: 0x47B404}),
                                                        new THREE.MeshLambertMaterial({color: 0x5ED100})]);	
	this.materialSets[0].materials.hydrant = new THREE.MeshLambertMaterial({color: 0xFF1000});
        this.materialSets[0].materials.mailbox = new THREE.MeshFaceMaterial(
                                                        [new THREE.MeshLambertMaterial({color: 0xFFFFFF}),
                                                        new THREE.MeshLambertMaterial({color: 0x7C3D09}),
                                                        new THREE.MeshLambertMaterial({color: 0xFF0000, emissive: 0x550000, side: THREE.DoubleSide})]);	
        this.materialSets[0].materials.windmill = new THREE.MeshFaceMaterial(
                                                        [new THREE.MeshLambertMaterial({color: 0xFFFFFF, side: THREE.DoubleSide}),
                                                        new THREE.MeshLambertMaterial({color: 0xA7ABF6}),
                                                        new THREE.MeshLambertMaterial({color: 0xFF0000, emissive: 0x550000, side: THREE.DoubleSide})]);	

	this.materialSets[1] = {name: "Retro", materials: {}};
	this.materialSets[1].materials.triangleDouble = new THREE.MeshBasicMaterial({color: 0x00FF00, side: THREE.DoubleSide}); //triangle mobs
	this.materialSets[1].materials.triangle = new THREE.MeshBasicMaterial({color: 0x00FF00}); //triangle construct mobs
	this.materialSets[1].materials.squareDouble = new THREE.MeshBasicMaterial({color: 0x00FF00, side: THREE.DoubleSide}); //square mobs
	this.materialSets[1].materials.square = new THREE.MeshBasicMaterial({color: 0x00FF00}); //square construct mobs
	this.materialSets[1].materials.edgeBarrier = new THREE.MeshLambertMaterial({color: 0x000000, emissive: 0xCB1ED4, side: THREE.DoubleSide});
	this.materialSets[1].materials.foundation = new THREE.MeshLambertMaterial({color: 0x000000, emissive: 0x002BF5});
	this.materialSets[1].materials.homeBase = new THREE.MeshBasicMaterial({color: 0x0000FF});
	this.materialSets[1].materials.spawn = new THREE.MeshBasicMaterial({color: 0xFF0000});
	this.materialSets[1].materials.mount = new THREE.MeshLambertMaterial({color: 0x000000, emissive: 0x002BF5});
	this.materialSets[1].materials.gun = new THREE.MeshLambertMaterial({color: 0x000000, emissive: 0xDBB500});
	this.materialSets[1].materials.gunHighlight1 = this.materialSets[1].materials.gun;
	this.materialSets[1].materials.laserGun = this.materialSets[0].materials.laserGun;
	this.materialSets[1].materials.laserGunHighlight1 = this.materialSets[0].materials.laserGunHighlight1;
	this.materialSets[1].materials.laserGunHighlight2 = this.materialSets[0].materials.laserGunHighlight2;
	this.materialSets[1].materials.laserGunHighlight3 = this.materialSets[0].materials.laserGunHighlight3;
	this.materialSets[1].materials.flash = this.materialSets[0].materials.flash;
	this.materialSets[1].materials.emp = this.materialSets[0].materials.emp;
	this.materialSets[1].materials.holo1 = this.materialSets[0].materials.holo1;
	this.materialSets[1].materials.holo2 = this.materialSets[0].materials.holo2;
	this.materialSets[1].materials.range1 = this.materialSets[0].materials.range1;
	this.materialSets[1].materials.range2 = this.materialSets[0].materials.range2;
	this.materialSets[1].materials.laser1 = this.materialSets[0].materials.laser1;
	this.materialSets[1].materials.laser2 = this.materialSets[0].materials.laser2;
	this.materialSets[1].materials.laser3 = this.materialSets[0].materials.laser3;
	this.materialSets[1].materials.solarpanelBack = new THREE.MeshLambertMaterial({color: 0xffffff, emissive: 0x555555, side: THREE.DoubleSide});
	this.materialSets[1].materials.solarpanelFace1 = new THREE.MeshLambertMaterial({color: 0x24263B});
	this.materialSets[1].materials.solarpanelFace2 = new THREE.MeshLambertMaterial({color: 0x355D77});
	this.materialSets[1].materials.solarpanelFace3 = new THREE.MeshLambertMaterial({color: 0x4D88A8});
        this.materialSets[1].materials.tree = new THREE.MeshFaceMaterial(
                                                        [new THREE.MeshLambertMaterial({color: 0x7C3D09, emissive: 0x211000}),
                                                        new THREE.MeshLambertMaterial({color: 0x47B404}),
                                                        new THREE.MeshLambertMaterial({color: 0x5ED100})]);	
	this.materialSets[1].materials.hydrant = new THREE.MeshLambertMaterial({color: 0xC41D2C});
        this.materialSets[1].materials.mailbox = new THREE.MeshFaceMaterial(
                                                        [new THREE.MeshLambertMaterial({color: 0xAAAAAA, emissive: 0x444444}),
                                                        new THREE.MeshLambertMaterial({color: 0x7C3D09}),
                                                        new THREE.MeshLambertMaterial({color: 0xFF0000, side: THREE.DoubleSide})]);	
        this.materialSets[1].materials.windmill = new THREE.MeshFaceMaterial(
                                                        [new THREE.MeshLambertMaterial({color: 0xFFFFFF, side: THREE.DoubleSide}),
                                                        new THREE.MeshLambertMaterial({color: 0xA7ABF6}),
                                                        new THREE.MeshLambertMaterial({color: 0xFF0000, emissive: 0x550000, side: THREE.DoubleSide})]);	

	this.materialSets[2] = {name: "Candy", materials: {}};
	this.materialSets[2].materials.triangleDouble = new THREE.MeshNormalMaterial({side: THREE.DoubleSide}); //triangle mobs
	this.materialSets[2].materials.triangle = new THREE.MeshNormalMaterial(); //triangle construct mobs
	this.materialSets[2].materials.squareDouble = new THREE.MeshNormalMaterial({side: THREE.DoubleSide}); //square mobs
	this.materialSets[2].materials.square = new THREE.MeshNormalMaterial(); //square construct mobs
	this.materialSets[2].materials.edgeBarrier = new THREE.MeshLambertMaterial({color: 0x000000, emissive: 0xCB1ED4, side: THREE.DoubleSide});
	this.materialSets[2].materials.foundation = new THREE.MeshLambertMaterial({color: 0xF6A7D2});
	this.materialSets[2].materials.homeBase = new THREE.MeshBasicMaterial({color: 0xF6A7D2});
	this.materialSets[2].materials.spawn = new THREE.MeshNormalMaterial();
	this.materialSets[2].materials.mount = new THREE.MeshLambertMaterial({color: 0xF6F2A7});
	this.materialSets[2].materials.gun = new THREE.MeshLambertMaterial({color: 0xA7F6CB});
	this.materialSets[2].materials.gunHighlight1 = new THREE.MeshLambertMaterial({color: 0xA7ABF6});
	this.materialSets[2].materials.laserGun = this.materialSets[0].materials.laserGun;
	this.materialSets[2].materials.laserGunHighlight1 = this.materialSets[0].materials.laserGunHighlight1;
	this.materialSets[2].materials.laserGunHighlight2 = this.materialSets[0].materials.laserGunHighlight2;
	this.materialSets[2].materials.laserGunHighlight3 = this.materialSets[0].materials.laserGunHighlight3;
	this.materialSets[2].materials.flash = this.materialSets[0].materials.flash;
	this.materialSets[2].materials.emp = this.materialSets[0].materials.emp;
	this.materialSets[2].materials.holo1 = this.materialSets[0].materials.holo1;
	this.materialSets[2].materials.holo2 = this.materialSets[0].materials.holo2;
	this.materialSets[2].materials.range1 = this.materialSets[0].materials.range1;
	this.materialSets[2].materials.range2 = this.materialSets[0].materials.range2;
	this.materialSets[2].materials.laser1 = this.materialSets[0].materials.laser1;
	this.materialSets[2].materials.laser2 = this.materialSets[0].materials.laser2;
	this.materialSets[2].materials.laser3 = this.materialSets[0].materials.laser3;
	this.materialSets[2].materials.solarpanelBack = new THREE.MeshLambertMaterial({color: 0xffffff, emissive: 0x555555, side: THREE.DoubleSide});
	this.materialSets[2].materials.solarpanelFace1 = new THREE.MeshLambertMaterial({color: 0x24263B});
	this.materialSets[2].materials.solarpanelFace2 = new THREE.MeshLambertMaterial({color: 0x355D77});
	this.materialSets[2].materials.solarpanelFace3 = new THREE.MeshLambertMaterial({color: 0x4D88A8});
        this.materialSets[2].materials.tree = new THREE.MeshFaceMaterial(
                                                        [new THREE.MeshLambertMaterial({color: 0x7C3D09, emissive: 0x211000}),
                                                        new THREE.MeshLambertMaterial({color: 0x47B404}),
                                                        new THREE.MeshLambertMaterial({color: 0x5ED100})]);	
	this.materialSets[2].materials.hydrant = new THREE.MeshLambertMaterial({color: 0xC41D2C});
        this.materialSets[2].materials.mailbox = new THREE.MeshFaceMaterial(
                                                        [new THREE.MeshLambertMaterial({color: 0xAAAAAA, emissive: 0x444444}),
                                                        new THREE.MeshLambertMaterial({color: 0x7C3D09}),
                                                        new THREE.MeshLambertMaterial({color: 0xFF0000, side: THREE.DoubleSide})]);	
        this.materialSets[2].materials.windmill = new THREE.MeshFaceMaterial(
                                                        [new THREE.MeshLambertMaterial({color: 0xF6CBA7, side: THREE.DoubleSide}),
                                                        new THREE.MeshLambertMaterial({color: 0xF6F2A7}),
                                                        new THREE.MeshLambertMaterial({color: 0xFF0000, emissive: 0x550000, side: THREE.DoubleSide})]);	


}

ci.prototype.initMenuBackground = function(){
	this.menuBackground = new THREE.Object3D();

	var sides = 20;
	var radius = 500;
	var width = 2000;
	var height = 2 * radius * Math.sin(2 * Math.PI/(2 * sides));

	var treeLevel = new ciLevel(this, this.tileRadius);
	treeLevel.materialSetIndex = 0;
	var treeTile = new hexTile(0, 0);
	treeTile.sidePoints[0].y = 10;
	treeTile.sidePoints[2].x = 7;
	treeTile.sidePoints[2].y = -7;
	treeTile.sidePoints[4].x = -7;
	treeTile.sidePoints[4].y = -7;
	var menuBackgroundGeometry = new THREE.Geometry();

	var groundGeometry = new THREE.CylinderGeometry(radius, radius, width, 20, 1, true);
	for(var i in groundGeometry.faces){ groundGeometry.faces[i].materialIndex = 2;}
	var groundMesh = new THREE.Mesh(groundGeometry);
	groundMesh.rotation.z = Math.PI/2;
	THREE.GeometryUtils.merge(menuBackgroundGeometry, groundMesh);

	var treeMesh = null;
	for(var i = 1; i <= sides * 2; i++){
		treeMesh = treeLevel.getTreeMesh(treeTile , 50, 25, 2, 0.4, 15, 4);
		treeMesh.rotation.x = (Math.random() - 0.5) * 2 * Math.PI;
		treeMesh.position.z = Math.cos(treeMesh.rotation.x) * radius * 0.95;
		treeMesh.position.y = -1 * Math.sin(treeMesh.rotation.x) * radius * 0.95;
		treeMesh.position.x = (Math.random() - 0.5) * width / 2;
		THREE.GeometryUtils.merge(menuBackgroundGeometry, treeMesh);
	}

	menuBackgroundGeometry.computeFaceNormals();

        var treeMaterial = new THREE.MeshFaceMaterial(
                                                        [new THREE.MeshLambertMaterial({color: 0x7C3D09}),
                                                        new THREE.MeshLambertMaterial({color: 0x47B404}),
                                                        new THREE.MeshLambertMaterial({color: 0x5ED100})]);	
	var menuBackgroundMesh = new THREE.Mesh(menuBackgroundGeometry, treeMaterial);
	menuBackgroundMesh.position.y = -0.8 * radius;
	this.menuBackground.add(menuBackgroundMesh);

	var skyMesh = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000, 1, 1), new THREE.MeshLambertMaterial({color: 0xEBB2B2}));
	skyMesh.position.z = -400;
	this.menuBackground.add(skyMesh);

	var textGeometry = new THREE.TextGeometry("CONSTRUCT", { size: 20, height: 3, curveSegments: 1, font: "crystal", weight: "normal", style: "italic", bevelEnabled: true, bevelThickness: 2, bevelSize: 1 });
	var menuTextLine1 = new THREE.Mesh(textGeometry, new THREE.MeshNormalMaterial());
	var textGeometry = new THREE.TextGeometry("INVADERS", { size: 20, height: 3, curveSegments: 1, font: "crystal", weight: "normal", style: "italic", bevelEnabled: true, bevelThickness: 2, bevelSize: 1 });
	var menuTextLine2 = new THREE.Mesh(textGeometry, new THREE.MeshNormalMaterial());
	menuTextLine1.position.set(-60, 20, 0);
	menuTextLine2.position.set(-20, -20, 0);
	this.menuBackground.add(menuTextLine1);
	this.menuBackground.add(menuTextLine2);
}

ci.prototype.initSounds = function(){
	this.sounds = {};
	this.sounds["cannon"] = document.getElementById("audio_cannon");
	this.sounds["gun"] = document.getElementById("audio_gun");
	this.sounds["buzz"] = document.getElementById("audio_buzz");
	this.sounds["laser"] = document.getElementById("audio_laser");
	this.sounds["pop"] = document.getElementById("audio_pop");
	this.sounds["gameover"] = document.getElementById("audio_gameover");
	this.sounds["denied"] = document.getElementById("audio_denied");
	this.sounds["upgrade"] = document.getElementById("audio_upgrade");
	this.sounds["nextwave"] = document.getElementById("audio_nextwave");
	this.sounds["spark"] = document.getElementById("audio_spark");
	this.sounds["victory"] = document.getElementById("audio_victory");
	this.sounds["menu_music"] = document.getElementById("audio_menu_music");
}

ci.prototype.playSound = function(soundString){
	if(this.playSounds){
		this.sounds[soundString].currentTime = 0;
		this.sounds[soundString].play();
	}
}

ci.prototype.toggleMenuBackground = function(onOffSwitch){
	if(onOffSwitch === undefined){
		if($.inArray(this.menuBackground, this.threeObjects.scene.children) == -1){
			onOffSwitch = true;
		}else{
			onOffSwitch = false;
		}
	}
	if(onOffSwitch){
		this.cameraDistance = 700;
		this.theta = 0;
		this.tilt = 1;
		this.cameraAimPoint.x = 0;
		this.cameraAimPoint.y = 0;
		this.cameraAimPoint.z = 0;
		this.updateCamera();
		this.threeObjects.scene.add(this.menuBackground);
	}else{
		this.threeObjects.scene.remove(this.menuBackground);
		this.threeObjects.ambientLight.color.setRGB(0.15, 0.15, 0.15);
	}
}

ci.prototype.toggleStats = function(onOffSwitch){
	if(onOffSwitch === undefined) onOffSwitch = !this.showStats;
	if(onOffSwitch){
		$(this.stats.domElement).toggle(true);
		this.showStats = true;
	}else{
		$(this.stats.domElement).toggle(false);
		this.showStats = false;
	}
}

ci.prototype.initEndingDivs = function(){
	var html = "<h2>Game Over</h2>";
	html += "<button class='button' onclick='" + this.JSName + ".restartLevel(false);'>Restart Level</button><BR>";
	html += "<button class='button' onclick='" + this.JSName + ".restartLevel(true);'>Restart Level (skip story)</button><BR>";
	html += "<button class='button' onclick='" + this.JSName + ".backToMenu();'>Back to Menu</button>";
	$('#gameOverDiv .contentDiv').empty().append(html);

	html = "<h2>Level Complete</h2>";
	html += "<span id='victoryDivText'></span><br>";
	html += "<button id='nextLevelButton' class='button' onclick='" + this.JSName + ".startNextLevel()'>Next Level</button>";
	$('#victoryDiv .contentDiv').empty().append(html);
}

ci.prototype.initCustomGameDiv = function(){
	var html = "<H2>Custom Game</H2><br>";
	html += "<table><tr><td>Map: </td><td>";
	html += "<select id='mapSelect'>";
	for(var i = this.maps.length - 1; i >= 0; i--){
		html += "<option value='" + i + "'>" + this.maps[i].name + "</option>";
	}
	html += "</select>";
	html += "<BR><textarea id='userMapTextarea' placeholder='Custom Map JSON'></textarea>";
	html += "<button class='button' onClick=\"$('#mapeditorInstructionsDiv').toggle(true);$('#customGameDiv').toggle(false);\">?</button>";
	html += "</td></tr><tr><td>Colors: </td><td>";
	html += "<select id='materialSetSelect'>";
	for(var i in this.materialSets){
		html += "<option value='" + i + "'>" + this.materialSets[i].name + "</option>";
	}
	html += "</select>";
	html += "</td></tr><tr><td>Waves: </td><td>";
	html += "<select id='waveSetSelect'>";
	for(var i in this.waveSets){
		html += "<option value='" + i + "'>" + this.waveSets[i].name + "</option>";
	}
	html += "</select>";
	html += "</td></tr><tr><td>Seconds / Wave: </td><td><select id='timeBetweenWavesSelect'>";
	for(var i = 61; i > 10; i--){
		html += "<option value='" + i + "'";
		if(i == 31) html += " selected";
		html += ">" + (i - 1) + "</option>";
	}
	html += "</td></tr><tr><td>Towers: </td><td><select id='allowedTowersSetSelect'>";
	for(var i in this.allowedTowersSets){
		html += "<option value='" + i + "'>" + this.allowedTowersSets[i].name + "</option>";
	}
	html += "</select>";
	html += "</td></tr><tr><td>Starting Energy: </td><td><select id='startingEnergySelect'>";
	html += "<option value='50'>Insane (50)</option>";
	html += "<option value='100' selected>Normal (100)</option>";
	html += "<option value='200'>Easy (200)</option>";
	html += "<option value='500'>'.-| (500)</option>";
	html += "</select>";
	html += "</td></tr><tr><td colspan='2'>";
	html += "<button class='button' onClick=\"$('#customGameDiv').toggle(false);$('#menuDiv').toggle(true);\">Back</button>";
	html += "<button id='startCustomGameButton' class='button' onClick='" + this.JSName + ".startCustomGame();'>Start</button>";
	html += "</td></tr></table>";
	$('#customGameDiv .contentDiv').empty().append(html);

	html = "<h2>Using the Map Editor</h2>";
	html += "<img src='images/mapEditorInstructions.png'><br>";
	html += "Once you have designed a map, turn it into a Construct Invaders level by adding game entities. The game entity values recognized by Construct Invaders are: 0: Border, 1: Player home, 2-5: Construct spawn ponts, 6-9: Trees, 10: Fire hydrant, 11: Mailbox.";
	html += "<br><a href='http://errorsfordays.github.com/basic-hex-map-editor/' target='_blank'>Open map editor in a new window</a><br>";
	html += "<button class='button' onClick=\"$('#mapeditorInstructionsDiv').toggle(false);$('#customGameDiv').toggle(true);\">Back</button>";
	$('#mapeditorInstructionsDiv .contentDiv').empty().append(html);
}

ci.prototype.initSettingsDiv = function(){
	var html = "<h2>PAUSED</h2>";
	html += "<button class='button' onclick='" + this.JSName + ".backToMenu();'>Quit to Menu</button><br>";
	html += "<button class='button' onclick='" + this.JSName + ".restartLevel();'>Restart Level</button><br>";
	if(this.isAnaglyphToggled){
		html += "<button class='button' onclick='" + this.JSName + ".isAnaglyphToggled = false; " + this.JSName + ".initSettingsDiv();'>Anaglyph 3D: ON</button><br>";
	}else{
		html += "<button class='button' onclick='" + this.JSName + ".isAnaglyphToggled = true; " + this.JSName + ".initSettingsDiv();'>Anaglyph 3D: OFF</button><br>";
	}
	if(this.playSounds){
		html += "<button class='button' onclick='" + this.JSName + ".playSounds = false; " + this.JSName + ".initSettingsDiv();'>Sounds: ON</button><br>";
	}else{
		html += "<button class='button' onclick='" + this.JSName + ".playSounds = true; " + this.JSName + ".initSettingsDiv();'>Sounds: OFF</button><br>";
	}
	if(this.playMusic){
		html += "<button class='button' onclick='" + this.JSName + ".playMusic = false; " + this.JSName + ".initSettingsDiv();'>Music: ON</button><br>";
	}else{
		html += "<button class='button' onclick='" + this.JSName + ".playMusic = true; " + this.JSName + ".initSettingsDiv();'>Music: OFF</button><br>";
	}
	if(this.showStats){
		html += "<button class='button' onclick='" + this.JSName + ".toggleStats(); " + this.JSName + ".initSettingsDiv();'>Show FPS: ON</button><br>";
	}else{
		html += "<button class='button' onclick='" + this.JSName + ".toggleStats(); " + this.JSName + ".initSettingsDiv();'>Show FPS: OFF</button><br>";
	}
		
	html += "<button class='button' onclick='" + this.JSName + ".hideSettings();'>Resume</button>";
	$('#settingsDiv .contentDiv').empty().append(html);
}

ci.prototype.initWaves = function(){
	this.waveSets = [];
	this.waveSets.push({name: "Story Tutorial", waves: []});
	this.waveSets[0].waves.push({spawnIndex: 0, separation: 1.5, mobs:  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]});
	this.waveSets[0].waves.push({spawnIndex: 0, separation: 1.2, mobs:  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ,0 ,0]});
	this.waveSets[0].waves.push({spawnIndex: 0, mobs:  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ,0 ,0]});
	this.waveSets[0].waves.push({spawnIndex: 0, mobs:  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ,0 ,0 , 0]});
	this.waveSets[0].waves.push({spawnIndex: 0, mobs:  [5, 5, 5, 5]});
	this.waveSets[0].waves.push({spawnIndex: 0, mobs:  [5, 5, 5, 5, 5, 5, 5]});
	this.waveSets[0].waves.push({spawnIndex: 0, mobs:  [0, 0, 0, 5, 5, 5, 0, 0, 0, 5, 5, 5, 0, 0, 5, 5]});
	this.waveSets.push({name: "Story Short", waves: this.waveSets[0].waves.slice(0)});
	this.waveSets[1].waves.push({spawnIndex: 0, mobs:  [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5]});
	this.waveSets[1].waves.push({spawnIndex: 0, separation: 0.8, mobs:  [0, 0, 0, 5, 5, 5, 0, 0, 0, 5, 5, 5, 0, 0, 0, 5, 5, 5]});
	this.waveSets[1].waves.push({spawnIndex: 0, separation: 0.8, mobs:  [0, 0, 0, 5, 5, 5, 0, 0, 0, 5, 5, 5, 0, 0, 0, 5, 5, 5]});
	this.waveSets[1].waves.push({spawnIndex: 0, separation: 5, mobs:  [1, 1, 1, 1]});
	//10
	this.waveSets[1].waves.push({spawnIndex: 1, separation: 4, mobs:  [1, 1, 1, 1, 1]});
	this.waveSets[1].waves.push({spawnIndex: 1, separation: 3, mobs:  [1, 1, 1, 1, 1]});
	this.waveSets[1].waves.push({spawnIndex: 1, separation: 0.8, mobs:  [0, 0, 0, 5, 5, 5, 1, 0, 0, 0, 5, 5, 5, 1, 0, 0, 0, 5, 5, 5, 1]});
	this.waveSets[1].waves.push({spawnIndex: 1, separation: 3, mobs:  [1, 1, 1, 1, 1, 1, 1]});
	this.waveSets[1].waves.push({spawnIndex: 1, separation: 3, mobs:  [1, 1, 1, 1, 1, 1, 1, 1]});
	this.waveSets[1].waves.push({spawnIndex: 1, separation: 3, mobs:  [1, 1, 1, 1, 1, 1, 1, 1, 1]});
	this.waveSets[1].waves.push({spawnIndex: 2, mobs:  [1, 0, 5, 0, 1, 0, 5, 0, 1, 0, 5, 0, 1, 0, 5, 0, 1, 0, 5, 0, 0, 5, 0]});
	this.waveSets[1].waves.push({spawnIndex: 2, separation: 0.8, mobs:  [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 5, 0, 0, 5, 0, 0]});
	this.waveSets[1].waves.push({spawnIndex: 2, mobs: [2]});
	this.waveSets[1].waves.push({spawnIndex: 2, separation: 0.5, mobs:  [5, 1, 0, 0, 1, 0, 0, 5, 1, 0, 0, 1, 0, 0, 5, 1, 0, 0, 5, 0, 0, 5, 0, 0]});
	this.waveSets[1].waves.push({spawnIndex: 2, mobs: [1, 1, 2]});
	this.waveSets.push({name: "Story Medium", waves: this.waveSets[1].waves.slice(0)});
	//20
	this.waveSets[2].waves.push({spawnIndex: -1, mobs: [5, 5, 5, 1, 1, 2]});
	this.waveSets[2].waves.push({spawnIndex: -1, mobs: [5, 5, 5, 1, 1, 1, 1, 2]});
	this.waveSets[2].waves.push({spawnIndex: -1, mobs: [5, 5, 5, 1, 1, 6, 2]});
	this.waveSets[2].waves.push({spawnIndex: -1, mobs: [6, 1, 6, 1, 2]});
	this.waveSets[2].waves.push({spawnIndex: -1, separation: 0.8, mobs:  [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 2]});
	this.waveSets[2].waves.push({spawnIndex: -1, separation: 3, mobs: [6, 6, 1, 6, 6, 1, 6]});
	this.waveSets[2].waves.push({spawnIndex: -1, separation: 0.8, mobs:  [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 5, 0, 0, 2]});
	this.waveSets[2].waves.push({spawnIndex: -1, separation: 8, mobs: [2, 5, 5, 5, 5, 5, 5, 5, 5, 2]});
	this.waveSets[2].waves.push({spawnIndex: -1, separation: 3, mobs: [6, 6, 6, 6, 6, 6, 6]});
	this.waveSets[2].waves.push({spawnIndex: -1, separation: 1.5, mobs: [6, 6, 6, 6, 6, 6, 6, 6]});
	//30
	this.waveSets[2].waves.push({spawnIndex: -1, separation: 1.5, mobs: [6, 6, 6, 6, 6, 6, 6, 6, 6]});
	this.waveSets[2].waves.push({spawnIndex: -1, separation: 5, mobs: [1, 1, 2, 1, 1, 2, 1, 1]});
	this.waveSets[2].waves.push({spawnIndex: -1, separation: 4, mobs: [1, 1, 2, 1, 1, 2, 1, 1, 1, 1]});
	this.waveSets[2].waves.push({spawnIndex: -1, mobs: [6, 1, 6, 1, 6, 1, 6, 1, 6, 1, 6, 1]});
	this.waveSets[2].waves.push({spawnIndex: -1, mobs: [6, 1, 6, 1, 6, 1, 6, 1, 6, 1, 6, 1, 6, 1, 6]});
	this.waveSets[2].waves.push({spawnIndex: -1, mobs: [3]});
	this.waveSets.push({name: "Story Long", waves: this.waveSets[2].waves.slice(0)});
	this.waveSets[3].waves.push({spawnIndex: -1, mobs: [6, 6, 6, 1, 6, 6, 6, 1, 6, 6, 6, 6, 1, 1, 1]});
	this.waveSets[3].waves.push({spawnIndex: -1, mobs: [3, 6, 6]});
	this.waveSets[3].waves.push({spawnIndex: -1, mobs: [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 1, 1, 1, 1, 1, 1, 1]});
	this.waveSets[3].waves.push({spawnIndex: -1, mobs: [3, 6, 6, 1, 1]});
	this.waveSets[3].waves.push({spawnIndex: -1, separation: 2, mobs: [6, 6, 6, 7, 6, 6, 6]});
	this.waveSets[3].waves.push({spawnIndex: -1, separation: 2, mobs: [6, 6, 3, 6, 6, 6]});
	this.waveSets[3].waves.push({spawnIndex: -1, separation: 8, mobs: [7, 7]});
	this.waveSets[3].waves.push({spawnIndex: -1, separation: 8, mobs: [7, 7, 6]});
	this.waveSets[3].waves.push({spawnIndex: -1, separation: 2, mobs: [7, 6, 6, 7, 6, 6]});
	this.waveSets[3].waves.push({spawnIndex: -1, separation: 6, mobs: [7, 7, 7]});
	this.waveSets[3].waves.push({spawnIndex: -1, separation: 1.5, mobs: [7, 2, 2, 2, 2, 7]});
	this.waveSets[3].waves.push({spawnIndex: -1, mobs: [6, 6, 7, 2, 2, 2, 2, 7, 6, 6]});
	this.waveSets[3].waves.push({spawnIndex: -1, separation: 8, mobs: [7, 2, 2, 2, 2, 7]});
	this.waveSets.push({name: "Story Final", waves: this.waveSets[3].waves.slice(0)});
	this.waveSets[4].waves.push({spawnIndex: -1, separation: 6, mobs: [7, 3, 7]});
	this.waveSets[4].waves.push({spawnIndex: -1, separation: 4, mobs: [7, 3, 7, 7]});
	this.waveSets[4].waves.push({spawnIndex: -1, mobs: [7, 2, 2, 7, 2, 2, 7, 2, 2]});
	this.waveSets[4].waves.push({spawnIndex: -1, separation: 3, mobs: [4]});
	this.waveSets[4].waves.push({spawnIndex: -1, separation: 3, mobs: [8]});
	this.waveSets[4].waves.push({spawnIndex: -1, separation: 3, mobs: [4]});
	this.waveSets[4].waves.push({spawnIndex: -1, separation: 6, mobs: [7, 7, 8]});
	this.waveSets[4].waves.push({spawnIndex: -1, separation: 3, mobs: [4, 2, 2, 3]});
	this.waveSets[4].waves.push({spawnIndex: -1, separation: 3, mobs: [7, 7, 8]});
	this.waveSets[4].waves.push({spawnIndex: -1, mobs: [6, 6, 7, 6, 6, 7, 6, 6, 7, 8]});
	this.waveSets[4].waves.push({spawnIndex: -1, separation: 3, mobs: [2, 2, 3, 3, 3, 4]});
	this.waveSets[4].waves.push({spawnIndex: -1, separation: 3, mobs: [9]});

	this.waveSets.push({name: "Random Mix 50", waves: this.makeRandomWaves(25, 1.06, 50, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9])});
	this.waveSets.push({name: "Random Mix 100", waves: this.makeRandomWaves(25, 1.06, 100, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9])});
	this.waveSets.push({name: "Random Triangle 50", waves: this.makeRandomWaves(25, 1.06, 50, [0, 1, 2, 3, 4])});
	this.waveSets.push({name: "Random Triangle 100", waves: this.makeRandomWaves(25, 1.06, 100, [0, 1, 2, 3, 4])});
	this.waveSets.push({name: "Random Square 50", waves: this.makeRandomWaves(25, 1.06, 50, [5, 6, 7, 8, 9])});
	this.waveSets.push({name: "Random Square 100", waves: this.makeRandomWaves(25, 1.06, 100, [5, 6, 7, 8, 9])});
	this.waveSets.push({name: "Extreme Mix 50", waves: this.makeRandomWaves(25, 1.09, 50, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9])});
	this.waveSets.push({name: "Extreme Mix 100", waves: this.makeRandomWaves(25, 1.09, 100, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9])});
	this.waveSets.push({name: "Extreme Triangle 50", waves: this.makeRandomWaves(25, 1.09, 50, [0, 1, 2, 3, 4])});
	this.waveSets.push({name: "Extreme Triangle 100", waves: this.makeRandomWaves(25, 1.09, 100, [0, 1, 2, 3, 4])});
	this.waveSets.push({name: "Extreme Square 50", waves: this.makeRandomWaves(25, 1.09, 50, [5, 6, 7, 8, 9])});
	this.waveSets.push({name: "Extreme Square 100", waves: this.makeRandomWaves(25, 1.09, 100, [5, 6, 7, 8, 9])});
}

ci.prototype.makeRandomWaves = function(difficulty, increase, numberOfWaves, validMobs){
	var randomWaves = [];
	var difficultyRemaining = 0;
	for(i = 0; i < numberOfWaves; i++){
		var mobsToChoose = validMobs.slice(0);
		difficulty *= increase;
		difficultyRemaining = difficulty;
		randomWaves[i] = {spawnIndex: -1, mobs: []};
		while(difficultyRemaining >= ciMob.prototype.MOB_INFO[validMobs[0]].difficulty){
			var mobIndex = Math.floor(Math.random() * mobsToChoose.length);
			if(ciMob.prototype.MOB_INFO[mobsToChoose[mobIndex]].difficulty < difficultyRemaining){
				randomWaves[i].mobs.push(mobsToChoose[mobIndex]);
				difficultyRemaining -= ciMob.prototype.MOB_INFO[mobsToChoose[mobIndex]].difficulty;
			}else{
				mobsToChoose.splice(mobIndex, 1);
			}
		}
	}
	return randomWaves;
}

ci.prototype.start = function(){
	$('#menuDiv').toggle();
	this.sounds["menu_music"].pause();
	
	this.toggleMenuBackground(false);
	this.currentState = this.GAME_STATES.STORY;
	this.level = new ciLevel(this, this.tileRadius, this.nextLevelObject);
}

ci.prototype.showCustomGameDiv = function(){
	$('#menuDiv').toggle(false);
	$('#customGameDiv').toggle(true);
}

ci.prototype.hideCustomGameDiv = function(){
	$('#menuDiv').toggle(true);
	$('#customGameDiv').toggle(false);
}

ci.prototype.showCreditsDiv = function(){
	$('#menuDiv').toggle(false);
	$('#creditsDiv').toggle(true);
}

ci.prototype.hideCreditsDiv = function(){
	$('#menuDiv').toggle(true);
	$('#creditsDiv').toggle(false);
}

ci.prototype.startNextLevel = function(){
	if(this.level.nextLevelIndex == -1){
		this.backToMenu();
	}else{
		$('#victoryDiv').toggle(false);
		this.nextLevelObject = levels[this.level.nextLevelIndex];
		this.level.destroy();
		this.level = null;
		this.currentState = this.GAME_STATES.STORY;
		this.level = new ciLevel(this, this.tileRadius, this.nextLevelObject);
	}
}

ci.prototype.tick = function(){
	this.time = Date.now();
	this.timeDelta = this.time - this.lastTime;
	this.lastTime = this.time;
	if(this.timeDelta > this.tickTimelimit) this.timeDelta = this.tickTimelimit;
	var time = this.time;
	var timeDelta = this.timeDelta;
	var MOB_TYPES = null;

	switch(this.currentState){
		case this.GAME_STATES.PLAY:	
			var spawningMobs = this.level.spawningMobs;
			for(var i in spawningMobs){
				if((time - spawningMobs[i].lastSpawnTime)/1000 > spawningMobs[i].separation){
					if(MOB_TYPES === null) MOB_TYPES = ciMob.prototype.MOB_TYPES;
					switch(spawningMobs[i].mobs.shift()){
						case MOB_TYPES.TRIANGLE:
							new ciTriangleMob(this, this.level.spawnTiles[spawningMobs[i].spawnIndex]);
							break;
						case MOB_TYPES.TETRAHEDRON:
							new ciTetrahedronMob(this, this.level.spawnTiles[spawningMobs[i].spawnIndex]);
							break;
						case MOB_TYPES.OCTAHEDRON:	
							new ciOctahedronMob(this, this.level.spawnTiles[spawningMobs[i].spawnIndex]);
							break;
						case MOB_TYPES.ICOSAHEDRON:	
							new ciIcosahedronMob(this, this.level.spawnTiles[spawningMobs[i].spawnIndex]);
							break;
						case MOB_TYPES.SPHERE:
							new ciSphereMob(this, this.level.spawnTiles[spawningMobs[i].spawnIndex]);
							break;
						case MOB_TYPES.SQUARE:
							new ciSquareMob(this, this.level.spawnTiles[spawningMobs[i].spawnIndex]);
							break;
						case MOB_TYPES.CUBE:
							new ciCubeMob(this, this.level.spawnTiles[spawningMobs[i].spawnIndex]);
							break;
						case MOB_TYPES.SUPERCUBE:
							new ciSupercubeMob(this, this.level.spawnTiles[spawningMobs[i].spawnIndex]);
							break;
						case MOB_TYPES.MEGACUBE:
							new ciMegacubeMob(this, this.level.spawnTiles[spawningMobs[i].spawnIndex]);
							break;
						case MOB_TYPES.HYPERCUBE:
							new ciHypercubeMob(this, this.level.spawnTiles[spawningMobs[i].spawnIndex]);
							break;
					}
					if(spawningMobs[i].mobs.length == 0){
						spawningMobs.splice(i, 1);
					}else{
						spawningMobs[i].lastSpawnTime += spawningMobs[i].separation * 1000;
					}
				}
			}
			var projectiles = ciProjectile.prototype.projectiles;
			for(var i in projectiles){
				projectiles[i].move(timeDelta);
			}
			var towers = ciTower.prototype.towers;
			for(var i in towers){
				var tower = towers[i];
				tower.timeSinceLastFire += timeDelta;
				if(tower.targetingMethod == null) continue;
				tower.track(time, timeDelta);
				if(tower.target != null && tower.onTarget){
					if(tower.target !== tower && (tower.target.destroyed || tower.position.distanceTo(tower.target.mesh.position) > tower.range)){
						tower.target = null;
						tower.onTarget = false;
						continue;
					}else if(tower.timeSinceLastFire > tower.rateOfFire * 1000){
						tower.fire(time, timeDelta);
					}
				}else{
					tower.findTarget();
				}
			}
			var mobs = ciMob.prototype.mobs;
			if(!this.level.allWavesAreOut){
				this.level.timeToNextWave -= timeDelta/1000;
				if(this.level.timeToNextWave < 0) this.level.startNextWave();
				var calculatedDisplayTime = Math.floor(this.level.timeToNextWave);
				if(calculatedDisplayTime < this.level.displayTimeToNextWave && this.level.timeToNextWave > 0){
					this.level.displayTimeToNextWave = calculatedDisplayTime;
					this.hudWaveTimerJQO.empty().append("Wave " + (this.level.nextWave + 1) + " of " + this.level.waves.length + " in: " + this.level.displayTimeToNextWave + " <span class='keyboard'>SPACE</span>");
				}
			}else if(this.level.spawningMobs.length == 0 && mobs.length == 0){
				this.currentState = this.GAME_STATES.GAME_OVER;
				this.unselectSelectedItem();
				var totalKills = 0;
				var topKillTower = null;
				for(var i in towers){
					if(topKillTower == null || topKillTower.kills < towers[i].kills) topKillTower = towers[i];
					totalKills += towers[i].kills;
				}
				var html = "Top tower: " + topKillTower.INFO.title + "<br>with " + topKillTower.kills + " kills.<br>";
				html += "Total kills all towers: " + totalKills + "<br>";
				if(this.level.nextLevelIndex == -1){
					$('#victoryDivText').empty().append("The End.<br>" + html);
					$('#nextLevelButton').empty().append("Back to menu.");
				}else{
					$('#victoryDivText').empty().append(html);
					$('#nextLevelButton').empty().append("Continue to next level: " + levels[this.level.nextLevelIndex].name);
				}
				$('#victoryDiv').toggle(true);
				this.sounds["victory"].play();
			}
			if(mobs.length > 0){
				for(var i = mobs.length - 1; i >= 0; i--){
					mobs[i].moveTime += timeDelta;
					if(mobs[i].empSparks.length > 0 && mobs[i].hp > 1 && time - mobs[i].sparkTimer > 1000){
						if(!mobs[i].ouchAmIDead(1, true)){
							mobs[i].empSparks[0].destroy();
							mobs[i].sparkTimer = time;
						}
					}
				}
			}
			if(mobs.length > 0){
				var nextMob = this.nextMobToMoveIndex;
				while(mobs[nextMob] == null || mobs[nextMob] === undefined){
					nextMob--;
					if(nextMob < 0) nextMob = mobs.length -1;
				}

				while(mobs[nextMob].moveTime != 0 && Date.now() - time < 32){
					if(mobs[nextMob].moveTime > 0) mobs[nextMob].move(mobs[nextMob].moveTime);
					nextMob--;
					if(nextMob < 0) nextMob = mobs.length -1;
					if(nextMob < 0) break;
					while(mobs[nextMob] == null || mobs[nextMob] === undefined){
						nextMob--;
						if(nextMob < 0) nextMob = mobs.length -1;
					}
				}
				this.nextMobToMoveIndex = nextMob;
			}
			var sparks = ciEmpSpark.prototype.empSparks;
			if(sparks.length > 0){
				this.level.particleSystem.material.color.g = 0.15 + 0.85 * Math.sin(time/100);
				this.level.particleSystem.material.color.b = 0.9 + 0.1 * Math.sin(time/100);
				if(timeDelta < this.tickTimelimit){
					for(var i in sparks){
						sparks[i].moveTime += timeDelta;
						sparks[i].move();
					}
				}else{
					for(var i in sparks){
						sparks[i].moveTime += timeDelta;
					}
				}
			}
		case this.GAME_STATES.SETUP:
				if(this.isShiftDown && this.materialSets[this.level.materialSetIndex].materials.range2.opacity < 0.5){
					this.materialSets[this.level.materialSetIndex].materials.range2.opacity += timeDelta/1000;;
				}
				this.selectedItemMarkupMesh.rotation.z += timeDelta/2000;
				this.selectedItemMarkupMesh.rotation.y = 0.1 * Math.sin(time/200);
				this.selectedItemMarkupMesh.rotation.x = 0.1 * Math.cos(time/200);
				if(this.isCameraRotating){
					if(Math.round(this.cameraRotationMultiplier * (this.mouse2D.x - this.dragStart.x)) != 0 ||
						Math.round(this.cameraTiltMultiplier * (this.mouse2D.y - this.dragStart.y)) != 0){
						this.tilt -= this.cameraTiltMultiplier * (this.mouse2D.y - this.dragStart.y);
						this.theta += this.cameraRotationMultiplier * (this.mouse2D.x - this.dragStart.x);
						this.moveCamera();
						this.dragStart.x = this.mouse2D.x;
						this.dragStart.y = this.mouse2D.y;
					}
				}else if(this.isCameraMoving){
					var xD = this.cameraMovementMultiplier * this.cameraDistance *
							(this.mouse2D.x - this.dragStart.x);
					var yD = this.cameraMovementMultiplier * this.cameraDistance *
							(this.mouse2D.y - this.dragStart.y);
					if((this.dontClickMeBro && (Math.round(xD) != 0 || Math.round(yD) != 0)) ||
						(Math.abs(xD) > this.dragDelay || Math.abs(yD) > this.dragDelay)){
						this.dontClickMeBro = true;
						var angle = this.theta * Math.PI/180 + Math.PI;
						this.cameraAimPoint.x += xD * Math.cos(angle) - yD * Math.sin(angle);
						this.cameraAimPoint.y += xD * Math.sin(angle) + yD * Math.cos(angle);
						if(this.cameraAimPoint.x < this.level.bounds.lower.x){
							this.cameraAimPoint.x = this.level.bounds.lower.x;
						}else if(this.cameraAimPoint.x > this.level.bounds.upper.x){
							this.cameraAimPoint.x = this.level.bounds.upper.x;
						}
						if(this.cameraAimPoint.y < this.level.bounds.lower.y){
							this.cameraAimPoint.y = this.level.bounds.lower.y;
						}else if(this.cameraAimPoint.y > this.level.bounds.upper.y){
							this.cameraAimPoint.y = this.level.bounds.upper.y;
						}
						this.moveCamera();
						this.dragStart.x = this.mouse2D.x;
						this.dragStart.y = this.mouse2D.y;
					}
				}
				if(this.level.objectsToLoad.length > 0) this.level.continueLoading(10);
				break;
		case this.GAME_STATES.STORY:	
				if(this.level.rotateOnStory) this.theta += this.timeDelta/500;
				this.moveCamera();
				if(this.level.objectsToLoad !== undefined && this.level.objectsToLoad.length > 0) this.level.continueLoading(10);
				break;
		case this.GAME_STATES.MENU:
				var colorChange = 1 - Math.abs(Math.sin(time/3000));	
				this.threeObjects.ambientLight.color.setRGB(
						0.125 + colorChange*0.313,
						0.125 + colorChange*0.133,
						0.125 - colorChange*0.047);

				this.menuBackground.children[0].material.materials[0].color.setRGB(
						0.486 - colorChange*0.228,
						0.239 + colorChange*0.019,
						0.035 + colorChange*0.223);

				this.menuBackground.children[0].material.materials[1].color.setRGB(
						0.278 + colorChange*0.081,
						0.706 - colorChange*0.347,
						0.016 + colorChange*0.343);

				this.menuBackground.children[0].material.materials[2].color.setRGB(
						0.369 + colorChange*0.041,
						0.820 - colorChange*0.41,
						colorChange*0.41);
						

				this.menuBackground.children[0].rotation.x += timeDelta/15000;
				this.menuBackground.children[2].position.z = 500 + 50*Math.sin(this.time/1000);
				this.menuBackground.children[3].position.z = this.menuBackground.children[2].position.z;
				this.menuBackground.children[3].rotation.x = 0.06 - 0.1 * (Math.PI + 4 * Math.sin(time/1000) - Math.cos(time/1000));
				this.menuBackground.children[2].rotation.x = -0.06 + 0.12 * (Math.PI + 4 * Math.sin(time/1000) - Math.cos(time/1000));
				if(this.playMusic) this.sounds["menu_music"].play();
				break;
	}

	if(this.showStats) this.stats.update();
}

ci.prototype.animate = function(){
	document.game.tick();

	if(document.game.isAnaglyphToggled){
		document.game.threeObjects.effect.render(document.game.threeObjects.scene, document.game.threeObjects.camera);
	}else{
		document.game.threeObjects.renderer.render(document.game.threeObjects.scene, document.game.threeObjects.camera);
	}
	window.requestAnimationFrame(document.game.animate);
}

ci.prototype.showSettings = function(event){
	$('#settingsDiv').toggle(true);
	this.currentState = this.GAME_STATES.PAUSED;
}

ci.prototype.hideSettings = function(event){
	$('#settingsDiv').toggle(false);
	this.resume();
}

ci.prototype.resume = function(){
	if(this.level.nextWave == 0){
		this.currentState = this.GAME_STATES.SETUP;
	}else{
		this.currentState = this.GAME_STATES.PLAY;
		this.lastTime = Date.now();
		for(var i in this.level.spawningMobs){
			this.level.spawningMobs[i].lastSpawnTime = this.lastTime;
		}
	}
}

ci.prototype.onMouseMove = function(event){
	event.preventDefault();
	document.game.mouse2D.x = (event.clientX / window.innerWidth) * 2 - 1;
	document.game.mouse2D.y = - (event.clientY / window.innerHeight) * 2 + 1;
}

ci.prototype.getIntersects = function(){
	var vector = new THREE.Vector3(this.mouse2D.x, this.mouse2D.y, 0.5);
	this.threeObjects.projector.unprojectVector(vector, this.threeObjects.camera);
	var raycaster = new THREE.Raycaster(this.threeObjects.camera.position, vector.sub(this.threeObjects.camera.position).normalize());
	return raycaster.intersectObjects(this.threeObjects.scene.children, true);
}

ci.prototype.onMouseDoubleClick = function(event){
	var intersects = this.getIntersects();
	for(var i in intersects){
		return;
	}
}

ci.prototype.onMouseClick = function(event){
	if(!(this.currentState == this.GAME_STATES.SETUP || this.currentState == this.GAME_STATES.PLAY)) return;
	if(this.dontClickMeBro){
		this.dontClickMeBro = false;
		return;
	}
	for(var i = 0, j = this.clickIntersects.length; i < j; i++){
		if(i > 0 && this.clickIntersects[i].object === this.clickIntersects[i-1].object) continue;
		if(this.clickIntersects[i].object === this.level.mapMesh){
			var clickedTile = hexTile.prototype.getTileByPosition(this.clickIntersects[i].point, this.level.tileRadius);
			if(!(clickedTile == null || clickedTile.wall || clickedTile.pillar || clickedTile.gameEntity != null)){
				this.holoTower.setTile(clickedTile);
				this.holoTower.showBase();
				this.selectItem(this.holoTower);
			}
			break;
		}else{
			var tower = ciTower.prototype.getTowerByMesh(this.clickIntersects[i].object);
			if(tower != null){
				this.selectItem(tower);
				break;
			}
			var mob = ciMob.prototype.getMobByMesh(this.clickIntersects[i].object);
			if(mob != null){
				this.selectItem(mob);
				break;
			}
		}
	}
}

ci.prototype.onMouseDown = function(event){
	if(!(this.currentState == this.GAME_STATES.SETUP || this.currentState == this.GAME_STATES.PLAY)) return;
	if(event.which == 1){
		this.clickIntersects = this.getIntersects();
		this.isCameraMoving = true;
	}else if(event.which == 3){
		this.isCameraRotating = true;
		this.dontClickMeBro = true;
	}
	
	this.dragStart.x = this.mouse2D.x;
	this.dragStart.y = this.mouse2D.y;
}

ci.prototype.onMouseUp = function(event){
	this.isCameraRotating = false;
	this.isCameraMoving = false;
	this.isHeightDragging = false;
}

ci.prototype.onMouseWheel = function(event){
	this.cameraDistance = Math.min(this.maxCameraDistance, Math.max(50, this.cameraDistance + event.wheelDelta * this.cameraZoomMultiplier));
	this.updateCamera();
}

ci.prototype.moveCamera = function(){
	this.tilt = Math.min(75, Math.max(5, this.tilt));
	if(this.theta < 0){
		this.theta += 360;
	}else if(this.theta > 360){
		this.theta -= 360;
	}
	this.updateCamera();
}

ci.prototype.updateCamera = function(){
	var degToRad = Math.PI/180;
	var camZ = Math.cos(this.tilt * degToRad) * this.cameraDistance;
	var xyMultiplier = Math.sin(this.tilt * degToRad) * this.cameraDistance;
	var camX = Math.sin(this.theta * degToRad) * xyMultiplier;
	var camY = -1 * Math.cos(this.theta * degToRad) * xyMultiplier;
	
	camX += this.cameraAimPoint.x;
	camY += this.cameraAimPoint.y;

	this.threeObjects.camera.position.set(camX, camY, camZ);
	this.threeObjects.camera.lookAt(new THREE.Vector3(this.cameraAimPoint.x,
						this.cameraAimPoint.y,
						this.cameraAimPoint.z));
}

ci.prototype.onKeyDown = function(event){
	switch(event.keyCode){
		case 16: 	this.isShiftDown = true;
				if(this.selectedItem != null && this.selectedItem.rangeMesh !== undefined && this.selectedItem.rangeMesh != null) this.selectedItem.rangeMesh.visible = true;
				this.materialSets[this.level.materialSetIndex].materials.range2.opacity = 0;
				break;
		case 17: 	if(this.currentState == this.GAME_STATES.PLAY || this.currentState == this.GAME_STATES.SETUP){
					this.level.pathsMesh.position.set(0, 0, 0);
				}
				break;
		case 9:		//make tab work
				event.preventDefault();
				this.onKeyPress(event);
				break;
	}
}

ci.prototype.onKeyUp = function(event){
	switch(event.keyCode){
		case 16: 	this.isShiftDown = false;
				
				for(var i in ciTower.prototype.towers){
					if(ciTower.prototype.towers[i].rangeMesh != null && ciTower.prototype.towers[i].rangeMesh.visible == true) ciTower.prototype.towers[i].rangeMesh.visible = false;
				}
				break;
		case 17: 	if(this.currentState == this.GAME_STATES.PLAY || this.currentState == this.GAME_STATES.SETUP){
					this.level.pathsMesh.position.z = this.maxCameraDistance + 500;
				}
				break;
	}
}

ci.prototype.onKeyPress = function(event){
	switch(event.keyCode){
		case 49:
		case 97:	if(this.selectedItem != null){
					if(this.selectedItem.upgrades !== undefined){
						if(this.selectedItem.upgrades[0] != null){
							this.buyUpgrade(0);
						}else if(this.selectedItem.evolutions[0] != null){
							this.buyEvolution(0);
						}
					}
				}
				break;
		case 50:
		case 98:	if(this.selectedItem != null){
					if(this.selectedItem.upgrades !== undefined){
						if(this.selectedItem.upgrades[1] != null){
							this.buyUpgrade(1);
						}else if(this.selectedItem.evolutions[1] != null){
							this.buyEvolution(1);
						}
					}
				}
				break;
		case 51:
		case 99:	if(this.selectedItem != null){
					if(this.selectedItem.upgrades !== undefined){
						if(this.selectedItem.upgrades[0] != null && this.selectedItem.evolutions !== undefined && this.selectedItem.evolutions[0] != null){
							this.buyEvolution(0);
						}else if(this.selectedItem.evolutions !== undefined && this.selectedItem.evolutions[2] != null){
							this.buyEvolution(2);
						}
					}
				}
				break;
		case 52:
		case 100:	if(this.selectedItem != null){
					if(this.selectedItem.upgrades !== undefined){
						if(this.selectedItem.upgrades[0] != null && this.selectedItem.evolutions !== undefined && this.selectedItem.evolutions[1] != null){
							this.buyEvolution(1);
						}else if(this.selectedItem.evolutions !== undefined && this.selectedItem.evolutions[3] != null){
							this.buyEvolution(3);
						}
					}
				}
				break;
		case 53:
		case 101:	if(this.selectedItem != null){
					if(this.selectedItem.upgrades !== undefined){
						if(this.selectedItem.upgrades[0] != null && this.selectedItem.evolutions !== undefined && this.selectedItem.evolutions[2] != null){
							this.buyEvolution(2);
						}else if(this.selectedItem.evolutions !== undefined && this.selectedItem.evolutions[4] != null){
							this.buyEvolution(4);
						}
					}
				}
				break;
		case 54:
		case 102:	if(this.selectedItem != null){
					if(this.selectedItem.upgrades !== undefined){
						if(this.selectedItem.upgrades[0] != null && this.selectedItem.evolutions !== undefined && this.selectedItem.evolutions[3] != null){
							this.buyEvolution(3);
						}else if(this.selectedItem.evolutions !== undefined && this.selectedItem.evolutions[5] != null){
							this.buyEvolution(5);
						}
					}
				}
				break;
		case 32:	this.level.startNextWave();
				break;
		case 9:		this.toggleSelectedTowerTargetingMethod();
				break;
	}
}

ci.prototype.onWindowResize = function(event){
	this.threeObjects.camera.aspect = (window.innerWidth / window.innerHeight);
	this.threeObjects.camera.updateProjectionMatrix();
	this.threeObjects.renderer.setSize(window.innerWidth, window.innerHeight);
	$('#storyImageDiv').toggle().toggle();
}

ci.prototype.selectItem = function(item){
	if(item === this.selectedItem && item !== this.holoTower) return;
	if(this.selectedItem != null && this.selectedItem !== item) this.selectedItem.noLongerSelected();
	this.selectedItem = item;
	this.showSelectedItemInfo();
	this.selectedItemMarkupMesh.scale.set(1, 1, 1);
	this.selectedItemMarkupMesh.scale.multiplyScalar(this.selectedItem.radius/this.tileRadius);
	this.updateSelectedItemMarkupMeshPosition();
}

ci.prototype.updateSelectedItemMarkupMeshPosition = function(){
	if(this.selectedItem == null){
		this.selectedItemMarkupMesh.position.z = this.maxCameraDistance + 500;
	}else{
		this.selectedItemMarkupMesh.position.copy(this.selectedItem.position);
		this.selectedItemMarkupMesh.position.z += 15;
	}
}

ci.prototype.showSelectedItemInfo = function(){
	$('#selectedItemInfoDiv .contentDiv').empty().append(this.selectedItem.getInfo());
	$('#selectedItemInfoDiv').toggle(true);
	if(this.showSelectedItemDetail){
		$('#selectedItemInfoDetailDiv .contentDiv').empty().append(this.selectedItem.getInfoDetail());
		$('#selectedItemInfoDetailDiv').toggle(true);
	}else{
		$('#selectedItemInfoDetailDiv').toggle(false);
	}
}

ci.prototype.unselectSelectedItem = function(){
	if(this.selectedItem != null) this.selectedItem.noLongerSelected();
	this.selectedItem = null;
	this.updateSelectedItemMarkupMeshPosition();
	$('#selectedItemInfoDiv, #selectedItemInfoDetailDiv').toggle(false);
}

ci.prototype.addCash = function(amount){
	var refreshButtons = false;
	if(this.selectedItem != null && this.selectedItem.constructor == ciTower){
		var upgrades = this.selectedItem.upgrades;
		var evolutions = this.selectedItem.evolutions;
		if(amount > 0){
			for(var i in upgrades){
				if(upgrades[i].price > this.cash && upgrades[i].price <= this.cash + amount) refreshButtons = true;
			}
			for(var i in evolutions){
				if(this.selectedItem.TOWER_INFO[evolutions[i]].price > this.cash && this.selectedItem.TOWER_INFO[evolutions[i]].price <= this.cash + amount) refreshButtons = true;
			}
		}else{
			for(var i in upgrades){
				if(upgrades[i].price <= this.cash && upgrades[i].price > this.cash + amount) refreshButtons = true;
			}
			for(var i in evolutions){
				if(this.selectedItem.TOWER_INFO[evolutions[i]].price <= this.cash && this.selectedItem.TOWER_INFO[evolutions[i]].price > this.cash + amount) refreshButtons = true;
			}
		}
	}
	this.cash += amount;
	this.hudCashJQO.empty().append(Math.round(10*this.cash)/10);
	if(refreshButtons) $('#towerPurchaseButtons').empty().append(this.selectedItem.getTowerPurchaseButtons());
	if(this.cash < 0){
		this.currentState = this.GAME_STATES.GAME_OVER;
		this.unselectSelectedItem();
		$('#gameOverDiv').toggle(true);
		this.sounds["gameover"].play();
	}
}

ci.prototype.buyUpgrade = function(upgradeIndex){
	if(this.selectedItem != null && this.selectedItem.constructor == ciTower && this.cash >= this.selectedItem.upgrades[upgradeIndex].price){
		this.addCash(-1 * this.selectedItem.upgrade(upgradeIndex));
		this.showSelectedItemInfo();
	}
}

ci.prototype.buyEvolution = function(evolutionIndex){
	if(this.selectedItem != null && this.selectedItem.constructor == ciTower && this.cash >= this.selectedItem.TOWER_INFO[this.selectedItem.evolutions[evolutionIndex]].price){
		this.addCash(-1 * this.selectedItem.evolve(evolutionIndex));
		this.showSelectedItemInfo();
	}
}

ci.prototype.sellTower = function(){
	if(this.selectedItem != null && this.selectedItem.constructor == ciTower){
		this.addCash(this.selectedItem.totalPrice/2 - 10);
		this.selectedItem.destroy();
		this.unselectSelectedItem();
		this.level.calculatePathsToHomeBase();
	}
}

ci.prototype.toggleSelectedTowerTargetingMethod = function(){
	if(this.selectedItem.toggleTargetingMethod !== undefined) this.selectedItem.toggleTargetingMethod();
}

ci.prototype.restartLevel = function(skipStory){
	this.level.restart();
	$('#gameOverDiv, #settingsDiv').toggle(false);
	if(skipStory){
		this.level.hideStory();
		this.cameraAimPoint.x = 0;
		this.cameraAimPoint.y = 0;
		this.tilt = 5;
		this.updateCamera();
	}
}

ci.prototype.backToMenu = function(){
	this.level.destroy();
	this.level = null;
	
	this.theta = 0;
	this.tilt = 0;
	this.cameraDistance = 600;
	this.moveCamera();

	$('#gameOverDiv, #victoryDiv, #hudDiv, #settingsDiv').toggle(false);
	this.toggleMenuBackground(true);
	$('#menuDiv, #logoDiv').toggle(true);
	this.currentState = this.GAME_STATES.MENU;
}

ci.prototype.startCustomGame = function(){
	var customLevel = {};
	customLevel.name = "Custom Level";
	customLevel.nextLevelIndex = -1;
	customLevel.mapIndex = $('#mapSelect').val();
	if($('#userMapTextarea').val() != ""){
		customLevel.mapIndex = -1;
		var mapFromJson = $.parseJSON($('#userMapTextarea').val());
	}
	customLevel.materialSetIndex = $('#materialSetSelect').val();
	customLevel.waveSetIndex = $('#waveSetSelect').val();
	customLevel.timeBetweenWaves = $('#timeBetweenWavesSelect').val();
	customLevel.allowedTowers = this.allowedTowersSets[$('#allowedTowersSetSelect').val()].allowedTowers;
	customLevel.startingCash = parseInt($('#startingEnergySelect').val());
	customLevel.story = [{}];
	customLevel.story[0].rotateOnStory = true;
	customLevel.story[0].tilt = 30;
	customLevel.story[0].theta = 0;
	customLevel.story[0].cameraDistance = 2500;
	customLevel.story[0].color = "#2d7b80";
	customLevel.story[0].image = "images/instructions_web.svg";
	customLevel.story[0].text = "Custom Game: " + this.maps[customLevel.mapIndex].name + " - ";
	customLevel.story[0].text += customLevel.startingCash + "<img src='images/energy.png' class='energyImg'><br>";
	customLevel.story[0].text += "Waves: " + this.waveSets[customLevel.waveSetIndex].name + "(" + (customLevel.timeBetweenWaves - 1) + "sec). ";
	customLevel.story[0].text += this.allowedTowersSets[$('#allowedTowersSetSelect').val()].name + ".<br>";
	customLevel.story[0].choices = [{storyIndex: -1, text: "Start"}];
	
	$('#customGameDiv').toggle(false);
	this.sounds["menu_music"].pause();

	this.toggleMenuBackground(false);
	this.currentState = this.GAME_STATES.STORY;
	this.level = new ciLevel(this, this.tileRadius, customLevel);
	if(mapFromJson !== undefined) this.level.initMap(mapFromJson);
}
