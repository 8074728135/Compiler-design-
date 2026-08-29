import { tokenize } from './lexer';
import { parse } from './parser';
import { analyze } from './analyzer';
import { generateIR } from './ir';
import { optimizeIR } from './optimizer';
import { executeWorkflow } from './executor';

export interface TestCase {
  id: string;
  name: string;
  category: 'Lexical' | 'Syntax' | 'Semantic' | 'AST' | 'IR' | 'Optimization' | 'Execution';
  description: string;
  source: string;
  inputs?: {
    amount: number;
    quantity: number;
    department: string;
    priority: string;
  };
  assert: (compilationResult: any) => { success: boolean; message: string };
}

export interface TestResult {
  id: string;
  name: string;
  category: string;
  status: 'PASSED' | 'FAILED';
  message: string;
}

export interface TestSuiteResult {
  total: number;
  passed: number;
  failed: number;
  passPercentage: number;
  results: TestResult[];
}

export const COMPILER_TEST_CASES: TestCase[] = [
  {
    id: 'lexical_error',
    name: 'Reject Invalid Character',
    category: 'Lexical',
    description: "Rejects workflow with illegal characters (like '@' in 'APPROVAL manager @').",
    source: `WORKFLOW LexicalFail {
  REQUEST purchase
  APPROVAL manager @
  END
}`,
    assert: (res) => {
      if (res.error && res.error.type === 'Lexical') {
        return { success: true, message: `Successfully caught lexical error: "${res.error.message}"` };
      }
      return { success: false, message: 'Expected a lexical error, but compilation did not fail as expected.' };
    },
  },
  {
    id: 'syntax_error',
    name: 'Reject Malformed IF Condition',
    category: 'Syntax',
    description: "Rejects incomplete condition in IF statement (like 'IF amount > {').",
    source: `WORKFLOW SyntaxFail {
  REQUEST purchase
  IF amount > {
    APPROVAL finance
  }
  END
}`,
    assert: (res) => {
      if (res.error && res.error.type === 'Syntax') {
        return { success: true, message: `Successfully caught syntax error: "${res.error.message}"` };
      }
      return { success: false, message: 'Expected a syntax error, but compilation did not fail as expected.' };
    },
  },
  {
    id: 'semantic_error_role',
    name: 'Reject Invalid Role',
    category: 'Semantic',
    description: "Rejects undefined approval role (like 'APPROVAL driver').",
    source: `WORKFLOW SemanticRoleFail {
  REQUEST purchase
  APPROVAL driver
  END
}`,
    assert: (res) => {
      if (res.error && res.error.type === 'Semantic' && res.error.message.includes('driver')) {
        return { success: true, message: `Successfully caught semantic error: "${res.error.message}"` };
      }
      return { success: false, message: 'Expected a semantic error about role "driver", but got: ' + (res.error ? res.error.message : 'Success') };
    },
  },
  {
    id: 'semantic_error_type',
    name: 'Reject Non-Numeric Condition',
    category: 'Semantic',
    description: 'Rejects numeric comparison operator on a string variable (e.g. priority > 100).',
    source: `WORKFLOW SemanticTypeFail {
  REQUEST purchase
  IF priority > 100 {
    APPROVAL finance
  }
  END
}`,
    assert: (res) => {
      if (res.error && res.error.type === 'Semantic' && res.error.message.includes('priority')) {
        return { success: true, message: `Successfully caught semantic type error: "${res.error.message}"` };
      }
      return { success: false, message: 'Expected a semantic type error on "priority", but got: ' + (res.error ? res.error.message : 'Success') };
    },
  },
  {
    id: 'semantic_error_end_if',
    name: 'Reject END Inside IF',
    category: 'Semantic',
    description: 'Rejects END instruction nested within an IF block.',
    source: `WORKFLOW EndInsideIf {
  REQUEST purchase
  IF amount > 50000 {
    APPROVAL finance
    END
  }
  END
}`,
    assert: (res) => {
      if (res.error && res.error.type === 'Semantic' && res.error.message.includes('END statement is not allowed inside an IF block')) {
        return { success: true, message: `Successfully caught semantic block error: "${res.error.message}"` };
      }
      return { success: false, message: 'Expected a semantic error for END inside IF, but got: ' + (res.error ? res.error.message : 'Success') };
    },
  },
  {
    id: 'ast_generation',
    name: 'Verify Correct AST Nodes',
    category: 'AST',
    description: 'Validates that a simple workflow parses to a correct program node hierarchy.',
    source: `WORKFLOW AstTest {
  REQUEST purchase
  APPROVAL manager
  END
}`,
    assert: (res) => {
      if (res.ast && res.ast.type === 'Program' && res.ast.name === 'AstTest' && res.ast.body.length === 1 && res.ast.body[0].type === 'Approval') {
        return { success: true, message: 'AST successfully verified with correct node tree.' };
      }
      return { success: false, message: 'AST was generated incorrectly or properties mismatch.' };
    },
  },
  {
    id: 'ir_generation',
    name: 'Verify IR Instructions',
    category: 'IR',
    description: 'Validates translation of FSP constructs into linear instructions.',
    source: `WORKFLOW IrTest {
  REQUEST purchase
  APPROVAL manager
  END
}`,
    assert: (res) => {
      if (res.ir && res.ir.length === 3 && res.ir[0].op === 'REQUEST' && res.ir[1].op === 'APPROVAL' && res.ir[2].op === 'END') {
        return { success: true, message: 'IR instructions generated correctly.' };
      }
      return { success: false, message: 'Generated IR did not match the expected instruction structure.' };
    },
  },
  {
    id: 'optimization_fold',
    name: 'Constant Condition Folding',
    category: 'Optimization',
    description: 'Validates folding of literal comparisons (IF 1000 > 500) and stripping dead branches.',
    source: `WORKFLOW FoldTest {
  REQUEST purchase
  IF 1000 > 500 {
    APPROVAL manager
  }
  IF 100 > 500 {
    APPROVAL finance
  }
  END
}`,
    assert: (res) => {
      if (res.optimizedIr) {
        // '1000 > 500' folds to true (manager is kept)
        // '100 > 500' folds to false (finance is stripped)
        const hasManager = res.optimizedIr.some((inst: any) => inst.op === 'APPROVAL' && inst.arg === 'manager');
        const hasFinance = res.optimizedIr.some((inst: any) => inst.op === 'APPROVAL' && inst.arg === 'finance');
        const hasJump = res.optimizedIr.some((inst: any) => inst.op === 'JUMP_IF_FALSE');

        if (hasManager && !hasFinance && !hasJump) {
          return {
            success: true,
            message: `Optimized successfully: Kept active branch, stripped dead branch, instruction reduction: ${res.reductionPercentage}%`,
          };
        }
      }
      return { success: false, message: 'Constant folding optimization did not work as expected.' };
    },
  },
  {
    id: 'execution_engine_test',
    name: 'Simulated Execution Check',
    category: 'Execution',
    description: 'Validates step outcomes, required vs skipped steps on simulated environment.',
    source: `WORKFLOW RunTest {
  REQUEST purchase
  APPROVAL manager
  IF amount > 50000 {
    APPROVAL finance
  }
  END
}`,
    inputs: {
      amount: 75000,
      quantity: 1,
      department: 'Production',
      priority: 'High',
    },
    assert: (res) => {
      if (res.execution) {
        const required = res.execution.requiredApprovals;
        const skipped = res.execution.skippedApprovals;
        const success = res.execution.finalStatus === 'SUCCESS';

        if (success && required.includes('manager') && required.includes('finance')) {
          return { success: true, message: 'Execution completed successfully with all expected approval steps.' };
        }
      }
      return { success: false, message: 'Execution did not complete with correct approval list.' };
    },
  },
];

