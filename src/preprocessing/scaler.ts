export class StandardScaler {
  mean: number[] = [];
  std: number[] = [];

  fit(X: number[][]) {
    if (!X.length || !X[0]?.length) return this;
    const n = X.length,
      d = X[0].length;
    this.mean = Array(d).fill(0);
    this.std = Array(d).fill(0);
    for (const r of X) r.forEach((v, j) => (this.mean[j] += v / n));
    for (const r of X) r.forEach((v, j) => (this.std[j] += (v - this.mean[j]) ** 2 / n));
    this.std = this.std.map((s) => Math.sqrt(s) || 1);
    return this;
  }

  transform(X: number[][]) {
    if (!X.length || !X[0]?.length) return X;
    return X.map((r) => r.map((v, j) => (v - (this.mean[j] ?? 0)) / (this.std[j] || 1)));
  }
}

