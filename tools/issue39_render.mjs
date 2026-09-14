import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { launchOptions } from './chromium.mjs';

const outDir = 'tmp_issue39';
await mkdir(outDir, { recursive: true });

const commonDefs = (suffix) => `
<defs>
  <linearGradient id="water${suffix}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#8ee9e6"/><stop offset="0.34" stop-color="#35b9c4"/><stop offset="0.72" stop-color="#12839c"/><stop offset="1" stop-color="#07566f"/>
  </linearGradient>
  <radialGradient id="sun${suffix}" cx="22%" cy="8%" r="68%">
    <stop offset="0" stop-color="#fffbd7" stop-opacity="0.95"/><stop offset="0.28" stop-color="#dff8ef" stop-opacity="0.42"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="sand${suffix}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#d7caa2"/><stop offset="1" stop-color="#9a8869"/>
  </linearGradient>
  <filter id="shadow${suffix}" x="-30%" y="-30%" width="160%" height="180%">
    <feGaussianBlur in="SourceAlpha" stdDeviation="15" result="b"/><feOffset dx="0" dy="20" result="o"/><feColorMatrix in="o" type="matrix" values="0 0 0 0 0.02 0 0 0 0 0.18 0 0 0 0 0.21 0 0 0 .48 0"/><feBlend in="SourceGraphic"/>
  </filter>
  <filter id="soft${suffix}"><feGaussianBlur stdDeviation="3"/></filter>
  <filter id="texture${suffix}" x="-10%" y="-10%" width="120%" height="120%">
    <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="3" seed="${suffix.charCodeAt(0)}" result="n"/>
    <feColorMatrix in="n" type="saturate" values="0" result="g"/>
    <feComponentTransfer in="g" result="a"><feFuncA type="table" tableValues="0 0.13"/></feComponentTransfer>
    <feBlend in="SourceGraphic" in2="a" mode="soft-light"/>
  </filter>
</defs>`;

const background = (suffix, floorY = 700) => `
<rect width="1024" height="1024" fill="url(#water${suffix})"/>
<rect width="1024" height="1024" fill="url(#sun${suffix})"/>
<g opacity="0.22" fill="none" stroke="#e9fff5" stroke-width="13" stroke-linecap="round" filter="url(#soft${suffix})">
  <path d="M40 170 C240 110 330 225 520 150 S810 95 1000 170"/><path d="M-20 290 C170 220 290 345 470 270 S760 205 1050 300"/>
</g>
<path d="M0 ${floorY} C160 ${floorY-40} 300 ${floorY+35} 480 ${floorY-8} S820 ${floorY+15} 1024 ${floorY-40} L1024 1024 L0 1024 Z" fill="url(#sand${suffix})"/>
<g opacity="0.38" fill="#4a6f62">
  <ellipse cx="92" cy="800" rx="70" ry="42"/><ellipse cx="900" cy="782" rx="92" ry="52"/><ellipse cx="790" cy="900" rx="55" ry="34"/><ellipse cx="255" cy="925" rx="50" ry="28"/>
</g>
<g opacity="0.58" fill="none" stroke="#3d856e" stroke-width="7" stroke-linecap="round">
  <path d="M55 915 Q75 820 65 760 M92 930 Q120 820 140 765 M930 930 Q950 820 918 750 M970 948 Q987 850 1005 790"/>
</g>
<g opacity="0.45" fill="#fff7cf"><circle cx="116" cy="220" r="7"/><circle cx="190" cy="310" r="4"/><circle cx="850" cy="210" r="5"/><circle cx="912" cy="350" r="3"/><circle cx="690" cy="130" r="4"/></g>`;

const wrap = (suffix, body, floorY = 700) => `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">${commonDefs(suffix)}${background(suffix, floorY)}${body}<rect width="1024" height="1024" fill="none" stroke="#063e50" stroke-opacity=".08" stroke-width="22"/></svg>`;

