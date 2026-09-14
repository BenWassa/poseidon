from pathlib import Path
import math, random
import cairosvg
OUT=Path('tmp_issue33_art_batch'); OUT.mkdir(exist_ok=True)

W=H=1024

def defs(s):
    return f'''<defs>
<linearGradient id="water{s}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8de7e2"/><stop offset="0.32" stop-color="#35b9c4"/><stop offset="0.72" stop-color="#12839c"/><stop offset="1" stop-color="#07566f"/></linearGradient>
<radialGradient id="sun{s}" cx="20%" cy="6%" r="65%"><stop offset="0" stop-color="#fffbd7" stop-opacity=".95"/><stop offset=".35" stop-color="#e1fff2" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<linearGradient id="sand{s}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e1d1a2"/><stop offset="1" stop-color="#9c8b6a"/></linearGradient>
<filter id="shadow{s}" x="-30%" y="-30%" width="160%" height="170%"><feGaussianBlur in="SourceAlpha" stdDeviation="12" result="b"/><feOffset dy="18" result="o"/><feColorMatrix in="o" type="matrix" values="0 0 0 0 .02 0 0 0 0 .18 0 0 0 0 .22 0 0 0 .45 0"/><feBlend in="SourceGraphic"/></filter>
</defs>'''

def bg(s, floor=760):
    return f'''<rect width="1024" height="1024" fill="url(#water{s})"/><rect width="1024" height="1024" fill="url(#sun{s})"/>
<g opacity=".18" fill="none" stroke="#efffff" stroke-width="10"><path d="M-20 160 C200 90 320 220 540 145 S820 100 1050 180"/><path d="M-20 275 C170 220 320 335 520 260 S810 210 1050 290"/></g>
<path d="M0 {floor} C160 {floor-30} 310 {floor+25} 480 {floor-6} S810 {floor+20} 1024 {floor-34} L1024 1024 L0 1024Z" fill="url(#sand{s})"/>
<g opacity=".4" fill="#507c6b"><ellipse cx="100" cy="850" rx="85" ry="43"/><ellipse cx="890" cy="825" rx="105" ry="50"/><ellipse cx="720" cy="920" rx="65" ry="34"/></g>
<g opacity=".56" stroke="#3d856e" stroke-width="8" fill="none" stroke-linecap="round"><path d="M58 956 Q75 820 68 760 M99 958 Q120 835 145 775 M925 960 Q950 830 916 755 M974 963 Q994 865 1008 800"/></g>
<g opacity=".45" fill="#fff7cf"><circle cx="150" cy="210" r="6"/><circle cx="208" cy="325" r="4"/><circle cx="850" cy="190" r="5"/><circle cx="913" cy="350" r="4"/><circle cx="680" cy="130" r="4"/></g>'''

def wrap(s, body, floor=760):
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">{defs(s)}{bg(s,floor)}{body}</svg>'

def eye(x,y,r=24):
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="#d9c76b" stroke="#3b3428" stroke-width="6"/><circle cx="{x}" cy="{y}" r="{r*0.55}" fill="#111c22"/><circle cx="{x-5}" cy="{y-7}" r="{r*.16}" fill="#fff"/>'

def balloonfish():
    s='B'; body=['<g filter="url(#shadowB)">']
    body.append('<ellipse cx="506" cy="530" rx="270" ry="235" fill="#e7d5a4" stroke="#775f45" stroke-width="12"/>')
    body.append('<path d="M760 505 C835 455 902 448 936 486 C900 523 900 557 936 595 C875 610 825 589 758 551Z" fill="#d5b866" stroke="#725f3d" stroke-width="9"/>')
    body.append('<path d="M418 320 C452 245 525 235 563 324Z" fill="#d5b866" stroke="#725f3d" stroke-width="8"/>')
    body.append('<path d="M436 732 C483 794 551 793 581 704Z" fill="#d5b866" stroke="#725f3d" stroke-width="8"/>')
    body.append('<path d="M326 373 Q397 322 459 363 Q432 429 352 451Z" fill="#4a3a31" opacity=".92"/>')
    body.append('<path d="M555 356 Q653 340 716 406 Q669 465 577 443Z" fill="#4a3a31" opacity=".92"/>')
    body.append('<path d="M368 583 Q455 548 510 603 Q468 678 381 665Z" fill="#4a3a31" opacity=".88"/>')
    body.append('<path d="M586 574 Q665 544 731 606 Q695 678 608 669Z" fill="#4a3a31" opacity=".88"/>')
    body.append('<path d="M272 405 Q300 430 322 475 Q337 520 325 566" fill="none" stroke="#40342f" stroke-width="34" opacity=".95"/>')
    for x,y,r in [(395,490,9),(490,423,8),(540,510,7),(465,590,8),(633,503,9),(358,541,7),(689,548,7),(556,642,8)]: body.append(f'<circle cx="{x}" cy="{y}" r="{r}" fill="#5a4637"/>')
    cx,cy=506,530; rx,ry=270,235
    for i in range(52):
        a=2*math.pi*i/52
        if math.cos(a) > .84: continue
        x=cx+math.cos(a)*rx*.97; y=cy+math.sin(a)*ry*.97; length=42+(i%5)*6; x2=x+math.cos(a)*length; y2=y+math.sin(a)*length
        body.append(f'<path d="M{x:.1f} {y:.1f} L{x2:.1f} {y2:.1f}" stroke="#f3ead1" stroke-width="7" stroke-linecap="round"/><path d="M{x2:.1f} {y2:.1f} l{math.cos(a)*8:.1f} {math.sin(a)*8:.1f}" stroke="#7e6b54" stroke-width="3"/>')
    body.append(eye(318,466,28)); body.append('<path d="M242 544 Q268 529 289 546 Q269 570 242 562Z" fill="#6b5344"/>'); body.append('</g>')
    return wrap(s,''.join(body),770)