export function runCompilerTests(): TestSuiteResult {
  const results: TestResult[] = [];
  let passed = 0;

  for (const tc of COMPILER_TEST_CASES) {
    let compilationRes: any = {};
    try {
      // Step 1: Lexer
      const tokens = tokenize(tc.source);
      compilationRes.tokens = tokens;

      // Step 2: Parser
      const ast = parse(tokens);
      compilationRes.ast = ast;

      // Step 3: Analyzer
      analyze(ast);

      // Step 4: IR
      const ir = generateIR(ast);
      compilationRes.ir = ir;

      // Step 5: Optimizer
      const opt = optimizeIR(ir);
      compilationRes.optimizedIr = opt.optimized;
      compilationRes.reductionPercentage = opt.reductionPercentage;

      // Step 6: Executor (if inputs are defined)
      if (tc.inputs) {
        const exec = executeWorkflow(opt.optimized, tc.inputs);
        compilationRes.execution = exec;
      }
    } catch (err: any) {
      compilationRes.error = err;
    }

    const assertRes = tc.assert(compilationRes);
    if (assertRes.success) {
      passed++;
      results.push({
        id: tc.id,
        name: tc.name,
        category: tc.category,
        status: 'PASSED',
        message: assertRes.message,
      });
    } else {
      results.push({
        id: tc.id,
        name: tc.name,
        category: tc.category,
        status: 'FAILED',
        message: assertRes.message,
      });
    }
  }

  const total = COMPILER_TEST_CASES.length;
  return {
    total,
    passed,
    failed: total - passed,
    passPercentage: total > 0 ? Math.round((passed / total) * 100) : 0,
    results,
  };
}
