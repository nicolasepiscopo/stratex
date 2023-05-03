export function isEmpty (value: any): boolean {
  return (
    value === '' ||
    value === undefined ||
    value === null ||
    (typeof value === 'object' && Object.keys(value).length === 0) ||
    (typeof value === 'string' && value.trim().length === 0)
  )
}

export function isEmptyOrZero (value: any): boolean {
  return isEmpty(value) || value === '0' || value === 0;
}