import React, { useState, useEffect, useContext } from 'react';
import { navigate } from 'gatsby';
import { Button, Container, Row, Col, Alert } from 'react-bootstrap';
import { settingsContext } from '../../contexts/settingsContext';
import { Display_API_Client, Team_API_Client, Score_API_Client} from '../../api';
import TeamDetail from '../../components/TeamDetail';
import TeamEditControls from '../../components/TeamEditControls';
import Schedule from '../../components/Schedule';
import '../../App.css';

const TeamPage = ({ params }) => {
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
    const teamId = params.teamId;

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
            try {
                console.log('Fetching schedule data...');
                const data = await team_client.getSchedule(teamId);
                console.log('Schedule data:', data);
                setScheduleData(data);
            } catch (err) {
                console.error('Error fetching schedule data:', err);
            }
        };

        fetchScheduleData();
    }, [teamId]);

    useEffect(() => {
        const fetchTeamData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                console.log('Fetching team data for teamId:', teamId); // Debug log
                
                // Validate team ID format
                if (!teamId || isNaN(teamId)) {
                    setError(`Invalid team ID: "${teamId}". Team ID must be a number.`);
                    setLoading(false);
                    return;
                }
                
                // Get the team data using the display API
                const data = await displayApiClient.getDisplayById(teamId);
                const master_display = await displayApiClient.getDisplay();
                console.log('API Response:', data); // Debug log
                console.log('Data type:', typeof data); // Debug log
                console.log('Data length:', Array.isArray(data) ? data.length : 'Not an array'); // Debug log
                
                if (data && Array.isArray(data) && data.length > 0) {
                    console.log('Setting team data:', data[0]); // Debug log
                    setTeamData(data[0]); // API returns an array, get first item
                } else if (data && !Array.isArray(data)) {
                    console.log('Data is not an array, setting directly:', data); // Debug log
                    setTeamData(data); // In case API returns single object
                } else {
                    console.log('No data found for team:', teamId); // Debug log
                    setError(`Team #${teamId} not found. This team may not exist or may not have any scores yet.`);
                }

                setRankingData(master_display);
            } catch (err) {
                console.error('Error fetching team data:', err);
                let errorMessage = `Failed to load team data`;
                
                if (err.name === 'TypeError' && err.message.includes('fetch')) {
                    errorMessage = `Cannot connect to the server. Please check your internet connection and try again.`;
                } else if (err.message) {
                    errorMessage = `${errorMessage}: ${err.message}`;
                }
                
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        if (teamId) {
            fetchTeamData();
        } else {
            setError('No team ID provided');
            setLoading(false);
        }
    }, [teamId]);

    const handleBackToScoreboard = () => {
        navigate('/scoreboard');
    };

    const handleRetry = () => {
        setError(null);
        setLoading(true);
        // Trigger useEffect by updating a dependency
        const fetchTeamData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                console.log('Retry: Fetching team data for teamId:', teamId); // Debug log
                
                // Validate team ID format
                if (!teamId || isNaN(teamId)) {
                    setError(`Invalid team ID: "${teamId}". Team ID must be a number.`);
                    setLoading(false);
                    return;
                }
                
                // Get the team data using the display API
                const data = await displayApiClient.getDisplayById(teamId);
                console.log('Retry: API Response:', data); // Debug log
                console.log('Retry: Data type:', typeof data); // Debug log
                console.log('Retry: Data length:', Array.isArray(data) ? data.length : 'Not an array'); // Debug log
                
                if (data && Array.isArray(data) && data.length > 0) {
                    console.log('Retry: Setting team data:', data[0]); // Debug log
                    setTeamData(data[0]); // API returns an array, get first item
                } else if (data && !Array.isArray(data)) {
                    console.log('Retry: Data is not an array, setting directly:', data); // Debug log
                    setTeamData(data); // In case API returns single object
                } else {
                    console.log('Retry: No data found for team:', teamId); // Debug log
                    setError(`Team #${teamId} not found. This team may not exist or may not have any scores yet.`);
                }
            } catch (err) {
                console.error('Retry: Error fetching team data:', err);
                let errorMessage = `Failed to load team data`;
                
                if (err.name === 'TypeError' && err.message.includes('fetch')) {
                    errorMessage = `Cannot connect to the server. Please check your internet connection and try again.`;
                } else if (err.message) {
                    errorMessage = `${errorMessage}: ${err.message}`;
                }
                
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };
        
        fetchTeamData();
    };

    const handleEditTeamName = async (newName) => {
        try {
            console.log('Editing team name to:', newName);
            const result = await team_client.editTeam(teamId, newName, settings.password);
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
            const result = await score_client.addScore(teamId, parseInt(score), settings.password);
            result.success = result.team_id === teamData.team_id && result.score === score;
            console.log('Add score result:', result);
            
            if (result.success || result.message === 'Score added successfully') {
                // Refresh team data to get updated scores
                const data = await displayApiClient.getDisplayById(teamId);
                if (data && Array.isArray(data) && data.length > 0) {
                    setTeamData(data[0]);
                } else if (data && !Array.isArray(data)) {
                    setTeamData(data);
                }
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
            const result = await score_client.removeScore(teamId, parseInt(score), settings.password);
            console.log('Remove score result:', result);
            result.success = result.detail;
            if (result.success || result.message === 'Score removed successfully') {
                // Refresh team data to get updated scores
                const data = await displayApiClient.getDisplayById(teamId);
                if (data && Array.isArray(data) && data.length > 0) {
                    setTeamData(data[0]);
                } else if (data && !Array.isArray(data)) {
                    setTeamData(data);
                }
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
                    <h2>Loading Team #{teamId}...</h2>
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

    return (
        <settingsContext.Provider value={[settings, setSettings]}>
            <title>
                {!teamData ? `Team #${params.teamId} - FLL Scoreboard` : `${teamData.team_name} - FLL Scoreboard`}
            </title>
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
                                teamName={teamData.team_name || `Team #${teamId}`}
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
                            </div>
                        )}
                    </Col>
                </Row>
            </Container>
        </settingsContext.Provider>
    );
};

export default TeamPage;