const seaStar = () => {
  const knobs = [];
  const pts = [
    [512,350],[472,392],[553,404],[438,432],[587,445],[407,483],[620,490],[391,540],[640,548],[420,590],[607,590],[455,623],[565,626],
    [512,468],[512,520],[512,574],[345,579],[300,606],[266,645],[679,578],[724,608],[765,646],[445,698],[416,744],[403,792],[579,699],[606,746],[618,790]
  ];
  for (const [x,y] of pts) knobs.push(`<circle cx="${x}" cy="${y}" r="${7 + ((x+y)%5)}" fill="#f6d29a" stroke="#8b3b24" stroke-width="3"/>`);
  const ridge = `<g fill="none" stroke="#f0b875" stroke-opacity=".82" stroke-width="10" stroke-linecap="round"><path d="M512 505 L512 330"/><path d="M512 518 L318 440"/><path d="M505 532 L302 650"/><path d="M517 538 L412 815"/><path d="M524 530 L726 652"/></g>`;
  const body = `
  <g transform="rotate(-7 512 570)" filter="url(#shadowS)">
    <path d="M512 250 C545 333 556 380 585 420 C635 417 716 375 790 370 C744 435 690 492 655 525 C676 581 737 661 790 728 C701 698 632 665 585 635 C548 680 531 776 512 860 C489 773 470 682 437 636 C384 668 307 708 223 733 C278 658 343 579 367 526 C333 491 274 430 228 365 C309 378 387 416 438 421 C470 375 489 323 512 250 Z" fill="#b94a2e" stroke="#6d281f" stroke-width="14"/>
    <path d="M512 282 C536 348 550 399 572 438 C630 438 693 407 749 397 C706 449 660 493 624 532 C648 584 688 640 733 689 C666 667 612 641 566 610 C538 652 524 723 512 798 C494 720 482 654 456 609 C412 640 357 670 294 691 C337 638 377 583 398 532 C363 491 318 447 279 399 C335 407 397 440 451 438 C474 399 492 347 512 282 Z" fill="#d85f35"/>
    ${ridge}
    <g opacity=".78"><path d="M447 451 Q512 420 577 451 Q610 500 584 566 Q512 612 438 566 Q415 505 447 451Z" fill="#9e3a28"/></g>
    ${knobs.join('')}
    <g fill="#6f2c25" opacity=".72">${Array.from({length:44},(_,i)=>{const a=i*137.5*Math.PI/180; const r=90+(i%7)*26; const x=512+Math.cos(a)*r; const y=545+Math.sin(a)*r*.86; return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${4+(i%3)}"/>`;}).join('')}</g>
  </g>`;
  return wrap('S', body, 720);
};

const porkfish = () => {
  const stripes = [420,447,474,501,528].map((y,i)=>`<path d="M260 ${y} C365 ${y-18} 500 ${y-10} 635 ${y+2}" fill="none" stroke="${i%2?'#f2cc3b':'#5bc5ce'}" stroke-width="12" stroke-linecap="round" opacity=".95"/>`).join('');
  const body = `
  <g filter="url(#shadowP)">
    <path d="M166 515 C118 462 86 425 52 397 C70 470 68 552 48 630 C93 592 128 562 172 535 Z" fill="#e6a924" stroke="#9c6a19" stroke-width="10"/>
    <path d="M176 520 C202 382 338 304 541 314 C718 322 846 404 871 499 C848 612 716 681 517 684 C326 685 208 628 176 520Z" fill="#e9be3b" stroke="#7b702d" stroke-width="12"/>
    <path d="M188 533 C268 589 414 617 581 596 C694 582 783 545 858 497 C829 615 698 681 517 684 C329 686 216 634 188 533Z" fill="#98c8bf" opacity=".68"/>
    ${stripes}
    <path d="M295 337 C380 270 520 270 635 318 C545 314 430 326 324 367Z" fill="#d07d25" opacity=".9"/>
    <path d="M330 670 C398 730 480 740 548 681Z" fill="#d99121" stroke="#8a5d16" stroke-width="7"/>
    <path d="M594 680 C651 733 711 720 742 653Z" fill="#e4a126" stroke="#8a5d16" stroke-width="7"/>
    <path d="M745 378 C790 357 840 383 870 423 L872 510 C837 457 800 432 754 424Z" fill="#dec145" opacity=".7"/>
    <path d="M741 346 C725 428 724 571 749 638" fill="none" stroke="#2b3132" stroke-width="30" opacity=".9"/>
    <path d="M804 369 C787 423 787 520 807 584" fill="none" stroke="#202728" stroke-width="28" opacity=".92"/>
    <circle cx="816" cy="430" r="29" fill="#e6cf67"/><circle cx="816" cy="430" r="18" fill="#142225"/><circle cx="810" cy="423" r="5" fill="#f4ffff"/>
    <path d="M862 482 Q900 493 868 514 Q842 514 829 503 Q842 488 862 482Z" fill="#f4d968" stroke="#7c6b32" stroke-width="5"/>
    <path d="M665 389 Q700 442 684 555" fill="none" stroke="#b39b4d" stroke-width="5" opacity=".75"/>
  </g>`;
  return wrap('P', body, 730);
};

const conch = () => {
  const weather = Array.from({length:45},(_,i)=>{const a=i*2.41; const rx=170*(.15+(i%9)/10); const ry=140*(.18+((i*3)%10)/11); const x=520+Math.cos(a)*rx; const y=480+Math.sin(a)*ry; return `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${6+(i%4)*3}" ry="${4+(i%3)*2}" fill="${i%3===0?'#55745d':'#806b4f'}" opacity=".35"/>`;}).join('');
  const body = `
  <g filter="url(#shadowC)">
    <ellipse cx="525" cy="782" rx="265" ry="48" fill="#51463b" opacity=".35"/>
    <path d="M311 600 C270 543 282 448 335 395 C389 340 456 327 520 334 C562 281 653 284 703 338 C736 374 741 426 721 463 C785 485 821 542 805 608 C792 661 752 697 700 703 C637 709 583 691 537 663 C493 694 417 714 356 688 C326 675 310 647 311 600Z" fill="#a9916d" stroke="#62533e" stroke-width="14"/>
    <path d="M520 341 C570 293 646 306 680 349 C711 389 703 441 671 470 C635 500 588 500 550 479 C517 456 494 408 520 341Z" fill="#c4aa7c" stroke="#766047" stroke-width="9"/>
    <path d="M331 586 C294 531 310 459 359 423 C407 386 474 389 520 425 C559 456 578 510 564 557 C544 616 481 659 414 656 C373 654 345 629 331 586Z" fill="#bca37e"/>
    <path d="M535 656 C604 632 680 618 760 631 C746 699 686 755 608 768 C557 777 513 757 481 724 C498 695 514 674 535 656Z" fill="#d58a6e" stroke="#7f5a47" stroke-width="11"/>
    <path d="M570 666 C630 650 684 652 730 663 C698 711 650 733 600 732 C579 715 570 692 570 666Z" fill="#f2a28f" opacity=".85"/>
    <path d="M548 711 C500 737 443 748 384 731 C398 773 443 798 503 796 C562 794 609 774 634 739 C603 723 574 713 548 711Z" fill="#6e6750"/>
    <path d="M512 682 C483 701 453 710 423 714" fill="none" stroke="#938a65" stroke-width="24" stroke-linecap="round"/>
    <path d="M478 697 C455 648 447 607 452 571" fill="none" stroke="#7e7b5f" stroke-width="17" stroke-linecap="round"/>
    <path d="M551 692 C572 646 584 605 582 565" fill="none" stroke="#7e7b5f" stroke-width="17" stroke-linecap="round"/>
    <circle cx="452" cy="566" r="14" fill="#161d1c" stroke="#d7bd87" stroke-width="5"/><circle cx="582" cy="560" r="14" fill="#161d1c" stroke="#d7bd87" stroke-width="5"/>
    <path d="M516 716 C542 705 561 690 575 672" fill="none" stroke="#655c48" stroke-width="17" stroke-linecap="round"/>
    ${weather}
    <g fill="#d4bd8d" opacity=".7"><path d="M347 426 l-24 -34 l42 16Z"/><path d="M402 373 l-14 -45 l39 28Z"/><path d="M474 347 l8 -50 l29 47Z"/><path d="M597 316 l21 -38 l13 48Z"/><path d="M675 362 l35 -23 l-14 46Z"/></g>
  </g>`;
  return wrap('C', body, 705);
};

