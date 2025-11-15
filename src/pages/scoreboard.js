import * as React from "react"
import { useState, useEffect } from 'react';
import { Button, Container, Row, Col } from 'react-bootstrap';
import { navigate } from 'gatsby';
import toast, { Toaster } from 'react-hot-toast';
import Timer from '../components/Timer';
import Settings from '../components/Settings';
import InputForm from '../components/InputForm'
import ScoreTable from '../components/ScoreTable';
import styled from 'styled-components';
import { settingsContext } from '../contexts/settingsContext';
import { Team_API_Client, Display_API_Client } from "../api";
import '../App.css';
import '../mobile.css';

const FloatContainer = styled.div`
  padding: 5px;
`

const FloatChild = styled.div`
  width: 50%;
  float: left;
  padding: 5px;
`



const ScoreboardPage = () => {
    const teamApiClient = new Team_API_Client();
    const displayApiClient = new Display_API_Client();

    const [settings, setSettings] = useState(
        {
            timer: process.env.GATSBY_TIMER || "2:30",
            showForm: process.env.GATSBY_SHOW_FORM === 'true',
            backendUrl: process.env.GATSBY_BACKEND_URL || "http://127.0.0.1:5000",
            divisor: parseInt(process.env.GATSBY_DIVISOR) || 3,
        }
    )

    useEffect(() => {
        setSettings(prevSettings => ({
            ...prevSettings,
            password: localStorage.getItem("password") || "",
            tableSize: localStorage.getItem("tableSize") || 10,
        }));
    }, [])

    const offset = settings.showForm ? 80 : 100

    const [teamData, setTeamData] = useState([])

    function refreshData() {
        displayApiClient.getDisplay().then((data) => {
            setTeamData(data);
        });
    }

    useEffect(() => {
        localStorage.setItem("password", settings.password)
        displayApiClient.checkDisplayPassword(settings.password).then((data) => {
            console.log(data)
            if(data.status){
                toast.success("Password Accepted!")
            } else {
                console.debug("Password Rejected!")
            }
        });
    }, [settings.password])

    useEffect(() => {
        refreshData()
    }, [])

    const handleAdminClick = () => {
        navigate('/admin');
    };

    return <settingsContext.Provider value={[settings, setSettings]}>
        <Container fluid className="p-0">
            {/* Timer - Full Width */}
            <Row className="mb-3">
                <Col xs={12}>
                    <Timer></Timer>
                </Col>
            </Row>

            {/* Desktop Layout */}
            <div className="d-none d-lg-block">
                <FloatContainer>
                    <FloatChild style={{ width: `${offset}%` }}>
                        <ScoreTable teamData={teamData} refreshData={refreshData}></ScoreTable>
                        <br />
                        <div className="d-flex gap-2 flex-wrap">
                            <Button 
                                className="projector-button" 
                                variant="outline-primary"
                                onClick={() => navigate('/')}
                            >
                                🏠 Main Menu
                            </Button>
                            <Button 
                                className="projector-button" 
                                variant="outline-info"
                                onClick={() => navigate('/schedule')}
                            >
                                📅 Schedule
                            </Button>
                            <Settings></Settings>
                            <Button className="projector-button" onClick={handleAdminClick}>
                                Admin Panel
                            </Button>
                        </div>
                    </FloatChild>
                    <FloatChild style={{ width: `${100 - offset}%` }}>
                        {settings.showForm && <InputForm teamData={teamData}></InputForm>}
                    </FloatChild>
                </FloatContainer>
            </div>

            {/* Mobile/Tablet Layout */}
            <div className="d-lg-none">
                <Container>
                    <Row className="mb-3">
                        <Col xs={12}>
                            <ScoreTable teamData={teamData} refreshData={refreshData}></ScoreTable>
                        </Col>
                    </Row>

                    {/* Navigation Buttons - Mobile Stacked */}
                    <Row className="mb-3">
                        <Col xs={12}>
                            <div className="d-grid gap-2">
                                <Button 
                                    className="projector-button" 
                                    variant="outline-primary"
                                    onClick={() => navigate('/')}
                                >
                                    🏠 Main Menu
                                </Button>
                                <Button 
                                    className="projector-button" 
                                    variant="outline-info"
                                    onClick={() => navigate('/schedule')}
                                >
                                    📅 Schedule
                                </Button>
                                <div className="d-flex gap-2">
                                    <Settings></Settings>
                                    <Button className="projector-button flex-grow-1" onClick={handleAdminClick}>
                                        Admin Panel
                                    </Button>
                                </div>
                            </div>
                        </Col>
                    </Row>

                    {/* Input Form - Mobile */}
                    {settings.showForm && (
                        <Row>
                            <Col xs={12}>
                                <InputForm teamData={teamData}></InputForm>
                            </Col>
                        </Row>
                    )}
                </Container>
            </div>
        </Container>
        <Toaster position="bottom-center" reverseOrder={false}></Toaster>
    </settingsContext.Provider>
}

export default ScoreboardPage

export const Head = () => <title>Score Board</title>