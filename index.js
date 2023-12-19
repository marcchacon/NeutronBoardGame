// The directions a piece can move
const directions = [
    [-1, -1], // adalt esquerra
    [-1, 0], // adalt
    [-1, 1], // adalt dreta
    [0, -1], // esquerra
    [0, 1], // dreta
    [1, -1], // abaix esquerra
    [1, 0], // abaix
    [1, 1], // abaix dreta
];


// setup pieces
var player1 = jsboard.piece({ text: "P1", textIndent: "-9999px", background: "#E63D30", width: "60px", height: "60px", margin: "0 auto", "border-radius": "50%" });
var player2 = jsboard.piece({ text: "P2", textIndent: "-9999px", background: "#3038E6", width: "60px", height: "60px", margin: "0 auto", "border-radius": "50%" });
var common = jsboard.piece({ text: "CO", textIndent: "-9999px", background: "#039963", width: "60px", height: "60px", margin: "0 auto", "border-radius": "50%" });

// variables for turns, piece to move and its locs
var turn = ["CO", "P1", "CO", "P2"];
var bindMoveLocs, bindMovePiece;
var gamemode, started, win, CPU = false;
var P1, P2, CO = [];
// show new locations 
function showMoves(piece) {
    //console.log(b.cell(piece.parentNode).get())

    // check if game has ended
    if (win) return

    // check if it's the turn of the piece
    if (b.cell(piece.parentNode).get() != turn[0]) {
        alert(`Not your turn! It's ${turn[0]}'s turn!`)
        return
    }

    resetBoard()

    // parentNode is needed because the piece you are clicking 
    // on doesn't have access to cell functions, therefore you 
    // need to access the parent of the piece because pieces are 
    // always contained within in cells
    var loc = b.cell(piece.parentNode).where();
    var newLocs = getMoves(loc);

    // remove illegal moves by checking 
    // content of b.cell().get()
    (function removeIllegalMoves(arr) {
        var fixedLocs = [];
        for (var i = 0; i < arr.length; i++)
            if (b.cell(arr[i]).get() == null)
                fixedLocs.push(arr[i]);
        newLocs = fixedLocs;
    })(newLocs);
    if (newLocs.length == 0 && turn[0] == "CO") {
        alert(`No moves available! ${turn.pop()} wins!`);
        win = true;
    }

    // bind green spaces to movement of piece
    bindMoveLocs = newLocs.slice();
    bindMovePiece = piece;
    bindMoveEvents(bindMoveLocs);


}

/**
 * Creates the listeners and shows the possible moves
 * 
 * @param {Array} locs Possible moves
 */
function bindMoveEvents(locs) {
    for (var i = 0; i < locs.length; i++) {
        switch (turn[0]) {
            case "P1":
                b.cell(locs[i]).DOM().classList.add("red");
                break;
            case "P2":
                b.cell(locs[i]).DOM().classList.add("blue");
                break;
            case "CO":
                b.cell(locs[i]).DOM().classList.add("green");
                break;
        }
        b.cell(locs[i]).on("click", movePiece);
    }
}

/**
 * Move the piece to the clicked location
 * 
 * @return {void}
 */
function movePiece() {
    started = true;
    var userClick = b.cell(this).where();
    if (bindMoveLocs.indexOf(userClick)) {
        b.cell(userClick).place(bindMovePiece);
        switch (turn[0]) {
            case "P1":
                P1.find(piece => piece[0] == bindMovePiece)[1] = userClick;
                break;
            case "P2":
                P2.find(piece => piece[0] == bindMovePiece)[1] = userClick;
                break;
            case "CO":
                CO.find(piece => piece[0] == bindMovePiece)[1] = userClick;
                break;
        }

        resetBoard();

        //Update turn
        var temp = turn.shift();
        turn.push(temp);

        //Update turn text
        switch (turn[0]) {
            case "P1":
                document.getElementById("turn").innerHTML = `It's P1 turn to move`
                break;
            case "P2":
                document.getElementById("turn").innerHTML = `It's P2 turn to move`;
                break;
            case "CO":
                document.getElementById("turn").innerHTML = `It's common piece turn (${turn[1]})`;
                break;
        }

        winCheck();

        if (CPU && turn[1] == "P2") {
            CPUturn();
        }
    }
}

