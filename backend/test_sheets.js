require('dotenv').config();
const { google } = require('googleapis');
const path = require('path');

const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, 'credentials.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });

async function test() {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: 'Sheet1!A:R',
        });
        console.log('Success! First 5 rows:', response.data.values.slice(0, 5));
    } catch (error) {
        console.error('Error details:', error.response ? error.response.data : error.message);
    }
}
test();
