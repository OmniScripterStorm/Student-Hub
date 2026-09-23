/**
 * =========================================================================
 * TagSci G11 Study WebApp - Google Apps Script (GAS) OTA Server
 * =========================================================================
 * 
 * INSTRUCTIONS FOR G11 REPRESENTATIVE / EDITORIAL COUNCIL:
 * 
 * 1. Open Google Drive (https://drive.google.com).
 * 2. Create a folder named "TagSci G11 Study Materials" (or similar).
 * 3. Inside the folder, upload or create your "updates.json" file.
 *    (Get file ID from the share link: drive.google.com/file/d/FILE_ID/view).
 * 4. Go to https://script.google.com and click "New project".
 * 5. Paste this entire code into `Code.gs`.
 * 6. Replace `UPDATES_FILE_ID` below with your updates.json file ID.
 * 7. Click "Deploy" -> "New deployment":
 *    - Type: Web app
 *    - Description: TagSci G11 OTA Sync Endpoint
 *    - Execute as: Me
 *    - Who has access: Anyone (Important!)
 * 8. Copy the generated Web App URL (ends with `/exec`).
 * 9. Paste that URL into the WebApp's "⚙️ Configure OTA URL" dialog!
 * =========================================================================
 */

// Replace this with the File ID of updates.json in your Google Drive
var UPDATES_FILE_ID = "YOUR_GOOGLE_DRIVE_UPDATES_JSON_FILE_ID_HERE";

function doGet(e) {
  try {
    // 1. Fetch file content directly from Google Drive
    var file = DriveApp.getFileById(UPDATES_FILE_ID);
    var content = file.getBlob().getDataAsString();
    
    // 2. Return with CORS headers enabled for browser fetch()
    return ContentService.createTextOutput(content)
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    var errorResponse = {
      status: "error",
      message: "Could not retrieve updates.json from Google Drive.",
      details: error.toString()
    };
    
    return ContentService.createTextOutput(JSON.stringify(errorResponse))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
