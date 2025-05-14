from flask import Flask, request, jsonify
from transformers import pipeline, AutoModelForSequenceClassification, AutoTokenizer
import os
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

MODEL_NAME = "Pulk17/Fake-News-Detection"
logger.info(f"Loading model: {MODEL_NAME}")

try:
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)
    classifier = pipeline("text-classification", model=model, tokenizer=tokenizer)
    logger.info("Model loaded successfully")
except Exception as e:
    logger.error(f"Error loading model: {e}")
    classifier = None

MAX_TEXT_LENGTH = 512  
CONFIDENCE_THRESHOLD = 0.7 

def analyze_text(text):
    """Analyze text with the fake news detection model"""
    if not classifier:
        return {"error": "Model not loaded"}, 500
        
    if len(text) > MAX_TEXT_LENGTH:
        text = text[:MAX_TEXT_LENGTH]
    
    try:
        result = classifier(text)
        prediction = result[0]
        
        label = prediction['label']
        confidence = prediction['score']
        
        is_fake = label == "FAKE" or label == "LABEL_0"
        
        response = {
            'is_potentially_fake': is_fake,
            'confidence': confidence,
            'label': label,
            'text_sample': text[:100] + '...' if len(text) > 100 else text
        }
        
        return response, 200
    except Exception as e:
        logger.error(f"Error analyzing text: {e}")
        return {"error": str(e)}, 500

@app.route('/api/check', methods=['POST'])
def check_news():
    """API endpoint for checking news content"""
    try:
        data = request.json
        text = data.get('text', '')
        
        if not text or len(text) < 20:
            return jsonify({'error': 'Text is too short. Please provide more content.'}), 400
        
        response, status_code = analyze_text(text)
        return jsonify(response), status_code
    
    except Exception as e:
        logger.error(f"Error in /api/check: {e}")
        return jsonify({'error': 'An error occurred while processing your request'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    if classifier:
        return jsonify({'status': 'healthy', 'model': MODEL_NAME}), 200
    else:
        return jsonify({'status': 'unhealthy', 'error': 'Model not loaded'}), 500

@app.route('/', methods=['GET'])
def home():
    return """
    <html>
    <head><title>Fake News Detector API</title></head>
    <body>
        <h1>Fake News Detector API</h1>
        <p>This API provides fake news detection services.</p>
        <p>To use it, send a POST request to /api/check with JSON payload containing the 'text' to analyze.</p>
    </body>
    </html>
    """

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)