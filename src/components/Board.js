import Square from "./Square"
import Piece from "./Piece"
import React, { useEffect, useState } from "react"

// Making kingCaptures true disables check/checkmate detection! Capturing the king is required to
// win!
let kingCaptures = false
let castlingEnabled = true
let flippingBoardEnabled = false
// Create a function that changes the selectedPiece, and pass it to the child, so that when the child
// is clicked on, the selectedPiece updates wooo!! wow
let selectedPiece = null // = id of the piece(its key in the map)
let setHighlight = () => console.error("No piece selected")
let boardModel = []
let currentTurn = "white"
let setters = new Map()
let stats = new Map()
// If a pawn moves two forward, then information about that pawn is stored in this variable for the
// next turn in case it can be en passanted
let enPassant = null
let gameState = "game running"
let id = 0
// o stands for outer
let oPieces, oSetPieces
let endMatch
// Keep track of basic stats for each color
stats.set("white", {
    kingsideCastling: castlingEnabled,
    queensideCastling: castlingEnabled,
})
stats.set("black", {
    kingsideCastling: castlingEnabled,
    queensideCastling: castlingEnabled,
})

for (let i = 0; i < 8; i++) {
    boardModel[i] = []
    for (let j = 0; j < 8; j++) {
        // The first part of this pair indicates the piece thats on the square, whereas the second
        // indicates which color controls that square
        boardModel[i][j] = {
            occupier: "empty",
            whiteControls: false,
            blackControls: false,
            whiteControlsStrong: false, // whiteControlsStrong means a white piece that isn't the king controls the square
            blackControlsStrong: false
        }
    }
}

// Piece movement patterns are made up of one or more triplets that contain three main values
// in each triplet array: x; this determines the unit x value, y; this determines the unit y value,
// max units; this determines how many unit xs and unit ys the piece can go at most. For example,
// for the triplet in the rook [0, 1, 8], this triplet says that the rook can go in the positive y
// direction one at a time, cannot go into the x direction in that same move, and can do that up to
// 8 times in one move. So, it says the rook can move in the positive y direction.
let defaultPieceMovements = {
    rook: [[1, 0, 8], [-1, 0, 8], [0, 1, 8], [0, -1, 8]],
    bishop: [[1, 1, 8], [-1, -1, 8], [1, -1, 8], [-1, 1, 8]],
    knight: [[1, 2, 1], [-1, 2, 1], [1, -2, 1], [-1, -2, 1], 
    [2, 1, 1], [2, -1, 1], [-2, 1, 1], [-2, -1, 1]],
    king: [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], 
    [1, 1, 1], [-1, -1, 1], [1, -1, 1], [-1, 1, 1]],
    queen: [[1, 0, 8], [-1, 0, 8], [0, 1, 8], [0, -1, 8], 
    [1, 1, 8], [-1, -1, 8], [1, -1, 8], [-1, 1, 8]]
}

let pieceMovements = defaultPieceMovements

// Only want to make all the pieces once for each game
let originalPieces = makePieces()

// Returns a string that represents the board model (for testing)
function getBMString() {
    let result = ""
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            let thing = boardModel[j][i].occupier.substring(0, 5)
            result += thing.padEnd(6, " ")
        }
        result += "\n"
    }

    return result
}

function getControlString() {
    let result = ""
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            result += "("
            if (boardModel[j][i].whiteControls) {
                result += "W"
            } else {
                result += "-"
            }
            result += ", "
            if (boardModel[j][i].blackControls) {
                result += "B"
            } else {
                result += "-"
            }
            result += "),"
        }
        result += "\n"
    }

    return result
}

function modelCopy() {
    let result = []
    for (let i = 0; i <= 7; i++) {
        result[i] = []
        for (let j = 0; j <= 7; j++) {
            result[i][j] = global.structuredClone(boardModel[i][j])
        }
    }

    return result
}

function findPiece(id) {
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (boardModel[i][j].occupier === id) {
                return [i, j]
            }
        }
    }

    return null
}

