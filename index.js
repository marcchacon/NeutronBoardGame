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
var player1 = jsboard.piece({ text: "P1", textIndent: "-9999px", background: "red", width: "50px", height: "50px", margin: "0 auto" });
var player2 = jsboard.piece({ text: "P2", textIndent: "-9999px", background: "blue", width: "50px", height: "50px", margin: "0 auto" });
var common = jsboard.piece({ text: "CO", textIndent: "-9999px", background: "green", width: "50px", height: "50px", margin: "0 auto" });

// variables for turns, piece to move and its locs
var turn = ["CO", "P1", "CO", "P2"];
var bindMoveLocs, bindMovePiece;
var gamemode = false;
var started = false;
var win = false;
var P1 = [];
var P2 = [];

// create board
initTable();  // 5x5 board

// show new locations 
function showMoves(piece) {
    //console.log(b.cell(piece.parentNode).get())
    if (b.cell(piece.parentNode).get() != turn[0]) {
        alert(`Not your turn! It's ${turn[0]}'s turn!`)
        return
    }
    //Reset board
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
    if (newLocs.length == 0) alert(`No moves available! ${turn.pop()} wins!`);
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
        resetBoard();

        var temp = turn.shift();
        turn.push(temp);
        switch (turn[0]) {
            case "P1":
                document.getElementById("turn").innerHTML = `P1 turn to move`
                break;
            case "P2":
                document.getElementById("turn").innerHTML = `P2 turn to move`;
                break;
            case "CO":
                document.getElementById("turn").innerHTML = `common piece turn (${turn[1]})`;
                break;
        }

        winCheck();
    }
}

/**
 * Reset the board by removing all green cells and
 * removing all click events
 * 
 * @param {boolean} hard If true, also resets the game
 * @return {void}
 */
function resetBoard(hard = false) {

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

        //config reset
        if (started && !win) {
            var text = "Do you really want to restart the game?";
            if (!confirm(text)) return
        }
        
        // reset game state
        started = false;
        win = false;
        
        //put pieces in place
        var P1 = [];
        var P2 = [];
        for (let i = 0; i < b.cols(); i++) {
            P1.push(player1.clone());
            P2.push(player2.clone());
            b.cell([0, i]).place(P2[i]);
            P1[i].addEventListener("click", function () { showMoves(this); });
            P2[i].addEventListener("click", function () { showMoves(this); });
            b.cell([b.rows() - 1, i]).place(P1[i]);
        }

        var co = common.clone();
        b.cell([Math.floor((b.rows()-1)/2), Math.floor((b.cols()-1)/2)]).place(co);
        co.addEventListener("click", function () { showMoves(this); });
        if (b.rows() % 2 == 1 && b.rows() > 5) {
            var co2 = common.clone();
            
            b.cell([Math.floor((b.rows()-1)/2), ((b.rows()-1)/2)-1]).place(co);
            b.cell([Math.floor((b.rows()-1)/2), ((b.rows()-1)/2)+1]).place(co2);
            co2.addEventListener("click", function () { showMoves(this); });
        }

        // variables for turns, piece to move and its locs
        turn = ["CO", "P1", "CO", "P2"];
    }
}

/**
 * Aux function to get the gameboard
 * 
 * @returns {Array} Gameboard
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
 * @returns {Array} Possible moves, empty if no moves
 */
function getMoves(piece) {

    var game = getGameboard()
    var moves = []

    directions.forEach((dir, index) => {
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
 */
function winCheck() {
    var game = getGameboard()
    if (game[0].includes("3")) {
        win = true
        if (gamemode) alert("P1 WINS")
        else alert("P2 WINS")
    } else if (game[b.rows() - 1].includes("3")) {
        win = true
        if (gamemode) alert("P2 WINS")
        else alert("P1 WINS")
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

    b = jsboard.board({ attach: "game", size: `${size}x${size}`});
    b.cell("each").style({ width: "65px", height: "65px" });
    started = false;
    resetBoard(true);

}


//Listeners
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