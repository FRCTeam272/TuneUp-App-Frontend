import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button } from 'react-bootstrap';

const Schedule = ({ scheduleData, teamName, roomNumber }) => {
    const [hiddenEvents, setHiddenEvents] = useState(new Set());
    const [showHiddenEvents, setShowHiddenEvents] = useState(false);

    // Generate unique key for localStorage based on team info
    const getStorageKey = () => {
        return `schedule-hidden-events-${teamName?.replace(/[^a-zA-Z0-9]/g, '_') || 'unknown'}`;
    };

    // Load hidden events from localStorage on component mount
    useEffect(() => {
        const storageKey = getStorageKey();
        const savedHiddenEvents = localStorage.getItem(storageKey);
        if (savedHiddenEvents) {
            try {
                const hiddenArray = JSON.parse(savedHiddenEvents);
                setHiddenEvents(new Set(hiddenArray));
            } catch (error) {
                console.error('Error loading hidden events:', error);
            }
        }
    }, [teamName]);

    // Save hidden events to localStorage whenever they change
    useEffect(() => {
        const storageKey = getStorageKey();
        localStorage.setItem(storageKey, JSON.stringify(Array.from(hiddenEvents)));
    }, [hiddenEvents, teamName]);

    // Generate unique event ID
    const getEventId = (event, index) => {
        const name = event.name || `event-${index}`;
        const time = event.start_time || event.time || event.datetime || event.date || 'no-time';
        return `${name.replace(/[^a-zA-Z0-9]/g, '_')}-${time.replace(/[^a-zA-Z0-9]/g, '_')}-${index}`;
    };

    // Toggle event visibility
    const toggleEventVisibility = (eventId) => {
        const newHiddenEvents = new Set(hiddenEvents);
        if (newHiddenEvents.has(eventId)) {
            newHiddenEvents.delete(eventId);
        } else {
            newHiddenEvents.add(eventId);
        }
        setHiddenEvents(newHiddenEvents);
    };

    // Show all hidden events
    const showAllEvents = () => {
        setHiddenEvents(new Set());
    };

    // Hide all past events
    const hideCompletedEvents = () => {
        if (!scheduleData) return;
        const now = new Date();
        const newHiddenEvents = new Set(hiddenEvents);
        
        scheduleData.forEach((event, index) => {
            const eventTime = event.start_time || event.time || event.datetime || event.date;
            if (eventTime && new Date(eventTime) < now) {
                const eventId = getEventId(event, index);
                newHiddenEvents.add(eventId);
            }
        });
        
        setHiddenEvents(newHiddenEvents);
    };

    if (!scheduleData || !Array.isArray(scheduleData) || scheduleData.length === 0) {
        return (
            <Card className="mb-4">
                <Card.Header>
                    <h4>📅 Schedule for {teamName}</h4>
                </Card.Header>
                <Card.Body>
                    <p className="text-muted">No upcoming events scheduled.</p>
                </Card.Body>
            </Card>
        );
    }

    const formatTime = (datetimeString) => {
        if (!datetimeString) return 'TBD';
        
        try {
            // Parse the ISO datetime string
            const date = new Date(datetimeString);
            if (isNaN(date.getTime())) {
                return 'TBD';
            }
            
            // Convert to Eastern Standard Time and format as HH:MM (24-hour format)
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

    const getEventTypeBadge = (eventType) => {
        const type = eventType?.toLowerCase() || '';
        if (type.includes('match') || type.includes('game')) {
            return <Badge bg="primary">Match</Badge>;
        } else if (type.includes('judging') || type.includes('presentation')) {
            return <Badge bg="info">Judging</Badge>;
        } else if (type.includes('practice')) {
            return <Badge bg="secondary">Practice</Badge>;
        } else if (type.includes('awards') || type.includes('ceremony')) {
            return <Badge bg="warning">Awards</Badge>;
        } else {
            return <Badge bg="light" text="dark">{eventType || 'Event'}</Badge>;
        }
    };

    const sortedEvents = [...scheduleData].sort((a, b) => {
        // Sort by any available time/order field
        const timeA = a.start_time || a.time || a.order || 0;
        const timeB = b.start_time || b.time || b.order || 0;
        return timeA - timeB;
    });

    return (
        <Card className="mb-4">
            <Card.Header>
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <div>
                        <h4 className="mb-1">📅 Schedule for {teamName}</h4>
                        <h6 className="text-muted mb-0">Room {roomNumber}</h6>
                    </div>
                    <div className="d-flex gap-2 flex-wrap">
                        {/* <Button
                            size="sm"
                            variant="outline-secondary"
                            onClick={hideCompletedEvents}
                            title="Hide events that have already occurred"
                        >
                            ⏰ Hide Past
                        </Button> */}
                        <Button
                            size="sm"
                            variant="outline-info"
                            onClick={() => setShowHiddenEvents(!showHiddenEvents)}
                            title="Toggle visibility of hidden events"
                        >
                            {showHiddenEvents ? '👁️ Hide Completed' : `👁️‍🗨️ Show Hidden (${hiddenEvents.size})`}
                        </Button>
                        <Button
                            size="sm"
                            variant="outline-success"
                            onClick={showAllEvents}
                            disabled={hiddenEvents.size === 0}
                            title="Show all events"
                        >
                            🔄 Show All
                        </Button>
                    </div>
                </div>
            </Card.Header>
            <Card.Body>
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Session</th>
                            <th>Location</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedEvents
                            .map((event, index) => ({ ...event, eventId: getEventId(event, index), originalIndex: index }))
                            .filter(event => showHiddenEvents || !hiddenEvents.has(event.eventId))
                            .map((event) => {
                                const isHidden = hiddenEvents.has(event.eventId);
                                const isPast = event.start_time || event.time || event.datetime || event.date ? 
                                    new Date(event.start_time || event.time || event.datetime || event.date) < new Date() : false;
                                
                                return (
                                    <tr 
                                        key={event.eventId} 
                                        className={isHidden ? 'table-secondary text-muted' : (isPast ? 'table-light' : '')}
                                        style={isHidden ? { opacity: 0.6 } : {}}
                                    >
                                        <td>
                                            <strong>
                                                {formatTime(event.start_time || event.time || event.datetime || event.date)}
                                                {event.end_time && ` - ${formatTime(event.end_time)}`}
                                            </strong>
                                            {isPast && !isHidden && (
                                                <small className="text-muted d-block">Completed</small>
                                            )}
                                            {isHidden && (
                                                <small className="text-muted d-block">Hidden</small>
                                            )}
                                        </td>
                                        <td>
                                            <strong 
                                                style={isHidden ? { textDecoration: 'line-through' } : {}}
                                            >
                                                {event.name.split(":")[0]}
                                            </strong>
                                        </td>
                                        <td style={isHidden ? { textDecoration: 'line-through' } : {}}>
                                            {event.name.split(":")[1] || 'TBD'}
                                        </td>
                                        <td>
                                            <Button
                                                size="sm"
                                                variant={isHidden ? "outline-success" : "outline-danger"}
                                                onClick={() => toggleEventVisibility(event.eventId)}
                                                title={isHidden ? "Show this event" : "Hide this event"}
                                            >
                                                {isHidden ? '👁️' : '🚫'}
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        {sortedEvents.filter(event => !hiddenEvents.has(getEventId(event, sortedEvents.indexOf(event)))).length === 0 && !showHiddenEvents && (
                            <tr>
                                <td colSpan="4" className="text-center text-muted py-3">
                                    All events are hidden. Click "Show Hidden" to see them.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
                {hiddenEvents.size > 0 && (
                    <div className="mt-3 p-3 bg-light rounded">
                        <small className="text-muted">
                            <strong>📋 Event Status:</strong>
                            {hiddenEvents.size} event{hiddenEvents.size !== 1 ? 's' : ''} hidden
                            {showHiddenEvents ? ' (showing with strikethrough)' : ' (use "Show Hidden" to view)'}
                        </small>
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

export default Schedule;