// Returns the color of the kings that are in check or returns ""
function kingInCheck() {
    let kingsInCheck = ""
    for (let i = 0; i <= 7; i++) {
        for (let j = 0; j <= 7; j++) {
            let idArr = boardModel[i][j].occupier.split("_")
            let type = idArr[0]
            let color = idArr[1]
            if (type === "king") {
                if (boardModel[i][j][opposite(color) + "Controls"]) {
                    kingsInCheck += color
                }
            }
        }
    }
    
    return kingsInCheck
}

function opposite(color) {
    return color === "white" ? "black" : "white"
}

function restart() {
    id = 0
    stats.set("white", {
        kingsideCastling: castlingEnabled,
        queensideCastling: castlingEnabled,
    })
    stats.set("black", {
        kingsideCastling: castlingEnabled,
        queensideCastling: castlingEnabled,
    })
    for (let i = 0; i < 8; i++) {
        boardModel[i] = []
        for (let j = 0; j < 8; j++) {
            // The first part of this pair indicates the piece thats on the square, whereas the second
            // indicates which color controls that square
            boardModel[i][j] = {
                occupier: "empty",
                whiteControls: false,
                blackControls: false,
                whiteControlsStrong: false, // whiteControlsStrong means a white piece that isn't the king controls the square
                blackControlsStrong: false
            }
        }
    }
    originalPieces = makePieces()
    oPieces = originalPieces
    oSetPieces(originalPieces)
    setters.forEach((v, pieceId) => {
        let position = findPiece(pieceId)
        if (position != null) {
            v.setPositionX((position[0] * 100).toString())
            v.setPositionY((position[1] * 100).toString())
        }
    })
    if (flippingBoardEnabled) {
        setCurrentTurn("white")
    }
    currentTurn = "white"
    gameState = "game running"
}

function endGame(color) {
    gameState = "game ended"
    endMatch(color, restart)
}

function addSetter(pieceId, setPosX, setPosY) {
    setters.set(pieceId, {setPositionX: setPosX, setPositionY: setPosY})
}

function isInBoard(x, y) {
    return x >= 0 && x <= 7 && y >= 0 && y <= 7
}

// Adds/moves a piece on the board
function updateBoard(x1, y1, x2, y2, id) {
    if (x1 >= 0 && y1 >= 0) {
        boardModel[x1][y1].occupier = "empty"
    }

    boardModel[x2][y2].occupier = id
}

function rookControls(i, j, color) {
    for (let n = 0; n <= 1; n++) {
        for (let l = -1; l <= 1; l += 2) {
            let k = 1
            let x, y
            // When n = 0, x = i + k * l, and y = j (to go horizontal)
            while (isInBoard(x = (i + k * l - (k * l * n)), y = (j + (k * l * n)))) {
                let square = boardModel[x][y]
                let occupier = square.occupier
                square[color + "Controls"] = true
                square[color + "ControlsStrong"] = true
                if (occupier !== "empty" && 
                        !(occupier.includes("king_") && occupier.includes(opposite(color)))) {
                    break
                }
                k++
            }
        }
    }
}

function bishopControls(i, j, color) {
    // Bishop on the upward-right diagnol when n = 1, on upward-left when n = -1
    for (let n = -1; n <= 1; n += 2) {
        for (let l = -1; l <= 1; l += 2) {
            let k = 1
            let x, y
            while (isInBoard(x = (i + n * (k * l)), y = (j + k * l))) {
                let square = boardModel[x][y]
                square[color + "Controls"] = true
                square[color + "ControlsStrong"] = true
                if (boardModel[x][y].occupier !== "empty") {
                    break
                }
                k++
            }
        }
    }
}

