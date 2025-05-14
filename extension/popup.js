document.addEventListener('DOMContentLoaded', function() {
  const resultsDiv = document.getElementById('results');
  const resultIndicator = document.getElementById('result-indicator');
  const resultTitle = document.getElementById('result-title');
  const resultMessage = document.getElementById('result-message');
  const confidenceLevel = document.getElementById('confidence-level');
  const confidencePercentage = document.getElementById('confidence-percentage');
  const loadingDiv = document.getElementById('loading');
  const noContentDiv = document.getElementById('no-content');
  const analyzeButton = document.getElementById('analyze-page');
  
  chrome.storage.local.get(['lastResult'], function(data) {
    if (data.lastResult) {
      displayResults(data.lastResult);
    } else {
      noContentDiv.classList.remove('hidden');
    }
  });
  
  analyzeButton.addEventListener('click', function() {
    noContentDiv.classList.add('hidden');
    loadingDiv.classList.remove('hidden');
    
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs && tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {action: 'analyzePage'}, function(response) {
          loadingDiv.classList.add('hidden');
          
          if (response && response.success) {
            setTimeout(checkForResults, 500);
          } else {
            noContentDiv.classList.remove('hidden');
            const errorMessage = response && response.error ? response.error : 
              "Couldn't extract content from this page. Try highlighting specific text instead.";
            
            document.querySelector('#no-content p').textContent = errorMessage;
          }
        });
      } else {
        loadingDiv.classList.add('hidden');
        noContentDiv.classList.remove('hidden');
      }
    });
  });
  
  function checkForResults() {
    chrome.storage.local.get(['lastResult'], function(data) {
      if (data.lastResult) {
        displayResults(data.lastResult);
      } else {
        loadingDiv.classList.add('hidden');
        noContentDiv.classList.remove('hidden');
        document.querySelector('#no-content p').textContent = 
          "Analysis is taking longer than expected. Please try again.";
      }
    });
  }
  
  /**
   * Display analysis results in the popup
   * @param {Object} result - The analysis result
   */
  function displayResults(result) {
    resultsDiv.classList.remove('hidden');
    noContentDiv.classList.add('hidden');
    loadingDiv.classList.add('hidden');
    
    const confidence = result.confidence * 100;
    confidenceLevel.style.width = `${confidence}%`;
    confidencePercentage.textContent = `${confidence.toFixed(1)}%`;
    
    if (result.is_potentially_fake) {
      resultIndicator.className = 'indicator red';
      resultTitle.textContent = 'Potentially Misleading';
      resultMessage.textContent = 'This content contains characteristics common in misleading or false information. Please verify with trusted sources.';
    } else {
      resultIndicator.className = 'indicator green';
      resultTitle.textContent = 'Likely Reliable';
      resultMessage.textContent = 'No significant indicators of misinformation detected in this content.';
    }
  }
});