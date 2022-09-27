import "./controlbar.css"
import React from "react"

const DrawBtn = (props) => {
    return (
        <div className="draw">
            Click here if both players agree to draw!
        <button onClick={props.drawGame}> Draw </button>
        </div>
    )
}

export default DrawBtn