function detailBoard() {
    // Reset the controllers of the board
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            boardModel[i][j].whiteControls = false
            boardModel[i][j].whiteControlsStrong = false
            boardModel[i][j].blackControls = false
            boardModel[i][j].blackControlsStrong = false
        }
    }

    // Repopulate
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            let idArr = boardModel[i][j].occupier.split("_")
            let type = idArr[0]
            let color = idArr[1]
            switch (type) {
                case "empty":
                    break
                case "pawn":
                    let direction = color === "black" ? 1 : -1
                    if (isInBoard(i + 1, j + direction)) {
                        let square = boardModel[i + 1][j + direction]
                        square[color + "Controls"] = true
                        square[color + "ControlsStrong"] = true
                    }
                    if (isInBoard(i - 1, j + direction)) {
                        let square = boardModel[i - 1][j + direction]
                        square[color + "Controls"] = true
                        square[color + "ControlsStrong"] = true
                    }
                    break
                case "rook":
                    rookControls(i, j, color)
                    break
                case "knight":
                    // 8(or 2^3) combinations in total (a knight has 8 valid moves)
                    for (let n = 0; n <= 1; n++) {
                        for (let l = -1; l <= 1; l += 2) {
                            for (let k = -1; k <= 1; k += 2) {
                                // Horizontal
                                let x, y
                                // kn - 2ln = n(k - 2l), 2ln - kn = n(2l - k)
                                if (isInBoard(x = (i + l * 2 + n * (k - (2 * l))), 
                                        y = (j + k + n * ((2 * l) - k)))) {
                                    boardModel[x][y][color + "Controls"] = true
                                    boardModel[x][y][color + "ControlsStrong"] = true
                                }
                            }
                        }
                    }
                    break
                case "bishop":
                    bishopControls(i, j, color)
                    break
                case "queen":
                    rookControls(i, j, color)
                    bishopControls(i, j, color)
                    break
                case "king":
                    // Sideways
                    for (let n = 0; n <= 1; n++) {
                        for (let l = -1; l <= 1; l += 2) {
                            let x, y
                            if (isInBoard(x = (i + l - (l * n)), y = (j + (l * n)))) {
                                boardModel[x][y][color + "Controls"] = true
                            }
                        }
                    }

                    // Diagnol
                    for (let n = -1; n <= 1; n += 2) {
                        for (let l = -1; l <= 1; l += 2) {
                            let x, y
                            if (isInBoard(x = (i + n * l), y = (j + l))) {
                                boardModel[x][y][color + "Controls"] = true
                            }
                        }
                    }
                    
                    break
                default:
                    console.error("Not valid piece type: ", type)
                    break
            }
        }
    }
}

function promotePawn(pawnId, x) {
    // Map all elements onto the same as what they were before except for the pawn with
    // pawnId (change its type and id)
    oPieces = oPieces.map((piece) => {
        if (piece.id !== pawnId) {
            return piece
        } else {
            let pieceId = "queen_" + selectedPiece.color + "_" + (id++).toString()
            let positY = (currentTurn === "black" ? "700" : "0").toString()
            
            let pawnSetters = setters.get(pawnId)
            setters.delete(pawnId)
            setters.set(pieceId, pawnSetters)

            selectedPiece = {
                id: pieceId,
                color: currentTurn,
                type: "queen",
                posX: x,
                posY: positY
            }
            return {
                id: pieceId,
                img: "piece-images/" + currentTurn + "-queen.png",
                posX: x,
                posY: positY,
                color: currentTurn,
                type: "queen"
            }
        }
    })
    oSetPieces(oPieces)
    // Need to update the boardModel?
}

function canKingMove(kingPosX, kingPosY) {
    let kingCanMove = false
        
    // Sideways
    for (let i = 0; i <= 1; i++) {
        for (let j = -1; j <= 1; j += 2) {
            let xp = kingPosX + j - (j * i)
            let yp = kingPosY + (j * i)
            
            if (isInBoard(xp, yp) && !boardModel[xp][yp][currentTurn + "Controls"] &&
                    (boardModel[xp][yp].occupier === "empty" || 
                    boardModel[xp][yp].occupier.split("_")[1] === currentTurn)) {
                kingCanMove = true
            }
        }
    }

    // Diagnol
    for (let i = -1; i <= 1; i += 2) {
        for (let j = -1; j <= 1; j += 2) {
            let xp = kingPosX + i * j
            let yp = kingPosY + j
            if (isInBoard(xp, yp) && !boardModel[xp][yp][currentTurn + "Controls"] &&
                    boardModel[xp][yp].occupier === "empty") {
                kingCanMove = true
            }
        }
    }

    return kingCanMove
}

