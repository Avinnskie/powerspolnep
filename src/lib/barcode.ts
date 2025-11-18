/**
 * Simple utility for generating pass codes for events
 */

export function generatePassCode(length: number = 20): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateMemberCode(): string {
  // Generate PWR + 4 digit code for member QR codes
  const digits = Math.floor(Math.random() * 9000) + 1000; // 1000-9999
  return `PWR${digits}`;
}
