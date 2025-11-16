import React, { useState, useEffect } from 'react';
import { navigate } from 'gatsby';
import { Button, Container, Row, Col, Alert } from 'react-bootstrap';
import { settingsContext } from '../../contexts/settingsContext';
import { Display_API_Client, Team_API_Client, Score_API_Client} from '../../api';
import TeamDetail from '../../components/TeamDetail';
import TeamEditControls from '../../components/TeamEditControls';
import Schedule from '../../components/Schedule';
import '../../App.css';

const TeamPage = ({ teamId, location, ...props }) => {
    const [settings, setSettings] = useState({
        backendUrl: process.env.GATSBY_BACKEND_URL || "http://127.0.0.1:5000",
        // password: localStorage.getItem("password") || "",
        divisor: parseInt(process.env.GATSBY_DIVISOR) || 3,
    });

    useEffect(() => {
        setSettings(prevSettings => ({
            ...prevSettings,
            password: localStorage.getItem("password") || "",
        }));
    }, [])
    
    const [teamData, setTeamData] = useState(null);
    const [rankingData, setRankingData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isPasswordValid, setIsPasswordValid] = useState(false);
    const [passwordChecked, setPasswordChecked] = useState(false);
    const [scheduleData, setScheduleData] = useState(null);
    
    const displayApiClient = new Display_API_Client();
    const team_client = new Team_API_Client();
    const score_client = new Score_API_Client();
    // Extract team ID from router props or location
    const currentTeamId = teamId || (location && location.pathname ? location.pathname.split('/').pop() : null);
    
    // Debug logging
    console.log('TeamPage - teamId prop:', teamId);
    console.log('TeamPage - location:', location);
    console.log('TeamPage - pathname:', location?.pathname);
    console.log('TeamPage - all props:', props);
    console.log('TeamPage - extracted currentTeamId:', currentTeamId);

    useEffect(() => {
        const checkPassword = async () => {
            if (settings.password) {
                try {
                    console.log('Checking password validity...');
                    const result = await displayApiClient.checkDisplayPassword(settings.password);
                    console.log('Password check result:', result);
                    setIsPasswordValid(result.status ||result.success || result.valid || false);
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
    }, [settings.password]);

    useEffect(() => {
        const fetchScheduleData = async () => {
            if (!currentTeamId) return;
            
            try {
                console.log('Fetching schedule data...');
                const data = await team_client.getSchedule(currentTeamId);
                console.log('Schedule data:', data);
                setScheduleData(data);
            } catch (err) {
                console.error('Error fetching schedule data:', err);
            }
        };

        fetchScheduleData();
    }, [currentTeamId]);

    // Function to refresh all team data (like scoreboard does)
    function refreshAllData() {
        console.log('=== REFRESHING ALL TEAM DATA ===');
        displayApiClient.getDisplay().then((data) => {
            console.log('All teams data received:', data);
            setRankingData(data);
            
            // Find the specific team in the data
            if (currentTeamId && data && Array.isArray(data)) {
                const teamIdNumber = parseInt(currentTeamId);
                const foundTeam = data.find(team => team.team_id === teamIdNumber);
                console.log('Looking for team ID:', teamIdNumber);
                console.log('Found team:', foundTeam);
                
                if (foundTeam) {
                    setTeamData(foundTeam);
                    setError(null);
                } else {
                    setError(`Team #${currentTeamId} not found in the data.`);
                }
            } else {
                console.log('No valid team ID or data');
                setError('Invalid team data received');
            }
            setLoading(false);
        }).catch((err) => {
            console.error('Error fetching team data:', err);
            setError(`Failed to load team data: ${err.message}`);
            setLoading(false);
        });
    }

    useEffect(() => {
        if (!currentTeamId) {
            console.log('No currentTeamId provided:', currentTeamId);
            setError('No team ID provided');
            setLoading(false);
            return;
        }

        // Validate team ID format
        if (isNaN(currentTeamId)) {
            console.log('Invalid team ID format:', currentTeamId);
            setError(`Invalid team ID: "${currentTeamId}". Team ID must be a number.`);
            setLoading(false);
            return;
        }

        console.log('Starting team data fetch for:', currentTeamId);
        setLoading(true);
        setError(null);
        refreshAllData();
    }, [currentTeamId]);

    const handleBackToScoreboard = () => {
        navigate('/scoreboard');
    };

    const handleRetry = () => {
        console.log('Retrying data fetch...');
        setError(null);
        setLoading(true);
        refreshAllData();
    };

    const handleEditTeamName = async (newName) => {
        try {
            console.log('Editing team name to:', newName);
            const result = await team_client.editTeam(currentTeamId, newName, settings.password);
            console.log('Edit team result:', result);
            result.success = result.detail; 
            if (result.success || result.message === 'Team name updated successfully') {
                // Update the teamData with the new name
                setTeamData(prev => ({
                    ...prev,
                    team_name: newName
                }));
                return { success: true };
            } else {
                throw new Error(result.message || 'Failed to update team name');
            }
        } catch (err) {
            console.error('Error editing team name:', err);
            return { success: false, error: err.message };
        }
    };

    const handleAddScore = async (score) => {
        try {
            console.log('Adding score:', score);
            const result = await score_client.addScore(currentTeamId, parseInt(score), settings.password);
            result.success = result.team_id === teamData.team_id && result.score === score;
            console.log('Add score result:', result);
            
            if (result.success || result.message === 'Score added successfully') {
                // Refresh team data to get updated scores
                refreshAllData();
                return { success: true };
            } else {
                throw new Error(result.message || 'Failed to add score');
            }
        } catch (err) {
            console.error('Error adding score:', err);
            return { success: false, error: err.message };
        }
    };

    const handleRemoveScore = async (score) => {
        try {
            console.log('Removing score:', score);
            const result = await score_client.removeScore(currentTeamId, parseInt(score), settings.password);
            console.log('Remove score result:', result);
            result.success = result.detail;
            if (result.success || result.message === 'Score removed successfully') {
                // Refresh team data to get updated scores
                refreshAllData();
                return { success: true };
            } else {
                throw new Error(result.message || 'Failed to remove score');
            }
        } catch (err) {
            console.error('Error removing score:', err);
            return { success: false, error: err.message };
        }
    };

    if (loading) {
        return (
            <Container className="mt-4">
                <div className="text-center">
                    <h2>Loading Team #{currentTeamId}...</h2>
                </div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-4">
                <Alert variant="danger">
                    <h4>⚠️ Error</h4>
                    <p>{error}</p>
                    <div className="d-flex gap-2">
                        <Button 
                            className="projector-button" 
                            variant="outline-primary"
                            onClick={() => navigate('/')}
                        >
                            🏠 Main Menu
                        </Button>
                        <Button className="projector-button" onClick={handleBackToScoreboard}>
                            ← Back to Scoreboard
                        </Button>
                        <Button className="projector-button" variant="outline-primary" onClick={handleRetry}>
                            🔄 Retry
                        </Button>
                    </div>
                </Alert>
            </Container>
        );
    }

    const debuger = () => {
        return (<Alert variant="info" className="mb-3">
                            <h6>Debug Information:</h6>
                            <p><strong>Team ID:</strong> {currentTeamId}</p>
                            <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
                            <p><strong>Error:</strong> {error || 'None'}</p>
                            <p><strong>Team Data:</strong> {teamData ? 'Loaded' : 'Not loaded'}</p>
                            <p><strong>Backend URL:</strong> {process.env.GATSBY_BACKEND_URL}</p>
                            <div className="d-flex gap-2">
                                <Button 
                                    size="sm" 
                                    onClick={() => {
                                        console.log('=== MANUAL DEBUG INFO ===');
                                        console.log('currentTeamId:', currentTeamId);
                                        console.log('loading:', loading);
                                        console.log('error:', error);
                                        console.log('teamData:', teamData);
                                        console.log('settings:', settings);
                                    }}
                                >
                                    Log Debug Info to Console
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant="outline-primary"
                                    onClick={async () => {
                                        console.log('=== MANUAL API TEST ===');
                                        try {
                                            const testUrl = `${process.env.GATSBY_BACKEND_URL}/display`;
                                            console.log('Testing URL:', testUrl);
                                            const response = await fetch(testUrl);
                                            console.log('Response status:', response.status);
                                            console.log('Response ok:', response.ok);
                                            const data = await response.json();
                                            console.log('All teams data:', data);
                                            if (data && Array.isArray(data)) {
                                                const teamIdNumber = parseInt(currentTeamId);
                                                const foundTeam = data.find(team => team.team_id === teamIdNumber);
                                                console.log('Found team in data:', foundTeam);
                                            }
                                        } catch (err) {
                                            console.error('Manual API test failed:', err);
                                        }
                                    }}
                                >
                                    Test API Manually
                                </Button>
                            </div>
                        </Alert>);
    }


    return (
        <settingsContext.Provider value={[settings, setSettings]}>
            <Container fluid className="mt-3">
                <Row>
                    <Col>
                        <div className="d-flex gap-2 mb-3">
                            <Button 
                                className="projector-button" 
                                variant="outline-primary"
                                onClick={() => navigate('/')}
                            >
                                🏠 Main Menu
                            </Button>
                            <Button 
                                className="projector-button" 
                                onClick={handleBackToScoreboard}
                            >
                                ← Back to Scoreboard
                            </Button>
                        </div>
                        
                        
                        {passwordChecked && teamData && (
                            <TeamEditControls
                                teamData={teamData}
                                onEditTeamName={handleEditTeamName}
                                onAddScore={handleAddScore}
                                onRemoveScore={handleRemoveScore}
                                isPasswordValid={isPasswordValid}
                            />
                        )}
                        
                        {scheduleData && teamData && (
                            <Schedule 
                                scheduleData={scheduleData} 
                                teamName={teamData.team_name || `Team #${currentTeamId}`}
                                roomNumber={teamData.room || 'TBD'}
                            />
                        )}
                        
                        {console.log('About to render TeamDetail with teamData:', teamData)}
                        {teamData && (
                            <TeamDetail 
                                teamData={teamData} 
                                divisor={settings.divisor}
                                rankingData={rankingData}
                            />
                        )}
                        {!teamData && !loading && !error && (
                            <div className="text-center">
                                <h3>No team data available</h3>
                                <p>TeamData state: {JSON.stringify(teamData)}</p>
                                <p>Check the browser console for detailed logs</p>
                            </div>
                        )}
                    </Col>
                </Row>
                {/* Debug Information Panel */}
                { (window.location.hostname === "localhost" || isPasswordValid) && debuger()}

            </Container>
        </settingsContext.Provider>
    );
};

// Component to handle team list or redirect
const TeamIndexPage = () => {
    return (
        <Container className="mt-4">
            <Alert variant="info">
                <h4>Team Page</h4>
                <p>Please specify a team ID in the URL (e.g., /team?id=4403)</p>
                <Button 
                    className="projector-button" 
                    onClick={() => navigate('/home')}
                >
                    ← Back to Home
                </Button>
            </Alert>
        </Container>
    );
};

// Create the main component with query string routing
const TeamIndex = ({ location }) => {
    // Debug logging
    console.log('=== TEAMINDEX COMPONENT RENDER ===');
    console.log('TeamIndex - location:', location);
    console.log('TeamIndex - pathname:', location?.pathname);
    console.log('TeamIndex - search:', location?.search);
    console.log('TeamIndex - hash:', location?.hash);
    
    // Extract team ID from query string
    const urlParams = new URLSearchParams(location?.search || '');
    const teamIdFromQuery = urlParams.get('id');
    
    console.log('TeamIndex - search params:', location?.search);
    console.log('TeamIndex - teamIdFromQuery:', teamIdFromQuery);
    console.log('TeamIndex - typeof teamIdFromQuery:', typeof teamIdFromQuery);
    
    // Add more debugging - check if we're in browser environment
    if (typeof window !== 'undefined') {
        console.log('TeamIndex - window.location.search:', window.location.search);
        console.log('TeamIndex - window.location.href:', window.location.href);
    } else {
        console.log('TeamIndex - not in browser environment (SSR)');
    }
    
    // If we have a team ID, render the team page
    if (teamIdFromQuery && teamIdFromQuery !== '') {
        console.log('TeamIndex - rendering TeamPage with teamId:', teamIdFromQuery);
        return <TeamPage teamId={teamIdFromQuery} location={location} />;
    } else {
        console.log('TeamIndex - rendering TeamIndexPage (no valid team ID)');
        // Otherwise show the team index
        return <TeamIndexPage />;
    }
};

// Add proper head export for Gatsby
export const Head = ({ location }) => {
    const urlParams = new URLSearchParams(location?.search || '');
    const teamId = urlParams.get('id') || 'Unknown';
    const title = teamId && teamId !== '' && teamId !== 'Unknown' ? `Team #${teamId} - FLL Scoreboard` : 'Team Page - FLL Scoreboard';
    
    return (
        <>
            <title>{title}</title>
            <meta name="description" content={`Team details for Team #${teamId}`} />
        </>
    );
};

export default TeamIndex;