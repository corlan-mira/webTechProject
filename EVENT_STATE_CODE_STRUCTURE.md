# Event State Logic - Code Structure

**Complete Implementation Overview**

---

## 📂 File Organization

```
backend/
├── services/
│   ├── eventStateService.js          ← NEW (350+ lines)
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
│   ├── eventStateJob.js              ← NEW (280+ lines)
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

## 🔗 Service Architecture

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

## 📝 Complete Source Code Structure

### Service: `services/eventStateService.js`

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

### Job: `jobs/eventStateJob.js`

```
initEventStateJob()
  ├─ Check if already running
  ├─ Schedule cron ('0 * * * * *')
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

## 🔄 Execution Sequence Diagram

### Server Startup

```
app.listen() called
    │
    ├─ Database authentication
    ├─ Database sync
    │
    ├─ eventStateJob.initEventStateJob()
    │   ├─ Create cron scheduler
    │   ├─ Schedule pattern: '0 * * * * *'
    │   └─ Return { status: 'initialized' }
    │
    ├─ Log job initialization
    │
    └─ Server running
```

### Each Minute (at 0 seconds)

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
    └─ Wait 60 seconds
```

### Server Shutdown

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
    └─ Exit process (code 0)
```

---

## 🧩 Integration Points

### 1. Server Initialization

**File:** `server.js` (lines ~20, ~70)

```javascript
// Import
const { eventStateJob } = require('./jobs');

// In startServer() function
const jobStatus = eventStateJob.initEventStateJob();
console.log(`✓ Event state job: ${jobStatus.message}`);
```

### 2. Graceful Shutdown

**File:** `server.js` (lines ~80+)

```javascript
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  
  // Stop background jobs first
  eventStateJob.gracefulShutdown();
  
  // Then close server and database
  server.close(async () => {
    await sequelize.close();
    process.exit(0);
  });
});
```

### 3. Service Exports

**File:** `services/index.js`

```javascript
module.exports = {
  // ... other services
  eventStateService: require('./eventStateService'),
};
```

### 4. Job Exports

**File:** `jobs/index.js`

```javascript
module.exports = {
  // ... other jobs
  eventStateJob: require('./eventStateJob'),
};
```

---

## 📊 Data Flow Examples

### Example 1: Event Transitions from CLOSED to OPEN

```javascript
// Event data
const event = {
  id: 'event-123',
  title: 'Morning Keynote',
  start_time: '2025-12-15T09:00:00Z',
  duration_minutes: 60,
  state: 'CLOSED'  // Current stored state
};

// 08:59:00 - Before event
const state = eventStateService.calculateEventState(event);
// → 'CLOSED' (now < start_time)
// No update needed

// 09:00:30 - Event started
const state = eventStateService.calculateEventState(event);
// → 'OPEN' (start_time ≤ now < end_time)
// Update event.state = 'OPEN' in database
```

### Example 2: Batch Update Operation

```javascript
// Events needing update
const updates = [
  { id: 'evt-1', state: 'OPEN' },   // CLOSED → OPEN
  { id: 'evt-2', state: 'CLOSED' }, // OPEN → CLOSED
  { id: 'evt-3', state: 'OPEN' }    // CLOSED → OPEN
];

// Batch operation
await eventStateService.batchUpdateEventStates(updates);

// Database execution
/*
UPDATE events SET state = 'OPEN', updated_at = NOW()
WHERE id = 'evt-1';

UPDATE events SET state = 'CLOSED', updated_at = NOW()
WHERE id = 'evt-2';

UPDATE events SET state = 'OPEN', updated_at = NOW()
WHERE id = 'evt-3';
*/
```

---

## ⚙️ Configuration Points

### Change Execution Frequency

**File:** `jobs/eventStateJob.js` line ~40

```javascript
// Default: Every minute
cronJob = cron.schedule('0 * * * * *', async () => {
```

Change pattern to:
- `'*/30 * * * * *'` → Every 30 seconds
- `'0 */5 * * * *'` → Every 5 minutes
- `'0 0 * * * *'` → Every hour

### Change Fallback Interval

**File:** `jobs/eventStateJob.js` line ~160

```javascript
// Default: 60000ms (1 minute)
exports.initEventStateJobWithInterval = (intervalMs = 60000) => {
```

---

## 🧪 Testing Integration

### Unit Test Example

```javascript
const { eventStateService } = require('../services');

describe('calculateEventState', () => {
  test('should return CLOSED before event start', () => {
    const futureDate = new Date(Date.now() + 60000);
    const event = {
      start_time: futureDate,
      duration_minutes: 60
    };
    
    expect(eventStateService.calculateEventState(event))
      .toBe('CLOSED');
  });

  test('should return OPEN during event', () => {
    const now = new Date();
    const event = {
      start_time: new Date(now - 30000),
      duration_minutes: 60
    };
    
    expect(eventStateService.calculateEventState(event))
      .toBe('OPEN');
  });
});
```

### Integration Test Example

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
    expect(result.eventsUpdated).toBeGreaterThanOrEqual(0);
  });
});
```

---

## 📚 Dependencies

All already installed in `package.json`:

```json
{
  "node-cron": "^3.0.3",      // For scheduling
  "sequelize": "^6.35.2",     // For database
  "pg": "^8.11.3",            // For PostgreSQL
  "mysql2": "^3.x.x"          // For MySQL (optional)
}
```

---

## 🎯 Summary

**What was implemented:**

1. ✅ `services/eventStateService.js` - 7 core functions for state management
2. ✅ `jobs/eventStateJob.js` - Cron scheduler with multiple control methods
3. ✅ Server integration in `server.js`
4. ✅ Proper exports in `services/index.js` and `jobs/index.js`
5. ✅ Error handling throughout
6. ✅ Graceful shutdown sequence
7. ✅ Comprehensive logging
8. ✅ Health monitoring

**Key Features:**

- Automatic event state transitions
- Runs every minute via cron
- Batch database updates
- Comprehensive error handling
- Health checks prevent cascade failures
- Graceful shutdown
- Fallback to setInterval if needed
- Detailed logging and monitoring

---

**Implementation Complete:** ✅ READY FOR PRODUCTION

