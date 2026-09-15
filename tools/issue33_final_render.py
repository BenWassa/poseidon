from pathlib import Path

import cairosvg

OUT = Path("tmp_issue33_final")
OUT.mkdir(exist_ok=True)


def defs(s: str) -> str:
    return f'''<defs>
      <linearGradient id="water{s}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#a8f3ea"/><stop offset="0.32" stop-color="#48c5c8"/><stop offset="0.7" stop-color="#198aa0"/><stop offset="1" stop-color="#075a72"/>
      </linearGradient>
      <radialGradient id="sun{s}" cx="18%" cy="5%" r="72%">
        <stop offset="0" stop-color="#fffbd6" stop-opacity=".98"/><stop offset=".25" stop-color="#e9fff6" stop-opacity=".46"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="sand{s}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dccfa8"/><stop offset="1" stop-color="#9b896c"/></linearGradient>
      <filter id="shadow{s}" x="-35%" y="-35%" width="170%" height="190%"><feGaussianBlur in="SourceAlpha" stdDeviation="13" result="b"/><feOffset dx="0" dy="17" result="o"/><feColorMatrix in="o" type="matrix" values="0 0 0 0 .02 0 0 0 0 .13 0 0 0 0 .18 0 0 0 .42 0"/><feBlend in="SourceGraphic"/></filter>
      <filter id="soft{s}"><feGaussianBlur stdDeviation="3"/></filter>
    </defs>'''


def background(s: str, floor: int = 760) -> str:
    return f'''<rect width="1024" height="1024" fill="url(#water{s})"/><rect width="1024" height="1024" fill="url(#sun{s})"/>
    <g opacity=".18" fill="none" stroke="#ecfff8" stroke-width="13" stroke-linecap="round" filter="url(#soft{s})"><path d="M10 155 C215 100 350 202 523 143 S820 93 1018 165"/><path d="M-40 280 C174 221 300 324 480 260 S780 205 1050 292"/></g>
    <path d="M0 {floor} C190 {floor-36} 330 {floor+25} 510 {floor-5} S820 {floor+8} 1024 {floor-30} L1024 1024 L0 1024 Z" fill="url(#sand{s})"/>
    <g opacity=".38" fill="#416e62"><ellipse cx="105" cy="850" rx="74" ry="43"/><ellipse cx="906" cy="830" rx="90" ry="49"/><ellipse cx="765" cy="935" rx="58" ry="31"/><ellipse cx="260" cy="936" rx="55" ry="29"/></g>
    <g opacity=".56" fill="none" stroke="#3d8b72" stroke-width="7" stroke-linecap="round"><path d="M47 944 Q71 841 66 778 M88 949 Q116 844 141 780 M930 945 Q949 847 921 773 M973 957 Q989 866 1008 802"/></g>
    <g opacity=".45" fill="#fff7cf"><circle cx="128" cy="235" r="7"/><circle cx="201" cy="329" r="4"/><circle cx="842" cy="214" r="5"/><circle cx="916" cy="356" r="3"/><circle cx="697" cy="139" r="4"/></g>'''


def wrap(s: str, body: str, floor: int = 760) -> str:
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">{defs(s)}{background(s, floor)}{body}<rect width="1024" height="1024" fill="none" stroke="#063e50" stroke-opacity=".08" stroke-width="22"/></svg>'''


