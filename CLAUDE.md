# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Drupal Issue Analyzer** is a TypeScript/Node.js CLI tool that analyzes and summarizes Drupal.org issues, providing developer-focused insights and actionable next steps. The tool is designed specifically for Claude Code integration with expert-level Drupal analysis capabilities.

### Key Features
- Parses Drupal.org issue pages to extract metadata and content (including all comments)
- **Claude Code Integration**: Self-contained workflow with `--claude-prompt` flag
- **Expert Analysis**: Deep Drupal knowledge (Entity API, Form API, contrib patterns)
- **Beautiful Formatting**: Professional output with emojis and visual hierarchy
- **Mega-Issue Support**: Handles 200+ comment discussions efficiently
- **Zero Configuration**: Complete self-contained workflow

## Current Architecture

### Primary Workflow: Claude Code Integration ⚡
The tool's main purpose is providing expert Drupal analysis through Claude Code Task agents:

1. **User Request**: "Use a Task agent to analyze this Drupal issue: [URL]"
2. **Agent Execution**: Runs `drupal-issue-analyzer "[URL]" --claude-prompt`
3. **Tool Output**: Pre-formatted expert prompt with all issue data and analysis guidance
4. **Agent Analysis**: Applies Drupal expertise to provide structured insights
5. **Final Output**: Professional formatted analysis with contribution readiness assessment

### Technology Stack

- **Language**: TypeScript
- **Runtime**: Node.js 16+
- **Build**: TypeScript compiler (tsc)
- **Dependencies**: 
  - `axios` for HTTP requests
  - `cheerio` for HTML parsing
  - `commander` for CLI interface
- **Dev Tools**: ESLint, TypeScript, tsx for development

## Development Commands

```bash
# Install dependencies
npm install

# Development mode (defaults to parsing-only)
npm run dev -- "https://drupal.org/project/example/issues/123"

# Test Claude Code integration
npm run dev -- "https://drupal.org/project/example/issues/123" --claude-prompt

# Build project
npm run build

# Linting and type checking
npm run lint
npm run typecheck
```

## Project Structure

```
src/
├── types.ts              # TypeScript interfaces and types
├── parser.ts             # Drupal issue parsing logic
├── claude-agent.ts       # Claude Code prompt generation and formatting
├── task-integration.ts   # Task tool wrapper (legacy)
├── cli.ts                # Command-line interface
└── index.ts              # Main export file
```

## Key Components

### Parser (`src/parser.ts`)
- `DrupalIssueParser.parseIssue()` - Main parsing method
- Extracts metadata from `#block-project-issue-issue-metadata` selector  
- Parses issue content using regex patterns for Problem/Motivation sections
- Comprehensive comment extraction with status change detection

### Claude Agent (`src/claude-agent.ts`)
- `buildAnalysisPrompt()` - Generates formatted prompt for Claude Code agents
- `analyzePromptSize()` - Analyzes prompt size for mega-issue assessment
- Contains expert Drupal analysis guidance and structured output formatting
- **Self-contained**: All necessary prompts and formatting built into the tool

### CLI (`src/cli.ts`)
- Commander.js-based interface with enhanced help text
- **Default behavior**: Parse and display issue data (no flags needed)
- **Key flags**: `--json`, `--claude-prompt`, `--analyze-size`
- **Claude Integration**: Help text includes complete usage instructions

## CLI Options

```bash
# Default: Parse and display issue data
drupal-issue-analyzer "URL"

# JSON output (for programmatic use)
drupal-issue-analyzer "URL" --json

# Claude Code integration (formatted prompt)
drupal-issue-analyzer "URL" --claude-prompt

# Size analysis (for mega-issues)
drupal-issue-analyzer "URL" --analyze-size
```

## Claude Code Integration Features ✅ COMPLETE

### **Self-Contained Workflow**
- **`--claude-prompt` flag**: Outputs complete formatted analysis prompt
- **Built-in expertise**: All Drupal knowledge embedded in prompts
- **Professional formatting**: Emoji headers, color-coded status, structured output
- **No parsing complexity**: Agent receives formatted prompt, returns formatted analysis

### **Expert-Level Analysis**
- **Status recognition**: Correctly interprets RTBC, needs work, needs review, etc.
- **Code detection**: Identifies MR/patch references in comments
- **Contribution readiness**: 🟢🟡🟠🔴 assessment system
- **Technical depth**: Entity API, Form API, event systems, access patterns
- **Community context**: Collaboration patterns, consensus building, reviewer feedback

### **Mega-Issue Capability** 🚀
- **483-comment parsing**: Successfully processes massive discussions
- **Context efficiency**: 30K structured tokens vs 500K+ HTML noise
- **Smart architecture**: Parser handles complexity, agents focus on analysis
- **Size assessment**: `--analyze-size` for pre-flight mega-issue evaluation

