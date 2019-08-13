function byId(e) { return document.getElementById(e); }
function newEl(tag, colour) {
    tag.className = colour;
    return document.createElement(tag);
}

window.addEventListener('load', onDocLoaded, false);

// var condition = "eval";

var playerID = "PLAYER_ID";

var spin_min = 0;
var spin_max = 10;
//MOR changed to less colours
var colours = ['blue', 'red', 'white', 'yellow', 'green']//, 'orange', 'grey', 'brown', 'purple', 'teal'];
var paths = '';
var pathsOriginal = '';
var nrPlayers = 0;
// var trades = '';
var suggestedTrades = '';
var suggestedTradesOriginal = '';
var currentPlayer = 0;

var timer;

var goalLocation;
var playerLocations = new Array();

//gamestate
var extraChips = ["-"]; // create an array with one element in order to store this variable before reading a file (and not yet having retrieved pathScores)
var extraChipsOrigial;
var requestedChips = [""];
// var neededChips = ["-"]; // create an array with one element in order to store this variable before reading a file (and not yet having retrieved pathScores);
// var neededChipsOriginal;
var pathScores = ["-"]; // create an array with one element in order to store this variable before reading a file (and not yet having retrieved pathScores)
var success;

var nrExchanges = [];
var nrChipsRequested = 0;
var chipsRequested = [];
var chipDistributions;

//MOR Vered changed name from "games" to "evalGames"
var evalGames = [1, 2, 3, 4];
//added this variable
var numOfEvalGames = evalGames.length
var currentEvalGame = 0;

// var gameprogress = 'PlayerID,Condition,GameID,currentEvalGame,Timestamp,CurrentPlayer,Action,ChipsRequested,ExtraChips,NeededChips,Score,TimeRemaining\n';
var gameprogress = '\n';

var falseAnswers = 0;
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

function randomIntFromInterval(min, max) { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function onDocLoaded() {
    byId('next_btn').addEventListener('click', nextButton());
    byId('clear_path').addEventListener('click', clearPath());
    byId('restore_path').addEventListener('click', restoreSuggestedPath());

    $("#spinner").spinner();

    reset();

    shuffleArray(evalGames);

    // alert("Starting with game " + evalGames[0]);
    var game = baseurl + 'games/game' + evalGames[0] + '-eval.txt';
    //modalAlert("On Doc Loaded")
    // var game = baseurl + 'games/Video.txt';

    var qs = (function (a) {
        if (a == "") return {};
        var b = {};
        for (var i = 0; i < a.length; ++i) {
            var p = a[i].split('=', 2);
            if (p.length == 1)
                b[p[0]] = "";
            else
                b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
        }
        return b;
    })(window.location.search.substr(1).split('&'));

    playerID = qs["id"];
    condition = qs["cond"];

    if (condition == 0) {
        $('#restore_path').hide();
        $('#suggestion_wrapper').hide();

        // $('#videoModal0').modal('show')

        // $('#videoModal0').on('hidden.bs.modal', function (e) {
            $('#evalModal').modal('show')
        // })
    } else {
        // $('#videoModal1').modal('show')

        // $('#videoModal1').on('hidden.bs.modal', function (e) {
            $('#evalModal').modal('show')
        // })
    }

    // we only want to start the game after the user has closed the modal containing explanation
    $('#evalModal').on('hidden.bs.modal', function (e) {
        return (readTextFile(game));
    })
}

function nextButton() {
    return function () {
        var responseText = $('#next_text').val();
        if (responseText.length > 1) {
            storeProgress("Motivation: " + responseText);
            $('#next_text').val('');
            nextGame();
        } else {
            modalAlert("Please motivate your choice in the text area.")
        }
    }
}

function nextGame() {
    console.log("NExt game");

    storeProgress("Ending game");
    var evaluation_result = "Correct";

    if (evalGames[currentEvalGame] == 1 && pathScores[0] != 170) {
        falseAnswers = falseAnswers + 1;
        evaluation_result = "Incorrect";
    } if (evalGames[currentEvalGame] == 2 && pathScores[0] != 25) {
        falseAnswers = falseAnswers + 1;
        evaluation_result = "Incorrect";
    } if (evalGames[currentEvalGame] == 3 && pathScores[0] != 83) {
        falseAnswers = falseAnswers + 1;
        evaluation_result = "Incorrect";
    } if (evalGames[currentEvalGame] == 4 && pathScores[0] != 25) {
        falseAnswers = falseAnswers + 1;
        evaluation_result = "Incorrect";
    }

        currentEvalGame++;

    if (currentEvalGame == numOfEvalGames-1) {
        var next = document.getElementById('next_btn');
        next.textContent = "Done";
    }

    if (currentEvalGame < numOfEvalGames) {
        alert("You will now start game " + (currentEvalGame + 1) + " out of " + numOfEvalGames + ".");
        currentPlayer = 0;
        var display_game = document.querySelector('#game');
        display_game.textContent = "Evaluation game " + (currentEvalGame + 1) + " out of " + numOfEvalGames + ".";

        // loading new game
        var game = baseurl + 'games/game' + evalGames[currentEvalGame] + '-eval.txt';
        //modalAlert("next Game")

        var rawFile = new XMLHttpRequest();
        rawFile.open("GET", game, false);
        rawFile.onreadystatechange = function () {
            if (rawFile.readyState === 4) {
                if (rawFile.status === 200 || rawFile.status == 0) {
                    var allText = rawFile.responseText;
                    loadGame(allText);
                }
            }
        }
        rawFile.send(null);
        saveToFile(gameprogress);
        // empty var after saving
        gameprogress = "";
    } else {
        saveToFile(gameprogress);
        if (falseAnswers > 1) {
            window.location.href = baseurl + "evaluation-stop.html" + "?id=" + playerID + "&c=" + condition;
        } else {
            // Give workers a choice what they want.
            timer = 0;
            var text = "Congratulations, you have successfully completed the first part of the experiment earning $4. You have qualified for the opportunity to earn another $2 by playing 10 more games. In each game you can earn an additional $0.2 depending on how well you do.<br /><br /><a href=" + baseurl + "application.html?id=" + playerID + "&cond=" + condition + ">Continue</a> or <a href=" + baseurl + "complete.html?id=" + playerID + "&c=" + condition + "&max=0>Stop</a>.";
            modalAlert(text, footer = false);
            // window.location.href = baseurl + "application.html" + "?id=" + playerID;
        }
    }
}

function storeProgress(action) {
    // remove any commas and additional spaces.
    chipsRequested = chipsRequested.toString().split(",").join(" ");
    chipsRequested = chipsRequested.toString().split("  ").join(" ");

    // check what the current trades are
    var trade = document.getElementById('trade');
    trade_rows = trade.children;
    // nrChipsRequested = 0;

    var player0Trades = "";
    var player1Trades = "";
    var player2Trades = "";
    var player3Trades = "";
    var player4Trades = "";
    var player5Trades = "";

    for (var i = 0; i < trade_rows.length; i++) {
        var spinners = trade_rows[i].children[1].children[0].children;
        for (let j = 0; j < spinners.length; j++) {
            var spinnerValue = parseInt(spinners[j].children[2].children[0].value);
            if (spinnerValue != 0) {
                tradePlayer = true;
                for (let nrChips = 0; nrChips < spinnerValue; nrChips++) {
                    if (currentPlayer == 0) {
                        if (i == 0) { player1Trades += j + ";"; }
                        if (i == 1) { player2Trades += j + ";"; }
                        if (i == 2) { player3Trades += j + ";"; }
                        if (i == 3) { player4Trades += j + ";"; }
                        if (i == 4) { player5Trades += j + ";"; }
                    }
                    if (currentPlayer == 1) {
                        if (i == 0) { player0Trades += j + ";"; }
                        if (i == 1) { player2Trades += j + ";"; }
                        if (i == 2) { player3Trades += j + ";"; }
                        if (i == 3) { player4Trades += j + ";"; }
                        if (i == 4) { player5Trades += j + ";"; }
                    }
                    if (currentPlayer == 2) {
                        if (i == 0) { player0Trades += j + ";"; }
                        if (i == 1) { player1Trades += j + ";"; }
                        if (i == 2) { player3Trades += j + ";"; }
                        if (i == 3) { player4Trades += j + ";"; }
                        if (i == 4) { player5Trades += j + ";"; }
                    }
                    if (currentPlayer == 3) {
                        if (i == 0) { player0Trades += j + ";"; }
                        if (i == 1) { player1Trades += j + ";"; }
                        if (i == 2) { player2Trades += j + ";"; }
                        if (i == 3) { player4Trades += j + ";"; }
                        if (i == 4) { player5Trades += j + ";"; }
                    }
                    if (currentPlayer == 4) {
                        if (i == 0) { player0Trades += j + ";"; }
                        if (i == 1) { player1Trades += j + ";"; }
                        if (i == 2) { player2Trades += j + ";"; }
                        if (i == 3) { player3Trades += j + ";"; }
                        if (i == 4) { player5Trades += j + ";"; }
                    }
                    if (currentPlayer == 5) {
                        if (i == 0) { player0Trades += j + ";"; }
                        if (i == 1) { player1Trades += j + ";"; }
                        if (i == 2) { player2Trades += j + ";"; }
                        if (i == 3) { player3Trades += j + ";"; }
                        if (i == 4) { player4Trades += j + ";"; }
                    }
                }
            }
        }
    }

    extraChips[currentPlayer] = extraChips[currentPlayer].toString().split(",").join(" ");
    extraChips[currentPlayer] = extraChips[currentPlayer].toString().split("  ").join(" ");
    requestedChips[currentPlayer] = requestedChips[currentPlayer].toString().split(",").join(" ");
    requestedChips[currentPlayer] = requestedChips[currentPlayer].toString().split("  ").join(" ");
    requestedChips[currentPlayer] = requestedChips[currentPlayer].toString().split("-1").join("");

    var timeRemaining = minutes + ":" + seconds;

    var stringCondition = condition;

    var chipsRequestedPlayer = "P0:" + player0Trades + ";P1:" + player1Trades + ";P2:" + player2Trades + ";P3:" + player3Trades + ";P4:" + player4Trades + ";P5:" + player5Trades;

    gameprogress += playerID + "," + stringCondition + "," + evalGames[currentEvalGame] + "," + currentEvalGame + "," + (new Date).getTime() + "," + currentPlayer + "," + action + "," + chipsRequested + "," + chipsRequestedPlayer + "," + extraChips[currentPlayer] + "," + requestedChips[currentPlayer] + "," + parseInt(pathScores[currentPlayer]) + "," + timeRemaining + "\n";
}

function readTextFile(file) {
    // return function () {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                var allText = rawFile.responseText;
                loadGame(allText);
            }
        }
    }
    storeProgress("Read new file");
    rawFile.send(null);
    // }
}