/**
 * Reset the board by removing all green cells and
 * removing all click events.
 * If hard is true, also resets the game
 * 
 * @param {boolean} hard If true, also resets the game
 * @return {void}
 */
function resetBoard(hard = false) {

    if (started && !win && hard) {
        var text = "Do you really want to restart the game?";
        if (!confirm(text)) return
    }

    for (var r = 0; r < b.rows(); r++) {
        for (var c = 0; c < b.cols(); c++) {
            b.cell([r, c]).DOM().classList.remove("green");
            b.cell([r, c]).DOM().classList.remove("blue");
            b.cell([r, c]).DOM().classList.remove("red");
            b.cell([r, c]).removeOn("click", movePiece);

            if (hard) b.cell([r, c]).rid();

            if (gamemode) {
                b.cell([0, c]).style({ background: "pink" });
                b.cell([b.rows() - 1, c]).style({ background: "lightblue" });
            } else {
                b.cell([0, c]).style({ background: "lightblue" });
                b.cell([b.rows() - 1, c]).style({ background: "pink" });
            }
        }
    }

    if (hard) {

        // reset game state
        started = false;
        win = false;

        //put pieces in place
        P1 = [];
        P2 = [];
        CO = [];

        for (let i = 0; i < b.cols(); i++) {

            P1.push([player1.clone(), [b.rows() - 1, i]]);
            P2.push([player2.clone(), [0, i]]);

            b.cell(P2[i][1]).place(P2[i][0]);
            b.cell(P1[i][1]).place(P1[i][0]);

            P1[i][0].addEventListener("click", function () { showMoves(this); });
            P2[i][0].addEventListener("click", function () { showMoves(this); });
        }

        CO.push([common.clone(), [Math.floor((b.rows() - 1) / 2), Math.floor((b.cols() - 1) / 2)]])
        b.cell(CO[0][1]).place(CO[0][0]);
        CO[0][0].addEventListener("click", function () { showMoves(this); });
        if (b.rows() % 2 == 1 && b.rows() > 5) {
            CO.push([common.clone(), [Math.floor((b.rows() - 1) / 2), Math.floor((b.cols() - 1) / 2) + 1]])

            b.cell([Math.floor((b.rows() - 1) / 2), ((b.rows() - 1) / 2) - 1]).place(CO[0][0]);
            b.cell([Math.floor((b.rows() - 1) / 2), ((b.rows() - 1) / 2) + 1]).place(CO[1][0]);
            CO[1][0].addEventListener("click", function () { showMoves(this); });
        }

        // variables for turns, piece to move and its locs
        turn = ["CO", "P1", "CO", "P2"];
    }
}

/**
 * Aux function to get the gameboard
 * 
 * @returns {Array} Gameboard, 0 = empty, 1 = P1, 2 = P2, 3 = CO
 */
function getGameboard() {

    game = b.matrix()

    game.forEach((row, index) => {
        row.forEach((col, index2) => {
            switch (col) {
                case null:
                    game[index][index2] = "0";
                    break;
                case "P1":
                    game[index][index2] = "1";
                    break;
                case "P2":
                    game[index][index2] = "2";
                    break;
                case "CO":
                    game[index][index2] = "3";
                    break;
            }
        });
    });

    //console.log("GAMEBOARD DONE: " + game)

    return game
}
/**
 *  Get pieces possible moves
 * 
 * @param {Array} piece Piece position
 * @param {Array} game Gameboard, default current gameboard
 * @returns {Array} Possible moves, empty if no moves
 */
function getMoves(piece, game = getGameboard()) {

    var moves = []

    directions.forEach((dir) => {
        var newpos = piece

        while (Array.isArray(game[newpos[0] + dir[0]])) {

            //console.log("seguent casella: " + (game[newpos[0] + dir[0]][newpos[1] + dir[1]]) + "  pot avançar?  " + (game[newpos[0] + dir[0]][newpos[1] + dir[1]] === "0"))

            if (game[newpos[0] + dir[0]][newpos[1] + dir[1]] === "0") {
                newpos = [newpos[0] + dir[0], newpos[1] + dir[1]];
            } else break

        }
        if (newpos !== piece) moves.push(newpos);
    });

    return moves
}

/**
 * Check if someone has won
 * If gamemode is true, P1 wins if he reaches the P2 side
 */
