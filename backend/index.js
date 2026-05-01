const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;
const ALLOWED_ORIGIN = process.env.CORS_ORIGIN || '*';

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
});
process.on('unhandledRejection', (reason) => {
  log.error(`Unhandled Promise Rejection: ${reason?.message || reason}`);
  if (reason?.stack) console.error(reason.stack);
});

// ─── Startup checks ───────────────────────────────────────────────────────────
log.section('🐱  Cat Cafe Backend Starting');
log.info(`PORT            = ${PORT}`);
log.info(`GOOGLE_SHEET_ID = ${GOOGLE_SHEET_ID ? `${GOOGLE_SHEET_ID.slice(0,8)}…` : c.red + 'NOT SET' + c.reset}`);
const credPath = path.join(__dirname, 'credentials.json');

// Initialize Google Sheets API
let googleCredentials = null;
if (process.env.GOOGLE_CREDENTIALS) {
    try {
        googleCredentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
        if (googleCredentials.private_key) {
            googleCredentials.private_key = googleCredentials.private_key
                .replace(/\\n/g, '\n')
                .replace(/\r\n/g, '\n')
                .replace(/^["']|["']$/g, '')
                .trim();
        }
        log.ok('Using credentials from GOOGLE_CREDENTIALS env var');
    } catch (e) {
        log.error(`Failed to parse GOOGLE_CREDENTIALS: ${e.message}`);
    }
} else if (fs.existsSync(credPath)) {
    googleCredentials = require(credPath);
    log.ok('Using credentials from credentials.json');
}

const auth = new google.auth.GoogleAuth({
    credentials: googleCredentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });

// ─── Middleware & Security ───────────────────────────────────────────────────
app.use(helmet()); 
app.use(cors({
    origin: ALLOWED_ORIGIN === '*' ? '*' : ALLOWED_ORIGIN.split(','),
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Rate Limiting
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests, please try again later.' }
});
const submitLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: { error: 'Submission limit reached. Please try again later.' }
});
app.use('/api/', generalLimiter);

app.use(morgan(`${c.grey}:method :url${c.reset} → :status  ${c.grey}:response-time ms${c.reset}`));

// Validation Helper
const validateSubmission = (req, res, next) => {
    const { fullName, email, ratings } = req.body;
    if (!fullName || fullName.trim().length < 2) {
        return res.status(400).json({ error: 'Valid Full Name is required' });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }
    if (!ratings || typeof ratings !== 'object') {
        return res.status(400).json({ error: 'Rating data is required' });
    }
    next();
};

// ─── Logger for failed submissions ────────────────────────────────────────────
const logFailedSubmission = (data, error) => {
    const logPath = path.join(__dirname, 'failed_submissions.log');
    const logEntry = { timestamp: new Date().toISOString(), data, error: error.message };
    fs.appendFileSync(logPath, JSON.stringify(logEntry) + '\n');
    log.warn(`Submission saved locally: ${logPath}`);
};

// ─── POST /api/submit ─────────────────────────────────────────────────────────
app.post('/api/submit', submitLimiter, validateSubmission, async (req, res) => {
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

    try {
        if (!GOOGLE_SHEET_ID) throw new Error('GOOGLE_SHEET_ID missing');
        log.info('Writing to Sheets…');
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
        log.ok(`Success: ${feedbackData.fullName}`);
        res.status(200).json({ message: 'Success' });
    } catch (error) {
        log.error(`Sheets failed: ${error.message}`);
        logFailedSubmission(feedbackData, error);
        res.status(502).json({ error: 'Saved locally, sync failed.' });
    }
});

// ─── Simple In-Memory Cache ──────────────────────────────────────────────────
let insightsCache = null;
let lastCacheTime = 0;
const CACHE_DURATION = 60 * 1000; // 60 seconds

// ─── GET /api/insights ────────────────────────────────────────────────────────
app.get('/api/insights', async (req, res) => {
    log.section('📊  Insights Request');
    
    // Check Cache
    const now = Date.now();
    if (insightsCache && (now - lastCacheTime < CACHE_DURATION)) {
        log.ok('Serving from Cache (60s)');
        return res.json(insightsCache);
    }

    const logPath = path.join(__dirname, 'failed_submissions.log');
    let localFailures = 0;
    if (fs.existsSync(logPath)) {
        const content = fs.readFileSync(logPath, 'utf8');
        localFailures = content.trim().split('\n').filter(l => l).length;
    }

    try {
        if (!GOOGLE_SHEET_ID) throw new Error('GOOGLE_SHEET_ID missing');
        log.info('Fetching from Sheets…');
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: GOOGLE_SHEET_ID,
            range: 'Sheet1!A:R',
        });
        const rows = response.data.values;
        let excelData = [];
        const toCamelCase = (str) => {
            if (!str) return '';
            if (!/[^a-zA-Z0-9]/.test(str) && /[a-z]/.test(str) && /[A-Z]/.test(str)) return str;
            return str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase()).trim();
        };

        if (rows && rows.length > 0) {
            const firstRow = rows[0];
            const hasHeaders = firstRow[0] && (firstRow[0].toLowerCase().includes('name') || firstRow[0].toLowerCase().includes('full'));
            const rawHeaders = hasHeaders ? firstRow : ['Full Name', 'Phone', 'Residence', 'Email', 'Service', 'Food Quality', 'Beverage Quality', 'Atmosphere', 'Value for Money', 'Cleanliness', 'Staff Friendliness', 'Experience', 'Interests', 'Visited Before', 'Visit Frequency', 'Source', 'Other Source', 'Timestamp'];
            const dataRows = hasHeaders ? rows.slice(1) : rows;
            const headers = rawHeaders.map(h => h ? toCamelCase(h) : `col${Math.random().toString(36).substr(2, 5)}`);
            excelData = dataRows.map(row => {
                const rowObj = {};
                headers.forEach((header, index) => { rowObj[header] = row[index] || ''; });
                return rowObj;
            });
        }

        const total = excelData.length;
        const avgRating = total > 0 ? (excelData.reduce((acc, curr) => acc + (parseFloat(curr.service) || 0), 0) / total).toFixed(1) : 0;
        const SCORE_KEYS = ['service', 'foodQuality', 'beverageQuality', 'atmosphere', 'valueForMoney', 'cleanliness', 'staffFriendliness'];
        const satisfiedCount = excelData.filter(row => {
            const scores = SCORE_KEYS.map(k => parseFloat(row[k])).filter(s => !isNaN(s));
            return scores.length > 0 && (scores.reduce((a, b) => a + b, 0) / scores.length) >= 4.0;
        }).length;
        const satisfactionScore = total > 0 ? Math.round((satisfiedCount / total) * 100) : 0;
        const feedbackWithAvg = excelData.map(row => {
            const scores = SCORE_KEYS.map(k => parseFloat(row[k])).filter(s => !isNaN(s));
            return { ...row, avgRating: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0 };
        });
        const commentedFeedback = feedbackWithAvg.filter(fb => fb.experience && fb.experience.length > 10);
        const best = [...commentedFeedback].sort((a, b) => b.avgRating - a.avgRating).slice(0, 3);
        const worst = [...commentedFeedback].filter(fb => fb.avgRating < 3.0).sort((a, b) => a.avgRating - b.avgRating).slice(0, 3);
        const returningCount = excelData.filter(row => row.visitedBefore?.toLowerCase().includes('yes')).length;
        const returningRate = total > 0 ? Math.round((returningCount / total) * 100) : 0;

        res.json({
            message: 'Live Insights',
            syncStatus: { localFailures, googleSheetsConfigured: true, lastSync: new Date().toISOString() },
            stats: { total, avgRating: parseFloat(avgRating), satisfaction: satisfactionScore, returningRate },
            topComments: { best, worst },
            allFeedback: [...excelData].reverse()
        });

        // Update Cache
        insightsCache = {
            message: 'Live Insights (Cached)',
            syncStatus: { localFailures, googleSheetsConfigured: true, lastSync: new Date().toISOString() },
            stats: { total, avgRating: parseFloat(avgRating), satisfaction: satisfactionScore, returningRate },
            topComments: { best, worst },
            allFeedback: [...excelData].reverse()
        };
        lastCacheTime = Date.now();

    } catch (error) {
        log.error(`Fetch failed: ${error.message}`);
        res.json({ message: 'Fallback Mode', stats: { total: 0, avgRating: 0, satisfaction: 0, returningRate: 0 } });
    }
});

app.listen(PORT, () => {
    log.section('✅  Server Ready');
    log.ok(`Listening on http://localhost:${PORT}`);
});
