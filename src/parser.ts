import axios from 'axios';
import * as cheerio from 'cheerio';
import { IssueMetadata, IssueContent, IssueComment, ParsedIssue } from './types.js';

export class DrupalIssueParser {
  private async fetchPage(url: string): Promise<cheerio.CheerioAPI> {
    try {
      const response = await axios.get(url, {
        timeout: 60000, // 60 seconds for mega-issues
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
    
    // Use the working .comment selector
    $('.comment').each((index, element) => {
      const $comment = $(element);
      
      // Extract comment ID
      const id = $comment.attr('id') || `comment-${index}`;
      
      // Extract author - look for the username in the comment text
      let author = '';
      const commentText = $comment.text();
      
      // Try to extract from "Comment #X username date" pattern
      const authorMatch = commentText.match(/Comment #\d+\s+([^\s]+)/);
      if (authorMatch) {
        author = authorMatch[1];
      }
      
      // Fallback to DOM selectors
      if (!author) {
        const authorSelectors = [
          '.username a',
          '.field--name-name a', 
          '.comment__author a',
          'a[href*="/user/"]'
        ];
        
        for (const selector of authorSelectors) {
          const authorElement = $comment.find(selector).first();
          if (authorElement.length) {
            author = authorElement.text().trim();
            break;
          }
        }
      }
      
      // Extract timestamp from comment text pattern
      let timestamp = '';
      const timestampMatch = commentText.match(/(\d{1,2}\s+\w+\s+\d{4}\s+at\s+\d{1,2}:\d{2})/);
      if (timestampMatch) {
        timestamp = timestampMatch[1];
      }
      
      // Fallback to DOM selectors
      if (!timestamp) {
        const timeSelectors = [
          'time',
          '.comment__time',
          '.field--name-created',
          '[datetime]'
        ];
        
        for (const selector of timeSelectors) {
          const timeElement = $comment.find(selector).first();
          if (timeElement.length) {
            timestamp = timeElement.text().trim();
            break;
          }
        }
      }
      
      // Extract comment content - try multiple selectors
      let content = '';
      const contentSelectors = [
        '.field--name-comment-body .field__item',
        '.comment__content',
        '.comment-body',
        '.field--name-body .field__item'
      ];
      
      for (const selector of contentSelectors) {
        const contentElement = $comment.find(selector).first();
        if (contentElement.length) {
          content = contentElement.text().trim();
          break;
        }
      }
      
      // If no structured content found, extract from comment text
      if (!content) {
        // Split the comment into lines and process them
        const lines = commentText.split('\n').map(l => l.trim()).filter(l => l);
        let contentLines: string[] = [];
        let inStatusBlock = false;
        
        for (const line of lines) {
          // Skip obvious metadata lines
          if (line.match(/^Comment #\d+\s+\w+/) ||
              line.match(/CreditAttribution/) ||
              line.match(/Log in or register/) ||
              line.length < 10) {
            continue;
          }
          
          // Handle status change blocks
          if (line.match(/Status:\s*/)) {
            inStatusBlock = true;
            continue;
          }
          
          // Skip lines that are part of status change block metadata
          if (inStatusBlock && (
              line.match(/^\s*$/) ||
              line.match(/^\s+$/) ||
              line.length < 20
            )) {
            continue;
          }
          
          // End of status block, start collecting content
          if (inStatusBlock && line.length > 20) {
            inStatusBlock = false;
          }
          
          // Collect actual content lines
          if (!inStatusBlock && line.length > 15) {
            contentLines.push(line);
            
            // Stop after reasonable amount of content
            if (contentLines.join(' ').length > 400) break;
          }
        }
        
        content = contentLines.join(' ').substring(0, 500);
      }
      
      // Extract status changes if present (extract only the status transition, not content after)
      let statusChange = '';
      const statusMatch = commentText.match(/Status:\s*([^»\n]*»[^»\n]*?)(?:\s*\n|\s*$)/);
      if (statusMatch) {
        statusChange = statusMatch[1]
          .replace(/[»]/g, '→')
          .replace(/\s+/g, ' ')
          .trim();
      }
      
      // Only add comment if we have basic info
      if (author || content.length > 10) {
        comments.push({
          id,
          author: author || 'Unknown',
          timestamp: timestamp || '',
          content: content || 'No content extracted',
          statusChange: statusChange || undefined
        });
      }
    });
    
    
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