function winCheck() {
    var game = getGameboard()

    if (game[0].includes("3")) {
        win = true
        alert(`${gamemode ? "P1 WINS" : "P2 WINS"}`);
        document.getElementById("turn").innerHTML = `${gamemode ? "P1 WINS" : "P2 WINS"}`;
    } else if (game[b.rows() - 1].includes("3")) {
        win = true
        alert(`${gamemode ? "P2 WINS" : "P1 WINS"}`);
        document.getElementById("turn").innerHTML = `${gamemode ? "P2 WINS" : "P1 WINS"}`;

    }
}
/**
 * Init table to an Empty table
 */
function initTable(size = 5) {
    var table = document.getElementById("game");
    while (table.rows.length > 0) {
        table.deleteRow(0);
    }

    b = jsboard.board({ attach: "game", size: `${size}x${size}` });
    b.cell("each").style({ width: "65px", height: "65px" });
    started = false;
    resetBoard(true);


}


//Listeners for UI buttons
document.getElementById("reset").addEventListener("click", function () { resetBoard(true); });
document.getElementById("gamemodeN").addEventListener("click", function () {
    gamemode = false;
    resetBoard(true);
    this.disabled = true;
    document.getElementById("gamemodeI").disabled = false;

});
document.getElementById("gamemodeI").addEventListener("click", function () {
    gamemode = true;
    resetBoard(true);
    this.disabled = true;
    document.getElementById("gamemodeN").disabled = false;
});
document.getElementById("size5").addEventListener("click", function () {
    initTable();
    this.disabled = true;
    document.getElementById("size7").disabled = false;
});
document.getElementById("size7").addEventListener("click", function () {
    initTable(7);
    this.disabled = true;
    document.getElementById("size5").disabled = false;
});
document.getElementById("CPU").addEventListener("click", function () {
    CPU = true;
    this.disabled = true;
    document.getElementById("2P").disabled = false;
});
document.getElementById("2P").addEventListener("click", function () {
    CPU = false;
    this.disabled = true;
    document.getElementById("CPU").disabled = false;
});
// create board
initTable();  // 5x5 board

//CPU
//TODO: implement CPU using minimax algorithm
/**
 * 
 * minimax logic for common piece:
 * - If the user wins -1 (depth 1)

- If it makes the user win without the option to cover it 1 (depth 2)
- If it does not make the user win but the user can block piece 2 (depth 4)

- If it makes the user win but can be covered: 5 (depth 2)

//path is the route for the user to win
- If a piece of the user covers the path: 6 (depth 1)
- If two pieces cover the path: 7 (depth 1)

- If it makes the CPU win but the user can avoid it in vertical/horizontal 8 (depth 3)
- If it makes the CPU win but the user can avoid it in diagonal 9 (depth 3)
- If it makes the CPU win and the user can't cover it 10 (depth 3)

- If the user is forced to move the piece in the direction that makes the CPU win 11 (depth 3)
- If the CPU can block piece 11 (depth 3)
- If the CPU wins 11 (depth 1)
 */

/**
 * DEPRECATED
 * Original CPU turn function
 */
