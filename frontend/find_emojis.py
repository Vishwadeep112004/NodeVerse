import os
import re

directories = ['/home/vishu/NodeVerse/frontend/htmlFiles', '/home/vishu/NodeVerse/frontend/JsFiles']

def is_emoji(char):
    # Basic check for emoji ranges
    code = ord(char)
    if 0x1F600 <= code <= 0x1F64F: return True
    if 0x1F300 <= code <= 0x1F5FF: return True
    if 0x1F680 <= code <= 0x1F6FF: return True
    if 0x1F700 <= code <= 0x1F77F: return True
    if 0x1F780 <= code <= 0x1F7FF: return True
    if 0x1F800 <= code <= 0x1F8FF: return True
    if 0x1F900 <= code <= 0x1F9FF: return True
    if 0x1FA00 <= code <= 0x1FA6F: return True
    if 0x1FA70 <= code <= 0x1FAFF: return True
    if 0x2600 <= code <= 0x26FF: return True
    if 0x2700 <= code <= 0x27BF: return True
    if 0x25A0 <= code <= 0x25FF: return True # Geometric shapes like ▶
    return False

found = set()
for d in directories:
    for filename in os.listdir(d):
        if filename.endswith('.html') or filename.endswith('.js'):
            with open(os.path.join(d, filename), 'r', encoding='utf-8') as f:
                content = f.read()
                for char in content:
                    if is_emoji(char):
                        found.add(char)

print("Found emojis/symbols:", found)
