export type TokenType =
  | 'WORKFLOW'
  | 'REQUEST'
  | 'APPROVAL'
  | 'ASSIGN'
  | 'IF'
  | 'NOTIFY'
  | 'REJECT'
  | 'END'
  | 'IDENTIFIER'
  | 'NUMBER'
  | 'OPERATOR'
  | 'LBRACE'
  | 'RBRACE'
  | 'EQUALS'
  | 'EOF'
  | 'INVALID';

export interface Token {
  type: TokenType;
  lexeme: string;
  line: number;
  column: number;
}

const KEYWORDS: Record<string, TokenType> = {
  WORKFLOW: 'WORKFLOW',
  REQUEST: 'REQUEST',
  APPROVAL: 'APPROVAL',
  ASSIGN: 'ASSIGN',
  IF: 'IF',
  NOTIFY: 'NOTIFY',
  REJECT: 'REJECT',
  END: 'END',
};

export function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;
  let line = 1;
  let column = 1;

  while (index < source.length) {
    const char = source[index];

    // Handle Newlines
    if (char === '\n') {
      line++;
      column = 1;
      index++;
      continue;
    }

    // Handle Whitespace
    if (char === ' ' || char === '\r' || char === '\t') {
      column++;
      index++;
      continue;
    }

    // Handle LBRACE
    if (char === '{') {
      tokens.push({ type: 'LBRACE', lexeme: '{', line, column });
      column++;
      index++;
      continue;
    }

    // Handle RBRACE
    if (char === '}') {
      tokens.push({ type: 'RBRACE', lexeme: '}', line, column });
      column++;
      index++;
      continue;
    }

    // Handle Operators: >=, <=, ==, !=, >, <, =
    if (char === '>' || char === '<' || char === '=' || char === '!') {
      const nextChar = source[index + 1];
      if (nextChar === '=') {
        const lexeme = char + nextChar;
        tokens.push({
          type: 'OPERATOR',
          lexeme,
          line,
          column,
        });
        column += 2;
        index += 2;
        continue;
      } else {
        if (char === '=') {
          tokens.push({ type: 'EQUALS', lexeme: '=', line, column });
          column++;
          index++;
          continue;
        } else if (char === '!') {
          tokens.push({ type: 'INVALID', lexeme: '!', line, column });
          column++;
          index++;
          continue;
        } else {
          tokens.push({ type: 'OPERATOR', lexeme: char, line, column });
          column++;
          index++;
          continue;
        }
      }
    }

    // Numbers
    if (/[0-9]/.test(char)) {
      let lexeme = '';
      const startCol = column;
      while (index < source.length && /[0-9]/.test(source[index])) {
        lexeme += source[index];
        column++;
        index++;
      }
      tokens.push({ type: 'NUMBER', lexeme, line, column: startCol });
      continue;
    }

    // Identifiers & Keywords
    if (/[a-zA-Z_]/.test(char)) {
      let lexeme = '';
      const startCol = column;
      while (index < source.length && /[a-zA-Z0-9_]/.test(source[index])) {
        lexeme += source[index];
        column++;
        index++;
      }
      const type = KEYWORDS[lexeme] || 'IDENTIFIER';
      tokens.push({ type, lexeme, line, column: startCol });
      continue;
    }

    // Unrecognized / Invalid character (e.g. '@', '$', etc.)
    tokens.push({ type: 'INVALID', lexeme: char, line, column });
    column++;
    index++;
  }

  // Add EOF
  tokens.push({ type: 'EOF', lexeme: 'EOF', line, column });
  return tokens;
}
