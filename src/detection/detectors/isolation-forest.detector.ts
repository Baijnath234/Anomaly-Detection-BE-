import { IDetector, DetectorResult } from './detector.interface';

interface ITreeNode {
  isLeaf: boolean;
  size: number;
  splitFeature?: number;
  splitValue?: number;
  left?: ITreeNode;
  right?: ITreeNode;
}

export class IsolationForestDetector implements IDetector {
  public name = 'isolation_forest';
  private trees: ITreeNode[] = [];
  private numTrees: number = 50;
  private subSampleSize: number = 128;
  private maxDepth: number = 8;
  private sensitivity: number = 0.8;
  private thresholdScore: number = 0.6;

  private averagePathLength(n: number): number {
    if (n <= 1) return 0;
    if (n === 2) return 1;
    const euler = 0.5772156649;
    return 2 * (Math.log(n - 1) + euler) - (2 * (n - 1)) / n;
  }

  private buildTree(X: number[][], currentDepth: number): ITreeNode {
    const numRows = X.length;
    if (currentDepth >= this.maxDepth || numRows <= 1) {
      return { isLeaf: true, size: numRows };
    }

    const numCols = X[0].length;
    const splitFeature = Math.floor(Math.random() * numCols);
    const colVals = X.map((r) => r[splitFeature]);
    const minVal = Math.min(...colVals);
    const maxVal = Math.max(...colVals);

    if (minVal === maxVal) {
      return { isLeaf: true, size: numRows };
    }

    const splitValue = minVal + Math.random() * (maxVal - minVal);
    const leftRows = X.filter((r) => r[splitFeature] < splitValue);
    const rightRows = X.filter((r) => r[splitFeature] >= splitValue);

    if (leftRows.length === 0 || rightRows.length === 0) {
      return { isLeaf: true, size: numRows };
    }

    return {
      isLeaf: false,
      size: numRows,
      splitFeature,
      splitValue,
      left: this.buildTree(leftRows, currentDepth + 1),
      right: this.buildTree(rightRows, currentDepth + 1),
    };
  }

  private pathLength(x: number[], node: ITreeNode, currentDepth: number): number {
    if (node.isLeaf) {
      return currentDepth + this.averagePathLength(node.size);
    }
    const feat = node.splitFeature!;
    const val = node.splitValue!;
    if (x[feat] < val) {
      return this.pathLength(x, node.left!, currentDepth + 1);
    } else {
      return this.pathLength(x, node.right!, currentDepth + 1);
    }
  }

  fit(X: number[][], params?: Record<string, any>): void {
    if (!X.length) return;
    this.sensitivity = params?.sensitivity ?? 0.8;
    this.numTrees = params?.numTrees ?? 50;
    this.subSampleSize = Math.min(X.length, params?.subSampleSize ?? 128);
    this.maxDepth = Math.ceil(Math.log2(Math.max(2, this.subSampleSize)));
    this.thresholdScore = 0.7 - this.sensitivity * 0.25; // 0.8 sens => ~0.50 threshold

    this.trees = [];
    for (let t = 0; t < this.numTrees; t++) {
      // Subsample with replacement
      const sample: number[][] = [];
      for (let i = 0; i < this.subSampleSize; i++) {
        const idx = Math.floor(Math.random() * X.length);
        sample.push(X[idx]);
      }
      this.trees.push(this.buildTree(sample, 0));
    }
  }

  predict(X: number[][]): DetectorResult {
    const scores: number[] = [];
    const flags: boolean[] = [];
    const cN = this.averagePathLength(this.subSampleSize);

    for (const x of X) {
      let totalPath = 0;
      for (const tree of this.trees) {
        totalPath += this.pathLength(x, tree, 0);
      }
      const avgPath = totalPath / (this.trees.length || 1);
      // Anomaly score: s = 2 ^ (-E(h) / c(n))
      const score = cN > 0 ? Math.pow(2, -avgPath / cN) : 0.5;
      scores.push(Math.min(1.0, Math.max(0.0, score)));
      flags.push(score >= this.thresholdScore);
    }

    return {
      flags,
      scores,
      threshold: this.thresholdScore,
    };
  }
}

