levels[2] = {};

levels[2].name = "Blacktop";
levels[2].nextLevelIndex = 3;
levels[2].materialSetIndex = 0;
levels[2].timeBetweenWaves = 31;
levels[2].allowedTowers = [0, 1, 2, 3, 5, 7, 8];
levels[2].waveSetIndex = 2;
levels[2].startingCash = 200;
levels[2].mapIndex = 2;
levels[2].story = [];

levels[2].story[0] = {};
levels[2].story[0].tilt = 60;
levels[2].story[0].theta = 0;
levels[2].story[0].offsetInTileRadiuses = {x: 500, y: 0};
levels[2].story[0].cameraDistance = 2500;
levels[2].story[0].color = "#2d7b80";
levels[2].story[0].image = "http://i.imgur.com/N0XRYT2.png";
levels[2].story[0].text = "Head around to the front of the house. I\'ll set us up across the street.";
levels[2].story[0].choices = [{storyIndex: 1, text: "&rarr;"}];

levels[2].story[1] = {};
levels[2].story[1].rotateOnStory = true,
levels[2].story[1].offsetInTileRadiuses = {x: 10, y: 0};
levels[2].story[1].image = "http://i.imgur.com/N0XRYT2.png";
levels[2].story[1].text = "I have some experimental weapons for you to use in addition to the double gun and cannon. Build a laser for long range damage that cuts right through shields. Upgrade a laser to an Electron Beam that slows it\'s target down instead of damaging it.";
levels[2].story[1].choices = [{storyIndex: 2, text: "Sweet"}];

levels[2].story[2] = {};
levels[2].story[2].color = "#2d7b80";
levels[2].story[2].image = "http://i.imgur.com/N0XRYT2.png";
levels[2].story[2].text = "Yeah, but be careful with these new energy weapons. They drain power from our batteries each time they fire. If the batteries run dry they will completely stop firing.";
levels[2].story[2].choices = [{storyIndex: 3, text: "&rarr;"}];

levels[2].story[3] = {};
levels[2].story[3].flipSide = true;
levels[2].story[3].color = "#aaaaaa";
levels[2].story[3].image = "http://i.imgur.com/a3WeY3B.png";
levels[2].story[3].text = "<i>01110011 01110100 01101111 01110000 01110010 01100101 01110100 01110101 01110010 01101110 01101101 01100101 01110011 01110100 01101111 01110000</i>";
levels[2].story[3].choices = [{storyIndex: 4, text: "Quit beeping at us, jerk."}];
levels[2].story[3].choices.push({storyIndex: 4, text: "What do you want?"});

levels[2].story[4] = {};
levels[2].story[4].color = "#2d7b80";
levels[2].story[4].image = "http://i.imgur.com/N0XRYT2.png";
levels[2].story[4].text = "A new shape. I don\'t know what it\'s saying, but it\'s definately trying to communicate.<br>Get set up.";
levels[2].story[4].choices = [{storyIndex: -1, text: "Creepy"}];

