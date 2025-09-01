// This file provides the Task tool integration for Claude Code environment
// It's separate from claude-agent.ts to make it clear what's Claude Code specific

export interface TaskToolInterface {
  invoke(params: {
    subagent_type: string;
    description: string;
    prompt: string;
  }): Promise<string>;
}

export class TaskToolWrapper {
  private taskTool: TaskToolInterface | null = null;
  
  constructor() {
    // In Claude Code environment, the Task tool would be available
    // This is a placeholder that would be replaced with actual implementation
    this.taskTool = this.getTaskTool();
  }
  
  private getTaskTool(): TaskToolInterface | null {
    try {
      // In Claude Code environment, this would access the actual Task tool
      // For now, return null to indicate it's not available in build environment
      const globalTask = (globalThis as any).Task;
      
      if (globalTask && typeof globalTask.invoke === 'function') {
        return globalTask as TaskToolInterface;
      }
      
      return null;
    } catch {
      return null;
    }
  }
  
  async invokeDrupalAnalysis(prompt: string): Promise<string | null> {
    if (!this.taskTool) {
      console.log('Task tool not available in this environment');
      return null;
    }
    
    try {
      console.log('🤖 Invoking Claude Code Task tool for Drupal analysis...');
      
      const result = await this.taskTool.invoke({
        subagent_type: 'general-purpose',
        description: 'Drupal issue analysis for Claude Code',
        prompt: prompt
      });
      
      console.log('✅ Task tool analysis completed');
      return result;
      
    } catch (error) {
      console.log('❌ Task tool invocation failed:', error);
      return null;
    }
  }
  
  isAvailable(): boolean {
    return this.taskTool !== null;
  }
}