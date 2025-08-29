
// This script fetches information about a playlist

function getPlaylistInfo(id) {
    
    const url = `https://api.spotify.com/v1/playlists/${id}`;

    try {
        const response = UrlFetchApp.fetch(url, {
            method: 'get',
            headers: { Authorization: `Bearer ${Access_Token}` },
            muteHttpExceptions: true,
        });

        const statusCode = response.getResponseCode();
        if (statusCode !== 200) {
            Logger.log(`❌ Failed to fetch playlist info: ${statusCode} - ${response.getContentText()}`);
            return null;
        }
        const data = JSON.parse(response.getContentText());
        return {
            name: data.name || `Playlist_${id}`, // Returns playlist id if name is not available
            total: data.tracks.total || `_`

        };
    }
    catch (error) {
        Logger.log(`❌ Error fetching playlist info: ${error}`);
        return null;
    }
}