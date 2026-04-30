const fs = require('fs');
const path = require('path');

const dir = 'e:/Feedback/admin/src';
const files = [
  'Settings.tsx',
  'FeedbackList.tsx',
  'Dashboard.tsx',
  'components/NotificationPanel.tsx',
  'components/FeedbackModal.tsx',
  'App.tsx'
];

files.forEach(file => {
  const fullPath = path.join(dir, file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    // Regex to match "dark:..." classes. Handles trailing space or within quotes
    // Match dark: followed by word chars, dashes, slashes, brackets
    content = content.replace(/dark:[a-zA-Z0-9\-\/\[\]\.]+\s?/g, '');
    // Clean up double spaces left behind
    content = content.replace(/  +/g, ' ');
    // Clean up trailing spaces before quote
    content = content.replace(/\s+"/g, '"');
    
    fs.writeFileSync(fullPath, content);
    console.log(`Cleaned ${file}`);
  }
});
