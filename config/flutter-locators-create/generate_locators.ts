import fs from 'fs';
import path from 'path';

// Paths
const translationsDir = path.join(__dirname, './translations');
const flutterDir = path.join(__dirname, './flutter');
const outputDir = path.join(__dirname, './locators');

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

// Load .arb files
const enData = JSON.parse(
  fs.readFileSync(path.join(translationsDir, 'intl_en.arb'), 'utf-8'),
);
const srData = JSON.parse(
  fs.readFileSync(path.join(translationsDir, 'intl_sr.arb'), 'utf-8'),
);

// Load l10n.dart
const l10nFile = path.join(flutterDir, 'l10n.dart');
const l10nContent = fs.readFileSync(l10nFile, 'utf-8');

// Regex: /// `doc` followed by String get <key> { return Intl.message('English', ... )
const l10nRegex =
  /\/\/\/\s*`([^`]+)`[\s\S]*?String get (\w+)\s*{[\s\S]*?Intl\.message\(\s*'([^']+)'/g;
const l10nMatches = [...l10nContent.matchAll(l10nRegex)];

const keysMap: Record<string, { english: string; serbian: string }> = {};

l10nMatches.forEach((m) => {
  const docComment = m[1]; // e.g. 'Authorized account'
  const key = m[2]; // e.g. 'account_authorized_title'
  const intlText = m[3]; // English text from Intl.message

  const english = intlText || enData[key] || docComment;
  const serbian = srData[key] || english;

  keysMap[key] = { english, serbian };
});

// Optional: parse translation_keys.dart for extra keys not in l10n.dart
const keysFile = path.join(flutterDir, 'translation_keys.dart');
if (fs.existsSync(keysFile)) {
  const keysContent = fs.readFileSync(keysFile, 'utf-8');
  const keysRegex = /\/\/\/\s*`([^`]+)`[\s\S]*?String get (\w+)\s*{/g;
  const keysMatches = [...keysContent.matchAll(keysRegex)];

  keysMatches.forEach((m) => {
    const docComment = m[1];
    const key = m[2];

    // Skip if already in l10n.dart
    if (keysMap[key]) return;

    const english = enData[key] || docComment;
    const serbian = srData[key] || english;

    keysMap[key] = { english, serbian };
  });
}

// Generate index.ts
let outputContent = `// Auto-generated locators\n\n`;

for (const [key, { english, serbian }] of Object.entries(keysMap)) {
  outputContent += `export const ${key} = {\n  english: \`${english}\`,\n  serbian: \`${serbian}\`,\n};\n\n`;
}

const outputFile = path.join(outputDir, 'index.ts');
fs.writeFileSync(outputFile, outputContent, 'utf-8');

console.log(
  `✅ Generated locators: ${Object.keys(keysMap).length} keys in ${outputFile}`,
);
