import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Form, Container } from 'react-bootstrap';

const RoomAssignments = ({ roomData }) => {
    const [hiddenTeams, setHiddenTeams] = useState(new Set());
    const [showHidden, setShowHidden] = useState(false);
    const [judgeView, setJudgeView] = useState(false);
    const [selectedJudgeGroup, setSelectedJudgeGroup] = useState('all');
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
                const storedJudgeGroup = localStorage.getItem('selectedJudgeGroup');
                
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
                
                if (storedJudgeGroup) {
                    setSelectedJudgeGroup(storedJudgeGroup);
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

    // Save selectedJudgeGroup preference to localStorage
    useEffect(() => {
        if (isClient && typeof window !== 'undefined') {
            localStorage.setItem('selectedJudgeGroup', selectedJudgeGroup);
        }
    }, [selectedJudgeGroup, isClient]);

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

    // Get unique judge groups from the data
    const availableJudgeGroups = [...new Set(roomData
        .map(assignment => assignment.judge_group)
        .filter(group => group && group.trim() !== '')
    )].sort();

    // Filter by judge group first, then by hidden teams
    const judgeGroupFilteredData = selectedJudgeGroup === 'all' 
        ? sortedData 
        : sortedData.filter((assignment) => assignment.judge_group === selectedJudgeGroup);

    const visibleData = showHidden 
        ? judgeGroupFilteredData 
        : judgeGroupFilteredData.filter((assignment) => !hiddenTeams.has(assignment.team_id));

    const hiddenCount = hiddenTeams.size;

    return (
        <Container fluid>
            <Card className="mb-4">
                <Card.Header className="d-flex flex-column gap-3">
                    <h4 className="mb-0 text-center text-md-start">
                        {judgeView ? '⚖️ Judge Assignments' : '🏠 Room Assignments'}
                    </h4>
                    <div className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center gap-3">
                        <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2 w-100 w-lg-auto">
                            <Button
                                variant={judgeView ? "primary" : "outline-primary"}
                                size="sm"
                                onClick={() => setJudgeView(!judgeView)}
                                className="text-nowrap flex-fill flex-sm-grow-0"
                                style={{minHeight: '44px'}}
                            >
                                {judgeView ? '⚖️ Judge View' : '🏠 Room View'}
                            </Button>
                            
                            {judgeView && availableJudgeGroups.length > 0 && (
                                <div className="d-flex align-items-center gap-2 flex-fill flex-sm-grow-0">
                                    <label htmlFor="judge-group-filter" className="text-nowrap small text-muted mb-0">
                                        Filter:
                                    </label>
                                    <select
                                        id="judge-group-filter"
                                        className="form-select form-select-sm"
                                        value={selectedJudgeGroup}
                                        onChange={(e) => setSelectedJudgeGroup(e.target.value)}
                                        style={{minHeight: '36px', minWidth: '120px'}}
                                    >
                                        <option value="all">All Groups</option>
                                        {availableJudgeGroups.map(group => (
                                            <option key={group} value={group}>
                                                Group {group}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                        
                        <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-3 w-100 w-lg-auto">
                            {hiddenCount > 0 && (
                                <div className="d-flex align-items-center gap-2 w-100 w-sm-auto justify-content-between justify-content-sm-start">
                                    <Badge bg="secondary" className="px-2 py-1">
                                        {hiddenCount} hidden
                                    </Badge>
                                    <Form.Check 
                                        type="switch"
                                        id="show-hidden-teams-switch"
                                        label="Show hidden"
                                        checked={showHidden}
                                        onChange={(e) => setShowHidden(e.target.checked)}
                                        aria-label="Toggle visibility of hidden teams"
                                        className="mb-0"
                                        style={{minHeight: '44px', display: 'flex', alignItems: 'center'}}
                                    />
                                </div>
                            )}
                            {hiddenCount > 0 && (
                                <Button
                                    variant="outline-warning"
                                    size="sm"
                                    onClick={() => {
                                        setHiddenTeams(new Set());
                                        setShowHidden(false);
                                    }}
                                    title="Clear all hidden teams"
                                    className="w-100 w-sm-auto"
                                    style={{minHeight: '44px'}}
                                >
                                    Clear All
                                </Button>
                            )}
                        </div>
                    </div>
                </Card.Header>
                <Card.Body className="p-0">
                    {visibleData.length === 0 ? (
                        <div className="p-4">
                            <p className="text-muted mb-0 text-center">
                                {hiddenCount > 0 ? 'All teams are hidden. Toggle "Show hidden" to view them.' : 'No assignments to display.'}
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table View */}
                            <div className="d-none d-md-block">
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
                            </div>

                            {/* Mobile Card View */}
                            <div className="d-block d-md-none p-3">
                                {visibleData.map((assignment, index) => {
                                    const isHidden = hiddenTeams.has(assignment.team_id);
                                    const teamKey = `${assignment.team_id}-${assignment.room}`;
                                    
                                    return (
                                        <div key={teamKey} className={`mobile-team-card ${isHidden && showHidden ? 'opacity-50' : ''}`} style={{
                                            background: 'white',
                                            border: '2px solid #dee2e6',
                                            borderRadius: '12px',
                                            padding: '1rem',
                                            marginBottom: '1rem',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                        }}>
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <div className="flex-grow-1">
                                                    <h6 className="fw-bold text-primary mb-1">
                                                        {assignment.team_name || `Team ${assignment.team_id}`}
                                                    </h6>
                                                    <div className="text-muted small mb-2">
                                                        Team #{assignment.team_id}
                                                    </div>
                                                </div>
                                                <Button
                                                    variant={isHidden ? "outline-success" : "outline-secondary"}
                                                    size="sm"
                                                    onClick={() => toggleTeamVisibility(assignment.team_id)}
                                                    style={{minHeight: '36px', minWidth: '60px'}}
                                                >
                                                    {isHidden ? "Show" : "Hide"}
                                                </Button>
                                            </div>
                                            
                                            <div className="row g-2">
                                                <div className="col-6">
                                                    <div className="text-center p-2" style={{background: '#f8f9fa', borderRadius: '6px'}}>
                                                        <div className="small text-muted mb-1">Room</div>
                                                        <span className="badge bg-info text-dark">
                                                            {assignment.room || 'TBD'}
                                                        </span>
                                                    </div>
                                                </div>
                                                {judgeView && (
                                                    <>
                                                        <div className="col-6">
                                                            <div className="text-center p-2" style={{background: '#f8f9fa', borderRadius: '6px'}}>
                                                                <div className="small text-muted mb-1">Session</div>
                                                                <span className="badge bg-warning text-dark">
                                                                    {assignment.judge_session || 'TBD'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="col-12">
                                                            <div className="text-center p-2" style={{background: '#f8f9fa', borderRadius: '6px'}}>
                                                                <div className="small text-muted mb-1">Judge Group</div>
                                                                <span className="badge bg-success">
                                                                    {assignment.judge_group || 'TBD'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </Card.Body>
                {sortedData.length > 0 && (
                    <Card.Footer className="text-muted small">
                        Showing {visibleData.length} of {sortedData.length} assignments
                        {selectedJudgeGroup !== 'all' && judgeView && ` (filtered to Judge Group ${selectedJudgeGroup})`}
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