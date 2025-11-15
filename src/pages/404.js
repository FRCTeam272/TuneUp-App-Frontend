import * as React from "react"
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { navigate } from 'gatsby';
import '../App.css';
import '../mobile.css';

const NotFoundPage = () => {
  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      navigate('/');
    }
  };

  return (
    <Container className="mt-3 mt-md-5">
      <Row className="justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6}>
          <div className="text-center mb-4 mb-md-5">
            <div className="mb-4">
              <span style={{ fontSize: '6rem' }} role="img" aria-label="Robot">🤖</span>
            </div>
            <h1 className="display-5 display-md-4 mb-3">404 - Page Not Found</h1>
            <p className="lead text-muted">
              Oops! The page you're looking for seems to have wandered off the competition field.
            </p>
          </div>

          <Card className="shadow-sm mb-4">
            <Card.Body className="p-4 text-center">
              <Card.Title className="h4 mb-3">
                🔍 What happened?
              </Card.Title>
              <Card.Text className="text-muted mb-4">
                The page you requested doesn't exist or may have been moved. This could happen if:
              </Card.Text>
              <ul className="list-unstyled text-muted text-start">
                <li className="mb-2">• The URL was typed incorrectly</li>
                <li className="mb-2">• The page has been removed or renamed</li>
                <li className="mb-2">• You followed a broken link</li>
                <li className="mb-2">• The team number doesn't exist in the system</li>
              </ul>
            </Card.Body>
          </Card>

          <Row className="g-3">
            <Col xs={12} sm={6}>
              <Card className="h-100 shadow-sm">
                <Card.Body className="d-flex flex-column text-center p-4">
                  <Card.Title className="h5 mb-3">
                    🏠 Go Home
                  </Card.Title>
                  <Card.Text className="text-muted mb-4 flex-grow-1">
                    Return to the main menu to access the scoreboard and admin functions
                  </Card.Text>
                  <Button 
                    variant="primary"
                    size="lg"
                    className="projector-button w-100"
                    onClick={handleGoHome}
                  >
                    Main Menu
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card className="h-100 shadow-sm">
                <Card.Body className="d-flex flex-column text-center p-4">
                  <Card.Title className="h5 mb-3">
                    ↩️ Go Back
                  </Card.Title>
                  <Card.Text className="text-muted mb-4 flex-grow-1">
                    Return to the previous page you were viewing
                  </Card.Text>
                  <Button 
                    variant="secondary"
                    size="lg"
                    className="projector-button w-100"
                    onClick={handleGoBack}
                  >
                    Previous Page
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <div className="mt-5">
            <Card className="shadow-sm">
              <Card.Body className="p-4 text-center">
                <Card.Title className="h5 mb-3">
                  🏆 Quick Access
                </Card.Title>
                <Card.Text className="text-muted mb-4">
                  Jump directly to commonly used pages
                </Card.Text>
                <div className="d-grid gap-2 d-md-block">
                  <Button 
                    variant="outline-primary"
                    className="me-md-2 mb-2 mb-md-0"
                    onClick={() => navigate('/scoreboard')}
                  >
                    Live Scoreboard
                  </Button>
                  <Button 
                    variant="outline-secondary"
                    className="me-md-2 mb-2 mb-md-0"
                    onClick={() => navigate('/admin')}
                  >
                    Admin Panel
                  </Button>
                  <Button 
                    variant="outline-success"
                    onClick={() => navigate('/health')}
                  >
                    System Health
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </div>

          <div className="text-center mt-5">
            <small className="text-muted">
              FLL Scoreboard - Competition Management System
            </small>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFoundPage;

export const Head = () => <title>404 - Page Not Found | FLL Scoreboard</title>