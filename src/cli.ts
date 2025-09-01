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
  .option('--truncate', 'Use with --claude-prompt for mega-issues: intelligent comment truncation')
  .option('--force-full', 'Use with --claude-prompt for mega-issues: attempt full analysis anyway')
  .addHelpText('after', `
Claude Code Integration:
  Ask Claude: "Use a Task agent to analyze this Drupal issue: [URL]"
  The agent will automatically run: drupal-issue-analyzer "[URL]" --claude-prompt

Examples:
  $ drupal-issue-analyzer "https://drupal.org/project/eca/issues/3539583"
  $ drupal-issue-analyzer "https://drupal.org/project/eca/issues/3539583" --json
  $ drupal-issue-analyzer "https://drupal.org/project/eca/issues/3539583" --claude-prompt
  
Mega-Issue Handling:
  $ drupal-issue-analyzer "[URL]" --claude-prompt --truncate     # Smart truncation
  $ drupal-issue-analyzer "[URL]" --claude-prompt --force-full   # Attempt full analysis

For Claude Code users:
  Just ask: "Use a Task agent to analyze this Drupal issue: [URL] and show me the full analysis"
  For mega-issues, the agent will automatically retry with appropriate options.
`)
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
        const sizeAnalysis = claudeAgent.analyzePromptSize(issue);
        
        // Always show size info
        console.log(`📊 Issue Size: ${sizeAnalysis.commentCount} comments, ~${sizeAnalysis.estimatedTokens} tokens (${sizeAnalysis.recommendation.toUpperCase()})\n`);
        
        if (sizeAnalysis.recommendation === 'mega-issue') {
          if (options.truncate) {
            console.log('🔄 Using truncated analysis for mega-issue...\n');
            const formattedPrompt = claudeAgent.buildTruncatedPrompt(issue);
            console.log(formattedPrompt);
          } else if (options.forceFull) {
            console.log('⚠️  PROCEEDING WITH FULL ANALYSIS - CONTEXT OVERFLOW LIKELY');
            console.log('📊 Issue Size: This may exceed agent context limits and cause incomplete analysis');
            console.log('💡 Consider using --truncate for more reliable results on mega-issues');
            console.log('🔄 Proceeding anyway...\n');
            const formattedPrompt = claudeAgent.buildAnalysisPrompt(issue);
            console.log(formattedPrompt);
          } else {
            console.log('🛑 MEGA-ISSUE DETECTED - This may exceed agent context limits.');
            console.log('Options:');
            console.log('  --truncate     : Analyze with intelligent comment truncation');
            console.log('  --force-full   : Attempt full analysis anyway (may fail)');
            console.log('\nExample:');
            console.log(`  drupal-issue-analyzer "${url}" --claude-prompt --truncate`);
            process.exit(1);
          }
        } else {
          // Safe or large - proceed normally
          const formattedPrompt = claudeAgent.buildAnalysisPrompt(issue);
          console.log(formattedPrompt);
        }
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