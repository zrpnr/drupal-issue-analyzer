import axios from 'axios';
import * as cheerio from 'cheerio';
import { IssueMetadata, IssueContent, IssueComment, ParsedIssue } from './types.js';

export class DrupalIssueParser {
  private async fetchPage(url: string): Promise<cheerio.CheerioAPI> {
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Drupal Issue Analyzer Bot 1.0'
        }
      });
      return cheerio.load(response.data);
    } catch (error) {
      throw new Error(`Failed to fetch issue page: ${error}`);
    }
  }

  private parseMetadata($: cheerio.CheerioAPI): IssueMetadata {
    const metadata: Partial<IssueMetadata> = {};
    
    // Use the specific metadata block
    const metadataBlock = $('#block-project-issue-issue-metadata');
    const metadataText = metadataBlock.text();
    
    // Parse the concatenated metadata using regex since there are no line breaks
    const statusMatch = metadataText.match(/^([^P]*?)Project:/);
    if (statusMatch) {
      metadata.status = statusMatch[1].trim();
    }
    
    const projectMatch = metadataText.match(/Project:\s*([^V]*?)Version:/);
    if (projectMatch) {
      metadata.project = projectMatch[1].trim();
    }
    
    const versionMatch = metadataText.match(/Version:\s*([^C]*?)Component:/);
    if (versionMatch) {
      metadata.version = versionMatch[1].trim();
    }
    
    const componentMatch = metadataText.match(/Component:\s*([^P]*?)Priority:/);
    if (componentMatch) {
      metadata.component = componentMatch[1].trim();
    }
    
    const priorityMatch = metadataText.match(/Priority:\s*([^C]*?)Category:/);
    if (priorityMatch) {
      metadata.priority = priorityMatch[1].trim();
    }
    
    const reporterMatch = metadataText.match(/Reporter:\s*([^C]*?)Created:/);
    if (reporterMatch) {
      metadata.reporter = reporterMatch[1].trim();
    }
    
    const createdMatch = metadataText.match(/Created:\s*(.*?)Updated:/);
    if (createdMatch) {
      metadata.created = createdMatch[1].trim();
    } else {
      // Fallback for when there's no Updated field
      const createdFallback = metadataText.match(/Created:\s*(.*?)(?:\s*Jump|$)/);
      if (createdFallback) {
        metadata.created = createdFallback[1].trim();
      }
    }
    
    const updatedMatch = metadataText.match(/Updated:\s*([^J]*?)(?:Jump|$)/);
    if (updatedMatch) {
      metadata.updated = updatedMatch[1].trim();
    }

    return metadata as IssueMetadata;
  }

  private parseContent($: cheerio.CheerioAPI): IssueContent {
    // Try multiple selectors for title
    const title = $('h1').first().text().trim() || $('h1.page-title').text().trim() || $('.page-title').text().trim();
    
    const content: Partial<IssueContent> = {
      title,
      comments: []
    };

    // Extract the full page text and parse sections
    const text = $.text();
    
    // Look for Problem/Motivation section
    const problemMatch = text.match(/Problem\/Motivation\s*\n?\s*(.*?)(?=\n\s*\n|\nProposed resolution|\nRemaining tasks|$)/is);
    if (problemMatch) {
      content.problemMotivation = problemMatch[1].trim();
    }

    // Look for Proposed resolution section
    const proposedMatch = text.match(/Proposed resolution\s*\n?\s*(.*?)(?=\n\s*\n|\nRemaining tasks|\nUser interface changes|$)/is);
    if (proposedMatch) {
      content.proposedResolution = proposedMatch[1].trim();
    }

    // Look for Remaining tasks section
    const tasksMatch = text.match(/Remaining tasks\s*\n?\s*(.*?)(?=\n\s*\n|\nUser interface changes|\nAPI changes|$)/is);
    if (tasksMatch) {
      content.remainingTasks = tasksMatch[1].trim();
    }

    // Use the first found content as summary if no specific summary found
    content.summary = content.problemMotivation || content.proposedResolution || 'No summary available';

    content.comments = this.parseComments($);

    return content as IssueContent;
  }

  private parseComments($: cheerio.CheerioAPI): IssueComment[] {
    const comments: IssueComment[] = [];
    
    // Look for comment patterns in the text content
    const text = $.text();
    const commentSections = text.split(/(?=\d+\.\s+\w+\s+(?:ago|\d{1,2}\s+\w+\s+\d{4}))/);
    
    for (let i = 1; i < commentSections.length; i++) {
      const section = commentSections[i];
      
      // Try to extract comment data from text patterns
      const authorMatch = section.match(/^\d+\.\s+(\w+)/);
      const timeMatch = section.match(/(\d{1,2}\s+\w+\s+\d{4}(?:\s+at\s+\d{1,2}:\d{2})?|\d+\s+(?:minutes?|hours?|days?|weeks?|months?|years?)\s+ago)/i);
      
      if (authorMatch) {
        const author = authorMatch[1];
        const timestamp = timeMatch ? timeMatch[1] : '';
        
        // Extract content (everything after the timestamp line)
        const lines = section.split('\n').map(l => l.trim()).filter(l => l);
        let contentStartIndex = 1; // Skip the author line
        
        // Find where actual content starts (after metadata)
        for (let j = 1; j < lines.length; j++) {
          if (!lines[j].match(/^\d+\.\s+\w+/) && 
              !lines[j].match(/\d+\s+(?:minutes?|hours?|days?)\s+ago/i) &&
              !lines[j].match(/Status:\s*/) &&
              lines[j].length > 10) {
            contentStartIndex = j;
            break;
          }
        }
        
        const content = lines.slice(contentStartIndex).join(' ').substring(0, 500);
        
        if (author && content && content.length > 10) {
          comments.push({
            id: `comment-${i}`,
            author,
            timestamp,
            content: content.trim()
          });
        }
      }
    }
    
    return comments;
  }

  async parseIssue(url: string): Promise<ParsedIssue> {
    const $ = await this.fetchPage(url);
    
    
    const metadata = this.parseMetadata($);
    const content = this.parseContent($);
    
    return {
      url,
      metadata,
      content
    };
  }
}