export interface DetectorResult {
  flags: boolean[];
  scores: number[];
  threshold: number;
}

export interface IDetector {
  name: string;
  fit(X: number[][], params?: Record<string, any>): Promise<void> | void;
  predict(X: number[][]): Promise<DetectorResult> | DetectorResult;
  save?(filePath: string): Promise<void>;
  load?(filePath: string): Promise<void>;
}