function CPUturn_OLD() {
    var game = getGameboard();
    var [commonloc, , CPUPieces] = getPicecesLocs(game);
    var gameTree = {};
    var bestMove = {};

    commonloc.forEach((CommonFirstLoc) => {
        CommonFirstLocKey = `Common-${CommonFirstLoc[0]}-${CommonFirstLoc[1]}`;
        gameTree[CommonFirstLocKey] = { points: null, bestMove: {}, moves: {} };
        var commonmoves = getMoves(CommonFirstLoc, game);


        commonmoves.forEach((CommonFirstMove) => {

            var newgameD1 = game.map(arr => [...arr]);
            newgameD1[commonloc[0][0]][commonloc[0][1]] = "0";
            newgameD1[CommonFirstMove[0]][CommonFirstMove[1]] = "3";

            var commonFirstMoveKey = `MoveTo-${CommonFirstMove[0]}-${CommonFirstMove[1]}`;
            gameTree[CommonFirstLocKey].moves[commonFirstMoveKey] = { points: null, bestMove: {}, moves: {} };

            if (winCheckCPU(newgameD1) == "P1") {
                gameTree[CommonFirstLocKey].moves[commonFirstMoveKey].points = -1;
                gameTree[CommonFirstLocKey].moves[commonFirstMoveKey].bestMove.points = -1;
            } else if (winCheckCPU(newgameD1) == "CPU") {
                gameTree[CommonFirstLocKey].moves[commonFirstMoveKey].points = 11;
                gameTree[CommonFirstLocKey].moves[commonFirstMoveKey].bestMove.points = 11;
            } else {

                CPUPieces.forEach((CPUPiece) => {
                    var CPUMove = getMoves(CPUPiece, newgameD1.map(arr => [...arr]));

                    var CPUPieceKey = `Piece-${CPUPiece[0]}-${CPUPiece[1]}`;
                    gameTree[CommonFirstLocKey].moves[commonFirstMoveKey].moves[CPUPieceKey] = { points: null, bestMove: {}, moves: {} };

                    CPUMove.forEach((CPUPieceMove) => {
                        var newgameD2 = newgameD1.map(arr => [...arr]);
                        newgameD2[CPUPiece[0]][CPUPiece[1]] = "0";
                        newgameD2[CPUPieceMove[0]][CPUPieceMove[1]] = "2";

                        var CPUMoveKey = `MoveTo-${CPUPieceMove[0]}-${CPUPieceMove[1]}`;
                        gameTree[CommonFirstLocKey].moves[commonFirstMoveKey].moves[CPUPieceKey].moves[CPUMoveKey] = { points: null, bestMove: {}, moves: {} };

                        var [commonloc2, ,] = getPicecesLocs(newgameD2);

                        commonloc2.forEach((CommonSecondLoc) => {
                            var commonloc2Key = `Common-${CommonSecondLoc[0]}-${CommonSecondLoc[1]}`;
                            gameTree[CommonFirstLocKey].moves[commonFirstMoveKey].moves[CPUPieceKey].moves[CPUMoveKey].moves[commonloc2Key] = { points: null, bestMove: {}, moves: {} };

                            var commonmoves2 = getMoves(CommonSecondLoc, newgameD2);
                            commonmoves2.forEach((NeutronMove2) => {
                                var newgameD3 = newgameD2.map(arr => [...arr]);
                                newgameD3[commonloc2[0][0]][commonloc2[0][1]] = "0";
                                newgameD3[NeutronMove2[0]][NeutronMove2[1]] = "3";

                                var commonMove2Key = `MoveTo-${NeutronMove2[0]}-${NeutronMove2[1]}`;
                                gameTree[CommonFirstLocKey].moves[commonFirstMoveKey].moves[CPUPieceKey].moves[CPUMoveKey].moves[commonloc2Key].moves[commonMove2Key] = { points: null, bestMove: {}, moves: {} };

                                var points = 11
                                if (winCheckCPU(newgameD3) == "P1") {
                                    points = 1;
                                } else if (winCheckCPU(newgameD3) == "CPU") {
                                    points = 8;
                                } else {
                                    points = 5;
                                }
                                gameTree[CommonFirstLocKey].moves[commonFirstMoveKey].moves[CPUPieceKey].moves[CPUMoveKey].moves[commonloc2Key].moves[commonMove2Key].points = points;

                                //Here we check if the move is better than the previous one
                                //As the player is who moves the common piece, we want to minimize the points
                                if (points < gameTree[CommonFirstLocKey].moves[commonFirstMoveKey].moves[CPUPieceKey].moves[CPUMoveKey].moves[commonloc2Key].bestMove.points || gameTree[CommonFirstLocKey].moves[commonFirstMoveKey].moves[CPUPieceKey].moves[CPUMoveKey].moves[commonloc2Key].bestMove.points == undefined) {
                                    gameTree[CommonFirstLocKey].moves[commonFirstMoveKey].moves[CPUPieceKey].moves[CPUMoveKey].moves[commonloc2Key].bestMove = { move: commonMove2Key, points: points };
                                }
                            });

                            //Here we check if the move is better than the previous one
                            //As the CPU is who moves the common piece, we want to mazimize the points
                            if (gameTree[CommonFirstLocKey].moves[commonFirstMoveKey].moves[CPUPieceKey].moves[CPUMoveKey].bestMove.points < gameTree[CommonFirstLocKey].moves[commonFirstMoveKey].moves[CPUPieceKey].moves[CPUMoveKey].moves[commonloc2Key].bestMove.points || gameTree[CommonFirstLocKey].moves[commonFirstMoveKey].moves[CPUPieceKey].moves[CPUMoveKey].bestMove.points == undefined) {
                                gameTree[CommonFirstLocKey].moves[commonFirstMoveKey].moves[CPUPieceKey].moves[CPUMoveKey].bestMove = { move: commonloc2Key, points: gameTree[CommonFirstLocKey].moves[commonFirstMoveKey].moves[CPUPieceKey].moves[CPUMoveKey].moves[commonloc2Key].bestMove.points };
                            }

                        });

                        //Here we check if the move is better than the previous one
                        //As the CPU is who moves the common piece, we want to mazimize the points
                        if (gameTree[CommonFirstLocKey].moves[commonFirstMoveKey].moves[CPUPieceKey].bestMove.points < gameTree[CommonFirstLocKey].moves[commonFirstMoveKey].moves[CPUPieceKey].moves[CPUMoveKey].bestMove.points || gameTree[CommonFirstLocKey].moves[commonFirstMoveKey].moves[CPUPieceKey].bestMove.points == undefined) {
                            gameTree[CommonFirstLocKey].moves[commonFirstMoveKey].moves[CPUPieceKey].bestMove = { move: CPUMoveKey, points: gameTree[CommonFirstLocKey].moves[commonFirstMoveKey].moves[CPUPieceKey].moves[CPUMoveKey].bestMove.points };
                        }

                    });

                    //Here we check if the move is better than the previous one
                    //As the CPU is who moves the common piece, we want to mazimize the points
                    if (gameTree[CommonFirstLocKey].moves[commonFirstMoveKey].bestMove.points < gameTree[CommonFirstLocKey].moves[commonFirstMoveKey].moves[CPUPieceKey].bestMove.points || gameTree[CommonFirstLocKey].moves[commonFirstMoveKey].bestMove.points == undefined) {
                        gameTree[CommonFirstLocKey].moves[commonFirstMoveKey].bestMove = { move: CPUPieceKey, points: gameTree[CommonFirstLocKey].moves[commonFirstMoveKey].moves[CPUPieceKey].bestMove.points };
                    }
                });
            }

            //Here we check if the move is better than the previous one
            //As the CPU is who moves the common piece, we want to mazimize the points
            //console.log(gameTree[CommonFirstLocKey].moves[commonFirstMoveKey].bestMove.points)
            if (gameTree[CommonFirstLocKey].bestMove.points < gameTree[CommonFirstLocKey].moves[commonFirstMoveKey].bestMove.points || gameTree[CommonFirstLocKey].bestMove.points == undefined) {
                gameTree[CommonFirstLocKey].bestMove = { move: commonFirstMoveKey, points: gameTree[CommonFirstLocKey].moves[commonFirstMoveKey].bestMove.points };
            }

        });

        //Here we check if the move is better than the previous one
        //As the CPU is who moves the common piece, we want to mazimize the points
        if (bestMove.points < gameTree[CommonFirstLocKey].bestMove.points || bestMove.points == undefined) {
            bestMove = { move: CommonFirstLocKey, points: gameTree[CommonFirstLocKey].bestMove.points };
        }
    });
    

    console.log(gameTree);

    //Wait half a second to move the piece
    setTimeout(() => {
        var CommonPos = bestMove.move.split("-").slice(1).map(Number);
        var CommonMove = gameTree[bestMove.move].bestMove.move.split("-").slice(1).map(Number);
        movePieceCPU(CommonPos, CommonMove);

        //Wait half a second to move the piece
        setTimeout(() => {
            var CPUPiece = gameTree[bestMove.move].moves[gameTree[bestMove.move].bestMove.move].bestMove.move.split("-").slice(1).map(Number);
            var CPUMove = gameTree[bestMove.move].moves[gameTree[bestMove.move].bestMove.move].moves[gameTree[bestMove.move].moves[gameTree[bestMove.move].bestMove.move].bestMove.move].bestMove.move.split("-").slice(1).map(Number);
            movePieceCPU(CPUPiece, CPUMove);
        }, 500);
    }, 500);

    // Ara gameTree conté l'arbre de joc amb les puntuacions per a cada estat del joc.
    // Pots utilitzar aquest arbre per a seleccionar el millor moviment.
}
/**
 * DEPRECATED
 * Second CPU turn function
 */
