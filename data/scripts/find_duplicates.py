import json
import os

def clean_duplicates():
    data_folder = 'data/'
    json_files = [f for f in os.listdir(data_folder) if f.endswith('.json')]
    
    for file_name in json_files:
        file_path = os.path.join(data_folder, file_name)
        with open(file_path, 'r', encoding='utf-8') as f:
            items = json.load(f)

        seen_jp = set()
        unique_items = []
        duplicates = []

        # First pass: Identify duplicates
        for item in items:
            jp = item.get('jp', '').strip()
            if jp in seen_jp:
                duplicates.append(item)
            else:
                seen_jp.add(jp)
                unique_items.append(item)

        if not duplicates:
            print(f"✅ No duplicates in {file_name}")
            continue

        print(f"\n⚠️ Found {len(duplicates)} duplicates in {file_name}")
        choice = input("Type 'ALL' to delete all duplicates, or 'ONE' to review them one by one: ").strip().upper()

        if choice == 'ALL':
            final_items = unique_items
            print(f"🗑️ Deleted all {len(duplicates)} duplicates.")
        else:
            final_items = unique_items
            to_remove = []
            for item in duplicates:
                confirm = input(f"❓ Delete duplicate: '{item['jp']}'? (y/n): ").lower()
                if confirm != 'y':
                    final_items.append(item) # Keep it if they don't say 'y'
            
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(final_items, f, ensure_ascii=False, indent=2)
        print(f"💾 {file_name} updated.")

if __name__ == "__main__":
    clean_duplicates()