import math,sys
INK='#14243a'
def mix(a,b,t):
    a=[int(a[i:i+2],16) for i in (1,3,5)];b=[int(b[i:i+2],16) for i in (1,3,5)]
    return '#%02x%02x%02x'%tuple(round(a[i]*(1-t)+b[i]*t) for i in range(3))
CX,CY,SX,SY,SZ=330,200,27,15.6,27
def P(x,y,z=0): return (CX+(x-y)*SX, CY+(x+y)*SY - z*SZ)
def pts(l): return ' '.join('%.1f,%.1f'%P(*q) for q in l)
ops=[]  # (depth, svg)
def add(d,s): ops.append((d,s))
def poly(l,fill,sw=2.2,extra=''):
    return '<polygon points="%s" fill="%s" stroke="%s" stroke-width="%s" stroke-linejoin="round" %s/>'%(pts(l),fill,INK,sw,extra)
def box(x,y,w,d,h,base,z0=0,depth=None,sw=2.2,top=None):
    z1=z0+h
    t=top or mix(base,'#ffffff',.45); l=base; r=mix(base,INK,.28)
    s=poly([(x,y+d,z0),(x+w,y+d,z0),(x+w,y+d,z1),(x,y+d,z1)],l,sw)
    s+=poly([(x+w,y,z0),(x+w,y+d,z0),(x+w,y+d,z1),(x+w,y,z1)],r,sw)
    s+=poly([(x,y,z1),(x+w,y,z1),(x+w,y+d,z1),(x,y+d,z1)],t,sw)
    add(depth if depth is not None else x+y+w+d+z0*0.01,s)
def win(face,x,y,w,d,u,z,wu=.28,wz=.32,col='#bfe3f2'):
    if face=='L': q=[(x+u,y+d,z),(x+u+wu,y+d,z),(x+u+wu,y+d,z+wz),(x+u,y+d,z+wz)]
    else: q=[(x+w,y+u,z),(x+w,y+u+wu,z),(x+w,y+u+wu,z+wz),(x+w,y+u,z+wz)]
    return poly(q,col,1.2)
def wins(x,y,w,d,h,z0=0,cols=3,rows=2,col='#cfeaf5',face='both'):
    s=''
    for fc,span in (('L',w),('R',d)):
        if face!='both' and face!=fc: continue
        for i in range(cols if fc=='L' else max(1,cols-1)):
            for j in range(rows):
                u=.25+i*((span-.5)/max(1,(cols if fc=='L' else cols-1)))
                z=z0+.3+j*((h-.5)/rows)
                if u+.28<span-.1: s+=win(fc,x,y,w,d,u,z,col=col)
    return s
def tree(x,y,z=0,r=15,c='#3f8a6a'):
    X,Y=P(x,y,z)
    s='<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="%s" stroke-width="3.5" stroke-linecap="round"/>'%(X,Y,X,Y-r*.9,INK)
    s+='<circle cx="%.1f" cy="%.1f" r="%d" fill="%s" stroke="%s" stroke-width="2.2"/>'%(X,Y-r*1.4,r,c,INK)
    s+='<path d="M%.1f %.1f a%d %d 0 0 1 %d %d" fill="none" stroke="%s" stroke-width="3" stroke-linecap="round" opacity=".7"/>'%(X-r*.6,Y-r*1.7,r*.7,r*.7,r*.9,-r*.1,mix(c,'#ffffff',.55))
    add(x+y+.5+z*.01,s)
def panels(x,y,w,d,z,col='#1f3b6e',n=3,dep=None):
    s=poly([(x,y,z+.08),(x+w,y,z+.08),(x+w,y+d,z+.55),(x,y+d,z+.55)],col,1.8)
    for i in range(1,n):
        a=x+w*i/n
        s+='<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="#8fb4e8" stroke-width="1.2"/>'%(*P(a,y,z+.08),*P(a,y+d,z+.55))
    s+='<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="#8fb4e8" stroke-width="1.2"/>'%(*P(x,y+d/2,z+.315),*P(x+w,y+d/2,z+.315))
    add(dep if dep is not None else x+y+w+d+z*.01+.2,s)
def greenroof(x,y,w,d,z,n=7,dep=None):
    g='#62a57f'
    s=poly([(x,y,z),(x+w,y,z),(x+w,y+d,z),(x,y+d,z)],mix(g,'#ffffff',.1),2)
    import random;random.seed(int(x*7+y*3))
    for _ in range(n):
        a=x+.15+random.random()*(w-.3);b=y+.15+random.random()*(d-.3)
        X,Y=P(a,b,z);c=random.choice(['#3f8a6a','#4f9f78','#8cc084','#e8a838'])
        s+='<circle cx="%.1f" cy="%.1f" r="%d" fill="%s" stroke="%s" stroke-width="1.6"/>'%(X,Y-3,random.choice([5,6,7]),c,INK)
    add(dep if dep is not None else x+y+w+d+z*.01+.3,s)
