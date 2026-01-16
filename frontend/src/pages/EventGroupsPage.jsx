import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import eventGroupService from '../services/eventGroupService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import { formatDate } from '../utils/formatters';

const EventGroupsPage = () => {
    const [eventGroups, setEventGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });

    useEffect(() => {
        fetchEventGroups();
    }, []);

    const fetchEventGroups = async () => {
        try {
            setLoading(true);
            const data = await eventGroupService.getEventGroups();
            setEventGroups(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleShowModal = (group = null) => {
        if (group) {
            setEditingGroup(group);
            setFormData({ name: group.name, description: group.description || '' });
        } else {
            setEditingGroup(null);
            setFormData({ name: '', description: '' });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingGroup(null);
        setFormData({ name: '', description: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingGroup) {
                await eventGroupService.updateEventGroup(editingGroup.id, formData);
            } else {
                await eventGroupService.createEventGroup(formData);
            }
            handleCloseModal();
            fetchEventGroups();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this event group?')) {
            try {
                await eventGroupService.deleteEventGroup(id);
                fetchEventGroups();
            } catch (err) {
                setError(err.message);
            }
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <Container className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="fw-bold">Event Groups</h1>
                    <p className="text-secondary">Organize your events into groups</p>
                </div>
                <Button variant="primary" onClick={() => handleShowModal()}>
                    + Create Event Group
                </Button>
            </div>

            {error && <ErrorAlert message={error} />}

            {eventGroups.length === 0 ? (
                <Card className="text-center py-5 border-0">
                    <Card.Body>
                        <h3 className="text-secondary mb-3">No event groups yet</h3>
                        <p className="text-secondary mb-4">Create your first event group to get started</p>
                        <Button variant="primary" onClick={() => handleShowModal()}>
                            Create Event Group
                        </Button>
                    </Card.Body>
                </Card>
            ) : (
                <Row>
                    {eventGroups.map(group => (
                        <Col md={6} lg={4} key={group.id} className="mb-4">
                            <Card className="card-hover h-100 border-0">
                                <Card.Body>
                                    <h4 className="fw-bold mb-2">{group.name}</h4>
                                    <p className="text-secondary mb-3">{group.description || 'No description'}</p>

                                    <div className="mb-3">
                                        <span className="badge bg-primary me-2">
                                            {group.events?.length || 0} Events
                                        </span>
                                        <span className="badge bg-success">
                                            {group.events?.filter(e => e.state === 'OPEN').length || 0} Active
                                        </span>
                                    </div>

                                    <small className="text-secondary d-block mb-3">
                                        Created: {formatDate(group.createdAt)}
                                    </small>

                                    <div className="d-flex gap-2">
                                        <Button
                                            as={Link}
                                            to={`/event-groups/${group.id}`}
                                            variant="primary"
                                            size="sm"
                                            className="flex-grow-1"
                                        >
                                            View Events
                                        </Button>
                                        <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            onClick={() => handleShowModal(group)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => handleDelete(group.id)}
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

            {/* Create/Edit Modal */}
            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{editingGroup ? 'Edit' : 'Create'} Event Group</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Group Name *</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Conference 2024"
                                required
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Optional description..."
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                            {editingGroup ? 'Update' : 'Create'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default EventGroupsPage;
