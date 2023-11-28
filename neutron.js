const { Client, CommandInteraction } = require("discord.js");
const { commands } = require(".."); 
const texts = require("../assets/text.json")

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

//The initial board (it'ss one off so when it starts the code move the piece to the right place)
const init = [
    ["1", "1", "1", "1", "1"],
    ["0", "0", "0", "0", "0"],
    ["0", "3", "0", "0", "0"],
    ["0", "0", "0", "0", "0"],
    ["2", "2", "2", "2", "2"]
];

//The emojis that will have the message
const emojis = {
    "blank": "⬛",
    "player1": "🟩",
    "player2": "🟥",
    "common": "🟨",
    "select": {
        "n1": "1️⃣",
        "n2": "2️⃣",
        "n3": "3️⃣",
        "n4": "4️⃣",
        "n5": "5️⃣",
        "selected": "🟦"
    }
}

//Function that transforms the id to different vars
function readMsg(commandArray) {
    console.log("COMMAND RECIEVED: " + commandArray)

    var command = {
        action: commandArray[1], //The action the user wanted to do
        valueBox: commandArray[2], //The value of the box before the piece was there (only can be 0, it's used to detect bugs/cheats) 
        pos: Array.from(commandArray[3], Number), //The position of the piece the player wants to move / to select
        newPos: Array.from(commandArray[4], Number), //The new position of the piece
        newAction: commandArray[5], //The action the player has to do next 
        turn: (commandArray[6] === "true"), //Whose turn is it || TRUE = J1
        piece: commandArray[7], //The pieces value (0 = empty, 1/2 = each player, 3 = common) 
        players: commandArray[8], //The id's of each player
        player1: commandArray[8].split(",")[0], //The id of player 1
        player2: commandArray[8].split(",")[1], //The id of player 2
        player: commandArray[8].split(",")[1] //The id of the turn's player (default = J2)
    }

    //Checks current player's turn
    if (command.turn) command.player = command.player1

    console.log("COMMAND CLEANNED: " + JSON.stringify(command))

    return command
}

