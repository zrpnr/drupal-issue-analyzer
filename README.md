# Drupal Issue Analyzer

A CLI tool that analyzes and summarizes Drupal.org issues, providing developer-focused insights and actionable next steps.

## Features

- **Issue Parsing**: Extracts metadata, content, and comments from Drupal.org issue pages
- **AI Analysis**: Uses OpenAI to provide intelligent summaries and recommendations
- **Developer-Focused**: Analyzes issues the way an experienced Drupal developer would
- **Actionable Steps**: Generates specific next steps for contributing to issues
- **CLI Interface**: Easy-to-use command-line tool

## Installation

```bash
npm install -g drupal-issue-analyzer
```

## Usage

### Basic Analysis (without AI)
```bash
drupal-issue-analyzer "https://www.drupal.org/project/eca/issues/3539583" --no-ai
```

### Claude Code Analysis (Specialized for AI Assistants)
```bash
# Optimized analysis for Claude Code workflows
drupal-issue-analyzer "https://www.drupal.org/project/eca/issues/3539583" --claude-analysis
```

### Full OpenAI Analysis
```bash
# Set your OpenAI API key
export OPENAI_API_KEY=your_openai_api_key_here

# Analyze an issue with OpenAI insights
drupal-issue-analyzer "https://www.drupal.org/project/eca/issues/3539583"
```

### JSON Output
```bash
drupal-issue-analyzer "https://www.drupal.org/project/eca/issues/3539583" --json
```

## Example Output

### Claude Code Analysis Output
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
import { DrupalIssueParser, IssueAnalyzer } from 'drupal-issue-analyzer';

const parser = new DrupalIssueParser();
const issue = await parser.parseIssue('https://www.drupal.org/project/eca/issues/3539583');

const analyzer = new IssueAnalyzer('your-openai-api-key');
const summary = await analyzer.analyzeIssue(issue);
```

## Requirements

- Node.js 16 or later
- OpenAI API key (for AI analysis features)

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

MIT