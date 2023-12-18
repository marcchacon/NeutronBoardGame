class SelectionNode {

    INVALID_MOVE_ERROR = new Error("Invalid move, move must be a MoveNode");
    INVALID_POINTS_ERROR = new Error("Invalid points, points must be a Number");
    INVALID_MOVE_POINTER_ERROR = new Error("Invalid move pointer, pointer must be a Key in moves");

    constructor(selection, gameState, turn, parent = undefined) {
        this.setParent(parent);
        this.selection = selection;
        this.gameState = gameState;
        this.turn = turn;
        this.points = undefined;
        this.bestMove = undefined;
        this.moves = {};
    }

    /**
     * Sets the parent of this node
     * @param {MoveNode} parent the parent of this node or undefined if this is the root node
     * @throws INVALID_MOVE_ERROR if parent is not a MoveNode nor undefined
     */
    setParent(parent) {
        if (parent.instanceof(MoveNode) || parent === undefined) {
          this.parent = parent;
        } else throw this.INVALID_MOVE_ERROR;
    }

    /**
     * Returns the parent of this node
     * @returns {MoveNode} the parent of this node or undefined if this is the root node
     */
    getParent() {
        return this.parent;
    }
  
    /**
     * Sets the points of this node.
     * Does not update the bestMove points
     * @param {Number} points the points of this node
     */
    setPoints(points) {
      if (points.instanceof(Number)) {
        this.points = points;
      } else throw this.INVALID_POINTS_ERROR;
    }

    /**
     * Returns the points of this selection
     * If the points are undefined, sets the points to bestMove's points
     * If bestMove is undefined, calculates the bestMove and sets the points to bestMove's points
     * @returns {Number} the points of this node
     */
    getPoints() {
        if (this.points === undefined) {
            if (this.bestMove === undefined) {
                this.bestMove = this.calculateBestMove();
            } else {
                this.setPoints(this.getBestMove().getPoints());
            }
        }
        return this.points;
    }
    
    /**
     * Sets the bestMove of this node
     * @param {String} pointer The pointer to the move in the moves array
     * @throws INVALID_MOVE_POINTER_ERROR if pointer is not a key in moves
     */
    setBestMove(pointer) {
        if (this.moves.hasOwnProperty(pointer)) {
            this.bestMove = pointer;
            this.setPoints(this.moves[pointer].getPoints());
          } else {
            throw this.INVALID_MOVE_POINTER_ERROR;
          }
    }

    /**
     * Gets the bestMove of this node
     * @returns {MoveNode} the bestMove of this node
     */
    getBestMove() {
        return this.getMove(this.bestMove);
    }

    /**
     * Gets the move at the pointer in the moves array
     * @param {String} pointer The pointer to the move in the moves array
     * @returns {MoveNode} the move at the pointer in the moves array
     * @throws INVALID_MOVE_POINTER_ERROR if pointer is not a key in moves
     */
    getMove(pointer) {
        if (this.moves.hasOwnProperty(pointer)) {
            return this.moves[pointer];
        } else {
            throw this.INVALID_MOVE_POINTER_ERROR;
        }
    }

    /**
     * Gets the game board of this node
     * @returns {Array} the board at this node
     */
    getGameState() {
        return this.gameState;
    }

    /**
     * Gets the turn state of this node
     * @returns {Array} the turn state of this node
     */
    getTurn() {
        return this.turn;
    }

    /**
     * Adds a move to this node
     * @param {MoveNode} move the move to add
     * @throws INVALID_MOVE_ERROR if move is not a MoveNode
     */
    addMove(move) {
        if (move.instanceof(MoveNode)) {
          this.moves.push(move);
          move.setParent(this);
        } else throw this.INVALID_MOVE_ERROR;
    }

    /**
     * Gets the selection of this node
     * @returns {Object} the selection of this node
     */
    getSelection() {
        return this.selection;
    }
    
    /**
     * Gets the moves of this node
     * @returns {Object} the moves of this node
     */
    getMoves() {
        return this.moves;
    }
    
    /**
     * Calculates the best move for this node
     * @param {Boolean} inverted if true, returns the move with the lowest points
     * @returns {String} the best move for this node, undefined if there are no moves
     */
    calculateBestMove(inverted = false) {
        if (this.moves.length > 0) {
            let bestMove = undefined;
            let bestPoints = inverted ? Infinity : -Infinity; // Initialize bestPoints based on the inverted flag
            for (const move of this.moves) {
                const points = move.getPoints();
                if ((inverted && points < bestPoints) || (!inverted && points > bestPoints)) {
                    bestMove = move;
                    bestPoints = points;
                }
            }
            return bestMove ? Object.keys(bestMove.getMove()) : undefined;
        }
        return undefined;
    }


}

