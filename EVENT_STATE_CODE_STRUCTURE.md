 Event State Logic - Code Structure

Complete Implementation Overview

---

  File Organization

```
backend/
├── services/
│   ├── eventStateService.js          ← NEW (+ lines)
│   │   ├── calculateEventState()
│   │   ├── getEventsNeedingUpdate()
│   │   ├── updateEventState()
│   │   ├── batchUpdateEventStates()
│   │   ├── syncAllEventStates()
│   │   ├── getEventStateDetails()
│   │   └── healthCheck()
│   │
│   └── index.js                      ← UPDATED
│       └── exports: eventStateService
│
├── jobs/
│   ├── eventStateJob.js              ← NEW (+ lines)
│   │   ├── initEventStateJob()
│   │   ├── stopEventStateJob()
│   │   ├── isEventStateJobRunning()
│   │   ├── getEventStateJobStatus()
│   │   ├── triggerEventStateSync()
│   │   ├── initEventStateJobWithInterval()
│   │   └── gracefulShutdown()
│   │
│   └── index.js                      ← UPDATED
│       └── exports: eventStateJob
│
├── server.js                         ← UPDATED
│   ├── Import eventStateJob
│   ├── Initialize job on startup
│   └── Graceful shutdown handler
│
└── models/
    └── Event.js                      ← Uses existing model
        ├── state field ('OPEN'/'CLOSED')
        ├── start_time
        └── duration_minutes
```

---

  Service Architecture

```
┌─────────────────────────────────────────────────────┐
│            Application Server (Express)             │
└────────────────────┬────────────────────────────────┘
                     │
                     ├─── HTTP Requests ──────┐
                     │                        │
                     ▼                        ▼
         ┌──────────────────────┐  ┌────────────────────┐
         │   API Controllers    │  │  Background Jobs   │
         │   (Handle HTTP)      │  │  (Run on schedule) │
         └────────┬─────────────┘  └────────┬───────────┘
                  │                         │
                  │                         ▼
                  │            ┌──────────────────────┐
                  │            │  eventStateJob       │
                  │            │  (Cron scheduler)    │
                  │            │  Every minute        │
                  │            └────────┬─────────────┘
                  │                     │
                  │                     ▼
                  │            ┌──────────────────────┐
                  │            │ executeEventStateSync│
                  │            │ (Trigger sync)       │
                  │            └────────┬─────────────┘
                  │                     │
                  ├─────────────────────┤
                  │                     │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌──────────────────────────────┐
                  │  eventStateService           │
                  │  (Business logic)            │
                  │                              │
                  │  - calculateEventState()     │
                  │  - getEventsNeedingUpdate()  │
                  │  - syncAllEventStates()      │
                  │  - updateEventState()        │
                  └────────────┬─────────────────┘
                               │
                               ▼
                  ┌──────────────────────────────┐
                  │  Models (Sequelize)          │
                  │  Event Model                 │
                  └────────────┬─────────────────┘
                               │
                               ▼
                  ┌──────────────────────────────┐
                  │  Database                    │
                  │  (PostgreSQL / MySQL)        │
                  │  events table                │
                  └──────────────────────────────┘
```

---

  Complete Source Code Structure

 Service: `services/eventStateService.js`

```
calculateEventState(event)
  ├─ Validate event object
  ├─ Get current time
  ├─ Calculate end_time
  └─ Return 'OPEN' or 'CLOSED'

getEventsNeedingUpdate()
  ├─ Query all non-DRAFT events
  ├─ Filter by state mismatch
  └─ Return array of events

updateEventState(eventId, newState)
  ├─ Validate inputs
  ├─ Find event
  ├─ Update state
  └─ Log change

batchUpdateEventStates(updates)
  ├─ Iterate each update
  ├─ Update database
  ├─ Count success/errors
  └─ Return statistics

syncAllEventStates()
  ├─ getEventsNeedingUpdate()
  ├─ Calculate states
  ├─ batchUpdateEventStates()
  └─ Log detailed results

getEventStateDetails(eventId)
  ├─ Query event
  ├─ Calculate times
  ├─ Format output
  └─ Return detailed info

healthCheck()
  ├─ Count total events
  ├─ Count events needing update
  └─ Return health status
```

 Job: `jobs/eventStateJob.js`

