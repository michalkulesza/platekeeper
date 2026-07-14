const VULGAR_FRACTIONS: Record<string, number> = {
  '⅛': 1 / 8,
  '¼': 1 / 4,
  '⅓': 1 / 3,
  '⅜': 3 / 8,
  '½': 1 / 2,
  '⅝': 5 / 8,
  '⅔': 2 / 3,
  '¾': 3 / 4,
  '⅞': 7 / 8,
}

const VULGAR_FRACTION_PATTERN = Object.keys(VULGAR_FRACTIONS).join('')
const SIMPLE_QUANTITY_PATTERN = `(?:\\d+(?:[.,]\\d+)?(?:[${VULGAR_FRACTION_PATTERN}]|\\s+(?:\\d+[\\/⁄]\\d+|[${VULGAR_FRACTION_PATTERN}]))?|\\d+[\\/⁄]\\d+|[${VULGAR_FRACTION_PATTERN}])`
const LEADING_QUANTITY_PATTERN = new RegExp(`^(\\s*)(${SIMPLE_QUANTITY_PATTERN})(?=\\s|$)`)

const parseSlashFraction = (value: string): number | null => {
  const [numeratorText, denominatorText] = value.split(/[\/⁄]/)
  const numerator = Number(numeratorText)
  const denominator = Number(denominatorText)

  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
    return null
  }

  return numerator / denominator
}

const parseQuantity = (quantity: string): number | null => {
  const normalized = quantity.trim()
  const vulgarFraction = normalized.charAt(normalized.length - 1)
  const vulgarValue = vulgarFraction ? VULGAR_FRACTIONS[vulgarFraction] : undefined

  if (vulgarValue !== undefined) {
    const wholeText = normalized.slice(0, -1).trim()
    const whole = wholeText === '' ? 0 : Number(wholeText.replace(',', '.'))

    return Number.isFinite(whole) ? whole + vulgarValue : null
  }

  const mixedSlashMatch = normalized.match(/^(\d+(?:[.,]\d+)?)\s+(\d+[\/⁄]\d+)$/)
  if (mixedSlashMatch) {
    const whole = Number(mixedSlashMatch[1].replace(',', '.'))
    const fraction = parseSlashFraction(mixedSlashMatch[2])

    return fraction === null ? null : whole + fraction
  }

  if (normalized.includes('/') || normalized.includes('⁄')) {
    return parseSlashFraction(normalized)
  }

  const decimal = Number(normalized.replace(',', '.'))

  return Number.isFinite(decimal) ? decimal : null
}

const formatQuantity = (value: number, decimalSeparator: '.' | ','): string => {
  const whole = Math.floor(value)
  const remainder = value - whole

  if (remainder < 0.005) return whole.toString()
  if (1 - remainder < 0.005) return (whole + 1).toString()

  const fraction = Object.entries(VULGAR_FRACTIONS).find(
    ([, fractionValue]) => Math.abs(remainder - fractionValue) < 0.005,
  )
  if (fraction) return `${whole || ''}${fraction[0]}`

  const decimal = Number(value.toFixed(2)).toString()

  return decimalSeparator === ',' ? decimal.replace('.', ',') : decimal
}

export const scaleIngredientQuantity = (ingredient: string, scale: number): string => {
  if (!Number.isFinite(scale) || scale <= 0 || scale === 1) return ingredient

  const match = ingredient.match(LEADING_QUANTITY_PATTERN)
  if (!match) return ingredient

  const quantity = parseQuantity(match[2])
  if (quantity === null) return ingredient

  const decimalSeparator = match[2].includes(',') ? ',' : '.'
  const scaledQuantity = formatQuantity(quantity * scale, decimalSeparator)

  return `${match[1]}${scaledQuantity}${ingredient.slice(match[0].length)}`
}