class MoveNode {

    INVALID_SELECTION_ERROR = new Error("Invalid selection, selection must be a SelectionNode");
    INVALID_POINTS_ERROR = new Error("Invalid points, points must be a Number");
    INVALID_SELECTION_POINTER_ERROR = new Error("Invalid selection pointer, pointer must be a Key in selections");


    constructor(move, gameState, parent) {
        this.setParent(parent);
        this.move = move;
        this.gameState = gameState;
        this.points = undefined;
        this.bestSelection = undefined;
        this.selections = {};
    }

    /**
     * Sets the parent of this node
     * @param {SelectionNode} parent the parent of this node or undefined if this is the root node
     * @throws INVALID_SELECTION_ERROR if parent is not a SelectionNode
     */
    setParent(parent) {
        if (parent.instanceof(SelectionNode)) {
          this.parent = parent;
        } else throw this.INVALID_SELECTION_ERROR;
    }

    /**
     * Returns the parent of this node
     * @returns {SelectionNode} the parent of this node
     */
    getParent() {
        return this.parent;
    }

    /**
     * Sets the points of this node.
     * Does not update the bestMove points
     * @param {Number} points the points of this node
     */
    setPoints(points) {
        if (points.instanceof(Number)) {
          this.points = points;
        } else throw this.INVALID_POINTS_ERROR;
    }

    /**
     * Returns the points of this move
     * If the points are undefined, sets the points to bestSelection's points
     * If bestSelection is undefined, calculates the bestSelection and sets the points to bestSelection's points
     * @returns {Number} the points of this node
     */
    getPoints() {
        if (this.points === undefined) {
            if (this.bestSelection === undefined) {
                this.bestSelection = this.calculateBestSelection();
            } else {
                this.setPoints(this.getBestSelection().getPoints());
            }
        }
        return this.points;
    }

    /**
     * Sets the bestSelection of this node
     * @param {String} pointer The pointer to the selection in the selections array
     * @throws INVALID_MOVE_POINTER_ERROR if pointer is not a key in selections
     */
    setBestSelection(pointer) {
        if (this.selections.hasOwnProperty(pointer)) {
            this.bestSelection = pointer;
            this.setPoints(this.selections[pointer].getPoints());
          } else {
            throw this.INVALID_SELECTION_POINTER_ERROR;
          }
    }

    /**
     * Gets the bestSelection of this node
     * @returns {SelectionNode} the bestSelection of this node
     */
    getBestSelection() {
        return this.getSelection(this.bestSelection);
    }

    /**
     * Gets the selection at the pointer in the selections array
     * @param {String} pointer The pointer to the selection in the selections array
     * @returns {SelectionNode} the selection at the pointer in the selections array
     * @throws INVALID_SELECTION_POINTER_ERROR if pointer is not a key in selections
     */
    getSelection(pointer) {
        if (this.selections.hasOwnProperty(pointer)) {
            return this.selections[pointer];
        } else {
            throw this.INVALID_SELECTION_POINTER_ERROR;
        }
    }

    /**
     * Gets the game board of this movement
     * @returns {Array} the board at this node
     */
    getGameState() {
        return this.gameState;
    }

    /**
     * Adds a selection to this node
     * @param {SelectionNode} selection the selection to add
     * @throws INVALID_SELECTION_ERROR if move is not a MoveNode
     */
    addSelection(selection) {
        if (selection.instanceof(SelectionNode)) {
          this.selections.push(selection);
          selection.setParent(this);
        } else throw this.INVALID_SELECTION_ERROR;
    }

    /**
     * Gets the move of this node
     * @returns {Object} the move of this node
     */
    getMove() {
        return this.move;
    }

    /**
     * Gets the selections of this node
     * @returns {Object} the selections of this node
     */
    getSelections() {
        return this.selections;
    }

    /**
     * 
     * @param {Boolean} inverted if true, returns the selection with the lowest points
     * @returns {String} the best selection for this node, undefined if there are no selections
     */
    calculateBestSelection(inverted = false) {
        if (this.selections.length > 0) {
            let bestSelection = undefined;
            let bestPoints = inverted ? Infinity : -Infinity; // Initialize bestPoints based on the inverted flag
            for (const selection of this.selections) {
                const points = selection.getPoints();
                if ((inverted && points < bestPoints) || (!inverted && points > bestPoints)) {
                    bestSelection = selection;
                    bestPoints = points;
                }
            }
            return bestSelection ? Object.keys(bestSelection.getSelection()) : undefined;
        }
        return undefined;
    }
}

export default { MoveNode, SelectionNode };