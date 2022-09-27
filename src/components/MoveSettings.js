import React, { useState } from "react"
import "./controlbar.css"

let key = 0
let pieceMovements = {
    rook: [[1, 0, 8], [-1, 0, 8], [0, 1, 8], [0, -1, 8]],
    bishop: [[1, 1, 8], [-1, -1, 8], [1, -1, 8], [-1, 1, 8]],
    knight: [[1, 2, 1], [-1, 2, 1], [1, -2, 1], [-1, -2, 1], 
    [2, 1, 1], [2, -1, 1], [-2, 1, 1], [-2, -1, 1]],
    king: [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], 
    [1, 1, 1], [-1, -1, 1], [1, -1, 1], [-1, 1, 1]],
    queen: [[1, 0, 8], [-1, 0, 8], [0, 1, 8], [0, -1, 8], 
    [1, 1, 8], [-1, -1, 8], [1, -1, 8], [-1, 1, 8]]
}

function createInitialState(type) {
    let initialState = []
    let movements = pieceMovements[type]
    for (let i = 0; i < movements.length; i++) {
        initialState.push({
            id: key++,
            x: movements[i][0],
            y: movements[i][1],
            maxu: movements[i][2]
        })
    }

    return initialState
}

const MoveSettings = (props) => {
    const [showSettings, setShowSettings] = useState(false)
    const [triplets, setTriplets] = useState(createInitialState(props.type))
    let secondClass = showSettings ? "show" : "hide"
    return (
        <>
            <button className="change-btn" onClick={() => {setShowSettings(!showSettings)}}> 
                Change move settings for the {props.type}
            </button>
            <div className={"piece-settings " + secondClass}>
                {triplets.map((triplet) => (
                    <div className="setting-triplet" key={triplet.id}>
                        <div>Unit x:<input type="number" className="setting-input" 
                            min="-8" max="8" value={triplet.x} 
                            onChange={(e) => setTriplets(triplets.map((t) => {
                                if (t.id === triplet.id) {
                                    return {id: t.id, x: e.target.value, y: t.y, maxu: t.maxu}
                                } else{
                                    return t
                                }
                            }))}></input></div>
                        <div>Unit y:<input type="number" className="setting-input"
                            min="-8" max="8" value={triplet.y} 
                            onChange={(e) => setTriplets(triplets.map((t) => {
                                if (t.id === triplet.id) {
                                    return {id: t.id, x: t.x, y: e.target.value, maxu: t.maxu}
                                } else{
                                    return t
                                }
                            }))}></input></div>
                        <div>Max units:<input type="number" className="setting-input"
                            min="0" max="8" value={triplet.maxu} 
                            onChange={(e) => setTriplets(triplets.map((t) => {
                                if (t.id === triplet.id) {
                                    return {id: t.id, x: t.x, y: t.y, maxu: e.target.value}
                                } else{
                                    return t
                                }
                            }))}></input></div>
                        <div onClick={() => setTriplets(triplets.filter((t) => triplet.id !== t.id))}
                            className="delete-btn">&#10006;</div>
                    </div>
                ))}
                <div className="add-btn" onClick={() => setTriplets([...triplets, {id: key++, x: 0, 
                y: 0, maxu: 0}])}>&#10010;</div>
                <button onClick={() => {
                    setShowSettings(false)
                    props.sendTriplets(triplets, props.type)
                }}>Save</button>
            </div>
        </>
    )
}

export default MoveSettings