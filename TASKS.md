# Development Tasks

## Claude Code Agent Analysis Feature

### Phase 1: Core Implementation

#### 1. Add --claude-analysis CLI option
- **File**: `src/cli.ts`
- **Task**: Add new CLI option to Commander.js configuration
- **Details**: 
  - Add `--claude-analysis` flag alongside existing `--no-ai` and `--json` options
  - Update option validation logic
  - Ensure mutually exclusive with `--no-ai` if needed

#### 2. Create ClaudeAgent class
- **File**: `src/claude-agent.ts` (new file)
- **Task**: Implement specialized Drupal issue analysis class
- **Details**:
  - Class structure similar to `IssueAnalyzer` but for Claude Code consumption
  - Handle Task tool integration
  - Return structured data optimized for AI assistant workflows

#### 3. Design agent prompt for Drupal expertise
- **File**: `src/claude-agent.ts`
- **Task**: Create comprehensive prompt for Drupal-specific analysis
- **Requirements**:
  - Drupal API knowledge and coding standards
  - Common issue pattern recognition (migrate plugins, entity API, form API, etc.)
  - Identification of issue complexity levels
  - Recognition of contribution readiness state
  - Output format tailored for Claude Code consumption

#### 4. Implement Task tool integration
- **File**: `src/claude-agent.ts`
- **Task**: Use Task tool to launch general-purpose agent
- **Details**:
  - Pass parsed issue data to agent
  - Handle agent response parsing
  - Error handling for agent failures
  - Timeout management

### Phase 2: Enhanced Analysis

#### 5. Create Claude Code optimized output format
- **File**: `src/claude-agent.ts`
- **Task**: Design output structure for AI assistant consumption
- **Format Requirements**:
  - Concise technical summary (2-3 sentences max)
  - Drupal-specific context (API changes, patterns, standards compliance)
  - Clear next steps prioritized by feasibility
  - Issue complexity assessment (beginner/intermediate/advanced)
  - Contribution readiness indicators
  - Related Drupal documentation links

#### 6. Add codebase-aware analysis
- **File**: `src/claude-agent.ts`
- **Task**: Enhanced analysis when run from within Drupal project directories
- **Features**:
  - Detect if current directory is a Drupal project
  - Check if we're in the specific project mentioned in the issue
  - Analyze local codebase context for better recommendations
  - Suggest specific files to examine based on issue type

#### 7. Add error handling for agent failures
- **File**: `src/claude-agent.ts` and `src/cli.ts`
- **Task**: Graceful degradation when agent analysis fails
- **Implementation**:
  - Try agent analysis first
  - Fall back to standard parsing on agent failure
  - Log agent errors for debugging
  - Provide user feedback about fallback mode

### Phase 3: Documentation and Testing

#### 8. Update CLI help text and README
- **Files**: `src/cli.ts`, `README.md`
- **Task**: Document new Claude analysis mode
- **Content**:
  - Add `--claude-analysis` to help output
  - Update README with new option examples
  - Explain when to use each mode (--no-ai vs --claude-analysis vs full AI)
  - Add examples of Claude Code workflow integration

#### 9. Test agent analysis with various issue types
- **Task**: Comprehensive testing across Drupal issue categories
- **Test Cases**:
  - Module development issues (new features, API changes)
  - Bug reports (simple fixes vs complex debugging)
  - Core patches (high complexity, standards compliance)
  - Documentation issues
  - Security issues (if applicable)
  - Issues at different lifecycle stages (new, needs work, needs review, RTBC)

## Future Roadmap Items

### Integration Enhancements
- **Git Integration**: Detect if issue has associated merge requests/patches
- **Drupal.org API**: Use official API for richer metadata when available
- **Local Development**: Integration with DDEV, Lando, or other local dev tools

### Analysis Improvements
- **Historical Context**: Learn from similar resolved issues
- **Contributor Matching**: Suggest issues based on developer skill level
- **Impact Assessment**: Estimate issue impact on end users and developers

### Workflow Integration
- **IDE Integration**: VS Code extension or similar
- **CI/CD Integration**: Automated issue analysis in development workflows
- **Team Collaboration**: Shared analysis results and recommendations

## Implementation Notes

### Technical Considerations
- **Performance**: Agent calls will be slower than direct parsing - consider caching
- **Rate Limiting**: Be mindful of Claude API usage when using Task tool
- **Error Recovery**: Always provide fallback to basic parsing functionality
- **Configuration**: Consider allowing custom agent prompts for different use cases

### User Experience
- **Progress Indicators**: Show when agent analysis is running (can take 10-30s)
- **Verbose Mode**: Option to show detailed agent reasoning process
- **Batch Processing**: Ability to analyze multiple issues at once