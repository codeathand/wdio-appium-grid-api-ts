export function extractNumber(valueText: string): number {
  // matches "15,33" from "123\n15,33\nEUR"
  const match = valueText.match(/(\d+,\d+)/);
  if (!match) throw new Error(`No numeric value found in "${valueText}"`);
  return parseFloat(match[1].replace(',', '.'));
}
