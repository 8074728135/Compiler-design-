import { Token, TokenType } from './lexer';

export type ASTNode =
  | ProgramNode
  | RequestNode
  | ApprovalNode
  | IfStmtNode
  | NotifyNode
  | AssignNode
  | RejectNode
  | EndNode;

export interface ProgramNode {
  type: 'Program';
  name: string;
  request: RequestNode;
  body: ASTNode[];
  end: EndNode;
}

export interface RequestNode {
  type: 'Request';
  value: string;
  line: number;
  column: number;
}

export interface ApprovalNode {
  type: 'Approval';
  role: string;
  line: number;
  column: number;
}

export interface IfStmtNode {
  type: 'IfStmt';
  variable: string;
  operator: string;
  value: string | number;
  body: ASTNode[];
  line: number;
  column: number;
}

export interface NotifyNode {
  type: 'Notify';
  target: string;
  line: number;
  column: number;
}

export interface AssignNode {
  type: 'Assign';
  variable: string;
  value: string | number;
  line: number;
  column: number;
}

export interface RejectNode {
  type: 'Reject';
  line: number;
  column: number;
}

export interface EndNode {
  type: 'End';
  line: number;
  column: number;
}

export interface CompileError {
  type: 'Lexical' | 'Syntax' | 'Semantic';
  message: string;
  line: number;
  column: number;
}

export function parse(tokens: Token[]): ProgramNode {
  let pos = 0;

  // 1. Check for lexical errors first
  const lexicalError = tokens.find((t) => t.type === 'INVALID');
  if (lexicalError) {
    throw {
      type: 'Lexical',
      message: `Lexical error: Unexpected character '${lexicalError.lexeme}'`,
      line: lexicalError.line,
      column: lexicalError.column,
    } as CompileError;
  }

  function peek(): Token {
    return tokens[pos];
  }

  function previous(): Token {
    return tokens[pos - 1];
  }

  function isAtEnd(): boolean {
    return peek().type === 'EOF';
  }

  function check(type: TokenType): boolean {
    if (isAtEnd()) return type === 'EOF';
    return peek().type === type;
  }

  function advance(): Token {
    if (!isAtEnd()) pos++;
    return previous();
  }

  function match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (check(type)) {
        advance();
        return true;
      }
    }
    return false;
  }

  function consume(type: TokenType, message: string): Token {
    if (check(type)) return advance();
    const token = peek();
    throw {
      type: 'Syntax',
      message: `Syntax error: ${message}. Found '${token.lexeme}'`,
      line: token.line,
      column: token.column,
    } as CompileError;
  }

  function parseStatement(): ASTNode {
    const token = peek();

    if (match('APPROVAL')) {
      const roleToken = consume('IDENTIFIER', "Expected role identifier after 'APPROVAL'");
      return {
        type: 'Approval',
        role: roleToken.lexeme,
        line: token.line,
        column: token.column,
      };
    }

    if (match('NOTIFY')) {
      const targetToken = consume('IDENTIFIER', "Expected notification target identifier after 'NOTIFY'");
      return {
        type: 'Notify',
        target: targetToken.lexeme,
        line: token.line,
        column: token.column,
      };
    }

    if (match('REJECT')) {
      return {
        type: 'Reject',
        line: token.line,
        column: token.column,
      };
    }

    if (match('ASSIGN')) {
      const varToken = consume('IDENTIFIER', "Expected variable identifier after 'ASSIGN'");
      // Let's support both 'ASSIGN var = val' and 'ASSIGN var val'. Wait, 'ASSIGN var = val' is standard.
      // If there is an EQUALS token, consume it. If not, maybe it is optional.
      if (check('EQUALS') || peek().lexeme === '=') {
        advance(); // consume '='
      }
      const valToken = match('NUMBER', 'IDENTIFIER');
      if (!valToken) {
        throw {
          type: 'Syntax',
          message: "Expected number or identifier in assignment value",
          line: peek().line,
          column: peek().column,
        } as CompileError;
      }
      const valLex = previous().lexeme;
      const value = previous().type === 'NUMBER' ? parseFloat(valLex) : valLex;
      return {
        type: 'Assign',
        variable: varToken.lexeme,
        value,
        line: token.line,
        column: token.column,
      };
    }

    if (match('IF')) {
      const varToken = consume('IDENTIFIER', "Expected variable identifier in 'IF' condition");
      const opToken = consume('OPERATOR', "Expected comparison operator (>, <, >=, <=, ==, !=)");

      // Check if there is a number or identifier
      const valMatch = match('NUMBER', 'IDENTIFIER');
      if (!valMatch) {
        throw {
          type: 'Syntax',
          message: `Expected number or identifier after operator, found '${peek().lexeme}'`,
          line: peek().line,
          column: peek().column,
        } as CompileError;
      }

      const valLex = previous().lexeme;
      const value = previous().type === 'NUMBER' ? parseFloat(valLex) : valLex;

      consume('LBRACE', "Expected '{' after 'IF' condition");

      const body: ASTNode[] = [];
      while (!check('RBRACE') && !isAtEnd()) {
        body.push(parseStatement());
      }

      consume('RBRACE', "Expected '}' to close 'IF' block");

      return {
        type: 'IfStmt',
        variable: varToken.lexeme,
        operator: opToken.lexeme,
        value,
        body,
        line: token.line,
        column: token.column,
      };
    }

    if (match('END')) {
      return {
        type: 'End',
        line: token.line,
        column: token.column,
      };
    }

    throw {
      type: 'Syntax',
      message: `Unexpected token '${token.lexeme}'`,
      line: token.line,
      column: token.column,
    } as CompileError;
  }

  // Parse root program
  const workflowToken = consume('WORKFLOW', "Expected 'WORKFLOW' keyword at start of file");
  const wfNameToken = consume('IDENTIFIER', "Expected workflow name identifier");
  consume('LBRACE', "Expected '{' after workflow name");

  // Parse REQUEST
  const reqToken = consume('REQUEST', "Expected 'REQUEST' statement after workflow opening");
  const reqValToken = consume('IDENTIFIER', "Expected request type identifier");
  const request: RequestNode = {
    type: 'Request',
    value: reqValToken.lexeme,
    line: reqToken.line,
    column: reqToken.column,
  };

  const body: ASTNode[] = [];
  let endNode: EndNode | null = null;

  while (!check('RBRACE') && !isAtEnd()) {
    const stmt = parseStatement();
    if (stmt.type === 'End') {
      endNode = stmt;
      // We found an END. FSP syntax dictates this must be followed by closing the workflow block.
      // So we break and expect RBRACE next.
      break;
    }
    body.push(stmt);
  }

  if (!endNode) {
    // Check if the current token is already RBRACE - means they missed END
    throw {
      type: 'Syntax',
      message: "Expected 'END' statement before closing workflow brace",
      line: peek().line,
      column: peek().column,
    } as CompileError;
  }

  consume('RBRACE', "Expected '}' to close workflow");

  if (!isAtEnd()) {
    throw {
      type: 'Syntax',
      message: `Unexpected content after workflow closing brace: '${peek().lexeme}'`,
      line: peek().line,
      column: peek().column,
    } as CompileError;
  }

  return {
    type: 'Program',
    name: wfNameToken.lexeme,
    request,
    body,
    end: endNode,
  };
}
