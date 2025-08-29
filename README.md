# Spotify Playlist Tracks to Google Sheets

A Google Apps Script that allows you to export your Spotify playlists and tracks directly into Google Sheets.
___
**Features:**

- Fetch your personal Spotify playlists and save them in Google Sheets
- Export tracks from a selected playlist into a new spreadsheet
- Retrieve playlist information (name, description, etc.)
- Automatically creates a new sheet named after the playlist
- Enable or disable spreadsheet formatting
- Currently, the script fetches the following track data from the Spotify API:
  - Track Name
  - Artist
  - Album
  - Release Year
  - *(additional track info can be added as desired)*

___
**Requirements / Notes:**

- To run the script, all files must be added to the Google Apps Script editor of the spreadsheet you want to work with.
- You must authorize the script to run under your Google account.
- A Spotify API token is required. You can obtain it for free at [Spotify for Developers](https://developer.spotify.com/documentation/web-api)
- The token is valid for one hour, so you may need to refresh it frequently.
- To avoid manually updating the token each time, you can create a small initial script that retrieves the Spotify token using your Client ID and Client Secret, and then runs the rest of the scripts automatically.
