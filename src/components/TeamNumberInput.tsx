import React, { useId, useState } from 'react';
import { Form, ListGroup } from 'react-bootstrap';

const MAX_SUGGESTIONS = 8;

interface TeamOption {
    team_id: number;
    team_name: string;
}

interface TeamNumberInputProps {
    teams: TeamOption[];
    value: string;
    onChange: (value: string) => void;
    /** Enter pressed with no suggestion highlighted. */
    onEnter?: () => void;
    id?: string;
    placeholder?: string;
    size?: 'sm' | 'lg';
    /** Applied to the input (the suggestions are positioned against a wrapper around it). */
    className?: string;
    /** Applied to that wrapper. */
    wrapperClassName?: string;
    /** Lets the suggestions be wider than a narrow input. */
    listMinWidth?: string;
}

/** Text input that suggests teams by number or name; picking one fills in its number. */
const TeamNumberInput = ({ teams, value, onChange, onEnter, id, placeholder, size, className, wrapperClassName, listMinWidth }: TeamNumberInputProps) => {
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const listId = useId();

    const query = value.trim().toLowerCase();
    const startsWithQuery = (team: TeamOption) => (String(team.team_id).startsWith(query) ? 0 : 1);
    const matches = open && query
        ? teams
            .filter((team) => String(team.team_id).includes(query) || team.team_name.toLowerCase().includes(query))
            .sort((a, b) => startsWithQuery(a) - startsWithQuery(b) || a.team_id - b.team_id)
            .slice(0, MAX_SUGGESTIONS)
        : [];

    const close = () => {
        setOpen(false);
        setActiveIndex(-1);
    };

    const pick = (team: TeamOption) => {
        onChange(String(team.team_id));
        close();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !matches[activeIndex]) {
            onEnter?.();
            return;
        }
        if (matches.length === 0) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((activeIndex + 1) % matches.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(activeIndex <= 0 ? matches.length - 1 : activeIndex - 1);
        } else if (e.key === 'Escape') {
            close();
        } else if (e.key === 'Enter') {
            e.preventDefault(); // fill in the team rather than submit the form
            pick(matches[activeIndex]);
        }
    };

    return (
        <div className={`position-relative ${wrapperClassName ?? ''}`}>
            <Form.Control
                id={id}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder={placeholder}
                size={size}
                className={className}
                value={value}
                onChange={(e) => {
                    onChange(e.target.value);
                    setOpen(true);
                    setActiveIndex(-1);
                }}
                onFocus={() => setOpen(true)}
                onBlur={close}
                onKeyDown={handleKeyDown}
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={matches.length > 0}
                aria-controls={matches.length > 0 ? listId : undefined}
            />
            {matches.length > 0 && (
                <ListGroup
                    id={listId}
                    role="listbox"
                    className="position-absolute w-100 shadow"
                    style={{ zIndex: 1000, minWidth: listMinWidth }}
                >
                    {matches.map((team, index) => (
                        <ListGroup.Item
                            key={team.team_id}
                            action
                            type="button"
                            role="option"
                            tabIndex={-1}
                            active={index === activeIndex}
                            aria-selected={index === activeIndex}
                            // mousedown, not click: keeps focus in the input so onBlur doesn't close the list first
                            onMouseDown={(e: React.MouseEvent) => {
                                e.preventDefault();
                                pick(team);
                            }}
                        >
                            <strong>{team.team_id}</strong> {team.team_name}
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            )}
        </div>
    );
};

export default TeamNumberInput;
