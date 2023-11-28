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
var common = jsboard.piece({ text: "J2", textIndent: "-9999px", background: "green", width: "50px", height: "50px", margin: "0 auto" });


// put pieces on board
var j1 = [];
var j2 = [];
for (let i = 0; i < b.cols(); i++) {
    j1.push(player1.clone());
    j2.push(player2.clone());
    b.cell([0,i]).place(j1[i]);
    j1[i].addEventListener("click", function () { showMoves(this); });
    j2[i].addEventListener("click", function () { showMoves(this); });
    b.cell([b.rows()-1,i]).place(j2[i]);
}
var co = common.clone();
b.cell([2,2]).place(co);
co.addEventListener("click", function () { showMoves(this); });

// variables for piece to move and its locs
var bindMoveLocs, bindMovePiece;

// show new locations 
function showMoves(piece) {
    console.log(piece)
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
        b.cell(locs[i]).DOM().classList.add("green");
        b.cell(locs[i]).on("click", movePiece);  
    }
}

/**
 * Move the piece to the clicked location
 * 
 * @return {void}
 */
function movePiece() {
    var userClick = b.cell(this).where();
    if (bindMoveLocs.indexOf(userClick)) {
        b.cell(userClick).place(bindMovePiece);
        resetBoard();
    }
}

/**
 * Reset the board by removing all green cells and
 * removing all click events
 * 
 * @return {void}
 */
function resetBoard() {
    for (var r=0; r<b.rows(); r++) {
        for (var c=0; c<b.cols(); c++) {
            b.cell([r,c]).DOM().classList.remove("green");
            b.cell([r,c]).removeOn("click", movePiece);
        }
    }
}

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

    console.log("GAMEBOARD DONE: " + game)

    return game
}

function getMoves(piece) {

    var game = getGameboard()
    var moves = []

    directions.forEach((dir, index) => {
        var newpos = piece
        
        while (Array.isArray(game[newpos[0] + dir[0]])) {

            stopWhile = false

            console.log("seguent casella: " + (game[newpos[0] + dir[0]][newpos[1] + dir[1]]) + "  pot avançar?  " + (game[newpos[0] + dir[0]][newpos[1] + dir[1]] === "0"))

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
            if (newpos !== piece) moves.push(newpos);
            if (stopWhile) break

        }
    });

    return moves
}