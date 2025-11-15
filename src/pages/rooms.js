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
    const [showShareUrl, setShowShareUrl] = useState(false);

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
        if (urlHiddenTeams.size > 0 && typeof window !== 'undefined') {
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
                
                // Check if we're adding new teams
                const newTeams = Array.from(urlHiddenTeams).filter(id => !existingHidden.has(id));
                
                // Merge URL hidden teams with existing ones
                const mergedHidden = new Set([...existingHidden, ...urlHiddenTeams]);
                localStorage.setItem('hiddenRoomTeams', JSON.stringify(Array.from(mergedHidden)));
                
                // Show notification if new teams were hidden
                if (newTeams.length > 0) {
                    toast.success(`Hidden ${newTeams.length} team(s) from shared URL: ${newTeams.join(', ')}`, {
                        duration: 5000
                    });
                }
                
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
        if (typeof window === 'undefined') return null;
        
        const baseUrl = window.location.origin + window.location.pathname;
        const hiddenTeams = localStorage.getItem('hiddenRoomTeams');
        
        if (!hiddenTeams) {
            return baseUrl; // Return base URL if no hidden teams
        }
        
        try {
            const hiddenArray = JSON.parse(hiddenTeams);
            if (hiddenArray.length === 0) {
                return baseUrl; // Return base URL if no hidden teams
            }
            
            const hideParam = hiddenArray.join(',');
            return `${baseUrl}?hide=${encodeURIComponent(hideParam)}`;
        } catch (error) {
            console.error('Error generating share URL:', error);
            return baseUrl; // Fallback to base URL
        }
    };

    const handleCopyShareUrl = () => {
        const shareUrl = generateShareUrl();
        if (shareUrl && typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(shareUrl).then(() => {
                const hiddenTeams = localStorage.getItem('hiddenRoomTeams');
                let hiddenCount = 0;
                try {
                    if (hiddenTeams) {
                        hiddenCount = JSON.parse(hiddenTeams).length;
                    }
                } catch (error) {
                    console.error('Error parsing hidden teams:', error);
                }
                
                if (hiddenCount > 0) {
                    toast.success(`Share URL copied! Includes ${hiddenCount} hidden team(s).`);
                } else {
                    toast.success('Room assignments URL copied to clipboard!');
                }
                setShowShareUrl(true);
                // Hide URL after 10 seconds
                setTimeout(() => setShowShareUrl(false), 10000);
            }).catch(err => {
                console.error('Failed to copy URL:', err);
                toast.error('Failed to copy URL');
            });
        } else {
            toast.error('Clipboard not available');
        }
    };

    return (
        <Container fluid className="py-2 py-md-3 px-2 px-md-3">
            {/* Header */}
            <Row className="mb-4">
                <Col xs={12}>
                    <div className="d-flex flex-column gap-3">
                        <div className="text-center text-md-start">
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
                                className="projector-button d-flex align-items-center justify-content-center"
                                style={{minHeight: '44px'}}
                            >
                                🏠 Main Menu
                            </Button>
                            <Button 
                                variant="outline-info"
                                onClick={handleCopyShareUrl}
                                className="projector-button d-flex align-items-center justify-content-center"
                                title="Copy shareable URL for room assignments"
                                style={{minHeight: '44px'}}
                            >
                                🔗 Share View
                            </Button>
                            <Button 
                                variant="primary"
                                onClick={handleRefresh}
                                disabled={loading}
                                className="projector-button d-flex align-items-center justify-content-center"
                                style={{minHeight: '44px'}}
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

            {/* Share URL Display */}
            {showShareUrl && (
                <Row className="mb-4">
                    <Col xs={12}>
                        <Alert variant="info" dismissible onClose={() => setShowShareUrl(false)}>
                            <Alert.Heading className="h6 mb-2 text-center text-sm-start">📋 Shareable URL (copied to clipboard)</Alert.Heading>
                            <div className="small text-break mb-2" style={{
                                fontFamily: 'monospace', 
                                backgroundColor: '#f8f9fa', 
                                padding: '12px', 
                                borderRadius: '8px',
                                wordBreak: 'break-all',
                                fontSize: '0.8rem',
                                lineHeight: '1.4'
                            }}>
                                {generateShareUrl()}
                            </div>
                            <hr className="my-2" />
                            <small className="text-muted" style={{lineHeight: '1.4'}}>
                                {generateShareUrl()?.includes('hide=') ? (
                                    <>Share this URL to show the room assignments with your current hidden teams. 
                                    The URL will automatically hide the same teams for anyone who visits it.</>
                                ) : (
                                    <>Share this URL to give anyone access to the room assignments page. 
                                    Hide some teams first to create a customized view.</>
                                )}
                            </small>
                        </Alert>
                    </Col>
                </Row>
            )}

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
                        <div className="text-center p-3 bg-light rounded">
                            <small className="text-muted" style={{lineHeight: '1.5'}}>
                                💡 <strong>Tips:</strong> Use the "Hide" button to hide teams you don't want to see. 
                                Switch between Room View and Judge View using the toggle button. 
                                In Judge View, filter by specific judge groups to focus on your assignments.
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