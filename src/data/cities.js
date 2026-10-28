/**
 * Built-in world cities for offline search.
 * Coordinates are city centres (degrees, north/east positive); timeZone is the IANA zone.
 */
const RAW = [
  // Europe
  ['London', 'United Kingdom', 51.5072, -0.1276, 'Europe/London'],
  ['Edinburgh', 'United Kingdom', 55.9533, -3.1883, 'Europe/London'],
  ['Dublin', 'Ireland', 53.3498, -6.2603, 'Europe/Dublin'],
  ['Lisbon', 'Portugal', 38.7223, -9.1393, 'Europe/Lisbon'],
  ['Madrid', 'Spain', 40.4168, -3.7038, 'Europe/Madrid'],
  ['Barcelona', 'Spain', 41.3874, 2.1686, 'Europe/Madrid'],
  ['Paris', 'France', 48.8566, 2.3522, 'Europe/Paris'],
  ['Brussels', 'Belgium', 50.8503, 4.3517, 'Europe/Brussels'],
  ['Amsterdam', 'Netherlands', 52.3676, 4.9041, 'Europe/Amsterdam'],
  ['Berlin', 'Germany', 52.52, 13.405, 'Europe/Berlin'],
  ['Munich', 'Germany', 48.1351, 11.582, 'Europe/Berlin'],
  ['Zurich', 'Switzerland', 47.3769, 8.5417, 'Europe/Zurich'],
  ['Vienna', 'Austria', 48.2082, 16.3738, 'Europe/Vienna'],
  ['Prague', 'Czechia', 50.0755, 14.4378, 'Europe/Prague'],
  ['Warsaw', 'Poland', 52.2297, 21.0122, 'Europe/Warsaw'],
  ['Budapest', 'Hungary', 47.4979, 19.0402, 'Europe/Budapest'],
  ['Rome', 'Italy', 41.9028, 12.4964, 'Europe/Rome'],
  ['Milan', 'Italy', 45.4642, 9.19, 'Europe/Rome'],
  ['Athens', 'Greece', 37.9838, 23.7275, 'Europe/Athens'],
  ['Istanbul', 'Türkiye', 41.0082, 28.9784, 'Europe/Istanbul'],
  ['Kyiv', 'Ukraine', 50.4501, 30.5234, 'Europe/Kyiv'],
  ['Moscow', 'Russia', 55.7558, 37.6173, 'Europe/Moscow'],
  ['Copenhagen', 'Denmark', 55.6761, 12.5683, 'Europe/Copenhagen'],
  ['Stockholm', 'Sweden', 59.3293, 18.0686, 'Europe/Stockholm'],
  ['Oslo', 'Norway', 59.9139, 10.7522, 'Europe/Oslo'],
  ['Helsinki', 'Finland', 60.1699, 24.9384, 'Europe/Helsinki'],
  ['Reykjavík', 'Iceland', 64.1466, -21.9426, 'Atlantic/Reykjavik'],
  ['Tromsø', 'Norway', 69.6496, 18.956, 'Europe/Oslo'],
  ['Longyearbyen', 'Svalbard', 78.2232, 15.6267, 'Arctic/Longyearbyen'],

  // Africa
  ['Cairo', 'Egypt', 30.0444, 31.2357, 'Africa/Cairo'],
  ['Casablanca', 'Morocco', 33.5731, -7.5898, 'Africa/Casablanca'],
  ['Marrakesh', 'Morocco', 31.6295, -7.9811, 'Africa/Casablanca'],
  ['Algiers', 'Algeria', 36.7538, 3.0588, 'Africa/Algiers'],
  ['Tunis', 'Tunisia', 36.8065, 10.1815, 'Africa/Tunis'],
  ['Lagos', 'Nigeria', 6.5244, 3.3792, 'Africa/Lagos'],
  ['Accra', 'Ghana', 5.6037, -0.187, 'Africa/Accra'],
  ['Dakar', 'Senegal', 14.7167, -17.4677, 'Africa/Dakar'],
  ['Addis Ababa', 'Ethiopia', 9.03, 38.74, 'Africa/Addis_Ababa'],
  ['Nairobi', 'Kenya', -1.2921, 36.8219, 'Africa/Nairobi'],
  ['Kampala', 'Uganda', 0.3476, 32.5825, 'Africa/Kampala'],
  ['Dar es Salaam', 'Tanzania', -6.7924, 39.2083, 'Africa/Dar_es_Salaam'],
  ['Kinshasa', 'DR Congo', -4.4419, 15.2663, 'Africa/Kinshasa'],
  ['Luanda', 'Angola', -8.8390, 13.2894, 'Africa/Luanda'],
  ['Johannesburg', 'South Africa', -26.2041, 28.0473, 'Africa/Johannesburg'],
  ['Cape Town', 'South Africa', -33.9249, 18.4241, 'Africa/Johannesburg'],
  ['Antananarivo', 'Madagascar', -18.8792, 47.5079, 'Indian/Antananarivo'],

  // Middle East and Central Asia
  ['Dubai', 'United Arab Emirates', 25.2048, 55.2708, 'Asia/Dubai'],
  ['Doha', 'Qatar', 25.2854, 51.531, 'Asia/Qatar'],
  ['Riyadh', 'Saudi Arabia', 24.7136, 46.6753, 'Asia/Riyadh'],
  ['Jerusalem', 'Israel', 31.7683, 35.2137, 'Asia/Jerusalem'],
  ['Amman', 'Jordan', 31.9539, 35.9106, 'Asia/Amman'],
  ['Beirut', 'Lebanon', 33.8938, 35.5018, 'Asia/Beirut'],
  ['Baghdad', 'Iraq', 33.3152, 44.3661, 'Asia/Baghdad'],
  ['Tehran', 'Iran', 35.6892, 51.389, 'Asia/Tehran'],
  ['Kabul', 'Afghanistan', 34.5553, 69.2075, 'Asia/Kabul'],
  ['Tashkent', 'Uzbekistan', 41.2995, 69.2401, 'Asia/Tashkent'],
  ['Almaty', 'Kazakhstan', 43.222, 76.8512, 'Asia/Almaty'],

  // South Asia
  ['Karachi', 'Pakistan', 24.8607, 67.0011, 'Asia/Karachi'],
  ['Lahore', 'Pakistan', 31.5204, 74.3587, 'Asia/Karachi'],
  ['Delhi', 'India', 28.6139, 77.209, 'Asia/Kolkata'],
  ['Mumbai', 'India', 19.076, 72.8777, 'Asia/Kolkata'],
  ['Bengaluru', 'India', 12.9716, 77.5946, 'Asia/Kolkata'],
  ['Chennai', 'India', 13.0827, 80.2707, 'Asia/Kolkata'],
  ['Kolkata', 'India', 22.5726, 88.3639, 'Asia/Kolkata'],
  ['Kathmandu', 'Nepal', 27.7172, 85.324, 'Asia/Kathmandu'],
  ['Dhaka', 'Bangladesh', 23.8103, 90.4125, 'Asia/Dhaka'],
  ['Colombo', 'Sri Lanka', 6.9271, 79.8612, 'Asia/Colombo'],

  // East and Southeast Asia
  ['Beijing', 'China', 39.9042, 116.4074, 'Asia/Shanghai'],
  ['Shanghai', 'China', 31.2304, 121.4737, 'Asia/Shanghai'],
  ['Shenzhen', 'China', 22.5431, 114.0579, 'Asia/Shanghai'],
  ['Chengdu', 'China', 30.5728, 104.0668, 'Asia/Shanghai'],
  ['Hong Kong', 'China', 22.3193, 114.1694, 'Asia/Hong_Kong'],
  ['Taipei', 'Taiwan', 25.033, 121.5654, 'Asia/Taipei'],
  ['Seoul', 'South Korea', 37.5665, 126.978, 'Asia/Seoul'],
  ['Tokyo', 'Japan', 35.6762, 139.6503, 'Asia/Tokyo'],
  ['Osaka', 'Japan', 34.6937, 135.5023, 'Asia/Tokyo'],
  ['Sapporo', 'Japan', 43.0618, 141.3545, 'Asia/Tokyo'],
  ['Ulaanbaatar', 'Mongolia', 47.8864, 106.9057, 'Asia/Ulaanbaatar'],
  ['Vladivostok', 'Russia', 43.1198, 131.8869, 'Asia/Vladivostok'],
  ['Novosibirsk', 'Russia', 55.0084, 82.9357, 'Asia/Novosibirsk'],
  ['Bangkok', 'Thailand', 13.7563, 100.5018, 'Asia/Bangkok'],
  ['Hanoi', 'Vietnam', 21.0278, 105.8342, 'Asia/Ho_Chi_Minh'],
  ['Ho Chi Minh City', 'Vietnam', 10.8231, 106.6297, 'Asia/Ho_Chi_Minh'],
  ['Yangon', 'Myanmar', 16.8409, 96.1735, 'Asia/Yangon'],
  ['Kuala Lumpur', 'Malaysia', 3.139, 101.6869, 'Asia/Kuala_Lumpur'],
  ['Singapore', 'Singapore', 1.3521, 103.8198, 'Asia/Singapore'],
  ['Jakarta', 'Indonesia', -6.2088, 106.8456, 'Asia/Jakarta'],
  ['Bali (Denpasar)', 'Indonesia', -8.6705, 115.2126, 'Asia/Makassar'],
  ['Manila', 'Philippines', 14.5995, 120.9842, 'Asia/Manila'],

  // Oceania and the Pacific
  ['Sydney', 'Australia', -33.8688, 151.2093, 'Australia/Sydney'],
  ['Melbourne', 'Australia', -37.8136, 144.9631, 'Australia/Melbourne'],
  ['Brisbane', 'Australia', -27.4698, 153.0251, 'Australia/Brisbane'],
  ['Perth', 'Australia', -31.9523, 115.8613, 'Australia/Perth'],
  ['Adelaide', 'Australia', -34.9285, 138.6007, 'Australia/Adelaide'],
  ['Hobart', 'Australia', -42.8821, 147.3272, 'Australia/Hobart'],
  ['Auckland', 'New Zealand', -36.8485, 174.7633, 'Pacific/Auckland'],
  ['Wellington', 'New Zealand', -41.2865, 174.7762, 'Pacific/Auckland'],
  ['Suva', 'Fiji', -18.1416, 178.4419, 'Pacific/Fiji'],
  ['Apia', 'Samoa', -13.8333, -171.7667, 'Pacific/Apia'],
  ['Kiritimati', 'Kiribati', 1.8721, -157.4278, 'Pacific/Kiritimati'],
  ['Honolulu', 'United States', 21.3069, -157.8583, 'Pacific/Honolulu'],

  // North America
  ['Anchorage', 'United States', 61.2181, -149.9003, 'America/Anchorage'],
  ['Vancouver', 'Canada', 49.2827, -123.1207, 'America/Vancouver'],
  ['Seattle', 'United States', 47.6062, -122.3321, 'America/Los_Angeles'],
  ['San Francisco', 'United States', 37.7749, -122.4194, 'America/Los_Angeles'],
  ['Los Angeles', 'United States', 34.0522, -118.2437, 'America/Los_Angeles'],
  ['Phoenix', 'United States', 33.4484, -112.074, 'America/Phoenix'],
  ['Denver', 'United States', 39.7392, -104.9903, 'America/Denver'],
  ['Chicago', 'United States', 41.8781, -87.6298, 'America/Chicago'],
  ['Houston', 'United States', 29.7604, -95.3698, 'America/Chicago'],
  ['Toronto', 'Canada', 43.6532, -79.3832, 'America/Toronto'],
  ['Montreal', 'Canada', 45.5019, -73.5674, 'America/Toronto'],
  ['New York', 'United States', 40.7128, -74.006, 'America/New_York'],
  ['Boston', 'United States', 42.3601, -71.0589, 'America/New_York'],
  ['Washington, D.C.', 'United States', 38.9072, -77.0369, 'America/New_York'],
  ['Miami', 'United States', 25.7617, -80.1918, 'America/New_York'],
  ['Mexico City', 'Mexico', 19.4326, -99.1332, 'America/Mexico_City'],
  ['Guatemala City', 'Guatemala', 14.6349, -90.5069, 'America/Guatemala'],
  ['Havana', 'Cuba', 23.1136, -82.3666, 'America/Havana'],
  ['Panama City', 'Panama', 8.9824, -79.5199, 'America/Panama'],
  ['Nuuk', 'Greenland', 64.1814, -51.6941, 'America/Nuuk'],

  // South America
  ['Bogotá', 'Colombia', 4.711, -74.0721, 'America/Bogota'],
  ['Caracas', 'Venezuela', 10.4806, -66.9036, 'America/Caracas'],
  ['Quito', 'Ecuador', -0.1807, -78.4678, 'America/Guayaquil'],
  ['Lima', 'Peru', -12.0464, -77.0428, 'America/Lima'],
  ['São Paulo', 'Brazil', -23.5505, -46.6333, 'America/Sao_Paulo'],
  ['Rio de Janeiro', 'Brazil', -22.9068, -43.1729, 'America/Sao_Paulo'],
  ['Santiago', 'Chile', -33.4489, -70.6693, 'America/Santiago'],
  ['Buenos Aires', 'Argentina', -34.6037, -58.3816, 'America/Argentina/Buenos_Aires'],
  ['Montevideo', 'Uruguay', -34.9011, -56.1645, 'America/Montevideo'],
  ['Ushuaia', 'Argentina', -54.8019, -68.303, 'America/Argentina/Ushuaia'],

  // Antarctica
  ['McMurdo Station', 'Antarctica', -77.8419, 166.6863, 'Antarctica/McMurdo'],
];

const slug = (text) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** @type {{ id: string, name: string, country: string, lat: number, lng: number, timeZone: string }[]} */
export const CITIES = RAW.map(([name, country, lat, lng, timeZone]) => ({
  id: `${slug(name)}-${slug(country)}`,
  name,
  country,
  lat,
  lng,
  timeZone,
})).sort((a, b) => a.name.localeCompare(b.name, 'en'));
