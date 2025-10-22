import React from "react"
import useInput from "../hooks/useInput"
import { Form, Button, Toast } from "react-bootstrap"
import { useContext, useEffect, useState } from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmarkCircle } from "@fortawesome/free-regular-svg-icons"
import { faCheckCircle } from "@fortawesome/free-regular-svg-icons"
import { toast } from "react-hot-toast"
import { Score_API_Client } from "../api"
import {settingsContext} from "../contexts/settingsContext"
import "../mobile.css"

export default function InputForm({teamData}){
    const [isValid, setIsValid] = useState(false)
    const [settings, setSettings] = useContext(settingsContext)
    const [selectedTeam, setSelectedTeam] = useState({})
    const client = new Score_API_Client()

    const Map = [
        {
            text: <>
                Team Number 
                <FontAwesomeIcon 
                    icon={isValid ? faCheckCircle : faXmarkCircle} 
                    className="projector-icon"
                    style={{color: isValid ? "#27ae60" : "#e74c3c"}} 
                    onClick={() => toast(isValid ? toast(`#${selectedTeam.number}: ${selectedTeam.name} is a real team`) : toast(`No Team found with that number`))} 
                    size="1x"/>
            </>,
            input: useInput(""),
            type: "text",
            key: "number"
        },
        {
            text: "Score",
            input: useInput(""),
            type: "text",
            key: "score",
            output: (val) => Number(val)
        }
    ]

    const form = Map.map((item) =>
        <Form.Group key={item.key} className="projector-form">
                <Form.Label>{item.text}</Form.Label>
                {item.type != "checkbox" && <Form.Control id={item.text} type={item.type} {...item.input}></Form.Control>}
                {item.type == "checkbox" && <Form.Check id={item.text} {...item.input}></Form.Check>}
        </Form.Group>
    )

    const checkField = Map.filter((item) => item.key === "number")[0]
    useEffect(() => {
        console.log(checkField.input.value)
        let inputedNumber = Number(checkField.input.value)
        if(inputedNumber == NaN){
            setIsValid(false)
            setSelectedTeam({})
            return
        }

        let team = teamData.find((item) => {
            console.log(item.team_id, inputedNumber)
            return item.team_id === inputedNumber
        })
        
        if(team != undefined){
            setIsValid(true)
            setSelectedTeam(team)
            return
        }

        setIsValid(false)
        setSelectedTeam({})

        
    }, [checkField.input.value])
    
    function Update(){
        let payload = {}

        Map.forEach((item) => {
            payload[item.key] = item.output ? item.output(item.input.value) : item.input.value
        })
        
        if(!isValid){
            toast(`${payload.number} does not exist in the DB`)
            return
        }

        // TODO: push new score to DB

        let inputedNumber = Number(checkField.input.value)
        console.log(teamData)
        let team = teamData.find((item) => {
            return item.team_id === inputedNumber
        })

        console.log(team)
        client.addScore(team.team_id, payload.score, settings.password).then(() => { toast(`Added Team #${payload['number']} a score of ${payload['score']}`)})
        console.log(payload)
    }

    // useEffect(() => {
    //     console.log(teamData)
    // }, [teamData])

    return <Form className="projector-form">
        {form}
        <br /> <br />
        <Button onClick={Update} className="projector-button" style={{float:"right"}}>Submit</Button>
    </Form>
}