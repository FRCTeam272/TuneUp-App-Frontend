import React from "react"
import { useEffect, useState } from "react";
import { Table, Button, Card } from "react-bootstrap";
import { navigate } from "gatsby";
import { useSettings } from "../contexts/settingsContext";
import type { DisplayTeamScoresResponse } from "../api";
import "../mobile.css";

interface ScoreTableProps {
    teamData: DisplayTeamScoresResponse[];
    refreshData: () => void;
}

interface Row {
    number: number;
    name: string;
    /** Comma-separated scores. */
    scores: string;
    /** Average of the top `divisor` scores; -1 without scores. */
    average: number;
    displayAverage: string | number;
    place: number;
}

export default function ScoreTable({teamData, refreshData}: ScoreTableProps){
    const [mutapleTeamData, setMutapleTeamData] = useState<Row[]>([])
    const [settings] = useSettings()
    const [divisorHeader, setDivisorHeader] = useState("")
    const [mapIndex, setMapIndex] = useState(0);
    const size = Number(settings.tableSize) || 10;


    useEffect(() => {
        let temp = ""

        if(settings.divisor <= 1){
            temp = "Top Score"
        }

        else if(settings.divisor >= 999){
            temp = "Average Score"
        }

        else {
            temp = `Average of Top ${settings.divisor} Scores`
        }



        setDivisorHeader(temp);

    }, [settings])

    useEffect(() => {
        const teams = teamData.map((item) => {
            let average = -1
            let displayAverage: string | number = -1
            if(item.scores.length > 0){
                const orderScores = [...item.scores].sort((a,b) => a-b).reverse().slice(0, settings.divisor);
                average = orderScores.reduce((a,b) => a+b) / orderScores.length;
                displayAverage = average.toFixed(3)
            }
            return {
                number: item.team_id,
                name: item.team_name,
                scores: item.scores.toString(),
                average,
                displayAverage,
            }
        })

        teams.sort((a, b) => b.average - a.average)

        setMutapleTeamData(
            teams.map((item, index) => ({ ...item, place: index + 1 }))
        )
    }, [teamData])

    useEffect(() => {
        const timeout = setTimeout(() => {
            let temp = mapIndex + size
            if(temp > mutapleTeamData.length){
                temp = 0
                refreshData()
            }
            setMapIndex(temp)
        }, size * 1e3)
        return () => clearTimeout(timeout)
    }, [mutapleTeamData, mapIndex])

    const handleTeamClick = (teamNumber: number) => {
        navigate(`/team?id=${teamNumber}`);
    };

    const displayData = mutapleTeamData.slice(mapIndex, mapIndex + size);

    return <>
        {/* Desktop/Tablet Table View */}
        <div className="mobile-table-wrapper">
            <Table striped bordered className="projector-table">
                <thead>
                    <tr>
                        <th>Place</th>
                        <th>Team Number</th>
                        <th>Team Name</th>
                        <th>Scores</th>
                        <th>{divisorHeader}</th>
                    </tr>
                </thead>
                <tbody>
                    {displayData.map((item, index) => {
                        return <tr key={index}>
                            <td>{item.place}</td>
                            <td>
                                <Button
                                    variant="link"
                                    className="team-number-link"
                                    onClick={() => handleTeamClick(item.number)}
                                    title={`View details for Team #${item.number}`}
                                >
                                    #{item.number}
                                </Button>
                            </td>
                            <td>{item.name}</td>
                            <td>{item.scores}</td>
                            <td>{item.displayAverage}</td>
                        </tr>
                    })}
                </tbody>
            </Table>
        </div>

        {/* Mobile Card View */}
        <div className="mobile-card-view">
            {displayData.map((item, index) => {
                const rankClass = item.place <= 3 ? `rank-${item.place}` : '';
                return (
                    <Card key={index} className={`mobile-team-card ${rankClass}`}>
                        <Card.Body>
                            <div className="mobile-team-header">
                                <div>
                                    <h3 className="mobile-team-number">#{item.number}</h3>
                                    <div className="mobile-team-name">{item.name}</div>
                                </div>
                                <div className="mobile-team-rank">#{item.place}</div>
                            </div>

                            <div className="mobile-team-stats">
                                <div className="mobile-stat">
                                    <div className="mobile-stat-label">Average Score</div>
                                    <div className="mobile-stat-value">{item.displayAverage}</div>
                                </div>
                                <div className="mobile-stat">
                                    <div className="mobile-stat-label">Total Scores</div>
                                    <div className="mobile-stat-value">{item.scores ? item.scores.split(',').length : 0}</div>
                                </div>
                            </div>

                            <div className="mobile-team-stats" style={{gridTemplateColumns: '1fr'}}>
                                <div className="mobile-stat">
                                    <div className="mobile-stat-label">Recent Scores</div>
                                    <div className="mobile-stat-value" style={{fontSize: '0.9rem', wordBreak: 'break-all'}}>
                                        {item.scores ? item.scores.split(',').slice(-3).join(', ') + (item.scores.split(',').length > 3 ? '...' : '') : 'None'}
                                    </div>
                                </div>
                            </div>

                            <Button
                                variant="outline-primary"
                                className="mobile-team-button"
                                onClick={() => handleTeamClick(item.number)}
                            >
                                View Team Details
                            </Button>
                        </Card.Body>
                    </Card>
                );
            })}
        </div>
    </>
}
