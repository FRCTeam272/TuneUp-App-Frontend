import React, { useState } from 'react';
import { navigate } from 'gatsby';
import { Card, Table, Badge, Row, Col, ProgressBar, Button, Form } from 'react-bootstrap';

const MultiTeamComparison = ({ selectedTeams, teamData, scheduleData = {}, allTeams = [], divisor = 3 }) => {
    const [sortBy, setSortBy] = useState('average'); // average, highest, total_rounds, team_number
    const [sortOrder, setSortOrder] = useState('desc'); // asc, desc
    const [showAllScores, setShowAllScores] = useState(false);
    const [hiddenEvents, setHiddenEvents] = useState(new Set());

    const processTeamData = (team) => {
        if (!team) return null;

        const scores = team.scores || [];
        const sortedScores = [...scores].sort((a, b) => b - a);
        const topScores = team.top_three_scores || sortedScores.slice(0, divisor);
        const average = team.average_top_three || 
            (topScores.length > 0 ? topScores.reduce((a, b) => a + b, 0) / topScores.length : 0);

        return {
            teamId: team.team_id,
            teamName: team.team_name,
            allScores: scores,
            sortedScores: sortedScores,
            topScores: topScores,
            average: average,
            highestScore: scores.length > 0 ? Math.max(...scores) : 0,
            lowestScore: scores.length > 0 ? Math.min(...scores) : 0,
            totalRounds: scores.length,
            improvementTrend: calculateTrend(scores)
        };
    };

    const calculateTrend = (scores) => {
        if (scores.length < 2) return 'insufficient-data';
        
        const recentScores = scores.slice(-3); // Last 3 scores
        const earlierScores = scores.slice(0, 3); // First 3 scores
        
        if (recentScores.length === 0 || earlierScores.length === 0) return 'insufficient-data';
        
        const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
        const earlierAvg = earlierScores.reduce((a, b) => a + b, 0) / earlierScores.length;
        
        const improvement = ((recentAvg - earlierAvg) / earlierAvg) * 100;
        
        if (improvement > 10) return 'improving';
        if (improvement < -10) return 'declining';
        return 'stable';
    };

    const getTrendBadge = (trend) => {
        switch (trend) {
            case 'improving':
                return <Badge bg="success">📈 Improving</Badge>;
            case 'declining':
                return <Badge bg="danger">📉 Declining</Badge>;
            case 'stable':
                return <Badge bg="info">📊 Stable</Badge>;
            default:
                return <Badge bg="secondary">📋 New Team</Badge>;
        }
    };

    const getScoreColor = (score, maxScore) => {
        if (maxScore === 0) return '#6c757d';
        const percentage = (score / maxScore) * 100;
        if (percentage >= 90) return '#198754';
        if (percentage >= 75) return '#fd7e14';
        if (percentage >= 50) return '#ffc107';
        return '#dc3545';
    };

    const calculateActualRanking = (teamId) => {
        if (!allTeams || allTeams.length === 0) return null;
        
        // Sort all teams by average score (descending)
        const sortedTeams = [...allTeams].sort((a, b) => {
            const avgA = a.average_top_three || 0;
            const avgB = b.average_top_three || 0;
            return avgB - avgA;
        });
        
        // Find the team's position
        const teamIndex = sortedTeams.findIndex(team => team.team_id === teamId);
        return teamIndex !== -1 ? teamIndex + 1 : null;
    };

    const getEventType = (eventName) => {
        if (eventName.includes("Judge")) return 'Judging';
        if (eventName.includes("Round")) return 'Robot Match';
        if (eventName.includes("Morning")) return 'Practice';
        return 'Event';
    };

    const getEventId = (event) => {
        // Create a more reliable ID by including index or using a hash of the event details
        const teamId = event.teamId || 'unknown';
        const name = event.name || 'unnamed';
        const date = event.date || 'no-date';
        return `${teamId}-${name.replace(/[^a-zA-Z0-9]/g, '_')}-${date.replace(/[^a-zA-Z0-9]/g, '_')}`;
    };

    const toggleEventVisibility = (eventId) => {
        console.log('Toggling event:', eventId);
        console.log('Current hidden events:', Array.from(hiddenEvents));
        const newHiddenEvents = new Set(hiddenEvents);
        if (newHiddenEvents.has(eventId)) {
            newHiddenEvents.delete(eventId);
            console.log('Showing event:', eventId);
        } else {
            newHiddenEvents.add(eventId);
            console.log('Hiding event:', eventId);
        }
        setHiddenEvents(newHiddenEvents);
        console.log('New hidden events:', Array.from(newHiddenEvents));
    };

    const hideAllCompletedEvents = () => {
        // Hide all events that have passed (assuming current time)
        const now = new Date();
        Object.entries(scheduleData)
            .flatMap(([teamId, schedule]) => {
                if (!schedule || !Array.isArray(schedule)) return [];
                return schedule.map(event => ({
                    ...event,
                    teamId: parseInt(teamId),
                    eventType: getEventType(event.name)
                }));
            })
            .forEach(event => {
                if (event.date && new Date(event.date) < now) {
                    const eventId = getEventId(event);
                    setHiddenEvents(prev => new Set([...prev, eventId]));
                }
            });
    };

    const showAllEvents = () => {
        setHiddenEvents(new Set());
    };

    // Process all team data
    const processedTeams = selectedTeams
        .map(teamId => {
            const team = teamData[teamId];
            return processTeamData(team);
        })
        .filter(team => team !== null);

    // Sort teams based on selected criteria
    const sortedTeams = [...processedTeams].sort((a, b) => {
        let valueA, valueB;
        
        switch (sortBy) {
            case 'average':
                valueA = a.average;
                valueB = b.average;
                break;
            case 'highest':
                valueA = a.highestScore;
                valueB = b.highestScore;
                break;
            case 'total_rounds':
                valueA = a.totalRounds;
                valueB = b.totalRounds;
                break;
            case 'team_number':
                valueA = a.teamId;
                valueB = b.teamId;
                break;
            default:
                valueA = a.average;
                valueB = b.average;
        }

        if (sortOrder === 'asc') {
            return valueA - valueB;
        } else {
            return valueB - valueA;
        }
    });

    // Calculate comparison stats
    const maxAverage = Math.max(...processedTeams.map(t => t.average));
    const maxHighest = Math.max(...processedTeams.map(t => t.highestScore));
    const maxRounds = Math.max(...processedTeams.map(t => t.totalRounds));

    const handleSortChange = (newSortBy) => {
        if (sortBy === newSortBy) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(newSortBy);
            setSortOrder('desc');
        }
    };

    if (processedTeams.length === 0) {
        return (
            <Card className="projector-card">
                <Card.Body className="projector-card-body text-center">
                    <h3>Loading team data...</h3>
                    <p>Please wait while we fetch the data for selected teams.</p>
                </Card.Body>
            </Card>
        );
    }

    return (
        <div className="multi-team-comparison">
            {/* Summary Statistics */}
            <Card className="mb-4 projector-card">
                <Card.Header className="projector-card-header">
                    <h2 className="mb-0">📊 Team Comparison Summary</h2>
                </Card.Header>
                <Card.Body className="projector-card-body">
                    <Row>
                        <Col md={3}>
                            <div className="stat-box text-center">
                                <h4>Teams Selected</h4>
                                <div className="stat-value">{processedTeams.length}</div>
                            </div>
                        </Col>
                        <Col md={3}>
                            <div className="stat-box text-center">
                                <h4>Highest Average</h4>
                                <div className="stat-value text-success">{maxAverage.toFixed(1)}</div>
                            </div>
                        </Col>
                        <Col md={3}>
                            <div className="stat-box text-center">
                                <h4>Best Single Score</h4>
                                <div className="stat-value text-warning">{maxHighest}</div>
                            </div>
                        </Col>
                        <Col md={3}>
                            <div className="stat-box text-center">
                                <h4>Most Rounds</h4>
                                <div className="stat-value text-info">{maxRounds}</div>
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Comparison Table */}
            <Card className="mb-4 projector-card">
                <Card.Header className="projector-card-header">
                    <div className="d-flex justify-content-between align-items-center">
                        <h3 className="mb-0">🏆 Team Rankings</h3>
                        <div className="d-flex gap-2 align-items-center">
                            <Form.Check
                                type="switch"
                                label="Show all scores"
                                checked={showAllScores}
                                onChange={(e) => setShowAllScores(e.target.checked)}
                            />
                        </div>
                    </div>
                </Card.Header>
                <Card.Body className="projector-card-body">
                    <div className="table-responsive">
                        <Table className="projector-table">
                            <thead>
                                <tr>
                                    <th>
                                        Rank
                                        <br />
                                        <small className="text-muted fw-normal">(Overall)</small>
                                    </th>
                                    <th 
                                        style={{ cursor: 'pointer' }} 
                                        onClick={() => handleSortChange('team_number')}
                                    >
                                        Team # {sortBy === 'team_number' && (sortOrder === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th>Team Name</th>
                                    <th 
                                        style={{ cursor: 'pointer' }} 
                                        onClick={() => handleSortChange('average')}
                                    >
                                        Average {sortBy === 'average' && (sortOrder === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th 
                                        style={{ cursor: 'pointer' }} 
                                        onClick={() => handleSortChange('highest')}
                                    >
                                        Highest {sortBy === 'highest' && (sortOrder === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th 
                                        style={{ cursor: 'pointer' }} 
                                        onClick={() => handleSortChange('total_rounds')}
                                    >
                                        Rounds {sortBy === 'total_rounds' && (sortOrder === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th>Trend</th>
                                    <th>Progress Bar</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedTeams.map((team, index) => {
                                    const actualRank = calculateActualRanking(team.teamId);
                                    return (
                                    <tr key={team.teamId}>
                                        <td>
                                            <div className="d-flex align-items-center gap-2">
                                                <Badge 
                                                    bg={index === 0 ? 'warning' : index < 3 ? 'info' : 'secondary'}
                                                    className="rank-badge"
                                                >
                                                    #{index + 1}
                                                </Badge>
                                                {actualRank && (
                                                    <small className="text-muted">
                                                        (#{actualRank} overall)
                                                    </small>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <Button
                                                variant="link"
                                                className="p-0 fw-bold text-decoration-none"
                                                onClick={() => navigate(`/team/${team.teamId}`)}
                                                aria-label={`View details for team ${team.teamId}`}
                                            >
                                                {team.teamId}
                                            </Button>
                                        </td>
                                        <td>
                                            <span className="team-name">
                                                {team.teamName || 'N/A'}
                                            </span>
                                        </td>
                                        <td>
                                            <strong style={{ color: getScoreColor(team.average, maxAverage) }}>
                                                {team.average.toFixed(1)}
                                            </strong>
                                        </td>
                                        <td>
                                            <strong style={{ color: getScoreColor(team.highestScore, maxHighest) }}>
                                                {team.highestScore}
                                            </strong>
                                        </td>
                                        <td>{team.totalRounds}</td>
                                        <td>{getTrendBadge(team.improvementTrend)}</td>
                                        <td style={{ minWidth: '120px' }}>
                                            <ProgressBar
                                                now={(team.average / maxAverage) * 100}
                                                style={{ height: '20px' }}
                                                variant={
                                                    team.average === maxAverage ? 'success' :
                                                    team.average >= maxAverage * 0.8 ? 'info' : 'warning'
                                                }
                                            />
                                        </td>
                                        <td>
                                            <Button
                                                size="sm"
                                                variant="outline-primary"
                                                onClick={() => navigate(`/team/${team.teamId}`)}
                                            >
                                                View
                                            </Button>
                                        </td>
                                    </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>

            {/* Detailed Score Breakdown */}
            {showAllScores && (
                <Card className="projector-card">
                    <Card.Header className="projector-card-header">
                        <h3 className="mb-0">🎯 Detailed Score Breakdown</h3>
                    </Card.Header>
                    <Card.Body className="projector-card-body">
                        <Row>
                            {sortedTeams.map(team => (
                                <Col md={6} lg={4} key={team.teamId} className="mb-4">
                                    <Card className="h-100">
                                        <Card.Header className="bg-light">
                                            <strong>#{team.teamId} - {team.teamName || 'N/A'}</strong>
                                        </Card.Header>
                                        <Card.Body>
                                            <div className="mb-3">
                                                <small className="text-muted">Top {team.topScores.length} Scores:</small>
                                                <div className="d-flex flex-wrap gap-1">
                                                    {team.topScores.map((score, idx) => (
                                                        <Badge key={idx} bg="primary">
                                                            {score}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                            
                                            {team.allScores.length > team.topScores.length && (
                                                <div className="mb-3">
                                                    <small className="text-muted">Other Scores:</small>
                                                    <div className="d-flex flex-wrap gap-1">
                                                        {team.sortedScores
                                                            .filter(score => !team.topScores.includes(score))
                                                            .map((score, idx) => (
                                                                <Badge key={idx} bg="secondary">
                                                                    {score}
                                                                </Badge>
                                                            ))}
                                                    </div>
                                                </div>
                                            )}
                                            
                                            <div className="text-center">
                                                <div><strong>Average: {team.average.toFixed(1)}</strong></div>
                                                <div><small>Range: {team.lowestScore} - {team.highestScore}</small></div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </Card.Body>
                </Card>
            )}

            {/* Combined Schedule Section */}
            {Object.keys(scheduleData).length > 0 && (
                <Card className="projector-card">
                    <Card.Header className="projector-card-header">
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                            <h3 className="mb-0">📅 Combined Team Schedules</h3>
                            <div className="d-flex gap-2 flex-wrap">
                                {/* <Button
                                    size="sm"
                                    variant="outline-light"
                                    onClick={hideAllCompletedEvents}
                                    className="d-flex align-items-center gap-1"
                                >
                                    ⏰ Hide Past Events
                                </Button> */}
                                <Button
                                    size="sm"
                                    variant="light"
                                    onClick={showAllEvents}
                                    className="d-flex align-items-center gap-1"
                                >
                                    👁️ Show All
                                </Button>
                                <small className="text-light align-self-center">
                                    ({hiddenEvents.size} hidden)
                                </small>
                            </div>
                        </div>
                    </Card.Header>
                    <Card.Body className="projector-card-body">
                        <div className="table-responsive">
                            <Table className="projector-table schedule-table">
                                <thead>
                                    <tr>
                                        <th>Team</th>
                                        <th>Time</th>
                                        <th>Event</th>
                                        <th>Details</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(scheduleData)
                                        .flatMap(([teamId, schedule]) => {
                                            if (!schedule || !Array.isArray(schedule)) return [];
                                            return schedule.map((event, eventIndex) => {
                                                const enrichedEvent = {
                                                    ...event,
                                                    teamId: parseInt(teamId),
                                                    teamName: processedTeams.find(t => t.teamId === parseInt(teamId))?.teamName || `Team #${teamId}`,
                                                    eventType: getEventType(event.name)
                                                };
                                                enrichedEvent.eventId = getEventId(enrichedEvent);
                                                return enrichedEvent;
                                            });
                                        })
                                        .filter(event => !hiddenEvents.has(event.eventId))
                                        .sort((a, b) => {
                                            // Sort by time if available, otherwise by team number
                                            if (a.date && b.date) {
                                                return new Date(a.date) - new Date(b.date);
                                            }
                                            return a.teamId - b.teamId;
                                        })
                                        .map((event, index) => {
                                            console.log('Rendering event:', event.eventId, 'Hidden:', hiddenEvents.has(event.eventId));
                                            return (
                                            <tr key={event.eventId || `${event.teamId}-${index}`}>
                                                <td className="team-cell">
                                                    <strong>#{event.teamId}</strong>
                                                    <br />
                                                    <small className="text-muted">{event.teamName}</small>
                                                </td>
                                                <td className="time-cell">
                                                    <strong>{event.name.split(":")[0]}</strong>
                                                    <br></br>
                                                    <small>{event.date ? new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}</small>
                                                </td>
                                                {console.log("event", event)}
                                                <td>
                                                    <Badge 
                                                        bg={
                                                            event.eventType === 'Judging' ? 'info' :
                                                            event.eventType === 'Robot Match' ? 'success' :
                                                            event.eventType === 'Practice' ? 'warning' :
                                                            'secondary'
                                                        }
                                                        className="event-badge"
                                                    >
                                                        {event.eventType}
                                                    </Badge>
                                                    {event.round && (
                                                        <small className="text-muted">Round {event.round}</small>
                                                    )}
                                                </td>
                                                <td>
                                                    {event.name.split(":")[1]}
                                                </td>
                                                <td>
                                                    <Button
                                                        size="sm"
                                                        variant="outline-secondary"
                                                        onClick={() => toggleEventVisibility(event.eventId)}
                                                        title="Hide this event"
                                                    >
                                                        🚫
                                                    </Button>
                                                </td>
                                            </tr>
                                            );
                                        })}
                                    {Object.keys(scheduleData).length > 0 && 
                                     Object.values(scheduleData).every(schedule => !schedule || schedule.length === 0) && (
                                        <tr>
                                            <td colSpan="5" className="text-center text-muted py-4">
                                                {Object.values(scheduleData).some(schedule => schedule && schedule.length > 0) ? 
                                                    'All events are hidden. Click "Show All" above to see them.' :
                                                    'No schedule events found for selected teams'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </div>
                        <div className="mt-3">
                            <small className="text-muted">
                                <strong>Event Types:</strong>
                                <Badge bg="success" className="ms-2 me-1">Robot Match</Badge> Robot Performance
                                <Badge bg="info" className="ms-2 me-1">Judging</Badge> Judging Sessions
                                <Badge bg="warning" className="ms-2 me-1">Practice</Badge> Practice Rounds
                                {hiddenEvents.size > 0 && (
                                    <span className="ms-3 text-info">
                                        📋 {hiddenEvents.size} event{hiddenEvents.size !== 1 ? 's' : ''} hidden
                                    </span>
                                )}
                            </small>
                        </div>
                    </Card.Body>
                </Card>
            )}
        </div>
    );
};

export default MultiTeamComparison;