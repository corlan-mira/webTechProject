import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import eventGroupService from '../services/eventGroupService';
import eventService from '../services/eventService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import { formatDate } from '../utils/formatters';

const EventGroupDetailPage = () => {
    const { groupId } = useParams();
    const [group, setGroup] = useState(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        start_date: '',
        end_date: ''
    });

    useEffect(() => {
        fetchData();
    }, [groupId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [groupData, eventsData] = await Promise.all([
                eventGroupService.getEventGroup(groupId),
                eventService.getEvents(groupId)
            ]);
            setGroup(groupData);
            setEvents(eventsData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await eventService.createEvent(groupId, formData);
            setShowModal(false);
            setFormData({ name: '', description: '', start_date: '', end_date: '' });
            fetchData();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async (eventId) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                await eventService.deleteEvent(eventId);
                fetchData();
            } catch (err) {
                setError(err.message);
            }
        }
    };

    const handleToggleState = async (eventId) => {
        try {
            await eventService.toggleEventState(eventId);
            fetchData();
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <LoadingSpinner />;
    if (!group) return <ErrorAlert message="Event group not found" />;

    return (
        <Container className="py-4">
            <div className="mb-4">
                <Link to="/event-groups" className="text-decoration-none text-secondary mb-2 d-inline-block">
                    ← Back to Event Groups
                </Link>
                <div className="d-flex justify-content-between align-items-start">
                    <div>
                        <h1 className="fw-bold">{group.name}</h1>
                        <p className="text-secondary">{group.description || 'No description'}</p>
                    </div>
                    <Button variant="primary" onClick={() => setShowModal(true)}>
                        + Create Event
                    </Button>
                </div>
            </div>

            {error && <ErrorAlert message={error} />}

            {events.length === 0 ? (
                <Card className="text-center py-5 border-0">
                    <Card.Body>
                        <h3 className="text-secondary mb-3">No events yet</h3>
                        <p className="text-secondary mb-4">Create your first event in this group</p>
                        <Button variant="primary" onClick={() => setShowModal(true)}>
                            Create Event
                        </Button>
                    </Card.Body>
                </Card>
            ) : (
                <Row>
                    {events.map(event => (
                        <Col md={6} lg={4} key={event.id} className="mb-4">
                            <Card className="card-hover h-100 border-0">
                                <Card.Body>
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <h5 className="fw-bold">{event.name}</h5>
                                        <span className={event.state === 'OPEN' ? 'badge-open' : 'badge-closed'}>
                                            {event.state}
                                        </span>
                                    </div>

                                    <p className="text-secondary small mb-3">{event.description || 'No description'}</p>

                                    <div className="mb-3">
                                        <small className="text-secondary d-block">
                                            <strong>Start:</strong> {formatDate(event.start_date)}
                                        </small>
                                        <small className="text-secondary d-block">
                                            <strong>End:</strong> {formatDate(event.end_date)}
                                        </small>
                                    </div>

                                    <div className="access-code mb-3" style={{ fontSize: '1.2rem', padding: '0.5rem' }}>
                                        {event.access_code}
                                    </div>

                                    <div className="d-flex gap-2 flex-wrap">
                                        <Button
                                            as={Link}
                                            to={`/events/${event.id}`}
                                            variant="primary"
                                            size="sm"
                                        >
                                            Details
                                        </Button>
                                        <Button
                                            variant={event.state === 'OPEN' ? 'warning' : 'success'}
                                            size="sm"
                                            onClick={() => handleToggleState(event.id)}
                                        >
                                            {event.state === 'OPEN' ? 'Close' : 'Open'}
                                        </Button>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => handleDelete(event.id)}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            {/* Create Event Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Create New Event</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Event Name *</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Opening Session"
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Optional description..."
                            />
                        </Form.Group>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Start Date & Time *</Form.Label>
                                    <Form.Control
                                        type="datetime-local"
                                        value={formData.start_date}
                                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>End Date & Time *</Form.Label>
                                    <Form.Control
                                        type="datetime-local"
                                        value={formData.end_date}
                                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                            Create Event
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default EventGroupDetailPage;
