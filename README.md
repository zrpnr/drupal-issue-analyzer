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

### Full AI Analysis
```bash
# Set your OpenAI API key
export OPENAI_API_KEY=your_openai_api_key_here

# Analyze an issue with AI insights
drupal-issue-analyzer "https://www.drupal.org/project/eca/issues/3539583"
```

### JSON Output
```bash
drupal-issue-analyzer "https://www.drupal.org/project/eca/issues/3539583" --json
```

## Example Output

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