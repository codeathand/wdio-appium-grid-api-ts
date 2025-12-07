export async function swipeRightApp(
  driver: WebdriverIO.Browser,
): Promise<void> {
  // Get screen dimensions
  const { width, height } = await driver.getWindowRect();

  // Start from middle of the screen
  const startX = Math.floor(width * 0.2); // left side (20% from left)
  const endX = Math.floor(width * 0.8); // right side (80% from left)
  const y = Math.floor(height / 2); // middle vertically

  // Perform swipe
  await driver.performActions([
    {
      type: 'pointer',
      id: 'finger1',
      parameters: { pointerType: 'touch' },
      actions: [
        { type: 'pointerMove', duration: 0, x: startX, y },
        { type: 'pointerDown', button: 0 },
        { type: 'pause', duration: 100 },
        { type: 'pointerMove', duration: 600, x: endX, y }, // swipe duration
        { type: 'pointerUp', button: 0 },
      ],
    },
  ]);

  // Release action
  await driver.releaseActions();
}
