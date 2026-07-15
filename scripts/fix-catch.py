import json
import re

with open("apps/web/eslint-report.json") as f:
    data = json.load(f)

for file_info in data:
    if not file_info["messages"]:
        continue
    
    filepath = file_info["filePath"]
    with open(filepath, "r") as f:
        lines = f.readlines()
    
    modified = False
    
    for msg in file_info["messages"]:
        rule = msg["ruleId"]
        line_idx = msg["line"] - 1
        
        if rule in ("@typescript-eslint/no-unused-vars", "unused-imports/no-unused-vars"):
            if "'err' is defined but never used" in msg["message"] or "'error' is defined but never used" in msg["message"]:
                original_line = lines[line_idx]
                new_line = re.sub(r'catch\s*\(\s*(err|error)\s*(:\s*(any|unknown))?\s*\)', 'catch', original_line)
                
                if new_line != original_line:
                    lines[line_idx] = new_line
                    modified = True
                    
    if modified:
        with open(filepath, "w") as f:
            f.writelines(lines)
            
print("Done fixing catch(err)")
