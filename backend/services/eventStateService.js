'use strict';

const { Event } = require('../models');
const { Op } = require('sequelize');

/
  Event State Service
  Manages automatic event state transitions based on time
  
  State Logic:
  - If now < start_time → CLOSED (not yet started)
  - If start_time <= now < end_time → OPEN (in progress)
  - If now >= end_time → CLOSED (finished)
  
  Where end_time = start_time + (duration_minutes   seconds)
 /

/
  Calculate the appropriate state for an event
  
  @param {Object} event - Event object with start_time and duration_minutes
  @returns {string} - State: 'OPEN' or 'CLOSED'
  
  Example:
   const event = {
     start_time: new Date('--T::Z'),
     duration_minutes: 
   };
   const state = calculateEventState(event);
 /
exports.calculateEventState = (event) => {
  try {
    if (!event || !event.start_time || !event.duration_minutes) {
      console.warn('Invalid event object for state calculation:', event);
      return 'CLOSED';
    }

    const now = new Date();
    const startTime = new Date(event.start_time);
    
    // Calculate end time (start_time + duration_minutes)
    const endTime = new Date(startTime.getTime() + event.duration_minutes    );

    // State logic
    if (now < startTime) {
      // Event hasn't started yet
      return 'CLOSED';
    } else if (now >= startTime && now < endTime) {
      // Event is in progress
      return 'OPEN';
    } else {
      // Event has ended
      return 'CLOSED';
    }
  } catch (error) {
    console.error('Error calculating event state:', error);
    return 'CLOSED';
  }
};

/
  Get events that need state update
  Fetches all events with current state different from calculated state
  
  @returns {Promise<Array>} - Array of Event objects needing update
 /
exports.getEventsNeedingUpdate = async () => {
  try {
    // Fetch all events that are not in DRAFT state
    const events = await Event.findAll({
      where: {
        state: { [Op.ne]: 'DRAFT' }, // Exclude DRAFT events
      },
      attributes: ['id', 'title', 'start_time', 'duration_minutes', 'state'],
    });

    if (!events || events.length === ) {
      return [];
    }

    // Filter events whose calculated state differs from current state
    const eventsNeedingUpdate = events.filter((event) => {
      const calculatedState = exports.calculateEventState(event);
      return calculatedState !== event.state;
    });

    return eventsNeedingUpdate;
  } catch (error) {
    console.error('Error fetching events needing state update:', error);
    return [];
  }
};

/
  Update event state
  Updates a single event's state to the calculated state
  
  @param {string} eventId - Event UUID
  @param {string} newState - New state ('OPEN' or 'CLOSED')
  @returns {Promise<Object>} - Updated event object
  
  @throws {Error} - If event not found or update fails
 /
exports.updateEventState = async (eventId, newState) => {
  try {
    if (!eventId || !newState) {
      throw new Error('Event ID and new state are required');
    }

    if (!['OPEN', 'CLOSED'].includes(newState)) {
      throw new Error(`Invalid state: ${newState}. Must be OPEN or CLOSED.`);
    }

    const event = await Event.findByPk(eventId);
    if (!event) {
      throw new Error(`Event not found: ${eventId}`);
    }

    // Only update if state changed
    if (event.state === newState) {
      return event;
    }

    event.state = newState;
    event.updated_at = new Date();
    await event.save();

    console.log(`✓ Event state updated: ${event.id} → ${newState}`);
    return event;
  } catch (error) {
    console.error('Error updating event state:', error);
    throw error;
  }
};

/
  Batch update events to their calculated states
  Efficiently updates multiple events in a single operation
  
  @param {Array<Object>} eventsToUpdate - Array of objects with { id, state }
  @returns {Promise<Object>} - Update result with count
  
  Example:
   const updates = [
     { id: 'uuid', state: 'OPEN' },
     { id: 'uuid', state: 'CLOSED' }
   ];
   await batchUpdateEventStates(updates);
 /
exports.batchUpdateEventStates = async (eventsToUpdate) => {
  try {
    if (!eventsToUpdate || eventsToUpdate.length === ) {
      return {
        success: true,
        count: ,
        message: 'No events to update',
      };
    }

    let successCount = ;
    let errorCount = ;
    const errors = [];

    // Update each event
    for (const eventUpdate of eventsToUpdate) {
      try {
        const calculatedState = eventUpdate.state;
        
        const result = await Event.update(
          {
            state: calculatedState,
            updated_at: new Date(),
          },
          {
            where: { id: eventUpdate.id },
          }
        );

        if (result[] > ) {
          successCount++;
        }
      } catch (error) {
        errorCount++;
        errors.push({
          eventId: eventUpdate.id,
          error: error.message,
        });
      }
    }

    return {
      success: errorCount === ,
      successCount,
      errorCount,
      errors: errors.length >  ? errors : undefined,
    };
  } catch (error) {
    console.error('Error in batch update:', error);
    throw error;
  }
};