def bluehead() -> str:
    body = "M175 520 C245 445 370 418 558 425 C713 431 819 466 850 513 C815 568 704 606 536 613 C365 620 240 590 175 520Z"
    return wrap("B", f'''<g filter="url(#shadowB)" transform="rotate(-2 515 520)">
      <path d="M193 514 C135 464 91 439 48 426 C67 480 68 540 48 603 C98 581 141 556 198 532Z" fill="#4e9d70" stroke="#225d4e" stroke-width="10"/>
      <defs><clipPath id="bb"><path d="{body}"/></clipPath></defs><path d="{body}" fill="#4ca36a" stroke="#244f4a" stroke-width="12"/>
      <g clip-path="url(#bb)"><path d="M645 330 H905 V700 H645 Z" fill="#1977bd"/><path d="M587 330 H646 V700 H587 Z" fill="#f3efe2"/><path d="M530 330 H588 V700 H530 Z" fill="#111b24"/></g>
      <path d="M271 447 C369 402 516 398 632 429 C528 423 397 430 296 462Z" fill="#3f8f62" stroke="#235848" stroke-width="7"/>
      <path d="M350 608 C418 650 493 652 557 613Z" fill="#4b9868" stroke="#25584a" stroke-width="7"/><path d="M596 606 C659 650 724 640 764 593Z" fill="#34865e" stroke="#25584a" stroke-width="7"/>
      <path d="M742 407 C787 397 825 426 849 465 L846 523 C820 478 791 456 753 456Z" fill="#1d79bd"/>
      <circle cx="795" cy="442" r="27" fill="#79d5ec" stroke="#124968" stroke-width="5"/><circle cx="796" cy="443" r="14" fill="#112027"/><circle cx="790" cy="436" r="5" fill="#fff"/>
      <path d="M840 488 Q876 500 846 521 Q818 520 800 508 Q817 492 840 488Z" fill="#4cb0ce" stroke="#14506a" stroke-width="5"/>
      <path d="M680 471 Q704 511 691 556" fill="none" stroke="#0c557d" stroke-width="5"/><path d="M384 479 C430 454 475 457 517 485" fill="none" stroke="#83c77d" stroke-width="9" opacity=".55"/>
    </g>''', 735)


def yellowhead() -> str:
    body = "M174 519 C245 443 371 416 560 424 C715 431 820 466 851 514 C814 569 700 607 531 613 C361 619 237 589 174 519Z"
    return wrap("Y", f'''<g filter="url(#shadowY)" transform="rotate(1 515 520)">
      <path d="M190 514 C132 462 88 435 44 418 C67 474 67 544 46 607 C96 584 141 555 196 532Z" fill="#55a37d" stroke="#245b52" stroke-width="10"/>
      <defs><clipPath id="yb"><path d="{body}"/></clipPath></defs><path d="{body}" fill="#58a684" stroke="#285c56" stroke-width="12"/>
      <g clip-path="url(#yb)"><path d="M648 330 H910 V700 H648 Z" fill="#f2d947"/></g>
      <path d="M273 446 C370 401 523 398 650 429 C536 422 399 430 297 462Z" fill="#459b77" stroke="#285c56" stroke-width="7"/>
      <path d="M350 608 C419 650 493 652 560 612Z" fill="#5ba683" stroke="#285c56" stroke-width="7"/><path d="M601 606 C661 650 727 640 766 591Z" fill="#4b9a76" stroke="#285c56" stroke-width="7"/>
      <path d="M747 408 C789 397 828 426 850 469 L846 526 C818 480 793 457 754 457Z" fill="#eed347"/>
      <circle cx="795" cy="443" r="27" fill="#f7df62" stroke="#786716" stroke-width="5"/><circle cx="795" cy="443" r="14" fill="#131e22"/><circle cx="789" cy="436" r="5" fill="#fff"/>
      <path d="M840 489 Q877 501 846 522 Q817 521 800 509 Q816 493 840 489Z" fill="#f3d957" stroke="#81701a" stroke-width="5"/>
      <path d="M604 385 L604 548" stroke="#1a232a" stroke-width="31" stroke-linecap="round"/><path d="M535 421 L672 421" stroke="#1a232a" stroke-width="30" stroke-linecap="round"/>
      <path d="M680 473 Q704 512 691 555" fill="none" stroke="#4c7f68" stroke-width="5"/><path d="M334 479 C418 451 503 454 574 489" fill="none" stroke="#86c49a" stroke-width="8" opacity=".55"/>
    </g>''', 735)


