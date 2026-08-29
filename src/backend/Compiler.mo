import Types "Types";
import Text "mo:base/Text";
import Float "mo:base/Float";
import Array "mo:base/Array";
import Option "mo:base/Option";
import Iter "mo:base/Iter";

module Compiler {
  public type Token = Types.Token;
  public type TokenType = Types.TokenType;
  public type ASTNode = Types.ASTNode;
  public type ASTValue = Types.ASTValue;
  public type IRInstruction = Types.IRInstruction;
  public type CompileError = Types.CompileError;
  public type ExecutionResult = Types.ExecutionResult;
  public type ExecutionStep = Types.ExecutionStep;

  // Lexer
  public func tokenize(source : Text) : [Token] {
    // Basic lexer in Motoko to parse FSP tokens.
    // For simplicity, we implement a scan loop that handles spaces, identifiers, operators, digits, and braces.
    var tokens : [Token] = [];
    var i : Nat = 0;
    var line : Nat = 1;
    var col : Nat = 1;
    let chars = Text.toArray(source);
    let len = chars.size();

    func isDigit(c : Char) : Bool {
      let code = Char.toNat(c);
      code >= 48 and code <= 57;
    };

    func isAlpha(c : Char) : Bool {
      let code = Char.toNat(c);
      (code >= 65 and code <= 90) or (code >= 97 and code <= 122) or code == 95;
    };

    func isAlphaNum(c : Char) : Bool {
      isAlpha(c) or isDigit(c);
    };

    while (i < len) {
      let char = chars[i];
      if (char == '\n') {
        line += 1;
        col := 1;
        i += 1;
      } else if (char == ' ' or char == '\r' or char == '\t') {
        col += 1;
        i += 1;
      } else if (char == '{') {
        tokens := Array.append(tokens, [{ tokenType = #LBRACE; lexeme = "{"; line; column = col }]);
        col += 1;
        i += 1;
      } else if (char == '}') {
        tokens := Array.append(tokens, [{ tokenType = #RBRACE; lexeme = "}"; line; column = col }]);
        col += 1;
        i += 1;
      } else if (char == '>') {
        if (i + 1 < len and chars[i + 1] == '=') {
          tokens := Array.append(tokens, [{ tokenType = #OPERATOR; lexeme = ">="; line; column = col }]);
          col += 2;
          i += 2;
        } else {
          tokens := Array.append(tokens, [{ tokenType = #OPERATOR; lexeme = ">"; line; column = col }]);
          col += 1;
          i += 1;
        };
      } else if (char == '<') {
        if (i + 1 < len and chars[i + 1] == '=') {
          tokens := Array.append(tokens, [{ tokenType = #OPERATOR; lexeme = "<="; line; column = col }]);
          col += 2;
          i += 2;
        } else {
          tokens := Array.append(tokens, [{ tokenType = #OPERATOR; lexeme = "<"; line; column = col }]);
          col += 1;
          i += 1;
        };
      } else if (char == '=') {
        if (i + 1 < len and chars[i + 1] == '=') {
          tokens := Array.append(tokens, [{ tokenType = #OPERATOR; lexeme = "=="; line; column = col }]);
          col += 2;
          i += 2;
        } else {
          tokens := Array.append(tokens, [{ tokenType = #EQUALS; lexeme = "="; line; column = col }]);
          col += 1;
          i += 1;
        };
      } else if (char == '!') {
        if (i + 1 < len and chars[i + 1] == '=') {
          tokens := Array.append(tokens, [{ tokenType = #OPERATOR; lexeme = "!="; line; column = col }]);
          col += 2;
          i += 2;
        } else {
          tokens := Array.append(tokens, [{ tokenType = #INVALID; lexeme = "!"; line; column = col }]);
          col += 1;
          i += 1;
        };
      } else if (isDigit(char)) {
        var lex = "";
        let startCol = col;
        while (i < len and isDigit(chars[i])) {
          lex := Text.concat(lex, Text.fromChar(chars[i]));
          col += 1;
          i += 1;
        };
        tokens := Array.append(tokens, [{ tokenType = #NUMBER; lexeme = lex; line; column = startCol }]);
      } else if (isAlpha(char)) {
        var lex = "";
        let startCol = col;
        while (i < len and isAlphaNum(chars[i])) {
          lex := Text.concat(lex, Text.fromChar(chars[i]));
          col += 1;
          i += 1;
        };
        let tType = if (lex == "WORKFLOW") #WORKFLOW
                    else if (lex == "REQUEST") #REQUEST
                    else if (lex == "APPROVAL") #APPROVAL
                    else if (lex == "ASSIGN") #ASSIGN
                    else if (lex == "IF") #IF
                    else if (lex == "NOTIFY") #NOTIFY
                    else if (lex == "REJECT") #REJECT
                    else if (lex == "END") #END
                    else #IDENTIFIER;
        tokens := Array.append(tokens, [{ tokenType = tType; lexeme = lex; line; column = startCol }]);
      } else {
        // Any other character like '@' is marked invalid
        tokens := Array.append(tokens, [{ tokenType = #INVALID; lexeme = Text.fromChar(char); line; column = col }]);
        col += 1;
        i += 1;
      };
    };
    tokens := Array.append(tokens, [{ tokenType = #EOF; lexeme = "EOF"; line; column = col }]);
    tokens;
  };

  // Parser, Analyzer, IR Gen and Optimizer Stubs for canister side.
  // In the canister, we provide standard execution validation matching the parser logic.
  // Because Motoko does not easily support dynamic exceptions inside pure functions without Result types,
  // we return a Result type.
  public type CompileResult = {
    #Ok : {
      ast : Types.ASTNode;
      ir : [IRInstruction];
      optimizedIr : [IRInstruction];
      reductionPercentage : Nat;
    };
    #Err : CompileError;
  };

  public func compile(source : Text) : CompileResult {
    let tokens = tokenize(source);

    // Lexical Check
    for (t in tokens.vals()) {
      if (t.tokenType == #INVALID) {
        return #Err({
          errorType = "Lexical";
          message = "Lexical error: Unexpected character '" # t.lexeme # "'";
          line = t.line;
          column = t.column;
        });
      };
    };

    // A simple, rule-based parser simulator to validate the structures for the backend.
    // If it starts with WORKFLOW and has REQUEST and END, we parse it.
    if (tokens.size() < 6) {
      return #Err({
        errorType = "Syntax";
        message = "Syntax error: Source code is too short to be a valid workflow";
        line = 1;
        column = 1;
      });
    };

    if (tokens[0].tokenType != #WORKFLOW) {
      return #Err({
        errorType = "Syntax";
        message = "Syntax error: Expected 'WORKFLOW' at start of file";
        line = tokens[0].line;
        column = tokens[0].column;
      });
    };

    if (tokens[1].tokenType != #IDENTIFIER) {
      return #Err({
        errorType = "Syntax";
        message = "Syntax error: Expected workflow name identifier";
        line = tokens[1].line;
        column = tokens[1].column;
      });
    };

    let wfName = tokens[1].lexeme;

    if (tokens[2].tokenType != #LBRACE) {
      return #Err({
        errorType = "Syntax";
        message = "Syntax error: Expected '{' after workflow name";
        line = tokens[2].line;
        column = tokens[2].column;
      });
    };

    if (tokens[3].tokenType != #REQUEST) {
      return #Err({
        errorType = "Syntax";
        message = "Syntax error: Expected 'REQUEST' statement after '{'";
        line = tokens[3].line;
        column = tokens[3].column;
      });
    };

    if (tokens[4].tokenType != #IDENTIFIER) {
      return #Err({
        errorType = "Syntax";
        message = "Syntax error: Expected request type identifier";
        line = tokens[4].line;
        column = tokens[4].column;
      });
    };

    let reqType = tokens[4].lexeme;
    if (reqType != "purchase") {
      return #Err({
        errorType = "Semantic";
        message = "Semantic error: Invalid request type '" # reqType # "'. Only 'purchase' is supported.";
        line = tokens[4].line;
        column = tokens[4].column;
      });
    };

    // Basic syntax check & build AST stub
    // For standard examples, we construct the correct AST structure and IR natively.
    // We scan remaining tokens for validations.
    var pos : Nat = 5;
    var hasEnd = false;
    var bodyNodes : [ASTNode] = [];
    var irInsts : [IRInstruction] = [#REQUEST(reqType)];

    while (pos < tokens.size()) {
      let t = tokens[pos];
      if (t.tokenType == #RBRACE) {
        if (not hasEnd) {
          return #Err({
            errorType = "Syntax";
            message = "Syntax error: Expected 'END' statement before closing workflow brace";
            line = t.line;
            column = t.column;
          });
        };
        pos += 1;
        break;
      } else if (t.tokenType == #END) {
        hasEnd := true;
        irInsts := Array.append(irInsts, [#END]);
        pos += 1;
        // Verify RBRACE follows
        if (pos < tokens.size() and tokens[pos].tokenType != #RBRACE) {
          return #Err({
            errorType = "Syntax";
            message = "Syntax error: Unexpected content after 'END'";
            line = tokens[pos].line;
            column = tokens[pos].column;
          });
        };
      } else if (t.tokenType == #APPROVAL) {
        if (pos + 1 >= tokens.size() or tokens[pos + 1].tokenType != #IDENTIFIER) {
          return #Err({
            errorType = "Syntax";
            message = "Syntax error: Expected role identifier after 'APPROVAL'";
            line = t.line;
            column = t.column;
          });
        };
        let role = tokens[pos + 1].lexeme;
        // Semantic validation
        if (role != "manager" and role != "finance" and role != "department_head" and role != "procurement") {
          return #Err({
            errorType = "Semantic";
            message = "Semantic error: Invalid approval role '" # role # "'",
            line = tokens[pos + 1].line;
            column = tokens[pos + 1].column;
          });
        };
        bodyNodes := Array.append(bodyNodes, [#Approval({ role; line = t.line; column = t.column })]);
        irInsts := Array.append(irInsts, [#APPROVAL(role)]);
        pos += 2;
      } else if (t.tokenType == #NOTIFY) {
        if (pos + 1 >= tokens.size() or tokens[pos + 1].tokenType != #IDENTIFIER) {
          return #Err({
            errorType = "Syntax";
            message = "Syntax error: Expected notification target identifier after 'NOTIFY'";
            line = t.line;
            column = t.column;
          });
        };
        let target = tokens[pos + 1].lexeme;
        // Semantic validation
        if (target != "employee" and target != "manager" and target != "finance" and target != "department_head" and target != "procurement") {
          return #Err({
            errorType = "Semantic";
            message = "Semantic error: Invalid notification target '" # target # "'",
            line = tokens[pos + 1].line;
            column = tokens[pos + 1].column;
          });
        };
        bodyNodes := Array.append(bodyNodes, [#Notify({ target; line = t.line; column = t.column })]);
        irInsts := Array.append(irInsts, [#NOTIFY(target)]);
        pos += 2;
      } else if (t.tokenType == #IF) {
        if (pos + 3 >= tokens.size() or tokens[pos + 1].tokenType != #IDENTIFIER or tokens[pos + 2].tokenType != #OPERATOR) {
          return #Err({
            errorType = "Syntax";
            message = "Syntax error: Malformed 'IF' condition";
            line = t.line;
            column = t.column;
          });
        };
        let variable = tokens[pos + 1].lexeme;
        let op = tokens[pos + 2].lexeme;
        let valToken = tokens[pos + 3];
        
        if (valToken.tokenType != #NUMBER and valToken.tokenType != #IDENTIFIER) {
          return #Err({
            errorType = "Syntax";
            message = "Syntax error: Expected number or identifier after operator";
            line = valToken.line;
            column = valToken.column;
          });
        };

        // Semantic checks on variable
        if (variable != "amount" and variable != "quantity" and variable != "department" and variable != "priority") {
          return #Err({
            errorType = "Semantic";
            message = "Semantic error: Invalid variable '" # variable # "' in IF condition",
            line = tokens[pos + 1].line;
            column = tokens[pos + 1].column;
          });
        };

        if (variable == "amount" or variable == "quantity") {
          if (valToken.tokenType != #NUMBER) {
            return #Err({
              errorType = "Semantic";
              message = "Semantic error: Numeric variable '" # variable # "' must be compared with a number",
              line = valToken.line;
              column = valToken.column;
            });
          };
        } else {
          if (op != "==" and op != "!=") {
            return #Err({
              errorType = "Semantic";
              message = "Semantic error: String variable '" # variable # "' can only use '==' or '!='",
              line = tokens[pos + 2].line;
              column = tokens[pos + 2].column;
            });
          };
        };

        pos += 4;
        if (pos >= tokens.size() or tokens[pos].tokenType != #LBRACE) {
          return #Err({
            errorType = "Syntax";
            message = "Syntax error: Expected '{' after 'IF' condition",
            line = t.line;
            column = t.column;
          });
        };
        pos += 1;

        // Parse inside IF
        var ifBody : [ASTNode] = [];
        let label = "L_IF"; // Stub label
        irInsts := Array.append(irInsts, [#LOAD(variable), #LOAD(valToken.lexeme), #COMPARE(op), #JUMP_IF_FALSE(label)]);
        
        while (pos < tokens.size() and tokens[pos].tokenType != #RBRACE) {
          let innerT = tokens[pos];
          if (innerT.tokenType == #END) {
            return #Err({
              errorType = "Semantic";
              message = "Semantic error: END statement is not allowed inside an IF block",
              line = innerT.line;
              column = innerT.column;
            });
          };
          if (innerT.tokenType == #APPROVAL) {
            let role = tokens[pos + 1].lexeme;
            if (role != "manager" and role != "finance" and role != "department_head" and role != "procurement") {
              return #Err({
                errorType = "Semantic";
                message = "Semantic error: Invalid approval role '" # role # "'",
                line = tokens[pos + 1].line;
                column = tokens[pos + 1].column;
              });
            };
            ifBody := Array.append(ifBody, [#Approval({ role; line = innerT.line; column = innerT.column })]);
            irInsts := Array.append(irInsts, [#APPROVAL(role)]);
            pos += 2;
          } else {
            pos += 1;
          };
        };

        if (pos >= tokens.size() or tokens[pos].tokenType != #RBRACE) {
          return #Err({
            errorType = "Syntax";
            message = "Syntax error: Expected '}' to close 'IF' block",
            line = t.line;
            column = t.column;
          });
        };
        
        irInsts := Array.append(irInsts, [#LABEL(label)]);
        bodyNodes := Array.append(bodyNodes, [#IfStmt({
          variable;
          operator = op;
          value = if (valToken.tokenType == #NUMBER) #Number(0.0) else #Text(valToken.lexeme); // simplified value representation
          body = ifBody;
          line = t.line;
          column = t.column;
        })]);
        pos += 1;
      } else {
        return #Err({
          errorType = "Syntax";
          message = "Syntax error: Unexpected statement '" # t.lexeme # "'",
          line = t.line;
          column = t.column;
        });
      };
    };

    let finalProgramNode = #Program({
      name = wfName;
      request = { value = reqType; line = 4; column = 3 };
      body = bodyNodes;
      end = { line = 10; column = 3 };
    });

    #Ok({
      ast = finalProgramNode;
      ir = irInsts;
      optimizedIr = irInsts; // simplified optimized IR for canister backend stub
      reductionPercentage = 0;
    });
  };

  // Execution Simulator
  public func execute(
    ir : [IRInstruction],
    amount : Float,
    quantity : Float,
    department : Text,
    priority : Text
  ) : ExecutionResult {
    var steps : [ExecutionStep] = [];
    var reqApp : [Text] = [];
    var skipApp : [Text] = [];
    var sentNot : [Text] = [];
    var pc = 0;
    var stepCounter = 1;

    // Simulate execution step logic
    while (pc < ir.size()) {
      let inst = ir[pc];
      switch (inst) {
        case (#REQUEST(arg)) {
          steps := Array.append(steps, [{ stepNumber = stepCounter; operation = "REQUEST " # arg; status = "SUCCESS"; message = "Request for workflow type '" # arg # "' initialized." }]);
          stepCounter += 1;
        };
        case (#APPROVAL(arg)) {
          reqApp := Array.append(reqApp, [arg]);
          steps := Array.append(steps, [{ stepNumber = stepCounter; operation = "APPROVAL " # arg; status = "REQUIRED"; message = "Requires review and approval from: " # arg }]);
          stepCounter += 1;
        };
        case (#NOTIFY(arg)) {
          sentNot := Array.append(sentNot, [arg]);
          steps := Array.append(steps, [{ stepNumber = stepCounter; operation = "NOTIFY " # arg; status = "SUCCESS"; message = "Notification sent to: " # arg }]);
          stepCounter += 1;
        };
        case (#END) {
          steps := Array.append(steps, [{ stepNumber = stepCounter; operation = "END"; status = "SUCCESS"; message = "Workflow completed." }]);
        };
        case (_) {};
      };
      pc += 1;
    };

    {
      steps;
      requiredApprovals = reqApp;
      skippedApprovals = skipApp;
      sentNotifications = sentNot;
      finalStatus = "SUCCESS";
    };
  };
}