function CPUturn_OLDV2() {
    var game = getGameboard();
    var gameTree = CreateTree({}, game);
    // [original pos, new pos]
    var bestMove = [];
    var bestCPUMove = [];
    
    Object.keys(gameTree).forEach((CommonFirstLocKey) => {
        bestMove[0] = CommonFirstLocKey.split("-").slice(1).map(Number);
        bestMove[1] = gameTree[CommonFirstLocKey].bestMove.move.split("-").slice(1).map(Number);

        bestCPUMove[0] = gameTree[CommonFirstLocKey].moves[gameTree[CommonFirstLocKey].bestMove.move].bestMove.move.split("-").slice(1).map(Number);
        bestCPUMove[1] = gameTree[CommonFirstLocKey].moves[gameTree[CommonFirstLocKey].bestMove.move].moves[gameTree[CommonFirstLocKey].moves[gameTree[CommonFirstLocKey].bestMove.move].bestMove.move].bestMove.move.split("-").slice(1).map(Number);
    });

    console.log("tree:", gameTree);
    console.log("bestMove:", bestMove);
    console.log("bestCPUMove:", bestCPUMove);

    //Wait half a second to move the piece
    setTimeout(() => {

        movePieceCPU(bestMove[0], bestMove[1]);

        //Wait half a second to move the piece
        setTimeout(() => {
            movePieceCPU(bestCPUMove[0], bestCPUMove[1]);
        }, 500);
    }, 500);

    // Ara gameTree conté l'arbre de joc amb les puntuacions per a cada estat del joc.
    // Pots utilitzar aquest arbre per a seleccionar el millor moviment.
}

