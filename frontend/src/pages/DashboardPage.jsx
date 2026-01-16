import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import eventGroupService from '../services/eventGroupService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';

const DashboardPage = () => {
    const { user } = useAuth();
    const [eventGroups, setEventGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        totalGroups: 0,
        totalEvents: 0,
        activeEvents: 0
    });

    useEffect(() => {
        fetchEventGroups();
    }, []);

    const fetchEventGroups = async () => {
        try {
            setLoading(true);
            const data = await eventGroupService.getEventGroups();
            setEventGroups(data);

            // Calculate stats
            const totalEvents = data.reduce((sum, group) => sum + (group.events?.length || 0), 0);
            const activeEvents = data.reduce((sum, group) => {
                const active = group.events?.filter(e => e.state === 'OPEN').length || 0;
                return sum + active;
            }, 0);

            setStats({
                totalGroups: data.length,
                totalEvents,
                activeEvents
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <Container className="py-4">
            <div className="mb-4">
                <h1 className="fw-bold">Welcome back, {user?.name}! 👋</h1>
                <p className="text-secondary">Manage your events and track attendance</p>
            </div>

            {error && <ErrorAlert message={error} />}

            {/* Stats Cards */}
            <Row className="mb-4">
                <Col md={4} className="mb-3">
                    <Card className="card-hover border-0 h-100">
                        <Card.Body className="text-center">
                            <div className="display-4 fw-bold" style={{ color: 'var(--primary-color)' }}>
                                {stats.totalGroups}
                            </div>
                            <h5 className="text-secondary mt-2">Event Groups</h5>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4} className="mb-3">
                    <Card className="card-hover border-0 h-100">
                        <Card.Body className="text-center">
                            <div className="display-4 fw-bold" style={{ color: 'var(--secondary-color)' }}>
                                {stats.totalEvents}
                            </div>
                            <h5 className="text-secondary mt-2">Total Events</h5>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4} className="mb-3">
                    <Card className="card-hover border-0 h-100">
                        <Card.Body className="text-center">
                            <div className="display-4 fw-bold" style={{ color: 'var(--warning-color)' }}>
                                {stats.activeEvents}
                            </div>
                            <h5 className="text-secondary mt-2">Active Events</h5>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Quick Actions */}
            <Card className="mb-4 border-0">
                <Card.Header className="bg-white border-0 pt-4">
                    <h4 className="mb-0">Quick Actions</h4>
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col md={6} className="mb-3">
                            <Button
                                as={Link}
                                to="/event-groups"
                                variant="primary"
                                className="w-100 py-3"
                                size="lg"
                            >
                                📁 Manage Event Groups
                            </Button>
                        </Col>
                        <Col md={6} className="mb-3">
                            <Button
                                as={Link}
                                to="/check-in"
                                variant="success"
                                className="w-100 py-3"
                                size="lg"
                            >
                                ✅ Check-In Portal
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Recent Event Groups */}
            <Card className="border-0">
                <Card.Header className="bg-white border-0 pt-4">
                    <div className="d-flex justify-content-between align-items-center">
                        <h4 className="mb-0">Recent Event Groups</h4>
                        <Button as={Link} to="/event-groups" variant="outline-primary" size="sm">
                            View All
                        </Button>
                    </div>
                </Card.Header>
                <Card.Body>
                    {eventGroups.length === 0 ? (
                        <div className="text-center py-5">
                            <p className="text-secondary mb-3">No event groups yet</p>
                            <Button as={Link} to="/event-groups" variant="primary">
                                Create Your First Event Group
                            </Button>
                        </div>
                    ) : (
                        <Row>
                            {eventGroups.slice(0, 3).map(group => (
                                <Col md={4} key={group.id} className="mb-3">
                                    <Card className="card-hover h-100">
                                        <Card.Body>
                                            <h5 className="fw-bold">{group.name}</h5>
                                            <p className="text-secondary small">{group.description}</p>
                                            <div className="d-flex justify-content-between align-items-center mt-3">
                                                <span className="badge bg-primary">
                                                    {group.events?.length || 0} Events
                                                </span>
                                                <Button
                                                    as={Link}
                                                    to={`/event-groups/${group.id}`}
                                                    variant="outline-primary"
                                                    size="sm"
                                                >
                                                    View
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default DashboardPage;
