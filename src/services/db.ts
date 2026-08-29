export interface Workflow {
  id: string;
  name: string;
  source: string;
  createdAt: number;
  version: number;
}

export interface CompilationRecord {
  id: string;
  workflowId: string;
  workflowName: string;
  compiledAt: number;
  success: boolean;
  error?: {
    type: 'Lexical' | 'Syntax' | 'Semantic';
    message: string;
    line: number;
    column: number;
  };
  originalCount: number;
  optimizedCount: number;
  reductionPercentage: number;
  durationMs: number;
}

export interface ExecutionRecord {
  id: string;
  workflowId: string;
  workflowName: string;
  executedAt: number;
  amount: number;
  quantity: number;
  department: string;
  priority: string;
  requiredApprovals: string[];
  skippedApprovals: string[];
  sentNotifications: string[];
  finalStatus: 'SUCCESS' | 'REJECTED';
  durationMs: number;
  stepsJson: string;
}

const DEFAULT_WORKFLOWS: Workflow[] = [
  {
    id: 'small_purchase',
    name: 'SmallPurchase',
    source: `WORKFLOW SmallPurchase {
  REQUEST purchase
  APPROVAL manager
  IF amount > 10000 {
    APPROVAL finance
  }
  NOTIFY employee
  END
}`,
    createdAt: Date.now() - 3600000 * 24 * 3, // 3 days ago
    version: 1,
  },
  {
    id: 'equipment_purchase',
    name: 'EquipmentPurchase',
    source: `WORKFLOW EquipmentPurchase {
  REQUEST purchase
  APPROVAL manager
  IF amount > 50000 {
    APPROVAL finance
  }
  IF amount > 100000 {
    APPROVAL department_head
    APPROVAL procurement
  }
  NOTIFY employee
  END
}`,
    createdAt: Date.now() - 3600000 * 24 * 2, // 2 days ago
    version: 1,
  },
  {
    id: 'bulk_purchase',
    name: 'BulkPurchase',
    source: `WORKFLOW BulkPurchase {
  REQUEST purchase
  APPROVAL manager
  IF quantity >= 100 {
    APPROVAL procurement
  }
  NOTIFY employee
  END
}`,
    createdAt: Date.now() - 3600000 * 12, // 12 hours ago
    version: 1,
  },
  {
    id: 'high_value_purchase',
    name: 'HighValuePurchase',
    source: `WORKFLOW HighValuePurchase {
  REQUEST purchase
  APPROVAL manager
  IF amount > 50000 {
    APPROVAL finance
  }
  IF amount > 100000 {
    APPROVAL department_head
    APPROVAL procurement
  }
  NOTIFY employee
  END
}`,
    createdAt: Date.now() - 3600000 * 6, // 6 hours ago
    version: 1,
  },
];

