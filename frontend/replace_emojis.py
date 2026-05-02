import os
import re

directories = ['/home/vishu/NodeVerse/frontend/htmlFiles', '/home/vishu/NodeVerse/frontend/JsFiles']

replacements = {
    '▶ Play': 'Play',
    '⏸ Pause': 'Pause',
    '▶ Run Code': 'Run Code',
    '☁ Submit Code': 'Submit Code',
    '▶': 'Next',
    '◀': 'Prev',
    '☰': 'Menu',
    '🕸️': 'Graph',
    '🧠': 'Theory',
    '🔧': 'Tools',
    '🔍': 'Search',
    '🔄': 'Cycles',
    '📐': 'Sort',
    '🌀': 'SCC',
    '🗺️': 'Path',
    '🌲': 'Tree',
    '⚡': '',
    '✅': 'Success',
    '❌': 'Error',
    '⚠': 'Warning',
    '☁': '',
    '🕸': 'Graph',
    '🗺': 'Path',
}

def remove_remaining_emojis(text):
    # Regex to catch typical emoji ranges
    emoji_pattern = re.compile(
        "["
        u"\U0001F600-\U0001F64F"  # emoticons
        u"\U0001F300-\U0001F5FF"  # symbols & pictographs
        u"\U0001F680-\U0001F6FF"  # transport & map symbols
        u"\U0001F700-\U0001F77F"  # alchemical symbols
        u"\U0001F780-\U0001F7FF"  # Geometric Shapes Extended
        u"\U0001F800-\U0001F8FF"  # Supplemental Arrows-C
        u"\U0001F900-\U0001F9FF"  # Supplemental Symbols and Pictographs
        u"\U0001FA00-\U0001FA6F"  # Chess Symbols
        u"\U0001FA70-\U0001FAFF"  # Symbols and Pictographs Extended-A
        u"\u2600-\u26FF"          # Miscellaneous Symbols
        u"\u2700-\u27BF"          # Dingbats
        u"\u25A0-\u25FF"          # Geometric Shapes
        "]+", flags=re.UNICODE)
    return emoji_pattern.sub(r'', text)

for d in directories:
    for filename in os.listdir(d):
        if filename.endswith('.html') or filename.endswith('.js'):
            filepath = os.path.join(d, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Specific replacements first
            for old, new in replacements.items():
                content = content.replace(old, new)
            
            # Remove any left-over emojis
            content = remove_remaining_emojis(content)
            
            # Cleanup double spaces or weird spacing that might have occurred
            # but ONLY if they look like button texts, to avoid messing up code formatting
            content = content.replace('<span>  ', '<span>')
            content = content.replace('<span> ', '<span>')
            content = content.replace('  Launch', 'Launch')
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)

print("Emoji replacement complete")
