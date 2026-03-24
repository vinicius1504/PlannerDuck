type RateLimitEntry = {
  minuteCount: number;
  minuteStart: number;
  hourCount: number;
  hourStart: number;
};

const limits = new Map<string, RateLimitEntry>();

const MAX_PER_MINUTE = 10;
const MAX_PER_HOUR = 30;

export function checkRateLimit(phoneNumber: string): boolean {
  const now = Date.now();
  let entry = limits.get(phoneNumber);

  if (!entry) {
    entry = {
      minuteCount: 0,
      minuteStart: now,
      hourCount: 0,
      hourStart: now,
    };
    limits.set(phoneNumber, entry);
  }

  // Reset minute window
  if (now - entry.minuteStart > 60_000) {
    entry.minuteCount = 0;
    entry.minuteStart = now;
  }

  // Reset hour window
  if (now - entry.hourStart > 3_600_000) {
    entry.hourCount = 0;
    entry.hourStart = now;
  }

  if (entry.minuteCount >= MAX_PER_MINUTE) return false;
  if (entry.hourCount >= MAX_PER_HOUR) return false;

  entry.minuteCount++;
  entry.hourCount++;
  return true;
}

// Cleanup old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of limits) {
    if (now - entry.hourStart > 3_600_000) {
      limits.delete(key);
    }
  }
}, 600_000);