// Helper to get from localstorage or initialize
export const DB = {
  getWorkflows(): Workflow[] {
    const list = localStorage.getItem('flowsync_workflows');
    if (!list) {
      localStorage.setItem('flowsync_workflows', JSON.stringify(DEFAULT_WORKFLOWS));
      return DEFAULT_WORKFLOWS;
    }
    return JSON.parse(list);
  },

  saveWorkflow(workflow: Workflow): void {
    const list = this.getWorkflows();
    const index = list.findIndex((w) => w.id === workflow.id);
    if (index >= 0) {
      list[index] = { ...workflow, version: workflow.version + 1 };
    } else {
      list.push(workflow);
    }
    localStorage.setItem('flowsync_workflows', JSON.stringify(list));
  },

  deleteWorkflow(id: string): void {
    const list = this.getWorkflows();
    const filtered = list.filter((w) => w.id !== id);
    localStorage.setItem('flowsync_workflows', JSON.stringify(filtered));
  },

  getCompilations(): CompilationRecord[] {
    const list = localStorage.getItem('flowsync_compilations');
    if (!list) {
      // Seed some demo compilations so we have beautiful charts immediately
      const demoCompilations: CompilationRecord[] = [
        {
          id: 'c1',
          workflowId: 'small_purchase',
          workflowName: 'SmallPurchase',
          compiledAt: Date.now() - 3600000 * 5,
          success: true,
          originalCount: 7,
          optimizedCount: 6,
          reductionPercentage: 14,
          durationMs: 4,
        },
        {
          id: 'c2',
          workflowId: 'equipment_purchase',
          workflowName: 'EquipmentPurchase',
          compiledAt: Date.now() - 3600000 * 4,
          success: true,
          originalCount: 15,
          optimizedCount: 11,
          reductionPercentage: 27,
          durationMs: 7,
        },
        {
          id: 'c3',
          workflowId: 'invalid_syntax',
          workflowName: 'SyntaxErrorWf',
          compiledAt: Date.now() - 3600000 * 3,
          success: false,
          error: {
            type: 'Syntax',
            message: "Syntax error: Expected number or identifier after operator. Found '{'",
            line: 4,
            column: 16,
          },
          originalCount: 0,
          optimizedCount: 0,
          reductionPercentage: 0,
          durationMs: 2,
        },
      ];
      localStorage.setItem('flowsync_compilations', JSON.stringify(demoCompilations));
      return demoCompilations;
    }
    return JSON.parse(list);
  },

  addCompilation(rec: Omit<CompilationRecord, 'id' | 'compiledAt'>): CompilationRecord {
    const list = this.getCompilations();
    const newRecord: CompilationRecord = {
      ...rec,
      id: Math.random().toString(36).substring(2, 9),
      compiledAt: Date.now(),
    };
    list.push(newRecord);
    localStorage.setItem('flowsync_compilations', JSON.stringify(list));
    return newRecord;
  },

  getExecutions(): ExecutionRecord[] {
    const list = localStorage.getItem('flowsync_executions');
    if (!list) {
      const demoExecutions: ExecutionRecord[] = [
        {
          id: 'e1',
          workflowId: 'small_purchase',
          workflowName: 'SmallPurchase',
          executedAt: Date.now() - 3600000 * 4,
          amount: 5000,
          quantity: 1,
          department: 'Sales',
          priority: 'Medium',
          requiredApprovals: ['manager'],
          skippedApprovals: ['finance'],
          sentNotifications: ['employee'],
          finalStatus: 'SUCCESS',
          durationMs: 8,
          stepsJson: '[]',
        },
        {
          id: 'e2',
          workflowId: 'equipment_purchase',
          workflowName: 'EquipmentPurchase',
          executedAt: Date.now() - 3600000 * 2,
          amount: 75000,
          quantity: 5,
          department: 'Production',
          priority: 'High',
          requiredApprovals: ['manager', 'finance'],
          skippedApprovals: ['department_head', 'procurement'],
          sentNotifications: ['employee'],
          finalStatus: 'SUCCESS',
          durationMs: 12,
          stepsJson: '[]',
        },
      ];
      localStorage.setItem('flowsync_executions', JSON.stringify(demoExecutions));
      return demoExecutions;
    }
    return JSON.parse(list);
  },

  addExecution(rec: Omit<ExecutionRecord, 'id' | 'executedAt'>): ExecutionRecord {
    const list = this.getExecutions();
    const newRecord: ExecutionRecord = {
      ...rec,
      id: Math.random().toString(36).substring(2, 9),
      executedAt: Date.now(),
    };
    list.push(newRecord);
    localStorage.setItem('flowsync_executions', JSON.stringify(list));
    return newRecord;
  },

  clearAll(): void {
    localStorage.removeItem('flowsync_workflows');
    localStorage.removeItem('flowsync_compilations');
    localStorage.removeItem('flowsync_executions');
    this.getWorkflows(); // trigger re-initialization
    this.getCompilations();
    this.getExecutions();
  },
};
