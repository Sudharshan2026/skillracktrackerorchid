import requests

payload = { 'api_key': '9df7b00be01b37367cf4de2f69e546c8', 'url': 'https://www.skillrack.com/faces/resume.xhtml?id=440943&key=bf966a469d73bfb792f4d2a72a4762937ba3fc48' }
r = requests.get('https://api.scraperapi.com/', params=payload)
print(r.text)
