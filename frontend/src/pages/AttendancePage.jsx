import { useState, useEffect } from 'react';
import { Container, Card, Button, Form, InputGroup } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import attendanceService from '../services/attendanceService';
import eventService from '../services/eventService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import { formatDate } from '../utils/formatters';

const AttendancePage = () => {
    const { eventId } = useParams();
    const [event, setEvent] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [filteredAttendance, setFilteredAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterMethod, setFilterMethod] = useState('ALL');

    useEffect(() => {
        fetchData();
    }, [eventId]);

    useEffect(() => {
        filterAttendance();
    }, [searchTerm, filterMethod, attendance]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [eventData, attendanceData] = await Promise.all([
                eventService.getEvent(eventId),
                attendanceService.getAttendance(eventId)
            ]);
            setEvent(eventData);
            setAttendance(attendanceData);
            setFilteredAttendance(attendanceData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const filterAttendance = () => {
        let filtered = [...attendance];

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(record =>
                record.participant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (record.participant_email && record.participant_email.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Filter by method
        if (filterMethod !== 'ALL') {
            filtered = filtered.filter(record => record.check_in_method === filterMethod);
        }

        setFilteredAttendance(filtered);
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
            <Link to={`/events/${eventId}`} className="text-decoration-none text-secondary mb-3 d-inline-block">
                ← Back to Event
            </Link>

            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="fw-bold">Attendance - {event.name}</h1>
                    <p className="text-secondary mb-0">
                        {filteredAttendance.length} of {attendance.length} participants
                    </p>
                </div>
                <div className="d-flex gap-2">
                    <Button variant="outline-primary" onClick={handleExportCSV}>
                        Export CSV
                    </Button>
                    <Button variant="outline-success" onClick={handleExportXLSX}>
                        Export XLSX
                    </Button>
                </div>
            </div>

            {error && <ErrorAlert message={error} />}

            {/* Filters */}
            <Card className="mb-4 border-0">
                <Card.Body>
                    <div className="row g-3">
                        <div className="col-md-8">
                            <InputGroup>
                                <InputGroup.Text>🔍</InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>
                        </div>
                        <div className="col-md-4">
                            <Form.Select
                                value={filterMethod}
                                onChange={(e) => setFilterMethod(e.target.value)}
                            >
                                <option value="ALL">All Methods</option>
                                <option value="TEXT">Text Code Only</option>
                                <option value="QR">QR Code Only</option>
                            </Form.Select>
                        </div>
                    </div>
                </Card.Body>
            </Card>

            {/* Attendance Table */}
            <Card className="border-0">
                <Card.Body>
                    {filteredAttendance.length === 0 ? (
                        <div className="text-center py-5">
                            <p className="text-secondary">
                                {attendance.length === 0 ? 'No check-ins yet' : 'No results found'}
                            </p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Method</th>
                                        <th>Check-in Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAttendance.map((record, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td className="fw-bold">{record.participant_name}</td>
                                            <td>{record.participant_email || 'N/A'}</td>
                                            <td>
                                                <span className={`badge ${record.check_in_method === 'QR' ? 'bg-success' : 'bg-primary'}`}>
                                                    {record.check_in_method === 'QR' ? '📷 QR' : '📝 Text'}
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

export default AttendancePage;
