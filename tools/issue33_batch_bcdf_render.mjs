import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { launchOptions } from './chromium.mjs';

const outDir = 'tmp_issue33_bcdf';
await mkdir(outDir, { recursive: true });

const defs = (s) => `
<defs>
  <linearGradient id="water${s}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#9df0ea"/><stop offset="0.34" stop-color="#42bdc5"/><stop offset="0.72" stop-color="#16869c"/><stop offset="1" stop-color="#07586f"/>
  </linearGradient>
  <radialGradient id="sun${s}" cx="20%" cy="7%" r="70%">
    <stop offset="0" stop-color="#fffbd9" stop-opacity=".98"/><stop offset=".28" stop-color="#e7fff4" stop-opacity=".4"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="sand${s}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d8caa3"/><stop offset="1" stop-color="#98866a"/></linearGradient>
  <filter id="shadow${s}" x="-35%" y="-35%" width="170%" height="190%">
    <feGaussianBlur in="SourceAlpha" stdDeviation="14" result="b"/><feOffset dx="0" dy="18" result="o"/><feColorMatrix in="o" type="matrix" values="0 0 0 0 0.02 0 0 0 0 0.16 0 0 0 0 0.19 0 0 0 .45 0"/><feBlend in="SourceGraphic"/>
  </filter>
  <filter id="soft${s}"><feGaussianBlur stdDeviation="3"/></filter>
  <filter id="texture${s}" x="-10%" y="-10%" width="120%" height="120%">
    <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" seed="${s.charCodeAt(0)}" result="n"/>
    <feColorMatrix in="n" type="saturate" values="0" result="g"/><feComponentTransfer in="g" result="a"><feFuncA type="table" tableValues="0 .11"/></feComponentTransfer><feBlend in="SourceGraphic" in2="a" mode="soft-light"/>
  </filter>
</defs>`;

const background = (s, floorY = 735) => `
<rect width="1024" height="1024" fill="url(#water${s})"/><rect width="1024" height="1024" fill="url(#sun${s})"/>
<g opacity=".2" fill="none" stroke="#eafff6" stroke-width="13" stroke-linecap="round" filter="url(#soft${s})"><path d="M20 170 C220 110 350 220 520 150 S820 95 1010 170"/><path d="M-30 292 C175 225 290 342 470 270 S765 210 1050 302"/></g>
<path d="M0 ${floorY} C180 ${floorY-42} 330 ${floorY+34} 500 ${floorY-10} S820 ${floorY+15} 1024 ${floorY-38} L1024 1024 L0 1024 Z" fill="url(#sand${s})"/>
<g opacity=".4" fill="#456f63"><ellipse cx="100" cy="824" rx="70" ry="42"/><ellipse cx="902" cy="795" rx="92" ry="52"/><ellipse cx="780" cy="914" rx="60" ry="34"/><ellipse cx="250" cy="932" rx="48" ry="27"/></g>
<g opacity=".58" fill="none" stroke="#3c876f" stroke-width="7" stroke-linecap="round"><path d="M52 930 Q72 825 66 765 M94 940 Q120 832 143 770 M930 937 Q950 828 918 754 M971 951 Q988 850 1006 792"/></g>
<g opacity=".45" fill="#fff7cf"><circle cx="118" cy="220" r="7"/><circle cx="192" cy="315" r="4"/><circle cx="850" cy="215" r="5"/><circle cx="910" cy="350" r="3"/><circle cx="690" cy="132" r="4"/></g>`;

const wrap = (s, body, floorY = 735) => `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">${defs(s)}${background(s, floorY)}${body}<rect width="1024" height="1024" fill="none" stroke="#063e50" stroke-opacity=".08" stroke-width="22"/></svg>`;

