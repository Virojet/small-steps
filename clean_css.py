import re

def process_file(filepath, replacements):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    count = 0
    for pattern, repl in replacements:
        new_content, n = re.subn(pattern, repl, content, flags=re.MULTILINE | re.DOTALL)
        if n > 0:
            content = new_content
            count += n

    # also remove any empty CSS blocks that might be left over if we stripped all their rules
    # but let's be careful not to remove things like `button:hover { }` if we just emptied it, wait, maybe just leave them empty.
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
    return count

design_css_replacements = [
    # 1. --bg-gradient -> var(--bg)
    (r'(--bg-gradient:\s*)radial-gradient[^;]+;', r'\1var(--bg);'),
    # 2. --accent-glow -> transparent
    (r'(--accent-glow:\s*)rgba[^;]+;', r'\1transparent;'),
    # 3. --shadow-glow -> none
    (r'(--shadow-glow:\s*)[^;]+;', r'\1none;'),
    # 4. grid-template-columns width changes
    (r'(grid-template-columns:\s*)236px', r'\1 220px'),
    (r'(grid-template-columns:\s*)256px', r'\1 240px'),
    # 5. button:hover brightness
    (r'(button:hover\s*{[^}]*?)filter:\s*brightness\([^)]+\);', r'\1'),
    # button:active transform
    (r'(button:active\s*{[^}]*?)transform:\s*[^;]+;', r'\1'),
    # 6. .primary hover translateY and glow shadow
    (r'(\.primary\s*{[^}]*?)box-shadow:\s*[^;]+var\(--accent-glow\)[^;]*;', r'\1'),
    (r'(\.primary:hover\s*{[^}]*?)box-shadow:\s*[^;]+var\(--accent-glow\)[^;]*;', r'\1'),
    (r'(\.primary:hover\s*{[^}]*?)transform:\s*translateY[^;]+;', r'\1'),
    # 7. .secondary hover translateY
    (r'(\.secondary:hover\s*{[^}]*?)transform:\s*translateY[^;]+;', r'\1'),
    # 8. workspace hover glow shadow
    (r'(\.workspace:hover\s*{[^}]*?)box-shadow:\s*[^;]+var\(--accent-glow\)[^;]*;', r'\1'),
    # 9. workspace-avatar gradient
    (r'(\.workspace-avatar\s*{[^}]*?background:\s*)linear-gradient[^;]+;', r'\1var(--accent);'),
    # 10. search-command hover glow
    (r'(\.search-command:hover\s*{[^}]*?)box-shadow:\s*[^;]+var\(--accent-glow\)[^;]*;', r'\1'),
    # 11. nav hover translateX
    (r'(\.nav:hover\s*{[^}]*?)transform:\s*translateX[^;]+;', r'\1'),
    # nav hover svg scale
    (r'\.nav:hover\s*svg\s*{[^}]*?transform:\s*scale[^}]*?}', r''),
    # 12. nav.active box-shadow
    (r'(\.nav\.active\s*{[^}]*?)box-shadow:\s*var\(--shadow-sm\)[^;]*;', r'\1'),
    # 13. local dot glow and pulseDot animation
    (r'(\.local\s*>\s*span:first-child\s*{[^}]*?)box-shadow:\s*[^;]+;', r'\1'),
    (r'(\.local\s*>\s*span:first-child\s*{[^}]*?)animation:\s*pulseDot[^;]+;', r'\1'),
    # 14. saved-status dot glow
    (r'(\.saved-status\s*i\s*{[^}]*?)box-shadow:\s*[^;]+;', r'\1'),
    # 15. theme-toggle hover glow
    (r'(\.theme-toggle:hover\s*{[^}]*?)box-shadow:\s*[^;]+var\(--accent-glow\)[^;]*;', r'\1'),
    # theme-toggle hover svg rotation
    (r'\.theme-toggle:hover\s*svg\s*{[^}]*?transform:\s*[^}]+}', r''),
    # 16. #content padding
    (r'(#content\s*{[^}]*?padding:\s*)32px\s+36px\s+30px;', r'\1 28px 32px 26px;'),
    # 17. h1 size
    (r'(h1\s*{[^}]*?font-size:\s*)32px;', r'\1 26px;'),
    # 18. identity radial gradient
    (r'(\.identity\s*{[^}]*?background:\s*)radial-gradient[^;]+;', r'\1var(--card-bg);'),
    # 19. identity hover shadow-glow
    (r'(\.identity:hover\s*{[^}]*?)box-shadow:\s*var\(--shadow-glow\)[^;]*;', r'\1'),
    
    # 20. momentum ring glow effects
    (r'(box-shadow:\s*)[^;]*accent-glow[^;]*;', r''), 
    # (Using a broader sweep for glow in box shadows later)
    # Actually, the prompt says "Remove all box-shadow with 'glow' in the value".
    # And "Remove all filter: drop-shadow with accent-glow"
    
    # Let's add broad sweeps for all remaining glowing/shadow-glow items and transforms
    # 21. stat hover translateY and shadow-md
    (r'(\.stat:hover\s*{[^}]*?)transform:\s*translateY[^;]+;', r'\1'),
    (r'(\.stat:hover\s*{[^}]*?)box-shadow:\s*var\(--shadow-md\)[^;]*;', r'\1'),
    # 22. day.selected glow, day.has-wins dot glow
    # will be caught by generic box-shadow removal
    
    # 24. habit hover shadow-md
    (r'(\.habit:hover\s*{[^}]*?)box-shadow:\s*var\(--shadow-md\)[^;]*;', r'\1'),
    
    # #send hover scale(1.12)
    (r'(#send:hover\s*{[^}]*?)transform:\s*scale[^;]+;', r'\1'),
    
    # .sidebar-note gradient -> flat var(--card-bg)
    (r'(\.sidebar-note\s*{[^}]*?background:\s*)linear-gradient[^;]+;', r'\1var(--card-bg);'),
    
    # .momentum-card gradient -> flat var(--card-bg)
    (r'(\.momentum-card\s*{[^}]*?background:\s*)linear-gradient[^;]+;', r'\1var(--card-bg);'),
    
    # .coach-orbit animation -> remove
    (r'(\.coach-orbit\s*{[^}]*?)animation:\s*[^;]+;', r'\1'),
    
    # .brand:hover translateX(2px) -> set transform: none
    (r'(\.brand:hover\s*{[^}]*?transform:\s*)translateX\([^)]+\);', r'\1none;'),
    
    # .habit:hover .habit-emoji scale/tilt -> remove
    (r'\.habit:hover\s*\.habit-emoji\s*{[^}]*?transform:\s*[^}]+}', r''),
    
    # .day:hover translateY(-2px)
    (r'(\.day:hover\s*{[^}]*?)transform:\s*translateY[^;]+;', r'\1'),
    
    # Remove all box-shadow with 'glow' in the value
    (r'box-shadow:\s*[^;]*glow[^;]*;', r''),
    # Remove all filter: drop-shadow with accent-glow
    (r'filter:\s*drop-shadow\([^)]*accent-glow[^)]*\);', r''),
    # Remove all hover float animations (translateY(-1px), translateY(-2px))
    (r'transform:\s*translateY\(-[12](\.5)?px\);', r''),
]

