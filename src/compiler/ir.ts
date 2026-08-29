import { ProgramNode, ASTNode } from './parser';

export type IRInstruction =
  | { op: 'REQUEST'; arg: string }
  | { op: 'APPROVAL'; arg: string }
  | { op: 'LOAD'; arg: string | number }
  | { op: 'COMPARE'; arg: string }
  | { op: 'JUMP_IF_FALSE'; arg: string }
  | { op: 'LABEL'; arg: string }
  | { op: 'NOTIFY'; arg: string }
  | { op: 'ASSIGN'; arg: string; val: string | number }
  | { op: 'REJECT' }
  | { op: 'END' };

export function generateIR(ast: ProgramNode): IRInstruction[] {
  const instructions: IRInstruction[] = [];
  let labelId = 1;

  function nextLabel(): string {
    return `L${labelId++}`;
  }

  // Compile REQUEST
  instructions.push({ op: 'REQUEST', arg: ast.request.value });

  // Compile statements
  function compileStmt(node: ASTNode) {
    if (node.type === 'Approval') {
      instructions.push({ op: 'APPROVAL', arg: node.role });
    } else if (node.type === 'Notify') {
      instructions.push({ op: 'NOTIFY', arg: node.target });
    } else if (node.type === 'Reject') {
      instructions.push({ op: 'REJECT' });
    } else if (node.type === 'Assign') {
      instructions.push({ op: 'ASSIGN', arg: node.variable, val: node.value });
    } else if (node.type === 'IfStmt') {
      const label = nextLabel();
      instructions.push({ op: 'LOAD', arg: node.variable });
      instructions.push({ op: 'LOAD', arg: node.value });
      instructions.push({ op: 'COMPARE', arg: node.operator });
      instructions.push({ op: 'JUMP_IF_FALSE', arg: label });

      for (const stmt of node.body) {
        compileStmt(stmt);
      }

      instructions.push({ op: 'LABEL', arg: label });
    }
  }

  for (const stmt of ast.body) {
    compileStmt(stmt);
  }

  // Compile END
  instructions.push({ op: 'END' });

  return instructions;
}

export function formatIR(instructions: IRInstruction[]): string {
  return instructions
    .map((inst) => {
      switch (inst.op) {
        case 'REQUEST':
          return `REQUEST ${inst.arg}`;
        case 'APPROVAL':
          return `APPROVAL ${inst.arg}`;
        case 'LOAD':
          return `LOAD ${inst.arg}`;
        case 'COMPARE':
          return `COMPARE ${inst.arg}`;
        case 'JUMP_IF_FALSE':
          return `JUMP_IF_FALSE ${inst.arg}`;
        case 'LABEL':
          return `LABEL ${inst.arg}`;
        case 'NOTIFY':
          return `NOTIFY ${inst.arg}`;
        case 'ASSIGN':
          return `ASSIGN ${inst.arg} = ${inst.val}`;
        case 'REJECT':
          return `REJECT`;
        case 'END':
          return `END`;
        default:
          return '';
      }
    })
    .join('\n');
}