function loadGame(instructions) {
    //modalAlert("Loading Game")
    reset();
    var lines = instructions.split('\n');

    var rows = parseInt(lines[0]);
    var cols = parseInt(lines[1]);
    var scores = lines[2]; // ?
    var nrColors = lines[3];
    var map = lines.slice(4, 4 + rows);
    var nrGoals = parseInt(lines[5 + rows - 1]);
    goalLocation = lines[6 + rows + nrGoals - 2].split(" ");
    var nrHumanPlayers = parseInt(lines[7 + rows + nrGoals - 2]); // Assuming 1
    var humanLocation = lines[8 + rows + nrGoals - 2].split(" "); // What is 'goalIndex'?
    var nrComputerPlayers = parseInt(lines[9 + rows + nrGoals - 2]);
    nrPlayers = nrHumanPlayers + nrComputerPlayers;
    var computerLocations = lines.slice(10 + rows + nrGoals - 2, 10 + rows + nrGoals - 2 + nrComputerPlayers); // What is 'goalIndex'?
    chipDistributions = lines.slice(10 + rows + nrGoals + nrComputerPlayers - 2, 10 + rows + nrGoals + nrComputerPlayers + (nrPlayers * 2) - 2);
    paths = lines.slice(11 + rows + nrGoals + (nrComputerPlayers * 3) - 1, 11 + rows + nrGoals + (nrComputerPlayers * 4));
    pathsOriginal = lines.slice(11 + rows + nrGoals + (nrComputerPlayers * 3) - 1, 11 + rows + nrGoals + (nrComputerPlayers * 4));
    // neededChips = lines.slice(12 + rows + nrGoals + (nrComputerPlayers * 4) - 1, 12 + rows + nrGoals + (nrComputerPlayers * 5));
    // neededChipsOriginal = lines.slice(12 + rows + nrGoals + (nrComputerPlayers * 4) - 1, 12 + rows + nrGoals + (nrComputerPlayers * 5));
    requestedChips = lines.slice(12 + rows + nrGoals + (nrComputerPlayers * 4) - 1, 12 + rows + nrGoals + (nrComputerPlayers * 5));
    requestedChipsOriginal = lines.slice(12 + rows + nrGoals + (nrComputerPlayers * 4) - 1, 12 + rows + nrGoals + (nrComputerPlayers * 5));
    extraChips = lines.slice(13 + rows + nrGoals + (nrComputerPlayers * 5) - 1, 13 + rows + nrGoals + (nrComputerPlayers * 6));
    extraChipsOriginal = lines.slice(13 + rows + nrGoals + (nrComputerPlayers * 5) - 1, 13 + rows + nrGoals + (nrComputerPlayers * 6));
    pathScores = lines.slice(14 + rows + nrGoals + (nrComputerPlayers * 6) - 1, 14 + rows + nrGoals + (nrComputerPlayers * 7));
    success = lines.slice(15 + rows + nrGoals + (nrComputerPlayers * 7) - 1, 15 + rows + nrGoals + (nrComputerPlayers * 8));
    if (nrPlayers == 3) {
        success = [1, 1, 1];
    }
    if (nrPlayers == 2) {
        success = [1, 1];
    }
    // trades = lines.slice(16 + rows + nrGoals + (nrComputerPlayers * 8) - 1, 16 + rows + nrGoals + (nrComputerPlayers * 9));
    suggestedTrades = lines.slice(16 + rows + nrGoals + (nrComputerPlayers * 8) - 1, 16 + rows + nrGoals + (nrComputerPlayers * 9));
    suggestedTradesOriginal = lines.slice(16 + rows + nrGoals + (nrComputerPlayers * 8) - 1, 16 + rows + nrGoals + (nrComputerPlayers * 9));
    for (let player = 0; player < nrPlayers; player++) {
        var playerRequestedChips = "";
        var suggestedTrade = suggestedTrades[player];
        if (suggestedTrade != undefined) {
            suggestedTrade = suggestedTrade.substring(suggestedTrade.indexOf(" ") + 1);// remove useless info (up to first space)
            suggestedTrade = suggestedTrade.split("Player");

            nrExchanges[player] = 0;
            // nrChipsRequested = 0;

            for (let player_loop = 0; player_loop < nrPlayers; player_loop++) {
                for (let index = 1; index < suggestedTrade.length; index++) {
                    var suggested_trade_array = suggestedTrade[index].split(" ");
                    if (player_loop == suggested_trade_array[0]) {
                        nrExchanges[player]++;
                        for (let colour_counter = 0; colour_counter < colours.length; colour_counter++) {
                            for (let index = 1; index < suggested_trade_array.length; index++) {
                                const chip = suggested_trade_array[index];
                                if (chip == colour_counter + 1) {
                                    // have one of this colour
                                    playerRequestedChips += (colour_counter + 1) + " ";
                                }
                            }
                        }
                    }
                }
            }
        }
        requestedChips.push(playerRequestedChips);

        // extraChips[player] = extraChips[player] + " " + playerRequestedChips;
        // extraChipsOriginal[player] = extraChipsOriginal[player] + " " + playerRequestedChips;
    }

    if (condition == 0) {
        extraChips = [""];
        extraChipsOriginal = [""];
        requestedChips = [""];
        requestedChipsOriginal = [""];
        // neededChips = [""];
        // neededChipsOriginal = [""];
        for (let index = 0; index < nrPlayers; index++) {
            var counter = index * 2 + 1;
            extraChips[index] = chipDistributions[counter];
            extraChipsOriginal[index] = chipDistributions[counter];
            requestedChips[index] = "";
            requestedChipsOriginal[index] = "";
            paths[index] = String(paths.slice(index, index + 1)).substring(0, 5); // have to keep the first cell (user cell)
            pathsOriginal[index] = String(pathsOriginal.slice(index, index + 1)).substring(0, 5); // have to keep the first cell (user cell)
            success[index] = 0;
            nrExchanges[index] = 0;
            // score calculation...
            pathScores[index] = extraChips[index].split(" ").filter(function (v) { return v !== '' }).length * 5;
        }
        suggestedTrades = [""];
        suggestedTradesOriginal = [""];
        requestedChips = ["", "", "", "", "", ""];
    }

    map_colour = [];
    // interpret colours
    map.forEach(function (element, index) {
        // note, index == row nr
        element = element.split(" ");
        for (let colour_counter = 0; colour_counter < cols; colour_counter++) {
            element_colour = parseInt(element[colour_counter]);
            cell_colour = colours[element_colour - 1];
            // cell_colour = element[colour_counter];
            map_colour.push(cell_colour);
        }
    });

    grid = new Grid({
        rows: rows,
        cols: cols,
        map_colour: map_colour,
        render: {
            placeholder: ".grid"
        }
    });

    setPlayers(0, humanLocation[0], humanLocation[1]);
    computerLocations.forEach(function (element, index) {
        element = element.split(" ");
        setPlayers(index + 1, element[0], element[1])
    });

    setTarget(goalLocation[0], goalLocation[1], grid);

    setPaths(0);

    setInitialChips(chipDistributions);

    setTradeChips(suggestedTrades, 0, nrPlayers);
    setSuggestions(suggestedTrades);
    updatedTradeChips();

    setGamestate(requestedChips, extraChips, pathScores, success);

    timer = startTimer(180);
    // timer = startTimer(600);

    // updateLocalExplanation();

    storeProgress("Starting new game");
}