def turbine(x,y,h=4.2,rot=0):
    X0,Y0=P(x,y,0);X1,Y1=P(x,y,h)
    s='<path d="M%.1f %.1f L%.1f %.1f L%.1f %.1f L%.1f %.1f Z" fill="#f4f7fa" stroke="%s" stroke-width="2"/>'%(X0-5,Y0,X0+5,Y0,X1+2,Y1,X1-2,Y1,INK)
    for k in range(3):
        a=math.radians(rot+k*120);L=46
        ex,ey=X1+L*math.cos(a),Y1+L*math.sin(a)
        nx,ny=-math.sin(a)*5,math.cos(a)*5
        s+='<path d="M%.1f %.1f L%.1f %.1f L%.1f %.1f Z" fill="#fafcfe" stroke="%s" stroke-width="1.8" stroke-linejoin="round"/>'%(X1+nx*.4,Y1+ny*.4,ex,ey,X1-nx*.4,Y1-ny*.4,INK)
    s+='<circle cx="%.1f" cy="%.1f" r="5" fill="#e8a838" stroke="%s" stroke-width="2"/>'%(X1,Y1,INK)
    add(x+y+1.2,s)
def flat(l,fill,sw=2,depth=-5): add(depth,poly(l,fill,sw))
def build():
    ops.clear()
    W,D=11,8
    # hills backdrop
    add(-100,'<path d="M0 250 C90 150 160 190 230 215 C300 130 360 150 430 200 C520 120 600 150 760 230 L760 520 L0 520Z" fill="#b9d6c9" stroke="%s" stroke-width="2.2" opacity=".95"/>'%INK)
    add(-99,'<path d="M0 275 C120 215 220 250 330 262 C450 205 560 240 760 270 L760 520 L0 520Z" fill="#8fc0a5" stroke="%s" stroke-width="2.2"/>'%INK)
    # sky bits
    add(-110,'<circle cx="640" cy="70" r="34" fill="#ffcb57" stroke="%s" stroke-width="2.4"/>'%INK+''.join('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="%s" stroke-width="2.4" stroke-linecap="round"/>'%(640+math.cos(a)*44,70+math.sin(a)*44,640+math.cos(a)*56,70+math.sin(a)*56,INK) for a in [i*math.pi/6 for i in range(12)]))
    for cx,cy,s in ((140,60,1),(470,40,.8)):
        add(-110,'<g fill="#fafcfe" stroke="%s" stroke-width="2.2" transform="translate(%d %d) scale(%s)"><ellipse cx="0" cy="0" rx="46" ry="15"/><ellipse cx="-20" cy="-12" rx="22" ry="14"/><ellipse cx="14" cy="-16" rx="26" ry="16"/></g>'%(INK,cx,cy,s))
    # ground slab
    box(0,0,W,D,.5,'#9bc8a8',z0=-.5,depth=-50,sw=2.6,top='#a9d3b0')
    z=0
    # street along y=4..5 and cross street x=5..6
    flat([(0,3.6,z),(W,3.6,z),(W,4.7,z),(0,4.7,z)],'#d7dde3',2,-40)
    flat([(5.3,0,z),(6.3,0,z),(6.3,D,z),(5.3,D,z)],'#d7dde3',2,-39)
    # tram rails dashed
    add(-38,'<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="#fafcfe" stroke-width="2.2" stroke-dasharray="9 7"/>'%(*P(0,4.15,z),*P(W,4.15,z)))
    # pond/river bottom-left
    flat([(0.4,5.2,z),(3.6,5.2,z),(3.6,7.5,z),(0.4,7.5,z)],'#7db8e3',2.2,-38)
    for i in range(3):
        a,b=P(.9+i*.9,5.9+i*.4,z);add(-37,'<path d="M%.1f %.1f q6 -5 12 0 t12 0" fill="none" stroke="#fafcfe" stroke-width="2" stroke-linecap="round"/>'%(a,b))
    # allotment beds right-front
    for i in range(3):
        flat([(7.2+i*1.15,5.3,z),(8.1+i*1.15,5.3,z),(8.1+i*1.15,7.5,z),(7.2+i*1.15,7.5,z)],'#9a7a58' if i!=1 else '#b08a5e',2,-36)
        for j in range(4):
            X,Y=P(7.65+i*1.15,5.6+j*.5,z);add(-35,'<circle cx="%.1f" cy="%.1f" r="5.5" fill="%s" stroke="%s" stroke-width="1.6"/>'%(X,Y-3,['#62a57f','#e8a838','#8cc084'][ (i+j)%3],INK))
    # buildings
    # terraced housing (back-left), stepped with green roofs
    box(0.4,0.4,3.2,2.2,1.9,'#ece5d8');add(0,wins(0.4,0.4,3.2,2.2,1.9,0,4,2)) if False else None
    ops[-1]=(ops[-1][0],ops[-1][1]+wins(0.4,0.4,3.2,2.2,1.9,0,4,2))
    box(1.0,0.8,2.4,1.6,1.3,'#e6ebf0',z0=1.9,depth=0.6+0.5+3.2+2.2+.05)
    ops[-1]=(ops[-1][0],ops[-1][1]+wins(1.0,0.8,2.4,1.6,1.3,1.9,3,1))
    greenroof(1.0,0.8,2.4,1.6,3.2,9,dep=0.6+0.5+3.2+2.2+.1)
    # terrace lower greenroof strip
    # school with turbine
    box(4.0,0.4,3.0,2.4,2.3,'#dfe9e2')
    ops[-1]=(ops[-1][0],ops[-1][1]+wins(4.0,.4,3.0,2.4,2.3,0,4,2))
    panels(4.2,0.6,1.3,1.5,2.3,n=3,dep=4.0+.4+3+2.4+.1)
    greenroof(5.7,0.6,1.1,1.6,2.3,5,dep=4.0+.4+3+2.4+.1)
    # greenhouse (glass)
    box(7.6,0.5,2.8,2.3,1.5,'#cdeadf',top='#e8f7f0')
    ops[-1]=(ops[-1][0],ops[-1][1]+''.join(win('L',7.6,.5,2.8,2.3,.12+i*.62,.15,.5,1.0,'#e8f7f0') for i in range(4))+''.join(win('R',7.6,.5,2.8,2.3,.12+i*.7,.15,.55,1.0,'#e8f7f0') for i in range(3)))
    for i in range(5):
        X,Y=P(8.0+i*.45,1.0+((i*5)%3)*.5,1.5);add(7.6+.5+2.3+.3,'<circle cx="%.1f" cy="%.1f" r="6" fill="%s" stroke="%s" stroke-width="1.6"/>'%(X,Y-3,['#4f9f78','#e8a838','#c9492f','#4f9f78','#8cc084'][i],INK))
    # bakery (front-center-left) with awning
    box(3.8,5.3,2.0,2.0,1.5,'#f1d9b4')
    ops[-1]=(ops[-1][0],ops[-1][1]+wins(3.8,5.3,2.0,2.0,1.5,0,2,1,col='#fff3d0'))
    panels(3.95,5.45,1.3,1.3,1.5,n=3,dep=3.8+5.3+2.0+2.0+.1)
    # clinic (front-right-ish, behind allotments) -> put right of cross street front
    box(6.4,5.3,.0001,.0001,.0001,'#fff') if False else None
    # clinic left of tram stop (mid-left), at x 0.5..2.5 y 5.. but pond there; place at mid right back across street
    box(5.9,5.1,1.0,.001,.001,'#fff') if False else None
    # cistern/water tower
    box(9.4,3.0,.9,.9,1.2,'#d6dfe8')
    ops[-1]=(ops[-1][0],ops[-1][1]+'<ellipse cx="%.1f" cy="%.1f" rx="22" ry="10" fill="#7db8e3" stroke="%s" stroke-width="2"/>'%(*P(9.85,3.45,2.4),INK))
    # turbine behind
    turbine(10.6,.3,4.6,rot=-20)
    # tram
    box(0.7,3.85,2.6,.6,.8,'#ffcb57',z0=.05,sw=2.2)
    ops[-1]=(ops[-1][0]+1,ops[-1][1]+''.join(win('L',0.7,3.85,2.6,.6,.12+i*.62,.4,.42,.3,'#fafcfe') for i in range(4)))
    # pantograph line
    add(30,'<path d="M%.1f %.1f l-4 -18 l8 0" fill="none" stroke="%s" stroke-width="2"/>'%(*P(2.0,4.15,.85),INK))
    # trees
    for t in ((.5,3.0),(3.6,3.1),(6.9,3.0),(10.3,5.0),(.8,4.9),(4.0,7.9),(6.8,7.7),(10.0,7.5),(.3,8.0)):
        tree(t[0],t[1],0,13,['#3f8a6a','#4f9f78','#62a57f'][int(t[0]*3)%3])
    # bikes/people dots
    for a,b,c in ((5.55,2.7,'#c9492f'),(5.9,5.0,'#2f7fc1'),(4.9,4.9,'#7a5ca8'),(6.0,3.0,'#e8a838')):
        X,Y=P(a,b,0);add(a+b+.2,'<circle cx="%.1f" cy="%.1f" r="4" fill="%s" stroke="%s" stroke-width="1.6"/><line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="%s" stroke-width="2.4" stroke-linecap="round"/>'%(X,Y-14,c,INK,X,Y-10,X,Y-1,INK))
    # solar sun-glints
    return ''.join(s for _,s in sorted(ops,key=lambda o:o[0]))
if __name__=='__main__':
    body=build()
    svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 520" width="760" height="520"><rect width="760" height="520" fill="#d9ecf6"/>%s</svg>'%body
    open(__import__('os').path.join(__import__('os').path.dirname(__file__),'..','assets','img','solarpunk-town.svg'),'w').write(svg)
