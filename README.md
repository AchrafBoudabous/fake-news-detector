# 📰 Fake News Detector

A browser extension and API that detects potentially fake or misleading news articles using Natural Language Processing (NLP) and Machine Learning.

---

## 🔍 Features

- Analyzes news articles and text for indicators of misinformation
- Browser extension for Chrome/Firefox that works on any webpage
- API endpoint for integration with other applications
- Uses state-of-the-art NLP models from Hugging Face
- Provides confidence scores and explanations for predictions

---

## 📁 Project Structure

```
fake-news-detector/
├── backend/                # Flask API backend
│   ├── app.py              # Main Flask application
│   ├── requirements.txt    # Python dependencies
│   └── Procfile            # For Heroku deployment
└── extension/              # Browser extension
    ├── manifest.json       # Extension manifest
    ├── background.js       # Background script
    ├── content.js          # Content script
    ├── popup.html          # Popup HTML
    ├── popup.js            # Popup JavaScript
    ├── styles.css          # Styles for popup
    └── icons/              # Extension icons
```

---

## ⚙️ Installation

### Backend Setup

1. Clone the repository:
    ```bash
    git clone https://github.com/AchrafBoudabous/fake-news-detector.git
    cd fake-news-detector
    ```

2. Create and activate a virtual environment:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

3. Install dependencies:
    ```bash
    cd backend
    pip install -r requirements.txt
    ```

 4. Run the Flask application:
    ```bash
    python app.py
    ```
    The API will be available at `http://localhost:5000`.

### Extension Setup

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `extension` folder
4. The extension should now appear in your browser toolbar

---

## 🚀 Usage

### Using the Browser Extension

- **Analyze a webpage**: Navigate to a news article and click the extension icon
- **Analyze selected text**: Highlight text on a webpage to analyze it
- **Manual analysis**: Use the "Analyze Current Page" button in the popup

### Using the API

Send a POST request to `/api/check`:

```bash
curl -X POST http://localhost:5000/api/check \
-H "Content-Type: application/json" \
-d "{\"text\": \"Your news article text here\"}"
```

**API Response Format**:

```json
{
  "is_potentially_fake": true,
  "confidence": 0.92,
  "label": "LABEL_0",
  "text_sample": "Your news article text here..."
}
```

---

## 🧠 Model Information

This project uses the Hugging Face model [`Pulk17/Fake-News-Detection`](https://huggingface.co/Pulk17/Fake-News-Detection), a BERT-based model fine-tuned on fake news datasets.

**Metrics:**
- Accuracy: 99.58%
- Precision: 99.27%
- Recall: 99.88%

---

## 🧪 Testing

Use the provided script to test the API:

```bash
python test_api.py
```

This script allows for both pre-defined and custom input testing.

---

## 🚢 Deployment

### Backend (Heroku)

1. Create a Heroku account and install the Heroku CLI
2. Initialize a Git repository (if not done already)
3. Create a Heroku app:
    ```bash
    heroku create your-app-name
    ```
4. Deploy:
    ```bash
    git push heroku main
    ```

### Extension Publishing

1. Create a ZIP file of the `extension` folder
2. Go to the [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole)
3. Click "New Item" and upload your ZIP

---

## ⚠️ Limitations

- May produce false positives or false negatives
- Analysis is pattern-based and may not detect sophisticated misinformation
- Requires internet connection to call API
- Currently optimized for English-language content

---

## 🔮 Future Enhancements

- Multi-language support
- Fact-checking database integration
- Source credibility scoring
- Explainable AI output
- User feedback for continual improvement

---

## 🙌 Credits

- Built with [Flask](https://flask.palletsprojects.com/)
- NLP Models by [Hugging Face](https://huggingface.co/)