function findPiecesAttackingKing(kingPosX, kingPosY) {
    let piecesAttacking = []
    // Detecting rook-type attacks
    for (let n = 0; n <= 1; n++) {
        for (let l = -1; l <= 1; l += 2) {
            let k = 1
            let x, y
            // When n = 0, x = i + k * l, and y = j (to go horizontal)
            while (isInBoard(x = (kingPosX + k * l - (k * l * n)), y = (kingPosY + (k * l * n)))
                    && boardModel[x][y].occupier === "empty") {
                k++
            }

            let occupier
            if (isInBoard(x, y)) {
                occupier = boardModel[x][y].occupier
            } else {
                continue // Skip over the last bit if x, y isnt in the board
            }

            // x and y will now be out of the board or the coordinates of a piece
            if (isInBoard(x, y) && occupier.includes(currentTurn) 
                    && (occupier.includes("rook") || occupier.includes("queen"))) {
                piecesAttacking.push([x, y])
            }
        }
    }

    // Detecting bishop-type attacks
    for (let n = -1; n <= 1; n += 2) {
        for (let l = -1; l <= 1; l += 2) {
            let k = 1
            let x, y
            while (isInBoard(x = (kingPosX + n * (k * l)), y = (kingPosY + k * l))
                && boardModel[x][y].occupier === "empty") {
                k++
            }
            let occupier
            if (isInBoard(x, y)) {
                occupier = boardModel[x][y].occupier
            } else {
                continue
            }

            // x and y will now be out of the board or the coordinates of a piece
            if (occupier.includes(currentTurn)
                    && (occupier.includes("bishop") || occupier.includes("queen") || 
                    (occupier.includes("pawn") && k === 1 
                    && y === (kingPosY + (currentTurn === "white" ? 1 : -1))))) { // currentTurn is the attacker here
                piecesAttacking.push([x, y])
            }
        }
    }

    // Detecting knight-type attacks
    for (let n = 0; n <= 1; n++) {
        for (let l = -1; l <= 1; l += 2) {
            for (let k = -1; k <= 1; k += 2) {
                // Horizontal
                let x, y
                // kn - 2ln = n(k - 2l), 2ln - kn = n(2l - k)
                let occupier
                    if (isInBoard(x, y)) {
                        occupier = boardModel[x][y].occupier
                    } else {
                        continue
                    }
                if (isInBoard(x = (kingPosX + l * 2 + n * (k - (2 * l))), 
                        y = (kingPosY + k + n * ((2 * l) - k))) 
                        && occupier.includes(currentTurn) && occupier.includes("knight")) {
                    piecesAttacking.push([x, y])
                }
            }
        }
    }
    
    return piecesAttacking
}

