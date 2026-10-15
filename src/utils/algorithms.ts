export type AlgorithmName = "Linear Search" | "Binary Search" | "Bubble Sort" | "Selection Sort" | "Merge Sort" | "Quick Sort";
export type AlgorithmStep = { values: number[]; active: number[]; sorted: number[]; message: string; comparisons: number; swaps: number };

const step = (values: number[], active: number[], sorted: number[], message: string, comparisons: number, swaps: number): AlgorithmStep =>
  ({ values: [...values], active, sorted, message, comparisons, swaps });

export function algorithmSteps(name: AlgorithmName, input: number[], target: number): AlgorithmStep[] {
  const a = [...input], out: AlgorithmStep[] = []; let comparisons = 0, swaps = 0;
  if (name === "Linear Search") {
    for (let i = 0; i < a.length; i++) {
      comparisons++;
      out.push(step(a, [i], [], a[i] === target ? `Found ₹${target.toLocaleString("en-IN")} at index ${i}` : `₹${a[i].toLocaleString("en-IN")} is not the target`, comparisons, swaps));
      if (a[i] === target) break;
    }
    return out;
  }
  if (name === "Binary Search") {
    a.sort((x, y) => x - y); let left = 0, right = a.length - 1;
    out.push(step(a, [], [], "Binary search requires sorted input — data sorted first.", comparisons, swaps));
    while (left <= right) {
      const mid = Math.floor((left + right) / 2); comparisons++;
      out.push(step(a, [mid], [], a[mid] === target ? `Found ₹${target.toLocaleString("en-IN")} at index ${mid}` : `Compare midpoint ₹${a[mid].toLocaleString("en-IN")}`, comparisons, swaps));
      if (a[mid] === target) break;
      if (a[mid] < target) left = mid + 1; else right = mid - 1;
    }
    return out;
  }
  if (name === "Bubble Sort") {
    for (let i = 0; i < a.length - 1; i++) for (let j = 0; j < a.length - i - 1; j++) {
      comparisons++; out.push(step(a, [j, j + 1], [], "Compare adjacent prices", comparisons, swaps));
      if (a[j] > a[j + 1]) { [a[j], a[j + 1]] = [a[j + 1], a[j]]; swaps++; out.push(step(a, [j, j + 1], [], "Swap out-of-order prices", comparisons, swaps)); }
    }
  } else if (name === "Selection Sort") {
    for (let i = 0; i < a.length - 1; i++) { let min = i; for (let j = i + 1; j < a.length; j++) { comparisons++; out.push(step(a, [min, j], [...Array(i).keys()], "Find the lowest remaining price", comparisons, swaps)); if (a[j] < a[min]) min = j; } if (min !== i) { [a[i], a[min]] = [a[min], a[i]]; swaps++; out.push(step(a, [i, min], [...Array(i + 1).keys()], "Move minimum into position", comparisons, swaps)); } }
  } else if (name === "Merge Sort") {
    const mergeSort = (left: number, right: number) => {
      if (right - left <= 1) return; const mid = Math.floor((left + right) / 2); mergeSort(left, mid); mergeSort(mid, right);
      const merged: number[] = []; let i = left, j = mid;
      while (i < mid && j < right) { comparisons++; out.push(step(a, [i, j], [], "Compare both sorted halves", comparisons, swaps)); if (a[i] <= a[j]) merged.push(a[i++]); else merged.push(a[j++]); }
      while (i < mid) merged.push(a[i++]); while (j < right) merged.push(a[j++]);
      merged.forEach((value, k) => { if (a[left + k] !== value) swaps++; a[left + k] = value; });
      out.push(step(a, Array.from({ length: right - left }, (_, k) => left + k), [], "Merge the ordered halves", comparisons, swaps));
    }; mergeSort(0, a.length);
  } else {
    const quick = (low: number, high: number) => {
      if (low >= high) return; const pivot = a[high]; let i = low;
      for (let j = low; j < high; j++) { comparisons++; out.push(step(a, [j, high], [], `Compare with pivot ₹${pivot.toLocaleString("en-IN")}`, comparisons, swaps)); if (a[j] < pivot) { [a[i], a[j]] = [a[j], a[i]]; if (i !== j) swaps++; i++; } }
      [a[i], a[high]] = [a[high], a[i]]; if (i !== high) swaps++; out.push(step(a, [i], [i], "Place pivot in final position", comparisons, swaps)); quick(low, i - 1); quick(i + 1, high);
    }; quick(0, a.length - 1);
  }
  out.push(step(a, [], a.map((_, i) => i), `${name} complete`, comparisons, swaps)); return out;
}

export const complexity: Record<AlgorithmName, { best: string; average: string; worst: string; space: string }> = {
  "Linear Search": { best: "O(1)", average: "O(n)", worst: "O(n)", space: "O(1)" },
  "Binary Search": { best: "O(1)", average: "O(log n)", worst: "O(log n)", space: "O(1)" },
  "Bubble Sort": { best: "O(n)", average: "O(n²)", worst: "O(n²)", space: "O(1)" },
  "Selection Sort": { best: "O(n²)", average: "O(n²)", worst: "O(n²)", space: "O(1)" },
  "Merge Sort": { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)", space: "O(n)" },
  "Quick Sort": { best: "O(n log n)", average: "O(n log n)", worst: "O(n²)", space: "O(log n)" },
};

export function measureAlgorithms(sizes: number[]) {
  return sizes.map(size => {
    const source = Array.from({ length: size }, (_, i) => ((i * 7919 + size * 31) % 100000));
    const measure = (fn: () => void) => { const start = performance.now(); fn(); return performance.now() - start; };
    let bubbleComparisons = 0;
    const quick = measure(() => [...source].sort((a, b) => a - b));
    const merge = measure(() => mergeBenchmark(source));
    const selection = measure(() => { const a = [...source]; for (let i = 0; i < a.length; i++) { let min = i; for (let j = i + 1; j < a.length; j++) { bubbleComparisons++; if (a[j] < a[min]) min = j; } [a[i], a[min]] = [a[min], a[i]]; } });
    const linear = measure(() => source.find(v => v === source[source.length - 1]));
    const sorted = [...source].sort((a, b) => a - b); const target = sorted[Math.floor(sorted.length * .7)];
    const binary = measure(() => { let l = 0, r = sorted.length - 1; while (l <= r) { const m = (l + r) >> 1; if (sorted[m] === target) break; if (sorted[m] < target) l = m + 1; else r = m - 1; } });
    return { size, quick, merge, selection, linear, binary, comparisons: bubbleComparisons };
  });
}

function mergeBenchmark(input: number[]): number[] {
  if (input.length < 2) return input; const mid = input.length >> 1, left = mergeBenchmark(input.slice(0, mid)), right = mergeBenchmark(input.slice(mid)); const out: number[] = []; let i = 0, j = 0;
  while (i < left.length && j < right.length) out.push(left[i] < right[j] ? left[i++] : right[j++]);
  return out.concat(left.slice(i), right.slice(j));
}
