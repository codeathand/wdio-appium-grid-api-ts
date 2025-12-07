const fileNameLogPrefix: string = "'memory.ts'";

export class Memory {
  dictionary: Record<string, string> = {};

  constructor() {
    this.dictionary = {};
  }

  getFormattedMemories(): string {
    return JSON.stringify(this.dictionary, null, 2);
  }

  get(key: string): string {
    if (this.dictionary[key]) {
      return this.dictionary[key];
    }
    throw new Error(
      `${fileNameLogPrefix} Key "${key}" not found in Memory. Items were: ${this.getFormattedMemories()}`,
    );
  }

  set(key: string, value: string): void {
    console.log(`📝 memory.set: "${key}" = "${value}"`);
    this.dictionary[key] = value;
  }

  has(key: string): boolean {
    return this.dictionary[key] !== undefined;
  }

  delete(key: string): void {
    if (this.dictionary[key]) {
      delete this.dictionary[key];
    }
  }

  deleteAll(): void {
    if (this.dictionary.count) {
      console.log(
        `${fileNameLogPrefix}: Clearing all Memory items. Items were: ${this.getFormattedMemories()}`,
      );
    }
    this.dictionary = {};
  }
}
export const memory = new Memory();
