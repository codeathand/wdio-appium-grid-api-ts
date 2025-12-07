import fs from 'fs';
import path from 'path';
import { spawn, ChildProcess } from 'child_process';

const HTML_DIR = path.join(__dirname, '../../mjpeg-viewers');

if (!fs.existsSync(HTML_DIR)) fs.mkdirSync(HTML_DIR);

export function generateMJPEGViewer(
  streamUrls: string | string[],
  scenarioName: string,
  deviceTags: string | string[],
): ChildProcess {
  const urls = Array.isArray(streamUrls) ? streamUrls : [streamUrls];
  const tags = Array.isArray(deviceTags) ? deviceTags : [deviceTags];

  const HTML_FILE = path.join(HTML_DIR, `${deviceTags}.html`);

  let htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Viewer - ${scenarioName}</title>
    <style>
      body { font-family: sans-serif; display: flex; flex-wrap: wrap; gap: 20px; }
      .device { border: 1px solid #ccc; padding: 10px; width: 380px; }
      img { width: 100%; height: auto; border: 1px solid #000; }
    </style>
  </head>
  <body>
  `;

  urls.forEach((url, idx) => {
    const tag = tags[idx] ?? `Device ${idx + 1}`;
    htmlContent += `
      <div class="device">
        <h3>${scenarioName} - ${tag}</h3>
        <img src="${url}" alt="${scenarioName} - ${tag}" />
      </div>
    `;
  });

  htmlContent += `</body></html>`;

  fs.writeFileSync(HTML_FILE, htmlContent, 'utf-8');

  const startCommand =
    process.platform === 'darwin'
      ? 'open'
      : process.platform === 'win32'
        ? 'start'
        : 'xdg-open';

  const proc = spawn(startCommand, [HTML_FILE], {
    shell: true,
    detached: true,
  });
  console.log(
    `🌐 MJPEG viewer opened for ${scenarioName} (${tags.join(', ')})`,
  );

  return proc;
}