module.exports = {
    //Command definition
    name: "neutron",
    run: async (client, interaction) => {


        //Decrypt de gameboard (emoji -> array)
        function getGameboard(b) {

            game = b.matrix()

            game.forEach((row, index) => {
                row.forEach((col, index2) => {
                    if (col === null) game[index][index2] = "0"
                });
            });


            console.log("GAMEBOARD DONE: " + game)
            /*
            [
                [X, X, X, X, X],
                [X, X, X, X, X],
                [X, X, X, X, X],
                [X, X, X, X, X],
                [X, X, X, X, X]
            ]
            */
            return game
        }

        //Gets the board and transform it to emojis so Discord can send it
        function boardGenerator(game) {
            console.log("BOARD GENERATOR: " + game)
            var msg = ""
            game.forEach(element => {
                element.forEach(element2 => {
                    switch (element2) {
                        case "0":
                            msg = msg + emojis.blank + " "
                            break;
                        case "1":
                            msg = msg + emojis.player1 + " "
                            break;
                        case "2":
                            msg = msg + emojis.player2 + " "
                            break;
                        case "3":
                            msg = msg + emojis.common + " "
                            break;
                        case "a":
                            msg = msg + emojis.select.n1 + " "
                            break;
                        case "b":
                            msg = msg + emojis.select.n2 + " "
                            break;
                        case "c":
                            msg = msg + emojis.select.n3 + " "
                            break;
                        case "d":
                            msg = msg + emojis.select.n4 + " "
                            break;
                        case "e":
                            msg = msg + emojis.select.n5 + " "
                            break;
                        case "f":
                            msg = msg + emojis.select.selected + " "
                            break;
                        default:
                            break;
                    }
                })
                msg = msg + "\n"
            })
            return msg
        }

        //Creates the embed with the info
        function ui() {

            //Gets the players name
            var user = client.users.cache.find(user => user.id === command.player2)
            var p1 = client.users.cache.find(user => user.id === command.player1)
            var p2 = client.users.cache.find(user => user.id === command.player2)

            //Select the emoji to display
            var emoji = emojis.select.selected
            if (command.piece === "3") emoji = emojis.common

            //Select the turn's player
            if (command.turn) user = p1

            //Creates the embed
            var embed = {
                "title": `${texts[client.config.lang].textline.neutron.actions.move} (${emoji})`,
                "description": `J1: ${p1.username}\nJ2:${p2.username}`,
                "color": user.accentColor,
                "author": {
                    "name": `${texts[client.config.lang].textline.neutron.turn} ${user.username}`,
                    "icon_url": user.avatarURL()
                }
            }

            /*
            console.log("NEWACTION: " + command.newAction)
            console.log("ACTION: " + command.action)
            console.log("PIECE: " + command.piece)
            */
            
            //Checks the embed's title
            if (command.action === "move") embed.title = `${texts[client.config.lang].textline.neutron.actions.select}`

            return embed
        }

        //Move a piece to another position
        function movePiece() {
            
            console.log(`${command.pos} es moura a ${command.newPos}`)
            
            game[command.newPos[0]][command.newPos[1]] = command.piece

            game[command.pos[0]][command.pos[1]] = command.valueBox

            console.log("PIECE MOVED: " + game)
        }

        //Get the positions of player's each piece
        function getPositions(piece, component = true) {
            var positions = []
            var letters = ["a", "b", "c", "d", "e"]

            //For each box in the game, if it's the player's value, registers the position and changes the value (so the emoji can be 1/2/3/etc.)
            game.forEach((element, index) => {
                element.forEach((element2, index2) => {
                    if (element2 === piece) {
                        positions.push(`${index}${index2}`)
                        if (element2 === "1" || element2 === "2")
                            game[index][index2] = letters[0]
                        letters.shift()
                    }
                })
            })

            console.log(`POSITIONS FOUND: ${positions}`)

            //Creates the buttons so the user can interact
            if (component) components = [
                {
                    "type": 1,
                    "components": [
                        {
                            "type": 2,
                            "style": 1,
                            "label": "1",
                            "custom_id": `neutron_select_0_${positions[0]}_NaN_move_${command.turn}_${piece}_${command.players}`,
                            "disabled": false
                        },
                        {
                            "type": 2,
                            "style": 1,
                            "label": "2",
                            "custom_id": `neutron_select_0_${positions[1]}_NaN_move_${command.turn}_${piece}_${command.players}`,
                            "disabled": false
                        },
                        {
                            "type": 2,
                            "style": 1,
                            "label": "3",
                            "custom_id": `neutron_select_0_${positions[2]}_NaN_move_${command.turn}_${piece}_${command.players}`,
                            "disabled": false
                        },
                        {
                            "type": 2,
                            "style": 1,
                            "label": "4",
                            "custom_id": `neutron_select_0_${positions[3]}_NaN_move_${command.turn}_${piece}_${command.players}`,
                            "disabled": false
                        },
                        {
                            "type": 2,
                            "style": 1,
                            "label": "5",
                            "custom_id": `neutron_select_0_${positions[4]}_NaN_move_${command.turn}_${piece}_${command.players}`,
                            "disabled": false
                        }
                    ]
                }
            ]
            return positions
        }

        //Calculate all possible moves from the selected piece
        function calculateMoves() {

            console.log(`SELECTED PIECE: ${command.pos}`)

            var poses = []
            var valueBox = []

            //for each direction, move on until you can't, then register the position
            directions.forEach((dir) => {

                var newpos = command.pos;
                var stopWhile = false

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

                if (newpos === command.pos) {

                    newpos = `N${dir[0]}${dir[1]}N`

                    valueBox.push("-1")

                } else {

                    newpos = newpos.join("")

                    valueBox.push(game[newpos[0]][newpos[1]])

                }

                poses.push(newpos)

            });

            //Poses[4] is the middle button, so it can't have a value, ergo it has to be dissabled (Maybe in the future we add a help screen there)
            poses.splice(4, 0, "HeN")

            valueBox.splice(4, 0, "HeN")

            console.log("POSSIBLE POSES: " + poses)

            //check if win condition (the common piece can't move)
            var validPoses = []
            validPoses = poses.filter(pos => !pos.includes("N")) //All values ended with "N" means the piece can't move to that direction
            
            console.log("VALID POSES: " + validPoses[0])
            
            //If there are no possible poses means that the piece can't move, so the player lose 
            if (validPoses[0] === undefined) {
                console.log("WINNING CONDITION ACHIEVED")
                win = "p1"
                if (command.turn) win = "p2" 
            } else { //The piece can move

                // Create the components

                components = [
                    {
                        "type": 1,
                        "components": [
                            {
                                "type": 2,
                                "style": 1,
                                "emoji": "↖️",
                                "custom_id": `neutron_move_${valueBox[0]}_${command.pos.join("")}_${poses[0]}_${command.newAction}_${command.turn}_${command.piece}_${command.players}_${Math.random()}`,
                                "disabled": false
                            },
                            {
                                "type": 2,
                                "style": 1,
                                "emoji": "⬆️",
                                "custom_id": `neutron_move_${valueBox[1]}_${command.pos.join("")}_${poses[1]}_${command.newAction}_${command.turn}_${command.piece}_${command.players}_${Math.random()}`,
                                "disabled": false
                            },
                            {
                                "type": 2,
                                "style": 1,
                                "emoji": "↗️",
                                "custom_id": `neutron_move_${valueBox[2]}_${command.pos.join("")}_${poses[2]}_${command.newAction}_${command.turn}_${command.piece}_${command.players}_${Math.random()}`,
                                "disabled": false
                            }
                        ]
                    },
                    {
                        "type": 1,
                        "components": [
                            {
                                "type": 2,
                                "style": 1,
                                "emoji": "⬅️",
                                "custom_id": `neutron_move_${valueBox[3]}_${command.pos.join("")}_${poses[3]}_${command.newAction}_${command.turn}_${command.piece}_${command.players}_${Math.random()}`,
                                "disabled": false
                            },
                            {
                                "type": 2,
                                "style": 1,
                                "emoji": "🟦",
                                "custom_id": `neutron_help_${valueBox[4]}_${command.pos.join("")}_${poses[4]}_${command.newAction}_${command.turn}_${command.piece}_${command.players}_${Math.random()}`,
                                "disabled": true
                            },
                            {
                                "type": 2,
                                "style": 1,
                                "emoji": "➡️",
                                "custom_id": `neutron_move_${valueBox[5]}_${command.pos.join("")}_${poses[5]}_${command.newAction}_${command.turn}_${command.piece}_${command.players}_${Math.random()}`,
                                "disabled": false
                            }
                        ]
                    },
                    {
                        "type": 1,
                        "components": [
                            {
                                "type": 2,
                                "style": 1,
                                "emoji": "↙️",
                                "custom_id": `neutron_move_${valueBox[6]}_${command.pos.join("")}_${poses[6]}_${command.newAction}_${command.turn}_${command.piece}_${command.players}_${Math.random()}`,
                                "disabled": false
                            },
                            {
                                "type": 2,
                                "style": 1,
                                "emoji": "⬇️",
                                "custom_id": `neutron_move_${valueBox[7]}_${command.pos.join("")}_${poses[7]}_${command.newAction}_${command.turn}_${command.piece}_${command.players}_${Math.random()}`,
                                "disabled": false
                            },
                            {
                                "type": 2,
                                "style": 1,
                                "emoji": "↘️",
                                "custom_id": `neutron_move_${valueBox[8]}_${command.pos.join("")}_${poses[8]}_${command.newAction}_${command.turn}_${command.piece}_${command.players}_${Math.random()}`,
                                "disabled": false
                            }
                        ]
                    }
                ]

                //Disables all buttons with non valid positions
                components.forEach((element, index) => {

                    components[index].components.forEach((element2, index2) => {
                        //console.log(components[index].components[index2].custom_id)
                        if (components[index].components[index2].custom_id.split("_")[4].endsWith("N")) {

                            components[index].components[index2].disabled = true

                        }
                    })

                })
            }

        }

        // Custom id must be: neutron_action_valueBox_pos_newPos_nextAction_turn_piece_playersID
        /*
            neutron: game detector
        
            action: move/select
        
                "move": moves the piece
        
                "select": selects the piece to move
        
            valueBox: the value of the new spot
        
            pos: the actual position of the piece
        
                move: the position of the piece to move
        
                select: the position of the selected piece
        
            newPos: the new position of the piece
        
                select: NaN
        
            nextAction: what the game should do next
        
                "move": the Custom id must be "move"
        
                "select": the Custom id must be "select"
            
            turn: the player's id
        
            piece: the value of the piece to move
            
            playersID: id's of both players splitted by ,
        
        */
        
        
        /*
        After all definitions, this is the code:
        */

        //Gets all the info from the button's id (Custom id)
        var command = readMsg(interaction.customId.split("_"))

        //console.log(interaction.message.content)

        //Modifies the message text so the function can work faster
        var temp = interaction.message.content.split("\n")
        var temp2 = []
        temp.forEach(element => {
            temp2.push(element.split(" "))
        })
        console.log(temp2)
        var game = getGameboard(temp2)

        //Some more necessary vars
        var components = []
        var win

        //console.log(command.players)
        //console.log(command.players !== "everyone")

        //Checks if the person who used the buttons is the player
        if (command.players !== "everyone" && interaction.user.id !== command.player) {
            interaction.reply({ content: texts[client.config.lang].textline.neutron.noTurn, ephemeral: true });
        } else {

            //Sorts the code depending of the action
            switch (command.action) {
                case "move":
                    movePiece()

                    //After moving the pieces, if now it's the common piece turn, it shifts players and calculates the common pieces possible poses
                    if (command.action === command.newAction) {

                        command.valueBox = "0"
                        command.pos = Array.from(getPositions("3")[0], Number)
                        command.newPos = Array.from(getPositions("3")[0], Number)
                        command.newAction = "select"
                        command.action = "select"
                        command.turn = !command.turn
                        command.piece = "3"

                        calculateMoves()
                    
                    // If it's not that case, that means now it's the "select the piece" turn
                    } else {
                        
                        //Gets the value of the player (Player 1 = 1 | Player 2 = 2)
                        var piece = "2"
                        if (command.turn) piece = "1"
                        
                        //console.log(`WINNING CONDITION: J1: ${!game[0].join("").includes("3")} J2 ${!game[game.length - 1].join("").includes("3")}`)1
                        
                        //Checks the winning condition (common piece in player's area)
                        if (!game[0].join("").includes("3") && !game[game.length - 1].join("").includes("3")) getPositions(piece)
                    }

                    break;
                
                case "select":
                    calculateMoves()


                    // f = the selected piece, so it can be diferenciated from the rest
                    game[command.pos[0]][command.pos[1]] = "f"

                    break;

                case "help":
                    //TODO, probably never
                    break;

                default:
                    //If it doesn't matches any of the other actions, means a bug has occurred
                    game = ["ERROR: CUSTOMID IS NOT VALID", "> NEUTRON.COMMAND.ACTION IS NOT VALID"]
                    break;
            }

            //Write the message
            var gameBoard = boardGenerator(game)
            var embed = ui()
            console.log("WIN: " + win)

            //Checks win conditions and creates different messages
            if (game[0].join("").includes("3") || win === "p1") {
                var msg = {
                    "content": gameBoard + "᲼᲼", //Adding a blank character (not a backspace) makes the emojis smaller
                    "components": [],
                    "embeds": [embed]
                }
                var winner = client.users.cache.find(user => user.id === command.player1)
                msg.embeds[0].title = `${texts[client.config.lang].textline.neutron.win} ${winner.username}`
                msg.embeds[0].thumbnail = { "url": winner.avatarURL() }
            } else if (game[game.length - 1].join("").includes("3") || win === "p2") {
                var msg = {
                    "content": gameBoard + "᲼᲼",
                    "components": [],
                    "embeds": [embed]
                }
                var winner = client.users.cache.find(user => user.id === command.player2)
                msg.embeds[0].title = `${texts[client.config.lang].textline.neutron.win} ${winner.username}`
                msg.embeds[0].thumbnail = { "url": winner.avatarURL() }

            } else if (command.action === "help") {
                var msg = {
                    "content": gameBoard,
                    "components": components,
                    "embeds": [embed]
                }
            } else {
                var msg = {
                    "content": gameBoard,
                    "components": components,
                    "embeds": [embed]
                }
            }

            //console.log(msg.components[1].components)

            //Send the message
            interaction.update(msg)

        }

    }
}