const bicolorDamselfish = () => {
  const bodyPath = 'M205 523 C237 390 355 314 525 323 C690 331 808 408 835 511 C804 624 683 690 520 687 C353 684 240 627 205 523Z';
  return wrap('B', `
  <g filter="url(#shadowB)" transform="rotate(-2 520 515)">
    <path d="M204 512 C142 453 97 418 48 397 C74 472 74 550 48 630 C100 601 150 565 211 531Z" fill="#f5f2e7" stroke="#66757a" stroke-width="10"/>
    <defs><clipPath id="bodyB"><path d="${bodyPath}"/></clipPath></defs>
    <path d="${bodyPath}" fill="#f5f3e8" stroke="#27343a" stroke-width="12"/>
    <g clip-path="url(#bodyB)"><path d="M505 280 H900 V735 H505 Z" fill="#1d2529"/><path d="M482 290 C515 410 515 585 482 720" fill="none" stroke="#505b5e" stroke-width="18" opacity=".45"/></g>
    <path d="M300 353 C385 286 510 282 610 322 C516 320 408 335 325 382Z" fill="#323b3e" opacity=".92"/>
    <path d="M585 676 C646 728 716 714 755 649Z" fill="#252d31" stroke="#11191c" stroke-width="7"/>
    <path d="M350 679 C414 731 489 734 551 684Z" fill="#e9e8df" stroke="#727d7f" stroke-width="7"/>
    <path d="M735 438 C777 420 820 444 843 480 L839 540 C811 503 779 484 742 484Z" fill="#222a2e"/>
    <circle cx="778" cy="443" r="28" fill="#b9d0d0"/><circle cx="779" cy="444" r="17" fill="#11191c"/><circle cx="772" cy="437" r="5" fill="#fff"/>
    <path d="M828 493 Q867 505 831 527 Q802 524 790 511 Q805 496 828 493Z" fill="#31393d" stroke="#12191c" stroke-width="5"/>
    <path d="M550 480 Q623 504 644 565 Q588 583 536 551Z" fill="#2a3438" opacity=".9"/>
    <path d="M242 520 C332 495 409 492 499 502" fill="none" stroke="#d8e2df" stroke-width="5" opacity=".85"/>
  </g>`, 730);
};

const frenchGrunt = () => {
  const upper = [390,414,438,462,486,510].map((y) => `<path d="M254 ${y} C385 ${y-18} 530 ${y-8} 702 ${y+5}" fill="none" stroke="#f0c83c" stroke-width="12" stroke-linecap="round"/>`).join('');
  const lower = [530,554,578,602,626].map((y, i) => `<path d="M265 ${y} C390 ${y+2+i*5} 510 ${y+28+i*7} 650 ${y+58+i*7}" fill="none" stroke="#e8bd33" stroke-width="11" stroke-linecap="round"/>`).join('');
  return wrap('F', `
  <g filter="url(#shadowF)" transform="rotate(1 520 515)">
    <path d="M191 517 C133 465 88 435 44 416 C68 475 70 546 47 612 C96 589 144 558 198 531Z" fill="#f1c53d" stroke="#a98119" stroke-width="10"/>
    <path d="M192 516 C229 389 355 322 542 327 C713 331 825 405 852 500 C826 601 708 670 527 680 C347 688 225 625 192 516Z" fill="#d8ded7" stroke="#697979" stroke-width="12"/>
    <path d="M211 528 C314 593 457 619 631 596 C720 584 790 551 844 504 C813 612 695 671 527 680 C351 689 239 630 211 528Z" fill="#c9d6c9" opacity=".58"/>
    ${upper}${lower}
    <path d="M315 350 C399 290 548 286 661 337 C563 325 433 337 340 382Z" fill="#f0c43c" stroke="#a67f1d" stroke-width="7"/>
    <path d="M374 676 C433 725 499 728 557 681Z" fill="#efc63b" stroke="#9f7e20" stroke-width="7"/>
    <path d="M605 668 C660 718 722 706 760 646Z" fill="#f0c63e" stroke="#9f7e20" stroke-width="7"/>
    <path d="M719 397 C775 380 822 411 850 454 L851 515 C820 469 786 446 741 448Z" fill="#f0c63e" opacity=".95"/>
    <circle cx="794" cy="430" r="27" fill="#ead666"/><circle cx="794" cy="430" r="16" fill="#162124"/><circle cx="788" cy="424" r="5" fill="#fff"/>
    <path d="M842 480 Q879 491 846 515 Q817 516 802 503 Q817 486 842 480Z" fill="#d9d692" stroke="#70724f" stroke-width="5"/>
    <path d="M688 428 Q723 488 701 573" fill="none" stroke="#8b9a87" stroke-width="5" opacity=".85"/>
  </g>`, 735);
};

