import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Tab, Tabs } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import eventService from '../services/eventService';
import attendanceService from '../services/attendanceService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import { formatDate } from '../utils/formatters';

const EventDetailPage = () => {
    const { eventId } = useParams();
    const [event, setEvent] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, [eventId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [eventData, attendanceData] = await Promise.all([
                eventService.getEvent(eventId),
                attendanceService.getAttendance(eventId)
            ]);
            setEvent(eventData);
            setAttendance(attendanceData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleState = async () => {
        try {
            await eventService.toggleEventState(eventId);
            fetchData();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleExportCSV = async () => {
        try {
            await attendanceService.exportCSV(eventId);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleExportXLSX = async () => {
        try {
            await attendanceService.exportXLSX(eventId);
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <LoadingSpinner />;
    if (!event) return <ErrorAlert message="Event not found" />;

    return (
        <Container className="py-4">
            <Link to={`/event-groups/${event.event_group_id}`} className="text-decoration-none text-secondary mb-3 d-inline-block">
                ← Back to Event Group
            </Link>

            {error && <ErrorAlert message={error} />}

            <Row className="mb-4">
                <Col lg={8}>
                    <Card className="border-0 mb-4">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                    <h1 className="fw-bold mb-2">{event.name}</h1>
                                    <p className="text-secondary">{event.description || 'No description'}</p>
                                </div>
                                <span className={event.state === 'OPEN' ? 'badge-open' : 'badge-closed'}>
                                    {event.state}
                                </span>
                            </div>

                            <Row className="mb-3">
                                <Col md={6}>
                                    <small className="text-secondary d-block">
                                        <strong>Start:</strong> {formatDate(event.start_date)}
                                    </small>
                                </Col>
                                <Col md={6}>
                                    <small className="text-secondary d-block">
                                        <strong>End:</strong> {formatDate(event.end_date)}
                                    </small>
                                </Col>
                            </Row>

                            <div className="d-flex gap-2">
                                <Button
                                    variant={event.state === 'OPEN' ? 'warning' : 'success'}
                                    onClick={handleToggleState}
                                >
                                    {event.state === 'OPEN' ? 'Close Event' : 'Open Event'}
                                </Button>
                                <Button variant="outline-primary" onClick={handleExportCSV}>
                                    Export CSV
                                </Button>
                                <Button variant="outline-success" onClick={handleExportXLSX}>
                                    Export XLSX
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={4}>
                    <Card className="border-0 mb-4">
                        <Card.Header className="bg-white">
                            <h5 className="mb-0">Access Code</h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="access-code mb-3">
                                {event.access_code}
                            </div>
                            <small className="text-secondary">Share this code with participants</small>
                        </Card.Body>
                    </Card>

                    {event.qr_code_url && (
                        <Card className="border-0">
                            <Card.Header className="bg-white">
                                <h5 className="mb-0">QR Code</h5>
                            </Card.Header>
                            <Card.Body className="text-center">
                                <img
                                    src={event.qr_code_url}
                                    alt="QR Code"
                                    className="img-fluid"
                                    style={{ maxWidth: '250px', border: '3px solid var(--primary-color)', borderRadius: '8px', padding: '10px' }}
                                />
                                <p className="text-secondary small mt-2">Scan to check in</p>
                            </Card.Body>
                        </Card>
                    )}
                </Col>
            </Row>

            {/* Attendance Section */}
            <Card className="border-0">
                <Card.Header className="bg-white">
                    <h4 className="mb-0">Attendance ({attendance.length})</h4>
                </Card.Header>
                <Card.Body>
                    {attendance.length === 0 ? (
                        <div className="text-center py-4">
                            <p className="text-secondary">No check-ins yet</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Method</th>
                                        <th>Check-in Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendance.map((record, index) => (
                                        <tr key={index}>
                                            <td className="fw-bold">{record.participant_name}</td>
                                            <td>{record.participant_email || 'N/A'}</td>
                                            <td>
                                                <span className={`badge ${record.check_in_method === 'QR' ? 'bg-success' : 'bg-primary'}`}>
                                                    {record.check_in_method}
                                                </span>
                                            </td>
                                            <td>{formatDate(record.checked_in_at)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default EventDetailPage;
