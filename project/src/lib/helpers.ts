// Generates a stable anonymous session key stored in localStorage
const SESSION_KEY = 'apex_session_key'

export function getSessionKey(): string {
  let key = localStorage.getItem(SESSION_KEY)
  if (!key) {
    key = crypto.randomUUID()
    localStorage.setItem(SESSION_KEY, key)
  }
  return key
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n)
}

// Returns a color that contrasts well against a given hex background
export function getContrastColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? '#000000' : '#FFFFFF'
}

export const CATEGORY_LABELS: Record<string, string> = {
  coupe: 'Coupé',
  sedan: 'Sedan',
  suv: 'SUV',
  convertible: 'Convertible',
  hypercar: 'Hypercar',
  sports: 'Sports',
}
