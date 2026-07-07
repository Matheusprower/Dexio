import urllib.request
import os

logos = {
    "red": "https://archives.bulbagarden.net/media/upload/c/cb/Pok%C3%A9mon_Red_Logo.png",
    "blue": "https://archives.bulbagarden.net/media/upload/1/1a/Pok%C3%A9mon_Blue_Logo.png",
    "yellow": "https://archives.bulbagarden.net/media/upload/8/8c/Pok%C3%A9mon_Yellow_Logo.png",
    "gold": "https://archives.bulbagarden.net/media/upload/a/aa/Pok%C3%A9mon_Gold_Logo.png",
    "silver": "https://archives.bulbagarden.net/media/upload/b/b3/Pok%C3%A9mon_Silver_Logo.png",
    "crystal": "https://archives.bulbagarden.net/media/upload/4/4b/Pok%C3%A9mon_Crystal_Logo.png",
    "ruby": "https://archives.bulbagarden.net/media/upload/7/77/Pok%C3%A9mon_Ruby_Logo.png",
    "sapphire": "https://archives.bulbagarden.net/media/upload/3/30/Pok%C3%A9mon_Sapphire_Logo.png",
    "emerald": "https://archives.bulbagarden.net/media/upload/c/ca/Pok%C3%A9mon_Emerald_Logo.png",
    "firered": "https://archives.bulbagarden.net/media/upload/6/6f/Pok%C3%A9mon_FireRed_Logo.png",
    "leafgreen": "https://archives.bulbagarden.net/media/upload/4/4b/Pok%C3%A9mon_LeafGreen_Logo.png",
    "diamond": "https://archives.bulbagarden.net/media/upload/b/bd/Pok%C3%A9mon_Diamond_Logo.png",
    "pearl": "https://archives.bulbagarden.net/media/upload/0/00/Pok%C3%A9mon_Pearl_Logo.png",
    "platinum": "https://archives.bulbagarden.net/media/upload/6/60/Pok%C3%A9mon_Platinum_Logo.png",
    "heartgold": "https://archives.bulbagarden.net/media/upload/a/a2/Pok%C3%A9mon_HeartGold_Logo.png",
    "soulsilver": "https://archives.bulbagarden.net/media/upload/3/32/Pok%C3%A9mon_SoulSilver_Logo.png",
    "black": "https://archives.bulbagarden.net/media/upload/e/e9/Pok%C3%A9mon_Black_Logo.png",
    "white": "https://archives.bulbagarden.net/media/upload/5/52/Pok%C3%A9mon_White_Logo.png",
    "black2": "https://archives.bulbagarden.net/media/upload/0/01/Pok%C3%A9mon_Black_2_Logo.png",
    "white2": "https://archives.bulbagarden.net/media/upload/c/c5/Pok%C3%A9mon_White_2_Logo.png",
    "x": "https://archives.bulbagarden.net/media/upload/6/6d/Pok%C3%A9mon_X_Logo.png",
    "y": "https://archives.bulbagarden.net/media/upload/f/f6/Pok%C3%A9mon_Y_Logo.png",
    "omegaruby": "https://archives.bulbagarden.net/media/upload/5/50/Pok%C3%A9mon_Omega_Ruby_Logo.png",
    "alphasapphire": "https://archives.bulbagarden.net/media/upload/5/5f/Pok%C3%A9mon_Alpha_Sapphire_Logo.png",
    "sun": "https://archives.bulbagarden.net/media/upload/d/db/Pok%C3%A9mon_Sun_Logo.png",
    "moon": "https://archives.bulbagarden.net/media/upload/7/77/Pok%C3%A9mon_Moon_Logo.png",
    "ultrasun": "https://archives.bulbagarden.net/media/upload/b/b3/Pok%C3%A9mon_Ultra_Sun_Logo.png",
    "ultramoon": "https://archives.bulbagarden.net/media/upload/4/4b/Pok%C3%A9mon_Ultra_Moon_Logo.png",
    "sword": "https://archives.bulbagarden.net/media/upload/9/90/Pok%C3%A9mon_Sword_Logo.png",
    "shield": "https://archives.bulbagarden.net/media/upload/a/ab/Pok%C3%A9mon_Shield_Logo.png",
    "brilliantdiamond": "https://archives.bulbagarden.net/media/upload/1/15/Pok%C3%A9mon_Brilliant_Diamond_Logo.png",
    "shiningpearl": "https://archives.bulbagarden.net/media/upload/a/a2/Pok%C3%A9mon_Shining_Pearl_Logo.png",
    "legendsarceus": "https://archives.bulbagarden.net/media/upload/0/07/Pok%C3%A9mon_Legends_Arceus_Logo.png",
    "scarlet": "https://archives.bulbagarden.net/media/upload/e/e0/Pok%C3%A9mon_Scarlet_Logo.png",
    "violet": "https://archives.bulbagarden.net/media/upload/4/4c/Pok%C3%A9mon_Violet_Logo.png"
}

out_dir = r"c:\Users\vvmat\OneDrive\Desktop\Projetos\Dexio\src\main\resources\static\images\logos"
os.makedirs(out_dir, exist_ok=True)

for name, url in logos.items():
    path = os.path.join(out_dir, f"{name}.png")
    if not os.path.exists(path):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as response, open(path, 'wb') as out_file:
                out_file.write(response.read())
            print(f"Downloaded {name}")
        except Exception as e:
            print(f"Failed {name}: {e}")