function movePiece(x, y) {
    let tempBoard = modelCopy(boardModel)

    updateBoard(parseInt(selectedPiece.posX) / 100, parseInt(selectedPiece.posY) / 100,
            parseInt(x) / 100, parseInt(y) / 100, selectedPiece.id)
    detailBoard()
    /* For testing:
    let xp = parseInt(x) / 100
    let yp = parseInt(y) / 100
    console.log("Piece moving to: ", xp, yp)
    console.log(" stats for that square: ", boardModel[xp][yp])
    console.log("King in check: ", kingInCheck())
    */
    console.log(getBMString())
    console.log(getControlString())

    if (!kingCaptures) {
        let attackedKing = kingInCheck()
        
        // Check for includes for this one, because a player could try to move their king such that it'd
        // put both kings into check, which should not be allowed 
        if (attackedKing.includes(currentTurn)) {
            boardModel = tempBoard
            detailBoard()
            return false
        } else if (attackedKing === opposite(currentTurn)) {
            console.log(opposite(currentTurn) + " king is in check!")
            // Note: currentTurn will be the color of the player that is ATTACKING the king
            let kingColor = opposite(currentTurn)
            // Index 0 of the result will have the x position, 1 will have the y
            let [kingPosX, kingPosY] = findPiece("king_" + kingColor)
            let kingCanMove = canKingMove(kingPosX, kingPosY)

            if (!kingCanMove) {
                console.log("and it can't move!")
                // This array will have the locations of pieces that are attacking the king 
                // in [x, y] pairs
                let piecesAttacking = findPiecesAttackingKing(kingPosX, kingPosY)
                
                // If there are 2 or more pieces attacking the king, then they can't be blocked or taken
                // (because there are 2 to deal with) [Look up info about double checks!]
                if (piecesAttacking.length >= 2) {
                    endGame(currentTurn)
                } else { 
                    console.log("theres only one piece attacking it")
                    let attackerX = piecesAttacking[0][0]
                    let attackerY = piecesAttacking[0][1]
                    // Do any defending pieces control the square that the attacker is on?
                    if (!boardModel[attackerX][attackerY][kingColor + "ControlsStrong"]) {
                        console.log("but nobody can take it!")
                        // If the knight can't be taken, then its mate
                        if (boardModel[attackerX][attackerY].occupier.includes("knight")) { 
                            endGame(currentTurn)
                        } else {
                            let dx = kingPosX - attackerX
                            let dy = kingPosY - attackerY
                            let larger = Math.max(Math.abs(dx), Math.abs(dy))
                            let dxNorm = dx === 0 ? 0 : dx / Math.abs(dx)
                            let dyNorm = dy === 0 ? 0 : dy / Math.abs(dy)

                            // If the piece can't be taken, it must be blocked
                            let pathBlocked = false

                            // Check each square on the path to the attacking piece to the king, 
                            // non-inclusive
                            console.log(`Checking squares from i to ${larger} now`)
                            for (let i = 1; i < larger; i++) {
                                console.log("Checking square: ", attackerX + dxNorm, attackerY + (dyNorm * i))
                                if (boardModel[attackerX + dxNorm][attackerY + (dyNorm * i)][kingColor + "ControlsStrong"]) {
                                    console.log("attacking piece can be blocked!")
                                    pathBlocked = true
                                    break
                                }
                            }

                            if (!pathBlocked) {
                                endGame(currentTurn)
                            }
                        }
                    }
                }
                
                // then do they control any of the squares on the path from the attacker to the king?
            }
        }
    }
    
    let pieceSetters = setters.get(selectedPiece.id)
    
    pieceSetters.setPositionX(x)
    pieceSetters.setPositionY(y)
    
    selectedPiece = null
    enPassant = null
    setHighlight(false)
    if (flippingBoardEnabled) {
        setCurrentTurn(opposite(currentTurn))
    }
    currentTurn = opposite(currentTurn)

    return true
}

function movePawn(x, y) {
    let posX = parseInt(selectedPiece.posX)
    let posY = parseInt(selectedPiece.posY)
    let direction = selectedPiece.color === "black" ? 1 : -1
    let startingPos = selectedPiece.color === "black" ? 100 : 600
    let differenceX = parseInt(x) - posX
    let differenceY = (parseInt(y) - posY) * direction
    
    // Replace the true so that the pawn can only move on its first turn
    if ((differenceX === 0) && (differenceY === 100 )) {
        if (y === (selectedPiece.color === "black" ? "700" : "0")) {
            promotePawn(selectedPiece.id, x)
        }
        return movePiece(x, y)
    } else if ((differenceX === 0) && (differenceY === 200 && posY === startingPos)) {
        if (boardModel[posX / 100][posY / 100 + direction].occupier !== "empty") {
            return false
        }
        let enPassantTemp = { // Need to make this null after any other piece moves
            id: selectedPiece.id,
            positionX: selectedPiece.posX,
            positionY: selectedPiece.color === "black" ? "200" : "500"
        }
        let result = movePiece(x, y)
        enPassant = enPassantTemp
        return result
    } else if ((Math.abs(differenceX) === 100) && differenceY === 100 && enPassant !== null &&
            enPassant.positionX === x && enPassant.positionY === y) {
        oSetPieces(oPieces.filter((piece) => piece.id !== enPassant.id))
        return movePiece(x, y)
    }

    return false
}

