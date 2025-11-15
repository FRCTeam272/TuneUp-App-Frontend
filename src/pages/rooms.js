import * as React from "react"
import { useState, useEffect } from 'react';
import { Button, Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { navigate } from 'gatsby';
import toast, { Toaster } from 'react-hot-toast';
import RoomAssignments from '../components/RoomAssignments';
import { Schedule_API_Client } from "../api";
import '../App.css';
import '../mobile.css';

const RoomsPage = ({ location }) => {
    const scheduleApiClient = new Schedule_API_Client();
    const [roomData, setRoomData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    // Parse URL parameters for hidden teams
    const getHiddenTeamsFromUrl = () => {
        if (typeof window === 'undefined' || !location?.search) return new Set();
        
        const params = new URLSearchParams(location.search);
        const hideParam = params.get('hide');
        
        if (hideParam) {
            try {
                // Support both comma-separated list and JSON array
                let teamIds;
                if (hideParam.startsWith('[') && hideParam.endsWith(']')) {
                    teamIds = JSON.parse(hideParam);
                } else {
                    teamIds = hideParam.split(',').map(id => id.trim());
                }
                
                // Convert to numbers and filter valid ones
                const validIds = teamIds
                    .map(id => parseInt(id, 10))
                    .filter(id => !isNaN(id));
                
                return new Set(validIds);
            } catch (error) {
                console.error('Error parsing hide parameter:', error);
                return new Set();
            }
        }
        
        return new Set();
    };

    const fetchRooms = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await scheduleApiClient.getRooms();
            setRoomData(data || []);
            setLastUpdated(new Date());
            toast.success('Room assignments updated successfully!');
        } catch (err) {
            console.error('Error fetching room assignments:', err);
            setError('Failed to load room assignments. Please try again.');
            toast.error('Failed to load room assignments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
        
        // Apply URL-based hidden teams after a short delay to ensure localStorage is loaded first
        const urlHiddenTeams = getHiddenTeamsFromUrl();
        if (urlHiddenTeams.size > 0) {
            setTimeout(() => {
                // Get existing hidden teams from localStorage
                const storedHiddenTeams = localStorage.getItem('hiddenRoomTeams');
                let existingHidden = new Set();
                
                if (storedHiddenTeams) {
                    try {
                        existingHidden = new Set(JSON.parse(storedHiddenTeams));
                    } catch (error) {
                        console.error('Error parsing stored hidden teams:', error);
                    }
                }
                
                // Merge URL hidden teams with existing ones
                const mergedHidden = new Set([...existingHidden, ...urlHiddenTeams]);
                localStorage.setItem('hiddenRoomTeams', JSON.stringify(Array.from(mergedHidden)));
                
                // Force a re-render by triggering a storage event
                window.dispatchEvent(new Event('storage'));
            }, 100);
        }
    }, [location?.search]);

    const handleRefresh = () => {
        fetchRooms();
    };

    const handleBackToMenu = () => {
        navigate('/');
    };

    const generateShareUrl = () => {
        const hiddenTeams = localStorage.getItem('hiddenRoomTeams');
        if (!hiddenTeams) return null;
        
        try {
            const hiddenArray = JSON.parse(hiddenTeams);
            if (hiddenArray.length === 0) return null;
            
            const baseUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';
            const hideParam = hiddenArray.join(',');
            return `${baseUrl}?hide=${encodeURIComponent(hideParam)}`;
        } catch (error) {
            console.error('Error generating share URL:', error);
            return null;
        }
    };

    const handleCopyShareUrl = () => {
        const shareUrl = generateShareUrl();
        if (shareUrl && typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(shareUrl).then(() => {
                toast.success('Share URL copied to clipboard!');
            }).catch(err => {
                console.error('Failed to copy URL:', err);
                toast.error('Failed to copy URL');
            });
        } else {
            toast.error('No hidden teams to share or clipboard not available');
        }
    };

    const shareUrl = generateShareUrl();

    return (
        <Container fluid className="py-3">
            {/* Header */}
            <Row className="mb-4">
                <Col xs={12}>
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                        <div>
                            <h1 className="display-6 mb-1">🏠 Room Assignments</h1>
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
                            {shareUrl && (
                                <Button 
                                    variant="outline-info"
                                    onClick={handleCopyShareUrl}
                                    className="projector-button"
                                    title="Copy shareable URL with current hidden teams"
                                >
                                    🔗 Share View
                                </Button>
                            )}
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
                            <Alert.Heading>Error Loading Room Assignments</Alert.Heading>
                            <p className="mb-0">{error}</p>
                        </Alert>
                    </Col>
                </Row>
            )}

            {/* Loading State */}
            {loading && !roomData.length && (
                <Row className="mb-4">
                    <Col xs={12} className="text-center">
                        <Spinner animation="border" role="status" className="me-3">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                        <span>Loading room assignments...</span>
                    </Col>
                </Row>
            )}

            {/* Room Assignments Content */}
            <Row>
                <Col xs={12}>
                    <RoomAssignments roomData={roomData} />
                </Col>
            </Row>

            {/* Help Text */}
            {!loading && roomData.length > 0 && (
                <Row className="mt-4">
                    <Col xs={12}>
                        <div className="text-center">
                            <small className="text-muted">
                                💡 Tips: Use the "Hide" button to hide teams you don't want to see. 
                                Switch between Room View and Judge View using the toggle button. 
                                Hidden teams are remembered and can be shared via URL.
                            </small>
                        </div>
                    </Col>
                </Row>
            )}

            <Toaster position="bottom-center" reverseOrder={false} />
        </Container>
    );
};

export default RoomsPage;

export const Head = () => <title>Room Assignments - FLL Scoreboard</title>