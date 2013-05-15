levels[1] = {};

levels[1].name = "Out back";
levels[1].nextLevelIndex = 2;
levels[1].materialSetIndex = 0;
levels[1].timeBetweenWaves = 31;
levels[1].allowedTowers = [2];
levels[1].startingCash = 120;
levels[1].waveSetIndex = 1;
levels[1].mapIndex = 1;
levels[1].story = [];

levels[1].story[0] = {};
levels[1].story[0].rotateOnStory = false;
levels[1].story[0].tilt = 0;
levels[1].story[0].theta = 0;
levels[1].story[0].offsetInTileRadiuses = {x: 500, y: 0};
levels[1].story[0].cameraDistance = 2000;
levels[1].story[0].color = "#2d7b80";
levels[1].story[0].image = "http://i.imgur.com/N0XRYT2.png";
levels[1].story[0].text = "My old system is fried. Don\'t think that means you won though. We have to get it working again...";
levels[1].story[0].choices = [{storyIndex: 1, text: "Fine by me. I'm not the one that quit."}];
levels[1].story[0].choices.push({storyIndex: 1, text: "Can something this old even be fixed?"});

levels[1].story[1] = {};
levels[1].story[1].image = "http://i.imgur.com/N0XRYT2.png";
levels[1].story[1].text = "It will be tricky to fix... Maybe if we scavenge some spare parts and piggyback it onto your fancy-pants new game console we can get it running. Hmm, this has potential. Go get my tools.";
levels[1].story[1].choices = [{storyIndex: 2, text: "This better not break my system."}];

levels[1].story[2] = {};
levels[1].story[2].color = "#2d7b80";
levels[1].story[2].image = "http://i.imgur.com/N0XRYT2.png";
levels[1].story[2].text = "Behold! It's my old system's superior design with some gigahertz from yours. And I wired in the guts of four microwaves, a universal remote, and some cellphones for extra power.";
levels[1].story[2].choices = [{storyIndex: 3, text: "Turn it on already."}];
levels[1].story[2].choices.push({storyIndex: 3, text: "This can't work."});

levels[1].story[3] = {};
levels[1].story[3].flipSide = true;
levels[1].story[3].color = "#aaaaaa";
levels[1].story[3].image = "http://i.imgur.com/eVx13Eo.png";
levels[1].story[3].text = "[Beep][Beeeeep][Whirrrrrrr]<br>[Beep][Blip]<br>[Whomp][Whomp][WHOMP][WHOMPWHOMPWHOMPWHOMP]";
levels[1].story[3].choices = [{"storyIndex": 4, "text": "Grandpa?!"}];

levels[1].story[4] = {};
levels[1].story[4].color = "#2d7b80";
levels[1].story[4].image = "http://i.imgur.com/N0XRYT2.png";
levels[1].story[4].text = "Holy crap!<br>This thing is out of control. Unplug the tape drive and run. Head for the back yard and don\'t forget my tools!";
levels[1].story[4].choices = [{storyIndex: 5, text: "Wait for me!"}];

levels[1].story[5] = {};
levels[1].story[5].offsetInTileRadiuses = {x: 0, y: 0};
levels[1].story[5].flipSide = true;
levels[1].story[5].image = "http://i.imgur.com/N0XRYT2.png";
levels[1].story[5].text = "That system is tracking us into the real world. Maybe the fourth microwave core and the cellphone antenna array were a touch too much. <b>We can\'t let it acess the rest of the source code on this tape.</b>";
levels[1].story[5].choices = [{storyIndex: 6, text: "Why not?"}, {storyIndex: 6, text: "Let's give it the code and run!"}];

levels[1].story[6] = {};
levels[1].story[6].flipSide = true;
levels[1].story[6].image = "http://i.imgur.com/N0XRYT2.png";
levels[1].story[6].text = "That would be a disaster, even on old hardware this game was unbeatable with its full source code.<br>I\'ll rig us a mobile base so you can build defenses like in the game. But we\'re running on battery power out here, so your energy is limited.";
levels[1].story[6].choices = [{storyIndex: 7, text: "<i>What are</i> you talking about, we\'re outside."}];

levels[1].story[7] = {};
levels[1].story[7].flipSide = true;
levels[1].story[7].image = "http://i.imgur.com/N0XRYT2.png";
levels[1].story[7].text = "Sending attackers towards its objective is all the program knows how to do. Now that its objective is in the real world it\'s using the underground power lines to create attacking constructs that are pure electron fields.";
levels[1].story[7].choices = [{storyIndex: 8, text: "Woah!"}];

levels[1].story[8] = {};
levels[1].story[8].flipSide = true;
levels[1].story[8].image = "http://i.imgur.com/N0XRYT2.png";
levels[1].story[8].text = "If the constructs reach us they will drain our energy.<br>The only good news is that by destroying them we can harvest some of the spilled energy before it dissipates.";
levels[1].story[8].choices = [{storyIndex: 9, text: "Will that be enough to keep our batteries running?"}];

levels[1].story[9] = {};
levels[1].story[9].rotateOnStory = false;
levels[1].story[9].theta = 0;
levels[1].story[9].tilt = 40;
levels[1].story[9].flipSide = true;
levels[1].story[9].image = "http://i.imgur.com/N0XRYT2.png";
levels[1].story[9].text = "Let's hope so.<br>Here they come. Get set up quick.";
levels[1].story[9].choices = [{storyIndex: -1, text: "Ok"}];

levels[1].story[10] = {};
levels[1].story[10].wave = 8;
levels[1].story[10].color = "#2d7b80";
levels[1].story[10].image = "http://i.imgur.com/N0XRYT2.png";
levels[1].story[10].text = "They\'re speeding up, I\'ve been working on weapons upgrades but there\'s only time to install one. Do you want a double barreled gun or a cannon?";
levels[1].story[10].choices = [{storyIndex: 11, text: "Double Gun"}];
levels[1].story[10].choices.push({storyIndex: 12, text: "Cannon"});

levels[1].story[11] = {};
levels[1].story[11].allowedTowers = [5];
levels[1].story[11].color = "#2d7b80";
levels[1].story[11].image = "http://i.imgur.com/N0XRYT2.png";
levels[1].story[11].text = "Good choice! This gun shoots twice as fast. Build it by upgrading a standard gun.";
levels[1].story[11].choices = [{storyIndex: -1, text: "Continue"}];

levels[1].story[12] = {};
levels[1].story[12].allowedTowers = [3];
levels[1].story[12].color = "#2d7b80";
levels[1].story[12].image = "http://i.imgur.com/N0XRYT2.png";
levels[1].story[12].text = "Good choice! A cannon is slower than a gun but it does much more damage.<br>It\'s great for shielded contructs. Build it by upgrading a standard gun.";
levels[1].story[12].choices = [{storyIndex: -1, text: "Continue"}];
