import { linearRegression, linearRegressionLine } from 'simple-statistics';

// healthIndex: array of {t: days, h: 0..100}
export function estimateRul(
  points: { t: number; h: number }[],
  failureThreshold = 20,
) {
  if (!points.length) return null;
  const fit = linearRegression(points.map((p) => [p.t, p.h]));
  if (fit.m >= 0) return null; // not degrading
  const tNow = points[points.length - 1].t;
  const tFail = (failureThreshold - fit.b) / fit.m;
  const eta = tFail - tNow;

  // rough confidence band from residual spread
  const line = linearRegressionLine(fit);
  const resid = points.map((p) => p.h - line(p.t));
  const sd = Math.sqrt(resid.reduce((a, r) => a + r * r, 0) / resid.length);
  const etaLow = (failureThreshold - (fit.b - sd)) / fit.m - tNow;
  const etaHigh = (failureThreshold - (fit.b + sd)) / fit.m - tNow;
  return {
    etaDays: eta,
    lowerDays: Math.min(etaLow, etaHigh),
    upperDays: Math.max(etaLow, etaHigh),
  };
}