function onReadTextBtnClicked(evt) {
    var input = document.getElementById('readText').value;
    loadGame(input);
}

function clickedCell(i, j) {
    // remove current path
    var cell = document.getElementById(i + '-' + j);
    cellContent = cell.children;

    if (cell.classList[3] == currentPlayer) {
        modalAlert("You are already standing on this tile.");
        storeProgress("Tried to add own cell " + i + "-" + j);
    } else {
        // what colour was the cell?
        var selected_colour;
        for (let colour_counter = 0; colour_counter < colours.length; colour_counter++) {
            if (cell.classList[1] == colours[colour_counter]) {
                selected_colour = colour_counter;
            }
        }

        // what colours does the player have?
        var extraChipsPlayer = extraChips[currentPlayer];
        extraChipsPlayer = extraChipsPlayer.replace(/-1/g, "");
        extraChipsPlayer = extraChipsPlayer.split(" ");
        extraChipsPlayer = extraChipsPlayer.filter(function (v) { return v !== '' });

        // console.log("extraChipsPlayer : " + extraChipsPlayer);

        var haveChip = false;
        var selectedChip;

        for (let index = 0; index < extraChipsPlayer.length; index++) {
            if (selected_colour == extraChipsPlayer[index] - 1) {
                haveChip = true;
                selectedChip = extraChipsPlayer[index];
                break;
            }
        }

        var addPath = false;
        // check children (i.e., target or player names)
        if (typeof cellContent[0] !== 'undefined') {
            var cellContentId = 0;
            if (cellContent[0].classList.contains("gameelement")) {
                cellContentId = 1;
            }
            if (typeof cellContent[cellContentId] !== 'undefined') {
                // only add colour back to path guidance if checkmark.
                if (cellContent[cellContentId].classList.contains("check")) {
                    extraChips[currentPlayer] += " " + (selected_colour + 1) + " ";
                    // remove from path list
                    paths[currentPlayer] = paths[currentPlayer].replace(i + " " + j + " " + 1, "");
                }
                if (cellContent[cellContentId].classList.contains("cross")) {
                    // console.log(extraChips[currentPlayer]);
                    extraChips[currentPlayer] += " " + (selected_colour + 1) + " ";
                    // console.log("problem?");
                    // console.log(extraChips[currentPlayer]);
                    // neededChips[currentPlayer] = neededChips[currentPlayer].replace(selected_colour + 1, "");
                    // remove from path list
                    paths[currentPlayer] = paths[currentPlayer].replace(i + " " + j + " " + 0, "");
                }
                $(cellContent[cellContentId]).remove("img");
            } else {
                // only game element in there, time to add new path
                addPath = true;
            }
        } else {
            // nothing was in there, time to add new path
            addPath = true;
        }

        var chipRequestedLocal = true;
        if (haveChip == false && addPath == true) {
            // player does not have chip in current extra's
            // check whether player has requested the chip - if not: do not allow to add path    

            // lets merge requested chips and extra chips to check whether player has the required chips        
            for (let index = 0; index < extraChipsPlayer.length; index++) {
                extraChipsPlayer[index] = extraChipsPlayer[index] - 1;
            }

            // var totalChips = extraChipsPlayer + "," + chipsRequested;
            var totalChips = extraChipsPlayer;

            path = paths[currentPlayer];

            var pathArray = path.split(' ');
            // remove whitespaces
            pathArray = path.replace(/\s+/g, '');

            // first we have to 'use' the total number of available chips on cells already part of the path
            for (let index = 0; index < pathArray.length; index = index + 3) {
                // we should not check all the cells of the path, but only the cells which are "X"
                var cell_x = parseInt(pathArray[index + 2]);
                // alert(cell_x);
                // alert(i + j);
                if (cell_x == 0) {
                    // alert(index);

                    // console.log("index: " + index);

                    var path_cell_colour;

                    // alert(parseInt(pathArray[index]) + '-' + parseInt(pathArray[index + 1]));

                    var pathCell = document.getElementById(pathArray[index] + '-' + pathArray[index + 1]);
                    // console.log("COLOUR " + pathCell.classList[1]);

                    for (let colour_counter = 0; colour_counter < colours.length; colour_counter++) {
                        if (pathCell.classList[1] == colours[colour_counter]) {
                            // convert colour string to colour number
                            path_cell_colour = colour_counter;
                        }
                    }
                    // alert(path_cell_colour);
                    // console.log("totalChips player " + totalChips);

                    if (totalChips.includes(path_cell_colour)) {
                        // alert("includes colour!");
                        totalChips = totalChips.replace(path_cell_colour, "");
                    } else {
                        // this should never happen as we are simply replacing current operations
                        // alert("Something is wrong!");
                    }
                    // console.log("totalChips player " + totalChips);
                }
            }

            // this is where we are actually checking the clicked cell -- the previous was just to 'use' our total chips on the already excisting path
            if (totalChips.includes(selected_colour)) {
                // alert("have selected cell!")
                chipRequestedLocal = true;
                totalChips = totalChips.replace(path_cell_colour, "");
            } else {
                // alert("do not have selected cell!" + selected_colour)
                chipRequestedLocal = false;
            }

            if (chipRequestedLocal == false) {
                modalAlert("You do not have and have not requested a chip that corresponds to that tile.");
                storeProgress("Denied adding cell " + i + "-" + j + "-" + haveChip);
                return;
            }
        }

        if (addPath == true && chipRequestedLocal == true) {
            if (haveChip == true) {
                // var requestedChipsPlayer = requestedChips[currentPlayer];
                // remove all spaces and count nr. chips
                // requestedChipsPlayer = requestedChipsPlayer.split(" ");
                var occurencesExtra = extraChipsPlayer.filter(i => i === (parseInt(selected_colour + 1) + "")).length;
                // var occurencesRequested = requestedChipsPlayer.filter(i => i === (parseInt(selected_colour + 1) + "")).length;

                chip_colours = chipDistributions[currentPlayer * 2 + 1].split(" ");
                // count how many of the specific colour we have in our initial chips
                count = 0;
                for (var z = 0; z < chip_colours.length; z++) {
                    if (parseInt(chip_colours[z]) == selected_colour + 1) {
                        count++;
                    }
                }

                var colour_name = colours[selected_colour];
                var numChecks = 0;
                if (occurencesExtra > 0) {
                    var numChecks = $('#grid .' + colour_name + ' .check').length;

                    if (numChecks < count) {
                        $(cell).append('<img class="check" src="img/check.png" style="height: 100%; width: 100%" />');
                        // if yes: update extra chips (remove first occurence of colour)
                        // add this space to prevent '1' eating '10' into '0'.
                        extraChips[currentPlayer] = extraChips[currentPlayer] + " ";
                        extraChips[currentPlayer] = extraChips[currentPlayer].replace((selectedChip + " "), "");
                        paths[currentPlayer] += " " + i + " " + j + " " + 1 + " ";
                    } else if (occurencesExtra > 0) {
                        $(cell).append('<img class="cross" src="img/cross.png" style="height: 100%; width: 100%" />');
                        extraChips[currentPlayer] = extraChips[currentPlayer] + " ";
                        extraChips[currentPlayer] = extraChips[currentPlayer].replace((selectedChip + " "), "");
                        paths[currentPlayer] += " " + i + " " + j + " " + 0 + " ";
                        haveChip = false;
                    }
                }
            }

            // update path
            // paths[currentPlayer] += " " + i + " " + j + " " + (haveChip ? 1 : 0) + " ";

            // setPaths(currentPlayer);
        }

        // setGamestate(neededChips, extraChips, pathScores, success);
        updateScore();

        if (addPath) {
            storeProgress("Added cell " + i + "-" + j + "-" + haveChip);
        } else {
            storeProgress("Removed cell " + i + "-" + j + "-" + haveChip);
            // REMOVE PATH HERE
            paths[currentPlayer] = paths[currentPlayer].replace(i + " " + j + " " + 1, "");
        }
    }
}