def surgeon() -> str:
    body = "M207 516 C235 383 354 315 529 320 C698 325 804 401 833 507 C803 617 686 684 519 689 C351 695 238 629 207 516Z"
    yellow_lines = "".join(f'<path d="M{707+i*10} {410+i*12} l45 12" stroke="#e2cc4b" stroke-width="8" stroke-linecap="round"/>' for i in range(4))
    return wrap("S", f'''<g filter="url(#shadowS)" transform="rotate(-1 520 516)">
      <path d="M211 506 C143 449 94 408 49 382 C74 464 73 558 47 646 C101 615 151 571 217 531Z" fill="#78806e" stroke="#414c46" stroke-width="11"/>
      <path d="M68 401 C50 452 50 576 67 628" fill="none" stroke="#ebe7a6" stroke-width="16" stroke-linecap="round"/>
      <path d="{body}" fill="#777c6f" stroke="#414943" stroke-width="12"/>
      <path d="M291 349 C387 284 542 283 669 330 C551 320 419 335 318 381Z" fill="#697365" stroke="#414943" stroke-width="7"/>
      <path d="M356 686 C422 739 500 744 566 691Z" fill="#70796b" stroke="#414943" stroke-width="7"/><path d="M607 679 C670 730 731 715 770 655Z" fill="#70796b" stroke="#414943" stroke-width="7"/>
      <path d="M724 389 C776 374 819 406 839 456 L836 524 C812 476 779 443 738 444Z" fill="#747b6e"/>
      <circle cx="784" cy="423" r="28" fill="#b3b78e" stroke="#5b604d" stroke-width="5"/><circle cx="785" cy="424" r="15" fill="#142022"/><circle cx="779" cy="417" r="5" fill="#fff"/>{yellow_lines}
      <path d="M827 481 Q866 493 833 516 Q804 518 789 503 Q803 486 827 481Z" fill="#8e907c" stroke="#4c544a" stroke-width="5"/>
      <path d="M689 458 Q716 501 703 557" fill="none" stroke="#4e5850" stroke-width="5"/>
      <path d="M235 519 C368 497 530 502 690 529" fill="none" stroke="#9a9d8e" stroke-width="5" opacity=".45"/>
      <path d="M198 525 C178 518 163 520 146 531" fill="none" stroke="#d7c45a" stroke-width="9" stroke-linecap="round"/>
    </g>''', 735)


def rock_beauty() -> str:
    body = "M209 517 C231 389 349 318 531 319 C700 320 809 397 839 500 C811 617 690 690 516 692 C348 695 238 630 209 517Z"
    return wrap("R", f'''<g filter="url(#shadowR)" transform="rotate(-1 520 512)">
      <path d="M212 509 C150 452 104 418 57 398 C80 470 80 555 57 633 C108 605 154 568 219 532Z" fill="#f0cf3f" stroke="#79681d" stroke-width="10"/>
      <defs><clipPath id="rb"><path d="{body}"/></clipPath></defs><path d="{body}" fill="#f0cd3a" stroke="#5b5528" stroke-width="12"/>
      <g clip-path="url(#rb)"><path d="M210 280 H655 V735 H210 Z" fill="#1d2425"/></g>
      <path d="M280 348 C376 282 533 282 654 325 C551 318 417 331 310 381Z" fill="#202829" stroke="#11191b" stroke-width="7"/>
      <path d="M345 687 C415 743 495 745 564 691Z" fill="#1f2728" stroke="#12191b" stroke-width="7"/><path d="M600 679 C660 729 724 720 770 660Z" fill="#f0ce3d" stroke="#79681d" stroke-width="7"/>
      <path d="M728 388 C779 375 820 407 841 456 L838 522 C814 475 782 445 741 444Z" fill="#edcb3d"/>
      <circle cx="785" cy="423" r="29" fill="#f0ca42" stroke="#7d6b18" stroke-width="5"/><circle cx="785" cy="423" r="18" fill="#2f73b7"/><circle cx="785" cy="423" r="10" fill="#10191c"/><circle cx="779" cy="416" r="4" fill="#fff"/>
      <path d="M829 480 Q868 493 834 515 Q806 516 790 503 Q804 486 829 480Z" fill="#f0ce42" stroke="#826d1c" stroke-width="5"/>
      <path d="M684 450 Q713 491 704 551" fill="none" stroke="#f07837" stroke-width="12"/>
      <path d="M314 664 C360 690 409 703 468 707" fill="none" stroke="#f17635" stroke-width="12" stroke-linecap="round"/>
      <path d="M210 510 C347 486 454 485 554 510" fill="none" stroke="#5d6764" stroke-width="6" opacity=".45"/>
    </g>''', 735)