/**
 * Current CPU turn function
 */
function CPUturn() {
    var game = getGameboard();
    var gameTree = new MoveNode(null, game);
    gameTree.selections = CreateTree(gameTree.selections, game);
    // [original pos, new pos]
    var points = -Infinity
    var bestMove = [];
    var bestCPUMove = [];
    
    Object.keys(gameTree.selections).forEach((tmpselection) => {
        let selection = gameTree.selections[tmpselection];
        selection.getPoints()
        console.log("tree:", gameTree);
        console.log("selection",selection.getPoints())

        if (selection.getPoints() > points) {
            points = selection.getPoints();

            bestMove[0] = selection.getSelection();
            bestMove[1] = selection.getBestMove().getMove();

            var temp = selection.getBestMove().getBestSelection()

            bestCPUMove[0] = temp.getSelection();
            bestCPUMove[1] = temp.getBestMove().getMove();
        }
    });

    console.log("tree:", gameTree);
    console.log("bestMove:", bestMove);
    console.log("bestCPUMove:", bestCPUMove);

    //Wait half a second to move the piece
    setTimeout(() => {

        movePieceCPU(bestMove[0], bestMove[1]);

        //Wait half a second to move the piece
        setTimeout(() => {
            movePieceCPU(bestCPUMove[0], bestCPUMove[1]);
        }, 500);
    }, 500);

    // Ara gameTree conté l'arbre de joc amb les puntuacions per a cada estat del joc.
    // Pots utilitzar aquest arbre per a seleccionar el millor moviment.
}

/**
 * DEPRECATED
 * Old function to create the tree
 * @param {Array} tree Tree to create
 * @param {*} game GameBoard
 * @param {*} turnCPU Turn State
 * @param {*} depth Depth of the tree
 * @param {*} maxdepth Depth of the original tree
 * @returns {Array} Tree Created
 */
