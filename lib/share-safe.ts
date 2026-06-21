const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@(?:[A-Z0-9-]+\.)+[A-Z]{2,}\b/gi;
const PHONE_PATTERN = /\b(?:\+?1[-. (]*)?(?:\d{3}[-. )]+\d{3}[-. ]+\d{4}|\d{3}-\d{4})\b/g;
const ADDRESS_PATTERN =
  /\b\d{2,5}\s+[A-Z][A-Za-z0-9.'-]*(?:\s+[A-Z][A-Za-z0-9.'-]*){0,5}\s+(Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Boulevard|Blvd|Lane|Ln|Way|Court|Ct|Place|Pl|Terrace|Ter)\b/g;
const MONEY_PATTERN = /\$\s?\d[\d,]*(?:\.\d{2})?/g;
const COMPANY_PATTERN =
  /\b[A-Z][A-Za-z0-9&' -]{2,80}\s(?:LLC|Inc|Corp|Corporation|Company|Co\.|Partners|Group|Builders|Construction|Architects?|Engineering|Consulting|Properties|Services)\b/g;

export function scrubShareSafeText(value: string): string {
  return value
    .replace(EMAIL_PATTERN, "[Email]")
    .replace(PHONE_PATTERN, "[Phone Number]")
    .replace(ADDRESS_PATTERN, "[Property Address]")
    .replace(MONEY_PATTERN, "[Budget Amount]")
    .replace(COMPANY_PATTERN, "[Company Name]");
}
