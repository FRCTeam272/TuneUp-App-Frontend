import React, { useEffect, useState } from 'react';
import { Alert, Button, Modal, Spinner, Table } from 'react-bootstrap';
import { errorMessage, teamApi, type TeamContactResponse } from '../api';

interface TeamContactModalProps {
    show: boolean;
    onHide: () => void;
    teamId: number;
    teamName: string;
    /** Admin password; the backend rejects the request without it. */
    password: string;
}

/** Admin-only popup with a team's contact person, fetched each time it opens (never cached). */
const TeamContactModal = ({ show, onHide, teamId, teamName, password }: TeamContactModalProps) => {
    const [contact, setContact] = useState<TeamContactResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!show) return;
        let current = true; // ignore a response that arrives after the modal closed
        setContact(null);
        setError(null);
        teamApi.getContact(teamId, password)
            .then((data) => current && setContact(data))
            .catch((err) => current && setError(errorMessage(err)));
        return () => {
            current = false;
        };
    }, [show, teamId, password]);

    const hasContact = !!(contact && (contact.contact_name || contact.email || contact.phone));

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>📇 Contact for {teamName}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger" className="mb-0">Couldn't load contact info: {error}</Alert>}
                {!error && !contact && (
                    <div className="text-center"><Spinner animation="border" size="sm" /> Loading…</div>
                )}
                {contact && !hasContact && <p className="mb-0 text-muted">No contact info on file for this team.</p>}
                {contact && hasContact && (
                    <Table borderless size="sm" className="mb-0">
                        <tbody>
                            <tr>
                                <th style={{ width: '6rem' }}>Name</th>
                                <td>{contact.contact_name || '—'}</td>
                            </tr>
                            <tr>
                                <th>Email</th>
                                <td>{contact.email ? <a href={`mailto:${contact.email}`}>{contact.email}</a> : '—'}</td>
                            </tr>
                            <tr>
                                <th>Phone</th>
                                <td>{contact.phone ? <a href={`tel:${contact.phone.replace(/[^\d+]/g, '')}`}>{contact.phone}</a> : '—'}</td>
                            </tr>
                        </tbody>
                    </Table>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default TeamContactModal;
