import React, { useState } from 'react';
import { Button, Form, InputGroup, Modal, Alert, Row, Col, Badge } from 'react-bootstrap';

const TeamEditControls = ({ 
    teamData, 
    onEditTeamName, 
    onAddScore, 
    onRemoveScore,
    isPasswordValid 
}) => {
    const [showEditName, setShowEditName] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');
    const [newScore, setNewScore] = useState('');
    const [scoreToRemove, setScoreToRemove] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const handleEditTeamName = async () => {
        if (!newTeamName.trim()) {
            setMessage({ text: 'Please enter a team name', type: 'danger' });
            return;
        }

        setLoading(true);
        setMessage({ text: '', type: '' });

        const result = await onEditTeamName(newTeamName.trim());
        
        if (result.success) {
            setMessage({ text: 'Team name updated successfully!', type: 'success' });
            setShowEditName(false);
            setNewTeamName('');
        } else {
            setMessage({ text: result.error || 'Failed to update team name', type: 'danger' });
        }
        
        setLoading(false);
    };

    const handleAddScore = async () => {
        const score = parseInt(newScore);
        
        if (isNaN(score) || score < 0) {
            setMessage({ text: 'Please enter a valid score (0 or higher)', type: 'danger' });
            return;
        }

        setLoading(true);
        setMessage({ text: '', type: '' });

        const result = await onAddScore(score);
        
        // result.success = result.team_id === teamData.team_id && result.score === score;
        console.log("Add Score Result:", result);
        if (result.success) {
            setMessage({ text: 'Score added successfully!', type: 'success' });
            setNewScore('');
        } else {
            setMessage({ text: result.error || 'Failed to add score', type: 'danger' });
        }
        
        setLoading(false);
    };

    const handleRemoveScore = async () => {
        const score = parseInt(scoreToRemove);
        
        if (isNaN(score)) {
            setMessage({ text: 'Please enter a valid score to remove', type: 'danger' });
            return;
        }

        if (!teamData.scores || !teamData.scores.includes(score)) {
            setMessage({ text: 'This score does not exist for this team', type: 'danger' });
            return;
        }

        setLoading(true);
        setMessage({ text: '', type: '' });

        const result = await onRemoveScore(score);
        
        if (result.success) {
            setMessage({ text: 'Score removed successfully!', type: 'success' });
            setScoreToRemove('');
        } else {
            setMessage({ text: result.error || 'Failed to remove score', type: 'danger' });
        }
        
        setLoading(false);
    };

    const openEditNameModal = () => {
        setNewTeamName(teamData.team_name);
        setShowEditName(true);
        setMessage({ text: '', type: '' });
    };

    if (!isPasswordValid) {
        return null;
    }

    return (
        <div className="team-edit-controls mb-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
                <h4>🔧 Team Management</h4>
                <Badge bg="success">Admin Mode</Badge>
            </div>

            {message.text && (
                <Alert variant={message.type} dismissible onClose={() => setMessage({ text: '', type: '' })}>
                    {message.text}
                </Alert>
            )}

            <Row>
                <Col md={4}>
                    <div className="edit-section">
                        <h6>Edit Team Name</h6>
                        <Button 
                            variant="outline-primary" 
                            size="sm" 
                            onClick={openEditNameModal}
                            disabled={loading}
                        >
                            ✏️ Edit Name
                        </Button>
                    </div>
                </Col>
                
                <Col md={4}>
                    <div className="edit-section">
                        <h6>Add Score</h6>
                        <InputGroup size="sm">
                            <Form.Control
                                type="number"
                                placeholder="Enter score"
                                value={newScore}
                                onChange={(e) => setNewScore(e.target.value)}
                                min="0"
                                disabled={loading}
                            />
                            <Button
                                variant="success"
                                onClick={handleAddScore}
                                disabled={loading || !newScore}
                            >
                                ➕ Add
                            </Button>
                        </InputGroup>
                    </div>
                </Col>
                
                <Col md={4}>
                    <div className="edit-section">
                        <h6>Remove Score</h6>
                        <InputGroup size="sm">
                            <Form.Control
                                type="number"
                                placeholder="Score to remove"
                                value={scoreToRemove}
                                onChange={(e) => setScoreToRemove(e.target.value)}
                                disabled={loading}
                            />
                            <Button
                                variant="danger"
                                onClick={handleRemoveScore}
                                disabled={loading || !scoreToRemove}
                            >
                                ➖ Remove
                            </Button>
                        </InputGroup>
                    </div>
                </Col>
            </Row>

            {teamData.scores && teamData.scores.length > 0 && (
                <div className="current-scores mt-3">
                    <h6>Current Scores:</h6>
                    <div className="d-flex flex-wrap gap-1">
                        {teamData.scores.map((score, index) => (
                            <Badge 
                                key={index} 
                                bg="secondary" 
                                className="cursor-pointer"
                                onClick={() => setScoreToRemove(score.toString())}
                                title="Click to select for removal"
                            >
                                {score}
                            </Badge>
                        ))}
                    </div>
                    <small className="text-muted">Click a score to select it for removal</small>
                </div>
            )}

            {/* Edit Name Modal */}
            <Modal show={showEditName} onHide={() => setShowEditName(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Team Name</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>Team Name</Form.Label>
                        <Form.Control
                            type="text"
                            value={newTeamName}
                            onChange={(e) => setNewTeamName(e.target.value)}
                            placeholder="Enter new team name"
                            disabled={loading}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button 
                        variant="secondary" 
                        onClick={() => setShowEditName(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={handleEditTeamName}
                        disabled={loading || !newTeamName.trim()}
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default TeamEditControls;