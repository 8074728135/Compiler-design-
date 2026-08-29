import Types "Types";

module Storage {
  // Persistence schemas for Internet Computer stable variables.
  // In the actor, we will store arrays or buffers of these items.
  
  public type WorkflowStore = {
    var workflows : [Types.Workflow];
    var compilations : [Types.CompilationRecord];
    var executions : [Types.ExecutionRecord];
  };

  public func initStore() : WorkflowStore {
    {
      workflows = [];
      compilations = [];
      executions = [];
    }
  };
}
