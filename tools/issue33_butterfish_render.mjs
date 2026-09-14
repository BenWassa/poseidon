import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { launchOptions } from './chromium.mjs';

const outDir = 'tmp_issue33_butterfish';
await mkdir(outDir, { recursive: true });

const defs = (s) => `
<defs>
  <linearGradient id="water${s}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#a3f2ea"/><stop offset="0.32" stop-color="#4ac8cf"/><stop offset="0.70" stop-color="#13879f"/><stop offset="1" stop-color="#07566f"/>
  </linearGradient>
  <radialGradient id="sun${s}" cx="18%" cy="8%" r="72%">
    <stop offset="0" stop-color="#fffbd6" stop-opacity=".98"/><stop offset=".27" stop-color="#e8fbf2" stop-opacity=".42"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="sand${s}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#ddd0a8"/><stop offset="1" stop-color="#998667"/>
  </linearGradient>
  <filter id="shadow${s}" x="-35%" y="-35%" width="170%" height="190%">
    <feGaussianBlur in="SourceAlpha" stdDeviation="15" result="b"/><feOffset dx="0" dy="20" result="o"/><feColorMatrix in="o" type="matrix" values="0 0 0 0 0.01 0 0 0 0 0.16 0 0 0 0 0.20 0 0 0 .48 0"/><feBlend in="SourceGraphic"/>
  </filter>
  <filter id="soft${s}"><feGaussianBlur stdDeviation="4"/></filter>
</defs>`;

const bg = (s, floor = 728, coral = true) => `
<rect width="1024" height="1024" fill="url(#water${s})"/>
<rect width="1024" height="1024" fill="url(#sun${s})"/>
<g opacity=".2" fill="none" stroke="#effff7" stroke-width="12" stroke-linecap="round" filter="url(#soft${s})">
  <path d="M-20 150 C190 98 310 210 500 145 S820 92 1055 170"/>
  <path d="M-35 286 C180 218 300 336 500 267 S810 215 1060 302"/>
</g>
<path d="M0 ${floor} C170 ${floor-36} 302 ${floor+26} 472 ${floor-8} S790 ${floor+24} 1024 ${floor-28} L1024 1024 L0 1024Z" fill="url(#sand${s})"/>
<g opacity=".34" fill="#315f59"><ellipse cx="90" cy="830" rx="78" ry="44"/><ellipse cx="900" cy="806" rx="95" ry="55"/><ellipse cx="780" cy="915" rx="62" ry="34"/><ellipse cx="250" cy="930" rx="58" ry="31"/></g>
${coral ? `<g opacity=".62" fill="none" stroke="#3d806f" stroke-width="8" stroke-linecap="round"><path d="M70 930 Q86 842 70 777 M105 941 Q130 838 148 778 M922 938 Q945 830 920 760 M963 944 Q984 850 1004 792"/><path d="M76 852 l-32 -36 M78 847 l37 -42 M128 852 l-28 -42 M940 842 l-34 -42 M946 834 l30 -50"/></g>` : ''}
<g opacity=".46" fill="#fff7cf"><circle cx="108" cy="218" r="7"/><circle cx="190" cy="316" r="4"/><circle cx="846" cy="206" r="5"/><circle cx="916" cy="352" r="4"/><circle cx="690" cy="128" r="4"/></g>`;

const wrap = (s, body, floor = 728, coral = true) => `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">${defs(s)}${bg(s,floor,coral)}${body}<rect width="1024" height="1024" fill="none" stroke="#063e50" stroke-opacity=".08" stroke-width="22"/></svg>`;

const bandedButterflyfish = () => wrap('B', `<g filter="url(#shadowB)" transform="translate(0 -15)"><path d="M196 520 L90 430 Q58 512 90 602 L200 548Z" fill="#e9cf48" stroke="#635d2c" stroke-width="10"/><path d="M192 518 C225 352 372 276 568 297 C735 315 850 405 866 505 C847 621 708 703 528 706 C347 709 220 638 192 518Z" fill="#e8e5d5" stroke="#4e5451" stroke-width="12"/><path d="M214 511 C247 380 365 327 536 331 C688 335 794 404 833 501 C797 598 676 661 526 662 C362 663 245 609 214 511Z" fill="#f6f2df" opacity=".88"/><path d="M264 371 C350 294 509 276 641 321 C553 322 416 333 311 404Z" fill="#dfc83b" opacity=".88"/><path d="M285 654 C377 720 492 735 594 696 C505 688 400 670 310 624Z" fill="#dfc83b" opacity=".82"/><path d="M220 456 Q205 517 222 583" fill="none" stroke="#191e20" stroke-width="48"/><path d="M388 340 Q356 506 390 676" fill="none" stroke="#202529" stroke-width="54"/><path d="M558 320 Q528 510 562 691" fill="none" stroke="#222629" stroke-width="54"/><path d="M750 363 Q719 505 754 639" fill="none" stroke="#202428" stroke-width="52"/><path d="M801 391 Q835 438 847 493" fill="none" stroke="#151a1c" stroke-width="29"/><circle cx="823" cy="442" r="28" fill="#e7cb54"/><circle cx="823" cy="442" r="17" fill="#0e1718"/><circle cx="817" cy="436" r="5" fill="#f4ffff"/><path d="M846 492 Q904 505 853 529 Q819 525 796 511 Q814 494 846 492Z" fill="#f4df93" stroke="#6a6547" stroke-width="6"/></g>`, 735, true);

