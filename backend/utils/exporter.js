/
  Export Utility
  Handles CSV and XLSX export of attendance reports
  
  Functions:
   - exportEventToCSV(eventId): Export event attendance as CSV
   - exportEventToXLSX(eventId): Export event attendance as XLSX
   - exportGroupToCSV(groupId): Export group attendance as CSV
   - exportGroupToXLSX(groupId): Export group attendance as XLSX
   - formatAttendanceData(attendances, type): Format data for export
 /

const fs = require('fs');
const path = require('path');
const { createWriteStream } = require('fs');
const { format: formatDate } = require('date-fns');
const ExcelJS = require('exceljs');
const { createObjectCsvWriter } = require('fast-csv');
const { Event, EventGroup, Attendance, User, sequelize } = require('../models');
const { Op } = require('sequelize');

// Constants
const EXPORT_DIR = path.join(__dirname, '../exports');
const DATE_FORMAT = 'yyyy-MM-dd HH:mm:ss';
const FILE_DATE_FORMAT = 'yyyy-MM-dd_HH-mm-ss';

/
  Ensure export directory exists
 /
function ensureExportDir() {
  if (!fs.existsSync(EXPORT_DIR)) {
    fs.mkdirSync(EXPORT_DIR, { recursive: true });
  }
}

/
  Export event attendance to CSV file
  
  @param {string} eventId - UUID of the event
  @returns {Promise<{success: boolean, filepath?: string, filename?: string, recordCount?: number, error?: string}>}
  
  @example
  const result = await exportEventToCSV('event-uuid-');
  // { success: true, filepath: '/path/to/file.csv', filename: 'event_--_.csv', recordCount:  }
 /
