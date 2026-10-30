import { makeWindows } from './windowing';

describe('makeWindows', () => {
  it('should create sliding windows of specified size', () => {
    const data = [
      [1],
      [2],
      [3],
      [4],
      [5],
    ];

    const windows = makeWindows(data, 3);
    expect(windows.length).toBe(3);
    expect(windows[0]).toEqual([[1], [2], [3]]);
    expect(windows[1]).toEqual([[2], [3], [4]]);
    expect(windows[2]).toEqual([[3], [4], [5]]);
  });

  it('should return empty array if size is greater than data length', () => {
    const data = [[1], [2]];
    const windows = makeWindows(data, 5);
    expect(windows).toEqual([]);
  });
});

