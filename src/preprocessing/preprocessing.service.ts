import { Injectable, Logger } from '@nestjs/common';
import * as ss from 'simple-statistics';

export interface PreprocessingOptions {
  imputeStrategy?: 'forward_fill' | 'mean' | 'zero';
  scaleStrategy?: 'standard' | 'minmax' | 'none';
  windowSize?: number;
}

export interface ScalerState {
  strategy: 'standard' | 'minmax' | 'none';
  means?: number[];
  stds?: number[];
  mins?: number[];
  maxs?: number[];
}

@Injectable()
export class PreprocessingService {
  private readonly logger = new Logger(PreprocessingService.name);

  /**
   * Impute missing values (null, NaN, undefined) in a 2D matrix
   */
  imputeMissing(
    data: (number | null | undefined)[][],
    strategy: 'forward_fill' | 'mean' | 'zero' = 'forward_fill',
  ): number[][] {
    if (!data.length || !data[0].length) return [];
    const numRows = data.length;
    const numCols = data[0].length;
    const result: number[][] = Array.from({ length: numRows }, () => new Array(numCols).fill(0));

    // Calculate column means for fallback
    const colMeans: number[] = [];
    for (let j = 0; j < numCols; j++) {
      const validVals: number[] = [];
      for (let i = 0; i < numRows; i++) {
        const val = data[i][j];
        if (val !== null && val !== undefined && !Number.isNaN(val)) {
          validVals.push(val);
        }
      }
      colMeans.push(validVals.length > 0 ? ss.mean(validVals) : 0);
    }

    for (let j = 0; j < numCols; j++) {
      let lastValid = colMeans[j];
      for (let i = 0; i < numRows; i++) {
        const val = data[i][j];
        const isValid = val !== null && val !== undefined && !Number.isNaN(val);

        if (isValid) {
          result[i][j] = val as number;
          lastValid = val as number;
        } else {
          if (strategy === 'forward_fill') {
            result[i][j] = lastValid;
          } else if (strategy === 'mean') {
            result[i][j] = colMeans[j];
          } else {
            result[i][j] = 0;
          }
        }
      }
    }

    return result;
  }

  /**
   * Fits scaler parameters on dataset
   */
  fitScaler(
    data: number[][],
    strategy: 'standard' | 'minmax' | 'none' = 'standard',
  ): ScalerState {
    if (!data.length || !data[0].length || strategy === 'none') {
      return { strategy: 'none' };
    }

    const numCols = data[0].length;
    if (strategy === 'minmax') {
      const mins: number[] = [];
      const maxs: number[] = [];
      for (let j = 0; j < numCols; j++) {
        const colVals = data.map((row) => row[j]);
        mins.push(ss.min(colVals));
        maxs.push(ss.max(colVals));
      }
      return { strategy: 'minmax', mins, maxs };
    }

    // Standard scaling (z-score)
    const means: number[] = [];
    const stds: number[] = [];
    for (let j = 0; j < numCols; j++) {
      const colVals = data.map((row) => row[j]);
      const mean = ss.mean(colVals);
      const std = ss.standardDeviation(colVals);
      means.push(mean);
      stds.push(std === 0 ? 1 : std);
    }

    return { strategy: 'standard', means, stds };
  }

  /**
   * Transforms data using fitted scaler
   */
  transform(data: number[][], scaler: ScalerState): number[][] {
    if (scaler.strategy === 'none') return data;
    const numRows = data.length;
    const numCols = data[0].length;
    const scaled: number[][] = Array.from({ length: numRows }, () => new Array(numCols).fill(0));

    for (let i = 0; i < numRows; i++) {
      for (let j = 0; j < numCols; j++) {
        const val = data[i][j];
        if (scaler.strategy === 'minmax' && scaler.mins && scaler.maxs) {
          const range = scaler.maxs[j] - scaler.mins[j];
          scaled[i][j] = range === 0 ? 0 : (val - scaler.mins[j]) / range;
        } else if (scaler.strategy === 'standard' && scaler.means && scaler.stds) {
          scaled[i][j] = (val - scaler.means[j]) / scaler.stds[j];
        } else {
          scaled[i][j] = val;
        }
      }
    }

    return scaled;
  }

  /**
   * Compute rolling features (moving average and moving standard deviation)
   */
  rollingFeatures(data: number[][], windowSize: number = 5): number[][] {
    if (data.length === 0 || windowSize <= 1) return data;
    const numRows = data.length;
    const numCols = data[0].length;
    const result: number[][] = [];

    for (let i = 0; i < numRows; i++) {
      const start = Math.max(0, i - windowSize + 1);
      const windowRows = data.slice(start, i + 1);
      const featureRow: number[] = [...data[i]];

      // Compute rolling mean and std for each column
      for (let j = 0; j < numCols; j++) {
        const vals = windowRows.map((r) => r[j]);
        const rollMean = ss.mean(vals);
        const rollStd = vals.length > 1 ? ss.standardDeviation(vals) : 0;
        featureRow.push(rollMean, rollStd);
      }
      result.push(featureRow);
    }

    return result;
  }

  /**
   * Create sliding windows of shape (N - windowSize + 1, windowSize, numFeatures)
   */
  createSlidingWindows(data: number[][], windowSize: number): number[][][] {
    if (data.length < windowSize) return [data];
    const windows: number[][][] = [];
    for (let i = 0; i <= data.length - windowSize; i++) {
      windows.push(data.slice(i, i + windowSize));
    }
    return windows;
  }
}

