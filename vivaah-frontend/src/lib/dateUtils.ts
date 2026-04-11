/**
 * Formats an ISO date string (YYYY-MM-DD) to DD/MM/YYYY display format.
 * All dates in Vivaah OS must display as DD/MM/YYYY — never as ISO strings.
 */
export function formatDateDDMMYYYY(isoDate: string): string {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  if (!year || !month || !day) return isoDate; // return as-is if malformed
  return `${day}/${month}/${year}`;
}