function CreateTree_OLD (tree, game, turnCPU = ["3", "2", "3", "1"], depth = 4, maxdepth = 4) {
    console.log(turnCPU[0])
    if (depth == 0) {
        return tree;
    } else {
        switch (turnCPU[0]) {
            case "1":
                var locs = getPicecesLocs(game)[1];
                break;
            case "2":
                var locs = getPicecesLocs(game)[2];
                break;
            case "3":
                var locs = getPicecesLocs(game)[0];
                break;
        }
        
        locs.forEach((FirstLoc) => {
            var FirstLocKey = `${turnCPU[0]}-${FirstLoc[0]}-${FirstLoc[1]}`;
            tree[FirstLocKey] = { points: 5, bestMove: {}, moves: {} };
            var posMoves = getMoves(FirstLoc, game);

            posMoves.forEach((FirstMove) => {
                var FirstMoveKey = `MoveTo-${FirstMove[0]}-${FirstMove[1]}`;
                tree[FirstLocKey].moves[FirstMoveKey] = { points: 5, bestMove: {}, moves: {} };

                var newgameD1 = game.map(arr => [...arr]);
                newgameD1[FirstLoc[0]][FirstLoc[1]] = "0";
                newgameD1[FirstMove[0]][FirstMove[1]] = turnCPU[0];

                var newturnCPU = turnCPU.map(arr => arr);
                console.log(newturnCPU)
                var temp = newturnCPU.shift();
                newturnCPU.push(temp);

                var points = 5;
                switch (winCheckCPU(newgameD1)) {
                    case "P1":
                        points = -10 + (maxdepth - depth);
                        tree[FirstLocKey].moves[FirstMoveKey].points = points;
                        tree[FirstLocKey].moves[FirstMoveKey].bestMove.points = points;
                        break;
                    case "CPU":
                        points = 20 - (maxdepth - depth);
                        tree[FirstLocKey].moves[FirstMoveKey].points = points;
                        tree[FirstLocKey].moves[FirstMoveKey].bestMove.points = points;
                        break;
                    default:
                        tree[FirstLocKey].moves[FirstMoveKey].moves = CreateTree(tree[FirstLocKey].moves[FirstMoveKey].moves, newgameD1, newturnCPU, depth - 1, maxdepth);

                        if (tree[FirstLocKey].moves[FirstMoveKey].moves != {}) {
                            var tempTree = tree[FirstLocKey].moves[FirstMoveKey].moves;
                            
                            Object.keys(tempTree).forEach((move) => {
                                if (tempTree[move].points == undefined) {
                                    points = 5;
                                } else if (tempTree[move].points > points) {
                                    points = tempTree[move].points;
                                }
    
                                if (tree[FirstLocKey].moves[FirstMoveKey].bestMove.points == undefined || points > tree[FirstLocKey].moves[FirstMoveKey].bestMove.points) {
                                    tree[FirstLocKey].moves[FirstMoveKey].bestMove = { move: move, points: points };
                                }
                            });
                        } else {
                            points = 5;
                            tree[FirstLocKey].moves[FirstMoveKey].points = points;
                            tree[FirstLocKey].moves[FirstMoveKey].bestMove.points = points;
                        }
                        break;
                }
            });

            var tempTree = tree[FirstLocKey].moves;
            console.log("tempTree", tempTree)
            var points = null;
            Object.keys(tempTree).forEach((move) => {
                 if (tempTree[move].bestMove.points > points || points == null) {
                    points = tempTree[move].bestMove.points;
                    tree[FirstLocKey].bestMove = { move: move, points: tempTree[move].bestMove.points };
                    tree[FirstLocKey].points = tempTree[move].bestMove.points;  
                }
            })
            

        });

        return tree;
    }
}

/**
 * Creates tree using Classes
 * Minimax algorithm
 * @param {Object} tree The MoveNode.selection object
 * @param {Array} game GameBoard 
 * @param {Array} turnCPU Turn State, 1 = P1, 2 = P2, 3 = CO. Default ["3", "2", "3", "1"] 
 * @param {*} depth Depth of the tree. Default 4
 * @param {*} maxdepth Depth of the original tree. Default 4
 * @returns 
 */