function pathComplete(currentPlayer) {
    // go over all cells in the path
    // check if there is a neighbour in which x stays the same but y is either y+1 or y-1
    // check if there is a neighbour in which y stays the same but x is either x+1 or x-1

    path = paths[currentPlayer];

    // we want to make sure that the player's position is included in the path.
    var playerLocation = " " + playerLocations[currentPlayer][0] + " " + playerLocations[currentPlayer][1] + " " + 1;
    if (!path.includes(playerLocations[currentPlayer][0] + " " + playerLocations[currentPlayer][1] + " " + 1)) {
        path += playerLocation;
    }

    var pathArray = path.split(' ');
    // remove whitespaces
    pathArray = path.replace(/\s+/g, '');

    for (let index = 0; index < pathArray.length; index = index + 3) {
        i = parseInt(pathArray[index]);
        j = parseInt(pathArray[index + 1]);

        // console.log('Now checking : ' + i + ' ' + j);

        // Normal cells need two cells connected - lets keep track
        var nrConnected = 0;
        // Goal and player location only need 1 cell connected
        if (((goalLocation[0] == i && goalLocation[1] == j) || (playerLocations[currentPlayer][0] == i && playerLocations[currentPlayer][1] == j))) {
            nrConnected = 1;
        }

        // Player location does not need to be directly connected, can be one cell off from player ...
        if ((playerLocations[currentPlayer][0] == i - 1 && playerLocations[currentPlayer][1] == j) ||
            (playerLocations[currentPlayer][0] == i + 1 && playerLocations[currentPlayer][1] == j) ||
            (playerLocations[currentPlayer][0] == i && playerLocations[currentPlayer][1] == j + 1) ||
            (playerLocations[currentPlayer][0] == i && playerLocations[currentPlayer][1] == j - 1)) {
            nrConnected = 1;
        }


        for (let x = 0; x < pathArray.length; x = x + 3) {
            // console.log("i : " + pathArray[x]);
            // console.log("j + 1 : " + (parseInt(pathArray[x + 1]) + 1));
            // console.log("j - 1 : " + (parseInt(pathArray[x + 1] - 1)));

            if (i == parseInt(pathArray[x]) && (j == (parseInt(pathArray[x + 1]) + 1) || j == (parseInt(pathArray[x + 1]) - 1))) {
                // console.log("X SAME");
                nrConnected++;
            } else {
                // console.log("X NOT SAME");
            }
            if (j == parseInt(pathArray[x + 1]) && (i == (parseInt(pathArray[x]) + 1) || i == (parseInt(pathArray[x]) - 1))) {
                // console.log("Y SAME");
                nrConnected++;
            } else {
                // console.log("Y NOT SAME");
            }
        }

        if (nrConnected <= 1) {
            return (false);
        }
    }
    return (true);
}

