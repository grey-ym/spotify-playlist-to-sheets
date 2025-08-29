
// Extracts the playlist ID from a given Spotify playlist URL

function getPlaylistId(url) {
    const match = url.match(/playlist\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
}