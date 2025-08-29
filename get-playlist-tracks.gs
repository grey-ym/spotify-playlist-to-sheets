
// This script fetches tracks from specified Spotify playlist and inserts into Google Sheets

const playlist_id = getPlaylistId('https://open.spotify.com/playlist/'); // Insert your playlist URL here
const full_sync = true; // Keep it false to add new tracks only, set to true to reset the sheet
const skip = null; // Set to a number to skip the first N tracks in the playlist
const format_table = true; // Set to true to format the table in the sheet

function getPlaylistTracks() {
    const playlist_info = getPlaylistInfo(playlist_id);
    if (!playlist_info) return;

    // Normalizing the playlist name to avoid invalid characters in a sheet name
    const playlist_name = normalizeSheetName(playlist_info.name);
    const playlist_total = playlist_info.total;

    Logger.log(`Playlist: ${playlist_name}, ${playlist_total} tracks`);

    const current_time = new Date(); // Get the current date and time
    const formatted_time = Utilities.formatDate(current_time, "GMT+4", "MMMM d, yyyy - hh:mm a");
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName(playlist_name);
    let sheet_last_row;
    let sheet_last_column;
    let sheet_last_index = 0;

    // Checking if a sheet with the playlist name already exists
    if (sheet) {
        if (full_sync) {
            Logger.log(`Sheet "${playlist_name}" already exists. Clearing contents...`);
            sheet.clearContents();
            sheet.appendRow([' # ', 'Track ', 'Artist ', 'Album ', 'Release Date ', 'Track ID', ` Last sync: ${formatted_time} `]); // Setting up the header row
        }
        else {
            Logger.log(`Updating sheet "${playlist_name}"...`);
            sheet_last_row = sheet.getLastRow();
            sheet_last_column = sheet.getLastColumn();
            sheet_last_index = sheet.getRange(sheet_last_row, 1).getValue();
            sheet.getRange(1, sheet_last_column).setValue(` Last update: ${formatted_time} `);
        }
    }
    else {
        Logger.log(`Creating a new sheet: "${playlist_name}"`);
        sheet = spreadsheet.insertSheet(playlist_name);
        sheet.appendRow([' # ', 'Track ', 'Artist ', 'Album ', 'Release Date ', 'Track ID', ` Last sync: ${formatted_time} `]); // Setting up the header row
    }

    const limit = 100; // API limit for tracks per request
    const market = playlist_name === 'RUS' ? 'UA' : 'US'; // Using Ukrainian market for RUS playlist, US for others
    let offset = skip || sheet_last_index;; // Skip the first N tracks
    let track_index = sheet_last_index + 1; // Track index for numbering
    let tracks_added = 0; // Number of added trasks

    if (offset > 0) {
        if (sheet_last_index === playlist_total) {
            Logger.log(`✅ No need to update - playlist is up to date.`);
            return;
        }
        else if (sheet_last_index > playlist_total) {
            Logger.log(`⚠️ Playlist structure has changed. Full sync is recommended.`);
            return;
        }
        else {
            Logger.log(`Skipping the first ${offset} tracks...`);
        }
    }

    while (true) {
        const url = `https://api.spotify.com/v1/playlists/${playlist_id}/tracks?offset=${offset}&limit=${limit}&market=${market}`;

        let response;
        try {
            response = UrlFetchApp.fetch(url, {
                method: 'get',
                headers: { Authorization: `Bearer ${Access_Token}` },
                muteHttpExceptions: true,
            });
        }
        catch (error) {
            Logger.log(`❌ Error while calling API: ${error}`);
            break;
        }

        const statusCode = response.getResponseCode();
        if (statusCode !== 200) {
            Logger.log(`❌ API error: ${statusCode} - ${response.getContentText()}`);
            break;
        }

        const data = JSON.parse(response.getContentText());

        // Checking if there are no more items to process
        if (!data.items || data.items.length === 0) {

            // Formatting the table if required
            if (format_table) {
                sheet_last_column = sheet.getLastColumn();
                sheet_last_row = sheet.getLastRow();
                sheet.getRange(1, 1, sheet_last_row, sheet_last_column).setBackground(null).setFontWeight(null).setFontSize(10).setVerticalAlignment('middle').setHorizontalAlignment('left').setFontColor('#434343').setFontFamily("Roboto"); // Clear previous formatting
                sheet.getRange(1, 1, 1, 6).setBackground('#089d6e').setFontSize(11).setFontWeight('bold').setVerticalAlignment('bottom').setFontColor('#ffffff'); // Header row formatting
                sheet.getRange(1, 1, sheet_last_row, 1).setHorizontalAlignment('center'); // Center align the first column
                if (sheet_last_row > 1) {
                    sheet.getRange(2, 5, sheet_last_row - 1, 1).setHorizontalAlignment('center');
                }
            }
            if (tracks_added > 0) {
                Logger.log(`✅ Processed all tracks successfully`);
                const text_song = (tracks_added <= 1) ? 'song has' : 'songs have';
                Logger.log(`✅ ${tracks_added} ${text_song} been added to playlist "${playlist_name}"`);
            }
            break;
        }

        for (const item of data.items) {
            const track = item.track;
            if (!track) {
                Logger.log(`⚠️ Skipped item: track is null`);
                continue;
            }

            const track_name = track.name || '';
            const track_artists = track.artists.map(artist => artist.name).join(', '); // Joining artist names with a comma
            const album_name = track.album.name;
            const album_name_1st_char = album_name.charAt(0);
            const track_album = ['=', '+'].includes(album_name_1st_char) ? `'${album_name}` : album_name; // Ensuring album names starting with '=' or '+' are treated as text
            const track_release_date = track.album.release_date;
            const track_id = track.is_local ? 'local track' : track.id;

            sheet.appendRow([track_index, track_name, track_artists, track_album, track_release_date, ` ${track_id}`]);
            Logger.log(`✅ Row #${track_index} written: ${track_name} — ${track_artists}`); // Logging the processed track
            track_index++;
            tracks_added++;
        }

        // Incrementing the offset for the next batch of tracks
        offset += limit;
    }
}

// Removing invalid characters the playlist name to ensure it can be used as a sheet name
function normalizeSheetName(sheet_name) {
    return sheet_name
        .replace(/[\[\]\*\/\\\?\:]/g, '')
        .substring(0, 100); // Maximum length for a sheet name is 100 characters
}
