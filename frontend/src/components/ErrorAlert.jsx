import { Alert } from 'react-bootstrap';
import { useState } from 'react';

const ErrorAlert = ({ message, variant = 'danger', dismissible = true }) => {
    const [show, setShow] = useState(true);

    if (!show || !message) return null;

    return (
        <Alert
            variant={variant}
            onClose={() => setShow(false)}
            dismissible={dismissible}
            className="fade-in"
        >
            {message}
        </Alert>
    );
};

export default ErrorAlert;
