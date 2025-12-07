export function setTokenInContext(world: any, token: string) {
  if (!world.context) world.context = {};
  world.context.access_token = token;
}

export function getTokenFromContext(world: any): string | undefined {
  return world.context?.access_token;
}

export function replacePlaceholders(input: string, context: any): string {
  return input.replace(/\{\{(.+?)\}\}/g, (_, key) => context?.[key] || '');
}

export function storeValueInContext(world: any, key: string, value: any) {
  if (!world.context) world.context = {};
  world.context[key] = value;
}
