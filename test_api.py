import urllib.request
import json

req = urllib.request.Request('http://localhost:80/api/pokemon/list')
with urllib.request.urlopen(req) as response:
    print("List size:", len(json.loads(response.read().decode('utf-8'))))

data = [{"id": 1, "nome": "bulbasaur"}, {"id": 2, "nome": "ivysaur"}]
req2 = urllib.request.Request('http://localhost:80/api/pokemon/salvarLista', data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req2) as response2:
        print("Save response:", response2.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print("Save error:", e.code, e.reason, e.read().decode('utf-8'))
