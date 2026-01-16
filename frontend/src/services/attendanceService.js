import api from './api';

/**
 * Check in using text code
 */
export const checkInText = async (accessCode, participantData) => {
    const response = await api.post('/attendance/check-in/text', {
        access_code: accessCode,
        ...participantData
    });
    return response.data;
};

/**
 * Check in using QR code
 */
export const checkInQR = async (accessCode, participantData) => {
    const response = await api.post('/attendance/check-in/qr', {
        access_code: accessCode,
        ...participantData
    });
    return response.data;
};

/**
 * Get attendance list for an event
 */
export const getAttendance = async (eventId) => {
    const response = await api.get(`/events/${eventId}/attendance`);
    return response.data;
};

/**
 * Export attendance to CSV
 */
export const exportCSV = async (eventId) => {
    const response = await api.get(`/events/${eventId}/attendance/export/csv`, {
        responseType: 'blob'
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `attendance-${eventId}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    return response.data;
};

/**
 * Export attendance to XLSX
 */
export const exportXLSX = async (eventId) => {
    const response = await api.get(`/events/${eventId}/attendance/export/xlsx`, {
        responseType: 'blob'
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `attendance-${eventId}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    return response.data;
};

const attendanceService = {
    checkInText,
    checkInQR,
    getAttendance,
    exportCSV,
    exportXLSX
};

export default attendanceService;
