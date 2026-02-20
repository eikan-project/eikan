import json
import csv
import os

def json_to_csv():
    data_folder = 'data/'
    # Find all JSON files in the data folder
    json_files = [f for f in os.listdir(data_folder) if f.endswith('.json')]

    if not json_files:
        print("❌ No JSON files found in the data/ folder.")
        return

    for file_name in json_files:
        json_path = os.path.join(data_folder, file_name)
        csv_path = os.path.join(data_folder, 'csv/', file_name.replace('.json', '.csv'))

        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        if not data:
            continue

        # Use the keys from the first object as headers
        headers = data[0].keys()

        with open(csv_path, 'w', encoding='utf-8-sig', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=headers)
            writer.writeheader()
            writer.writerows(data)
        
        print(f"✅ Converted: {file_name} -> {csv_path}")

if __name__ == "__main__":
    json_to_csv()