const honeycombCowfish = () => {
  const hexes = [];
  const r = 31;
  for (let row = 0; row < 6; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      const cx = 320 + col * 58 + (row % 2 ? 29 : 0);
      const cy = 395 + row * 52;
      const pts = Array.from({ length: 6 }, (_, k) => {
        const a = Math.PI / 3 * k;
        return `${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`;
      }).join(' ');
      hexes.push(`<polygon points="${pts}" fill="none" stroke="#f3e0a4" stroke-width="11"/><polygon points="${pts}" fill="none" stroke="#50442e" stroke-width="5"/>`);
    }
  }
  return wrap('C', `
  <g filter="url(#shadowC)" transform="rotate(-1 520 520)">
    <path d="M215 505 C151 470 111 440 70 405 C85 463 84 532 68 591 C113 564 157 541 217 526Z" fill="#d6b95f" stroke="#675b39" stroke-width="10"/>
    <path d="M220 505 C235 391 321 334 511 330 C690 327 807 381 844 469 C851 555 815 626 726 664 C622 706 406 696 302 648 C246 622 218 574 220 505Z" fill="#bda65c" stroke="#5d5338" stroke-width="13"/>
    <defs><clipPath id="cowBody"><path d="M220 505 C235 391 321 334 511 330 C690 327 807 381 844 469 C851 555 815 626 726 664 C622 706 406 696 302 648 C246 622 218 574 220 505Z"/></clipPath></defs>
    <g clip-path="url(#cowBody)" opacity=".93">${hexes.join('')}</g>
    <path d="M760 389 L804 291 L823 399" fill="#bda65c" stroke="#5a5035" stroke-width="9" stroke-linejoin="round"/>
    <path d="M721 385 L751 304 L770 393" fill="#bda65c" stroke="#5a5035" stroke-width="8" opacity=".72"/>
    <path d="M287 622 L232 698 L307 654" fill="#bda65c" stroke="#5a5035" stroke-width="9" stroke-linejoin="round"/>
    <path d="M465 335 C540 292 633 302 693 334" fill="none" stroke="#9a874c" stroke-width="10"/>
    <circle cx="767" cy="421" r="28" fill="#d6cd8b" stroke="#51492f" stroke-width="6"/><circle cx="769" cy="422" r="15" fill="#111b1c"/><circle cx="763" cy="416" r="5" fill="#fff"/>
    <path d="M832 486 Q872 499 837 522 Q807 521 792 507 Q808 490 832 486Z" fill="#bda65c" stroke="#5d5338" stroke-width="5"/>
    <path d="M725 492 Q749 532 724 574" fill="none" stroke="#655b3e" stroke-width="5" opacity=".8"/>
  </g>`, 750);
};

