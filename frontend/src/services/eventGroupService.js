import api from './api';

/**
 * Get all event groups for the authenticated user
 */
export const getEventGroups = async () => {
    const response = await api.get('/event-groups');
    return response.data;
};

/**
 * Get a single event group by ID
 */
export const getEventGroup = async (id) => {
    const response = await api.get(`/event-groups/${id}`);
    return response.data;
};

/**
 * Create a new event group
 */
export const createEventGroup = async (data) => {
    const response = await api.post('/event-groups', data);
    return response.data;
};

/**
 * Update an event group
 */
export const updateEventGroup = async (id, data) => {
    const response = await api.put(`/event-groups/${id}`, data);
    return response.data;
};

/**
 * Delete an event group
 */
export const deleteEventGroup = async (id) => {
    const response = await api.delete(`/event-groups/${id}`);
    return response.data;
};

const eventGroupService = {
    getEventGroups,
    getEventGroup,
    createEventGroup,
    updateEventGroup,
    deleteEventGroup
};

export default eventGroupService;