def loggerhead() -> str:
    costals = []
    for y in [420, 474, 528, 582, 636]:
        costals.append(f'<path d="M455 {y-25} Q390 {y} 350 {y+35} Q420 {y+55} 484 {y+24}Z" fill="#9b5939" stroke="#5f3829" stroke-width="7"/>')
        costals.append(f'<path d="M505 {y-25} Q570 {y} 613 {y+35} Q548 {y+55} 487 {y+24}Z" fill="#a7613f" stroke="#5f3829" stroke-width="7"/>')
    return wrap("L", f'''<g filter="url(#shadowL)" transform="rotate(-5 520 520)">
      <path d="M620 465 C748 391 842 382 927 413 C854 454 788 512 672 561Z" fill="#c28b58" stroke="#6c4d38" stroke-width="12"/>
      <path d="M401 627 C321 750 247 806 161 823 C208 750 252 670 353 584Z" fill="#b87c50" stroke="#6c4d38" stroke-width="12"/>
      <path d="M526 690 C579 766 628 807 686 824 C660 754 635 699 575 647Z" fill="#ae754b" stroke="#6c4d38" stroke-width="10"/>
      <path d="M330 360 C426 307 553 316 647 381 C691 412 708 467 692 538 C668 647 570 733 474 743 C376 729 301 646 279 546 C262 469 283 398 330 360Z" fill="#a96340" stroke="#5c392d" stroke-width="15"/>
      <path d="M474 340 C455 420 454 625 474 723" fill="none" stroke="#64402f" stroke-width="11"/>
      {''.join(costals)}
      <path d="M644 405 C716 376 796 392 839 445 C874 487 870 548 830 587 C787 629 706 623 657 584 C620 553 615 445 644 405Z" fill="#c18d5e" stroke="#684b36" stroke-width="13"/>
      <path d="M791 505 Q858 516 831 558 Q792 578 744 551 Q754 517 791 505Z" fill="#d4a36d" stroke="#6b4d38" stroke-width="7"/>
      <circle cx="777" cy="461" r="25" fill="#d7b375" stroke="#6a4b35" stroke-width="5"/><circle cx="780" cy="462" r="11" fill="#1b2322"/><circle cx="775" cy="456" r="4" fill="#fff"/>
      <path d="M667 431 Q703 452 719 485" fill="none" stroke="#8e6647" stroke-width="7"/><path d="M689 575 Q744 590 811 558" fill="none" stroke="#74513a" stroke-width="7"/>
      <path d="M392 712 Q469 757 548 706 Q509 753 466 768 Q420 754 392 712Z" fill="#e4cf83" opacity=".9"/>
      <path d="M359 394 Q474 340 610 401" fill="none" stroke="#c78655" stroke-width="12" opacity=".6"/>
    </g>''', 770)