const octopus = () => {
  const armPaths = [
    ['M560 570 C455 600 330 690 185 810',58],['M575 590 C470 690 402 800 354 935',56],['M600 600 C565 720 545 855 532 965',58],['M625 596 C690 710 732 830 760 946',60],['M645 570 C760 635 846 728 920 840',62],['M650 540 C785 555 880 610 965 690',58],['M575 545 C445 548 335 535 220 570',55],['M604 525 C545 475 470 432 382 404',54]
  ];
  const arms = armPaths.map(([d,w],i)=>`<path d="${d}" fill="none" stroke="${i%3===0?'#73b0a0':i%3===1?'#6fa493':'#8eaa93'}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
  const suckers=[];
  for(let i=0;i<10;i++){ const t=i/10; const x=560*(1-t)+185*t; const y=570*(1-t)+810*t; suckers.push(`<circle cx="${x+10}" cy="${y+10}" r="7" fill="#e7c7b4"/><circle cx="${x-10}" cy="${y-6}" r="6" fill="#efd2bd"/>`); }
  for(let i=0;i<10;i++){ const t=i/10; const x=575*(1-t)+354*t; const y=590*(1-t)+935*t; suckers.push(`<circle cx="${x+9}" cy="${y}" r="7" fill="#e5c1ad"/><circle cx="${x-9}" cy="${y-8}" r="6" fill="#f0cfb9"/>`); }
  const specks = Array.from({length:62},(_,i)=>{const a=i*2.17; const r=35+(i%9)*13; const x=610+Math.cos(a)*r; const y=405+Math.sin(a)*r*.72; return `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${3+(i%4)}" fill="${i%3===0?'#8b4b3d':i%3===1?'#d4c2ad':'#2c817c'}" opacity=".65"/>`;}).join('');
  const body = `
  <g filter="url(#shadowO)">
    ${arms}
    <path d="M505 560 C520 492 548 456 570 438 C526 403 521 354 542 310 C565 261 611 240 658 251 C711 263 744 307 741 356 C739 405 711 444 674 461 C691 500 680 548 650 582 C606 612 548 604 505 560Z" fill="#72ad9e" stroke="#365d59" stroke-width="13"/>
    <path d="M535 558 C540 501 560 468 585 447 C543 401 544 350 566 317 C590 280 635 268 672 286 C710 305 727 348 713 389 C701 425 675 448 643 459 C667 499 657 542 630 566 C598 587 562 583 535 558Z" fill="#8ab7a6" opacity=".9"/>
    <path d="M532 563 C573 523 632 513 677 540 C658 584 615 614 567 607 C548 596 536 580 532 563Z" fill="#3b8f89" opacity=".72"/>
    <path d="M538 540 C505 566 479 600 463 642 C521 606 575 594 630 610 C615 563 582 540 538 540Z" fill="#3e8e86" opacity=".48"/>
    ${specks}
    <ellipse cx="680" cy="354" rx="25" ry="20" fill="#6b302c" stroke="#d59d77" stroke-width="8"/><ellipse cx="683" cy="353" rx="10" ry="13" fill="#111819"/><circle cx="687" cy="347" r="4" fill="#fff3d8"/>
    <ellipse cx="594" cy="361" rx="23" ry="18" fill="#6b302c" stroke="#d59d77" stroke-width="8"/><ellipse cx="592" cy="360" rx="9" ry="12" fill="#111819"/><circle cx="595" cy="355" r="4" fill="#fff3d8"/>
    <g>${suckers.join('')}</g>
  </g>`;
  return wrap('O', body, 750);
};

const assets = {
  'caribbean-cushion-sea-star': seaStar(),
  'porkfish': porkfish(),
  'queen-conch': conch(),
  'caribbean-reef-octopus': octopus(),
};

const browser = await chromium.launch(launchOptions());
try {
  const page = await browser.newPage({ viewport: { width: 1024, height: 1024 }, deviceScaleFactor: 1 });
  for (const [id, svg] of Object.entries(assets)) {
    await page.setContent(`<style>html,body{margin:0;background:#0a6277}svg{display:block}</style>${svg}`, { waitUntil: 'load' });
    await page.screenshot({ path: join(outDir, `${id}.png`), clip: { x: 0, y: 0, width: 1024, height: 1024 } });
    console.log(`[issue39] rendered ${id}`);
  }
} finally {
  await browser.close();
}
