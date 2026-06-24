const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const PARENT_FOLDER_ID = '1pdkP3sGLXqYjhXAr1rMGWMPKCgW1t5Pj';
const CREDENTIALS_PATH = path.join(__dirname, 'service_account.json');

// Check if credentials exist and load them
let auth = null;
if (fs.existsSync(CREDENTIALS_PATH)) {
  try {
    auth = new google.auth.GoogleAuth({
      keyFile: CREDENTIALS_PATH,
      scopes: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/spreadsheets'
      ],
    });
    console.log('Google API Auth initialized successfully using service_account.json');
  } catch (error) {
    console.error('Failed to initialize Google Auth:', error.message);
  }
} else {
  console.log('WARNING: service_account.json not found in backend directory. Syncing disabled (Local Offline Mode).');
}

// Check if sync is enabled
function isSyncEnabled() {
  return auth !== null;
}

// Get or Create Spreadsheet inside the target Google Drive folder
async function getOrCreateSpreadsheet(businessName) {
  if (!isSyncEnabled()) return null;

  try {
    const drive = google.drive({ version: 'v3', auth });
    const spreadsheetName = `STECCA_POS - ${businessName}`;

    // Search for spreadsheet in folder
    const listRes = await drive.files.list({
      q: `name = '${spreadsheetName}' and '${PARENT_FOLDER_ID}' in parents and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`,
      fields: 'files(id, name)',
      spaces: 'drive',
    });

    if (listRes.data.files && listRes.data.files.length > 0) {
      const existingId = listRes.data.files[0].id;
      console.log(`Found existing Google Spreadsheet: "${spreadsheetName}" (${existingId})`);
      return existingId;
    }

    // Create a new spreadsheet if not found
    console.log(`Creating new Google Spreadsheet: "${spreadsheetName}"...`);
    const fileMetadata = {
      name: spreadsheetName,
      mimeType: 'application/vnd.google-apps.spreadsheet',
      parents: [PARENT_FOLDER_ID],
    };

    const newFile = await drive.files.create({
      resource: fileMetadata,
      fields: 'id',
    });

    const newSheetId = newFile.data.id;
    console.log(`Created Google Spreadsheet: "${spreadsheetName}" (${newSheetId})`);

    // Initialize required sheets inside the spreadsheet
    await initializeSpreadsheetSheets(newSheetId);
    return newSheetId;
  } catch (error) {
    console.error(`Error in getOrCreateSpreadsheet for "${businessName}":`, error.message);
    return null;
  }
}

// Initialize all required sheets with headers inside the spreadsheet
async function initializeSpreadsheetSheets(spreadsheetId) {
  const sheetsApi = google.sheets({ version: 'v4', auth });

  const requiredSheets = [
    { name: 'Dashboard', headers: ['Metric', 'Value'] },
    { name: 'Products', headers: ['ID', 'SKU', 'Name', 'Category', 'Price', 'Cost', 'Stock', 'Type', 'Active'] },
    { name: 'Inventory', headers: ['ID', 'SKU', 'Name', 'Category', 'Stock', 'Safety Stock', 'Unit', 'Cost', 'Last Opname', 'Status'] },
    { name: 'Stock Mutations', headers: ['ID', 'Date', 'Product', 'Type', 'From', 'To', 'Qty', 'Unit', 'Status'] },
    { name: 'Customers', headers: ['ID', 'Name', 'Phone', 'Email', 'Tier', 'Points', 'Total Spent', 'Visits'] },
    { name: 'Bookings', headers: ['ID', 'Customer Name', 'Phone', 'Service Name', 'Time', 'Date', 'Status', 'Staff', 'Price', 'Industry'] },
    { name: 'Transactions', headers: ['ID', 'Time', 'Date', 'Customer', 'Items Count', 'Total', 'Method', 'Status'] },
  ];

  try {
    // Get existing sheets
    const metadata = await sheetsApi.spreadsheets.get({ spreadsheetId });
    const existingSheetNames = metadata.data.sheets.map(s => s.properties.title);

    // Create sheets that don't exist
    const requests = [];
    for (const sheet of requiredSheets) {
      if (!existingSheetNames.includes(sheet.name)) {
        requests.push({
          addSheet: {
            properties: { title: sheet.name }
          }
        });
      }
    }

    if (requests.length > 0) {
      await sheetsApi.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: { requests }
      });
    }

    // Write headers for each sheet
    for (const sheet of requiredSheets) {
      await sheetsApi.spreadsheets.values.update({
        spreadsheetId,
        range: `'${sheet.name}'!A1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [sheet.headers]
        }
      });
    }
    console.log(`Initialized sheets and headers for spreadsheet ${spreadsheetId}`);
  } catch (error) {
    console.error('Error initializing sheets:', error.message);
  }
}

// Sync local DB table data to Google Sheets
async function syncTableToSheet(spreadsheetId, sheetName, dataArray, headers) {
  if (!isSyncEnabled() || !spreadsheetId) return;

  try {
    const sheetsApi = google.sheets({ version: 'v4', auth });

    // Format data rows
    const rows = dataArray.map(item => {
      return headers.map(header => {
        // Map header titles to data object properties
        const key = mapHeaderToKey(header);
        const val = item[key];
        return val !== undefined ? val : '';
      });
    });

    // Clear previous values in sheet (keeping headers)
    await sheetsApi.spreadsheets.values.clear({
      spreadsheetId,
      range: `'${sheetName}'!A2:Z1000`,
    });

    // Write new values below headers (A2)
    if (rows.length > 0) {
      await sheetsApi.spreadsheets.values.update({
        spreadsheetId,
        range: `'${sheetName}'!A2`,
        valueInputOption: 'RAW',
        requestBody: {
          values: rows
        }
      });
    }
    console.log(`Synced ${rows.length} rows to Google Sheet "${sheetName}"`);
  } catch (error) {
    console.error(`Failed to sync table to Google Sheet "${sheetName}":`, error.message);
  }
}

// Helper to map sheet header text to SQL/JSON object property names
function mapHeaderToKey(header) {
  switch (header) {
    case 'Metric': return 'metric';
    case 'Value': return 'value';
    case 'ID': return 'id';
    case 'SKU': return 'sku';
    case 'Name': return 'name';
    case 'Category': return 'category';
    case 'Price': return 'price';
    case 'Cost': return 'cost';
    case 'Stock': return 'stock';
    case 'Type': return 'type';
    case 'Active': return 'active';
    case 'Safety Stock': return 'safetyStock';
    case 'Unit': return 'unit';
    case 'Last Opname': return 'lastOpname';
    case 'Status': return 'status';
    case 'Date': return 'date';
    case 'Product': return 'product';
    case 'From': return 'from_location';
    case 'To': return 'to_location';
    case 'Qty': return 'qty';
    case 'Phone': return 'phone';
    case 'Email': return 'email';
    case 'Tier': return 'tier';
    case 'Points': return 'points';
    case 'Total Spent': return 'totalSpent';
    case 'Visits': return 'visits';
    case 'Customer Name': return 'customerName';
    case 'Service Name': return 'serviceName';
    case 'Time': return 'time';
    case 'Staff': return 'staff';
    case 'Industry': return 'industry';
    case 'Customer': return 'customer';
    case 'Items Count': return 'items';
    case 'Total': return 'total';
    case 'Method': return 'method';
    default: return header.toLowerCase();
  }
}

module.exports = {
  isSyncEnabled,
  getOrCreateSpreadsheet,
  syncTableToSheet
};
