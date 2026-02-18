import json
import time
import os
import google.generativeai as genai

# Get the key from the environment variable
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("❌ Error: GEMINI_API_KEY not found in environment variables.")
    exit()

genai.configure(api_key=api_key)

def get_smart_keywords(jp, en):
    prompt = f"""
    You are an expert in Japanese SEO and hospitality.
    Provide 8-10 search keywords for this phrase:
    JP: "{jp}"
    EN: "{en}"
    
    Requirements:
    - Include Hiragana, Katakana, and Kanji variations.
    - Include 2-3 related synonyms (e.g., if 'sushi', include 'fish, seafood, washoku').
    - Return ONLY a comma-separated list of words.
    """
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Error processing {jp}: {e}")
        return ""

data_folder = 'data/'
# Get all json files except index or data.json if you have them
json_files = [f for f in os.listdir(data_folder) if f.endswith('.json')]

for file_name in json_files:
    target_path = os.path.join(data_folder, file_name)
    print(f"--- Processing: {file_name} ---")
    
    with open(target_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    for i, item in enumerate(data):
        # 1. Add 'verified' field if missing
        if "verified" not in item:
            item["verified"] = False
            
        # 2. Process Keywords
        if "keywords" not in item or not item["keywords"]:
            print(f"[{i+1}/{len(data)}] Generating keywords for: {item['jp']}")
            item['keywords'] = get_smart_keywords(item['jp'], item['en'])
            time.sleep(2) # Rate limit protection

    # Save the updated file
    with open(target_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

# 3. Process Loop
print(f"Starting AI keyword generation for {len(data)} items...")

for i, item in enumerate(data):
    # Only process items that don't have keywords yet
    if "keywords" not in item or not item["keywords"]:
        print(f"[{i+1}/{len(data)}] Processing: {item['jp']}")
        item['keywords'] = get_smart_keywords(item['jp'], item['en'])
        
        # Pause to stay within free-tier rate limits
        time.sleep(2) 

        # Auto-save every 10 items
        if i % 10 == 0:
            with open(target_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=4)

# 4. Final Save
with open(target_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=4)

print("✨ Success! Your JSON is now smart.")