# Drupal Issue Analyzer

A CLI tool that analyzes and summarizes Drupal.org issues, providing developer-focused insights and actionable next steps.

## Features

- **Issue Parsing**: Extracts metadata, content, and comments from Drupal.org issue pages
- **Claude Code Integration**: Specialized workflow for AI-assisted Drupal development  
- **Developer-Focused**: Structures data the way an experienced Drupal developer needs
- **Mega-Issue Support**: Handles complex issues with 200+ comments efficiently
- **Clean JSON Output**: Perfect for programmatic use and AI analysis
- **CLI Interface**: Easy-to-use command-line tool

## Installation

```bash
npm install -g drupal-issue-analyzer
```

## Usage

### Basic Usage
```bash
# Default behavior: clean, structured parsing of Drupal issues
drupal-issue-analyzer "https://www.drupal.org/project/eca/issues/3539583"
```

### Claude Code Integration ⚡ (Recommended)
The tool is designed to work seamlessly with [Claude Code](https://claude.ai/code) for AI-assisted Drupal development:

```
Ask Claude: "Analyze this Drupal issue: https://www.drupal.org/project/eca/issues/3539583"
```

Claude will automatically:
1. Spawn a specialized agent with Drupal expertise
2. Run `drupal-issue-analyzer "[URL]" --json` to parse the issue
3. Apply deep Drupal knowledge to analyze technical context and contribution opportunities
4. Provide structured insights about readiness, complexity, and next steps

**Why this approach is optimal:**
- ✅ Handles mega-issues (200+ comments) that would overflow AI context windows
- ✅ Expert-level Drupal knowledge (Entity API, Form API, contrib patterns)
- ✅ Self-contained workflow - agent manages the entire pipeline
- ✅ Context-efficient - only final analysis reaches Claude's context
- ✅ Real-time analysis - no API keys or setup required

### Direct CLI Usage
```bash
# Default: Parse and display issue data
drupal-issue-analyzer "https://www.drupal.org/project/eca/issues/3539583"

# Get JSON output for programmatic use or Claude Code integration
drupal-issue-analyzer "https://www.drupal.org/project/eca/issues/3539583" --json
```

## Team Usage

This tool is designed for development teams working on Drupal projects. The Claude Code integration makes it especially valuable for:

### Project Planning
- Quickly assess the state and complexity of potential issues to work on
- Understand technical requirements and contribution readiness
- Get expert insights on Drupal architectural patterns involved

### Code Review Process
- Analyze issues before starting work to understand full context
- Get structured summaries of complex discussions with 100+ comments
- Identify potential blockers or dependencies early

### Knowledge Sharing
- Help team members understand unfamiliar Drupal subsystems
- Share structured analysis of complex issues via JSON output
- Onboard new developers to contribution processes

### CI/CD Integration
```bash
# Generate structured issue data for automated processes
drupal-issue-analyzer "$ISSUE_URL" --json --no-ai > issue-analysis.json
```

## Example Output

### Claude Code Integration Result
When you ask Claude to analyze a Drupal issue, you'll get expert analysis like this:
```
🤖 Claude Code Analysis
========================
Title: Provide possibility to set a default access result for entity access events
Status: Needs work | Priority: Normal
Project: ECA: Event - Condition - Action

⚡ Technical Summary
====================
This issue addresses limitations in ECA's entity access event system where previously 
set access results cannot be overridden, requiring a configurable default access result mechanism.

🔧 Drupal Context
==================
Involves Drupal's entity access system, ECA event-driven architecture, and access result 
objects (AccessResultInterface). Relates to core entity access hooks and contrib ECA module patterns.

📋 Contribution Readiness: 🟡 NEEDS DISCUSSION

🎓 Complexity Level: 🟡 INTERMEDIATE

🔍 Code Review Needed: ✅ Yes

🎯 Next Steps for Claude Code
==============================
1. Review the merge request code for access result handling logic
2. Test the proposed default access configuration with various entity types
3. Address behavior inconsistencies between different access events mentioned in comments
4. Validate that default "forbidden" doesn't permanently block access as reported

🏗️ Related Drupal Patterns
===========================
• Entity access system
• ECA event architecture
• Access result objects
• Entity hooks
```

### Standard Analysis Output
```
🔍 Issue Analysis
==================
Title: Add migrate process plugin
Status: Needs review | Priority: Normal
Project: ECA: Event - Condition - Action

📄 Technical Summary
=====================
The issue requests a new migrate process plugin that would trigger ECA events,
allowing transformation of row values using ECA models as a replacement for
existing contrib modules.

✅ Work Completed
==================
• Initial plugin implementation submitted
• Code review feedback addressed
• Tests added for core functionality

⏳ Remaining Work
==================
• Address performance concerns in large migrations
• Add documentation for plugin usage
• Create example configurations

🎯 Actionable Steps
====================
1. Review the latest patch for code quality and Drupal standards
2. Test the plugin with different migration scenarios
3. Provide feedback on the API design
4. Help with documentation if the functionality looks good

📊 Recommended Priority: 🟡 MEDIUM
```

## Development

```bash
# Clone the repository
git clone <repository-url>
cd drupal-issue-analyzer

# Install dependencies
npm install

# Run in development mode
npm run dev -- "https://www.drupal.org/project/eca/issues/3539583" --no-ai

# Build the project
npm run build

# Run linting
npm run lint

# Run type checking
npm run typecheck
```

## API

You can also use this tool programmatically:

```typescript
import { DrupalIssueParser } from 'drupal-issue-analyzer';

const parser = new DrupalIssueParser();
const issue = await parser.parseIssue('https://www.drupal.org/project/eca/issues/3539583');

// Use the parsed issue data for your own analysis or pass to Claude Code
console.log(JSON.stringify(issue, null, 2));
```

## Requirements

- Node.js 16 or later

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

MIT