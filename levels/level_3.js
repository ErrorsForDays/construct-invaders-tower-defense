levels[3] = {};

levels[3].name = "Crossroads";
levels[3].startingCash = 250;
levels[3].nextLevelIndex = 4;
levels[3].materialSetIndex = 0;
levels[3].timeBetweenWaves = 31;
levels[3].allowedTowers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13];
levels[3].waveSetIndex = 3;
levels[3].mapIndex = 3;
levels[3].story = [];
	
levels[3].story[0] = {};
levels[3].story[0].rotateOnStory = false;
levels[3].story[0].tilt =  60;
levels[3].story[0].theta = 0;
levels[3].story[0].offsetInTileRadiuses = {x: 500, y: 0};
levels[3].story[0].cameraDistance = 2000;
levels[3].story[0].color = "#2d7b80";
levels[3].story[0].image = "http://i.imgur.com/N0XRYT2.png";
levels[3].story[0].text = "No time to rest. Keep moving down the street.<br>We\'ll set up in the intersection.";
levels[3].story[0].choices = [{storyIndex: 1, text: "&rarr;"}];

levels[3].story[1] = {};
levels[3].story[1].rotateOnStory = true;
levels[3].story[1].offsetInTileRadiuses = {x: 10, y: 0};
levels[3].story[1].image = "http://i.imgur.com/N0XRYT2.png";
levels[3].story[1].text = "We\'ve got a big problem here kid. It\'s got us surrounded.<br>They\'ll start from our street, across the crosswalk, but sooner or later they will be coming from all directions.";
levels[3].story[1].choices = [{storyIndex: 2, text: "We need more firepower."}];

levels[3].story[2] = {};
levels[3].story[2].image = "http://i.imgur.com/N0XRYT2.png";
levels[3].story[2].text = "Right, we can't hold anything back now. Upgrade double guns to gatling guns, lasers to UV-lasers, and cannons to artillery for extreme damgage. The UV-lasers use <b>lots</b> of power so you might need to use power generating towers. You can build windmills and upgrade them to solar panels.";
levels[3].story[2].choices = [{storyIndex: 3, text: "&rarr;"}];

levels[3].story[3] = {};
levels[3].story[3].color = "#aaaaaa";
levels[3].story[3].flipSide = true;
levels[3].story[3].image = "http://i.imgur.com/a3WeY3B.png";
levels[3].story[3].text = "<i>01110011 01110100 01101111 01110000 01110010 01100101 01110100 01110101 01110010 01101110 01101101 01100101 01110011 01110100 01101111 01110000</i>";
levels[3].story[3].choices = [{storyIndex:4, text:"We don't speak computer."}];

levels[3].story[4] = {};
levels[3].story[4].color = "#2d7b80";
levels[3].story[4].image = "http://i.imgur.com/N0XRYT2.png";
levels[3].story[4].text = "I've done all I can on upgrades. I'll see if I can figure out a way for us understand it. You focus on the constructs.";
levels[3].story[4].choices = [{storyIndex: -1, text: "Ok"}];
