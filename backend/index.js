const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;

// ─── Colour helpers (no extra deps) ──────────────────────────────────────────
const c = {
  reset:  '\x1b[0m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  red:    '\x1b[31m',
  cyan:   '\x1b[36m',
  grey:   '\x1b[90m',
  bold:   '\x1b[1m',
};
const log = {
  info:    (msg) => console.log(`${c.cyan}[INFO]${c.reset}  ${msg}`),
  ok:      (msg) => console.log(`${c.green}[OK]${c.reset}    ${msg}`),
  warn:    (msg) => console.log(`${c.yellow}[WARN]${c.reset}  ${msg}`),
  error:   (msg) => console.log(`${c.red}[ERROR]${c.reset} ${msg}`),
  data:    (msg) => console.log(`${c.grey}[DATA]${c.reset}  ${msg}`),
  section: (msg) => console.log(`\n${c.bold}${'─'.repeat(50)}${c.reset}\n${c.bold}${msg}${c.reset}`),
};

// ─── Global crash guards (prevent silent exits) ───────────────────────────────
process.on('uncaughtException', (err) => {
  log.error(`Uncaught Exception: ${err.message}`);
  console.error(err.stack);
  // Do NOT exit — keep server alive
});
process.on('unhandledRejection', (reason) => {
  log.error(`Unhandled Promise Rejection: ${reason?.message || reason}`);
  if (reason?.stack) console.error(reason.stack);
  // Do NOT exit — keep server alive
});

// ─── Startup checks ───────────────────────────────────────────────────────────
log.section('🐱  Cat Cafe Backend Starting');
log.info(`PORT            = ${PORT}`);
log.info(`GOOGLE_SHEET_ID = ${GOOGLE_SHEET_ID ? `${GOOGLE_SHEET_ID.slice(0,8)}…` : c.red + 'NOT SET' + c.reset}`);
const credPath = path.join(__dirname, 'credentials.json');
if (fs.existsSync(credPath)) {
  log.ok('credentials.json found');
} else {
  log.error('credentials.json NOT found — Google Sheets will fail');
}

// Initialize Google Sheets API
let googleCredentials = null;

if (process.env.GOOGLE_CREDENTIALS) {
    try {
        googleCredentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
        
        // Aggressive private key sanitization
        if (googleCredentials.private_key) {
            const originalLength = googleCredentials.private_key.length;
            
            // 1. Convert literal \r\n and \n to real newlines
            // 2. Convert escaped \\n to real newlines
            // 3. Remove any stray quotes that might have been pasted
            googleCredentials.private_key = googleCredentials.private_key
                .replace(/\\n/g, '\n')
                .replace(/\r\n/g, '\n')
                .replace(/^["']|["']$/g, '') // Remove wrapping quotes if any
                .trim();
            
            const pk = googleCredentials.private_key;
            log.info('Google Auth Deep Diagnostics:');
            log.info(`- Key starts with BEGIN: ${pk.startsWith('-----BEGIN PRIVATE KEY-----')}`);
            log.info(`- Key ends with END:     ${pk.endsWith('-----END PRIVATE KEY-----')}`);
            log.info(`- Contains real newlines: ${pk.includes('\n')}`);
            log.info(`- Key length:            ${pk.length} (Original: ${originalLength})`);
            log.info(`- Email:                 ${googleCredentials.client_email}`);
            log.info(`- Project ID:            ${googleCredentials.project_id}`);
            log.info(`- Key ID present:        ${!!googleCredentials.private_key_id}`);
            
            // Check for common mangling: double-escaped newlines
            if (pk.includes('\\n')) {
                log.error('WARNING: Private key still contains literal "\\n" strings!');
            }
        }
        
        log.ok('Using credentials from GOOGLE_CREDENTIALS environment variable');
    } catch (e) {
        log.error(`Failed to parse GOOGLE_CREDENTIALS environment variable: ${e.message}`);
    }
} else if (fs.existsSync(credPath)) {
    googleCredentials = require(credPath);
    log.ok('Using credentials from credentials.json file');
}

const auth = new google.auth.GoogleAuth({
    credentials: googleCredentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
// Compact request log: METHOD /path STATUS ms
app.use(morgan(`${c.grey}:method :url${c.reset} → :status  ${c.grey}:response-time ms${c.reset}`));

// ─── Logger for failed submissions ────────────────────────────────────────────
const logFailedSubmission = (data, error) => {
    const logPath = path.join(__dirname, 'failed_submissions.log');
    const logEntry = {
        timestamp: new Date().toISOString(),
        data,
        error: error.message
    };
    fs.appendFileSync(logPath, JSON.stringify(logEntry) + '\n');
    log.warn(`Submission saved locally (Sheets failed): ${logPath}`);
};

// ─── POST /api/submit ─────────────────────────────────────────────────────────
app.post('/api/submit', async (req, res) => {
    log.section('📥  New Feedback Submission');
    const rawData = req.body;

    const feedbackData = {
        fullName: rawData.fullName,
        phone: rawData.phone,
        residence: rawData.residence,
        email: rawData.email,
        service: rawData.ratings?.service,
        foodQuality: rawData.ratings?.foodQuality,
        beverageQuality: rawData.ratings?.beverageQuality,
        atmosphere: rawData.ratings?.atmosphere,
        valueForMoney: rawData.ratings?.valueForMoney,
        cleanliness: rawData.ratings?.cleanliness,
        staffFriendliness: rawData.ratings?.staffFriendliness,
        experience: rawData.experience,
        interests: (rawData.interests || []).join(', '),
        visitedBefore: rawData.visitedBefore,
        visitFrequency: rawData.visitFrequency,
        source: rawData.source,
        otherSource: rawData.otherSource,
        timestamp: new Date().toLocaleString()
    };

    log.info(`Name     : ${feedbackData.fullName || '(none)'}`);
    log.info(`Email    : ${feedbackData.email || '(none)'}`);
    log.info(`Source   : ${feedbackData.source || '(none)'}`);
    log.info(`Ratings  : service=${feedbackData.service} food=${feedbackData.foodQuality} atm=${feedbackData.atmosphere}`);
    log.info(`Interests: ${feedbackData.interests || '(none)'}`);

    if (!feedbackData.fullName) {
        log.warn('Rejected: fullName is missing');
        return res.status(400).json({ error: 'Full Name is required' });
    }

    try {
        if (!GOOGLE_SHEET_ID) throw new Error('GOOGLE_SHEET_ID is not configured');

        log.info('Writing to Google Sheets…');
        const values = [[
            feedbackData.fullName, feedbackData.phone, feedbackData.residence,
            feedbackData.email, feedbackData.service, feedbackData.foodQuality,
            feedbackData.beverageQuality, feedbackData.atmosphere, feedbackData.valueForMoney,
            feedbackData.cleanliness, feedbackData.staffFriendliness, feedbackData.experience,
            feedbackData.interests, feedbackData.visitedBefore, feedbackData.visitFrequency,
            feedbackData.source, feedbackData.otherSource, feedbackData.timestamp
        ]];

        await sheets.spreadsheets.values.append({
            spreadsheetId: GOOGLE_SHEET_ID,
            range: 'Sheet1!A:R',
            valueInputOption: 'USER_ENTERED',
            requestBody: { values }
        });

        log.ok(`Submission written to Google Sheets ✓  (${feedbackData.fullName})`);
        res.status(200).json({ message: 'Feedback submitted successfully to Google Sheets' });

    } catch (error) {
        log.error(`Google Sheets write failed: ${error.message}`);
        logFailedSubmission(feedbackData, error);
        res.status(502).json({
            error: 'Feedback captured locally but failed to sync with Google Sheets. We will retry later.',
            details: error.message
        });
    }
});

// ─── GET /api/insights ────────────────────────────────────────────────────────
app.get('/api/insights', async (req, res) => {
    log.section('📊  Insights Request');
    const logPath = path.join(__dirname, 'failed_submissions.log');
    let localFailures = 0;

    if (fs.existsSync(logPath)) {
        const content = fs.readFileSync(logPath, 'utf8');
        localFailures = content.trim().split('\n').filter(l => l).length;
        if (localFailures > 0) log.warn(`${localFailures} unsynced local submission(s) found`);
    }

    try {
        if (!GOOGLE_SHEET_ID) throw new Error('GOOGLE_SHEET_ID not configured');

        log.info('Fetching data from Google Sheets…');
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: GOOGLE_SHEET_ID,
            range: 'Sheet1!A:R',
        });

        const rows = response.data.values;
        let excelData = [];

        const toCamelCase = (str) => {
            if (!str) return '';
            // If it's already one word and has internal uppercase (like fullName), keep it
            if (!/[^a-zA-Z0-9]/.test(str) && /[a-z]/.test(str) && /[A-Z]/.test(str)) return str;
            
            return str.toLowerCase()
                .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
                .trim();
        };

        if (rows && rows.length > 0) {
            const firstRow = rows[0];
            let rawHeaders = [];
            let dataRows = [];

            // Detect if first row is headers or data
            if (firstRow[0] && (firstRow[0].toLowerCase().includes('name') || firstRow[0].toLowerCase().includes('full'))) {
                rawHeaders = firstRow;
                dataRows = rows.slice(1);
                log.info('Headers detected in Google Sheets');
            } else {
                // No headers found, use default header sequence
                rawHeaders = [
                    'Full Name', 'Phone', 'Residence', 'Email', 
                    'Service', 'Food Quality', 'Beverage Quality', 'Atmosphere', 
                    'Value for Money', 'Cleanliness', 'Staff Friendliness', 'Experience', 
                    'Interests', 'Visited Before', 'Visit Frequency', 'Source', 
                    'Other Source', 'Timestamp'
                ];
                dataRows = rows;
                log.warn('No headers detected in Google Sheets — using default mapping');
            }

            const headers = rawHeaders.map(h => h ? toCamelCase(h) : `col${Math.random().toString(36).substr(2, 5)}`);
            
            excelData = dataRows.map(row => {
                const rowObj = {};
                headers.forEach((header, index) => { rowObj[header] = row[index] || ''; });
                return rowObj;
            });
        }

        const total = excelData.length;
        log.ok(`Fetched ${total} rows from Google Sheets`);

        // Average Rating (service field only — kept for backward compat)
        const avgRating = total > 0
            ? (excelData.reduce((acc, curr) => acc + (parseFloat(curr.service) || 0), 0) / total).toFixed(1)
            : 0;
        log.data(`Average rating (service): ${avgRating}`);

        // Real Satisfaction Score: % whose 7-category average >= 4.0
        const SCORE_KEYS = ['service', 'foodQuality', 'beverageQuality', 'atmosphere', 'valueForMoney', 'cleanliness', 'staffFriendliness'];
        const satisfiedCount = excelData.filter(row => {
            const scores = SCORE_KEYS.map(k => parseFloat(row[k])).filter(s => !isNaN(s));
            if (scores.length === 0) return false;
            return (scores.reduce((a, b) => a + b, 0) / scores.length) >= 4.0;
        }).length;
        const satisfactionScore = total > 0 ? Math.round((satisfiedCount / total) * 100) : 0;
        log.data(`Satisfaction: ${satisfiedCount}/${total} rated avg>=4.0 → ${satisfactionScore}%`);

        // Top Comments calculation
        const feedbackWithAvg = excelData.map(row => {
            const scores = SCORE_KEYS.map(k => parseFloat(row[k])).filter(s => !isNaN(s));
            const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
            return { ...row, avgRating: avg };
        });

        // Filter for comments that actually have text and sort
        const commentedFeedback = feedbackWithAvg.filter(fb => fb.experience && fb.experience.length > 10);
        
        const best = [...commentedFeedback]
            .sort((a, b) => b.avgRating - a.avgRating)
            .slice(0, 3);
            
        const worst = [...commentedFeedback]
            .filter(fb => fb.avgRating < 3.0) // Only show actually negative/mediocre reviews in improvement
            .sort((a, b) => a.avgRating - b.avgRating)
            .slice(0, 3);

        log.data(`Top Comments: commentedCount=${commentedFeedback.length}, best=${best.length}, worst=${worst.length}`);

        // Returning Visitors Rate
        const returningCount = excelData.filter(row => row.visitedBefore?.toLowerCase().includes('yes')).length;
        const returningRate = total > 0 ? Math.round((returningCount / total) * 100) : 0;
        log.data(`Returning visitors: ${returningCount}/${total} → ${returningRate}%`);

        log.ok(`Insights ready — sending response`);
        res.json({
            message: 'Live Insights from Google Sheets',
            syncStatus: {
                localFailures,
                googleSheetsConfigured: !!GOOGLE_SHEET_ID,
                lastSync: new Date().toISOString()
            },
            stats: {
                total,
                avgRating: parseFloat(avgRating),
                satisfaction: satisfactionScore,
                returningRate
            },
            topComments: {
                best,
                worst
            },
            allFeedback: [...excelData].reverse()
        });

    } catch (error) {
        log.error(`Insights fetch failed: ${error.message}`);
        res.json({
            message: 'Insights (Fallback Mode)',
            syncStatus: {
                localFailures,
                googleSheetsConfigured: !!GOOGLE_SHEET_ID,
                error: 'Google Sheets Reader failed'
            },
            stats: { total: localFailures > 0 ? 'Sync Required' : 0, avgRating: 0, satisfaction: 0, returningRate: 0 }
        });
    }
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    log.section('✅  Server Ready');
    log.ok(`Listening on http://localhost:${PORT}`);
    log.info('Waiting for requests…\n');
});