```
initEventStateJob()
  ├─ Check if already running
  ├─ Schedule cron ('     ')
  └─ Return status

stopEventStateJob()
  ├─ Stop cron
  ├─ Clear job reference
  └─ Return status

isEventStateJobRunning()
  └─ Return boolean

getEventStateJobStatus()
  ├─ Check if running
  ├─ Return schedule info
  └─ Calculate next execution

triggerEventStateSync()
  ├─ Call syncAllEventStates()
  └─ Return result

executeEventStateSync() [PRIVATE]
  ├─ Health check
  ├─ Call syncAllEventStates()
  ├─ Log results
  └─ Handle errors

initEventStateJobWithInterval(ms)
  ├─ Create setInterval as fallback
  └─ Return status

gracefulShutdown()
  ├─ Check if running
  ├─ Stop job
  └─ Log shutdown
```

---

  Execution Sequence Diagram

 Server Startup

```
app.listen() called
    │
    ├─ Database authentication
    ├─ Database sync
    │
    ├─ eventStateJob.initEventStateJob()
    │   ├─ Create cron scheduler
    │   ├─ Schedule pattern: '     '
    │   └─ Return { status: 'initialized' }
    │
    ├─ Log job initialization
    │
    └─ Server running
```

 Each Minute (at  seconds)

```
Cron scheduler triggers
    │
    ├─ executeEventStateSync()
    │   │
    │   ├─ eventStateService.healthCheck()
    │   │   ├─ Count events
    │   │   ├─ Count events needing update
    │   │   └─ Return health status
    │   │
    │   ├─ If health.status === 'healthy'
    │   │   │
    │   │   ├─ eventStateService.syncAllEventStates()
    │   │   │   │
    │   │   │   ├─ getEventsNeedingUpdate()
    │   │   │   │   └─ Database query
    │   │   │   │
    │   │   │   ├─ Calculate new states
    │   │   │   │   └─ calculateEventState() for each
    │   │   │   │
    │   │   │   └─ batchUpdateEventStates()
    │   │   │       └─ Database update
    │   │   │
    │   │   └─ Return sync result
    │   │
    │   └─ Log results
    │
    └─ Wait  seconds
```

 Server Shutdown

```
SIGTERM signal received
    │
    ├─ eventStateJob.gracefulShutdown()
    │   ├─ stopEventStateJob()
    │   │   ├─ cron.stop()
    │   │   └─ Clear job reference
    │   │
    │   └─ Log shutdown
    │
    ├─ Close database connection
    │
    └─ Exit process (code )
```

---

  Integration Points

 . Server Initialization

File: `server.js` (lines ~, ~)

```javascript
// Import
const { eventStateJob } = require('./jobs');

// In startServer() function
const jobStatus = eventStateJob.initEventStateJob();
console.log(`✓ Event state job: ${jobStatus.message}`);
```

 . Graceful Shutdown

File: `server.js` (lines ~+)

```javascript
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  
  // Stop background jobs first
  eventStateJob.gracefulShutdown();
  
  // Then close server and database
  server.close(async () => {
    await sequelize.close();
    process.exit();
  });
});
```

 . Service Exports

File: `services/index.js`

```javascript
module.exports = {
  // ... other services
  eventStateService: require('./eventStateService'),
};
```

 . Job Exports

File: `jobs/index.js`

```javascript
module.exports = {
  // ... other jobs
  eventStateJob: require('./eventStateJob'),
};
```

---

  Data Flow Examples

 Example : Event Transitions from CLOSED to OPEN

