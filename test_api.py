import requests
import json

def test_fake_news_api(text):
    """Test the fake news detection API with the provided text."""
    url = "http://localhost:5000/api/check"
    
    payload = {"text": text}
    headers = {"Content-Type": "application/json"}
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        
        if response.status_code == 200:
            result = response.json()
            print("\n=== Analysis Results ===")
            print(f"Text analyzed: '{text[:50]}...'")
            print(f"Is potentially fake: {result['is_potentially_fake']}")
            print(f"Confidence: {result['confidence'] * 100:.2f}%")
            print(f"Label: {result['label']}")
            print("======================\n")
            
            return result
        else:
            print(f"Error: API returned status code {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"Error connecting to API: {e}")
        print("Make sure your Flask app is running at http://localhost:5000")

if __name__ == "__main__":
    fake_news_example = "BREAKING: Scientists discover that COVID-19 was created by aliens to control human population. Secret documents reveal world leaders have known about this for years."
    
    real_news_example = "According to recent data from the World Health Organization, global vaccination efforts have helped reduce COVID-19 cases in many countries. Health officials continue to monitor new variants."
    
    print("Testing with fake news example:")
    test_fake_news_api(fake_news_example)
    
    print("Testing with real news example:")
    test_fake_news_api(real_news_example)
    
    print("\nWant to test your own text? Enter it below (or type 'quit' to exit):")
    while True:
        user_text = input("\nEnter text to analyze: ")
        if user_text.lower() == 'quit':
            break
        
        if len(user_text) < 20:
            print("Text is too short. Please enter at least 20 characters.")
            continue
            
        test_fake_news_api(user_text)