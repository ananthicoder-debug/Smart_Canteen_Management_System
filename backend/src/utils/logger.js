const fs = require('fs');
const path = require('path');

const logDir = path.resolve(__dirname, '..', '..', 'logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
const logFile = path.join(logDir, 'backend.log');

function formatMessage(level, msg) {
  const time = new Date().toISOString();
  return `[${time}] [${level.toUpperCase()}] ${msg}\n`;
}

exports.info = (msg) => {
  const line = formatMessage('info', typeof msg === 'object' ? JSON.stringify(msg) : msg);
  fs.appendFile(logFile, line, (err) => { if (err) console.error('Failed to write log:', err); });
  console.log(line.trim());
};

exports.error = (msg) => {
  const line = formatMessage('error', typeof msg === 'object' ? JSON.stringify(msg) : msg);
  fs.appendFile(logFile, line, (err) => { if (err) console.error('Failed to write log:', err); });
  console.error(line.trim());
};
