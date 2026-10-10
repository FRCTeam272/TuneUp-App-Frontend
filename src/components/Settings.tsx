import React from "react"
import { Button, Modal, Form } from "react-bootstrap";
import { useState } from "react"
import useInput from "../hooks/useInput";
import { storedPassword, useSettings, type Settings as SettingsValues } from "../contexts/settingsContext";
import "../mobile.css";

type Toggle = "showForm" | "showTime";

export default function Settings(){
    const [isHidden, setIsHidden] = useState(true)
    const [settings, setSettings] = useSettings();
    const timer = useInput(settings.timer)
    const backendUrl = useInput(settings.backendUrl)
    const divisor = useInput(settings.divisor)
    const tableSize = useInput(settings.tableSize || 10)
    const password = useInput(storedPassword())

    const fields = [
        { title: "Timer Length", key: "timer", input: timer, type: "text" },
        { title: "Data Host (DO NOT TOUCH)", key: "backendUrl", input: backendUrl, type: "text" },
        { title: "Score Divisor", key: "divisor", input: divisor, type: "text" },
        { title: "Table Size", key: "tableSize", input: tableSize, type: "text", addSpace: true },
        { title: "Password", key: "password", input: password, type: "password" },
    ]
    const toggles: { title: string, key: Toggle }[] = [
        { title: "Toggle Data Entry Form", key: "showForm" },
        { title: "Show Time instead of Timer", key: "showTime" },
    ]

    function toggle(key: Toggle) {
        setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
    }

    const form = <>
        {fields.slice(0, 3).map(renderField)}
        {toggles.map((item) => <Form.Group key={item.key} className="projector-form">
            <br></br>
            <Button onClick={() => toggle(item.key)} className="projector-button">{item.title}</Button>
        </Form.Group>)}
        {fields.slice(3).map(renderField)}
    </>

    function renderField(item: typeof fields[number]) {
        return <Form.Group key={item.key} className="projector-form">
            {item.addSpace && <br></br>}
            <Form.Label>{item.title}</Form.Label>
            <Form.Control id={item.title} type={item.type} {...item.input}></Form.Control>
        </Form.Group>
    }

    function Update(){
        const payload: SettingsValues = {
            timer: timer.value,
            backendUrl: backendUrl.value,
            divisor: Number(divisor.value),
            showForm: settings.showForm,
            showTime: settings.showTime,
            tableSize: Number(tableSize.value),
            password: password.value,
        }
        console.log(payload)
        setSettings(payload)
    }


    return <>
        <Modal show={!isHidden} onHide={() => setIsHidden(true)} className="projector-modal">
            <Modal.Header><h1>Settings</h1></Modal.Header>
            <Modal.Body>{form}</Modal.Body>
            <Modal.Footer>
                <Button className="projector-button" onClick={Update}>Update Settings</Button>
            </Modal.Footer>
        </Modal>
        <Button className="projector-button" onClick={() => setIsHidden(false)}>Settings</Button>
    </>
}
