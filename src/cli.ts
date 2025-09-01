#!/usr/bin/env node

import { Command } from 'commander';
import { DrupalIssueParser } from './parser.js';
import { ClaudeAgent, ClaudeAnalysis } from './claude-agent.js';

const program = new Command();

program
  .name('drupal-issue-analyzer')
  .description('Analyze and summarize Drupal.org issues')
  .version('0.1.0');

program
  .argument('<url>', 'Drupal.org issue URL to analyze')
  .option('--analyze-size', 'Analyze prompt size without running agent (useful for mega-issues)')
  .option('--json', 'Output in JSON format')
  .option('--claude-prompt', 'Output formatted prompt for Claude Code agent analysis')
  .action(async (url: string, options) => {
    try {
      
      if (!isValidDrupalIssueUrl(url)) {
        console.error('Error: Please provide a valid Drupal.org issue URL');
        console.error('Example: https://www.drupal.org/project/eca/issues/3539583');
        process.exit(1);
      }

      console.log(`Analyzing issue: ${url}`);
      console.log('Fetching and parsing issue data...\n');

      const parser = new DrupalIssueParser();
      const issue = await parser.parseIssue(url);

      if (options.analyzeSize) {
        console.log('📊 Analyzing prompt size for mega-issue assessment...\n');
        const claudeAgent = new ClaudeAgent();
        const sizeAnalysis = claudeAgent.analyzePromptSize(issue);

        if (options.json) {
          console.log(JSON.stringify(sizeAnalysis, null, 2));
        } else {
          displaySizeAnalysis(sizeAnalysis, issue);
        }
        return;
      }

      if (options.claudePrompt) {
        const claudeAgent = new ClaudeAgent();
        const formattedPrompt = claudeAgent.buildAnalysisPrompt(issue);
        console.log(formattedPrompt);
        return;
      }

      // Default behavior: display parsed issue data
      if (options.json) {
        console.log(JSON.stringify(issue, null, 2));
      } else {
        displayParsedIssue(issue);
      }

    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

function isValidDrupalIssueUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname === 'www.drupal.org' && 
           parsed.pathname.includes('/issues/');
  } catch {
    return false;
  }
}

function displayParsedIssue(issue: any) {
  console.log('📋 Issue Overview');
  console.log('================');
  console.log(`Title: ${issue.content.title}`);
  console.log(`Project: ${issue.metadata.project}`);
  console.log(`Status: ${issue.metadata.status}`);
  console.log(`Priority: ${issue.metadata.priority}`);
  console.log(`Component: ${issue.metadata.component}`);
  console.log(`Version: ${issue.metadata.version || 'Not specified'}`);
  console.log(`Reporter: ${issue.metadata.reporter}`);
  console.log(`Created: ${issue.metadata.created}`);
  if (issue.metadata.updated) {
    console.log(`Updated: ${issue.metadata.updated}`);
  }
  console.log(`Comments: ${issue.content.comments.length}`);
  
  if (issue.content.problemMotivation) {
    console.log('\n🎯 Problem/Motivation');
    console.log('======================');
    console.log(issue.content.problemMotivation);
  }
  
  if (issue.content.proposedResolution) {
    console.log('\n💡 Proposed Resolution');
    console.log('=======================');
    console.log(issue.content.proposedResolution);
  }
  
  if (issue.content.remainingTasks) {
    console.log('\n✅ Remaining Tasks');
    console.log('===================');
    console.log(issue.content.remainingTasks);
  }
  
  if (issue.content.summary && !issue.content.problemMotivation && !issue.content.proposedResolution) {
    console.log('\n📝 Summary');
    console.log('===========');
    console.log(issue.content.summary);
  }

  if (issue.content.comments.length > 0) {
    console.log('\n💬 Recent Comments');
    console.log('===================');
    issue.content.comments.slice(-3).forEach((comment: any) => {
      console.log(`${comment.author} (${comment.timestamp}):`);
      if (comment.statusChange) {
        console.log(`   Status: ${comment.statusChange}`);
      }
      if (comment.content && comment.content.length > 10) {
        console.log(comment.content.substring(0, 300) + (comment.content.length > 300 ? '...' : ''));
      }
      console.log();
    });
  }
}


function displayClaudeAnalysis(analysis: ClaudeAnalysis) {
  console.log('🤖 Claude Code Analysis');
  console.log('========================');
  console.log(`Title: ${analysis.issue.content.title}`);
  console.log(`Status: ${analysis.issue.metadata.status} | Priority: ${analysis.issue.metadata.priority}`);
  console.log(`Project: ${analysis.issue.metadata.project}`);
  console.log();

  console.log('⚡ Technical Summary');
  console.log('====================');
  console.log(analysis.technicalSummary);
  console.log();

  console.log('🔧 Drupal Context');
  console.log('==================');
  console.log(analysis.drupalContext);
  console.log();

  const readinessEmojis = {
    'ready-to-contribute': '🟢',
    'needs-discussion': '🟡',
    'complex-advanced': '🟠',
    'blocked': '🔴'
  };

  console.log(`📋 Contribution Readiness: ${readinessEmojis[analysis.contributionReadiness]} ${analysis.contributionReadiness.toUpperCase().replace(/-/g, ' ')}`);
  console.log();

  const complexityEmojis = {
    'beginner': '🟢',
    'intermediate': '🟡',
    'advanced': '🟠',
    'expert': '🔴'
  };

  console.log(`🎓 Complexity Level: ${complexityEmojis[analysis.estimatedComplexity]} ${analysis.estimatedComplexity.toUpperCase()}`);
  console.log();

  console.log(`🔍 Code Review Needed: ${analysis.codeReviewNeeded ? '✅ Yes' : '❌ No'}`);
  console.log();

  console.log('🎯 Next Steps for Claude Code');
  console.log('==============================');
  analysis.nextSteps.forEach((step, index) => {
    console.log(`${index + 1}. ${step}`);
  });
  console.log();

  if (analysis.relatedPatterns.length > 0) {
    console.log('🏗️ Related Drupal Patterns');
    console.log('===========================');
    analysis.relatedPatterns.forEach(pattern => console.log(`• ${pattern}`));
  }
}

function displaySizeAnalysis(
  analysis: {
    promptLength: number;
    estimatedTokens: number;
    commentCount: number;
    totalCommentLength: number;
    averageCommentLength: number;
    recommendation: 'safe' | 'large' | 'mega-issue';
    promptPreview: string;
  },
  issue: any
) {
  console.log('📊 Prompt Size Analysis');
  console.log('========================');
  console.log(`Title: ${issue.content.title}`);
  console.log(`Comments: ${analysis.commentCount}`);
  console.log();
  
  console.log('📏 Size Metrics');
  console.log('================');
  console.log(`Prompt Length: ${analysis.promptLength.toLocaleString()} characters`);
  console.log(`Estimated Tokens: ${analysis.estimatedTokens.toLocaleString()}`);
  console.log(`Total Comment Length: ${analysis.totalCommentLength.toLocaleString()} characters`);
  console.log(`Average Comment Length: ${analysis.averageCommentLength} characters`);
  console.log();
  
  const recommendationEmoji = {
    'safe': '🟢',
    'large': '🟡',
    'mega-issue': '🔴'
  };
  
  const recommendationText = {
    'safe': 'Safe to run - should process normally',
    'large': 'Large issue - may take longer, monitor for context limits',
    'mega-issue': 'MEGA-ISSUE - May hit context limits, consider chunking or specialized handling'
  };
  
  console.log('🎯 Recommendation');
  console.log('=================');
  console.log(`${recommendationEmoji[analysis.recommendation]} ${analysis.recommendation.toUpperCase()}: ${recommendationText[analysis.recommendation]}`);
  console.log();
  
  console.log('👀 Prompt Preview (first 500 chars)');
  console.log('====================================');
  console.log(analysis.promptPreview);
  console.log();
  
  if (analysis.recommendation === 'mega-issue') {
    console.log('⚠️  MEGA-ISSUE WARNINGS');
    console.log('======================');
    console.log('• This issue may exceed Claude\'s context window');
    console.log('• Consider implementing prompt chunking or summarization');
    console.log('• Agent analysis may fail or be truncated');
    console.log('• This is exactly the type of issue this tool was designed to make accessible!');
  }
}

program.parse();