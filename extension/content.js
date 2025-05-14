const MIN_SELECTION_LENGTH = 20;
const MIN_ARTICLE_LENGTH = 100;
const ARTICLE_SELECTORS = [
  'article',
  '.article-content',
  '.entry-content',
  '.post-content',
  '[itemprop="articleBody"]',
  '.news-article',
  '.story-body',
  '.story-content',
  '#article-body'
];

document.addEventListener('mouseup', function() {
  const selection = window.getSelection().toString().trim();
  if (selection.length > MIN_SELECTION_LENGTH) {
    chrome.runtime.sendMessage({
      action: 'checkSelection',
      selection: selection
    });
  }
});

window.addEventListener('load', scanPageContent);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'analyzePage') {
    const content = extractMainContent();
    if (content && content.length > MIN_ARTICLE_LENGTH) {
      chrome.runtime.sendMessage({
        action: 'checkArticle',
        content: content
      });
      sendResponse({ success: true });
    } else {
      sendResponse({ 
        success: false, 
        error: "Couldn't extract sufficient content from this page." 
      });
    }
  }
  return true;
});

/**
 * Extract the main content from the current webpage
 * @returns {string} The extracted text
 */
function extractMainContent() {
  let mainContent = null;
  
  for (const selector of ARTICLE_SELECTORS) {
    const element = document.querySelector(selector);
    if (element) {
      mainContent = element;
      break;
    }
  }
  
  if (mainContent) {
    return mainContent.textContent.trim();
  }
  
  const paragraphs = document.querySelectorAll('p');
  const contentParagraphs = [];
  
  paragraphs.forEach(p => {
    const text = p.textContent.trim();
    const parentClasses = p.parentElement ? p.parentElement.className.toLowerCase() : '';
    
    const isLikelyContent = 
      text.length > 50 &&
      !parentClasses.includes('nav') &&
      !parentClasses.includes('menu') &&
      !parentClasses.includes('sidebar') &&
      !parentClasses.includes('footer') &&
      !parentClasses.includes('comment');
      
    if (isLikelyContent) {
      contentParagraphs.push(text);
    }
  });
  
  return contentParagraphs.join(' ');
}

function scanPageContent() {
  if (isLikelyNewsArticle()) {
    const content = extractMainContent();
    if (content && content.length > MIN_ARTICLE_LENGTH) {
      chrome.runtime.sendMessage({
        action: 'checkArticle',
        content: content
      });
    }
  }
}

/**
 * Check if the current page is likely a news article
 * @returns {boolean} Whether the page appears to be a news article
 */
function isLikelyNewsArticle() {
  const url = window.location.href.toLowerCase();
  const newsPatterns = ['/news/', '/article/', '/story/', 'news.', '.article', '/politics/'];
  const hasNewsPattern = newsPatterns.some(pattern => url.includes(pattern));
  
  const ogType = document.querySelector('meta[property="og:type"]');
  const isArticleType = ogType && ogType.content === 'article';
  
  const hasArticleElement = document.querySelector('article') !== null;
  
  const title = document.title;
  const hasLongTitle = title && title.length > 30;
  
  let score = 0;
  if (hasNewsPattern) score++;
  if (isArticleType) score++;
  if (hasArticleElement) score++;
  if (hasLongTitle) score++;
  
  return score >= 2;
}