experience_css_replacements = [
    # 1. Remove bar-fill hover glow shadow
    (r'box-shadow:\s*[^;]*glow[^;]*;', r''),
    
    # 2. heat-legend full indicator glow
    # Caught by above box-shadow rule usually, but let's make sure
    
    # 3. chart-day hover translateY
    (r'(\.chart-day:hover\s*{[^}]*?)transform:\s*translateY[^;]+;', r'\1'),
    
    # 4. mood.selected scale and glow
    (r'(\.mood\.selected\s*{[^}]*?)transform:\s*scale[^;]+;', r'\1'),
    # glow caught by box-shadow rule
    
    # 5. focus-ring drop-shadow filter
    (r'filter:\s*drop-shadow\([^)]*accent-glow[^)]*\);', r''),
    
    # 6. focus-dock glow shadow
    # caught by box-shadow rule
    
    # 7. Reduce confetti from 14 particles to 8 (remove the last 6 .celebration i:nth-child() rules)
    # The rule looks like .celebration i:nth-child(9) { ... }
    (r'\.celebration\s*i:nth-child\((?:9|10|11|12|13|14)\)\s*{[^}]*}', r''),
]

import sys
file1 = r"c:\Users\ltgre\OneDrive\Desktop\Workspace\Habit tracker\design.css"
file2 = r"c:\Users\ltgre\OneDrive\Desktop\Workspace\Habit tracker\experience.css"

c1 = process_file(file1, design_css_replacements)
c2 = process_file(file2, experience_css_replacements)

print(f"design.css changes: {c1}")
print(f"experience.css changes: {c2}")

