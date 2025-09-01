export interface IssueMetadata {
  project: string;
  version: string;
  component: string;
  priority: string;
  status: string;
  created: string;
  updated: string;
  reporter: string;
  assigned?: string;
  category?: string;
}

export interface IssueComment {
  id: string;
  author: string;
  timestamp: string;
  content: string;
  statusChange?: string;
}

export interface IssueContent {
  title: string;
  summary: string;
  problemMotivation?: string;
  proposedResolution?: string;
  remainingTasks?: string;
  userInterfaceChanges?: string;
  apiChanges?: string;
  dataModelChanges?: string;
  comments: IssueComment[];
}

export interface ParsedIssue {
  url: string;
  metadata: IssueMetadata;
  content: IssueContent;
}

export interface IssueSummary {
  issue: ParsedIssue;
  technicalSummary: string;
  workCompleted: string[];
  remainingWork: string[];
  actionableSteps: string[];
  recommendedPriority: 'low' | 'medium' | 'high' | 'urgent';
}