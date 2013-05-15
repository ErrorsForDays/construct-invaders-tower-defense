var levels = [];
levels[0] = {};
levels[0].name = "Tutorial";
levels[0].nextLevelIndex = 1;
levels[0].materialSetIndex = 1;
levels[0].timeBetweenWaves = 31;
levels[0].allowedTowers = [2];
levels[0].waveSetIndex = 0;
levels[0].mapIndex = 0;
levels[0].story = [];

levels[0].story[0] = {};
levels[0].story[0].rotateOnStory = false;
levels[0].story[0].tilt = 0;
levels[0].story[0].theta = 0;
levels[0].story[0].offsetInTileRadiuses = {x: 100, y: 0};
levels[0].story[0].cameraDistance = 800;
levels[0].story[0].color = "#2d7b80";
levels[0].story[0].image = "http://i.imgur.com/N0XRYT2.png";
levels[0].story[0].text = "In my day we weren't always getting new games. They used to take a long time to beat, and they came on cassete tapes!";
levels[0].story[0].choices = [{storyIndex : 1, text : "Yeah right grandpa. I bet I could beat them."}];

levels[0].story[1] = {};
levels[0].story[1].image = "http://i.imgur.com/N0XRYT2.png";
levels[0].story[1].text = "I'll tell you what. I still have my old system in the attic.<br>If you can manage to beat just one of my old games, I'll buy you a brand new one. Do we have a deal?";
levels[0].story[1].choices = [{storyIndex: 2,text: "Deal! Set it up."}];

levels[0].story[2] = {};
levels[0].story[2].offsetInTileRadiuses = {x: 0, y: 0};
levels[0].story[2].color = "#2d7b80";
levels[0].story[2].flipSide = true;
levels[0].story[2].image = "images/instructions_web.svg";
levels[0].story[2].text = "Here's the manual.<br>All you have to do is build defenses to stop the soldiers and tanks from the enemy base, before they get to your base.";
levels[0].story[2].choices = [{storyIndex: 3,text: "Soldiers, tanks, bases. Where?"}];
levels[0].story[2].choices.push({storyIndex: -1, text: "Sounds easy. Let\'s go."});

levels[0].story[3] = {};
levels[0].story[3].flipSide = true;
levels[0].story[3].image = "http://i.imgur.com/N0XRYT2.png";
levels[0].story[3].text = "Your base is blue, the enemy base is red.<br>Green triangle soldiers and square tanks will advance on your base.<br>Build defensive turrets to stop them. And don\'t worry, they stay inside the purple border.";
levels[0].story[3].choices = [{storyIndex: 4, text: "How do I build the turrets?"}];
levels[0].story[3].choices.push({storyIndex: -1, text: "Simple. I've got this."});
		
levels[0].story[4] = {};
levels[0].story[4].flipSide = true;
levels[0].story[4].image = "http://i.imgur.com/N0XRYT2.png";
levels[0].story[4].text = "Select an empty space, then build a foundation.<br>Enemies have to go around foundations.<br>Upgrade a foundation with weapons to build up your defenses.Then bring on the enemies by hitting the start button.",
levels[0].story[4].choices = [{storyIndex: -1, text: "No problem."}];

levels[0].story[5] = {};
levels[0].story[5].wave = 4;
levels[0].story[5].flipSide = true;
levels[0].story[5].image = "http://i.imgur.com/N0XRYT2.png";
levels[0].story[5].text = "You\'re in trouble now. Here come the shielded enemies.<br>Each time they are hit the shield soaks up some damage. Upgrading the damage on your guns helps.";
levels[0].story[5].choices = [{storyIndex: -1, text: "Is this console supposed to smell like smoke?"}];
