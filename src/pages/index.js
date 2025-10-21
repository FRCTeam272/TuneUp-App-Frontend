import * as React from "react"
import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup } from 'react-bootstrap';
import { navigate } from 'gatsby';
import { Display_API_Client } from '../api';
import '../App.css';
import { use } from "react";

const IndexPage = () => {
    const [teamNumber, setTeamNumber] = useState('');
    const [isPasswordValid, setIsPasswordValid] = useState(false);
    const [passwordChecked, setPasswordChecked] = useState(false);
    
    const displayApiClient = new Display_API_Client();
    const [password, setPassword] = useState('');

    useEffect(() => {
        const storedPassword = localStorage.getItem('displayPassword') || '';
        setPassword(storedPassword);
    }, []);

    // Check password validity on component mount
    useEffect(() => {
        const checkPassword = async () => {
            if (password) {
                try {
                    const result = await displayApiClient.checkDisplayPassword(password);
                    setIsPasswordValid(result.status || result.success || result.valid || false);
                } catch (err) {
                    console.error('Error checking password:', err);
                    setIsPasswordValid(false);
                } finally {
                    setPasswordChecked(true);
                }
            } else {
                setPasswordChecked(true);
                setIsPasswordValid(false);
            }
        };

        checkPassword();
    }, [password]);

    const menuItems = [
        {
            title: '🏆 Live Display',
            description: 'View live scores, timer, and team rankings',
            path: '/scoreboard',
            variant: 'primary'
        },
        {
            title: isPasswordValid ? '⚙️ Admin Panel' : '📋 Score Listing',
            description: isPasswordValid ? 'Manage teams, add/remove scores, and administrative functions' : 'View a list of all teams and their scores',
            path: '/admin',
            variant: 'secondary'
        }
    ];

    const handleNavigation = (path) => {
        navigate(path);
    };

    const handleTeamNavigation = (e) => {
        e.preventDefault();
        const trimmedNumber = teamNumber.trim();
        
        if (trimmedNumber && /^\d+$/.test(trimmedNumber)) {
            navigate(`/team/${trimmedNumber}`);
        } else {
            // Could add error handling here if needed
            alert('Please enter a valid team number');
        }
    };

    const handleTeamInputChange = (e) => {
        setTeamNumber(e.target.value);
    };

    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col md={8} lg={6}>
                    <div className="text-center mb-5">
                        <h1 className="display-4 mb-3">🤖 FLL Scoreboard</h1>
                        <p className="lead text-muted">
                            FIRST LEGO League Competition Management System
                        </p>
                    </div>
                    
                    <Row className="g-4">
                        {menuItems.map((item, index) => (
                            <Col key={index} sm={6}>
                                <Card className="h-100 shadow-sm">
                                    <Card.Body className="d-flex flex-column text-center p-4">
                                        <Card.Title className="h3 mb-3">
                                            {item.title}
                                        </Card.Title>
                                        <Card.Text className="text-muted mb-4 flex-grow-1">
                                            {item.description}
                                        </Card.Text>
                                        <Button 
                                            variant={item.variant}
                                            size="lg"
                                            className="projector-button w-100"
                                            onClick={() => handleNavigation(item.path)}
                                        >
                                            Enter
                                        </Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    {/* Team Number Quick Access */}
                    <div className="mt-5">
                        <Card className="shadow-sm">
                            <Card.Body className="p-4">
                                <div className="text-center mb-3">
                                    <Card.Title className="h4 mb-2">
                                        👥 Quick Team Access
                                    </Card.Title>
                                    <Card.Text className="text-muted">
                                        Enter your team number to go directly to your team page
                                    </Card.Text>
                                </div>
                                
                                <Form onSubmit={handleTeamNavigation}>
                                    <Row className="justify-content-center">
                                        <Col md={8} lg={6}>
                                            <InputGroup size="lg">
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Enter team number (e.g., 12345)"
                                                    value={teamNumber}
                                                    onChange={handleTeamInputChange}
                                                    pattern="[0-9]*"
                                                    inputMode="numeric"
                                                />
                                                <Button 
                                                    variant="success"
                                                    type="submit"
                                                    disabled={!teamNumber.trim() || !/^\d+$/.test(teamNumber.trim())}
                                                    className="projector-button"
                                                >
                                                    Go to Team
                                                </Button>
                                            </InputGroup>
                                        </Col>
                                    </Row>
                                </Form>
                            </Card.Body>
                        </Card>
                    </div>

                    <div className="text-center mt-5">
                        <small className="text-muted">
                            Select an option above to continue
                        </small>
                    </div>
                </Col>
            </Row>
        </Container>
    );
}

export default IndexPage

export const Head = () => <title>FLL Scoreboard - Main Menu</title>