function chipsAligned(neededChipsPlayer) {
    // check if colour and number of chips requested equals the colour and number of chips needed
    // this removes any empty elements from 'neededChipsPlayer' that can mess up our check
    neededChipsPlayer = neededChipsPlayer.filter(Boolean);
    // console.log("NEEDED : " + neededChipsPlayer);
    // console.log("NEEDED LENGTH : " + neededChipsPlayer.length);
    // console.log("REQUESTED : " + chipsRequested);
    // 
    if (neededChipsPlayer == "-1" || neededChipsPlayer.length == 0) {
        // console.log("aligned");
        // aligned, no chips needed
        return (true);
    }

    var requestedChipsPlayer = requestedChips[currentPlayer];
    // remove all spaces and count nr. chips
    requestedChipsPlayer = requestedChipsPlayer.toString().split("-1").join("");
    requestedChipsPlayer = requestedChipsPlayer.toString().split(",").join(" ");
    requestedChipsPlayer = requestedChipsPlayer.toString().split("  ").join(" ");

    // console.log("REQUESTED 2 : " + requestedChipsPlayer);

    // check if the needed chips array is 'matched' in (i.e., part of) the requested chips array
    for (var i = 0; i < neededChipsPlayer.length; i++) {
        // if (chipsRequested.indexOf(neededChipsPlayer[i] - 1) === -1) {
        if (requestedChipsPlayer.indexOf(neededChipsPlayer[i]) === -1) {
            console.log(neededChipsPlayer[i]);
            if (neededChipsPlayer[i] < 0) {
            } else {
                // console.log("chipsRequested " + chipsRequested);
                // console.log("neededChipsPlayer " + neededChipsPlayer);
                // console.log("neededChipsPlayer " + neededChipsPlayer[i]);
                // console.log('not aligned');
                return (false);
            }
        }
    }
    // console.log('aligned');
    return (true);
}

//Update score
function updateScore() {
    var extraChipsPlayer = extraChips[currentPlayer];
    // remove all spaces and count nr. chips
    extraChipsPlayer = extraChipsPlayer.split(" ");
    extraChipsPlayer = extraChipsPlayer.filter(function (v) { return v !== '' }).length;
    // console.log("extraChipsPlayer " + extraChipsPlayer);

    var requestedChipsPlayer = requestedChips[currentPlayer];
    // remove all spaces and count nr. chips
    requestedChipsPlayer = requestedChipsPlayer.split(" ");

    var nrExchangesPlayer = nrExchanges[currentPlayer];

    // neededChipsPlayer = neededChipsPlayer.filter(function (v) { return v !== '' }).length;
    // console.log("neededChipsPlayer " + neededChipsPlayer);

    // Check if path contains the goal
    path = paths[currentPlayer];
    // console.log("Path : " + path);
    // console.log("Goal : " + goalLocation);

    var pathArray = path.split(' ');
    // remove whitespaces
    pathArray = path.replace(/\s+/g, '');

    var pathContainsGoal = false;

    // Check if path contains goal
    for (let index = 0; index < pathArray.length; index = index + 3) {
        i = parseInt(pathArray[index]);
        j = parseInt(pathArray[index + 1]);

        if (i == goalLocation[0] && j == goalLocation[1]) {
            pathContainsGoal = true;
            // return;
        }
    }

    score = "---";

    if (pathContainsGoal == true) {
        //check if path complete
        var complete = pathComplete(currentPlayer);
        //check if player has required chips
        var aligned = chipsAligned(requestedChipsPlayer);

        // console.log(path);

        if (complete && aligned) {
            success[currentPlayer] = 1;
            // score = 100 + 5*extraChips - 70 * number of exchanges - 6 * number of chips requested
            score = 150 + (5 * extraChipsPlayer) - (70 * nrExchangesPlayer) - (6 * nrChipsRequested);
        }
        else {
            success[currentPlayer] = 0;
            score = (5 * extraChipsPlayer) - (70 * nrExchangesPlayer) - (6 * nrChipsRequested);
        }
    } else {
        success[currentPlayer] = 0;
        score = (5 * extraChipsPlayer) - (70 * nrExchangesPlayer) - (6 * nrChipsRequested);
    }

    pathScores[currentPlayer] = parseInt(score);
    setGamestate(requestedChips, extraChips, pathScores, success);
}

function setTarget(i, j) {
    // retrieve goal cell based on cell coordinates
    var target_cell = document.getElementById(i + '-' + j);
    target_cell.className += " target";
    // give the cell a unique marker
    target_cell.innerHTML = "<img class='centerimg gameelement' src='img/Target.png'>";
}

function setPlayers(player, x, y) {
    // loop through array of players (can include any nr of players)
    var player_cell = document.getElementById(x + '-' + y);
    if (player == 0) {
        player_cell.innerHTML = "<img class='centerimg gameelement' src='img/Me.png'>";
    } else {
        filename = "img/A" + player.toString() + ".png";
        player_cell.innerHTML = "<img class='centerimg gameelement' src='" + filename + "'>";
    }
    playerLocations[player] = new Array(x, y);
    player_cell.className += " player ";
    player_cell.className += player.toString();
    // console.log("Player " + player + " added to board.");
}

function isEven(n) {
    return n % 2 == 0;
}

function setInitialChips(chipDistributions) {
    var initial_chips = document.getElementById('initial_chips');
    var player_counter = 0;
    chipDistributions.forEach(function (element, index) {
        if (!isEven(index)) {
            // we only use the second line of this information
            var player = '';
            if (index == 1) {
                player = "Me";
            } else {
                player_counter++;
                player = "Player " + player_counter;
            }

            initial_chips.innerHTML += "<div id=initial_" + index + " style='display:flex'><div class='row_name'>" + player + "</div></div>"; // Print 'player x'

            chip_colours = element.split(" ");

            map_colour = [];
            map_chipnumber = [];

            for (let colour_counter = 0; colour_counter < colours.length; colour_counter++) {
                // count how many of the specific colour we have in our array
                count = 0;
                for (var z = 0; z < chip_colours.length; z++) {
                    if (parseInt(chip_colours[z]) == colour_counter + 1) {
                        count++;
                    }
                }
                cell_colour = colours[colour_counter];
                map_colour.push(cell_colour);
                map_chipnumber.push(count);
            }
            grid = new InitialGrid({
                rows: 1,
                //MOR changed to less colours
                cols: 5,//10, 
                map_colour: map_colour,
                map_chipnumber: map_chipnumber,
                render: {
                    placeholder: "#initial_" + index
                }
            });
        }
    });
}