const barJack = () => wrap('J', `<g filter="url(#shadowJ)" transform="rotate(-3 510 510)"><path d="M194 507 L74 408 L111 506 L72 612 L198 543Z" fill="#91bfc5" stroke="#456d75" stroke-width="11"/><path d="M186 520 C256 405 414 345 612 364 C756 379 842 433 893 499 C846 580 724 624 568 628 C399 632 264 593 186 520Z" fill="#bcd5d5" stroke="#526b6c" stroke-width="11"/><path d="M205 510 C310 444 443 417 610 424 C722 428 806 456 864 501 C805 548 699 577 558 580 C410 582 292 557 205 510Z" fill="#e0e8e1" opacity=".82"/><path d="M305 401 C418 345 585 344 698 383 C581 379 454 395 339 432Z" fill="#8dbcc5" opacity=".82"/><path d="M374 624 C450 668 528 673 596 626Z" fill="#7fa8ae" stroke="#4d7277" stroke-width="7"/><path d="M610 622 C682 663 744 649 782 594Z" fill="#7ba5ad" stroke="#4d7277" stroke-width="7"/><circle cx="835" cy="470" r="26" fill="#ced99a"/><circle cx="835" cy="470" r="15" fill="#112226"/><circle cx="830" cy="465" r="5" fill="#f5ffff"/><path d="M873 500 Q918 512 878 529 Q850 526 832 514 Q847 501 873 500Z" fill="#e4e1c4" stroke="#68716a" stroke-width="5"/><path d="M831 430 C752 399 650 386 541 390 C418 394 302 425 216 471" fill="none" stroke="#1988b9" stroke-width="17" stroke-linecap="round"/><path d="M216 471 C174 500 143 529 86 589" fill="none" stroke="#1988b9" stroke-width="17" stroke-linecap="round"/><path d="M704 401 C575 380 438 394 312 433 C250 452 211 471 179 490 C145 515 117 541 86 576" fill="none" stroke="#151d22" stroke-width="13" stroke-linecap="round"/></g>`, 748, false);

const blueChromis = () => wrap('C', `<g filter="url(#shadowC)" transform="translate(5 -18)"><path d="M208 513 L88 414 L124 506 L86 610 L210 548Z" fill="#1d4f98" stroke="#0a326d" stroke-width="10"/><path d="M194 518 C232 402 354 335 531 340 C698 344 817 405 861 498 C819 594 701 652 532 653 C365 654 238 602 194 518Z" fill="#107ed0" stroke="#0b4a8a" stroke-width="11"/><path d="M214 510 C266 432 375 389 526 389 C676 389 785 430 831 499 C788 570 683 607 532 609 C381 610 269 575 214 510Z" fill="#188fd8" opacity=".86"/><path d="M315 361 C410 322 559 326 673 365 C578 360 447 371 343 404Z" fill="#0d65ba" opacity=".86"/><path d="M320 629 C418 673 566 674 667 631 C575 641 440 638 350 607Z" fill="#0d65ba" opacity=".86"/><path d="M91 414 L124 506 M86 610 L124 506" fill="none" stroke="#111f3c" stroke-width="14"/><path d="M315 361 Q400 327 489 340 M320 629 Q410 665 493 650" fill="none" stroke="#111f3c" stroke-width="12"/><circle cx="805" cy="461" r="25" fill="#9fe0ea"/><circle cx="805" cy="461" r="14" fill="#071b2b"/><circle cx="801" cy="456" r="5" fill="#f6ffff"/><path d="M838 496 Q882 506 844 525 Q817 520 800 509 Q814 496 838 496Z" fill="#79cae4" stroke="#10578a" stroke-width="5"/></g>`, 730, true);

