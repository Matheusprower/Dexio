import json
import os
import urllib.request
import re

boxes_dir = r'c:\Users\vvmat\OneDrive\Desktop\Projetos\Dexio\src\main\resources\static\images\boxes'
trainers_dir = r'c:\Users\vvmat\OneDrive\Desktop\Projetos\Dexio\src\main\resources\static\images\trainers'
os.makedirs(boxes_dir, exist_ok=True)
os.makedirs(trainers_dir, exist_ok=True)

# Trainers
with open(r'c:\Users\vvmat\OneDrive\Desktop\Projetos\Dexio\src\main\resources\static\trainers.json', 'r', encoding='utf-8') as f:
    trainers = json.load(f)

trainers = [t for t in trainers if isinstance(t, str)]

missing_trainers = []
for t in trainers:
    path = os.path.join(trainers_dir, f'{t}.png')
    if not os.path.exists(path):
        missing_trainers.append(t)

print(f'Missing trainers: {len(missing_trainers)}')

downloaded_t = 0
for t in missing_trainers:
    url = f'https://play.pokemonshowdown.com/sprites/trainers/{t}.png'
    path = os.path.join(trainers_dir, f'{t}.png')
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response, open(path, 'wb') as out_file:
            out_file.write(response.read())
        downloaded_t += 1
    except Exception as e:
        print(f'Failed to download trainer {t}: {e}')

print(f'Successfully downloaded {downloaded_t} trainers.')

# Boxes
with open(r'c:\Users\vvmat\OneDrive\Desktop\Projetos\Dexio\src\main\resources\static\times.js', 'r', encoding='utf-8') as f:
    content = f.read()

match = re.search(r'const gameLogos = ({.*?});', content, re.DOTALL)
if match:
    lines = match.group(1).splitlines()
    boxes = {}
    for line in lines:
        if ':' in line:
            parts = line.split(':', 1)
            k = parts[0].replace('"', '').strip()
            v = parts[1].replace('"', '').replace(',', '').strip()
            if v.startswith('http'):
                boxes[k] = v

    missing_boxes = []
    for k, v in boxes.items():
        filename = v.split('/')[-1]
        path = os.path.join(boxes_dir, filename)
        if not os.path.exists(path):
            missing_boxes.append((k, v, filename))
            
    print(f'Missing boxes: {len(missing_boxes)}')
    
    downloaded_b = 0
    for k, v, filename in missing_boxes:
        path = os.path.join(boxes_dir, filename)
        try:
            req = urllib.request.Request(v, headers={'User-Agent': 'Mozilla/5.0', 'Referer': 'https://img.pokemondb.net/'})
            with urllib.request.urlopen(req) as response, open(path, 'wb') as out_file:
                out_file.write(response.read())
            downloaded_b += 1
        except Exception as e:
            print(f'Failed to download box {k}: {e}')
    
    print(f'Successfully downloaded {downloaded_b} boxes.')
