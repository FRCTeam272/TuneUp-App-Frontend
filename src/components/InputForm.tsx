import React from "react"
import useInput from "../hooks/useInput"
import { Form, Button } from "react-bootstrap"
import "../../static/home.png"
import { useEffect, useState } from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmarkCircle } from "@fortawesome/free-regular-svg-icons"
import { faCheckCircle } from "@fortawesome/free-regular-svg-icons"
import { toast } from "react-hot-toast"
import { errorMessage, scoreApi, type DisplayTeamScoresResponse } from "../api"
import { useSettings } from "../contexts/settingsContext"
import "../mobile.css"

interface InputFormProps {
    teamData: DisplayTeamScoresResponse[];
}

export default function InputForm({teamData}: InputFormProps){
    const [settings] = useSettings()
    const [selectedTeam, setSelectedTeam] = useState<DisplayTeamScoresResponse | null>(null)
    const isValid = selectedTeam !== null
    const number = useInput("")
    const score = useInput("")

    const fields = [
        {
            text: <>
                Team Number
                <FontAwesomeIcon
                    icon={isValid ? faCheckCircle : faXmarkCircle}
                    className="projector-icon"
                    style={{color: isValid ? "#27ae60" : "#e74c3c"}}
                    onClick={() => toast(selectedTeam ? `#${selectedTeam.team_id}: ${selectedTeam.team_name} is a real team` : `No Team found with that number`)}
                    size="1x"/>
            </>,
            id: "Team Number",
            input: number,
            key: "number"
        },
        {
            text: "Score",
            id: "Score",
            input: score,
            key: "score",
        }
    ]

    const form = fields.map((item) =>
        <Form.Group key={item.key} className="projector-form">
                <Form.Label>{item.text}</Form.Label>
                <Form.Control id={item.id} type="text" {...item.input}></Form.Control>
        </Form.Group>
    )

    useEffect(() => {
        const inputedNumber = Number(number.value)
        setSelectedTeam(teamData.find((item) => item.team_id === inputedNumber) ?? null)
    }, [number.value])

    function Update(){
        if(!selectedTeam){
            toast(`${number.value} does not exist in the DB`)
            return
        }

        const points = Number(score.value)
        scoreApi.addScore(selectedTeam.team_id, points, settings.password)
            .then(() => { toast(`Added Team #${number.value} a score of ${points}`)})
            .catch((err) => { toast.error(errorMessage(err)) })
    }

    return <Form className="projector-form">
        {form}
        <br /> <br />
        <Button onClick={Update} className="projector-button" style={{float:"right"}}>Submit</Button>
        <br/><br/>
        <span>Scan to access App</span>
        <br/>
        <img src="/home.png" alt="Home" style={{display: 'block', marginTop: '20px'}} />
    </Form>
}