const bluestripedGrunt = () => { const stripes = [418,448,478,508,538,568].map((y,i)=>`<path d="M270 ${y} C390 ${y-26} 535 ${y-22} 730 ${y+(i-2)*4}" fill="none" stroke="#1a74b9" stroke-width="14" stroke-linecap="round"/>`).join(''); return wrap('G', `<g filter="url(#shadowG)" transform="translate(0 -12)"><path d="M195 520 L72 423 L114 517 L72 614 L198 548Z" fill="#1c2530" stroke="#11161d" stroke-width="10"/><path d="M184 520 C229 400 372 338 559 349 C721 358 829 421 871 503 C832 596 700 651 536 653 C358 655 230 606 184 520Z" fill="#e5c447" stroke="#685d28" stroke-width="11"/><path d="M210 513 C266 432 382 393 544 395 C684 396 784 437 838 502 C788 570 681 608 535 609 C383 610 269 574 210 513Z" fill="#f0d456" opacity=".9"/>${stripes}<path d="M304 368 C405 324 565 325 691 374 C594 361 451 371 337 409Z" fill="#202733" stroke="#161c25" stroke-width="6"/><path d="M645 387 C718 384 783 418 832 455 C783 435 724 427 659 433Z" fill="#202733" opacity=".96"/><path d="M355 642 C436 687 530 689 609 647Z" fill="#dcb638" stroke="#7a6220" stroke-width="7"/><path d="M621 643 C688 680 747 668 783 613Z" fill="#dcb638" stroke="#7a6220" stroke-width="7"/><circle cx="816" cy="461" r="27" fill="#e8dc88"/><circle cx="816" cy="461" r="16" fill="#172029"/><circle cx="811" cy="456" r="5" fill="#f5ffff"/><path d="M850 500 Q897 512 855 531 Q827 528 807 514 Q824 501 850 500Z" fill="#e8cf64" stroke="#766a34" stroke-width="5"/></g>`, 742, true); };

const hogfish = () => wrap('H', `<g filter="url(#shadowH)" transform="rotate(-2 510 510)"><path d="M190 525 L66 444 L112 526 L73 624 L198 560Z" fill="#b87972" stroke="#704744" stroke-width="10"/><path d="M180 524 C224 390 360 324 556 342 C698 355 806 421 852 497 C825 582 726 646 574 667 C392 692 242 624 180 524Z" fill="#e3b9a8" stroke="#72504c" stroke-width="12"/><path d="M213 518 C266 428 381 388 542 393 C664 396 761 432 817 498 C777 557 690 602 568 620 C418 642 292 595 213 518Z" fill="#f0d7c7" opacity=".78"/><path d="M733 399 Q779 420 807 455" fill="none" stroke="#3b282d" stroke-width="32" opacity=".85"/><path d="M213 514 Q185 540 161 571" fill="none" stroke="#4c3337" stroke-width="36" opacity=".9"/><path d="M670 374 C686 341 707 291 716 222 M623 366 C632 325 640 277 635 210 M576 360 C580 320 576 274 559 220" fill="none" stroke="#6a403f" stroke-width="19" stroke-linecap="round"/><circle cx="788" cy="447" r="25" fill="#d0a968"/><circle cx="788" cy="447" r="14" fill="#1b1d20"/><circle cx="783" cy="442" r="5" fill="#f8ffff"/><path d="M817 481 C861 479 900 488 933 507 C891 523 852 528 812 518 Q828 500 817 481Z" fill="#d6a486" stroke="#74504c" stroke-width="6"/><path d="M339 644 C423 705 511 714 596 663Z" fill="#b77972" stroke="#734744" stroke-width="7"/><path d="M618 651 C680 692 739 677 775 618Z" fill="#a96c69" stroke="#704744" stroke-width="7"/></g>`, 748, true);