function pawnCapture(x, y) {
    let direction = selectedPiece.color === "black" ? 1 : -1
    let differenceY = (parseInt(y) - parseInt(selectedPiece.posY)) * direction
    let differenceX = Math.abs(parseInt(x) - parseInt(selectedPiece.posX))
    
    // Replace the true so that the pawn can only move on its first turn
    if ((differenceX === 100) && (differenceY === 100)) {
        if (y === (selectedPiece.color === "black" ? "700" : "0")) {
            promotePawn(selectedPiece.id, x)
        }
        return movePiece(x, y)
    }

    return false
}

// Version of the % operator that returns 0 for 0 % 0, also 
function trplMod(a, b) {
    if (a === 0 && b === 0) {
        return 0
    } else if (a === 0 || b === 0) {
        return 1
    } else {
        return a % b
    }
}

// Version of the % operator that returns 0 for 0 / 0
function trplDivide(a, b) {
    if (a === 0 && b === 0) {
        return 0
    } else {
        return a / b
    }
}

function isTripletMultiple(diffX, diffY, type) {
    // Need to adjust these depending one which side
    let dx = diffX / 100
    let dy = diffY / 100
    let pMovements = defaultPieceMovements
    if (!castlingEnabled && kingCaptures) {
        pMovements = pieceMovements
    }
    let movements = pMovements[type]
    for (let i = 0; i < movements.length; i++) {
        let ux = movements[i][0] // unit x
        let uy = movements[i][1] * (currentTurn === "black" ? 1 : -1) // unit y
        let xUnits = trplDivide(dx, ux)
        let yUnits = trplDivide(dy, uy)
        console.log("dx, dy:", dx, dy, "ux, uy:",ux, uy)
        if (trplMod(dx, ux) === 0 && trplMod(dy, uy) === 0 && xUnits >= 0 && yUnits >= 0) {
            let maxU = movements[i][2]
            if (Math.abs(xUnits) <= maxU && Math.abs(yUnits) <= maxU && 
                    (xUnits === yUnits || xUnits === 0 || yUnits === 0)) {
                return [ux, uy, Math.abs((xUnits === yUnits || yUnits === 0) ? xUnits : yUnits)]
            }
        }
    }

    return [null, null, null]
}

function movePieceFilter(x, y, type) {
    let posX = parseInt(selectedPiece.posX)
    let posY = parseInt(selectedPiece.posY)
    let differenceX = parseInt(x) - posX
    let differenceY = parseInt(y) - posY
    
    let [unitX, unitY, units] = isTripletMultiple(differenceX, differenceY, type)
    
    if (unitX != null) {
        for (let i = 1; i < units; i++) {
            if (boardModel[(posX / 100) + i * unitX][posY / 100 + i * unitY].occupier !== "empty") {
                return false
            }
        }

        return movePiece(x, y)
    }

    return false
}

function moveKing(x, y) {
    let posX = parseInt(selectedPiece.posX)
    let posY = parseInt(selectedPiece.posY)
    let differenceX = parseInt(x) - posX
    let differenceY = parseInt(y) - posY
    let differenceXZero = differenceX === 0
    let differenceYZero = differenceY === 0
    let sideMove = (Math.abs(differenceX) === 100 && differenceYZero) ||
            (differenceXZero && Math.abs(differenceY) === 100)
    let diagnolMove = Math.abs(differenceX) === 100 && Math.abs(differenceY) === 100

    let colorStats = stats.get(currentTurn)
    
    if (sideMove || diagnolMove) {
        colorStats.kingsideCastling = false
        colorStats.queensideCastling = false
        return movePiece(x, y)
    }

    let kingsideCastle = differenceYZero && (differenceX >= 200) && colorStats.kingsideCastling
    let queensideCastle = differenceYZero && (differenceX <= -200) && colorStats.queensideCastling

    if (kingsideCastle) {
        for (let i = 1; i < 3; i++) {
            if (boardModel[posX / 100 + i][posY / 100].occupier !== "empty") {
                return false
            }
        }
        movePiece("600", selectedPiece.posY)
        let rookId = "rook_" + opposite(currentTurn) + "_kingside"
        setters.get(rookId)
            .setPositionX("500")
        let side = currentTurn === "white" ? 0 : 7
        updateBoard(7, side, 5, side, rookId)
        colorStats.kingsideCastling = false
        colorStats.queensideCastling = false
        return true
    } else if (queensideCastle) {
        for (let i = 1; i < 4; i++) {
            if (boardModel[posX / 100 - i][posY / 100].occupier !== "empty") {
                return false
            }
        }
        movePiece("200", selectedPiece.posY)
        let rookId = "rook_" + opposite(currentTurn) + "_queenside"
        setters.get(rookId)
            .setPositionX("300")
        let side = currentTurn === "black" ? 0 : 7
        updateBoard(0, side, 3, side, rookId)
        colorStats.kingsideCastling = false
        colorStats.queensideCastling = false
        return true
    }
    
    return false
}