const lionfish = () => {
  const dorsalSpines = [332,375,420,466,512,558,604].map((x, i) => `<path d="M${x} 386 L${x - 18 + i * 2} ${170 + (i % 3) * 20}" stroke="#eee2c3" stroke-width="12"/><path d="M${x} 386 L${x - 18 + i * 2} ${170 + (i % 3) * 20}" stroke="#9f4638" stroke-width="5"/>`).join('');
  const pectoralBack = [0,1,2,3,4,5,6].map((i) => `<path d="M445 ${535+i*4} Q${350-i*18} ${650+i*22} ${205-i*10} ${735+i*17}" fill="none" stroke="#f0e2c5" stroke-width="13"/><path d="M445 ${535+i*4} Q${350-i*18} ${650+i*22} ${205-i*10} ${735+i*17}" fill="none" stroke="#a3493d" stroke-width="5"/>`).join('');
  const pectoralFront = [0,1,2,3,4,5].map((i) => `<path d="M650 ${545+i*3} Q${735+i*14} ${630+i*26} ${825+i*12} ${720+i*18}" fill="none" stroke="#f0e2c5" stroke-width="12"/><path d="M650 ${545+i*3} Q${735+i*14} ${630+i*26} ${825+i*12} ${720+i*18}" fill="none" stroke="#a3493d" stroke-width="5"/>`).join('');
  const bodyStripes = [360,410,462,514,566,618,670].map((x, i) => `<path d="M${x} ${384 + (i%2)*8} Q${x+10} 500 ${x-4} 626" fill="none" stroke="#8e3e34" stroke-width="30" opacity=".96"/>`).join('');
  const finSpots = [[286,515],[315,540],[333,570],[690,433],[720,448],[746,466],[706,605],[738,624],[770,642],[185,504],[160,526],[179,552]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="8" fill="#7d3c35"/>`).join('');
  return wrap('L', `
  <g filter="url(#shadowL)" transform="rotate(-2 515 510)">
    ${dorsalSpines}${pectoralBack}${pectoralFront}
    <path d="M223 511 C150 455 106 424 55 404 C80 469 80 548 55 616 C106 588 151 558 223 528Z" fill="#ead9b9" stroke="#75443c" stroke-width="10"/>
    <path d="M218 515 C255 402 363 349 527 356 C681 364 793 420 824 505 C795 598 683 655 523 663 C362 671 253 620 218 515Z" fill="#eee0c3" stroke="#6a413a" stroke-width="12"/>
    <defs><clipPath id="lionBody"><path d="M218 515 C255 402 363 349 527 356 C681 364 793 420 824 505 C795 598 683 655 523 663 C362 671 253 620 218 515Z"/></clipPath></defs>
    <g clip-path="url(#lionBody)">${bodyStripes}</g>
    <path d="M688 397 C746 380 797 407 827 451 L827 514 C799 470 760 447 714 448Z" fill="#e5d3b7" stroke="#744139" stroke-width="7"/>
    <path d="M301 655 C366 706 443 706 508 660Z" fill="#e8d5b9" stroke="#75443c" stroke-width="7"/>
    <path d="M566 656 C631 706 704 694 747 635Z" fill="#e9d7ba" stroke="#75443c" stroke-width="7"/>
    ${finSpots}
    <circle cx="759" cy="435" r="27" fill="#d6b66e"/><circle cx="759" cy="436" r="16" fill="#131b1d"/><circle cx="753" cy="430" r="5" fill="#fff"/>
    <path d="M812 484 Q852 496 817 521 Q786 520 771 506 Q789 489 812 484Z" fill="#dfceb4" stroke="#69413a" stroke-width="5"/>
    <path d="M746 454 Q728 493 745 530" fill="none" stroke="#9e473b" stroke-width="10"/>
  </g>`, 760);
};

const muttonSnapper = () => {
  const blueLines = [0,1,2].map((i) => `<path d="M744 ${468+i*14} Q784 ${481+i*9} 810 ${507+i*5}" fill="none" stroke="#3e9fc0" stroke-width="7" stroke-linecap="round"/>`).join('');
  return wrap('M', `
  <g filter="url(#shadowM)" transform="rotate(1 520 510)">
    <path d="M180 510 C116 445 77 413 36 395 C57 466 57 553 35 626 C83 597 132 559 186 527Z" fill="#be5b53" stroke="#6d3e3d" stroke-width="10"/>
    <path d="M184 511 C218 402 333 344 526 348 C706 352 826 414 854 502 C827 603 704 668 516 678 C337 687 218 624 184 511Z" fill="#d6b8ad" stroke="#6f6662" stroke-width="12"/>
    <path d="M203 528 C314 591 448 616 613 599 C717 588 792 551 846 507 C815 611 700 668 516 678 C340 687 230 630 203 528Z" fill="#c88e86" opacity=".55"/>
    <path d="M300 369 C396 304 551 308 666 355 C562 344 423 353 330 398Z" fill="#b95652" stroke="#723e3d" stroke-width="7"/>
    <path d="M352 674 C416 725 490 729 554 681Z" fill="#c25954" stroke="#733f3d" stroke-width="7"/>
    <path d="M606 665 C669 719 734 704 771 641Z" fill="#c35a54" stroke="#733f3d" stroke-width="7"/>
    <path d="M726 407 C785 391 832 420 857 463 L854 518 C824 475 790 451 746 451Z" fill="#c35b54" opacity=".92"/>
    <circle cx="793" cy="443" r="28" fill="#c9413d" stroke="#803431" stroke-width="5"/><circle cx="793" cy="443" r="15" fill="#171d1f"/><circle cx="787" cy="437" r="5" fill="#fff"/>
    ${blueLines}
    <circle cx="577" cy="420" r="21" fill="#42383a" opacity=".96"/>
    <path d="M845 488 Q882 500 849 525 Q818 525 801 510 Q818 493 845 488Z" fill="#cfaaa0" stroke="#72625f" stroke-width="5"/>
    <path d="M690 439 Q721 497 700 572" fill="none" stroke="#8b716c" stroke-width="5"/>
  </g>`, 740);
};

const redbandParrotfish = () => {
  return wrap('R', `
  <g filter="url(#shadowR)" transform="rotate(-1 515 515)">
    <path d="M203 510 C143 455 98 424 52 405 C72 469 73 548 50 617 C99 590 145 558 207 528Z" fill="#5ba99d" stroke="#254f50" stroke-width="10"/>
    <path d="M198 511 C235 396 355 338 536 345 C708 352 819 418 844 505 C817 602 700 666 521 675 C348 683 232 624 198 511Z" fill="#5fa79a" stroke="#31595b" stroke-width="12"/>
    <path d="M211 530 C323 588 462 610 622 592 C721 580 790 548 836 505 C807 610 694 666 521 675 C354 683 238 631 211 530Z" fill="#417d75" opacity=".68"/>
    <path d="M310 362 C399 303 548 303 666 351 C559 343 430 350 334 391Z" fill="#6a9e83" stroke="#31595b" stroke-width="7"/>
    <path d="M355 672 C420 722 493 726 557 678Z" fill="#5e9c87" stroke="#31595b" stroke-width="7"/>
    <path d="M606 664 C668 715 730 703 766 644Z" fill="#5e9c87" stroke="#31595b" stroke-width="7"/>
    <path d="M728 405 C779 388 826 416 849 459 L845 518 C819 476 785 451 744 451Z" fill="#5b9785"/>
    <circle cx="786" cy="441" r="29" fill="#d24f4a" stroke="#8d3735" stroke-width="5"/><circle cx="786" cy="441" r="15" fill="#152022"/><circle cx="780" cy="435" r="5" fill="#fff"/>
    <path d="M748 474 Q790 496 820 522" fill="none" stroke="#cc4b47" stroke-width="13" stroke-linecap="round"/>
    <path d="M680 468 Q704 505 697 555" fill="none" stroke="#2b5555" stroke-width="5"/>
    <ellipse cx="699" cy="481" rx="25" ry="18" fill="#e2ca48" stroke="#242b2d" stroke-width="8"/>
    <path d="M837 486 Q871 499 842 520 Q811 520 796 506 Q812 490 837 486Z" fill="#d7e3cf" stroke="#4d6d67" stroke-width="5"/>
    <path d="M56 405 L128 462 L91 474" fill="#20272a"/><path d="M51 617 L132 557 L94 546" fill="#20272a"/>
    <path d="M372 459 C454 439 554 442 641 466" fill="none" stroke="#7bc0aa" stroke-width="8" opacity=".72"/>
  </g>`, 740);
};

const assets = {
  'bicolor-damselfish': bicolorDamselfish(),
  'french-grunt': frenchGrunt(),
  'honeycomb-cowfish': honeycombCowfish(),
  'lionfish': lionfish(),
  'mutton-snapper': muttonSnapper(),
  'redband-parrotfish': redbandParrotfish(),
};

const browser = await chromium.launch(launchOptions());
try {
  const page = await browser.newPage({ viewport: { width: 1024, height: 1024 }, deviceScaleFactor: 1 });
  for (const [id, svg] of Object.entries(assets)) {
    await page.setContent(`<style>html,body{margin:0;background:#0a6277}svg{display:block}</style>${svg}`, { waitUntil: 'load' });
    await page.screenshot({ path: join(outDir, `${id}.png`), clip: { x: 0, y: 0, width: 1024, height: 1024 } });
    console.log(`[issue33-bcdf] rendered ${id}`);
  }
} finally {
  await browser.close();
}
