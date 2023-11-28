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


// create board
var b = jsboard.board({ attach: "game", size: "5x5" });
b.cell("each").style({ width: "65px", height: "65px" });

// setup pieces
var player1 = jsboard.piece({ text: "J1", textIndent: "-9999px", background: "red", width: "50px", height: "50px", margin: "0 auto" });
var player2 = jsboard.piece({ text: "J2", textIndent: "-9999px", background: "blue", width: "50px", height: "50px", margin: "0 auto" });
var common = jsboard.piece({ text: "CO", textIndent: "-9999px", background: "green", width: "50px", height: "50px", margin: "0 auto" });



// variables for turns, piece to move and its locs
var turn = ["CO", "J1", "CO", "J2"];
var bindMoveLocs, bindMovePiece;
var gamemode = false;
var started = false;

// put pieces on board
var j1 = [];
var j2 = [];
resetBoard(true);

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
        for (var i=0; i<arr.length; i++) 
            if (b.cell(arr[i]).get()==null)
                fixedLocs.push(arr[i]); 
        newLocs = fixedLocs;
    })(newLocs); 
    if (newLocs.length==0) alert(`No moves available! ${turn.pop()} wins!`);
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
    for (var i=0; i<locs.length; i++) {
        switch (turn[0]) {
            case "J1":
                b.cell(locs[i]).DOM().classList.add("red");
                break;
            case "J2":
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
    if (hard && started){
        var text = "Do you really want to restart the game?";
        if (!confirm(text)) return
    }
    for (var r=0; r<b.rows(); r++) {
        for (var c=0; c<b.cols(); c++) {
            b.cell([r,c]).DOM().classList.remove("green");
            b.cell([r,c]).DOM().classList.remove("blue");
            b.cell([r,c]).DOM().classList.remove("red");
            b.cell([r,c]).removeOn("click", movePiece);
            if (hard) b.cell([r,c]).rid();
            if(gamemode) {
                b.cell([0,c]).style({background: "pink" });
                b.cell([b.rows()-1,c]).style({background: "lightblue" });
            } else {
                b.cell([0,c]).style({background: "lightblue" });
                b.cell([b.rows()-1,c]).style({background: "pink" });
            }
        }
    }
    if (hard) {
        // put pieces on board
        started = false;
        var j1 = [];
        var j2 = [];
        for (let i = 0; i < b.cols(); i++) {
            console.log(gamemode)
            j1.push(player1.clone());
            j2.push(player2.clone());
            b.cell([0,i]).place(j2[i]);
            j1[i].addEventListener("click", function () { showMoves(this); });
            j2[i].addEventListener("click", function () { showMoves(this); });
            b.cell([b.rows()-1,i]).place(j1[i]);
        }
        var co = common.clone();
        b.cell([2,2]).place(co);
        co.addEventListener("click", function () { showMoves(this); });
        if (b.rows() == 7) {
        var co2 = common.clone();
        b.cell([3,2]).place(co);
        b.cell([3,4]).place(co2);
        co2.addEventListener("click", function () { showMoves(this); });
        }



        // variables for turns, piece to move and its locs
        turn = ["CO", "J1", "CO", "J2"];
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
                case "J1":
                    game[index][index2] = "1";
                    break;
                case "J2":
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

            stopWhile = false

            //console.log("seguent casella: " + (game[newpos[0] + dir[0]][newpos[1] + dir[1]]) + "  pot avançar?  " + (game[newpos[0] + dir[0]][newpos[1] + dir[1]] === "0"))

            switch (game[newpos[0] + dir[0]][newpos[1] + dir[1]]) {

                case "0":
                    //console.log("case0")
                    newpos = [newpos[0] + dir[0], newpos[1] + dir[1]];
                    //console.log(newpos)
                    stopWhile = false
                    break;

                case "4":
                    //console.log("case4")
                    newpos = [newpos[0] + dir[0], newpos[1] + dir[1]];
                    //console.log(newpos)
                    stopWhile = true
                    break;

                default:
                    stopWhile = true
                    break;
            }
            if (stopWhile) break

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
        if(gamemode) alert("J1 WINS")
        else alert("J2 WINS")
    } else if (game[b.rows() - 1].includes("3")) {
        if(gamemode) alert("J2 WINS")
        else alert("J1 WINS")
    }
}
/**
 * Init table to an Empty table
 */
function initTable() {
    var table = document.getElementById("game");
    while(table.rows.length > 0) { 
    table.deleteRow(0);
    }
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
    b = jsboard.board({ attach: "game", size: "5x5" });
    b.cell("each").style({ width: "65px", height: "65px" });
    resetBoard(true);
    this.disabled = true;  
    document.getElementById("size7").disabled = false;
});
    document.getElementById("size7").addEventListener("click", function () {
        initTable();
        b = jsboard.board({ attach: "game", size: "7x7" });
        b.cell("each").style({ width: "65px", height: "65px" });
        resetBoard(true);
        this.disabled = true;  
        document.getElementById("size5").disabled = false;
});