# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Drupal Issue Analyzer** is a TypeScript/Node.js CLI tool that analyzes and summarizes Drupal.org issues, providing developer-focused insights and actionable next steps.

### Key Features
- Parses Drupal.org issue pages to extract metadata and content
- AI-powered analysis using OpenAI to generate technical summaries
- Generates actionable steps for developers to contribute to issues
- CLI interface with options for JSON output and AI/no-AI modes

## Technology Stack

- **Language**: TypeScript
- **Runtime**: Node.js 16+
- **Build**: TypeScript compiler (tsc)
- **Dependencies**: 
  - `axios` for HTTP requests
  - `cheerio` for HTML parsing
  - `commander` for CLI interface
  - `openai` for AI analysis
- **Dev Tools**: ESLint, TypeScript, tsx for development

## Development Commands

```bash
# Install dependencies
npm install

# Development mode
npm run dev -- "https://drupal.org/project/example/issues/123" --no-ai

# Build project
npm run build

# Run built CLI
npm start -- "https://drupal.org/project/example/issues/123"

# Linting and type checking
npm run lint
npm run typecheck
```

## Project Structure

```
src/
├── types.ts      # TypeScript interfaces and types
├── parser.ts     # Drupal issue parsing logic
├── analyzer.ts   # AI analysis using OpenAI
├── cli.ts        # Command-line interface
└── index.ts      # Main export file
```

## Key Components

### Parser (`src/parser.ts`)
- `DrupalIssueParser.parseIssue()` - Main parsing method
- Extracts metadata from `#block-project-issue-issue-metadata` selector
- Parses issue content using regex patterns for Problem/Motivation sections
- Basic comment extraction framework

### Analyzer (`src/analyzer.ts`)
- `IssueAnalyzer.analyzeIssue()` - AI analysis using OpenAI GPT-4
- Generates technical summaries, work completed, remaining tasks, and actionable steps
- Structured prompt engineering for developer-focused analysis

### CLI (`src/cli.ts`)
- Commander.js-based interface
- Supports `--no-ai`, `--json`, `--openai-key` options
- Validates Drupal.org URLs before processing

## Development Guidelines

- **Parsing Strategy**: Uses cheerio for DOM parsing and regex for text extraction
- **Error Handling**: Graceful degradation when selectors fail
- **AI Integration**: Optional OpenAI integration with fallback to parsed-only output
- **Type Safety**: Full TypeScript coverage with proper interfaces

## Testing

Test the tool with various Drupal.org issue URLs:
```bash
npm run dev -- "https://www.drupal.org/project/eca/issues/3539583" --no-ai
```

## Distribution

- Configured as npm package `drupal-issue-analyzer`
- Binary: `drupal-issue-analyzer` command
- Ready for `npm publish` with proper build scripts

## Current Features

### Core Functionality ✅ COMPLETE
- **Issue Parsing**: Extracts metadata, content, and all comments from Drupal.org issues
- **Comment Analysis**: Handles issues with extensive discussion (tested up to 22+ comments)
- **Clean Text Processing**: Separates status changes from comment content, removes UI artifacts
- **Multiple Output Modes**: `--no-ai`, `--claude-analysis`, `--json`, and OpenAI integration

### Claude Code Integration ✅ COMPLETE  
- **`--claude-analysis` Mode**: Specialized analysis optimized for Claude Code workflows
- **Drupal Expertise**: Agent prompt with deep Drupal API and pattern knowledge
- **All Comments Analysis**: Processes complete comment history, not just recent discussions
- **Structured Output**: Contribution readiness, complexity assessment, next steps, and related patterns
- **Simulated Framework**: Complete implementation ready for Task tool integration

## Future Enhancements

### Phase 1: Production Task Tool Integration 🔄 NEXT PRIORITY
- **Real Agent Integration**: Replace simulated responses with actual Task tool calls
- **Large Thread Handling**: Test and optimize for 100+ comment issues (up to 483 comments found in Drupal core)
- **Error Handling**: Graceful fallback to parsing-only mode when agents unavailable
- **Response Caching**: Avoid re-analyzing same issues multiple times

### Phase 2: Advanced Features 📋 PLANNED
- **Codebase-Aware Analysis**: Enhanced analysis when run from within Drupal project directories
- **Multi-Agent Workflows**: Separate agents for technical analysis vs contribution strategy  
- **Mega-Issue Optimization**: Special handling for 200+ comment threads with timeline analysis
- **Integration Hub**: Connect with Composer, Drush, Git workflows for complete development assistance