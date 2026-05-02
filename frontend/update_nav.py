import os
import re

html_dir = '/home/vishu/NodeVerse/frontend/htmlFiles'

for filename in os.listdir(html_dir):
    if not filename.endswith('.html'):
        continue
    
    filepath = os.path.join(html_dir, filename)
    with open(filepath, 'r') as f:
        lines = f.readlines()
    
    new_lines = []
    for line in lines:
        # 1. Remove IDE link
        if 'href="./ide.html"' in line and '>IDE<' in line:
            continue
        
        # 2. In dashboard.html, replace Logout with Dashboard
        if filename == 'dashboard.html':
            if 'id="logoutBtnNav"' in line and '>Logout<' in line:
                line = line.replace('<a href="#" id="logoutBtnNav" class="active-nav">Logout</a>', '<a href="./dashboard.html" class="active-nav">Dashboard</a>')
        
        new_lines.append(line)
        
    with open(filepath, 'w') as f:
        f.writelines(new_lines)

print("Update complete")
