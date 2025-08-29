
// This script fetches all Spotify playlists of the authenticated user and inserts into Google Sheets

function getPlaylists() {

    const sheetname = 'Playlists';
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName(sheetname);

    // Checking if a sheet with the playlist name already exists
    if (sheet) {
        Logger.log(`⚠️ Sheet "${sheetname}" already exists. Clearing contents...`);
        sheet.clearContents();
    }
    else {
        Logger.log(`Creating a new sheet: "${sheetname}"`);
        sheet = spreadsheet.insertSheet(sheetname);
    }

    // Setting up the header row
    sheet.appendRow(['Id', 'Playlist', 'Owner', 'Total Songs']);

    let url = 'https://api.spotify.com/v1/me/playlists?limit=50';
    let index = 1;

    while (url) {
        try {
            const response = UrlFetchApp.fetch(url, {
                method: 'get',
                headers: { Authorization: `Bearer ${Access_Token}` },
                muteHttpExceptions: true,
            });

            const statusCode = response.getResponseCode();
            if (statusCode !== 200) {
                Logger.log(`❌ API error: ${statusCode} - ${response.getContentText()}`);
                break;
            }

            const data = JSON.parse(response.getContentText());
            const playlists = data.items || [];

            for (const playlist of playlists) {

                const id = playlist.id || '';
                const name = playlist.name || '';
                const owner = playlist.owner?.display_name || playlist.owner?.id || 'unknown';
                const total = playlist.tracks?.total || 0;

                sheet.appendRow([index, name, owner, total]);
                Logger.log(`✅ Playlist #${index}: ${name} (${totalTracks} tracks)`);
                index++;
            }

            url = data.next; // Get the next page URL

        }
        catch (error) {
            Logger.log(`❌ Error while calling API: ${error}`);
            break;
        }
    }

    Logger.log(`✅ All playlists have been processed. Total: ${index - 1}`);
}
