export const getTokenImg = (symbol: string | undefined) => {
  if (!symbol) return undefined;

  return `https://github.com/spothq/cryptocurrency-icons/blob/master/32/icon/${symbol.toLocaleLowerCase()}.png?raw=true`;
}