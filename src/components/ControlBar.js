import DrawBtn from "./DrawBtn"
import MoveSettings from "./MoveSettings"
import Tutorial from "./Tutorial"
import React from "react"

const ControlBar = (props) => {
    return (
        <div className="control-bar">
            <DrawBtn drawGame={props.drawGame}/>
            <button onClick={() => {
                props.changeChecks(!props.checkEnabled)
            }}>{props.checkEnabled ? "Disable" : "Enable"} check/checkmate detection</button>
            <button onClick={() => {props.changeCastling(!props.castlingEnabled)}}>
                {props.castlingEnabled ? "Disable" : "Enable"} castling
            </button>
            <button onClick={() => {props.changeFlipping(!props.flippingEnabled)}}>
                {props.flippingEnabled ? "Disable" : "Enable"} board flipping each turn
            </button>
            <MoveSettings type="rook" sendTriplets={props.sendTriplets}/>
            <MoveSettings type="knight" sendTriplets={props.sendTriplets}/>
            <MoveSettings type="bishop" sendTriplets={props.sendTriplets}/>
            <MoveSettings type="queen" sendTriplets={props.sendTriplets}/>
            <MoveSettings type="king" sendTriplets={props.sendTriplets}/>
            <Tutorial />
        </div>
    )
}

export default ControlBar