```javascript
// Event data
const event = {
  id: 'event-',
  title: 'Morning Keynote',
  start_time: '--T::Z',
  duration_minutes: ,
  state: 'CLOSED'  // Current stored state
};

// :: - Before event
const state = eventStateService.calculateEventState(event);
// → 'CLOSED' (now < start_time)
// No update needed

// :: - Event started
const state = eventStateService.calculateEventState(event);
// → 'OPEN' (start_time ≤ now < end_time)
// Update event.state = 'OPEN' in database
```

 Example : Batch Update Operation

```javascript
// Events needing update
const updates = [
  { id: 'evt-', state: 'OPEN' },   // CLOSED → OPEN
  { id: 'evt-', state: 'CLOSED' }, // OPEN → CLOSED
  { id: 'evt-', state: 'OPEN' }    // CLOSED → OPEN
];

// Batch operation
await eventStateService.batchUpdateEventStates(updates);

// Database execution
/
UPDATE events SET state = 'OPEN', updated_at = NOW()
WHERE id = 'evt-';

UPDATE events SET state = 'CLOSED', updated_at = NOW()
WHERE id = 'evt-';

UPDATE events SET state = 'OPEN', updated_at = NOW()
WHERE id = 'evt-';
/
```

---

 ️ Configuration Points

 Change Execution Frequency

File: `jobs/eventStateJob.js` line ~

```javascript
// Default: Every minute
cronJob = cron.schedule('     ', async () => {
```

Change pattern to:
- `'/     '` → Every  seconds
- `' /    '` → Every  minutes
- `'     '` → Every hour

 Change Fallback Interval

File: `jobs/eventStateJob.js` line ~

```javascript
// Default: ms ( minute)
exports.initEventStateJobWithInterval = (intervalMs = ) => {
```

---

  Testing Integration

 Unit Test Example

```javascript
const { eventStateService } = require('../services');

describe('calculateEventState', () => {
  test('should return CLOSED before event start', () => {
    const futureDate = new Date(Date.now() + );
    const event = {
      start_time: futureDate,
      duration_minutes: 
    };
    
    expect(eventStateService.calculateEventState(event))
      .toBe('CLOSED');
  });

  test('should return OPEN during event', () => {
    const now = new Date();
    const event = {
      start_time: new Date(now - ),
      duration_minutes: 
    };
    
    expect(eventStateService.calculateEventState(event))
      .toBe('OPEN');
  });
});
```

 Integration Test Example

```javascript
const { eventStateJob } = require('../jobs');

describe('Event State Job', () => {
  test('should initialize job correctly', () => {
    const status = eventStateJob.initEventStateJob();
    
    expect(status.status).toBe('initialized');
    expect(eventStateJob.isEventStateJobRunning()).toBe(true);
    
    eventStateJob.stopEventStateJob();
  });

  test('should trigger manual sync', async () => {
    const result = await eventStateJob.triggerEventStateSync();
    
    expect(result.success).toBe(true);
    expect(result.eventsUpdated).toBeGreaterThanOrEqual();
  });
});
```

---

  Dependencies

All already installed in `package.json`:

```json
{
  "node-cron": "^..",      // For scheduling
  "sequelize": "^..",     // For database
  "pg": "^..",            // For PostgreSQL
  "mysql": "^.x.x"          // For MySQL (optional)
}
```

---

  Summary

What was implemented:

.  `services/eventStateService.js` -  core functions for state management
.  `jobs/eventStateJob.js` - Cron scheduler with multiple control methods
.  Server integration in `server.js`
.  Proper exports in `services/index.js` and `jobs/index.js`
.  Error handling throughout
.  Graceful shutdown sequence
.  Comprehensive logging
.  Health monitoring

Key Features:

- Automatic event state transitions
- Runs every minute via cron
- Batch database updates
- Comprehensive error handling
- Health checks prevent cascade failures
- Graceful shutdown
- Fallback to setInterval if needed
- Detailed logging and monitoring

---

Implementation Complete:  READY FOR PRODUCTION