def fish_body(s, fill, stroke='#35515a', tailfill=None):
    tailfill=tailfill or fill
    return [f'<g filter="url(#shadow{s})">',f'<path d="M210 520 C250 373 410 320 625 347 C764 365 838 433 842 513 C834 610 724 677 548 687 C375 696 244 637 210 520Z" fill="{fill}" stroke="{stroke}" stroke-width="12"/>',f'<path d="M820 486 C884 431 939 431 974 464 C950 500 949 543 974 579 C918 597 874 578 817 548Z" fill="{tailfill}" stroke="{stroke}" stroke-width="10"/>']

def black_grouper():
    s='G'; b=fish_body(s,'#7a7e76','#363c3b','#545954')
    b += ['<path d="M210 522 C180 492 171 453 203 426 C239 396 287 400 330 431 L338 588 C286 610 237 591 210 522Z" fill="#85877e" stroke="#363c3b" stroke-width="10"/>',eye(270,455,22),'<path d="M172 520 Q225 493 279 516 Q239 550 182 548Z" fill="#343636"/>']
    for x,y,w,h in [(350,405,95,55),(478,390,105,60),(610,410,105,60),(365,505,110,70),(510,500,115,70),(650,520,105,65),(430,590,105,55),(575,592,110,55)]: b.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="18" fill="#41484a" opacity=".9" transform="rotate({(x+y)%9-4} {x+w/2} {y+h/2})"/>')
    b += ['<path d="M345 354 Q485 257 690 337 L680 383 Q510 344 362 390Z" fill="#686d68" stroke="#363c3b" stroke-width="8"/>','<path d="M550 683 Q655 745 747 650 L714 621 Q649 672 579 653Z" fill="#686d68" stroke="#363c3b" stroke-width="8"/>','<path d="M615 332 Q690 286 747 350 L723 384 Q677 353 636 365Z" fill="#1d2325" opacity=".96"/>','<path d="M659 692 Q714 707 758 651 L723 629 Q692 658 664 666Z" fill="#1d2325"/>','<path d="M923 452 Q972 469 974 522 Q969 566 925 586 Q944 544 944 504 Q944 475 923 452Z" fill="#161d1f"/>','</g>']
    return wrap(s,''.join(b),775)

def doctorfish():
    s='D'; b=fish_body(s,'#777c78','#364d53','#777c78')
    b += ['<path d="M345 354 Q500 265 718 358 L688 392 Q507 343 363 401Z" fill="#6c7470" stroke="#35484d" stroke-width="8"/>','<path d="M365 672 Q520 735 708 655 L679 620 Q520 669 389 636Z" fill="#6c7470" stroke="#35484d" stroke-width="8"/>']
    for i,x in enumerate([345,382,421,462,504,547,590,632,674,715]):
        top=385+abs(i-5)*3; bot=638-abs(i-5)*2; b.append(f'<path d="M{x} {top} Q{x-15} 510 {x+3} {bot}" fill="none" stroke="#343b3c" stroke-width="10" opacity=".85"/>')
    b += [eye(286,455,22),'<path d="M817 496 L855 500 L853 542 L815 540Z" fill="#d9b73d" stroke="#775e20" stroke-width="5"/>','<path d="M235 518 Q268 500 296 516 Q267 537 239 536Z" fill="#50565a"/>','</g>']
    return wrap(s,''.join(b),775)

def foureye():
    s='F'; b=fish_body(s,'#eee0ad','#6b6754','#d9c36c')
    b += ['<path d="M210 520 Q163 505 128 528 Q170 546 222 542Z" fill="#ead8a5" stroke="#6b6754" stroke-width="9"/>',eye(250,463,19),'<path d="M261 373 Q290 501 272 645" fill="none" stroke="#313a3e" stroke-width="25" opacity=".95"/>']
    for x in range(340,700,45): b.append(f'<path d="M{x} 390 Q{x+35} 500 {x} 630 M{x+28} 400 Q{x-5} 500 {x+28} 620" fill="none" stroke="#9b8d65" stroke-width="6" opacity=".68"/>')
    b += ['<circle cx="727" cy="435" r="54" fill="#f4d77a" stroke="#353842" stroke-width="13"/><circle cx="727" cy="435" r="31" fill="#111b23"/><circle cx="712" cy="420" r="9" fill="#f6ffff"/>','<path d="M330 353 Q510 279 730 362 L701 403 Q505 348 348 410Z" fill="#e0c25c" stroke="#6b6754" stroke-width="8"/>','<path d="M365 671 Q505 730 690 652 L675 614 Q520 659 388 626Z" fill="#e0c25c" stroke="#6b6754" stroke-width="8"/>','</g>']
    return wrap(s,''.join(b),775)

