import { ParsedIssue } from './types.js';

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
  async analyzeIssue(issue: ParsedIssue): Promise<ClaudeAnalysis> {
    // Construct the analysis prompt optimized for Claude Code consumption
    const prompt = this.buildAnalysisPrompt(issue);
    
    try {
      // Use the Task tool to launch a general-purpose agent
      const agentResult = await this.launchAgent(prompt);
      
      // Parse the agent response into structured format
      return this.parseAgentResponse(issue, agentResult);
    } catch (error) {
      throw new Error(`Claude agent analysis failed: ${error}`);
    }
  }

  private buildAnalysisPrompt(issue: ParsedIssue): string {
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

**Recent Comments (last 5):**
${content.comments.slice(-5).map(c => 
  `${c.author} (${c.timestamp}): ${c.content.substring(0, 200)}${c.statusChange ? ` [Status: ${c.statusChange}]` : ''}`
).join('\n')}

**Analysis Requirements:**
Provide a structured analysis in this EXACT format:

## TECHNICAL_SUMMARY
[2-3 sentences explaining the technical problem and current solution approach]

## DRUPAL_CONTEXT  
[Drupal-specific context: APIs involved, coding standards considerations, architectural patterns, related core/contrib modules]

## CONTRIBUTION_READINESS
[One of: ready-to-contribute | needs-discussion | complex-advanced | blocked]
[Brief justification in parentheses]

## NEXT_STEPS
- [Specific actionable step for a developer]
- [Another specific step]
- [Maximum 4 steps, prioritized by importance]

## CODE_REVIEW_NEEDED
[true/false] - Does this issue have code/patches that need review?

## COMPLEXITY
[beginner/intermediate/advanced/expert] - Skill level needed to contribute

## RELATED_PATTERNS
- [Drupal pattern/API this relates to, e.g., "Entity API", "Access system", "Migration API"]
- [Another related pattern]

Focus on what a Claude Code AI assistant needs to know to help a developer contribute effectively.
`;
  }

  private async launchAgent(prompt: string): Promise<string> {
    // This would use the Task tool to launch an agent
    // For now, we'll simulate the response structure
    // TODO: Implement actual Task tool integration
    
    // Simulated agent response - in real implementation this would be:
    // const result = await this.taskTool.launch('general-purpose', prompt);
    
    // For development, return a structured response that matches our expected format
    return `
## TECHNICAL_SUMMARY
This issue addresses limitations in ECA's entity access event system where previously set access results cannot be overridden, requiring a configurable default access result mechanism.

## DRUPAL_CONTEXT
Involves Drupal's entity access system, ECA event-driven architecture, and access result objects (AccessResultInterface). Relates to core entity access hooks and contrib ECA module patterns for access control workflows.

## CONTRIBUTION_READINESS
needs-discussion (Complex access logic with behavior inconsistencies noted in recent comments)

## NEXT_STEPS
- Review the merge request code for access result handling logic
- Test the proposed default access configuration with various entity types
- Address behavior inconsistencies between different access events mentioned in comment #20
- Validate that default "forbidden" doesn't permanently block access as reported

## CODE_REVIEW_NEEDED
true

## COMPLEXITY
intermediate

## RELATED_PATTERNS
- Entity access system
- ECA event architecture
- Access result objects
- Entity hooks
`;
  }

  private parseAgentResponse(issue: ParsedIssue, agentResponse: string): ClaudeAnalysis {
    const sections = this.extractSections(agentResponse);
    
    return {
      issue,
      technicalSummary: sections.technicalSummary,
      drupalContext: sections.drupalContext,
      contributionReadiness: sections.contributionReadiness as ClaudeAnalysis['contributionReadiness'],
      nextSteps: sections.nextSteps,
      codeReviewNeeded: sections.codeReviewNeeded,
      estimatedComplexity: sections.complexity as ClaudeAnalysis['estimatedComplexity'],
      relatedPatterns: sections.relatedPatterns
    };
  }

  private extractSections(response: string) {
    const sections = {
      technicalSummary: '',
      drupalContext: '',
      contributionReadiness: 'needs-discussion' as const,
      nextSteps: [] as string[],
      codeReviewNeeded: false,
      complexity: 'intermediate' as const,
      relatedPatterns: [] as string[]
    };

    const lines = response.split('\n');
    let currentSection = '';

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.includes('TECHNICAL_SUMMARY')) {
        currentSection = 'technicalSummary';
      } else if (trimmed.includes('DRUPAL_CONTEXT')) {
        currentSection = 'drupalContext';
      } else if (trimmed.includes('CONTRIBUTION_READINESS')) {
        currentSection = 'contributionReadiness';
      } else if (trimmed.includes('NEXT_STEPS')) {
        currentSection = 'nextSteps';
      } else if (trimmed.includes('CODE_REVIEW_NEEDED')) {
        currentSection = 'codeReviewNeeded';
      } else if (trimmed.includes('COMPLEXITY')) {
        currentSection = 'complexity';
      } else if (trimmed.includes('RELATED_PATTERNS')) {
        currentSection = 'relatedPatterns';
      } else if (trimmed.startsWith('- ')) {
        const item = trimmed.substring(2);
        if (currentSection === 'nextSteps') {
          sections.nextSteps.push(item);
        } else if (currentSection === 'relatedPatterns') {
          sections.relatedPatterns.push(item);
        }
      } else if (trimmed && currentSection === 'technicalSummary' && !trimmed.startsWith('#')) {
        sections.technicalSummary += trimmed + ' ';
      } else if (trimmed && currentSection === 'drupalContext' && !trimmed.startsWith('#')) {
        sections.drupalContext += trimmed + ' ';
      } else if (trimmed && currentSection === 'contributionReadiness') {
        const match = trimmed.match(/^(ready-to-contribute|needs-discussion|complex-advanced|blocked)/i);
        if (match) {
          sections.contributionReadiness = match[1].toLowerCase() as any;
        }
      } else if (trimmed && currentSection === 'codeReviewNeeded') {
        sections.codeReviewNeeded = trimmed.toLowerCase().includes('true');
      } else if (trimmed && currentSection === 'complexity') {
        const match = trimmed.match(/^(beginner|intermediate|advanced|expert)/i);
        if (match) {
          sections.complexity = match[1].toLowerCase() as any;
        }
      }
    }

    sections.technicalSummary = sections.technicalSummary.trim();
    sections.drupalContext = sections.drupalContext.trim();
    return sections;
  }
}