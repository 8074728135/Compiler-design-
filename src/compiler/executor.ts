import { IRInstruction } from './ir';

export interface ExecutionStep {
  stepNumber: number;
  operation: string;
  status: 'SUCCESS' | 'REQUIRED' | 'SKIPPED' | 'TRUE' | 'FALSE' | 'REJECTED';
  message: string;
}

export interface ExecutionResult {
  steps: ExecutionStep[];
  requiredApprovals: string[];
  skippedApprovals: string[];
  sentNotifications: string[];
  finalStatus: 'SUCCESS' | 'REJECTED';
  variables: Record<string, string | number>;
}

export function executeWorkflow(
  instructions: IRInstruction[],
  inputs: {
    amount: number;
    quantity: number;
    department: string;
    priority: string;
  }
): ExecutionResult {
  const steps: ExecutionStep[] = [];
  const requiredApprovals: string[] = [];
  const skippedApprovals: string[] = [];
  const sentNotifications: string[] = [];
  let finalStatus: 'SUCCESS' | 'REJECTED' = 'SUCCESS';

  const env: Record<string, string | number> = {
    amount: inputs.amount,
    quantity: inputs.quantity,
    department: inputs.department,
    priority: inputs.priority,
  };

  const stack: (string | number | boolean)[] = [];
  let pc = 0;
  let stepCounter = 1;

  // Pre-map labels for fast lookup
  const labelMap = new Map<string, number>();
  for (let i = 0; i < instructions.length; i++) {
    if (instructions[i].op === 'LABEL') {
      labelMap.set(instructions[i].arg as string, i);
    }
  }

  while (pc < instructions.length) {
    const inst = instructions[pc];

    if (inst.op === 'LABEL') {
      pc++;
      continue;
    }

    const currentStepNum = stepCounter++;

    switch (inst.op) {
      case 'REQUEST': {
        steps.push({
          stepNumber: currentStepNum,
          operation: `REQUEST ${inst.arg}`,
          status: 'SUCCESS',
          message: `Request for workflow type '${inst.arg}' initialized.`,
        });
        pc++;
        break;
      }

      case 'APPROVAL': {
        requiredApprovals.push(inst.arg);
        steps.push({
          stepNumber: currentStepNum,
          operation: `APPROVAL ${inst.arg}`,
          status: 'REQUIRED',
          message: `Requires review and approval from: ${inst.arg}.`,
        });
        pc++;
        break;
      }

      case 'NOTIFY': {
        sentNotifications.push(inst.arg);
        steps.push({
          stepNumber: currentStepNum,
          operation: `NOTIFY ${inst.arg}`,
          status: 'SUCCESS',
          message: `Notification sent to: ${inst.arg}.`,
        });
        pc++;
        break;
      }

      case 'ASSIGN': {
        env[inst.arg] = inst.val;
        steps.push({
          stepNumber: currentStepNum,
          operation: `ASSIGN ${inst.arg} = ${inst.val}`,
          status: 'SUCCESS',
          message: `Assigned value '${inst.val}' to variable '${inst.arg}'.`,
        });
        pc++;
        break;
      }

      case 'REJECT': {
        finalStatus = 'REJECTED';
        steps.push({
          stepNumber: currentStepNum,
          operation: 'REJECT',
          status: 'REJECTED',
          message: `Workflow explicitly rejected.`,
        });
        pc = instructions.length; // terminate
        break;
      }

      case 'END': {
        steps.push({
          stepNumber: currentStepNum,
          operation: 'END',
          status: 'SUCCESS',
          message: `Workflow completed.`,
        });
        pc++;
        break;
      }

      case 'LOAD': {
        const arg = inst.arg;
        if (typeof arg === 'string' && arg in env) {
          stack.push(env[arg]);
        } else {
          stack.push(arg);
        }
        pc++;
        break;
      }

      case 'COMPARE': {
        const val2 = stack.pop();
        const val1 = stack.pop();
        const op = inst.arg;

        const prev1 = instructions[pc - 2];
        const prev2 = instructions[pc - 1];

        let exprLabel = '';
        if (prev1?.op === 'LOAD' && prev2?.op === 'LOAD') {
          exprLabel = `${prev1.arg} ${op} ${prev2.arg}`;
        } else {
          exprLabel = `${val1} ${op} ${val2}`;
        }

        let compareResult = false;
        if (typeof val1 === 'number' && typeof val2 === 'number') {
          switch (op) {
            case '>': compareResult = val1 > val2; break;
            case '<': compareResult = val1 < val2; break;
            case '>=': compareResult = val1 >= val2; break;
            case '<=': compareResult = val1 <= val2; break;
            case '==': compareResult = val1 === val2; break;
            case '!=': compareResult = val1 !== val2; break;
          }
        } else {
          switch (op) {
            case '==': compareResult = String(val1) === String(val2); break;
            case '!=': compareResult = String(val1) !== String(val2); break;
          }
        }

        stack.push(compareResult);
        steps.push({
          stepNumber: currentStepNum,
          operation: exprLabel,
          status: compareResult ? 'TRUE' : 'FALSE',
          message: `Condition evaluated: ${val1} ${op} ${val2} (${compareResult ? 'TRUE' : 'FALSE'})`,
        });

        pc++;
        break;
      }

      case 'JUMP_IF_FALSE': {
        const cond = stack.pop() as boolean;
        const targetLabel = inst.arg as string;
        const targetPc = labelMap.get(targetLabel);

        if (cond === false) {
          if (targetPc !== undefined) {
            // Track skipped instructions inside the branch
            for (let i = pc + 1; i < targetPc; i++) {
              const skippedInst = instructions[i];
              if (skippedInst.op === 'APPROVAL') {
                skippedApprovals.push(skippedInst.arg);
                steps.push({
                  stepNumber: stepCounter++,
                  operation: `APPROVAL ${skippedInst.arg}`,
                  status: 'SKIPPED',
                  message: `Skipped approval from: ${skippedInst.arg}`,
                });
              } else if (skippedInst.op === 'NOTIFY') {
                steps.push({
                  stepNumber: stepCounter++,
                  operation: `NOTIFY ${skippedInst.arg}`,
                  status: 'SKIPPED',
                  message: `Skipped notification to: ${skippedInst.arg}`,
                });
              } else if (skippedInst.op === 'REJECT') {
                steps.push({
                  stepNumber: stepCounter++,
                  operation: 'REJECT',
                  status: 'SKIPPED',
                  message: `Skipped rejection path`,
                });
              } else if (skippedInst.op === 'ASSIGN') {
                steps.push({
                  stepNumber: stepCounter++,
                  operation: `ASSIGN ${skippedInst.arg} = ${skippedInst.val}`,
                  status: 'SKIPPED',
                  message: `Skipped assignment of variable: ${skippedInst.arg}`,
                });
              }
            }
            pc = targetPc;
          } else {
            pc++;
          }
        } else {
          pc++;
        }
        break;
      }

      default: {
        pc++;
        break;
      }
    }
  }

  return {
    steps,
    requiredApprovals,
    skippedApprovals,
    sentNotifications,
    finalStatus,
    variables: env,
  };
}
export function generateExecutionPlan(instructions: IRInstruction[]): string {
  // Transpiles IR to a human-readable execution plan JSON
  const planSteps = instructions.map((inst, index) => {
    return {
      step: index + 1,
      instruction: inst.op,
      argument: 'arg' in inst ? inst.arg : undefined,
      value: 'val' in inst ? inst.val : undefined,
    };
  });
  return JSON.stringify(planSteps, null, 2);
}
