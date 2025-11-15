import * as React from "react"
import { useState, useEffect } from 'react';
import { Button, Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { navigate } from 'gatsby';
import toast, { Toaster } from 'react-hot-toast';
import EventSchedule from '../components/EventSchedule';
import { Schedule_API_Client } from "../api";
import '../App.css';
import '../mobile.css';

const SchedulePage = () => {
    const scheduleApiClient = new Schedule_API_Client();
    const [scheduleData, setScheduleData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchSchedule = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await scheduleApiClient.getSchedule();
            setScheduleData(data || []);
            setLastUpdated(new Date());
            toast.success('Schedule updated successfully!');
        } catch (err) {
            console.error('Error fetching schedule:', err);
            setError('Failed to load schedule. Please try again.');
            toast.error('Failed to load schedule');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedule();
    }, []);

    const handleRefresh = () => {
        fetchSchedule();
    };

    const handleBackToMenu = () => {
        navigate('/');
    };

    return (
        <Container fluid className="py-3">
            {/* Header */}
            <Row className="mb-4">
                <Col xs={12}>
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                        <div>
                            <h1 className="display-6 mb-1">📅 Event Schedule</h1>
                            {lastUpdated && (
                                <small className="text-muted">
                                    Last updated: {lastUpdated.toLocaleTimeString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit',
                                        hour12: true
                                    })}
                                </small>
                            )}
                        </div>
                        
                        {/* Navigation Buttons */}
                        <div className="d-flex flex-column flex-sm-row gap-2">
                            <Button 
                                variant="outline-primary"
                                onClick={handleBackToMenu}
                                className="projector-button"
                            >
                                🏠 Main Menu
                            </Button>
                            <Button 
                                variant="primary"
                                onClick={handleRefresh}
                                disabled={loading}
                                className="projector-button"
                            >
                                {loading ? (
                                    <>
                                        <Spinner size="sm" className="me-2" />
                                        Refreshing...
                                    </>
                                ) : (
                                    <>🔄 Refresh</>
                                )}
                            </Button>
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Error Alert */}
            {error && (
                <Row className="mb-4">
                    <Col xs={12}>
                        <Alert variant="danger" dismissible onClose={() => setError(null)}>
                            <Alert.Heading>Error Loading Schedule</Alert.Heading>
                            <p className="mb-0">{error}</p>
                        </Alert>
                    </Col>
                </Row>
            )}

            {/* Loading State */}
            {loading && !scheduleData.length && (
                <Row className="mb-4">
                    <Col xs={12} className="text-center">
                        <Spinner animation="border" role="status" className="me-3">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                        <span>Loading schedule...</span>
                    </Col>
                </Row>
            )}

            {/* Schedule Content */}
            <Row>
                <Col xs={12}>
                    <EventSchedule scheduleData={scheduleData} />
                </Col>
            </Row>

            {/* Help Text */}
            {!loading && scheduleData.length > 0 && (
                <Row className="mt-4">
                    <Col xs={12}>
                        <div className="text-center">
                            <small className="text-muted">
                                💡 Tip: Use the "Hide" button to hide events you don't want to see. 
                                Hidden events are remembered between page reloads. Toggle "Show hidden" to view them again.
                            </small>
                        </div>
                    </Col>
                </Row>
            )}

            <Toaster position="bottom-center" reverseOrder={false} />
        </Container>
    );
};

export default SchedulePage;

export const Head = () => <title>Event Schedule - FLL Scoreboard</title>