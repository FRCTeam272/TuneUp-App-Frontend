import React, { useState, useEffect } from 'react';
import { navigate, type HeadFC } from 'gatsby';
import { Button, Container, Row, Col, Alert, Form, Badge, Card, Table, Spinner } from 'react-bootstrap';
import { defaultSettings, settingsContext, type Settings } from '../contexts/settingsContext';
import { displayApi, errorMessage, teamApi, type DisplayTeamScoresResponse, type EventBase } from '../api';
import MultiTeamComparison from '../components/MultiTeamComparison';
import '../App.css';

const MultiTeamPage = () => {
    const [settings, setSettings] = useState<Settings>(defaultSettings);

    useEffect(() => {
        setSettings(prevSettings => ({
            ...prevSettings,
            password: localStorage.getItem("password") || "",
        }));
    }, []);

    const [selectedTeams, setSelectedTeams] = useState<number[]>([]);
    const [allTeams, setAllTeams] = useState<DisplayTeamScoresResponse[]>([]);
    const [teamData, setTeamData] = useState<Record<number, DisplayTeamScoresResponse>>({});
    const [scheduleData, setScheduleData] = useState<Record<number, EventBase[]>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [teamInputValue, setTeamInputValue] = useState('');

    // Load all teams data
    useEffect(() => {
        const fetchAllTeams = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Get all teams from display API
                const displayData = await displayApi.getDisplay();
                console.log('All teams data:', displayData);
                
                if (displayData && Array.isArray(displayData)) {
                    setAllTeams(displayData);
                } else {
                    setError('Failed to load teams data');
                }
            } catch (err) {
                console.error('Error fetching teams:', err);
                setError('Failed to load teams. Please check your connection and try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchAllTeams();
    }, []);

    // Load data for selected teams
    useEffect(() => {
        const fetchSelectedTeamsData = async () => {
            if (selectedTeams.length === 0) {
                setTeamData({});
                return;
            }

            try {
                const promises = selectedTeams.map(async (teamId) => {
                    try {
                        const data = await displayApi.getTeamScores(teamId);
                        return { teamId, data, error: undefined };
                    } catch (err) {
                        console.error(`Error fetching data for team ${teamId}:`, err);
                        return { teamId, data: null, error: errorMessage(err) };
                    }
                });

                const results = await Promise.all(promises);
                const newTeamData: Record<number, DisplayTeamScoresResponse> = {};
                
                results.forEach(({ teamId, data, error }) => {
                    if (data && !error) {
                        newTeamData[teamId] = data;
                    } else {
                        console.error(`Failed to load team ${teamId}:`, error);
                    }
                });

                setTeamData(newTeamData);
            } catch (err) {
                console.error('Error fetching selected teams data:', err);
            }
        };

        fetchSelectedTeamsData();
    }, [selectedTeams]);

    const handleAddTeam = (teamId: string | number) => {
        const id = parseInt(String(teamId));
        if (!isNaN(id) && !selectedTeams.includes(id)) {
            const newTeams = [...selectedTeams, id];
            setSelectedTeams(newTeams);
            localStorage.setItem('multiTeamSelections', JSON.stringify(newTeams));
            setTeamInputValue('');
        }
    };

    const handleRemoveTeam = (teamId: number) => {
        const newTeams = selectedTeams.filter(id => id !== teamId);
        setSelectedTeams(newTeams);
        localStorage.setItem('multiTeamSelections', JSON.stringify(newTeams));
        setTeamData(prev => {
            const newData = { ...prev };
            delete newData[teamId];
            return newData;
        });
        setScheduleData(prev => {
            const newData = { ...prev };
            delete newData[teamId];
            return newData;
        });
    };

    const handleAddTeamFromInput = () => {
        if (teamInputValue.trim()) {
            handleAddTeam(teamInputValue.trim());
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAddTeamFromInput();
        }
    };

    const filteredTeams = allTeams.filter(team => {
        const searchLower = searchTerm.toLowerCase();
        const teamName = (team.team_name || '').toLowerCase();
        const teamId = team.team_id?.toString() || '';
        
        return teamName.includes(searchLower) || teamId.includes(searchLower);
    });

    const handleClearAll = () => {
        setSelectedTeams([]);
        setTeamData({});
        setScheduleData({});
        localStorage.removeItem('multiTeamSelections');
    };

    const handleLoadFromUrl = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const teamsParam = urlParams.get('teams');
        
        if (teamsParam) {
            try {
                const teamIds = teamsParam.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
                setSelectedTeams(teamIds);
            } catch (err) {
                console.error('Error parsing teams from URL:', err);
            }
        }
    };

    const handleGenerateShareUrl = () => {
        if (selectedTeams.length === 0) return;
        
        const baseUrl = window.location.origin + window.location.pathname;
        const teamsParam = selectedTeams.join(',');
        const shareUrl = `${baseUrl}?teams=${teamsParam}`;
        
        navigator.clipboard.writeText(shareUrl).then(() => {
            alert('Share URL copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy URL:', err);
            alert('Failed to copy URL to clipboard');
        });
    };

    // Load teams from localStorage and URL on component mount
    useEffect(() => {
        // First try to load from localStorage
        const savedSelections = localStorage.getItem('multiTeamSelections');
        if (savedSelections) {
            try {
                const teams = JSON.parse(savedSelections);
                if (Array.isArray(teams) && teams.length > 0) {
                    setSelectedTeams(teams);
                }
            } catch (err) {
                console.error('Error loading saved selections:', err);
            }
        }
        
        // Then check URL (URL takes precedence)
        handleLoadFromUrl();
    }, []);

    // Load schedule data for selected teams
    useEffect(() => {
        const fetchScheduleData = async () => {
            if (selectedTeams.length === 0) {
                setScheduleData({});
                return;
            }

            try {
                const promises = selectedTeams.map(async (teamId) => {
                    try {
                        const data = await teamApi.getEvents(teamId);
                        return { teamId, data, error: undefined };
                    } catch (err) {
                        console.error(`Error fetching schedule for team ${teamId}:`, err);
                        return { teamId, data: null, error: errorMessage(err) };
                    }
                });

                const results = await Promise.all(promises);
                const newScheduleData: Record<number, EventBase[]> = {};
                
                results.forEach(({ teamId, data, error }) => {
                    if (data && !error) {
                        newScheduleData[teamId] = data;
                    }
                });

                setScheduleData(newScheduleData);
            } catch (err) {
                console.error('Error fetching schedule data:', err);
            }
        };

        fetchScheduleData();
    }, [selectedTeams]);

    if (loading) {
        return (
            <Container className="mt-4">
                <div className="text-center">
                    <Spinner animation="border" className="me-3" />
                    <h2>Loading Teams...</h2>
                </div>
            </Container>
        );
    }

    return (
        <settingsContext.Provider value={[settings, setSettings]}>
            <title>Multi-Team Comparison - FLL Scoreboard</title>
            <Container fluid className="mt-3">
                <Row>
                    <Col>
                        {/* Navigation */}
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
                                variant="outline-primary"
                                onClick={() => navigate('/scoreboard')}
                            >
                                📊 Scoreboard
                            </Button>
                        </div>

                        {/* Error Display */}
                        {error && (
                            <Alert variant="danger" className="mb-4">
                                <h4>⚠️ Error</h4>
                                <p>{error}</p>
                                <Button 
                                    variant="outline-primary" 
                                    onClick={() => window.location.reload()}
                                >
                                    🔄 Retry
                                </Button>
                            </Alert>
                        )}

                        {/* Team Selection Section */}
                        <Card className="mb-4 projector-card">
                            <Card.Header className="projector-card-header">
                                <h2 className="mb-0">🔍 Select Teams to Compare</h2>
                            </Card.Header>
                            <Card.Body className="projector-card-body">
                                {/* Manual Team Input */}
                                <Row className="mb-3">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>Add Team by Number:</Form.Label>
                                            <div className="d-flex gap-2">
                                                <Form.Control
                                                    type="number"
                                                    placeholder="Enter team number..."
                                                    value={teamInputValue}
                                                    onChange={(e) => setTeamInputValue(e.target.value)}
                                                    onKeyPress={handleKeyPress}
                                                />
                                                <Button 
                                                    onClick={handleAddTeamFromInput}
                                                    className="projector-button"
                                                    disabled={!teamInputValue.trim()}
                                                >
                                                    Add
                                                </Button>
                                            </div>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>Search Teams:</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Search by team name or number..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                {/* Selected Teams Display */}
                                <div className="mb-3">
                                    <h5>Selected Teams ({selectedTeams.length}):</h5>
                                    {selectedTeams.length === 0 ? (
                                        <p className="text-muted">No teams selected yet. Add teams using the input above or click on teams from the list below.</p>
                                    ) : (
                                        <div className="d-flex flex-wrap gap-2 mb-3">
                                            {selectedTeams.map(teamId => {
                                                const team = allTeams.find(t => t.team_id === teamId);
                                                return (
                                                    <Badge 
                                                        key={teamId} 
                                                        bg="primary" 
                                                        className="d-flex align-items-center gap-2 p-2"
                                                        style={{ fontSize: '14px' }}
                                                    >
                                                        <span>
                                                            #{teamId} {team?.team_name ? `- ${team.team_name}` : ''}
                                                        </span>
                                                        <Button
                                                            variant="link"
                                                            size="sm"
                                                            className="p-0 text-white"
                                                            onClick={() => handleRemoveTeam(teamId)}
                                                            style={{ fontSize: '12px', textDecoration: 'none' }}
                                                        >
                                                            ✕
                                                        </Button>
                                                    </Badge>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="d-flex gap-2">
                                        <Button 
                                            variant="outline-danger" 
                                            size="sm" 
                                            onClick={handleClearAll}
                                            disabled={selectedTeams.length === 0}
                                        >
                                            Clear All
                                        </Button>
                                        <Button 
                                            variant="outline-info" 
                                            size="sm" 
                                            onClick={handleGenerateShareUrl}
                                            disabled={selectedTeams.length === 0}
                                        >
                                            🔗 Share URL
                                        </Button>
                                    </div>
                                </div>

                                {/* Available Teams List */}
                                {filteredTeams.length > 0 && (
                                    <div>
                                        <h5>Available Teams ({filteredTeams.length}):</h5>
                                        <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                            <Table size="sm" className="projector-table">
                                                <thead style={{ position: 'sticky', top: 0, backgroundColor: 'var(--bs-body-bg)', zIndex: 1 }}>
                                                    <tr>
                                                        <th>Team #</th>
                                                        <th>Team Name</th>
                                                        <th>Average</th>
                                                        <th>Scores</th>
                                                        <th>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredTeams.map(team => (
                                                        <tr key={team.team_id}>
                                                            <td><strong>#{team.team_id}</strong></td>
                                                            <td>{team.team_name || 'N/A'}</td>
                                                            <td>{(team.average_top_three || 0).toFixed(1)}</td>
                                                            <td>{team.scores ? team.scores.length : 0}</td>
                                                            <td>
                                                                {selectedTeams.includes(team.team_id) ? (
                                                                    <Badge bg="success">Selected</Badge>
                                                                ) : (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline-primary"
                                                                        onClick={() => handleAddTeam(team.team_id)}
                                                                    >
                                                                        Add
                                                                    </Button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </div>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>

                        {/* Multi-Team Comparison Component */}
                        {selectedTeams.length > 0 && Object.keys(teamData).length > 0 && (
                            <MultiTeamComparison 
                                selectedTeams={selectedTeams}
                                teamData={teamData}
                                scheduleData={scheduleData}
                                allTeams={allTeams}
                                divisor={settings.divisor}
                            />
                        )}

                        {/* Empty State */}
                        {selectedTeams.length === 0 && (
                            <Card className="projector-card text-center">
                                <Card.Body className="projector-card-body">
                                    <h3>No Teams Selected</h3>
                                    <p>Add teams using the selection tools above to start comparing their performance.</p>
                                </Card.Body>
                            </Card>
                        )}
                    </Col>
                </Row>
            </Container>
        </settingsContext.Provider>
    );
};

export default MultiTeamPage;

export const Head: HeadFC = () => <title>Multi-Team Comparison - FLL Scoreboard</title>