function squareSelected(x, y, isCapture) {
    if (selectedPiece !== null) {
        if (selectedPiece.type === "pawn") {
            return isCapture ? pawnCapture(x, y) : movePawn(x, y)
        } else if (castlingEnabled && selectedPiece.type === "king") {
            return moveKing(x, y)
        } else {
            return movePieceFilter(x, y, selectedPiece.type)
        }
    }

    return true
}

function makePieces() {
    let result = []
    
    // Make pawns
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 2; j++) {
            let pColor = (j === 0 ? "black" : "white")
            let pieceId = "pawn_" + pColor + "_" + (id++).toString()
            result.push({
                id: pieceId,
                img: "piece-images/" + (j === 0 ? "black-pawn.png" : "white-pawn.png"),
                posX: (i * 100).toString(),
                posY: (100 + 500 * j).toString(),
                color: pColor,
                type: "pawn"
            })
            updateBoard(-1, -1, i, 1 + 5 * j, pieceId)
        }
    }

    // Make rooks, knights, and bishops
    for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
            let pColor = (j === 0 ? "black" : "white")
            let pSide = i === 0 ? "queenside" : "kingside"
            let pieceId = "rook_" + pColor + "_" + pSide
            result.push({
                id: pieceId,
                img: "piece-images/" + (j === 0 ? "black-rook.png" : "white-rook.png"),
                posX: (0 + 700 * i).toString(),
                posY: (700 * j).toString(),
                color: pColor,
                type: "rook",
                side: pSide
            })
            updateBoard(-1, -1, 7 * i, 7 * j, pieceId)
        }
        for (let j = 0; j < 2; j++) {
            let pColor = (j === 0 ? "black" : "white")
            let pSide = i === 0 ? "queenside" : "kingside"
            let pieceId = "knight_" + pColor + "_" + pSide
            result.push({
                id: pieceId,
                img: "piece-images/" + (j === 0 ? "black-knight.png" : "white-knight.png"),
                posX: (100 + 500 * i).toString(),
                posY: (700 * j).toString(),
                color: pColor,
                type: "knight",
                side: pSide
            })
            updateBoard(-1, -1, 1 + 5 * i, 7 * j, pieceId)
        }
        for (let j = 0; j < 2; j++) {
            let pColor = (j === 0 ? "black" : "white")
            let pSide = i === 0 ? "queenside" : "kingside"
            let pieceId = "bishop_" + pColor + "_" + pSide
            result.push({
                id: pieceId,
                img: "piece-images/" + (j === 0 ? "black-bishop.png" : "white-bishop.png"),
                posX: (200 + 300 * i).toString(),
                posY: (700 * j).toString(),
                color: pColor,
                type: "bishop",
                side: pSide
            })
            updateBoard(-1, -1, 2 + 3 * i, 7 * j, pieceId)
        }
    }

    // Make kings and queens
    for (let j = 0; j < 2; j++) {
        let pColor = (j === 0 ? "black" : "white")
        let pieceId = "queen_" + pColor + "_" + (id++).toString()
        result.push({
            id: pieceId,
            img: "piece-images/" + (j === 0 ? "black-queen.png" : "white-queen.png"),
            posX: "300",
            posY: (700 * j).toString(),
            color: (j === 0 ? "black" : "white"),
            type: "queen"
        })
        updateBoard(-1, -1, 3, 7 * j, pieceId)
    }
    for (let j = 0; j < 2; j++) {
        let pColor = (j === 0 ? "black" : "white")
        let pieceId = "king_" + pColor
        result.push({
            id: pieceId,
            img: "piece-images/" + (j === 0 ? "black-king.png" : "white-king.png"),
            posX: "400",
            posY: (700 * j).toString(),
            color: (j === 0 ? "black" : "white"),
            type: "king"
        })
        updateBoard(-1, -1, 4, 7 * j, pieceId)
    }
    detailBoard()

    return result
}