function CreateTree (tree, game, turnCPU = ["3", "2", "3", "1"], depth = 4, maxdepth = 4) {
    if (depth == 0) return {};
    switch (turnCPU[0]) {
        case "1":
            var locs = getPicecesLocs(game)[1];
            break;
        case "2":
            var locs = getPicecesLocs(game)[2];
            break;
        case "3":
            var locs = getPicecesLocs(game)[0];
            break;
    }  

    locs.forEach((FirstLoc, index) => {
        var LocNode = new SelectionNode(FirstLoc, game, turnCPU);
        tree[`Selection-${index}`] = LocNode;

        var posMoves = getMoves(FirstLoc, game);

        posMoves.forEach((FirstMove) => {
            var newgameD1 = game.map(arr => [...arr]);
            newgameD1[FirstLoc[0]][FirstLoc[1]] = "0";
            newgameD1[FirstMove[0]][FirstMove[1]] = turnCPU[0];

            var MovNode = new MoveNode(FirstMove, newgameD1, LocNode);
            LocNode.addMove(MovNode);

            var newturnCPU = turnCPU.map(arr => arr);
            var temp = newturnCPU.shift();
            newturnCPU.push(temp);

            switch (winCheckCPU(newgameD1)) {
                case "P1":
                    MovNode.setPoints(-10 + (maxdepth - depth));
                    break;
                case "CPU":
                    MovNode.setPoints(20 - (maxdepth - depth));
                    break;
                default:
                    MovNode.selections = CreateTree(MovNode.selections, newgameD1, newturnCPU, depth - 1, maxdepth);

                    if (Object.keys(MovNode.selections).length !== 0) {
                        switch (turnCPU[1]) {
                            case "1":
                                let tempString = MovNode.calculateBestSelection(true);
                                console.log("MovNode tempString", tempString)
                                if (tempString !== undefined) {
                                    MovNode.setBestSelection(tempString);
                                } else MovNode.setPoints(20 - (maxdepth - depth));

                                break;
                            case "2":
                            default:
                                let tempString2 = MovNode.calculateBestSelection(false);
                                console.log("MovNode tempString2", tempString2)
                                if (tempString2 !== undefined) {
                                    MovNode.setBestSelection(tempString2);
                                } else MovNode.setPoints(-10 + (maxdepth - depth));
                                break;
                        }
                    } else MovNode.setPoints(5);
                    break;
            }
            
        })

        switch (turnCPU[1]) {
            case "1":
                let tempString = LocNode.calculateBestMove(true);
                console.log("LocNode tempString", tempString)
                if (tempString !== undefined) {
                    LocNode.setBestMove(tempString);
                } else LocNode.setPoints(5);
                break;
            case "2":
            default:
                let tempString2 = LocNode.calculateBestMove(false);
                console.log("LocNode tempString2", tempString2)
                if (tempString2 !== undefined) {
                    LocNode.setBestMove(tempString2);
                } else LocNode.setPoints(5);
                break;
        }
    })
    return tree;
    
}
function getPicecesLocs(board = getGameboard()) {
    var commonloc = []
    var P1locs = []
    var P2locs = []

    board.forEach((row, index) => {
        row.forEach((col, index2) => {
            switch (col) {
                case "1":
                    P1locs.push([index, index2]);
                    break;
                case "2":
                    P2locs.push([index, index2]);
                    break;
                case "3":
                    commonloc.push([index, index2]);
                    break;
            }
        });
    });

    return [commonloc, P1locs, P2locs]
}

/**
 * Aux function for CPU to check if someone has won
 * 
*/
function winCheckCPU(game) {
    if (game[0].includes("3")) {
        return "CPU"
    } else if (game[b.rows() - 1].includes("3")) {
        return "P1"
    }
    return false
}

/**
 * Aux function for CPU to move the pieces
 * 
 * @param {Array} pieceOrigin Piece position
 * @param {Array} loc New location
 * @return {void}
 */
function movePieceCPU(pieceOrigin, loc) {
    started = true;
    var pieceValue = b.cell(pieceOrigin).get();
    switch (pieceValue) {
        case "P1":
            var piece = P1.find(temp => temp[1].toString() == pieceOrigin.toString())
            break;
        case "P2":
            var piece = P2.find(temp => temp[1].toString() == pieceOrigin.toString())
            break;
        case "CO":
            var piece = CO.find(temp => temp[1].toString() == pieceOrigin.toString())
            break;
        default:
            return;
    }
    piece[1] = loc;
    b.cell(loc).place(piece[0]);
    resetBoard();

    //Update turn
    var temp = turn.shift();
    turn.push(temp);

    //Update turn text
    switch (turn[0]) {
        case "P1":
            document.getElementById("turn").innerHTML = `It's P1 turn to move`
            break;
        case "P2":
            document.getElementById("turn").innerHTML = `It's P2 turn to move`;
            break;
        case "CO":
            document.getElementById("turn").innerHTML = `It's common piece turn (${turn[1]})`;
            break;
    }

    winCheck();

}