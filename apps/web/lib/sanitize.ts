import DOMPurify from 'isomorphic-dompurify';

export function sanitizeText(text: string): string {
  if (typeof text !== 'string') return text;
  return DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [], // We don't allow ANY HTML tags in plain text fields
    ALLOWED_ATTR: []
  });
}

export function sanitizeHtml(html: string): string {
  if (typeof html !== 'string') return html;
  return DOMPurify.sanitize(html); // Uses default safe config
}

// Recursively sanitizes string values in a JSON object
// Useful for BlockNote / TipTap content
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sanitizeJson<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'string') {
    // If it looks like HTML, maybe sanitizeHtml? 
    // For BlockNote, text content shouldn't have raw HTML execution unless it's an HTML block.
    // We'll use a conservative default: strip all HTML.
    return sanitizeText(obj) as unknown as T;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeJson(item)) as unknown as T;
  }
  
  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeJson(value);
    }
    return sanitized;
  }
  
  return obj;
}
