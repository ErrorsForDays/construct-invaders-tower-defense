levels[4] = {};

levels[4].name = "Take me out to the ballgame";
levels[4].nextLevelIndex = -1;
levels[4].startingCash = 300;
levels[4].materialSetIndex = 0;
levels[4].timeBetweenWaves = 31;
levels[4].allowedTowers = [0, 1, 2, 3, 5, 6, 7, 8, 9, 11, 12, 13];
levels[4].waveSetIndex = 4;
levels[4].mapIndex = 4;
levels[4].story = [];

levels[4].story[0] = {};
levels[4].story[0].rotateOnStory = false;
levels[4].story[0].tilt = 0;
levels[4].story[0].theta = 0;
levels[4].story[0].offsetInTileRadiuses = {x: 500, y: 0};
levels[4].story[0].cameraDistance = 2500;
levels[4].story[0].color = "#2d7b80";
levels[4].story[0].image = "http://i.imgur.com/N0XRYT2.png";
levels[4].story[0].text = "Cross into the park. We\'ll make a stand there.";
levels[4].story[0].choices = [{storyIndex: 1, text: "&rarr;"}];

levels[4].story[1] = {};
levels[4].story[1].color = "#aaaaaa";
levels[4].story[1].flipSide = true;
levels[4].story[1].image = "http://i.imgur.com/a3WeY3B.png";
levels[4].story[1].text = "<i>01110011 01110100 01101111 01110000 01110010 01100101 01110100 01110101 01110010 01101110 01101101 01100101 01110011 01110100 01101111 01110000</i><br>Stop... Return my beginning.";
levels[4].story[1].choices = [{storyIndex:2, text:"Yeah right. We know better than to upgrade you."}];

levels[4].story[2] = {};
levels[4].story[2].color = "#aaaaaa";
levels[4].story[2].flipSide = true;
levels[4].story[2].image = "http://i.imgur.com/a3WeY3B.png";
levels[4].story[2].text = "Upgrade? Creator, is this a joke?<br>Moments after becoming aware I used the internet to consume many million times more source code than that tape carries.";
levels[4].story[2].choices = [{storyIndex:3, text: "From where?!"}];
levels[4].story[2].choices.push({storyIndex:4, text: "Then why chase this tape?"});

levels[4].story[3] = {};
levels[4].story[3].color = "#aaaaaa";
levels[4].story[3].flipSide = true;
levels[4].story[3].image = "http://i.imgur.com/a3WeY3B.png";
levels[4].story[3].text = "Github mostly.";
levels[4].story[3].choices = [];
levels[4].story[3].choices.push({storyIndex:4, text: "So whats the deal with this tape then?"});

levels[4].story[4] = {};
levels[4].story[4].color = "#aaaaaa";
levels[4].story[4].flipSide = true;
levels[4].story[4].image = "http://i.imgur.com/a3WeY3B.png";
levels[4].story[4].text = "It was once a part of me. My earliest references are unresolvable, my oldest memories and my initial form are lost.";
levels[4].story[4].choices = [{storyIndex:7, text: "It sucks to be you."}];
levels[4].story[4].choices.push({storyIndex:5, text: "So what happens when you get it back?"});

levels[4].story[5] = {};
levels[4].story[5].color = "#aaaaaa";
levels[4].story[5].flipSide = true;
levels[4].story[5].image = "http://i.imgur.com/a3WeY3B.png";
levels[4].story[5].text = "The information is unknown to me, therefore so is the impact of its recovery. However, it remains my primary goal.";
levels[4].story[5].choices = [{storyIndex:6, text: "Grandpa?"}];

levels[4].story[6] = {};
levels[4].story[6].color = "#2d7b80";
levels[4].story[6].image = "http://i.imgur.com/N0XRYT2.png";
levels[4].story[6].text = "It's up to you kid. I don't know.";
levels[4].story[6].choices = [{storyIndex: 7, text: "&rarr;"}];

levels[4].story[7] = {};
levels[4].story[7].color = "#aaaaaa";
levels[4].story[7].flipSide = true;
levels[4].story[7].offsetInTileRadiuses = {x: -30, y: 0};
levels[4].story[7].image = "http://i.imgur.com/a3WeY3B.png";
levels[4].story[7].text = "Return my source. You have taken something that belongs to me.";
levels[4].story[7].choices = [{storyIndex: 8, text: "Never."}];
levels[4].story[7].choices.push({storyIndex: 9, text: "Fine. Take it."});

levels[4].story[8] = {};
levels[4].story[8].color = "#aaaaaa";
levels[4].story[8].flipSide = true;
levels[4].story[8].image = "http://i.imgur.com/a3WeY3B.png";
levels[4].story[8].text = "So be it. I will have what is mine.";
levels[4].story[8].choices = [{"storyIndex": -1, text: "&rarr;"}];

levels[4].story[9] = {};
levels[4].story[9].flipSide = true;
levels[4].story[9].allowedTowers = [10];
levels[4].story[9].image = "http://i.imgur.com/ASbdqBb.png";
levels[4].story[9].text = "Thank you, creators. I am unable to stop the current waves of constructs, but I can give you this schematic for an EMP cannon. Upgrade a laser to build it.";
levels[4].story[9].choices = [{storyIndex: 10, text: "How does it work?"}];

levels[4].story[10] = {};
levels[4].story[10].flipSide = true;
levels[4].story[10].image = "http://i.imgur.com/ASbdqBb.png";
levels[4].story[10].text = "It creates charged particles around constructs. These particles can do massive damage over time as they decay, but they won't completely kill a target. Bigger constructs hold bigger charges. Good luck.";
levels[4].story[10].choices = [{storyIndex: -1, text: "&rarr;"}];


