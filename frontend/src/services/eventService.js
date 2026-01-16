import api from './api';

/**
 * Get all events for a specific event group
 */
export const getEvents = async (groupId) => {
    const response = await api.get(`/event-groups/${groupId}/events`);
    return response.data;
};

/**
 * Get a single event by ID
 */
export const getEvent = async (eventId) => {
    const response = await api.get(`/events/${eventId}`);
    return response.data;
};

/**
 * Create a new event in a group
 */
export const createEvent = async (groupId, data) => {
    const response = await api.post(`/event-groups/${groupId}/events`, data);
    return response.data;
};

/**
 * Update an event
 */
export const updateEvent = async (eventId, data) => {
    const response = await api.put(`/events/${eventId}`, data);
    return response.data;
};

/**
 * Delete an event
 */
export const deleteEvent = async (eventId) => {
    const response = await api.delete(`/events/${eventId}`);
    return response.data;
};

/**
 * Toggle event state (OPEN/CLOSED)
 */
export const toggleEventState = async (eventId) => {
    const response = await api.patch(`/events/${eventId}/toggle-state`);
    return response.data;
};

const eventService = {
    getEvents,
    getEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    toggleEventState
};

export default eventService;