function pieceSelected(pieceId, x, y, pieceColor, pieceType, highlightPiece) {
    if (gameState !== "game running") {
        return
    }
    if (selectedPiece == null) {
        if (pieceColor === currentTurn) {
            selectedPiece = {
                id: pieceId,
                color: pieceColor,
                type: pieceType,
                posX: x,
                posY: y
            }
            setHighlight = highlightPiece
            highlightPiece(true)
        }
    } else if (selectedPiece.id === pieceId) {
        selectedPiece = null
        highlightPiece(false)
    } else { // Piece trying to capture another piece (color unknown)
        if (pieceColor !== selectedPiece.color) {
            if (squareSelected(x, y, true)) {
                oSetPieces(oPieces.filter((piece) => piece.id !== pieceId))
                if (pieceType === "king") {
                    endGame(opposite(pieceColor))
                }
            }
        } else {
            setHighlight(false)
            selectedPiece = {
                id: pieceId,
                color: pieceColor,
                type: pieceType,
                posX: x,
                posY: y
            }

            setHighlight = highlightPiece
            highlightPiece(true)
        }
    }
}

let setCurrentTurn
const Board = (props) => {
    let squares = []
    const [pieces, setPieces] = useState(originalPieces)
    const [turnColor, setTurnColor] = useState("white")
    let flipBoard = turnColor === "white" ? 0 : 700
    
    setCurrentTurn = setTurnColor
    oPieces = pieces
    oSetPieces = setPieces
    endMatch = props.matchEnded

    kingCaptures = !props.checkEnabled
    castlingEnabled = props.castlingEnabled
    flippingBoardEnabled = props.flippingEnabled
    pieceMovements = props.moveTypes

    useEffect(() => {
        if (props.gameDrawn) {
            endGame("draw")
        }
    })
    
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            let newSquare = {
                color: (i + j) % 2 === 0 ? "light-square" : "dark-square",
                sizeX: (100 / 8).toString() + "%",
                sizeY: (100 / 8).toString() + "%",
                posX: (Math.abs(flipBoard - j * 100)).toString(),
                posY: (Math.abs(flipBoard - i * 100)).toString(),
                id: "square_" + ((i + 1).toString()).padStart(2, "0") +
                     ((j + 1).toString()).padStart(2, "0")
            }

            squares.push(newSquare)
        }
    }
    
    return (
        <div style={{
            position: "absolute",
            height: "100vh",
            width: "80vw",
            display: "flex",
            justifyContent: "center",
            backgroundColor: "rgb(20, 20, 20)",
        }}>
        <div style={boardStyle}>
            {squares.map((square) => (
                <Square color={square.color} width={square.sizeX} height={square.sizeY} 
                posX={square.posX} posY={square.posY} key={square.id} selectSquare={squareSelected}
                boardFlip={flipBoard}/>
            ))}
            {pieces.map((piece) => (
                <Piece key={piece.id} img={piece.img} sizeX="12.5%" sizeY="12.5%" color={piece.color}
                type={piece.type} posX={piece.posX} posY={piece.posY} id={piece.id} boardFlip={flipBoard}
                selectPiece={pieceSelected} addSetter={addSetter} gameState={gameState}/>
            ))}
            
        </div>
        </div>
    )
}

const boardStyle = {
    width: "100vmin",
    height: "100vmin",
    backgroundColor: "gray",
    position: "relative",
}

export default Board