## Usage with Claude Code Sessions

### Simple Request Format
```
Use a Task agent to analyze this Drupal issue: [ISSUE_URL]

Please show me both the full agent analysis AND your summary of what this means for our project.
```

### What You Get
1. **🤖 Complete Agent Analysis**: Professional formatted response with emoji headers, contribution readiness (🟢🟡🟠🔴), complexity levels, and next steps
2. **📋 Claude's Strategic Context**: Summary, project implications, and recommendations

### Example Usage Patterns

**For contribution planning:**
```
Use a Task agent to analyze this Drupal issue: https://www.drupal.org/project/eca/issues/3540135

Show me the full analysis so I can share it with my team, and add your thoughts on how it fits our current sprint goals.
```

**For multiple issue comparison:**
```
Use a Task agent to analyze these Drupal issues and recommend which one I should work on:
- [URL 1]
- [URL 2]
```

## Development Guidelines

- **Parsing-First Architecture**: Tool focuses on excellent parsing, agents handle analysis
- **Error Handling**: Graceful degradation when selectors fail
- **Self-Documentation**: `--help` includes complete Claude Code integration instructions
- **Type Safety**: Full TypeScript coverage with proper interfaces
- **Zero Dependencies**: No OpenAI API keys or external services required

## Testing

Test the tool with various Drupal.org issue URLs:
```bash
# Test parsing
npm run dev -- "https://www.drupal.org/project/eca/issues/3539583"

# Test Claude Code integration
npm run dev -- "https://www.drupal.org/project/eca/issues/3539583" --claude-prompt

# Test mega-issue size analysis
npm run dev -- "https://www.drupal.org/project/drupal/issues/[large-issue]" --analyze-size
```

## Distribution

- Configured as npm package `drupal-issue-analyzer`
- Binary: `drupal-issue-analyzer` command
- Global installation: `npm install -g drupal-issue-analyzer`
- **Self-discovering**: `drupal-issue-analyzer --help` includes Claude Code instructions

## Tool Discovery for Claude

The tool is designed to be discoverable by Claude through standard conventions:

1. **Natural Discovery**: `drupal-issue-analyzer --help` shows complete Claude Code integration
2. **Global CLAUDE.md**: Can be documented in `~/.claude/CLAUDE.md`
3. **Project-specific**: Can be noted in individual project CLAUDE.md files

## Current Status: Production Ready ✅

The tool is complete and production-ready for:
- ✅ **Individual developers**: Global installation with zero setup
- ✅ **Development teams**: Comprehensive documentation and examples  
- ✅ **Claude Code integration**: Complete self-contained workflow
- ✅ **Mega-issue handling**: Intelligent size detection with truncation and full analysis options
- ✅ **Professional output**: Beautiful formatting suitable for team sharing
- ✅ **Transparent limitations**: Honest handling of context limits and mega-issue challenges

## Mega-Issue Handling ✅ COMPLETE

### **Smart Size Detection**
- **Automatic detection**: Issues categorized as safe/large/mega-issue based on comment count and estimated tokens
- **Transparent warnings**: Clear size information provided to users and agents
- **Flexible options**: Multiple strategies for handling different issue sizes

### **Handling Strategies**
1. **Default (`--claude-prompt`)**: Safe and large issues proceed automatically, mega-issues provide guidance
2. **Truncated (`--truncate`)**: Intelligent comment selection preserving key context and recent discussion
3. **Full analysis (`--force-full`)**: Complete analysis with honest warnings about context overflow risk

### **Truncation Strategy**
- **Preserves context**: First 3 comments (original problem/early decisions) + last 10 comments (current status)
- **Summarizes gaps**: Clear explanation of omitted content for transparency
- **Maintains quality**: Expert-level analysis despite reduced input
- **Honest limitations**: Clear documentation of what information was truncated

### **User Experience**
- **Agent auto-retry**: When agents hit mega-issue limits, they get clear instructions for retry with appropriate flags
- **Transparent failures**: `--force-full` provides honest warnings about likely context overflow
- **No hidden behavior**: Users always know when truncation or other processing has occurred

## Future Enhancement Ideas

### **Phase 5: Advanced Mega-Issue Processing 📋 FUTURE**
- **Chunking strategies**: Process mega-issues in sections while maintaining context
- **Timeline analysis**: Extract decision points and consensus evolution from long discussions
- **Semantic clustering**: Group related comments for more intelligent truncation
- **Summary synthesis**: Generate intermediate summaries of truncated sections

### **Other Enhancements**
- **Response caching**: Avoid re-analyzing same issues
- **Multi-agent workflows**: Separate technical vs strategic analysis
- **Codebase-aware analysis**: Enhanced insights when run from Drupal project directories
- **Integration hub**: Connect with Composer, Drush, Git workflows