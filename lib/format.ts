export const formatPrice = (value: number): string =>
  `$${value.toLocaleString("en-US")}`