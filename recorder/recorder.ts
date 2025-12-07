import fs from 'fs';
import path from 'path';

const logFile = path.join(process.cwd(), 'action-records.json');

export function startRecorder() {
  fs.writeFileSync(logFile, JSON.stringify([], null, 2));
  console.log('🎥 Recorder started, logging to', logFile);
}

export function recordAction(action: string, selector?: string, value?: any) {
  const log = { action, selector, value, timestamp: new Date().toISOString() };

  try {
    let logs: any[] = [];
    if (fs.existsSync(logFile)) {
      logs = JSON.parse(fs.readFileSync(logFile, 'utf-8'));
    }

    logs.push(log);
    fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
  } catch (err) {
    console.error('❌ Failed to record action', err);
  }
}
