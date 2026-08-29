import { IRInstruction } from './ir';

export interface OptimizationResult {
  original: IRInstruction[];
  optimized: IRInstruction[];
  reductionPercentage: number;
}

export function optimizeIR(instructions: IRInstruction[]): OptimizationResult {
  const original = [...instructions];
  let current = [...instructions];

  // Run optimization passes in loop until no more changes are made
  let changed = true;
  let iterations = 0;
  const maxIterations = 5; // prevent infinite loops

  while (changed && iterations < maxIterations) {
    const beforeLength = current.length;

    // Pass 1: Constant folding
    current = foldConstantConditions(current);

    // Pass 2: Dead / True branch elimination
    current = eliminateBranches(current);

    // Pass 3: Duplicate consecutive approvals/notifies
    current = eliminateDuplicateOperations(current);

    // Pass 4: Unreachable code elimination
    current = eliminateUnreachableCode(current);

    // Pass 5: Clean up unused labels
    current = cleanUpLabels(current);

    changed = current.length < beforeLength;
    iterations++;
  }

  const originalLength = original.length;
  const optimizedLength = current.length;
  const reductionPercentage =
    originalLength > 0
      ? Math.round(((originalLength - optimizedLength) / originalLength) * 100)
      : 0;

  return {
    original,
    optimized: current,
    reductionPercentage: Math.max(0, reductionPercentage),
  };
}

function foldConstantConditions(insts: IRInstruction[]): IRInstruction[] {
  const result: IRInstruction[] = [];
  let i = 0;

  while (i < insts.length) {
    if (
      i + 2 < insts.length &&
      insts[i].op === 'LOAD' &&
      insts[i + 1].op === 'LOAD' &&
      insts[i + 2].op === 'COMPARE'
    ) {
      const load1 = insts[i] as { op: 'LOAD'; arg: string | number };
      const load2 = insts[i + 1] as { op: 'LOAD'; arg: string | number };
      const compare = insts[i + 2] as { op: 'COMPARE'; arg: string };

      const val1 = load1.arg;
      const val2 = load2.arg;
      const op = compare.arg;

      // Variables are 'amount', 'quantity', 'department', 'priority'
      const variables = ['amount', 'quantity', 'department', 'priority'];
      const isConst1 = typeof val1 === 'number' || (typeof val1 === 'string' && !variables.includes(val1));
      const isConst2 = typeof val2 === 'number' || (typeof val2 === 'string' && !variables.includes(val2));

      if (isConst1 && isConst2) {
        let foldedValue = false;
        if (typeof val1 === 'number' && typeof val2 === 'number') {
          switch (op) {
            case '>': foldedValue = val1 > val2; break;
            case '<': foldedValue = val1 < val2; break;
            case '>=': foldedValue = val1 >= val2; break;
            case '<=': foldedValue = val1 <= val2; break;
            case '==': foldedValue = val1 === val2; break;
            case '!=': foldedValue = val1 !== val2; break;
          }
        } else {
          // String comparisons
          switch (op) {
            case '==': foldedValue = String(val1) === String(val2); break;
            case '!=': foldedValue = String(val1) !== String(val2); break;
          }
        }

        result.push({ op: 'LOAD', arg: foldedValue ? 'true' : 'false' });
        i += 3;
        continue;
      }
    }
    result.push(insts[i]);
    i++;
  }
  return result;
}

function eliminateBranches(insts: IRInstruction[]): IRInstruction[] {
  const result: IRInstruction[] = [];
  let i = 0;

  while (i < insts.length) {
    if (
      i + 1 < insts.length &&
      insts[i].op === 'LOAD' &&
      (insts[i].arg === 'true' || insts[i].arg === 'false') &&
      insts[i + 1].op === 'JUMP_IF_FALSE'
    ) {
      const isTrue = insts[i].arg === 'true';
      const label = insts[i + 1].arg as string;

      if (!isTrue) {
        // Dead branch: skip everything until we hit the target label
        let j = i + 2;
        let braceDepth = 1; // track depth in case of nested structures (though IR is flat, we search for label)
        while (j < insts.length) {
          if (insts[j].op === 'LABEL' && insts[j].arg === label) {
            break;
          }
          j++;
        }
        // Resume from the label instruction
        i = j;
        continue;
      } else {
        // True branch: keep body, remove only load and jump
        i += 2;
        continue;
      }
    }
    result.push(insts[i]);
    i++;
  }
  return result;
}

function eliminateDuplicateOperations(insts: IRInstruction[]): IRInstruction[] {
  const result: IRInstruction[] = [];
  let i = 0;

  while (i < insts.length) {
    const current = insts[i];
    if (i + 1 < insts.length) {
      const next = insts[i + 1];
      if (
        (current.op === 'APPROVAL' && next.op === 'APPROVAL' && current.arg === next.arg) ||
        (current.op === 'NOTIFY' && next.op === 'NOTIFY' && current.arg === next.arg)
      ) {
        // Keep only the first instruction
        result.push(current);
        i += 2;
        continue;
      }
    }
    result.push(current);
    i++;
  }
  return result;
}

function eliminateUnreachableCode(insts: IRInstruction[]): IRInstruction[] {
  const result: IRInstruction[] = [];
  let unreachable = false;

  for (const inst of insts) {
    if (inst.op === 'LABEL') {
      unreachable = false;
    }

    if (!unreachable) {
      result.push(inst);
    }

    if (inst.op === 'REJECT' || inst.op === 'END') {
      unreachable = true;
    }
  }

  // Ensure the final instruction is always END if it was stripped
  if (result.length === 0 || result[result.length - 1].op !== 'END') {
    result.push({ op: 'END' });
  }

  return result;
}

function cleanUpLabels(insts: IRInstruction[]): IRInstruction[] {
  // Find all used label names
  const usedLabels = new Set<string>();
  for (const inst of insts) {
    if (inst.op === 'JUMP_IF_FALSE') {
      usedLabels.add(inst.arg);
    }
  }

  // Filter out labels that are never jumped to
  return insts.filter((inst) => {
    if (inst.op === 'LABEL') {
      return usedLabels.has(inst.arg);
    }
    return true;
  });
}