def splendid_toadfish() -> str:
    stripes = "".join([
        '<path d="M695 407 Q757 431 806 470"/>', '<path d="M676 438 Q749 462 815 510"/>', '<path d="M670 474 Q747 496 810 548"/>', '<path d="M675 512 Q739 532 793 576"/>', '<path d="M720 387 Q709 454 699 518"/>', '<path d="M764 405 Q746 468 738 541"/>',
    ])
    mesh = []
    for x in [280, 335, 390, 445, 500, 555, 610]:
        mesh.append(f'<path d="M{x} 410 q38 42 0 84 q-38 42 0 84 q38 42 0 84"/>')
    for y in [440, 495, 550, 605]:
        mesh.append(f'<path d="M240 {y} q48 32 96 0 t96 0 t96 0 t96 0"/>')
    barbels = []
    for i, x in enumerate(range(700, 841, 23)):
        barbels.append(f'<path d="M{x} {574+(i%2)*5} q{-9+i%3*7} {30+i%3*6} {-5+i%2*10} {58+i%4*5}"/>')
    branched = '<path d="M748 579 q-6 38 -2 72 M746 628 l-18 23 M747 635 l18 21"/><path d="M774 580 q4 38 5 72 M778 630 l-18 24 M779 636 l19 20"/>'
    return wrap("T", f'''<g filter="url(#shadowT)" transform="rotate(1 520 535)">
      <path d="M206 531 C148 493 104 466 60 451 C80 497 79 552 61 607 C107 588 149 564 210 548Z" fill="#656b68" stroke="#333c3c" stroke-width="10"/>
      <path d="M204 532 C239 427 346 374 535 376 C676 378 755 417 784 484 C790 572 706 644 539 676 C367 708 238 646 204 532Z" fill="#747a75" stroke="#333d3d" stroke-width="13"/>
      <g fill="none" stroke="#b5beb2" stroke-width="6" opacity=".42">{''.join(mesh)}</g>
      <path d="M300 401 C392 335 554 331 655 384 C537 375 410 386 322 429Z" fill="#242d2f" stroke="#e6a43d" stroke-width="16"/>
      <path d="M420 657 C485 719 560 723 625 662Z" fill="#252d2f" stroke="#e5a13a" stroke-width="16"/>
      <path d="M560 633 C615 700 683 692 720 627Z" fill="#252d2f" stroke="#e5a13a" stroke-width="15"/>
      <path d="M630 402 C709 360 814 386 865 454 C904 506 887 581 831 620 C777 658 680 638 630 583 C595 543 598 437 630 402Z" fill="#151d21" stroke="#0c1417" stroke-width="13"/>
      <g fill="none" stroke="#f4f0dc" stroke-width="12" stroke-linecap="round" opacity=".95">{stripes}</g>
      <circle cx="806" cy="441" r="27" fill="#f1d86b" stroke="#715a1f" stroke-width="6"/><circle cx="807" cy="442" r="13" fill="#11191c"/><circle cx="802" cy="436" r="4" fill="#fff"/>
      <path d="M833 505 Q892 520 855 557 Q810 575 766 545 Q783 514 833 505Z" fill="#252e31" stroke="#0d1417" stroke-width="7"/>
      <g fill="none" stroke="#e8dec0" stroke-width="8" stroke-linecap="round">{''.join(barbels)}{branched}</g>
      <path d="M622 471 Q593 505 602 552" fill="none" stroke="#e39b37" stroke-width="10"/>
      <path d="M246 529 C373 507 488 509 610 534" fill="none" stroke="#c7d0c4" stroke-width="5" opacity=".38"/>
    </g>''', 780)


ASSETS = {
    "bluehead-wrasse": bluehead(),
    "loggerhead-sea-turtle": loggerhead(),
    "ocean-surgeonfish": surgeon(),
    "rock-beauty": rock_beauty(),
    "splendid-toadfish": splendid_toadfish(),
    "yellowhead-wrasse": yellowhead(),
}

for creature_id, svg in ASSETS.items():
    svg_path = OUT / f"{creature_id}.svg"
    png_path = OUT / f"{creature_id}.png"
    svg_path.write_text(svg, encoding="utf-8")
    cairosvg.svg2png(bytestring=svg.encode("utf-8"), write_to=str(png_path), output_width=1024, output_height=1024)
    print(f"[issue33-final] rendered {creature_id}")
