import React from "react"
import { useContext, useEffect, useState } from "react";
import { Table, Button, Card } from "react-bootstrap";
import { navigate } from "gatsby";
import { settingsContext } from "../contexts/settingsContext";
import "../mobile.css";

export default function ScoreTable({teamData, refreshData}){
    const [mutapleTeamData, setMutapleTeamData] = useState([...teamData])
    const [settings, setSettings] = useContext(settingsContext)
    const [divisorHeader, setDivisorHeader] = useState("")
    const [mapIndex, setMapIndex] = useState(0);
    const size = settings.tableSize || 10;
    

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
        let teams = teamData.map((item, index) => {
            let temp = {
                number: item.team_id,
                name: item.team_name,
                scores: item.scores.toString(),
            }
            
            if(item.scores.length > 0){
                let orderScores = [...item.scores].sort((a,b) => a-b).reverse().slice(0, settings.divisor);
                orderScores = orderScores.reduce((a,b) => a+b) / orderScores.length;
                console.log(orderScores)
                temp["average"] = orderScores;
                temp["displayAverage"] = orderScores.toFixed(3)    
            } else {
                temp["average"] = -1
                temp["displayAverage"] = -1
            }
            return temp
        })

        teams = teams.sort(function (a, b){
            return b.average - a.average
        })

        teams = teams.map((item, index) => {
            item["place"] = index + 1
            return item
        })

        console.log(teams)
        
        setMutapleTeamData(
            teams
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

    const handleTeamClick = (teamNumber) => {
        navigate(`/team/${teamNumber}`);
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
                            <td>{item['place']}</td>
                            <td>
                                <Button 
                                    variant="link" 
                                    className="team-number-link"
                                    onClick={() => handleTeamClick(item['number'])}
                                    title={`View details for Team #${item['number']}`}
                                >
                                    #{item['number']}
                                </Button>
                            </td>
                            <td>{item['name']}</td>
                            <td>{item['scores']}</td>
                            <td>{item["displayAverage"]}</td>
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
                                onClick={() => handleTeamClick(item['number'])}
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