/
  Sync all event states
  Comprehensive operation that:
  . Finds all events needing state update
  . Calculates correct states
  . Updates events in batches
  
  @returns {Promise<Object>} - Sync result with statistics
 /
exports.syncAllEventStates = async () => {
  try {
    const startTime = Date.now();
    
    // Get events that need update
    const eventsNeedingUpdate = await exports.getEventsNeedingUpdate();
    
    if (eventsNeedingUpdate.length === ) {
      return {
        success: true,
        message: 'All events are in correct state',
        eventsChecked: ,
        eventsUpdated: ,
        duration: `${Date.now() - startTime}ms`,
      };
    }

    // Calculate new states for each event
    const updates = eventsNeedingUpdate.map((event) => ({
      id: event.id,
      state: exports.calculateEventState(event),
      title: event.title,
    }));

    // Batch update
    const updateResult = await exports.batchUpdateEventStates(updates);

    // Log detailed information
    console.log(`
╔════════════════════════════════════════════╗
║       Event State Synchronization          ║
╠════════════════════════════════════════════╣
║ Total Checked:    ${eventsNeedingUpdate.length.toString().padEnd()} ║
║ Successfully Updated: ${updateResult.successCount.toString().padEnd()} ║
║ Failed:           ${updateResult.errorCount.toString().padEnd()} ║
║ Duration:         ${(`${Date.now() - startTime}ms`).padEnd()} ║
╚════════════════════════════════════════════╝
    `);

    return {
      success: updateResult.success,
      message: `Synced ${updateResult.successCount} events`,
      eventsChecked: eventsNeedingUpdate.length,
      eventsUpdated: updateResult.successCount,
      errors: updateResult.errors,
      duration: `${Date.now() - startTime}ms`,
    };
  } catch (error) {
    console.error('Error syncing event states:', error);
    return {
      success: false,
      message: 'Event state sync failed',
      error: error.message,
      duration: `${Date.now() - startTime}ms`,
    };
  }
};

/
  Get event state details
  Returns detailed information about event state transitions
  
  @param {string} eventId - Event UUID
  @returns {Promise<Object>} - Detailed state information
 /
exports.getEventStateDetails = async (eventId) => {
  try {
    const event = await Event.findByPk(eventId, {
      attributes: ['id', 'title', 'start_time', 'duration_minutes', 'state', 'created_at'],
    });

    if (!event) {
      throw new Error(`Event not found: ${eventId}`);
    }

    const now = new Date();
    const startTime = new Date(event.start_time);
    const endTime = new Date(startTime.getTime() + event.duration_minutes    );
    const calculatedState = exports.calculateEventState(event);

    // Calculate time differences
    const msUntilStart = startTime - now;
    const msUntilEnd = endTime - now;

    const formatTime = (ms) => {
      if (ms < ) return 'Finished';
      const seconds = Math.floor(ms / );
      const minutes = Math.floor(seconds / );
      const hours = Math.floor(minutes / );
      const days = Math.floor(hours / );

      if (days > ) return `${days}d ${hours % }h`;
      if (hours > ) return `${hours}h ${minutes % }m`;
      if (minutes > ) return `${minutes}m ${seconds % }s`;
      return `${seconds}s`;
    };

    return {
      event: {
        id: event.id,
        title: event.title,
        currentState: event.state,
        calculatedState,
        stateMatchesCalculation: event.state === calculatedState,
      },
      timing: {
        now: now.toISOString(),
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        durationMinutes: event.duration_minutes,
        timeUntilStart: {
          ms: msUntilStart,
          formatted: msUntilStart <  ? 'Already started' : formatTime(msUntilStart),
        },
        timeUntilEnd: {
          ms: msUntilEnd,
          formatted: formatTime(msUntilEnd),
        },
      },
      status: {
        started: now >= startTime,
        ended: now >= endTime,
        inProgress: now >= startTime && now < endTime,
      },
    };
  } catch (error) {
    console.error('Error getting event state details:', error);
    throw error;
  }
};

/
  Health check for state service
  Verifies the service is working correctly
  
  @returns {Promise<Object>} - Health check result
 /
exports.healthCheck = async () => {
  try {
    // Try to count events
    const eventCount = await Event.count();
    
    // Try to get events needing update
    const eventsNeedingUpdate = await exports.getEventsNeedingUpdate();
    
    return {
      status: 'healthy',
      eventsTotal: eventCount,
      eventsNeedingUpdate: eventsNeedingUpdate.length,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
};
