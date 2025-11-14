import React from 'react';
import { Card, Table, Badge } from 'react-bootstrap';

const Schedule = ({ scheduleData, teamName, roomNumber }) => {
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
                <h4>📅 Schedule for {teamName}</h4>
                <h5>Room {roomNumber}</h5>
            </Card.Header>
            <Card.Body>
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Session</th>
                            <th>Location</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedEvents.map((event, index) => {
                            return (
                                <tr key={index}>
                                    <td>
                                        <strong>
                                            {formatTime(event.start_time || event.time || event.datetime || event.date)}
                                            {event.end_time && ` - ${formatTime(event.end_time)}`}
                                        </strong>
                                    </td>
                                    <td>
                                        <strong>{event.name.split(":")[0]}</strong>
                                    </td>
                                    <td>{event.name.split(":")[1] || 'TBD'}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            </Card.Body>
        </Card>
    );
};

export default Schedule;