function setGamestate(requestedChips, extraChips, pathScores, success) {
    var gamestate_table = document.getElementById('gamestate_table');
    $("#gamestate_table tbody .tablerow").remove();

    for (let index = 0; index < nrPlayers; index++) {
        // var neededChipsPlayer = neededChips[index];
        // neededChipsPlayer = neededChipsPlayer.split(" ");
        // neededChipsPlayer = neededChipsPlayer.filter(function (v) { return v !== '' });

        // console.log(requestedChips);
        // alert(requestedChips);

        var requestedChipsPlayer = requestedChips[index];
        if (requestedChipsPlayer != "" && (typeof requestedChipsPlayer !== 'undefined')) {
            requestedChipsPlayer = requestedChipsPlayer.split(" ");
            requestedChipsPlayer = requestedChipsPlayer.filter(function (v) { return v !== '' });
        } else {
            requestedChipsPlayer = "";
        }

        var extraChipsPlayer = extraChips[index];
        extraChipsPlayer = extraChipsPlayer.split(" ");
        extraChipsPlayer = extraChipsPlayer.filter(function (v) { return v !== '' });

        var pathScoresPlayer = parseInt(pathScores[index]);
        // var success = successPlayer.split(" ");
        var successPlayer = success[index];

        var player = '';
        var focus = '';
        var buttonstate = 'btn-outline-primary';
        if (index == 0) {
            player = "Me";
            focus = 'style="font-weight: bold" id="playerScoreText"';
        } else {
            player = "Player " + index;
            focus = '';
        }

        if (currentPlayer == index) {
            buttonstate = 'btn-primary';
        }

        var requested_chips = '';
        for (let colour_counter = 0; colour_counter < colours.length; colour_counter++) {
            count = 0;
            // count how many of the specific colour we have in our array
            for (var z = 0; z < requestedChipsPlayer.length; z++) {
                if (parseInt(requestedChipsPlayer[z]) == colour_counter + 1) {
                    count++;
                }
            }
            if (count != 0) {
                requested_chips += '<div class="cell-colour cell-' + colours[colour_counter] + '">' + count + '</div>';
            }
        }

        var extra_chips = '';
        for (let colour_counter = 0; colour_counter < colours.length; colour_counter++) {
            count = 0;
            // count how many of the specific colour we have in our array
            for (var z = 0; z < extraChipsPlayer.length; z++) {
                if (parseInt(extraChipsPlayer[z]) == colour_counter + 1) {
                    count++;
                }
            }
            if (count != 0) {
                extra_chips += '<div class="cell-colour cell-' + colours[colour_counter] + '">' + count + '</div>';
            }
        }

        if (successPlayer == 1) {
            successPlayer = "Yes";
        } else {
            successPlayer = "No";
        }

        // gamestate_table.innerHTML += '<tr class="tablerow"><td><button class="btn btn-sm ' + buttonstate + '" id="showPlayerBtn' + index + '" onclick="showPlayerPath(\'' + index + '\')">' + player + '</button></td><td>' + successPlayer + '</td><td>' + needed_chips + '</td><td>' + extra_chips + '</td><td>' + extraChipsPlayer.length + '</td><td>' + pathScoresPlayer + '</td></tr>'; // Print 'player x'
        gamestate_table.innerHTML += '<tr class="tablerow"><td><button class="btn btn-sm ' + buttonstate + '" id="showPlayerBtn' + index + '" onclick="showPlayerPath(\'' + index + '\')">' + player + '</button></td><td>' + successPlayer + '</td><td>' + nrExchanges[index] + '</td><td>' + requested_chips + '</td><td>' + extra_chips + '</td><td ' + focus + '>' + pathScoresPlayer + '</td></tr>'; // Print 'player x'
    }
}

function showPlayerPath(player) {
    // set current player (global var)
    currentPlayer = player;

    // change button state
    var pDiv = document.getElementById('gamestate_table');
    var cDiv = pDiv.getElementsByTagName("button");
    for (var i = 0; i < cDiv.length; i++) {
        cDiv[i].classList = "btn btn-sm btn-outline-primary";
    }

    var activeBtn = document.getElementById('showPlayerBtn' + player);
    activeBtn.classList = "btn btn-sm btn-primary";

    // hide all suggestions
    var pDiv = document.getElementById('suggestion_wrapper');
    var cDiv = pDiv.children;
    for (var i = 0; i < cDiv.length; i++) {
        if (cDiv[i].tagName == "DIV") {
            cDiv[i].style.display = 'none';
        }
    }

    // show trade suggestion for player
    var path_cell = document.getElementById('suggestions' + player);
    if (path_cell !== null && path_cell !== '') {
        path_cell.style.display = 'inline';
    }

    setTradeChips(suggestedTrades, player, nrPlayers);

    // show path
    setPaths(player);

    storeProgress("Changed player");
}

function setPaths(player, originalPaths = false) {
    // var path = '';
    if (originalPaths == false) {
        path = paths[player];
    } else {
        path = pathsOriginal[player];
        paths[player] = path;
    }

    var path_array = '';
    path_array = path.split(' ');

    // remove all currently drawn paths
    var pDivGrid = document.getElementById('grid');
    var cDivRows = pDivGrid.children;
    for (var i = 0; i < cDivRows.length; i++) {
        var cDivCells = cDivRows[i].children;
        for (let j = 0; j < cDivCells.length; j++) {
            var cellContent = cDivCells[j].children;
            // check if children (i.e., target or player names)
            if (typeof cellContent[0] !== 'undefined') {
                if (cellContent[0].classList.contains("gameelement")) {
                    $(cellContent[1]).remove("img");
                } else {
                    $(cellContent).remove("img");
                }
            }
        }
    }

    // remove whitespaces
    path_array = path.replace(/\s+/g, '');

    for (let index = 0; index < path_array.length; index = index + 3) {
        // hide first 'path' as they are the player cell?
        if (index == 0) {
            // do nothing
        } else {
            i = parseInt(path_array[index]);
            j = parseInt(path_array[index + 1]);
            hasChip = path_array[index + 2];
            // console.log('i ' + i + ' j ' + j);
            // console.log('i ' + (i - 1) + ' j ' + (j - 1));
            var path_cell = document.getElementById((i) + '-' + (j));

            // set yes/no colour
            if (hasChip == "0") {
                path_cell.innerHTML += '<img class="cross" src="img/cross.png" style="height: 100%; width: 100%" />';
            } else {
                path_cell.innerHTML += '<img class="check" src="img/check.png" style="height: 100%; width: 100%" />';
            }
        }
    }
}

