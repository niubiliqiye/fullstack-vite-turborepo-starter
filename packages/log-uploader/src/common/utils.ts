export function ensureArray<T>(value?: T | T[]): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

export function maskValue(value: any): any {
  if (typeof value === 'string') {
    if (value.length <= 6) return '***';
    return `${value.slice(0, 3)}***${value.slice(-2)}`;
  }

  return '***';
}

export function deepRedact(input: any, redactFields: string[] = []): any {
  if (input === null || input === undefined) return input;

  if (Array.isArray(input)) {
    return input.map((item) => deepRedact(item, redactFields));
  }

  if (typeof input !== 'object') {
    return input;
  }

  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(input)) {
    const shouldRedact = redactFields.some((field) => field.toLowerCase() === key.toLowerCase());

    if (shouldRedact) {
      result[key] = maskValue(value);
    } else {
      result[key] = deepRedact(value, redactFields);
    }
  }

  return result;
}

export function safeJsonParse<T = Record<string, any>>(value: string): T | undefined {
  try {
    return JSON.parse(value) as T;
  } catch {
    return undefined;
  }
}
