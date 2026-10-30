export interface DetectionResult {
  flags: boolean[]; // true = anomaly
  scores: number[]; // 0..1, higher = more anomalous
  threshold?: number;
}

export interface Detector {
  name?: string;
  fit(X: number[][], params?: Record<string, any>): Promise<void> | void;
  predict(X: number[][]): Promise<DetectionResult> | DetectionResult;
  save?(filePath: string): Promise<void>;
  load?(filePath: string): Promise<void>;
}

// Backward compatibility aliases
export type DetectorResult = DetectionResult;
export type IDetector = Detector;
