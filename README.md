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

This tool is designed to work seamlessly with [Claude Code](https://claude.ai/code) for AI-assisted Drupal development. Here's how to use it effectively:

#### 🚀 Quick Start for Developers

**Prerequisites:**
- Tool installed globally: `npm install -g drupal-issue-analyzer`
- Working in a Claude Code session

**Basic Usage Pattern:**
```
Use a Task agent to analyze this Drupal issue: [PASTE_ISSUE_URL]

Please show me both the full agent analysis AND your summary of what this means for our project.
```

#### 📋 Request Patterns That Work Best

**✅ For complete analysis:**
```
Use a Task agent to analyze this Drupal issue: https://www.drupal.org/project/eca/issues/3539583

I want to see the complete formatted analysis from the agent, plus your recommendations for next steps.
```

**✅ For team sharing:**
```
Use a Task agent to analyze this Drupal issue: [URL]

Show me the full analysis so I can share it with my team, and add your thoughts on how it fits our current sprint goals.
```

**✅ For multiple issues:**
```
Use a Task agent to analyze these Drupal issues and recommend which one I should work on:
- [URL 1]
- [URL 2] 
- [URL 3]
```

#### 🎯 What You'll Get

**1. Complete Agent Analysis:**
- 🤖 Professional formatted response with emoji headers
- 📋 Contribution readiness assessment (🟢🟡🟠🔴)
- 🎓 Complexity level for skill matching  
- 🎯 Specific next steps for contributing
- 🏗️ Related Drupal patterns for learning

**2. Claude's Strategic Context:**
- Summary and implications for your project
- Recommendations for team planning
- Integration with current sprint goals

#### ⚡ How It Works Automatically

Claude will automatically:
1. Spawn a specialized agent with Drupal expertise
2. Run `drupal-issue-analyzer "[URL]" --claude-prompt` 
3. Apply expert Drupal knowledge using the tool's built-in prompts
4. Return comprehensive analysis with beautiful formatting
5. Add contextual summary and recommendations

**Why this approach is optimal:**
- ✅ **Zero setup** - No configuration files or API keys needed
- ✅ **Handles mega-issues** - Processes 200+ comment discussions efficiently  
- ✅ **Expert-level analysis** - Deep Drupal knowledge (Entity API, Form API, contrib patterns)
- ✅ **Self-contained workflow** - Agent manages the entire pipeline with built-in prompts
- ✅ **Team-ready output** - Beautiful formatted results perfect for sharing
- ✅ **Context-efficient** - Only final analysis reaches Claude's context

#### 💡 Pro Tips for Best Results

**To ensure you see the complete formatted analysis:**
- Always mention **"full analysis"** or **"complete response"** in your request
- Ask for **"both the agent analysis AND your summary"** to get everything
- Request **"team-ready format"** if you plan to share results with colleagues

**❌ Avoid:** Just saying "Analyze this issue" - you might only get Claude's summary instead of the detailed formatted analysis

**✅ Better:** "Use a Task agent to analyze this issue and show me the complete formatted analysis plus your recommendations"

#### 📝 Making Claude Aware of This Tool

**Option 1: Global CLAUDE.md (Recommended)**
Create `~/.claude/CLAUDE.md` or `~/CLAUDE.md`:
```markdown
# Available Tools

## drupal-issue-analyzer
- **Purpose**: Expert analysis of Drupal.org issues with formatted output
- **Install**: `npm install -g drupal-issue-analyzer`  
- **Claude Usage**: "Use a Task agent to analyze this Drupal issue: [URL] - show full analysis and summary"
- **Direct CLI**: `drupal-issue-analyzer "[URL]" --claude-prompt`
```

**Option 2: Project-Specific CLAUDE.md**
Add to your project's `CLAUDE.md`:
```markdown
# Project Tools

This project has access to `drupal-issue-analyzer` for analyzing Drupal.org issues.
Ask Claude: "Use a Task agent to analyze this Drupal issue: [URL]"
```

**Option 3: Natural Discovery**
Claude can discover this tool naturally by running:
```bash
drupal-issue-analyzer --help
```
The help output includes complete Claude Code integration instructions.

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
drupal-issue-analyzer "$ISSUE_URL" --json > issue-analysis.json
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
npm run dev -- "https://www.drupal.org/project/eca/issues/3539583"

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