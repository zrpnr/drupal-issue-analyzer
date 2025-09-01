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

    $('.field--name-field-project .field__item a').each((_, el) => {
      metadata.project = $(el).text().trim();
    });

    $('.field--name-field-issue-version .field__item').each((_, el) => {
      metadata.version = $(el).text().trim();
    });

    $('.field--name-field-issue-component .field__item').each((_, el) => {
      metadata.component = $(el).text().trim();
    });

    $('.field--name-field-issue-priority .field__item').each((_, el) => {
      metadata.priority = $(el).text().trim();
    });

    $('.field--name-field-issue-status .field__item').each((_, el) => {
      metadata.status = $(el).text().trim();
    });

    $('time[datetime]').each((_, el) => {
      const label = $(el).prev().text().toLowerCase();
      if (label.includes('created') || label.includes('submitted')) {
        metadata.created = $(el).text().trim();
      } else if (label.includes('updated') || label.includes('changed')) {
        metadata.updated = $(el).text().trim();
      }
    });

    $('.field--name-uid .field__item a').each((_, el) => {
      if (!metadata.reporter) {
        metadata.reporter = $(el).text().trim();
      }
    });

    return metadata as IssueMetadata;
  }

  private parseContent($: cheerio.CheerioAPI): IssueContent {
    const title = $('h1.page-title').text().trim();
    
    const content: Partial<IssueContent> = {
      title,
      comments: []
    };

    $('.field--name-body .field__item').each((_, el) => {
      if (!content.summary) {
        content.summary = $(el).text().trim();
      }
    });

    $('h3').each((_, el) => {
      const heading = $(el).text().toLowerCase();
      const nextContent = $(el).next('.field__item, p, div').text().trim();
      
      if (heading.includes('problem') || heading.includes('motivation')) {
        content.problemMotivation = nextContent;
      } else if (heading.includes('proposed') || heading.includes('resolution')) {
        content.proposedResolution = nextContent;
      } else if (heading.includes('remaining') || heading.includes('tasks')) {
        content.remainingTasks = nextContent;
      } else if (heading.includes('user interface') || heading.includes('ui changes')) {
        content.userInterfaceChanges = nextContent;
      } else if (heading.includes('api changes')) {
        content.apiChanges = nextContent;
      } else if (heading.includes('data model') || heading.includes('database')) {
        content.dataModelChanges = nextContent;
      }
    });

    content.comments = this.parseComments($);

    return content as IssueContent;
  }

  private parseComments($: cheerio.CheerioAPI): IssueComment[] {
    const comments: IssueComment[] = [];

    $('.comment').each((_, el) => {
      const comment: Partial<IssueComment> = {};
      
      comment.id = $(el).attr('id') || '';
      
      const author = $(el).find('.comment__author a').first().text().trim();
      comment.author = author;
      
      const timestamp = $(el).find('time').text().trim();
      comment.timestamp = timestamp;
      
      const content = $(el).find('.comment__content .field--name-comment-body .field__item').text().trim();
      comment.content = content;
      
      const statusChanges = $(el).find('.comment-changes li').map((_, li) => $(li).text().trim()).get();
      if (statusChanges.length > 0) {
        comment.statusChange = statusChanges.join(', ');
      }
      
      if (comment.author && comment.content) {
        comments.push(comment as IssueComment);
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