function setTradeChips(suggestedTrades, player, nr_players) {
    // remove all current suggestions
    $("#trade").empty();

    if (player == 0) {
        $("#trade_header").text("My Chip Trade Request");
    } else {
        $("#trade_header").text("Player " + player + " Chip Trade Request");
    }

    var trade_chips = [];

    // if (condition != 0) {
    var suggestedTrade = suggestedTrades[player];
    if (suggestedTrade != undefined) {
        suggestedTrade = suggestedTrade.substring(suggestedTrade.indexOf(" ") + 1);// remove useless info (up to first space)
        suggestedTrade = suggestedTrade.split("Player");

        var string = '';

        nrExchanges[player] = 0;
        nrChipsRequested = 0;

        for (let player_loop = 0; player_loop < nr_players; player_loop++) {
            var player_found = false;

            for (let index = 1; index < suggestedTrade.length; index++) {
                var suggested_trade_array = suggestedTrade[index].split(" ");

                if (player_loop == suggested_trade_array[0]) {
                    player_found = true;

                    console.log("player loop " + player_loop);
                    console.log("suggested_trade_array " + suggested_trade_array[0]);
                    nrExchanges[player]++;
                    var x = [];

                    for (let colour_counter = 0; colour_counter < colours.length; colour_counter++) {
                        var counter = 0;

                        var found_colour = false;
                        for (let index = 1; index < suggested_trade_array.length; index++) {
                            const chip = suggested_trade_array[index];
                            if (chip == colour_counter + 1) {
                                counter++;
                                // have one of this colour
                                found_colour = true;
                                nrChipsRequested++;
                            }
                        }
                        if (found_colour == true) {
                            x.push(counter);
                        } else {
                            x.push(0);
                        }
                    }
                    trade_chips.push(x);
                }
            }
            if (player_found == false) {
                // nothing to trade with this player, add empty array
                trade_chips.push([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
            }
        }
    } else {
        for (let player_loop = 0; player_loop < nr_players; player_loop++) {
            trade_chips.push([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        }
    }

    for (let index = 0; index < nr_players; index++) {
        var trade = document.getElementById('trade');
        // for (let index = 1; index < nr_players; index++) {
        if (index != player) {
            // we don't want to 'trade' with the player we currently 'observe'
            if (index == 0) {
                player_name = "Me";
            } else {
                player_name = "Player " + index;
            }

            trade.innerHTML += "<div class='trade_rows' style='display:flex'><div class='row_name'>Ask " + player_name + " for:</div> <div class='row' id=initialtrade_" + index + " /></div>"; // Print 'player x'

            var trade_grid;
            (function () {
                "use strict";
                trade_grid = new TradeGrid({
                    player: index,
                    trade_chips: trade_chips,
                    render: {
                        placeholder: "#initialtrade_" + index
                    }
                });
            }());
        }
    }
}

function checkTradeChips(playerRequested, chipRequested, currentSpinnerValue) {
    // alert("HI" + playerRequested + " " + chipRequested);
    currentSpinnerValue = parseInt(currentSpinnerValue);
    // what extra chip does player X have?    
    chipRequested = chipRequested + 1;

    var extraChipsPlayer = extraChips[playerRequested];
    extraChipsPlayer = extraChipsPlayer.split(" ");
    extraChipsPlayer = extraChipsPlayer.filter(function (v) { return v !== '' });

    var haveChip = false;

    // should somehow check which chips we are already request from this player
    chipMatchCounter = 0;

    for (let index = 0; index < extraChipsPlayer.length; index++) {
        // console.log("chip requested : " + chipRequested);
        // console.log("extra chips player : " + extraChipsPlayer[index]);
        if (chipRequested == extraChipsPlayer[index]) {
            // alert("have chip!");
            chipMatchCounter++;
        }
    }

    if (chipMatchCounter >= currentSpinnerValue + 1) {
        haveChip = true;
    }

    var playerName = '';
    if (playerRequested == 0) {
        playerName = "You do";
    } else {
        playerName = "Player " + playerRequested + " does";
    }

    storeProgress("ChipRequest;From;" + playerRequested + ";Colour;" + chipRequested + ";ReqNrOfChips;" + (currentSpinnerValue + 1) + ";Success;" + haveChip);

    if (haveChip == false) {
        modalAlert(playerName + " not have that chip as an extra chip. Either choose a different player or change the player's path.");
        return currentSpinnerValue;
    } else {
        // Add to player's extra chips
        extraChips[currentPlayer] += " " + chipRequested + " ";
        // Add to player's requested chips
        requestedChips[currentPlayer] += " " + chipRequested + "  ";
        return (currentSpinnerValue + 1);
    }
}

function checkTradeChipsDown(playerRequested, chipRequested, currentSpinnerValue) {
    requestedChips[currentPlayer] = requestedChips[currentPlayer].toString().split("-1").join("");
    requestedChips[currentPlayer] = requestedChips[currentPlayer].toString().split(",").join(" ");
    requestedChips[currentPlayer] = requestedChips[currentPlayer].toString().split("  ").join(" ");

    var counter = 0;

    path = paths[currentPlayer];

    var pathArray = path.split(' ');
    // remove whitespaces
    pathArray = path.replace(/\s+/g, '');

    for (let index = 0; index < pathArray.length; index = index + 3) {
        // we should not check all the cells of the path, but only the cells which are "X"
        var cell_x = parseInt(pathArray[index + 2]);
        if (cell_x == 0) {
            var path_cell_colour;
            var pathCell = document.getElementById(pathArray[index] + '-' + pathArray[index + 1]);
            for (let colour_counter = 0; colour_counter < colours.length; colour_counter++) {
                if (pathCell.classList[1] == colours[colour_counter]) {
                    // convert colour string to colour number
                    path_cell_colour = colour_counter;

                    if (chipRequested == path_cell_colour) {
                        counter++;
                    }
                }
            }
        }
    }

    if (counter >= currentSpinnerValue) {
        modalAlert("You need that chip for the path marked on the board. Click the cell to remove it before making this trade request.");
        storeProgress("ChipRequest min:;From;" + playerRequested + ";Colour;" + chipRequested + ";ReqNrOfChips;" + (currentSpinnerValue - 1) + ";Success;0");
        return currentSpinnerValue;
    } else {
        // Remove from player's extra chips
        // extraChips[currentPlayer] = extraChips[currentPlayer].replace((chipRequested + 1) + " ", "");
        // Remove from player's requested chips
        requestedChips[currentPlayer] = requestedChips[currentPlayer].replace((chipRequested + 1) + " ", "");
        extraChips[currentPlayer] = extraChips[currentPlayer].replace((chipRequested + 1) + " ", "");
        storeProgress("ChipRequest min:;From;" + playerRequested + ";Colour;" + chipRequested + ";ReqNrOfChips;" + (currentSpinnerValue - 1) + ";Success;1");
        return (currentSpinnerValue - 1);
    }
}

function updatedTradeChips() {
    var trade = document.getElementById('trade');
    trade_rows = trade.children;

    nrExchanges[currentPlayer] = 0;
    nrChipsRequested = 0;
    chipsRequested = [];
    // var players = [];
    var playerChipsRequested = [];
    for (var i = 0; i < nrPlayers; i++) {
        playerChipsRequested[i] = new Array();
    }

    for (var i = 0; i < trade_rows.length; i++) {
        var tradePlayer = false;
        // console.log(trade_rows[i]);
        var spinners = trade_rows[i].children[1].children[0].children;
        for (let j = 0; j < spinners.length; j++) {
            var spinnerValue = parseInt(spinners[j].children[2].children[0].value);
            if (spinnerValue != 0) {
                tradePlayer = true;
                // 'j' represents the colour of the cell we are currently looking at
                // if requested more than one, we need to insert it more than once, so loop over the spinner value
                for (let nrChips = 0; nrChips < spinnerValue; nrChips++) {
                    chipsRequested.push(j);
                    playerChipsRequested[i].push(j);
                    nrChipsRequested++;
                }
            }
        }
        if (tradePlayer == true) {
            nrExchanges[currentPlayer]++;
        }
    }

    updateScore();
}

function setSuggestions(suggestedTrades) {
    var suggestion_wrapper = document.getElementById("suggestion_wrapper");

    suggestedTrades.forEach(function (element, index) {
        var suggestion = '';

        var suggestedTrade = suggestedTrades[index];
        suggestedTrade = suggestedTrade.substring(suggestedTrade.indexOf(" ") + 1);// remove useless info (up to first space)
        suggestedTrade = suggestedTrade.split("Player");

        var player = '';
        if (index == 0) {
            player = "you";
            display = "inline";
        } else {
            player = "Player " + index;
            display = "none";
        }

        var anysuggestions = false;

        suggestion = "The computer assistant suggests " + player + " ask ";
        for (let index = 1; index < suggestedTrade.length; index++) {
            suggestion += "Player " + suggestedTrade[index][0] + " for ";

            var suggested_chips = '';
            var suggested_chips_array = suggestedTrade[index].split(" ");

            for (let colour_counter = 0; colour_counter < colours.length; colour_counter++) {
                count = 0;
                // count how many of the specific colour we have in our array
                for (var z = 1; z < suggested_chips_array.length; z++) {
                    if (parseInt(suggested_chips_array[z]) == colour_counter + 1) {
                        count++;
                    }
                }
                if (count != 0) {
                    anysuggestions = true;
                    suggested_chips += '<div class="cell-colour cell-' + colours[colour_counter] + '">' + count + '</div>';
                }
            }
            suggestion += suggested_chips + " ";
        }
        suggestion += " chips.";

        if (anysuggestions == false) {
            suggestion = "The computer suggests " + player + " to not ask for any chips.";
        }

        suggestion_wrapper.innerHTML += "<div id=suggestions" + index + " style='display: " + display + "'>" + suggestion + "</div>";
    });
}

var minutes;
var seconds;

function startTimer(duration) {
    var timer = duration;
    var display = document.querySelector('#time');

    timeInterval = setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = "Time remaining for this game: " + minutes + ":" + seconds + ".";

        if (minutes < 1 && seconds < 31) {
            if (isEven(seconds)) {
                display.setAttribute("style", "color: red");
            } else {
                display.setAttribute("style", "color: white");
            }
        } else {
            display.setAttribute("style", "color: black");
        }

        if (--timer < 0) {
            timer = 0;
            storeProgress("Time is up!");
            alert("Time is up! Moving to next game.");
            nextGame();
        }
    }, 1000);
    return timeInterval;
}

function clearPath() {
    return function () {
        // remove all currently drawn paths
        var pDivGrid = document.getElementById('grid');
        var cDivRows = pDivGrid.children;
        for (var i = 0; i < cDivRows.length; i++) {
            var cDivCells = cDivRows[i].children;
            for (let j = 0; j < cDivCells.length; j++) {
                var cellContent = cDivCells[j].children;

                // what colour was the cell?
                var selected_colour;
                for (let colour_counter = 0; colour_counter < colours.length; colour_counter++) {
                    if (cDivCells[j].classList[1] == colours[colour_counter]) {
                        selected_colour = colour_counter;
                    }
                }

                // check if children (i.e., target or player names)
                if (typeof cellContent[0] !== 'undefined') {
                    var cellContentId = 0;
                    if (cellContent[0].classList.contains("gameelement")) {
                        cellContentId = 1;
                    }

                    if (typeof cellContent[cellContentId] !== 'undefined') {
                        // update extra chips and needed chips
                        if (cellContent[cellContentId].classList.contains("check")) {
                            extraChips[currentPlayer] += " " + (selected_colour + 1) + " ";
                        }
                        if (cellContent[cellContentId].classList.contains("cross")) {
                            // neededChips[currentPlayer] = neededChips[currentPlayer].replace(selected_colour + 1, "");
                        }
                    }

                    $(cellContent[cellContentId]).remove("img");
                }
            }
        }

        // empty trade suggestions
        var trade = document.getElementById('trade');
        trade_rows = trade.children;

        suggestedTrades[currentPlayer] = '';

        requestedChips[currentPlayer] = '';

        var counter = currentPlayer * 2 + 1;
        extraChips[currentPlayer] = chipDistributions[counter];

        nrExchanges[currentPlayer] = 0;
        nrChipsRequested = 0;
        chipsRequested = [];
        var playerChipsRequested = [];
        for (var i = 0; i < nrPlayers; i++) {
            playerChipsRequested[i] = new Array();
        }

        for (var i = 0; i < trade_rows.length; i++) {
            var spinners = trade_rows[i].children[1].children[0].children;
            for (let j = 0; j < spinners.length; j++) {
                spinners[j].children[2].children[0].value = 0;
            }
        }
        // we want to keep the baseline player cell!
        paths[currentPlayer] = String(paths[currentPlayer]).substring(0, 5);
        setPaths(currentPlayer);
        updatedTradeChips(); // also calls updateScore();
        storeProgress("Clear path");
    }
}

function restoreSuggestedPath() {
    return function () {
        setPaths(currentPlayer, true);

        // console.log("extra chips before original " + extraChips[currentPlayer]);
        extraChips[currentPlayer] = extraChipsOriginal[currentPlayer];
        // console.log("extra chips after original " + extraChips[currentPlayer]);
        // neededChips[currentPlayer] = neededChipsOriginal[currentPlayer];
        requestedChips[currentPlayer] = requestedChipsOriginal[currentPlayer];
        //restore trade suggestions
        suggestedTrades[currentPlayer] = suggestedTradesOriginal[currentPlayer];

        setTradeChips(suggestedTrades, currentPlayer, nrPlayers);

        updatedTradeChips(); // also calls updateScore();

        storeProgress("Restore suggested path");
    }
}

function reset() {
    clearInterval(timer);

    $(".grid").empty();
    $("#initial_chips").empty();
    $("#trade").empty();
    $("#gamestate_table td").empty();
    $("#suggestion_wrapper").empty();

    delete map_colour;
    delete map_chipnumber;

    $('tbody').each(function () {
        $(this).find('td').each(function () {
            if ($(this).text().trim() == "") {
                $(this).closest("tbody").remove();
            };
        });
    });
}

function saveToFile(data) {
    jsonString = String(data);
    jQuery.ajax({
        url: baseurl + '/saveactions.php',
        data: { 'jsonString': jsonString },
        type: 'POST'
    });
}