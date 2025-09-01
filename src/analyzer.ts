import OpenAI from 'openai';
import { ParsedIssue, IssueSummary } from './types.js';

export class IssueAnalyzer {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async analyzeIssue(issue: ParsedIssue): Promise<IssueSummary> {
    const prompt = this.buildAnalysisPrompt(issue);
    
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an experienced Drupal developer analyzing issue tickets. Provide structured, actionable analysis.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 1500
      });

      const analysis = response.choices[0].message.content;
      return this.parseAnalysis(issue, analysis || '');
    } catch (error) {
      throw new Error(`AI analysis failed: ${error}`);
    }
  }

  private buildAnalysisPrompt(issue: ParsedIssue): string {
    const { metadata, content } = issue;
    
    return `
Analyze this Drupal issue ticket like an experienced developer would:

**Issue Metadata:**
- Project: ${metadata.project}
- Status: ${metadata.status}
- Priority: ${metadata.priority}
- Component: ${metadata.component}
- Created: ${metadata.created}
- Reporter: ${metadata.reporter}

**Issue Content:**
- Title: ${content.title}
- Summary: ${content.summary}
- Problem/Motivation: ${content.problemMotivation || 'Not specified'}
- Proposed Resolution: ${content.proposedResolution || 'Not specified'}
- Remaining Tasks: ${content.remainingTasks || 'Not specified'}

**Comments (${content.comments.length} total):**
${content.comments.map(c => `- ${c.author} (${c.timestamp}): ${c.content.substring(0, 200)}...`).join('\n')}

Please provide analysis in this exact format:

## TECHNICAL SUMMARY
[2-3 sentences explaining the technical problem and proposed solution]

## WORK COMPLETED
- [List completed tasks based on comments and status changes]
- [Include any code submissions, patches, reviews done]

## REMAINING WORK  
- [List what still needs to be done]
- [Be specific about technical tasks]

## ACTIONABLE STEPS
- [Specific next steps a developer or AI could take]
- [Include any testing, code review, or implementation tasks]

## RECOMMENDED PRIORITY
[low/medium/high/urgent] - [Brief justification]
`;
  }

  private parseAnalysis(issue: ParsedIssue, analysis: string): IssueSummary {
    const sections = this.extractSections(analysis);
    
    return {
      issue,
      technicalSummary: sections.technicalSummary,
      workCompleted: sections.workCompleted,
      remainingWork: sections.remainingWork,
      actionableSteps: sections.actionableSteps,
      recommendedPriority: sections.recommendedPriority as 'low' | 'medium' | 'high' | 'urgent'
    };
  }

  private extractSections(analysis: string) {
    const sections = {
      technicalSummary: '',
      workCompleted: [] as string[],
      remainingWork: [] as string[],
      actionableSteps: [] as string[],
      recommendedPriority: 'medium' as string
    };

    const lines = analysis.split('\n');
    let currentSection = '';

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.includes('TECHNICAL SUMMARY')) {
        currentSection = 'technicalSummary';
      } else if (trimmed.includes('WORK COMPLETED')) {
        currentSection = 'workCompleted';
      } else if (trimmed.includes('REMAINING WORK')) {
        currentSection = 'remainingWork';
      } else if (trimmed.includes('ACTIONABLE STEPS')) {
        currentSection = 'actionableSteps';
      } else if (trimmed.includes('RECOMMENDED PRIORITY')) {
        currentSection = 'recommendedPriority';
      } else if (trimmed.startsWith('- ')) {
        const item = trimmed.substring(2);
        if (currentSection === 'workCompleted') {
          sections.workCompleted.push(item);
        } else if (currentSection === 'remainingWork') {
          sections.remainingWork.push(item);
        } else if (currentSection === 'actionableSteps') {
          sections.actionableSteps.push(item);
        }
      } else if (trimmed && currentSection === 'technicalSummary' && !trimmed.startsWith('#')) {
        sections.technicalSummary += trimmed + ' ';
      } else if (trimmed && currentSection === 'recommendedPriority') {
        const match = trimmed.match(/^(low|medium|high|urgent)/i);
        if (match) {
          sections.recommendedPriority = match[1].toLowerCase();
        }
      }
    }

    sections.technicalSummary = sections.technicalSummary.trim();
    return sections;
  }
}