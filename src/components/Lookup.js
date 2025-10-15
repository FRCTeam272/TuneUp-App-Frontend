import React from "react"
import { useContext, useEffect, useState } from "react"
import { Form, Modal, Button } from "react-bootstrap"
import { settingsContext } from "../contexts/settingsContext";
import useInput from "../hooks/useInput"

class FormEntry{
    constructor(title, key, type="text", input = {value: "", onChange: () => ""}, disabled=false, output=(value)=>value){
        this.title = title
        this.key = key
        this.input = input
        this.type = type
        this.isDisabled = disabled
        this.output = output
    }
}

export default function TeamLookUp({teamData}){
    const [isHidden, setIsHidden] = useState(true)
    const searchTerm = useInput("");
    const [settings, setSettings] = useContext(settingsContext);
    const [selectedTeam, setSelectedTeam] = useState({
        name: "",
        scores: []
    })
    const [form, setform] = useState(<></>)

    const Map = [
        new FormEntry("Team Number", "number", searchTerm, false, (value) => value),
    ]

    useEffect(() => {
        let team = teamData.find((item) => item.number == searchTerm.value)
        console.log(team)
        // if(team){
        //     team['orderedScores'] = team['scores'].sort().reverse().splice(0, settings.dividend)
        //     team['average'] = team['orderedScores'].reduce((a,b) => a+b) / team['orderScores'].length
        // }
        setSelectedTeam(team)
    }, [searchTerm.value])

    

    useEffect(() => {
        if(!selectedTeam){
            return 
        }
        setform(Map.map((item) =>
        <Form.Group key={item.key} className="projector-form">
            {item.addSpace && <br></br>}
            {item.type != "button" && <>
            <Form.Label>{item.title}</Form.Label>
            <Form.Control id={item.title} type={item.type} {...item.input}></Form.Control></>}
            {item.type == "button" && <><Button onClick={item.onClick} className="projector-button">{item.title}</Button></>}
        </Form.Group>
        ))

        

    }, [selectedTeam])
    
    function Update(){

    }

    useEffect(() => {
        setSelectedTeam({})
    }, [])

    return <>
        <Modal show={!isHidden} onHide={() => setIsHidden(true)} className="projector-modal">
            <Modal.Header><h1>LookUp</h1></Modal.Header>
            <Modal.Body>
                <Form className="projector-form">
                    <Form.Group key="number">
                        <Form.Label>Team Number</Form.Label>
                        <Form.Control id="number" type="text" {...searchTerm}></Form.Control>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <TeamEditorModal team={selectedTeam}></TeamEditorModal>
            </Modal.Footer>
        </Modal>
        <Button className="projector-button" style={{float:"right"}} onClick={() => setIsHidden(false)}>Team Info Lookup</Button>
    </>
}

function TeamEditorModal({team}){
    const [isHidden, setIsHidden] = useState(true)
    const [settings, setSettings] = useContext(settingsContext)
    const handledTeam = (team == undefined || Object.keys(team).length === 0) ? {number: "", name: "", scores: []} : team

    console.log("Editor", handledTeam)
    const Map = [
        new FormEntry("Team Number", "number", "text", {value: handledTeam.number, onChange: () => ""}, true),
        new FormEntry("Team Name", "name", "text", useInput(handledTeam.name), false),
        new FormEntry("Scores", "scores", "text", useInput(handledTeam.scores), false),
        new FormEntry("Ordered Scores", "descScores", "text", {value : handledTeam.scores.sort().reverse(), onChange: () => ""}, true),
        new FormEntry("Top Scores", "topScores", "text", {value : handledTeam.scores.sort().reverse().splice(0, settings.dividend), onChange: () => ""}, true),
        new FormEntry("Average", "average", "text", {value : handledTeam.scores.sort().reverse().splice(0, settings.dividend) / handledTeam.scores.sort().reverse().splice(0, settings.dividend).length, onChange: () => ""}, true)
    ]

    useEffect(() => {
        console.log(Map[1].input.value)
    }, [Map])

    const form = Map.map((item) => 
        <Form.Group key={item.key} className="projector-form">
            <Form.Label>{item.title}</Form.Label>
            <Form.Control id={item.key} type={item.type} {...item.input} disabled={item.disabled}></Form.Control>
        </Form.Group>
    )

    function Update(){

    }

    return <>
        <Modal show={!isHidden} onHide={() => setIsHidden(true)} className="projector-modal">
            <Modal.Header><h1>Team Editor</h1></Modal.Header>
            <Modal.Body>
                <Form className="projector-form">
                    {form}
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button className="projector-button" style={{float:"right"}} onClick={Update}>Update</Button>
            </Modal.Footer>
        </Modal>
        <Button className="projector-button" onClick={() => setIsHidden(false)}>Open Editor</Button>
    </>
}