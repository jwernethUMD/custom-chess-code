// This is archived code that could be useful if the behavior of its replacement code is incorrect
/*

// Board.js old functions
function moveQueen(x, y) {
    let posX = parseInt(selectedPiece.posX)
    let posY = parseInt(selectedPiece.posY)
    let differenceX = parseInt(x) - posX
    let differenceY = parseInt(y) - posY
    let differenceXZero = differenceX === 0
    let differenceYZero = differenceY === 0
    let bishopMove = Math.abs(differenceX) === Math.abs(differenceY)
    let rookMove = (!differenceXZero && differenceYZero) || (differenceXZero && !differenceYZero)

    if (bishopMove) {
        let directionX = differenceX / Math.abs(differenceX)
        let directionY = differenceY / Math.abs(differenceY)
        for (let i = 1; i < differenceX * directionX / 100; i++) {
            if (boardModel[(posX / 100) + i * directionX][posY / 100 + i * directionY]) {
                return false
            }
        }

        movePiece(x, y)
        return true
    } else if (rookMove) {
        if (!differenceXZero && differenceYZero) {
            let direction = differenceX / Math.abs(differenceX)
            for (let i = 1; i < differenceX * direction / 100; i++) {
                if (boardModel[(posX / 100) + i * direction][posY / 100]) {
                    return false
                }
            }
    
            movePiece(x, y)
            return true
        } else if (differenceXZero && !differenceYZero) {
            let direction = differenceY / Math.abs(differenceY)
            for (let i = 1; i < differenceY * direction / 100; i++) {
                if (boardModel[posX / 100][(posY / 100) + i * direction]) {
                    return false
                }
            }
            
            movePiece(x, y)
            return true
        }
        movePiece(x, y)
        return true
    }

    return false
}*/

/* function findPiece(pieces, pieceId) {
    for (let i = 0; i < pieces.length; i++) {
        if (pieces[i].id === pieceId) {
            return pieces[i]
        }
    }
} */

// Piece.js old functions
/*
function onClickFunc() {

}

function move(x, y, posX, posY, setPositionX, setPositionY) {
    setPositionX((parseInt(posX) + 100 * x).toString())
    setPositionY((parseInt(posY) + 100 * y).toString())
}

function moveTo(x, y) {
    setPositionX((x * 100).toString())
    setPositionY((y * 100).toString())
} */