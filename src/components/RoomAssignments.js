import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Form, Container } from 'react-bootstrap';

const RoomAssignments = ({ roomData }) => {
    const [hiddenTeams, setHiddenTeams] = useState(new Set());
    const [showHidden, setShowHidden] = useState(false);
    const [judgeView, setJudgeView] = useState(false);
    const [isClient, setIsClient] = useState(false);

    // Set client-side flag
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Load preferences from localStorage on component mount and listen for storage events
    useEffect(() => {
        const loadFromStorage = () => {
            if (isClient && typeof window !== 'undefined') {
                const storedHiddenTeams = localStorage.getItem('hiddenRoomTeams');
                const storedShowHidden = localStorage.getItem('showHiddenRoomTeams');
                const storedJudgeView = localStorage.getItem('judgeViewMode');
                
                if (storedHiddenTeams) {
                    try {
                        const hiddenArray = JSON.parse(storedHiddenTeams);
                        setHiddenTeams(new Set(hiddenArray));
                    } catch (error) {
                        console.error('Error parsing stored hidden teams:', error);
                    }
                }
                
                if (storedShowHidden) {
                    setShowHidden(storedShowHidden === 'true');
                }
                
                if (storedJudgeView) {
                    setJudgeView(storedJudgeView === 'true');
                }
            }
        };

        // Load initial values
        loadFromStorage();

        // Listen for storage events (for URL sharing updates)
        const handleStorageChange = (e) => {
            if (e.key === 'hiddenRoomTeams' || e.type === 'storage') {
                loadFromStorage();
            }
        };

        if (isClient && typeof window !== 'undefined') {
            window.addEventListener('storage', handleStorageChange);
            
            // Also listen for custom events (for same-window updates)
            window.addEventListener('storage', handleStorageChange);
        }

        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('storage', handleStorageChange);
            }
        };
    }, [isClient]);

    // Save hidden teams to localStorage whenever hiddenTeams changes
    useEffect(() => {
        if (isClient && typeof window !== 'undefined') {
            const hiddenArray = Array.from(hiddenTeams);
            localStorage.setItem('hiddenRoomTeams', JSON.stringify(hiddenArray));
        }
    }, [hiddenTeams, isClient]);

    // Save showHidden preference to localStorage
    useEffect(() => {
        if (isClient && typeof window !== 'undefined') {
            localStorage.setItem('showHiddenRoomTeams', showHidden.toString());
        }
    }, [showHidden, isClient]);

    // Save judgeView preference to localStorage
    useEffect(() => {
        if (isClient && typeof window !== 'undefined') {
            localStorage.setItem('judgeViewMode', judgeView.toString());
        }
    }, [judgeView, isClient]);

    if (!roomData || !Array.isArray(roomData) || roomData.length === 0) {
        return (
            <Card className="mb-4">
                <Card.Header>
                    <h4>🏠 Room Assignments</h4>
                </Card.Header>
                <Card.Body>
                    <p className="text-muted">No room assignments available.</p>
                </Card.Body>
            </Card>
        );
    }

    // Sort data based on current view mode
    const sortedData = [...roomData].sort((a, b) => {
        if (judgeView) {
            // Sort by judge_session first, then judge_group, then room
            const groupA = a.judge_group || '';
            const groupB = b.judge_group || '';
            if (groupA !== groupB) {
                return groupA.localeCompare(groupB);
            }
            
            const sessionA = a.judge_session || '';
            const sessionB = b.judge_session || '';
            if (sessionA !== sessionB) {
                return sessionA.localeCompare(sessionB);
            }
            
            
            
            return (a.room || '').localeCompare(b.room || '');
        } else {
            // Sort by room, then team_id
            const roomA = a.room || '';
            const roomB = b.room || '';
            if (roomA !== roomB) {
                return roomA.localeCompare(roomB);
            }
            
            return (a.team_id || 0) - (b.team_id || 0);
        }
    });

    const toggleTeamVisibility = (teamId) => {
        const newHiddenTeams = new Set(hiddenTeams);
        if (hiddenTeams.has(teamId)) {
            newHiddenTeams.delete(teamId);
        } else {
            newHiddenTeams.add(teamId);
        }
        setHiddenTeams(newHiddenTeams);
    };

    const visibleData = showHidden 
        ? sortedData 
        : sortedData.filter((assignment) => !hiddenTeams.has(assignment.team_id));

    const hiddenCount = hiddenTeams.size;

    return (
        <Container fluid>
            <Card className="mb-4">
                <Card.Header className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                    <h4 className="mb-0">
                        {judgeView ? '⚖️ Judge Assignments' : '🏠 Room Assignments'}
                    </h4>
                    <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-3">
                        <div className="d-flex align-items-center gap-2">
                            <Button
                                variant={judgeView ? "primary" : "outline-primary"}
                                size="sm"
                                onClick={() => setJudgeView(!judgeView)}
                                className="text-nowrap"
                            >
                                {judgeView ? '⚖️ Judge View' : '🏠 Room View'}
                            </Button>
                        </div>
                        
                        <div className="d-flex align-items-center gap-3">
                            {hiddenCount > 0 && (
                                <Badge bg="secondary">
                                    {hiddenCount} hidden
                                </Badge>
                            )}
                            {hiddenCount > 0 && (
                                <>
                                    <Form.Check 
                                        type="switch"
                                        id="show-hidden-teams-switch"
                                        label="Show hidden"
                                        checked={showHidden}
                                        onChange={(e) => setShowHidden(e.target.checked)}
                                        aria-label="Toggle visibility of hidden teams"
                                    />
                                    <Button
                                        variant="outline-warning"
                                        size="sm"
                                        onClick={() => {
                                            setHiddenTeams(new Set());
                                            setShowHidden(false);
                                        }}
                                        title="Clear all hidden teams"
                                    >
                                        Clear All
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </Card.Header>
                <Card.Body className="p-0">
                    {visibleData.length === 0 ? (
                        <div className="p-4">
                            <p className="text-muted mb-0">
                                {hiddenCount > 0 ? 'All teams are hidden. Toggle "Show hidden" to view them.' : 'No assignments to display.'}
                            </p>
                        </div>
                    ) : (
                        <Table responsive striped hover className="mb-0">
                            <thead className="table-dark">
                                <tr>
                                    <th>Team</th>
                                    <th>Room</th>
                                    {judgeView && (
                                        <>
                                            <th>Judge Session</th>
                                            <th>Judge Group</th>
                                        </>
                                    )}
                                    <th style={{width: '100px'}}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visibleData.map((assignment, index) => {
                                    const isHidden = hiddenTeams.has(assignment.team_id);
                                    const teamKey = `${assignment.team_id}-${assignment.room}`;
                                    
                                    return (
                                        <tr key={teamKey} className={isHidden && showHidden ? 'table-secondary opacity-50' : ''}>
                                            <td>
                                                <div>
                                                    <div className="fw-bold text-primary">
                                                        {assignment.team_name || `Team ${assignment.team_id}`}
                                                    </div>
                                                    <div className="text-muted small">
                                                        #{assignment.team_id}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge bg-info text-dark">
                                                    {assignment.room || 'TBD'}
                                                </span>
                                            </td>
                                            {judgeView && (
                                                <>
                                                    <td>
                                                        <span className="badge bg-warning text-dark">
                                                            {assignment.judge_session || 'TBD'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className="badge bg-success">
                                                            {assignment.judge_group || 'TBD'}
                                                        </span>
                                                    </td>
                                                </>
                                            )}
                                            <td className="text-center">
                                                <Button
                                                    variant={isHidden ? "outline-success" : "outline-secondary"}
                                                    size="sm"
                                                    onClick={() => toggleTeamVisibility(assignment.team_id)}
                                                >
                                                    {isHidden ? "Show" : "Hide"}
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
                {sortedData.length > 0 && (
                    <Card.Footer className="text-muted small">
                        Showing {visibleData.length} of {sortedData.length} assignments
                        {hiddenCount > 0 && ` (${hiddenCount} hidden)`}
                        {judgeView && (
                            <span className="ms-3">
                                📊 Sorted by: Judge Session → Judge Group → Room
                            </span>
                        )}
                        {!judgeView && (
                            <span className="ms-3">
                                📊 Sorted by: Room → Team ID
                            </span>
                        )}
                    </Card.Footer>
                )}
            </Card>
        </Container>
    );
};

export default RoomAssignments;