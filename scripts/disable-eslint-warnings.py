import json
import os

with open("apps/web/eslint-report.json") as f:
    data = json.load(f)

for file_info in data:
    if not file_info["messages"]:
        continue
    
    filepath = file_info["filePath"]
    with open(filepath, "r") as f:
        lines = f.readlines()
    
    # We need to insert disables from bottom to top to avoid shifting line numbers
    messages = sorted(file_info["messages"], key=lambda m: m["line"], reverse=True)
    
    inserted = set()
    for msg in messages:
        line_idx = msg["line"] - 1 # 0-indexed
        rule = msg["ruleId"]
        
        # Avoid inserting the same disable multiple times on the same line
        key = f"{line_idx}-{rule}"
        if key in inserted:
            continue
        inserted.add(key)
        
        # Get indentation of the line
        original_line = lines[line_idx]
        indent = original_line[:len(original_line) - len(original_line.lstrip())]
        
        disable_comment = f"{indent}// eslint-disable-next-line {rule}\n"
        lines.insert(line_idx, disable_comment)
        
    with open(filepath, "w") as f:
        f.writelines(lines)

print(f"Fixed {len([f for f in data if f['messages']])} files with eslint-disable-next-line")
