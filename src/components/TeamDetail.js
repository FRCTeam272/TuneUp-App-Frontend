import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Row, Col, ProgressBar } from 'react-bootstrap';

const TeamDetail = ({ teamData, divisor = 3 }) => {
    const [processedData, setProcessedData] = useState({});

    useEffect(() => {
        if (teamData) {
            console.log('TeamData received:', teamData); // Debug log
            
            const scores = teamData.scores || [];
            const sortedScores = [...scores].sort((a, b) => b - a);
            const topScores = teamData.top_three_scores || sortedScores.slice(0, divisor);
            const average = teamData.average_top_three || 
                (topScores.length > 0 ? topScores.reduce((a, b) => a + b, 0) / topScores.length : 0);
            
            const processed = {
                teamNumber: teamData.team_id,
                teamName: teamData.team_name,
                allScores: scores,
                sortedScores: sortedScores,
                topScores: topScores,
                average: average,
                highestScore: scores.length > 0 ? Math.max(...scores) : 0,
                lowestScore: scores.length > 0 ? Math.min(...scores) : 0,
                totalRounds: scores.length,
                improvementTrend: calculateTrend(scores)
            };
            
            console.log('Processed data:', processed); // Debug log
            setProcessedData(processed);
        }
    }, [teamData, divisor]);

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
        const percentage = (score / maxScore) * 100;
        if (percentage >= 90) return '#27ae60';
        if (percentage >= 75) return '#f39c12';
        if (percentage >= 50) return '#e67e22';
        return '#e74c3c';
    };

    if (!processedData.teamNumber) {
        return <div>Loading team details...</div>;
    }

    const maxScore = processedData.highestScore || 100;

    return (
        <div className="team-detail-container">
            {/* Team Header */}
            <Card className="mb-4 projector-card">
                <Card.Header className="projector-card-header">
                    <Row>
                        <Col md={8}>
                            <h1 className="mb-0">Team #{processedData.teamNumber}</h1>
                            <h3 className="text-light">{processedData.teamName}</h3>
                        </Col>
                        <Col md={4} className="text-end">
                            {getTrendBadge(processedData.improvementTrend)}
                        </Col>
                    </Row>
                </Card.Header>
                <Card.Body className="projector-card-body">
                    <Row>
                        <Col md={3}>
                            <div className="stat-box">
                                <h4>Current Average</h4>
                                <div className="stat-value">{processedData.average.toFixed(1)}</div>
                                <small>Top {processedData.topScores ? processedData.topScores.length : divisor} scores</small>
                            </div>
                        </Col>
                        <Col md={3}>
                            <div className="stat-box">
                                <h4>Highest Score</h4>
                                <div className="stat-value text-success">{processedData.highestScore}</div>
                                <small>Best performance</small>
                            </div>
                        </Col>
                        <Col md={3}>
                            <div className="stat-box">
                                <h4>Total Rounds</h4>
                                <div className="stat-value">{processedData.totalRounds}</div>
                                <small>Rounds completed</small>
                            </div>
                        </Col>
                        <Col md={3}>
                            <div className="stat-box">
                                <h4>Lowest Score</h4>
                                <div className="stat-value text-warning">{processedData.lowestScore}</div>
                                <small>Room for improvement</small>
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Score History Table */}
            <Card className="mb-4 projector-card">
                <Card.Header className="projector-card-header">
                    <h3 className="mb-0">📊 Score History</h3>
                </Card.Header>
                <Card.Body className="projector-card-body">
                    {processedData.allScores.length > 0 ? (
                        <Table className="projector-table">
                            <thead>
                                <tr>
                                    <th>Round</th>
                                    <th>Score</th>
                                    <th>Progress</th>
                                    <th>Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {processedData.allScores.map((score, index) => (
                                    <tr key={index}>
                                        <td>#{index + 1}</td>
                                        <td>
                                            <strong style={{ color: getScoreColor(score, maxScore) }}>
                                                {score}
                                            </strong>
                                        </td>
                                        <td>
                                            <ProgressBar
                                                now={(score / maxScore) * 100}
                                                style={{ height: '20px' }}
                                                variant={
                                                    score === processedData.highestScore ? 'success' :
                                                    score >= processedData.average ? 'info' : 'warning'
                                                }
                                            />
                                        </td>
                                        <td>
                                            {score === processedData.highestScore && '🏆 Best Score'}
                                            {score === processedData.lowestScore && processedData.allScores.length > 1 && '📉 Lowest'}
                                            {processedData.topScores.includes(score) && score !== processedData.highestScore && '⭐ Top Score'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    ) : (
                        <div className="text-center py-4">
                            <h5>No scores recorded yet</h5>
                            <p>This team hasn't completed any rounds.</p>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Top Scores Breakdown */}
            {processedData.topScores && processedData.topScores.length > 0 && (
                <Card className="projector-card">
                    <Card.Header className="projector-card-header">
                        <h3 className="mb-0">🌟 Top {processedData.topScores.length} Scores (Used for Average)</h3>
                    </Card.Header>
                    <Card.Body className="projector-card-body">
                        <Row>
                            {processedData.topScores.map((score, index) => (
                                <Col md={4} key={index} className="mb-3">
                                    <div className="top-score-box">
                                        <div className="position-badge">#{index + 1}</div>
                                        <div className="score-value">{score}</div>
                                        <div className="score-percentage">
                                            {maxScore > 0 ? ((score / maxScore) * 100).toFixed(1) : '100'}% of best
                                        </div>
                                    </div>
                                </Col>
                            ))}
                        </Row>
                        <hr />
                        <div className="average-calculation">
                            <h5>Average Calculation:</h5>
                            <p>
                                ({processedData.topScores.join(' + ')}) ÷ {processedData.topScores.length} = <strong>{processedData.average.toFixed(2)}</strong>
                            </p>
                        </div>
                    </Card.Body>
                </Card>
            )}
        </div>
    );
};

export default TeamDetail;