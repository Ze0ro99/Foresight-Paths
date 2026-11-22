export function stroopsToPi(value) {
  if (typeof value !== 'string' || !/^\\d+$/.test(value)) {
    throw new TypeError('Stroops must be a non-negative integer string');
  }
  const amount = BigInt(value);
  const whole = amount / 10_000_000n;
  const fraction = (amount % 10_000_000n).toString().padStart(7, '0').replace(/0+$/, '');
  return fraction ? `${whole}.${fraction}` : whole.toString();
}
