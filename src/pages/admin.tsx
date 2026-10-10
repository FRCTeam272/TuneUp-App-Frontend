import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Form, Modal, Alert, Row, Col, InputGroup } from 'react-bootstrap';
import { navigate, type GetServerDataReturn, type HeadFC } from 'gatsby';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmarkCircle, faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import { defaultSettings, settingsContext, storedPassword, type Settings } from '../contexts/settingsContext';
import { displayApi, errorMessage, scoreApi, type DisplayTeamScoresResponse } from '../api';
import usePasswordCheck from '../hooks/usePasswordCheck';
import toast, { Toaster } from 'react-hot-toast';
import '../App.css';
import '../mobile.css';

const AdminPage = () => {
    const [settings, setSettings] = useState<Settings>(() => ({ ...defaultSettings(), password: storedPassword() }));

    const [teamData, setTeamData] = useState<DisplayTeamScoresResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { isPasswordValid, passwordChecked } = usePasswordCheck(settings.password);
    
    // Modal state
    const [showAddScoreModal, setShowAddScoreModal] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<DisplayTeamScoresResponse | null>(null);
    const [newScore, setNewScore] = useState('');

    // Fetch all team data
    const fetchTeamData = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await displayApi.getDisplay();
            setTeamData(data || []);
        } catch (err) {
            console.error('Error fetching team data:', err);
            setError('Failed to load team data. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeamData();
    }, []);

    const handleBackToScoreboard = () => {
        navigate('/scoreboard');
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPassword = e.target.value;
        setSettings(prev => ({ ...prev, password: newPassword }));
        localStorage.setItem("password", newPassword);
    };

    const openAddScoreModal = (team: DisplayTeamScoresResponse) => {
        setSelectedTeam(team);
        setNewScore('');
        setShowAddScoreModal(true);
    };

    const closeAddScoreModal = () => {
        setShowAddScoreModal(false);
        setSelectedTeam(null);
        setNewScore('');
    };

    const handleAddScore = async () => {
        if (!selectedTeam || !newScore || isNaN(Number(newScore))) {
            toast.error('Please enter a valid score');
            return;
        }

        if (!isPasswordValid) {
            toast.error('Please enter a valid password');
            return;
        }

        try {
            const score = parseInt(newScore);
            const result = await scoreApi.addScore(selectedTeam.team_id, score, settings.password);
            
            if (result.team_id === selectedTeam.team_id && result.score === score) {
                toast.success(`Added score ${score} to Team #${selectedTeam.team_id} (${selectedTeam.team_name})`);
                await fetchTeamData(); // Refresh data
                closeAddScoreModal();
            } else {
                throw new Error('Failed to add score');
            }
        } catch (err) {
            console.error('Error adding score:', err);
            toast.error(errorMessage(err) || 'Failed to add score');
        }
    };

    const handleRemoveScore = async (team: DisplayTeamScoresResponse, scoreToRemove: number) => {
        if (!isPasswordValid) {
            toast.error('Please enter a valid password');
            return;
        }

        if (window.confirm(`Remove score ${scoreToRemove} from Team #${team.team_id} (${team.team_name})?`)) {
            try {
                const result = await scoreApi.removeScore(team.team_id, scoreToRemove, settings.password);
                
                if (result.detail) {
                    toast.success(`Removed score ${scoreToRemove} from Team #${team.team_id}`);
                    await fetchTeamData(); // Refresh data
                } else {
                    throw new Error('Failed to remove score');
                }
            } catch (err) {
                console.error('Error removing score:', err);
                toast.error(errorMessage(err) || 'Failed to remove score');
            }
        }
    };

    const calculateTeamAverage = (scores: number[]) => {
        if (!scores || scores.length === 0) return 0;
        const sortedScores = [...scores].sort((a, b) => b - a).slice(0, settings.divisor);
        return (sortedScores.reduce((a, b) => a + b, 0) / sortedScores.length).toFixed(3);
    };

    if (loading) {
        return (
            <Container className="mt-4">
                <div className="text-center">
                    <h2>Loading Admin Panel...</h2>
                </div>
            </Container>
        );
    }

    return (
        <settingsContext.Provider value={[settings, setSettings]}>
            <Container fluid className="mt-2 mt-md-3">
                <Row className="mb-3 mb-md-4">
                    <Col xs={12}>
                        <div className="d-flex justify-content-between align-items-start flex-column flex-md-row">
                            <h1 className="h3 h-md-1 mb-3 mb-md-0">🏆 FLL Admin Panel</h1>
                            <div className="d-flex gap-2 flex-column flex-md-row w-100 w-md-auto">
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
                                <Button 
                                    className="projector-button" 
                                    onClick={handleBackToScoreboard}
                                >
                                    ← Back to Scoreboard
                                </Button>
                            </div>
                        </div>
                    </Col>
                </Row>

                {/* Password Section */}
                <Row className="mb-4">
                    <Col md={6}>
                        {isPasswordValid && passwordChecked ? (
                            <Alert variant="success">
                                <FontAwesomeIcon icon={faCheckCircle} /> Password is valid. You are in Admin Mode.
                            </Alert>
                        ) : (
                            settings.password && <Alert variant="danger">
                                <FontAwesomeIcon icon={faXmarkCircle} /> Invalid password. Admin functions are disabled.
                            </Alert>
                        )}
                    </Col>
                </Row>

                {error && (
                    <Alert variant="danger" className="mb-4">
                        <h4>⚠️ Error</h4>
                        <p>{error}</p>
                        <Button variant="outline-danger" onClick={fetchTeamData}>
                            Retry
                        </Button>
                    </Alert>
                )}

                {/* Teams Table */}
                <Row>
                    <Col>
                        <h3>All Teams ({teamData.length})</h3>
                        <Table striped bordered hover className="projector-table">
                            <thead>
                                <tr>
                                    <th>Team #</th>
                                    <th>Team Name</th>
                                    <th>Scores</th>
                                    <th>Average</th>
                                    <th>Total Scores</th>
                                    {isPasswordValid && <th>Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {teamData.map((team) => (
                                    <tr key={team.team_id}>
                                        <td>
                                            <Button 
                                                variant="link" 
                                                className="team-number-link"
                                                onClick={() => navigate(`/team?id=${team.team_id}`)}
                                            >
                                                #{team.team_id}
                                            </Button>
                                        </td>
                                        <td>{team.team_name}</td>
                                        <td>
                                            <div style={{ maxWidth: '200px', wordWrap: 'break-word' }}>
                                                {team.scores && team.scores.length > 0 ? (
                                                    team.scores.map((score, index) => (
                                                        isPasswordValid ? <span key={index}>
                                                            <Button
                                                                variant="outline-danger"
                                                                size="sm"
                                                                className="me-1 mb-1"
                                                                disabled={!isPasswordValid}
                                                                onClick={() => handleRemoveScore(team, score)}
                                                                title="Click to remove this score"
                                                            >
                                                                {score} X
                                                            </Button>
                                                        </span> : <span key={index}>{index > 0 ? ', ' : ''}{score}</span>
                                                    ))
                                                ) : (
                                                    <span className="text-muted">No scores</span>
                                                )}
                                            </div>
                                        </td>
                                        <td>{calculateTeamAverage(team.scores)}</td>
                                        <td>{team.scores ? team.scores.length : 0}</td>
                                        {isPasswordValid && <td>
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                disabled={!isPasswordValid}
                                                onClick={() => openAddScoreModal(team)}
                                            >
                                                + Add Score
                                            </Button>
                                        </td>}
                                    </tr>
                                ))}
                            </tbody>
                        </Table>

                        {teamData.length === 0 && !loading && (
                            <div className="text-center p-4">
                                <h4>No teams found</h4>
                                <p>No teams have been registered yet.</p>
                            </div>
                        )}
                    </Col>
                </Row>

                {/* Add Score Modal */}
                <Modal show={showAddScoreModal} onHide={closeAddScoreModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Add Score</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {selectedTeam && (
                            <>
                                <p>
                                    <strong>Team:</strong> #{selectedTeam.team_id} - {selectedTeam.team_name}
                                </p>
                                <Form.Group>
                                    <Form.Label>Score</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={newScore}
                                        onChange={(e) => setNewScore(e.target.value)}
                                        placeholder="Enter score"
                                        min="0"
                                        autoFocus
                                    />
                                </Form.Group>
                            </>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={closeAddScoreModal}>
                            Cancel
                        </Button>
                        <Button 
                            variant="primary" 
                            onClick={handleAddScore}
                            disabled={!newScore || isNaN(Number(newScore))}
                        >
                            Add Score
                        </Button>
                    </Modal.Footer>
                </Modal>

                <Toaster position="bottom-right" reverseOrder={false} />
            </Container>
        </settingsContext.Provider>
    );
};

export default AdminPage;

export const Head: HeadFC = () => <title>Admin Panel - FLL Scoreboard</title>;

// Server-side rendering function
export async function getServerData(): Promise<GetServerDataReturn> {
  try {
    // You can fetch initial data here on the server
    const backendUrl = process.env.GATSBY_BACKEND_URL || "http://127.0.0.1:5000";
    
    // Example: Pre-fetch team data on server
    // const response = await fetch(`${backendUrl}/display`);
    // const teamData = await response.json();
    
    return {
      status: 200,
      props: {
        // teamData, // Pass data as props
        serverRendered: true,
        timestamp: new Date().toISOString()
      }
    }
  } catch (error) {
    console.error('Server-side data fetching failed:', error);
    return {
      status: 200,
      props: {
        serverRendered: true,
        error: 'Failed to fetch server data',
        timestamp: new Date().toISOString()
      }
    }
  }
}