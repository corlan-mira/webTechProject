import { Spinner } from 'react-bootstrap';

const LoadingSpinner = ({ message = 'Loading...' }) => {
    return (
        <div className="spinner-container">
            <div className="text-center">
                <Spinner animation="border" role="status" variant="primary" style={{ width: '3rem', height: '3rem' }}>
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-3 text-secondary">{message}</p>
            </div>
        </div>
    );
};

export default LoadingSpinner;
