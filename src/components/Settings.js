import React from "react"
import { Button, Modal, Form } from "react-bootstrap";
import { useContext, useEffect, useState } from "react"
import useInput from "../hooks/useInput";
import { minutesToSeconds } from "./Timer";
import { settingsContext } from "../contexts/settingsContext";

export default function Settings(){
    const [isHidden, setIsHidden] = useState(true)
    const [settings, setSettings] = useContext(settingsContext);
    const Map = [
        {
            title: "Timer Length",
            key: "timer",
            input: useInput(settings.timer),
            type: "text"
        },
        {
            title: "Data Host (DO NOT TOUCH)",
            key: "backendUrl",
            input: useInput(settings.backendUrl),
            type: "text"
        },
        {
            title: "Score Divisor",
            key: "divisor",
            input: useInput(settings.divisor),
            type: "text",
            output: (item) => Number(item)
        },
        {
            title: "Toggle Data Entry Form",
            key: "showForm",
            addSpace: true,
            input: useInput(""),
            output: (val) => settings.showForm,
            onClick: () => {
                let settingsCopy = settings;
                settingsCopy.showForm = !settings.showForm
                setSettings(settingsCopy)
            },
            type: "button"
        },
        {
            title: "Show Time instead of Timer",
            key: "showTime",
            addSpace: true,
            input: useInput(false),
            output: (val) => settings.showTime,
            onClick: () => {
                let settingsCopy = settings;
                settingsCopy.showTime = !settings.showTime
                console.log(settingsCopy)
                setSettings(settingsCopy)
            },
            type: "button"
        }
    ]
    const form = Map.map((item) => {
        return <Form.Group key={item.key}>
                {item.addSpace && <br></br>}
                {item.type != "button" && <>
                <Form.Label>{item.title}</Form.Label>
                <Form.Control id={item.title} type={item.type} {...item.input}></Form.Control></>}
                {item.type == "button" && <><Button onClick={item.onClick} style={{backgroundColor:"green"}}>{item.title}</Button></>}
            </Form.Group>
    })

    function Update(){
        let payload = {}
        Map.forEach((item) => {
            payload[item.key] = item.output != null ? item.output(item.input.value) : item.input.value
        })
        console.log(payload)
        setSettings(payload)
    }


    return <>
        <Modal show={!isHidden} onHide={() => setIsHidden(true)}>
            <Modal.Header><h1>Settings</h1></Modal.Header>
            <Modal.Body>{form}</Modal.Body>
            <Modal.Footer>
                <Button style={{backgroundColor:"green"}} onClick={Update}>Update Settings</Button>
            </Modal.Footer>
        </Modal>
        <Button style={{backgroundColor:"green"}} onClick={() => setIsHidden(false)}>Settings</Button>
    </>
}