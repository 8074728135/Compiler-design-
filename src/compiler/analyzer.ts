import { ProgramNode, ASTNode, CompileError } from './parser';

const VALID_ROLES = new Set(['manager', 'finance', 'department_head', 'procurement']);
const VALID_NOTIFY_TARGETS = new Set(['employee', 'manager', 'finance', 'department_head', 'procurement']);
const VALID_VARIABLES = new Set(['amount', 'quantity', 'department', 'priority']);
const NUMERIC_VARIABLES = new Set(['amount', 'quantity']);
const STRING_VARIABLES = new Set(['department', 'priority']);
const VALID_OPERATORS = new Set(['>', '<', '>=', '<=', '==', '!=']);

export function analyze(ast: ProgramNode): void {
  // 1. Check workflow name
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(ast.name)) {
    throw {
      type: 'Semantic',
      message: `Semantic error: Invalid workflow name '${ast.name}'`,
      line: 1,
      column: 10,
    } as CompileError;
  }

  // 2. Check request type
  if (ast.request.value !== 'purchase') {
    throw {
      type: 'Semantic',
      message: `Semantic error: Invalid request type '${ast.request.value}'. Only 'purchase' is supported.`,
      line: ast.request.line,
      column: ast.request.column,
    } as CompileError;
  }

  // Helper to recursively check statements
  function checkStatement(node: ASTNode, isInsideIf: boolean): void {
    if (node.type === 'Approval') {
      if (!VALID_ROLES.has(node.role)) {
        throw {
          type: 'Semantic',
          message: `Semantic error: Invalid approval role '${node.role}'. Must be one of: ${Array.from(VALID_ROLES).join(', ')}`,
          line: node.line,
          column: node.column,
        } as CompileError;
      }
    } else if (node.type === 'Notify') {
      if (!VALID_NOTIFY_TARGETS.has(node.target)) {
        throw {
          type: 'Semantic',
          message: `Semantic error: Invalid notification target '${node.target}'. Must be one of: ${Array.from(VALID_NOTIFY_TARGETS).join(', ')}`,
          line: node.line,
          column: node.column,
        } as CompileError;
      }
    } else if (node.type === 'Assign') {
      if (!VALID_VARIABLES.has(node.variable)) {
        throw {
          type: 'Semantic',
          message: `Semantic error: Invalid assignment variable '${node.variable}'`,
          line: node.line,
          column: node.column,
        } as CompileError;
      }
      // Check type of assigned value
      if (NUMERIC_VARIABLES.has(node.variable)) {
        if (typeof node.value !== 'number') {
          throw {
            type: 'Semantic',
            message: `Semantic error: Variable '${node.variable}' expects a numeric value, found '${node.value}'`,
            line: node.line,
            column: node.column,
          } as CompileError;
        }
      } else if (STRING_VARIABLES.has(node.variable)) {
        if (typeof node.value !== 'string') {
          throw {
            type: 'Semantic',
            message: `Semantic error: Variable '${node.variable}' expects a string/identifier value, found '${node.value}'`,
            line: node.line,
            column: node.column,
          } as CompileError;
        }
      }
    } else if (node.type === 'IfStmt') {
      // Check variable
      if (!VALID_VARIABLES.has(node.variable)) {
        throw {
          type: 'Semantic',
          message: `Semantic error: Invalid variable '${node.variable}' in IF condition`,
          line: node.line,
          column: node.column,
        } as CompileError;
      }

      // Check operator
      if (!VALID_OPERATORS.has(node.operator)) {
        throw {
          type: 'Semantic',
          message: `Semantic error: Invalid operator '${node.operator}' in IF condition`,
          line: node.line,
          column: node.column,
        } as CompileError;
      }

      // Check type
      if (NUMERIC_VARIABLES.has(node.variable)) {
        if (typeof node.value !== 'number') {
          throw {
            type: 'Semantic',
            message: `Semantic error: Numeric variable '${node.variable}' must be compared with a number, found '${node.value}'`,
            line: node.line,
            column: node.column,
          } as CompileError;
        }
      } else if (STRING_VARIABLES.has(node.variable)) {
        // String variables cannot use numeric operators (>, <, >=, <=)
        if (node.operator !== '==' && node.operator !== '!=') {
          throw {
            type: 'Semantic',
            message: `Semantic error: String variable '${node.variable}' can only be compared using '==' or '!=', found '${node.operator}'`,
            line: node.line,
            column: node.column,
          } as CompileError;
        }
        if (typeof node.value !== 'string') {
          throw {
            type: 'Semantic',
            message: `Semantic error: Variable '${node.variable}' must be compared with a string/identifier, found '${node.value}'`,
            line: node.line,
            column: node.column,
          } as CompileError;
        }
      }

      // Check body statements
      for (const stmt of node.body) {
        checkStatement(stmt, true);
      }
    } else if (node.type === 'End') {
      if (isInsideIf) {
        throw {
          type: 'Semantic',
          message: `Semantic error: END statement is not allowed inside an IF block`,
          line: node.line,
          column: node.column,
        } as CompileError;
      }
    }
  }

  // Check all statements in body
  for (const stmt of ast.body) {
    checkStatement(stmt, false);
  }
}
