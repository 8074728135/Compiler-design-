module Types {
  public type TokenType = {
    #WORKFLOW;
    #REQUEST;
    #APPROVAL;
    #ASSIGN;
    #IF;
    #NOTIFY;
    #REJECT;
    #END;
    #IDENTIFIER;
    #NUMBER;
    #OPERATOR;
    #LBRACE;
    #RBRACE;
    #EQUALS;
    #EOF;
    #INVALID;
  };

  public type Token = {
    tokenType : TokenType;
    lexeme : Text;
    line : Nat;
    column : Nat;
  };

  public type ASTValue = {
    #Number : Float;
    #Text : Text;
  };

  public type RequestNode = {
    value : Text;
    line : Nat;
    column : Nat;
  };

  public type EndNode = {
    line : Nat;
    column : Nat;
  };

  public type ASTNode = {
    #Program : { name : Text; request : RequestNode; body : [ASTNode]; end : EndNode };
    #Request : RequestNode;
    #Approval : { role : Text; line : Nat; column : Nat };
    #IfStmt : { variable : Text; operator : Text; value : ASTValue; body : [ASTNode]; line : Nat; column : Nat };
    #Notify : { target : Text; line : Nat; column : Nat };
    #Assign : { variable : Text; value : ASTValue; line : Nat; column : Nat };
    #Reject : { line : Nat; column : Nat };
    #End : EndNode;
  };

  public type IRInstruction = {
    #REQUEST : Text;
    #APPROVAL : Text;
    #LOAD : Text;          // can be variable or constant
    #LOAD_VAL : ASTValue;  // explicit value load
    #COMPARE : Text;
    #JUMP_IF_FALSE : Text;
    #LABEL : Text;
    #NOTIFY : Text;
    #ASSIGN : { variable : Text; value : ASTValue };
    #REJECT;
    #END;
  };

  public type CompileError = {
    errorType : Text; // "Lexical" | "Syntax" | "Semantic"
    message : Text;
    line : Nat;
    column : Nat;
  };

  public type ExecutionStep = {
    stepNumber : Nat;
    operation : Text;
    status : Text; // "SUCCESS" | "REQUIRED" | "SKIPPED" | "TRUE" | "FALSE" | "REJECTED"
    message : Text;
  };

  public type ExecutionResult = {
    steps : [ExecutionStep];
    requiredApprovals : [Text];
    skippedApprovals : [Text];
    sentNotifications : [Text];
    finalStatus : Text; // "SUCCESS" | "REJECTED"
  };

  public type Workflow = {
    id : Text;
    name : Text;
    source : Text;
    createdAt : Int;
    version : Nat;
  };

  public type CompilationRecord = {
    workflowId : Text;
    compiledAt : Int;
    success : Bool;
    error : ?CompileError;
    originalInstructionCount : Nat;
    optimizedInstructionCount : Nat;
    reductionPercentage : Nat;
  };

  public type ExecutionRecord = {
    workflowId : Text;
    executedAt : Int;
    amount : Float;
    quantity : Float;
    department : Text;
    priority : Text;
    finalStatus : Text;
    stepsJson : Text;
  };
}
