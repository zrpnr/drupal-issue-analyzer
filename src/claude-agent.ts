import { ParsedIssue } from './types.js';
import { TaskToolWrapper } from './task-integration.js';

export interface ClaudeAnalysis {
  issue: ParsedIssue;
  technicalSummary: string;
  drupalContext: string;
  contributionReadiness: 'ready-to-contribute' | 'needs-discussion' | 'complex-advanced' | 'blocked';
  nextSteps: string[];
  codeReviewNeeded: boolean;
  estimatedComplexity: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  relatedPatterns: string[];
}

export class ClaudeAgent {
  private taskTool: TaskToolWrapper;
  
  constructor() {
    this.taskTool = new TaskToolWrapper();
  }
  
  buildAnalysisPrompt(issue: ParsedIssue): string {
    const { metadata, content } = issue;
    
    return `
You are a Drupal expert analyzing an issue for a Claude Code AI assistant. Provide analysis optimized for an AI that will help developers contribute to this issue.

**Issue Context:**
- Title: ${content.title}
- Project: ${metadata.project}
- Status: ${metadata.status}
- Priority: ${metadata.priority}
- Component: ${metadata.component}
- Created: ${metadata.created}
- Comments: ${content.comments.length}

**Problem/Motivation:**
${content.problemMotivation || content.summary || 'Not specified'}

**Proposed Resolution:**
${content.proposedResolution || 'Not specified'}

**All Comments (${content.comments.length} total):**
${content.comments.map((c, index) => 
  `#${index + 1} ${c.author} (${c.timestamp}): ${c.content.substring(0, 300)}${c.statusChange ? ` [Status: ${c.statusChange}]` : ''}`
).join('\n')}

**Analysis Requirements:**
This issue has ${content.comments.length} comments. For issues with extensive discussion, focus on:
- Key technical decisions and consensus points
- Most recent status changes and current blockers  
- Patterns of contributor feedback and concerns
- Evolution of the proposed solution over time

**CRITICAL: Status-Based Analysis**
- If status is "RTBC" (Reviewed & tested by the community): This means code exists and has been reviewed/approved
- If status is "Needs work": Code exists but requires changes
- If status is "Needs review": Code/patch exists and needs reviewer attention
- If status is "Active": Discussion phase, may or may not have code
- If status is "Fixed": Issue is complete and committed

**CRITICAL: Code Detection**
Look for these indicators that code/patches exist even if not explicitly linked:
- References to "MR" (Merge Request), "patch", "the code", "latest version"
- Mentions of testing, code reviews, or implementation details
- Status changes to review-related states
- Comments about code quality, functionality, or test results

**IMPORTANT: Analysis Constraints**
- Work ONLY with the provided issue data - do NOT fetch additional URLs or make web requests
- Base your analysis entirely on the comments, metadata, and content already provided
- If you need more information, indicate that in your analysis rather than trying to fetch it
- Do NOT attempt to access Drupal.org or any other external resources

Provide a structured analysis in this EXACT format:

🤖 Claude Code Analysis
========================
Title: ${content.title}
Status: ${metadata.status} | Priority: ${metadata.priority}
Project: ${metadata.project}

⚡ Technical Summary
====================
[2-3 sentences explaining the technical problem and current solution approach]

🔧 Drupal Context
==================
[Drupal-specific context: APIs involved, coding standards considerations, architectural patterns, related core/contrib modules]

📋 Contribution Readiness: [🟢 READY-TO-CONTRIBUTE | 🟡 NEEDS-DISCUSSION | 🟠 COMPLEX-ADVANCED | 🔴 BLOCKED]

🎓 Complexity Level: [🟢 BEGINNER | 🟡 INTERMEDIATE | 🟠 ADVANCED | 🔴 EXPERT]

🔍 Code Review Needed: [✅ Yes | ❌ No]

🎯 Next Steps for Claude Code
==============================
1. [Specific actionable step for a developer]
2. [Another specific step]
3. [Maximum 4 steps, prioritized by importance]

🏗️ Related Drupal Patterns
===========================
• [Drupal pattern/API this relates to, e.g., "Entity API", "Access system", "Migration API"]
• [Another related pattern]

Focus on what a Claude Code AI assistant needs to know to help a developer contribute effectively.
`;
  }

  // Helper method to analyze prompt size before sending to agent
  analyzePromptSize(issue: ParsedIssue): {
    promptLength: number;
    estimatedTokens: number;
    commentCount: number;
    totalCommentLength: number;
    averageCommentLength: number;
    recommendation: 'safe' | 'large' | 'mega-issue';
    promptPreview: string;
  } {
    const prompt = this.buildAnalysisPrompt(issue);
    const promptLength = prompt.length;
    // Rough token estimation: ~4 characters per token
    const estimatedTokens = Math.ceil(promptLength / 4);
    
    const { content } = issue;
    const commentCount = content.comments.length;
    const totalCommentLength = content.comments.reduce((sum, c) => sum + c.content.length, 0);
    const averageCommentLength = commentCount > 0 ? Math.round(totalCommentLength / commentCount) : 0;
    
    // Determine recommendation based on size
    let recommendation: 'safe' | 'large' | 'mega-issue' = 'safe';
    if (estimatedTokens > 50000) {
      recommendation = 'mega-issue';
    } else if (estimatedTokens > 15000) {
      recommendation = 'large';
    }
    
    // Get a preview of the prompt (first 500 chars)
    const promptPreview = prompt.substring(0, 500) + (prompt.length > 500 ? '...' : '');
    
    return {
      promptLength,
      estimatedTokens,
      commentCount,
      totalCommentLength,
      averageCommentLength,
      recommendation,
      promptPreview
    };
  }
}