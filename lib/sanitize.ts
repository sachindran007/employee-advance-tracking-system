const TAG_REGEX = /<[^>]*>/g;
const CONTROL_REGEX = /[\u0000-\u001F\u007F]/g;

export function sanitizeTextInput(value: string) {
  return value.replace(TAG_REGEX, "").replace(CONTROL_REGEX, "").trim();
}

export function sanitizeOptionalText(value?: string | null) {
  if (!value) {
    return "";
  }

  return sanitizeTextInput(value);
}