const queenParrotfish = () => wrap('Q', `<g filter="url(#shadowQ)" transform="translate(0 -10)"><path d="M187 520 L58 430 L103 518 L58 620 L193 551Z" fill="#d7868f" stroke="#6d4951" stroke-width="10"/><path d="M179 520 C220 390 367 322 570 343 C724 360 828 425 866 505 C830 595 704 652 537 655 C356 658 225 608 179 520Z" fill="#40a995" stroke="#245f5f" stroke-width="12"/><path d="M205 512 C270 424 392 389 552 394 C690 399 786 437 834 503 C785 568 679 606 533 610 C379 612 270 576 205 512Z" fill="#56b69d" opacity=".9"/><path d="M307 363 C411 319 570 328 687 377 C592 362 452 373 336 407Z" fill="#258da1"/><path d="M350 645 C440 690 535 687 615 647Z" fill="#278da0" stroke="#215e70" stroke-width="7"/><path d="M625 642 C694 680 753 663 790 606Z" fill="#2a8fa1" stroke="#215e70" stroke-width="7"/><path d="M104 436 L67 469 M103 518 L62 530 M95 596 L61 582" stroke="#f0a0aa" stroke-width="20" stroke-linecap="round"/><path d="M819 467 Q842 487 849 505" fill="none" stroke="#1b7eaa" stroke-width="34" stroke-linecap="round"/><path d="M812 444 C755 390 696 363 640 348" fill="none" stroke="#197ea7" stroke-width="22" stroke-linecap="round"/><path d="M798 448 C741 418 682 397 614 392" fill="none" stroke="#d98691" stroke-width="15" stroke-linecap="round" opacity=".85"/><circle cx="798" cy="449" r="27" fill="#e4c968"/><circle cx="798" cy="449" r="15" fill="#10262c"/><circle cx="793" cy="444" r="5" fill="#f6ffff"/><path d="M836 492 Q886 505 846 530 Q816 530 790 515 Q808 494 836 492Z" fill="#d8d7c4" stroke="#48655f" stroke-width="6"/><path d="M818 489 Q842 501 859 507" stroke="#1b7eaa" stroke-width="11" stroke-linecap="round"/></g>`, 736, true);

const sharpnosePuffer = () => { const spots = Array.from({length:34},(_,i)=>{const x=330+(i%9)*48+(Math.floor(i/9)%2)*18; const y=422+Math.floor(i/9)*48+(i%3)*8; const r=4+(i%3); return `<circle cx="${x}" cy="${y}" r="${r}" fill="#2f9ac2" opacity=".9"/>`;}).join(''); return wrap('S', `<g filter="url(#shadowS)" transform="translate(0 -12)"><path d="M215 517 L108 449 L130 520 L108 592 L217 548Z" fill="#e4c84b" stroke="#665c2b" stroke-width="9"/><path d="M205 520 C244 410 358 365 510 374 C662 383 769 432 812 501 C773 578 659 626 509 629 C355 633 248 591 205 520Z" fill="#a7885f" stroke="#594b38" stroke-width="11"/><path d="M224 523 C279 502 368 493 480 497 C607 500 703 516 784 532 C744 590 638 618 510 620 C368 623 271 589 224 523Z" fill="#d6c35d" opacity=".88"/><path d="M756 451 Q795 470 825 499" fill="none" stroke="#7d6549" stroke-width="30"/><path d="M798 486 C844 480 880 490 910 510 C876 529 841 535 801 526 Q817 505 798 486Z" fill="#b99768" stroke="#5f503d" stroke-width="6"/><circle cx="770" cy="462" r="28" fill="#d7c45c"/><circle cx="770" cy="462" r="16" fill="#182027"/><circle cx="765" cy="456" r="5" fill="#f7ffff"/><path d="M747 433 Q780 407 812 433 M749 444 Q784 423 817 448 M788 479 Q829 469 866 489 M790 492 Q833 486 875 505" fill="none" stroke="#27a7d0" stroke-width="7" stroke-linecap="round"/>${spots}<path d="M129 460 L111 487 M129 520 L108 520 M128 580 L110 554" stroke="#17202a" stroke-width="21" stroke-linecap="round"/><path d="M118 452 Q145 510 118 590" fill="none" stroke="#161d25" stroke-width="17"/><path d="M147 466 Q164 520 145 576" fill="none" stroke="#f3e29a" stroke-width="17"/></g>`, 746, false); };

const images = new Map([
  ['banded-butterflyfish', bandedButterflyfish()],
  ['bar-jack', barJack()],
  ['blue-chromis', blueChromis()],
  ['bluestriped-grunt', bluestripedGrunt()],
  ['hogfish', hogfish()],
  ['queen-parrotfish', queenParrotfish()],
  ['sharpnose-puffer', sharpnosePuffer()],
]);

const browser = await chromium.launch(launchOptions);
try {
  const page = await browser.newPage({ viewport: { width: 1024, height: 1024 }, deviceScaleFactor: 1 });
  for (const [id, svg] of images) {
    await page.setContent(`<html><body style="margin:0;background:#073f51">${svg}</body></html>`);
    await page.locator('svg').screenshot({ path: join(outDir, `${id}.png`) });
    console.log(id);
  }
} finally {
  await browser.close();
}
