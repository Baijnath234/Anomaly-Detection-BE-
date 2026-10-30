import { Detector, DetectionResult } from './detector.interface';
import { StandardScaler } from '../../preprocessing/scaler';

type TreeNode = {
  size: number;
  feature?: number;
  split?: number;
  left?: TreeNode;
  right?: TreeNode;
};

// average path length of an unsuccessful BST search
const c = (n: number) =>
  n <= 1 ? 0 : 2 * (Math.log(n - 1) + 0.5772156649) - (2 * (n - 1)) / n;

function build(data: number[][], depth: number, maxDepth: number): TreeNode {
  if (depth >= maxDepth || data.length <= 1) return { size: data.length };
  const f = Math.floor(Math.random() * data[0].length);
  let min = Infinity,
    max = -Infinity;
  for (const r of data) {
    if (r[f] < min) min = r[f];
    if (r[f] > max) max = r[f];
  }
  if (min === max) return { size: data.length };
  const split = min + Math.random() * (max - min);
  return {
    size: data.length,
    feature: f,
    split,
    left: build(
      data.filter((r) => r[f] < split),
      depth + 1,
      maxDepth,
    ),
    right: build(
      data.filter((r) => r[f] >= split),
      depth + 1,
      maxDepth,
    ),
  };
}

function pathLength(x: number[], node: TreeNode, depth = 0): number {
  if (node.feature === undefined) return depth + c(node.size);
  return pathLength(
    x,
    x[node.feature] < node.split! ? node.left! : node.right!,
    depth + 1,
  );
}

export class IsolationForestDetector implements Detector {
  public name = 'isolation_forest';
  private trees: TreeNode[] = [];
  private scaler = new StandardScaler();
  private sampleSize = 256;
  private threshold = 0.5;

  constructor(
    private nTrees = 100,
    private contamination = 0.05,
  ) {}

  fit(X: number[][], params?: Record<string, any>) {
    if (!X.length || !X[0]?.length) return;
    if (params?.nTrees || params?.numTrees) {
      this.nTrees = params.nTrees ?? params.numTrees;
    }
    if (params?.contamination !== undefined) {
      this.contamination = params.contamination;
    }
    if (params?.sensitivity !== undefined) {
      this.contamination = Math.min(0.25, Math.max(0.01, params.sensitivity * 0.1));
    }

    const Xs = this.scaler.fit(X).transform(X);
    this.sampleSize = Math.min(256, Xs.length);
    const maxDepth = Math.ceil(Math.log2(Math.max(2, this.sampleSize)));
    this.trees = Array.from({ length: this.nTrees }, () => {
      const sample = Array.from(
        { length: this.sampleSize },
        () => Xs[Math.floor(Math.random() * Xs.length)],
      );
      return build(sample, 0, maxDepth);
    });

    // threshold = score at the (1 - contamination) quantile of training data
    const scores = Xs.map((x) => this.score(x)).sort((a, b) => a - b);
    const qIndex = Math.min(
      scores.length - 1,
      Math.floor(scores.length * (1 - this.contamination)),
    );
    this.threshold = scores[qIndex] ?? 0.5;
  }

  private score(x: number[]): number {
    if (!this.trees.length) return 0.5;
    const avg =
      this.trees.reduce((s, t) => s + pathLength(x, t), 0) / this.trees.length;
    const cN = c(this.sampleSize);
    return cN > 0 ? Math.pow(2, -avg / cN) : 0.5;
  }

  predict(X: number[][]): DetectionResult {
    const scores = this.scaler.transform(X).map((x) => this.score(x));
    return {
      flags: scores.map((s) => s > this.threshold),
      scores,
      threshold: this.threshold,
    };
  }
}
