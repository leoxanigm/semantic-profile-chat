export function cosineSimilarity(left: number[], right: number[]): number {
  if (left.length === 0 || right.length === 0)
    throw new Error('Cannot compare empty vectors');

  if (left.length !== right.length)
    throw new Error(
      `Vector dimensions differ: ${left.length} and ${right.length}`
    );

  let dotProduct = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;

  for (let i = 0; i < left.length; i++) {
    const lVal = left[i]!;
    const rVal = right[i]!;

    dotProduct += lVal * rVal;
    leftMagnitude += lVal ** 2;
    rightMagnitude += rVal ** 2;
  }

  if (leftMagnitude === 0 || rightMagnitude === 0) return 0;

  return dotProduct / Math.sqrt(leftMagnitude * rightMagnitude);
}
