import Types "Types";
import Compiler "Compiler";
import Storage "Storage";
import Array "mo:base/Array";
import Time "mo:base/Time";
import Option "mo:base/Option";

actor Main {
  // Stable variables for persistent Internet Computer storage
  stable var stableWorkflows : [Types.Workflow] = [];
  stable var stableCompilations : [Types.CompilationRecord] = [];
  stable var stableExecutions : [Types.ExecutionRecord] = [];

  // Workflows CRUD
  public query func getWorkflows() : async [Types.Workflow] {
    stableWorkflows;
  };

  public func saveWorkflow(id : Text, name : Text, source : Text) : async Bool {
    var found = false;
    var updated : [Types.Workflow] = [];
    
    for (wf in stableWorkflows.vals()) {
      if (wf.id == id) {
        found := true;
        updated := Array.append(updated, [{
          id;
          name;
          source;
          createdAt = wf.createdAt;
          version = wf.version + 1;
        }]);
      } else {
        updated := Array.append(updated, [wf]);
      };
    };

    if (not found) {
      updated := Array.append(updated, [{
        id;
        name;
        source;
        createdAt = Time.now();
        version = 1;
      }]);
    };

    stableWorkflows := updated;
    true;
  };

  public func deleteWorkflow(id : Text) : async Bool {
    var updated : [Types.Workflow] = [];
    var removed = false;
    for (wf in stableWorkflows.vals()) {
      if (wf.id != id) {
        updated := Array.append(updated, [wf]);
      } else {
        removed := true;
      };
    };
    stableWorkflows := updated;
    removed;
  };

  // Compile
  public func compileWorkflow(workflowId : Text, source : Text) : async Compiler.CompileResult {
    let result = Compiler.compile(source);
    let now = Time.now();
    
    switch (result) {
      case (#Ok(okRes)) {
        stableCompilations := Array.append(stableCompilations, [{
          workflowId;
          compiledAt = now;
          success = true;
          error = null;
          originalInstructionCount = okRes.ir.size();
          optimizedInstructionCount = okRes.optimizedIr.size();
          reductionPercentage = okRes.reductionPercentage;
        }]);
      };
      case (#Err(err)) {
        stableCompilations := Array.append(stableCompilations, [{
          workflowId;
          compiledAt = now;
          success = false;
          error = ?err;
          originalInstructionCount = 0;
          optimizedInstructionCount = 0;
          reductionPercentage = 0;
        }]);
      };
    };
    
    result;
  };

  // Execute
  public func executeWorkflow(
    workflowId : Text,
    irJson : [Types.IRInstruction],
    amount : Float,
    quantity : Float,
    department : Text,
    priority : Text
  ) : async Types.ExecutionResult {
    let res = Compiler.execute(irJson, amount, quantity, department, priority);
    let now = Time.now();

    stableExecutions := Array.append(stableExecutions, [{
      workflowId;
      executedAt = now;
      amount;
      quantity;
      department;
      priority;
      finalStatus = res.finalStatus;
      stepsJson = ""; // Stub for detail
    }]);

    res;
  };

  // History & Analytics Queries
  public query func getCompilations() : async [Types.CompilationRecord] {
    stableCompilations;
  };

  public query func getExecutions() : async [Types.ExecutionRecord] {
    stableExecutions;
  };

  // Clear data (for testing/settings reset)
  public func clearAllData() : async Bool {
    stableWorkflows := [];
    stableCompilations := [];
    stableExecutions := [];
    true;
  };
}
