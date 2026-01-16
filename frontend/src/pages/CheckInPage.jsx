import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Tab, Tabs } from 'react-bootstrap';
import attendanceService from '../services/attendanceService';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect, useRef } from 'react';

const CheckInPage = () => {
    const [activeTab, setActiveTab] = useState('text');
    const [formData, setFormData] = useState({
        accessCode: '',
        name: '',
        email: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [scannerActive, setScannerActive] = useState(false);
    const scannerRef = useRef(null);

    useEffect(() => {
        if (activeTab === 'qr' && !scannerActive) {
            initQRScanner();
        }

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear();
            }
        };
    }, [activeTab]);

    const initQRScanner = () => {
        try {
            const scanner = new Html5QrcodeScanner('qr-reader', {
                qrbox: { width: 250, height: 250 },
                fps: 5
            });

            scanner.render(
                (decodedText) => {
                    setFormData(prev => ({ ...prev, accessCode: decodedText }));
                    scanner.clear();
                    setScannerActive(false);
                    setActiveTab('text'); // Switch to text tab to complete check-in
                },
                (error) => {
                    // Ignore scan errors
                }
            );

            scannerRef.current = scanner;
            setScannerActive(true);
        } catch (err) {
            setError('Failed to initialize QR scanner. Please use text code instead.');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError(null);
        setSuccess(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.accessCode || !formData.name) {
            setError('Please fill in all required fields');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const method = activeTab === 'qr' ? 'checkInQR' : 'checkInText';
            await attendanceService[method](formData.accessCode, {
                participant_name: formData.name,
                participant_email: formData.email
            });

            setSuccess(true);
            setFormData({ accessCode: '', name: '', email: '' });

            // Reset success message after 5 seconds
            setTimeout(() => setSuccess(false), 5000);
        } catch (err) {
            setError(err.message || 'Check-in failed. Please verify your access code.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md={8} lg={6}>
                    <Card className="shadow-lg border-0 fade-in">
                        <Card.Body className="p-5">
                            <div className="text-center mb-4">
                                <h2 className="fw-bold" style={{ color: 'var(--primary-color)' }}>
                                    Event Check-In
                                </h2>
                                <p className="text-secondary">Confirm your attendance</p>
                            </div>

                            {success && (
                                <Alert variant="success" className="text-center">
                                    <strong>✓ Check-in successful!</strong><br />
                                    Thank you for attending.
                                </Alert>
                            )}

                            {error && (
                                <Alert variant="danger" dismissible onClose={() => setError(null)}>
                                    {error}
                                </Alert>
                            )}

                            <Tabs
                                activeKey={activeTab}
                                onSelect={(k) => setActiveTab(k)}
                                className="mb-4"
                                justify
                            >
                                <Tab eventKey="text" title="📝 Text Code">
                                    <Form onSubmit={handleSubmit}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Access Code *</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="accessCode"
                                                value={formData.accessCode}
                                                onChange={handleChange}
                                                placeholder="Enter event access code"
                                                required
                                                style={{ fontSize: '1.2rem', textAlign: 'center', letterSpacing: '0.1em' }}
                                            />
                                            <Form.Text className="text-muted">
                                                Enter the code provided by the event organizer
                                            </Form.Text>
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label>Your Name *</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="Enter your full name"
                                                required
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-4">
                                            <Form.Label>Email (Optional)</Form.Label>
                                            <Form.Control
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="your.email@example.com"
                                            />
                                        </Form.Group>

                                        <Button
                                            variant="primary"
                                            type="submit"
                                            className="w-100 py-3 fw-bold"
                                            disabled={loading}
                                            size="lg"
                                        >
                                            {loading ? 'Checking in...' : 'Check In'}
                                        </Button>
                                    </Form>
                                </Tab>

                                <Tab eventKey="qr" title="📷 QR Code">
                                    <div className="text-center mb-4">
                                        <p className="text-secondary">
                                            Scan the QR code displayed by the event organizer
                                        </p>
                                    </div>

                                    <div id="qr-reader" className="mb-4"></div>

                                    {formData.accessCode && (
                                        <Form onSubmit={handleSubmit}>
                                            <Alert variant="success">
                                                QR Code scanned! Code: <strong>{formData.accessCode}</strong>
                                            </Alert>

                                            <Form.Group className="mb-3">
                                                <Form.Label>Your Name *</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    placeholder="Enter your full name"
                                                    required
                                                />
                                            </Form.Group>

                                            <Form.Group className="mb-4">
                                                <Form.Label>Email (Optional)</Form.Label>
                                                <Form.Control
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    placeholder="your.email@example.com"
                                                />
                                            </Form.Group>

                                            <Button
                                                variant="primary"
                                                type="submit"
                                                className="w-100 py-3 fw-bold"
                                                disabled={loading}
                                                size="lg"
                                            >
                                                {loading ? 'Checking in...' : 'Complete Check In'}
                                            </Button>
                                        </Form>
                                    )}
                                </Tab>
                            </Tabs>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default CheckInPage;
