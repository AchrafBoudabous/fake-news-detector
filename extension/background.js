const API_ENDPOINT = 'http://localhost:5000/api/check';
const CONFIDENCE_THRESHOLD = 0.7;
const BADGE_TEXT = '!';
const BADGE_COLOR = '#FF0000';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'checkSelection' || message.action === 'checkArticle') {
    const text = message.selection || message.content;
    analyzeText(text, sender.tab.id);
  }
  
  return true;
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading') {
    resetBadge(tabId);
  }
});

/**
 * Analyze text for fake news detection
 * @param {string} text - The text to analyze
 * @param {number} tabId - The tab ID where the text originated
 */
function analyzeText(text, tabId) {
  if (!text || text.length < 50) {
    console.log('Text too short for analysis');
    return;
  }
  
  chrome.action.setBadgeText({ 
    text: '...', 
    tabId: tabId 
  });
  chrome.action.setBadgeBackgroundColor({ 
    color: '#666666',
    tabId: tabId 
  });
  
  fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text: text })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`API response error: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    handleAnalysisResult(data, tabId);
  })
  .catch(error => {
    console.error('Error checking content:', error);
    resetBadge(tabId);
  });
}

/**
 * Handle the analysis result from the API
 * @param {Object} data - The API response
 * @param {number} tabId - The tab ID where the text originated
 */
function handleAnalysisResult(data, tabId) {
  // Store result for popup to access
  chrome.storage.local.set({ lastResult: data });
  
  if (data.is_potentially_fake && data.confidence > CONFIDENCE_THRESHOLD) {
    chrome.action.setBadgeText({ 
      text: BADGE_TEXT, 
      tabId: tabId 
    });
    chrome.action.setBadgeBackgroundColor({ 
      color: BADGE_COLOR,
      tabId: tabId 
    });
  } else {
    resetBadge(tabId);
  }
}

/**
 * Reset the action badge to default state
 * @param {number} tabId - The tab ID
 */
function resetBadge(tabId) {
  chrome.action.setBadgeText({ 
    text: '',
    tabId: tabId 
  });
}