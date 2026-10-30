export function makeWindows(X: number[][], size: number): number[][][] {
  const out: number[][][] = [];
  for (let i = 0; i + size <= X.length; i++) out.push(X.slice(i, i + size));
  return out;
}

