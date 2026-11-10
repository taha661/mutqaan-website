import json,os,shutil,re
D=os.path.dirname(os.path.abspath(__file__));S=D;V=os.path.dirname(D)
css=open(S+'/style.css').read();content=open(S+'/content.json').read()
js='\n'.join(open(S+'/'+f).read() for f in ['workflow.js','app-core.js','app-viewer.js','app-studio.js','app-admin.js'])+'\nboot();'
eng=open(S+'/engine.js').read()
seed=json.dumps(json.loads(content),ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')
head=f'''<title>Mutqaan Engineering &amp; Construction</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="description" content="Design, build and visualise: complete construction, interior design, renovation, drawings, estimation, consultancy, photorealistic renders and 3D walkthroughs.">
<meta property="og:title" content="Mutqaan Engineering &amp; Construction"><meta property="og:description" content="Design · Build · Deliver. Construction, interiors, renovation, drawings, estimation, consultancy and 3D visualisation."><meta property="og:image" content="media/hero.jpg"><meta name="theme-color" content="#0E1B33">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300..500;1,6..72,300..500&family=Instrument+Sans:wght@400;500;600&display=swap">
<style>{css}</style>
'''
body=f'''<div id="root"></div>
<script type="application/json" id="cms-seed">{seed}</script>
<script>{eng}</script>
<script>{js}</script>'''
art=head+body
# standalone (Vercel/static) index.html
ld=json.dumps({"@context":"https://schema.org","@type":"GeneralContractor","name":"Mutqaan Engineering & Construction","slogan":"Design · Build · Deliver","telephone":"+923700952198","email":"mutqaan@gmail.com","logo":"/media/logo.jpg","image":"/media/hero.jpg"})
std='<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'+head+f'<link rel="icon" href="media/logo-96.jpg"><script type="application/ld+json">{ld}</script>\n</head><body>\n'+body+'\n</body></html>\n'
os.makedirs(V+'/public',exist_ok=True)
open(V+'/public/index.html','w').write(std);open(V+'/public/content.json','w').write(content)
shutil.copy(S+'/workflow.js',V+'/lib/workflow.js')
print('built public/index.html',len(std))
