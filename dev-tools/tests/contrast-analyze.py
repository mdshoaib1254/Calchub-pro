import json,glob,re,sys
from PIL import Image
import statistics
def lin(c): c/=255; return c/12.92 if c<=0.03928 else ((c+0.055)/1.055)**2.4
def L(rgb): return .2126*lin(rgb[0])+.7152*lin(rgb[1])+.0722*lin(rgb[2])
bad={}
for jf in sorted(glob.glob('/tmp/cx/*.json')):
    page=jf.split('/')[-1][:-5]
    for c in json.load(open(jf)):
        im=Image.open(c['file']).convert('RGB'); px=list(im.getdata())
        if len(px)>4000: px=px[::len(px)//4000]
        rs=statistics.median(p[0] for p in px); gs=statistics.median(p[1] for p in px); bs=statistics.median(p[2] for p in px)
        m=re.match(r'rgba?\(([^)]+)\)',c['color']); v=[float(x) for x in m.group(1).split(',')]; a=(v[3] if len(v)>3 else 1)*c['op']
        fg=[v[i]*a+[rs,gs,bs][i]*(1-a) for i in range(3)]
        r1,r2=L(fg),L([rs,gs,bs]); ratio=(max(r1,r2)+.05)/(min(r1,r2)+.05)
        large=c['size']>=24 or (c['size']>=18.66 and c['bold']); need=3 if large else 4.5
        if ratio<need and 'skip-link' not in c['tag']: bad.setdefault(page,[]).append((round(ratio,2),need,c['text'],c['tag'],c['size']))
for p,l in bad.items():
    print('\n##',p,len(l),'below threshold')
    seen=set()
    for x in sorted(l)[:14]:
        k=(x[2],x[3]); 
        if k in seen: continue
        seen.add(k); print('  ',x)