def princess():
    s='P'; b=fish_body(s,'#36a497','#2a5b68','#44a795')
    b += ['<path d="M215 520 C247 407 340 351 440 355 C397 452 402 578 443 666 C330 670 245 611 215 520Z" fill="#317fb7" opacity=".95"/>',eye(274,456,20),'<path d="M190 520 Q230 494 274 512 Q238 546 193 543Z" fill="#94d1c4" stroke="#28545d" stroke-width="5"/>','<path d="M341 354 Q500 272 721 352 L704 395 Q520 344 365 404Z" fill="#2c81bd" stroke="#28545d" stroke-width="8"/>','<path d="M403 347 Q526 310 661 352" fill="none" stroke="#f28b9f" stroke-width="18" stroke-linecap="round"/>','<path d="M415 425 Q492 396 566 418" fill="none" stroke="#f2ce4c" stroke-width="18" stroke-linecap="round"/>','<path d="M820 486 C884 431 939 431 974 464" fill="none" stroke="#f28b9f" stroke-width="18"/>','<path d="M817 548 C874 578 918 597 974 579" fill="none" stroke="#f28b9f" stroke-width="18"/>','<path d="M365 671 Q515 728 700 654" fill="none" stroke="#2d87ba" stroke-width="22"/>','</g>']
    return wrap(s,''.join(b),775)

def moray():
    s='M'; parts=['<g filter="url(#shadowM)">','<path d="M870 610 C760 520 690 470 584 486 C480 500 454 574 356 598 C286 615 211 584 149 531" fill="none" stroke="#e2d59f" stroke-width="150" stroke-linecap="round"/>','<path d="M870 610 C760 520 690 470 584 486 C480 500 454 574 356 598 C286 615 211 584 149 531" fill="none" stroke="#6e5e45" stroke-width="166" stroke-linecap="round" opacity=".25"/>','<ellipse cx="160" cy="515" rx="125" ry="90" fill="#eadca9" stroke="#6c6047" stroke-width="10" transform="rotate(-12 160 515)"/>']
    rng=random.Random(7)
    for _ in range(120):
        x=rng.uniform(75,850)
        if x<300: y=540+(x-180)*.18
        elif x<520: y=590-(x-330)*.38
        elif x<680: y=505+(x-580)*.06
        else: y=500+(x-680)*.55
        y+=rng.uniform(-55,55); r=rng.uniform(5,11); parts.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.1f}" fill="#52362f" opacity=".96"/>')
    parts += [eye(112,487,20),'<path d="M73 545 Q155 510 237 548 Q167 590 89 579Z" fill="#3b2e2d" stroke="#6a5843" stroke-width="7"/>','<path d="M98 549 l18 24 l16 -31 l18 30 l17 -34 l18 28 l20 -34" fill="none" stroke="#efe5c7" stroke-width="7"/>','</g>']
    return wrap(s,''.join(parts),790)

def yellowtail():
    s='Y'; b=fish_body(s,'#68574a','#354e57','#f1cc35')
    b += ['<path d="M340 353 Q496 273 687 346 L663 391 Q508 343 367 404Z" fill="#605246" stroke="#354e57" stroke-width="8"/>','<path d="M365 673 Q510 739 679 652 L661 615 Q510 664 390 628Z" fill="#605246" stroke="#354e57" stroke-width="8"/>',eye(278,458,21),'<path d="M220 520 Q257 498 293 514 Q263 542 225 540Z" fill="#6e5c4d"/>']
    rng=random.Random(13)
    for _ in range(42):
        x=rng.uniform(330,735); y=rng.uniform(380,520); r=rng.uniform(5,10); b.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.1f}" fill="#52aee1" opacity=".95"/>')
    b += ['<path d="M830 479 C889 432 940 431 974 464 C950 502 950 542 974 579 C922 596 877 580 824 550Z" fill="#f4cd34" stroke="#796526" stroke-width="9"/>','</g>']
    return wrap(s,''.join(b),775)

arts={'balloonfish':balloonfish(),'black-grouper':black_grouper(),'doctorfish':doctorfish(),'foureye-butterflyfish':foureye(),'princess-parrotfish':princess(),'spotted-moray':moray(),'yellowtail-damselfish':yellowtail()}
for cid,svg in arts.items():
    (OUT/f'{cid}.svg').write_text(svg)
    cairosvg.svg2png(bytestring=svg.encode(), write_to=str(OUT/f'{cid}.png'), output_width=1024, output_height=1024)
print(f'rendered {len(arts)} source PNGs to {OUT}')
