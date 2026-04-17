export type TimezoneEntry = {
  zone: string
  city: string
  region: string
}

export const ALL_TIMEZONES: TimezoneEntry[] = [
  { zone: 'UTC', city: 'UTC', region: 'Universal' },

  // Americas
  { zone: 'America/New_York', city: 'New York', region: 'Americas' },
  { zone: 'America/Chicago', city: 'Chicago', region: 'Americas' },
  { zone: 'America/Denver', city: 'Denver', region: 'Americas' },
  { zone: 'America/Los_Angeles', city: 'Los Angeles', region: 'Americas' },
  { zone: 'America/Anchorage', city: 'Anchorage', region: 'Americas' },
  { zone: 'America/Honolulu', city: 'Honolulu', region: 'Americas' },
  { zone: 'America/Toronto', city: 'Toronto', region: 'Americas' },
  { zone: 'America/Vancouver', city: 'Vancouver', region: 'Americas' },
  { zone: 'America/Mexico_City', city: 'Mexico City', region: 'Americas' },
  { zone: 'America/Bogota', city: 'Bogotá', region: 'Americas' },
  { zone: 'America/Lima', city: 'Lima', region: 'Americas' },
  { zone: 'America/Santiago', city: 'Santiago', region: 'Americas' },
  { zone: 'America/Sao_Paulo', city: 'São Paulo', region: 'Americas' },
  {
    zone: 'America/Argentina/Buenos_Aires',
    city: 'Buenos Aires',
    region: 'Americas',
  },
  { zone: 'America/Caracas', city: 'Caracas', region: 'Americas' },
  { zone: 'America/Halifax', city: 'Halifax', region: 'Americas' },

  // Europe
  { zone: 'Europe/London', city: 'London', region: 'Europe' },
  { zone: 'Europe/Dublin', city: 'Dublin', region: 'Europe' },
  { zone: 'Europe/Lisbon', city: 'Lisbon', region: 'Europe' },
  { zone: 'Europe/Paris', city: 'Paris', region: 'Europe' },
  { zone: 'Europe/Berlin', city: 'Berlin', region: 'Europe' },
  { zone: 'Europe/Amsterdam', city: 'Amsterdam', region: 'Europe' },
  { zone: 'Europe/Brussels', city: 'Brussels', region: 'Europe' },
  { zone: 'Europe/Madrid', city: 'Madrid', region: 'Europe' },
  { zone: 'Europe/Rome', city: 'Rome', region: 'Europe' },
  { zone: 'Europe/Stockholm', city: 'Stockholm', region: 'Europe' },
  { zone: 'Europe/Oslo', city: 'Oslo', region: 'Europe' },
  { zone: 'Europe/Copenhagen', city: 'Copenhagen', region: 'Europe' },
  { zone: 'Europe/Helsinki', city: 'Helsinki', region: 'Europe' },
  { zone: 'Europe/Warsaw', city: 'Warsaw', region: 'Europe' },
  { zone: 'Europe/Prague', city: 'Prague', region: 'Europe' },
  { zone: 'Europe/Vienna', city: 'Vienna', region: 'Europe' },
  { zone: 'Europe/Budapest', city: 'Budapest', region: 'Europe' },
  { zone: 'Europe/Zurich', city: 'Zurich', region: 'Europe' },
  { zone: 'Europe/Athens', city: 'Athens', region: 'Europe' },
  { zone: 'Europe/Bucharest', city: 'Bucharest', region: 'Europe' },
  { zone: 'Europe/Kiev', city: 'Kyiv', region: 'Europe' },
  { zone: 'Europe/Moscow', city: 'Moscow', region: 'Europe' },
  { zone: 'Europe/Istanbul', city: 'Istanbul', region: 'Europe' },

  // Africa
  { zone: 'Africa/Casablanca', city: 'Casablanca', region: 'Africa' },
  { zone: 'Africa/Lagos', city: 'Lagos', region: 'Africa' },
  { zone: 'Africa/Cairo', city: 'Cairo', region: 'Africa' },
  { zone: 'Africa/Johannesburg', city: 'Johannesburg', region: 'Africa' },
  { zone: 'Africa/Nairobi', city: 'Nairobi', region: 'Africa' },

  // Middle East & Asia
  { zone: 'Asia/Riyadh', city: 'Riyadh', region: 'Asia' },
  { zone: 'Asia/Tehran', city: 'Tehran', region: 'Asia' },
  { zone: 'Asia/Dubai', city: 'Dubai', region: 'Asia' },
  { zone: 'Asia/Baku', city: 'Baku', region: 'Asia' },
  { zone: 'Asia/Tashkent', city: 'Tashkent', region: 'Asia' },
  { zone: 'Asia/Almaty', city: 'Almaty', region: 'Asia' },
  { zone: 'Asia/Karachi', city: 'Karachi', region: 'Asia' },
  { zone: 'Asia/Kolkata', city: 'Mumbai / Kolkata', region: 'Asia' },
  { zone: 'Asia/Kathmandu', city: 'Kathmandu', region: 'Asia' },
  { zone: 'Asia/Dhaka', city: 'Dhaka', region: 'Asia' },
  { zone: 'Asia/Colombo', city: 'Colombo', region: 'Asia' },
  { zone: 'Asia/Yangon', city: 'Yangon', region: 'Asia' },
  { zone: 'Asia/Bangkok', city: 'Bangkok', region: 'Asia' },
  { zone: 'Asia/Jakarta', city: 'Jakarta', region: 'Asia' },
  { zone: 'Asia/Ho_Chi_Minh', city: 'Ho Chi Minh City', region: 'Asia' },
  { zone: 'Asia/Kuala_Lumpur', city: 'Kuala Lumpur', region: 'Asia' },
  { zone: 'Asia/Singapore', city: 'Singapore', region: 'Asia' },
  { zone: 'Asia/Manila', city: 'Manila', region: 'Asia' },
  { zone: 'Asia/Shanghai', city: 'Shanghai', region: 'Asia' },
  { zone: 'Asia/Hong_Kong', city: 'Hong Kong', region: 'Asia' },
  { zone: 'Asia/Taipei', city: 'Taipei', region: 'Asia' },
  { zone: 'Asia/Seoul', city: 'Seoul', region: 'Asia' },
  { zone: 'Asia/Tokyo', city: 'Tokyo', region: 'Asia' },

  // Australia & Pacific
  { zone: 'Australia/Perth', city: 'Perth', region: 'Pacific' },
  { zone: 'Australia/Darwin', city: 'Darwin', region: 'Pacific' },
  { zone: 'Australia/Adelaide', city: 'Adelaide', region: 'Pacific' },
  { zone: 'Australia/Brisbane', city: 'Brisbane', region: 'Pacific' },
  { zone: 'Australia/Sydney', city: 'Sydney', region: 'Pacific' },
  { zone: 'Australia/Melbourne', city: 'Melbourne', region: 'Pacific' },
  { zone: 'Pacific/Auckland', city: 'Auckland', region: 'Pacific' },
  { zone: 'Pacific/Fiji', city: 'Fiji', region: 'Pacific' },
  { zone: 'Pacific/Guam', city: 'Guam', region: 'Pacific' },
]
