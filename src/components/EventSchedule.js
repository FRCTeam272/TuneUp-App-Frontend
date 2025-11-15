import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Form, Container } from 'react-bootstrap';

const EventSchedule = ({ scheduleData }) => {
    const [hiddenEvents, setHiddenEvents] = useState(new Set());
    const [showHidden, setShowHidden] = useState(false);

    // Load hidden events from localStorage on component mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedHiddenEvents = localStorage.getItem('hiddenScheduleEvents');
            const storedShowHidden = localStorage.getItem('showHiddenScheduleEvents');
            
            if (storedHiddenEvents) {
                try {
                    const hiddenArray = JSON.parse(storedHiddenEvents);
                    setHiddenEvents(new Set(hiddenArray));
                } catch (error) {
                    console.error('Error parsing stored hidden events:', error);
                }
            }
            
            if (storedShowHidden) {
                setShowHidden(storedShowHidden === 'true');
            }
        }
    }, []);

    // Save hidden events to localStorage whenever hiddenEvents changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const hiddenArray = Array.from(hiddenEvents);
            localStorage.setItem('hiddenScheduleEvents', JSON.stringify(hiddenArray));
        }
    }, [hiddenEvents]);

    // Save showHidden preference to localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('showHiddenScheduleEvents', showHidden.toString());
        }
    }, [showHidden]);

    if (!scheduleData || !Array.isArray(scheduleData) || scheduleData.length === 0) {
        return (
            <Card className="mb-4">
                <Card.Header>
                    <h4>📅 Event Schedule</h4>
                </Card.Header>
                <Card.Body>
                    <p className="text-muted">No events scheduled.</p>
                </Card.Body>
            </Card>
        );
    }

    // Sort events by date
    const sortedEvents = [...scheduleData].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA - dateB;
    });


    const formatTime = (dateString) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return 'TBD';
            }
            
            return date.toLocaleTimeString('en-US', {
                timeZone: 'America/New_York',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } catch (error) {
            return 'TBD';
        }
    };

    // Create a unique identifier for each event based on date and team info
    const createEventId = (event) => {
        const dateStr = event.date;
        const teamIds = event.info ? event.info.map(team => team.team_id).sort().join(',') : '';
        return `${dateStr}-${teamIds}`;
    };

    const toggleEventVisibility = (eventId) => {
        const newHiddenEvents = new Set(hiddenEvents);
        if (hiddenEvents.has(eventId)) {
            newHiddenEvents.delete(eventId);
        } else {
            newHiddenEvents.add(eventId);
        }
        setHiddenEvents(newHiddenEvents);
    };

    const visibleEvents = showHidden 
        ? sortedEvents 
        : sortedEvents.filter((event) => !hiddenEvents.has(createEventId(event)));

    const hiddenCount = hiddenEvents.size;

    return (
        <Container fluid>
            <Card className="mb-4">
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <h4 className="mb-0">📅 Event Schedule</h4>
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
                                    id="show-hidden-switch"
                                    label="Show hidden"
                                    checked={showHidden}
                                    onChange={(e) => setShowHidden(e.target.checked)}
                                    aria-label="Toggle visibility of hidden events"
                                />
                                <Button
                                    variant="outline-warning"
                                    size="sm"
                                    onClick={() => {
                                        setHiddenEvents(new Set());
                                        setShowHidden(false);
                                    }}
                                    title="Clear all hidden events"
                                >
                                    Clear All
                                </Button>
                            </>
                        )}
                    </div>
                </Card.Header>
                <Card.Body className="p-0">
                    {visibleEvents.length === 0 ? (
                        <div className="p-4">
                            <p className="text-muted mb-0">
                                {hiddenCount > 0 ? 'All events are hidden. Toggle "Show hidden" to view them.' : 'No events to display.'}
                            </p>
                        </div>
                    ) : (
                        <Table responsive striped hover className="mb-0">
                            <thead className="table-dark">
                                <tr>
                                    <th className="d-none d-md-table-cell">Event & Time</th>
                                    <th className="d-md-none">Event Details</th>
                                    <th className="d-none d-md-table-cell">Teams</th>
                                    <th style={{width: '100px'}}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visibleEvents.map((event, displayIndex) => {
                                    const eventId = createEventId(event);
                                    const isHidden = hiddenEvents.has(eventId);
                                    
                                    return (
                                        <tr key={eventId} className={isHidden && showHidden ? 'table-secondary opacity-50' : ''}>
                                            {/* Desktop: Event & Time column */}
                                            <td className="d-none d-md-table-cell">
                                                <div>
                                                    <div className="fw-bold">
                                                        {event.name}
                                                    </div>
                                                    <div className="text-muted small">
                                                        {formatTime(event.date)}
                                                    </div>
                                                </div>
                                            </td>
                                            
                                            {/* Desktop: Teams column */}
                                            <td className="d-none d-md-table-cell">
                                                {event.info && event.info.length > 0 ? (
                                                    <Table size="sm" className="mb-0">
                                                        <tbody>
                                                            {event.info.map((team, teamIndex) => (
                                                                <tr key={teamIndex}>
                                                                    <td className="border-1 py-1" style={{minWidth: '200px'}}>
                                                                        <div className="fw-bold text-primary small">{team.team_name}</div>
                                                                        <div className="text-muted" style={{fontSize: '0.75rem'}}>#{team.team_id}</div>
                                                                    </td>
                                                                    <td className="border-1 py-1">
                                                                        <span className="small">{team.text}</span>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </Table>
                                                ) : (
                                                    <span className="text-muted">No teams assigned</span>
                                                )}
                                            </td>
                                            
                                            {/* Mobile: Combined column */}
                                            <td className="d-md-none">
                                                <div className="mb-3">
                                                    <div className="fw-bold mb-1">
                                                        {event.name}
                                                    </div>
                                                    <div className="text-muted small mb-2">
                                                        {formatTime(event.date)}
                                                    </div>
                                                </div>
                                                {event.info && event.info.length > 0 ? (
                                                    <div>
                                                        {event.info.map((team, teamIndex) => (
                                                            <div key={teamIndex} className="mb-2 p-2 border rounded bg-light">
                                                                <div className="d-flex flex-column">
                                                                    <div className="fw-bold text-primary small mb-1">
                                                                        {team.team_name}
                                                                    </div>
                                                                    <div className="text-muted mb-1" style={{fontSize: '0.75rem'}}>
                                                                        Team #{team.team_id}
                                                                    </div>
                                                                    <div className="small">
                                                                        {team.text}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted small">No teams assigned</span>
                                                )}
                                            </td>
                                            
                                            {/* Actions column */}
                                            <td className="text-center">
                                                <Button
                                                    variant={isHidden ? "outline-success" : "outline-secondary"}
                                                    size="sm"
                                                    onClick={() => toggleEventVisibility(eventId)}
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
                {sortedEvents.length > 0 && (
                    <Card.Footer className="text-muted small">
                        Showing {visibleEvents.length} of {sortedEvents.length} events
                        {hiddenCount > 0 && ` (${hiddenCount} hidden)`}
                    </Card.Footer>
                )}
            </Card>
        </Container>
    );
};

export default EventSchedule;