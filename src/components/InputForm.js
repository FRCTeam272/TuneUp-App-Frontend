import React from "react"
import useInput from "../hooks/useInput"
import { Form, Button, Toast } from "react-bootstrap"
import { useContext, useEffect, useState } from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmarkCircle } from "@fortawesome/free-regular-svg-icons"
import { faCheckCircle } from "@fortawesome/free-regular-svg-icons"
import { toast } from "react-hot-toast"
import { addScore } from "../api"
import {settingsContext} from "../contexts/settingsContext"

export default function InputForm({teamData}){
    const [isValid, setIsValid] = useState(false)
    const [settings, setSettings] = useContext(settingsContext)
    const [selectedTeam, setSelectedTeam] = useState({})

    const Map = [
        {
            text: <>
                Team Number 
                <FontAwesomeIcon 
                    icon={isValid ? faCheckCircle : faXmarkCircle} 
                    style={{color: isValid ? "green" : "red", marginLeft: "5px"}} 
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
        <Form.Group key={item.key}>
                <Form.Label>{item.text}</Form.Label>
                {item.type != "checkbox" && <Form.Control id={item.text} type={item.type} {...item.input}></Form.Control>}
                {item.type == "checkbox" && <Form.Check id={item.text} {...item.input}></Form.Check>}
        </Form.Group>
    )

    const checkField = Map.filter((item) => item.key === "number")[0]
    useEffect(() => {
        
        let inputedNumber = Number(checkField.input.value)
        if(inputedNumber == NaN){
            setIsValid(false)
            setSelectedTeam({})
            return
        }

        let team = teamData.find((item) => {
            return item.number === inputedNumber
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
        
        teamData.find((item) => {
            return item.number === inputedNumber
        }).scores.push(payload.score)
        
        addScore(settings.backendUrl, payload["number"], payload["score"]).then(() => toast(`Added Team #${payload['number']} a score of ${payload['score']}`))
        console.log(payload)
    }

    // useEffect(() => {
    //     console.log(teamData)
    // }, [teamData])

    return <Form>
        {form}
        <br /> <br />
        <Button onClick={Update} style={{float:"right", backgroundColor:"green"}}>Submit</Button>
    </Form>
}