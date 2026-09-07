/**
 * Shared body archetypes. Fins are drawn behind the body so that small
 * imprecision at the join is hidden by the silhouette, which keeps the set
 * consistent without hand-tuning every intersection.
 */

export const BODY = {
  oval:
    'M 268 512 C 300 392 424 316 574 322 C 700 328 792 406 824 512 C 792 618 700 696 574 702 C 424 708 300 632 268 512 Z',
  disc:
    'M 296 512 C 296 356 412 250 566 250 C 716 250 826 356 826 512 C 826 668 716 776 566 776 C 412 776 296 668 296 512 Z',
  torpedo:
    'M 232 512 C 284 460 424 430 622 440 C 762 448 858 476 902 512 C 858 548 762 576 622 584 C 424 594 284 564 232 512 Z',
  sphere:
    'M 262 522 C 262 388 378 288 530 288 C 668 288 762 366 786 464 C 800 480 812 496 818 512 C 812 528 800 544 786 560 C 762 660 668 752 530 752 C 378 752 262 656 262 522 Z',
  chunky:
    'M 258 512 C 292 384 418 314 566 318 C 694 322 786 394 822 486 C 832 510 830 520 816 538 C 782 628 690 702 566 706 C 418 710 292 640 258 512 Z',
};

export const FIN = {
  tailCrescent:
    'M 306 512 C 254 462 196 406 152 340 C 186 446 186 578 152 684 C 196 618 254 562 306 512 Z',
  tailFan:
    'M 330 512 C 286 474 240 436 204 392 C 228 466 228 558 204 632 C 240 588 286 550 330 512 Z',
  tailForked:
    'M 300 512 C 246 470 186 424 138 372 C 176 430 200 470 208 512 C 200 554 176 594 138 652 C 186 600 246 554 300 512 Z',
  dorsalSail:
    'M 420 404 C 498 288 630 256 730 306 C 638 332 512 374 452 438 Z',
  dorsalLow:
    'M 452 380 C 530 306 640 288 716 322 C 640 340 530 372 476 414 Z',
  analFin:
    'M 428 618 C 468 708 546 744 618 728 C 552 698 490 658 456 620 Z',
  analLow:
    'M 452 640 C 500 706 570 730 630 720 C 570 694 512 668 480 640 Z',
  pectoral:
    'M 626 548 C 600 628 616 684 662 712 C 694 664 698 594 678 548 Z',
  pectoralHigh:
    'M 618 476 C 590 402 606 348 650 322 C 684 368 690 436 670 480 Z',
};

/** Simple linear gradient between a base colour and its darker shade. */
export function gradient(id, from, to, x1 = 0, y1 = 0, x2 = 0, y2 = 1) {
  return `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">
      <stop offset="0" stop-color="${from}"/>
      <stop offset="1" stop-color="${to}"/>
    </linearGradient>`;
}