exports.exportEventToCSV = async (eventId) => {
  try {
    ensureExportDir();

    // Fetch event with attendance details
    const event = await Event.findByPk(eventId, {
      include: [
        {
          model: Attendance,
          as: 'attendances',
          include: [
            {
              model: User,
              as: 'participant',
              attributes: ['id', 'name', 'email', 'role']
            }
          ],
          order: [['timestamp', 'ASC']]
        },
        {
          model: EventGroup,
          as: 'group',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!event) {
      return {
        success: false,
        error: `Event not found: ${eventId}`
      };
    }

    // Format data for CSV
    const csvData = formatEventAttendanceForExport(event);

    // Generate filename
    const timestamp = formatDate(new Date(), FILE_DATE_FORMAT);
    const filename = `event_${event.title.replace(/\s+/g, '_')}_${timestamp}.csv`;
    const filepath = path.join(EXPORT_DIR, filename);

    // Write CSV file
    const recordCount = await writeCSVFile(filepath, csvData);

    console.log('[Exporter] Event CSV exported:', {
      eventId,
      filename,
      recordCount,
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      filepath,
      filename,
      recordCount,
      eventTitle: event.title,
      exportDate: new Date().toISOString()
    };

  } catch (error) {
    console.error('[Exporter] Error exporting event to CSV:', {
      eventId,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    return {
      success: false,
      error: `Failed to export event: ${error.message}`
    };
  }
};

/
  Export event attendance to XLSX file
  
  @param {string} eventId - UUID of the event
  @returns {Promise<{success: boolean, filepath?: string, filename?: string, recordCount?: number, error?: string}>}
  
  @example
  const result = await exportEventToXLSX('event-uuid-');
  // { success: true, filepath: '/path/to/file.xlsx', filename: 'event_--_.xlsx', recordCount:  }
 /
exports.exportEventToXLSX = async (eventId) => {
  try {
    ensureExportDir();

    // Fetch event with attendance details
    const event = await Event.findByPk(eventId, {
      include: [
        {
          model: Attendance,
          as: 'attendances',
          include: [
            {
              model: User,
              as: 'participant',
              attributes: ['id', 'name', 'email', 'role']
            }
          ],
          order: [['timestamp', 'ASC']]
        },
        {
          model: EventGroup,
          as: 'group',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!event) {
      return {
        success: false,
        error: `Event not found: ${eventId}`
      };
    }

    // Generate filename
    const timestamp = formatDate(new Date(), FILE_DATE_FORMAT);
    const filename = `event_${event.title.replace(/\s+/g, '_')}_${timestamp}.xlsx`;
    const filepath = path.join(EXPORT_DIR, filename);

    // Create and write XLSX file
    const recordCount = await writeEventXLSXFile(filepath, event);

    console.log('[Exporter] Event XLSX exported:', {
      eventId,
      filename,
      recordCount,
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      filepath,
      filename,
      recordCount,
      eventTitle: event.title,
      exportDate: new Date().toISOString()
    };

  } catch (error) {
    console.error('[Exporter] Error exporting event to XLSX:', {
      eventId,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    return {
      success: false,
      error: `Failed to export event: ${error.message}`
    };
  }
};

/
  Export group attendance to CSV file
  Combines attendance from all events in the group
  
  @param {string} groupId - UUID of the event group
  @returns {Promise<{success: boolean, filepath?: string, filename?: string, recordCount?: number, eventCount?: number, error?: string}>}
  
  @example
  const result = await exportGroupToCSV('group-uuid-');
  // { success: true, filepath: '/path/to/file.csv', filename: 'group_--_.csv', recordCount: , eventCount:  }
 /
exports.exportGroupToCSV = async (groupId) => {
  try {
    ensureExportDir();

    // Fetch group with all events and attendance
    const group = await EventGroup.findByPk(groupId, {
      include: [
        {
          model: Event,
          as: 'events',
          include: [
            {
              model: Attendance,
              as: 'attendances',
              include: [
                {
                  model: User,
                  as: 'participant',
                  attributes: ['id', 'name', 'email', 'role']
                }
              ],
              order: [['timestamp', 'ASC']]
            }
          ],
          order: [['start_time', 'ASC']]
        }
      ]
    });

    if (!group) {
      return {
        success: false,
        error: `Event group not found: ${groupId}`
      };
    }

    // Format data for CSV
    const csvData = formatGroupAttendanceForExport(group);

    // Generate filename
    const timestamp = formatDate(new Date(), FILE_DATE_FORMAT);
    const filename = `group_${group.name.replace(/\s+/g, '_')}_${timestamp}.csv`;
    const filepath = path.join(EXPORT_DIR, filename);

    // Write CSV file
    const recordCount = await writeCSVFile(filepath, csvData);
    const eventCount = group.events ? group.events.length : ;

    console.log('[Exporter] Group CSV exported:', {
      groupId,
      filename,
      recordCount,
      eventCount,
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      filepath,
      filename,
      recordCount,
      eventCount,
      groupName: group.name,
      exportDate: new Date().toISOString()
    };

  } catch (error) {
    console.error('[Exporter] Error exporting group to CSV:', {
      groupId,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    return {
      success: false,
      error: `Failed to export group: ${error.message}`
    };
  }
};

/
  Export group attendance to XLSX file
  Creates separate sheets for each event in the group
  
  @param {string} groupId - UUID of the event group
  @returns {Promise<{success: boolean, filepath?: string, filename?: string, recordCount?: number, eventCount?: number, error?: string}>}
  
  @example
  const result = await exportGroupToXLSX('group-uuid-');
  // { success: true, filepath: '/path/to/file.xlsx', filename: 'group_--_.xlsx', recordCount: , eventCount:  }
 /
exports.exportGroupToXLSX = async (groupId) => {
  try {
    ensureExportDir();

    // Fetch group with all events and attendance
    const group = await EventGroup.findByPk(groupId, {
      include: [
        {
          model: Event,
          as: 'events',
          include: [
            {
              model: Attendance,
              as: 'attendances',
              include: [
                {
                  model: User,
                  as: 'participant',
                  attributes: ['id', 'name', 'email', 'role']
                }
              ],
              order: [['timestamp', 'ASC']]
            }
          ],
          order: [['start_time', 'ASC']]
        }
      ]
    });

    if (!group) {
      return {
        success: false,
        error: `Event group not found: ${groupId}`
      };
    }

    // Generate filename
    const timestamp = formatDate(new Date(), FILE_DATE_FORMAT);
    const filename = `group_${group.name.replace(/\s+/g, '_')}_${timestamp}.xlsx`;
    const filepath = path.join(EXPORT_DIR, filename);

    // Create and write XLSX file
    const { recordCount, eventCount } = await writeGroupXLSXFile(filepath, group);

    console.log('[Exporter] Group XLSX exported:', {
      groupId,
      filename,
      recordCount,
      eventCount,
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      filepath,
      filename,
      recordCount,
      eventCount,
      groupName: group.name,
      exportDate: new Date().toISOString()
    };

  } catch (error) {
    console.error('[Exporter] Error exporting group to XLSX:', {
      groupId,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    return {
      success: false,
      error: `Failed to export group: ${error.message}`
    };
  }
};

/
  Format event attendance data for CSV export
  
  @param {Object} event - Event with attendances
  @returns {Array<Object>} Formatted data rows
 /
function formatEventAttendanceForExport(event) {
  const rows = [];

  // Add header info as first rows
  rows.push({
    'Event Title': event.title,
    'Event Group': event.group?.name || 'N/A',
    'Event Code': event.code_text,
    'Start Time': formatDate(event.start_time, DATE_FORMAT),
    'Duration (mins)': event.duration_minutes,
    'Total Attendees': (event.attendances || []).length,
    'Event State': event.state,
    'Export Date': formatDate(new Date(), DATE_FORMAT)
  });

  // Add empty row
  rows.push({});

  // Add attendance header
  rows.push({
    'Check-in ': '',
    'Participant Name': '',
    'Participant Email': '',
    'User Role': '',
    'Check-in Time': '',
    'Minutes from Start': ''
  });

  // Add attendance records
  const attendances = event.attendances || [];
  attendances.forEach((attendance, index) => {
    const participant = attendance.participant;
    const minutesFromStart = participant
      ? Math.round((attendance.timestamp - event.start_time) / )
      : ;

    rows.push({
      'Check-in ': index + ,
      'Participant Name': participant?.name || 'Anonymous',
      'Participant Email': participant?.email || 'N/A',
      'User Role': participant?.role || 'Unknown',
      'Check-in Time': formatDate(attendance.timestamp, DATE_FORMAT),
      'Minutes from Start': minutesFromStart
    });
  });

  return rows;
}

/
  Format group attendance data for CSV export
  
  @param {Object} group - Event group with events
  @returns {Array<Object>} Formatted data rows
 /
function formatGroupAttendanceForExport(group) {
  const rows = [];

  // Add header info
  rows.push({
    'Event Group': group.name,
    'Description': group.description || 'N/A',
    'Total Events': (group.events || []).length,
    'Total Attendees': group.events?.reduce((sum, e) => sum + (e.attendances?.length || ), ) || ,
    'Export Date': formatDate(new Date(), DATE_FORMAT)
  });

  // Process each event
  const events = group.events || [];
  events.forEach((event, eventIndex) => {
    // Event separator
    if (eventIndex > ) {
      rows.push({});
    }

    // Event header
    rows.push({
      'Event Title': event.title,
      'Event Code': event.code_text,
      'Start Time': formatDate(event.start_time, DATE_FORMAT),
      'Duration (mins)': event.duration_minutes,
      'Attendees': event.attendances?.length || ,
      'State': event.state
    });

    rows.push({});

    // Attendance records header
    rows.push({
      'Check-in ': '',
      'Participant Name': '',
      'Participant Email': '',
      'User Role': '',
      'Check-in Time': '',
      'Minutes from Start': ''
    });

    // Attendance records
    const attendances = event.attendances || [];
    attendances.forEach((attendance, index) => {
      const participant = attendance.participant;
      const minutesFromStart = participant
        ? Math.round((attendance.timestamp - event.start_time) / )
        : ;

      rows.push({
        'Check-in ': index + ,
        'Participant Name': participant?.name || 'Anonymous',
        'Participant Email': participant?.email || 'N/A',
        'User Role': participant?.role || 'Unknown',
        'Check-in Time': formatDate(attendance.timestamp, DATE_FORMAT),
        'Minutes from Start': minutesFromStart
      });
    });
  });

  return rows;
}

/
  Write CSV file using fast-csv
  
  @param {string} filepath - Destination file path
  @param {Array<Object>} data - Data to write
  @returns {Promise<number>} Number of records written
 /
function writeCSVFile(filepath, data) {
  return new Promise((resolve, reject) => {
    const output = createWriteStream(filepath);
    
    output.on('error', reject);

    createObjectCsvWriter({
      path: filepath,
      header: data.length >  ? Object.keys(data[]).map(key => ({ key, title: key })) : []
    })
      .writeRecords(data)
      .then(() => {
        resolve(data.length);
      })
      .catch(reject);
  });
}

/
  Write event XLSX file using ExcelJS
  
  @param {string} filepath - Destination file path
  @param {Object} event - Event with attendances
  @returns {Promise<number>} Number of records written
 /
async function writeEventXLSXFile(filepath, event) {
  const workbook = new ExcelJS.Workbook();
  
  // Create main sheet
  const worksheet = workbook.addWorksheet('Attendance');

  // Set column widths
  worksheet.columns = [
    { header: 'Check-in ', key: 'checkinNumber', width:  },
    { header: 'Participant Name', key: 'participantName', width:  },
    { header: 'Participant Email', key: 'participantEmail', width:  },
    { header: 'User Role', key: 'userRole', width:  },
    { header: 'Check-in Time', key: 'checkinTime', width:  },
    { header: 'Minutes from Start', key: 'minutesFromStart', width:  }
  ];

  // Style header row
  const headerRow = worksheet.getRow();
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' } };
  headerRow.alignment = { horizontal: 'center', vertical: 'center' };

  // Add attendance rows
  const attendances = event.attendances || [];
  attendances.forEach((attendance, index) => {
    const participant = attendance.participant;
    const minutesFromStart = participant
      ? Math.round((attendance.timestamp - event.start_time) / )
      : ;

    worksheet.addRow({
      checkinNumber: index + ,
      participantName: participant?.name || 'Anonymous',
      participantEmail: participant?.email || 'N/A',
      userRole: participant?.role || 'Unknown',
      checkinTime: formatDate(attendance.timestamp, DATE_FORMAT),
      minutesFromStart: minutesFromStart
    });
  });

  // Add summary sheet
  const summarySheet = workbook.addWorksheet('Summary');
  summarySheet.columns = [
    { header: 'Property', key: 'property', width:  },
    { header: 'Value', key: 'value', width:  }
  ];

  const summaryHeaderRow = summarySheet.getRow();
  summaryHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  summaryHeaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' } };

  summarySheet.addRow({ property: 'Event Title', value: event.title });
  summarySheet.addRow({ property: 'Event Group', value: event.group?.name || 'N/A' });
  summarySheet.addRow({ property: 'Event Code', value: event.code_text });
  summarySheet.addRow({ property: 'Start Time', value: formatDate(event.start_time, DATE_FORMAT) });
  summarySheet.addRow({ property: 'Duration (minutes)', value: event.duration_minutes });
  summarySheet.addRow({ property: 'Total Attendees', value: attendances.length });
  summarySheet.addRow({ property: 'Event State', value: event.state });
  summarySheet.addRow({ property: 'Export Date', value: formatDate(new Date(), DATE_FORMAT) });

  // Write file
  await workbook.xlsx.writeFile(filepath);

  return attendances.length;
}

/
  Write group XLSX file using ExcelJS
  Creates one sheet per event plus summary
  
  @param {string} filepath - Destination file path
  @param {Object} group - Event group with events
  @returns {Promise<{recordCount: number, eventCount: number}>}
 /
async function writeGroupXLSXFile(filepath, group) {
  const workbook = new ExcelJS.Workbook();
  
  let totalRecords = ;
  const events = group.events || [];

  // Add summary sheet first
  const summarySheet = workbook.addWorksheet('Summary', { index:  });
  summarySheet.columns = [
    { header: 'Property', key: 'property', width:  },
    { header: 'Value', key: 'value', width:  }
  ];

  const summaryHeaderRow = summarySheet.getRow();
  summaryHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  summaryHeaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' } };

  const totalAttendees = events.reduce((sum, e) => sum + (e.attendances?.length || ), );
  summarySheet.addRow({ property: 'Event Group', value: group.name });
  summarySheet.addRow({ property: 'Description', value: group.description || 'N/A' });
  summarySheet.addRow({ property: 'Total Events', value: events.length });
  summarySheet.addRow({ property: 'Total Attendees', value: totalAttendees });
  summarySheet.addRow({ property: 'Export Date', value: formatDate(new Date(), DATE_FORMAT) });

  // Add sheet for each event
  events.forEach((event) => {
    const sheetName = event.title.substring(, ); // Excel sheet name limit
    const worksheet = workbook.addWorksheet(sheetName);

    worksheet.columns = [
      { header: 'Check-in ', key: 'checkinNumber', width:  },
      { header: 'Participant Name', key: 'participantName', width:  },
      { header: 'Participant Email', key: 'participantEmail', width:  },
      { header: 'User Role', key: 'userRole', width:  },
      { header: 'Check-in Time', key: 'checkinTime', width:  },
      { header: 'Minutes from Start', key: 'minutesFromStart', width:  }
    ];

    const headerRow = worksheet.getRow();
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' } };
    headerRow.alignment = { horizontal: 'center', vertical: 'center' };

    const attendances = event.attendances || [];
    attendances.forEach((attendance, index) => {
      const participant = attendance.participant;
      const minutesFromStart = participant
        ? Math.round((attendance.timestamp - event.start_time) / )
        : ;

      worksheet.addRow({
        checkinNumber: index + ,
        participantName: participant?.name || 'Anonymous',
        participantEmail: participant?.email || 'N/A',
        userRole: participant?.role || 'Unknown',
        checkinTime: formatDate(attendance.timestamp, DATE_FORMAT),
        minutesFromStart: minutesFromStart
      });
    });

    totalRecords += attendances.length;
  });

  // Write file
  await workbook.xlsx.writeFile(filepath);

  return {
    recordCount: totalRecords,
    eventCount: events.length
  };
}

/
  Get service information
  
  @returns {Object} Service metadata
 /
exports.getServiceInfo = () => {
  return {
    name: 'Export Utility',
    version: '..',
    exportDir: EXPORT_DIR,
    supportedFormats: ['CSV', 'XLSX'],
    features: [
      'Export event attendance to CSV and XLSX',
      'Export group attendance to CSV and XLSX',
      'Summary sheets with event/group statistics',
      'Attendance timing calculations',
      'Formatted date/time outputs',
      'Professional styling for Excel exports'
    ]
  };
};
