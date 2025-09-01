#!/usr/bin/env node

import { Command } from 'commander';
import { DrupalIssueParser } from './parser.js';
import { IssueAnalyzer } from './analyzer.js';
import { IssueSummary } from './types.js';

const program = new Command();

program
  .name('drupal-issue-analyzer')
  .description('Analyze and summarize Drupal.org issues')
  .version('0.1.0');

program
  .argument('<url>', 'Drupal.org issue URL to analyze')
  .option('--openai-key <key>', 'OpenAI API key for AI analysis')
  .option('--no-ai', 'Skip AI analysis and show only parsed data')
  .option('--json', 'Output in JSON format')
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

      if (options.noAi) {
        if (options.json) {
          console.log(JSON.stringify(issue, null, 2));
        } else {
          displayParsedIssue(issue);
        }
        return;
      }

      const apiKey = options.openaiKey || process.env.OPENAI_API_KEY;
      if (!apiKey) {
        console.error('Error: OpenAI API key required for AI analysis');
        console.error('Set OPENAI_API_KEY environment variable or use --openai-key option');
        console.error('Or use --no-ai to skip AI analysis');
        process.exit(1);
      }

      console.log('Running AI analysis...\n');
      const analyzer = new IssueAnalyzer(apiKey);
      const summary = await analyzer.analyzeIssue(issue);

      if (options.json) {
        console.log(JSON.stringify(summary, null, 2));
      } else {
        displaySummary(summary);
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
  console.log(`Reporter: ${issue.metadata.reporter}`);
  console.log(`Created: ${issue.metadata.created}`);
  console.log(`Comments: ${issue.content.comments.length}`);
  
  if (issue.content.summary) {
    console.log('\n📝 Summary');
    console.log('===========');
    console.log(issue.content.summary);
  }

  if (issue.content.comments.length > 0) {
    console.log('\n💬 Recent Comments');
    console.log('===================');
    issue.content.comments.slice(-3).forEach((comment: any) => {
      console.log(`${comment.author} (${comment.timestamp}):`);
      console.log(comment.content.substring(0, 200) + (comment.content.length > 200 ? '...' : ''));
      console.log();
    });
  }
}

function displaySummary(summary: IssueSummary) {
  console.log('🔍 Issue Analysis');
  console.log('==================');
  console.log(`Title: ${summary.issue.content.title}`);
  console.log(`Status: ${summary.issue.metadata.status} | Priority: ${summary.issue.metadata.priority}`);
  console.log(`Project: ${summary.issue.metadata.project}`);
  console.log();

  console.log('📄 Technical Summary');
  console.log('=====================');
  console.log(summary.technicalSummary);
  console.log();

  if (summary.workCompleted.length > 0) {
    console.log('✅ Work Completed');
    console.log('==================');
    summary.workCompleted.forEach(work => console.log(`• ${work}`));
    console.log();
  }

  if (summary.remainingWork.length > 0) {
    console.log('⏳ Remaining Work');
    console.log('==================');
    summary.remainingWork.forEach(work => console.log(`• ${work}`));
    console.log();
  }

  console.log('🎯 Actionable Steps');
  console.log('====================');
  summary.actionableSteps.forEach((step, index) => {
    console.log(`${index + 1}. ${step}`);
  });
  console.log();

  const priorityEmoji = {
    low: '🟢',
    medium: '🟡', 
    high: '🟠',
    urgent: '🔴'
  };

  console.log(`📊 Recommended Priority: ${priorityEmoji[summary.recommendedPriority]} ${summary.recommendedPriority.toUpperCase()}`);
}

program.parse();