/**
 * Poseidon starter creature artwork.
 *
 * Each entry maps to a stable creature ID in content/mexican-caribbean so the
 * asset pipeline, the content pack and the application agree without any
 * per-creature application code. Species that are not in this list are a
 * first-class "no artwork" state, not an error.
 */
import { BODY, FIN, gradient } from './shapes.mjs';
import { INK, document_, eye, highlight, mouth, shade, spots } from './style.mjs';

function fins(color, names, opacity = 1) {
  return `<g fill="${color}" opacity="${opacity}">${names.map((n) => `<path d="${FIN[n]}"/>`).join('')}</g>`;
}

/** Composes a fish from the shared archetypes. */
function fish({
  id,
  shape,
  base,
  deep,
  fin,
  behind = ['tailCrescent', 'dorsalSail', 'analFin'],
  front = ['pectoral'],
  frontFin,
  pattern = '',
  eyeAt,
  eyeRadius = 22,
  mouthPath,
  extras = '',
  transform,
}) {
  const clip = `clip-${id}`;
  const body = BODY[shape];
  return `  <defs>
    ${gradient(`g-${id}`, base, deep)}
    <clipPath id="${clip}"><path d="${body}"/></clipPath>
  </defs>
  <g${transform ? ` transform="${transform}"` : ''}>
    ${fins(fin, behind)}
    <path d="${body}" fill="url(#g-${id})"/>
    <g clip-path="url(#${clip})">
      ${pattern}
    </g>
    ${fins(frontFin ?? fin, front)}
    ${mouthPath ? mouth(mouthPath) : ''}
    ${eye(eyeAt[0], eyeAt[1], eyeRadius)}
    ${extras}
  </g>`;
}

/** Vertical bars clipped to a body, used by damselfish/sergeant major/angelfish. */
function bars(xs, color, width = 46, opacity = 0.85) {
  return xs
    .map((x) => `<rect x="${x}" y="180" width="${width}" height="664" fill="${color}" opacity="${opacity}"/>`)
    .join('');
}

/** Horizontal stripes clipped to a body, used by grunts and surgeonfish. */
function stripes(ys, color, height = 26, opacity = 0.8) {
  return ys
    .map((y) => `<rect x="150" y="${y}" width="780" height="${height}" fill="${color}" opacity="${opacity}"/>`)
    .join('');
}

// ---------------------------------------------------------------------------
// Sea turtles
// ---------------------------------------------------------------------------

function turtle({ id, shellLight, shellDeep, skin, skinDeep, scute, beak }) {
  const shell =
    'M 300 520 C 300 384 410 288 550 288 C 698 288 776 384 776 520 C 776 656 692 748 550 748 C 410 748 300 656 300 520 Z';
  return `  <defs>
    ${gradient(`g-${id}`, shellLight, shellDeep)}
    ${gradient(`s-${id}`, skin, skinDeep)}
    <clipPath id="clip-${id}"><path d="${shell}"/></clipPath>
  </defs>
  <g>
    <!-- rear flipper -->
    <path d="M 372 664 C 330 726 336 786 386 812 C 424 780 440 720 428 668 Z" fill="url(#s-${id})"/>
    <!-- upper front flipper, behind the shell -->
    <path d="M 664 400 C 762 344 838 262 850 186 C 772 200 690 268 640 366 Z" fill="url(#s-${id})"/>
    <!-- neck and head -->
    <path d="M 700 430 C 762 396 826 392 872 414 C 918 436 924 486 890 512 C 852 542 780 538 718 508 Z" fill="url(#s-${id})"/>
    ${beak}
    <path d="${shell}" fill="url(#g-${id})"/>
    <g clip-path="url(#clip-${id})" fill="none" stroke="${scute}" stroke-width="12" opacity="0.55" stroke-linejoin="round">
      <path d="M 538 300 L 620 360 L 604 470 L 470 470 L 456 360 Z"/>
      <path d="M 470 470 L 604 470 L 620 590 L 538 650 L 456 590 Z"/>
      <path d="M 620 360 L 742 330 L 786 460 L 604 470 Z"/>
      <path d="M 456 360 L 330 336 L 292 464 L 470 470 Z"/>
      <path d="M 604 470 L 786 460 L 744 630 L 620 590 Z"/>
      <path d="M 470 470 L 292 464 L 336 630 L 456 590 Z"/>
    </g>
    <path d="${shell}" fill="none" stroke="${shellDeep}" stroke-width="14" opacity="0.5"/>
    <!-- lower front flipper -->
    <path d="M 662 606 C 758 636 830 706 852 800 C 776 812 686 772 634 690 Z" fill="url(#s-${id})"/>
    ${highlight('M 380 380 C 440 320 540 296 620 306 C 528 330 442 366 392 414 Z', 0.22)}
    ${eye(862, 446, 20)}
  </g>`;
}

// ---------------------------------------------------------------------------
// Rays (drawn from above — the recognisable view for a diver)
// ---------------------------------------------------------------------------

function ray({ id, base, deep, belly, disc, tail, pattern = '', snout }) {
  return `  <defs>
    ${gradient(`g-${id}`, base, deep, 0, 0, 0.2, 1)}
    <clipPath id="clip-${id}"><path d="${disc}"/></clipPath>
  </defs>
  <g>
    <path d="${tail}" fill="${deep}"/>
    <path d="${disc}" fill="url(#g-${id})"/>
    <g clip-path="url(#clip-${id})">
      ${pattern}
      ${shade('M 120 512 C 300 470 720 470 904 512 C 720 500 300 500 120 512 Z', INK, 0.05)}
    </g>
    ${snout ? `<path d="${snout}" fill="${belly}"/>` : ''}
    ${eye(452, 316, 17)}
    ${eye(574, 316, 17)}
  </g>`;
}

// ---------------------------------------------------------------------------
// Creature set
// ---------------------------------------------------------------------------

export const creatures = [
  {
    id: 'green-sea-turtle',
    title: 'Green sea turtle',
    art: () =>
      turtle({
        id: 'gst',
        shellLight: '#6FA46A',
        shellDeep: '#3F6E4A',
        skin: '#8FB177',
        skinDeep: '#5C7F55',
        scute: '#2F5A3E',
        beak: '<path d="M 884 424 C 916 420 936 434 936 452 C 936 470 916 482 886 478 Z" fill="#D9DEC2"/>',
      }),
  },
  {
    id: 'hawksbill-sea-turtle',
    title: 'Hawksbill sea turtle',
    art: () =>
      turtle({
        id: 'hst',
        shellLight: '#D89B43',
        shellDeep: '#94571F',
        skin: '#C29257',
        skinDeep: '#8A5C2C',
        scute: '#6E3A12',
        beak: '<path d="M 880 420 C 926 414 956 436 950 460 C 944 484 910 490 878 480 Z" fill="#E8D9AE"/>',
      }),
  },
  {
    id: 'spotted-eagle-ray',
    title: 'Spotted eagle ray',
    art: () =>
      ray({
        id: 'ser',
        base: '#2C4E77',
        deep: '#132B47',
        belly: '#E8EEF3',
        disc:
          'M 512 236 C 566 236 606 268 618 320 C 726 342 856 424 946 552 C 858 596 720 594 620 570 C 606 618 566 646 512 646 C 458 646 418 618 404 570 C 304 594 166 596 78 552 C 168 424 298 342 406 320 C 418 268 458 236 512 236 Z',
        tail:
          'M 486 600 C 480 706 486 828 512 944 C 538 828 544 706 538 600 Z',
        snout: 'M 470 252 C 470 226 554 226 554 252 C 554 268 470 268 470 252 Z',
        pattern: spots(
          [
            [300, 452, 1], [372, 500, 0.8], [246, 512, 0.7], [430, 430, 0.9], [470, 512, 0.8],
            [724, 452, 1], [652, 500, 0.8], [778, 512, 0.7], [594, 430, 0.9], [554, 512, 0.8],
            [352, 546, 0.6], [672, 546, 0.6], [512, 470, 0.7], [512, 560, 0.6], [206, 470, 0.55], [818, 470, 0.55],
          ],
          17,
          '#EAF4F8',
          0.92,
        ),
      }),
  },
  {
    id: 'southern-stingray',
    title: 'Southern stingray',
    art: () =>
      ray({
        id: 'sst',
        base: '#B0A183',
        deep: '#7A6B52',
        belly: '#EFE7D5',
        disc:
          'M 512 248 C 594 254 660 294 710 352 C 798 394 878 452 920 518 C 862 582 774 630 684 660 C 622 690 570 710 512 716 C 454 710 402 690 340 660 C 250 630 162 582 104 518 C 146 452 226 394 314 352 C 364 294 430 254 512 248 Z',
        tail:
          'M 486 690 C 474 772 490 872 512 964 C 534 872 550 772 538 690 Z',
        snout: 'M 472 288 C 472 258 552 258 552 288 C 552 308 472 308 472 288 Z',
        pattern: `${shade(
          'M 512 292 C 620 300 730 356 830 440 C 720 396 616 372 512 368 C 408 372 304 396 194 440 C 294 356 404 300 512 292 Z',
          '#FFFFFF',
          0.24,
        )}${shade('M 512 604 C 640 604 760 588 880 552 C 800 626 700 668 600 692 C 570 706 542 714 512 718 C 482 714 454 706 424 692 C 324 668 224 626 144 552 C 264 588 384 604 512 604 Z', INK, 0.12)}
        <ellipse cx="512" cy="452" rx="118" ry="150" fill="#C6B79A" opacity="0.22"/>`,
      }),
  },
  {
    id: 'nurse-shark',
    title: 'Nurse shark',
    art: () => {
      const body =
        'M 176 476 C 250 434 388 412 566 418 C 704 424 806 448 872 490 C 894 504 894 520 872 534 C 806 578 704 602 566 608 C 388 614 250 592 176 550 Z';
      return `  <defs>
    ${gradient('g-ns', '#C29A6C', '#8A6742')}
    <clipPath id="clip-ns"><path d="${body}"/></clipPath>
  </defs>
  <g>
    <path d="M 206 512 C 154 468 100 396 74 314 C 82 414 100 468 118 512 C 100 556 84 604 78 668 C 116 606 160 556 206 512 Z" fill="#9B7449"/>
    <path d="M 300 452 C 348 358 428 316 496 322 C 452 366 412 414 388 462 Z" fill="#9B7449"/>
    <path d="M 214 470 C 246 402 296 372 344 376 C 314 406 288 438 272 476 Z" fill="#9B7449"/>
    <path d="M 250 560 C 292 622 344 646 392 640 C 358 610 326 580 306 552 Z" fill="#9B7449"/>
    <path d="${body}" fill="url(#g-ns)"/>
    <g clip-path="url(#clip-ns)">
      ${highlight('M 176 552 C 320 600 700 606 890 540 C 700 640 320 640 176 600 Z', 0.4)}
    </g>
    <path d="M 604 546 C 596 634 626 690 686 716 C 716 662 714 588 690 542 Z" fill="#B08858"/>
    ${mouth('M 828 566 C 856 574 878 570 890 558', 12)}
    <path d="M 848 590 C 852 626 838 650 816 656" fill="none" stroke="#C7A377" stroke-width="12" stroke-linecap="round"/>
    <path d="M 880 586 C 888 618 876 640 856 648" fill="none" stroke="#C7A377" stroke-width="12" stroke-linecap="round"/>
    ${eye(806, 486, 18)}
  </g>`;
    },
  },
  {
    id: 'great-barracuda',
    title: 'Great barracuda',
    art: () =>
      fish({
        id: 'gbc',
        shape: 'torpedo',
        base: '#C3D2DC',
        deep: '#6E8496',
        fin: '#5C7385',
        behind: ['tailForked'],
        front: [],
        pattern: `${shade('M 232 512 C 380 452 700 424 902 470 C 700 460 380 470 232 512 Z', '#2E4657', 0.55)}
        ${spots(
          [[360, 540, 1], [440, 552, 1], [520, 556, 1], [600, 552, 1], [680, 544, 0.9]],
          16,
          '#4C6376',
          0.55,
        )}`,
        eyeAt: [832, 496],
        eyeRadius: 20,
        mouthPath: 'M 872 528 C 890 534 900 532 906 524',
        extras: `<g fill="#5C7385">
          <path d="M 470 462 C 512 400 566 380 610 390 C 562 410 514 440 492 470 Z"/>
          <path d="M 318 486 C 350 440 392 426 422 434 C 388 452 354 472 336 494 Z"/>
          <path d="M 400 548 C 434 604 480 622 514 614 C 478 596 442 572 422 550 Z"/>
          <path d="M 560 556 C 582 606 616 626 646 622 C 618 604 590 580 576 558 Z"/>
        </g>
        <path d="M 862 520 C 890 522 906 518 914 512 C 902 534 878 544 858 540 Z" fill="#8FA3B2"/>`,
      }),
  },
  {
    id: 'green-moray',
    title: 'Green moray',
    art: () => `  <defs>
    ${gradient('g-gm', '#6E9A4E', '#3C6238')}
  </defs>
  <g>
    <path d="M 118 800 C 268 792 322 668 292 566 C 258 452 330 342 470 314 C 592 290 690 320 782 372"
      fill="none" stroke="url(#g-gm)" stroke-width="104" stroke-linecap="round"/>
    <path d="M 292 566 C 258 452 330 342 470 314 C 592 290 690 320 782 372" fill="none" stroke="#84B25E" stroke-width="134" stroke-linecap="round" opacity="0.3"/>
    <path d="M 104 812 C 194 802 248 764 278 712 C 246 800 182 846 100 844 Z" fill="#4E7A40"/>
    <path d="M 118 800 C 200 796 250 758 276 706" fill="none" stroke="#4E7A40" stroke-width="52" stroke-linecap="round"/>
    <path d="M 300 560 C 268 452 340 352 470 326 C 590 304 686 334 776 386"
      fill="none" stroke="#FFFFFF" stroke-width="16" stroke-linecap="round" opacity="0.22"/>
    <path d="M 742 320 C 828 314 902 356 918 412 C 930 456 900 490 848 496 C 792 502 736 476 712 434 C 694 402 700 350 742 320 Z" fill="url(#g-gm)"/>
    <path d="M 796 460 C 846 476 890 470 918 444 C 912 486 872 508 826 504 C 792 500 772 484 762 464 Z" fill="#20361F"/>
    <g fill="#F2F5E6">
      <path d="M 812 462 L 824 486 L 836 462 Z"/>
      <path d="M 852 462 L 864 484 L 876 462 Z"/>
      <path d="M 890 456 L 900 474 L 908 452 Z"/>
    </g>
    ${eye(796, 388, 19)}
  </g>`,
  },
  {
    id: 'queen-angelfish',
    title: 'Queen angelfish',
    art: () =>
      fish({
        id: 'qaf',
        shape: 'disc',
        base: '#2E86C8',
        deep: '#14538F',
        fin: '#F2B21E',
        behind: ['tailFan', 'dorsalSail', 'analFin'],
        front: [],
        pattern: `${shade('M 296 512 C 400 700 700 760 830 700 C 760 800 380 790 296 640 Z', '#0E3E70', 0.5)}
        <path d="M 704 250 C 806 302 846 422 830 548 C 886 420 834 282 704 250 Z" fill="#F2B21E" opacity="0.95"/>
        <path d="M 300 468 C 344 446 396 450 424 478 C 386 474 340 486 306 512 Z" fill="#F2B21E" opacity="0.9"/>
        ${spots(
          [[430, 430, 1], [500, 380, 0.9], [560, 440, 1], [470, 520, 0.9], [620, 500, 0.8], [540, 570, 0.85], [400, 560, 0.8], [660, 400, 0.75]],
          15,
          '#7FD8E8',
          0.5,
        )}`,
        eyeAt: [756, 430],
        eyeRadius: 24,
        mouthPath: 'M 812 486 C 824 494 828 502 826 510',
        extras: `<path d="M 626 552 C 604 634 622 690 668 716 C 700 664 704 596 682 552 Z" fill="#7FD0EC" opacity="0.75"/>
        <path d="M 690 316 C 736 300 776 316 786 350 C 748 336 714 336 690 348 Z" fill="#3FA9D6" opacity="0.7"/>`,
      }),
  },
  {
    id: 'french-angelfish',
    title: 'French angelfish',
    art: () =>
      fish({
        id: 'faf',
        shape: 'disc',
        base: '#3B4048',
        deep: '#1C2027',
        fin: '#22262C',
        behind: ['tailFan', 'dorsalSail', 'analFin'],
        front: ['pectoral'],
        pattern: spots(
          [
            [400, 420, 1], [470, 372, 0.9], [540, 420, 1], [612, 380, 0.85], [676, 440, 0.9],
            [400, 520, 0.95], [470, 476, 0.9], [540, 520, 1], [612, 480, 0.85], [676, 540, 0.9],
            [430, 620, 0.9], [500, 580, 0.85], [570, 620, 0.9], [640, 590, 0.8], [720, 500, 0.8],
            [360, 470, 0.8], [360, 570, 0.75], [500, 680, 0.8], [600, 680, 0.75],
          ],
          16,
          '#F4C64A',
          0.85,
        ),
        eyeAt: [760, 424],
        eyeRadius: 24,
        mouthPath: 'M 816 480 C 828 490 830 500 828 508',
        extras:
          '<path d="M 300 470 C 340 460 372 470 388 492 C 348 486 320 490 300 502 Z" fill="#F4C64A" opacity="0.9"/>',
      }),
  },
  {
    id: 'stoplight-parrotfish',
    title: 'Stoplight parrotfish',
    art: () =>
      fish({
        id: 'spf',
        shape: 'chunky',
        base: '#2E9E93',
        deep: '#17635F',
        fin: '#1E7F78',
        behind: ['tailFan', 'dorsalLow', 'analLow'],
        front: ['pectoral'],
        frontFin: '#3FB6A6',
        pattern: `${shade('M 258 560 C 420 700 700 700 820 560 C 760 720 380 730 258 620 Z', '#0F4B48', 0.45)}
        <path d="M 700 330 C 800 360 830 470 812 540 C 862 450 812 350 700 330 Z" fill="#E4665C" opacity="0.85"/>
        <path d="M 660 620 C 740 640 790 610 816 566 C 806 640 730 690 650 674 Z" fill="#F0B23E" opacity="0.85"/>
        ${spots([[420, 420, 1], [500, 392, 0.9], [580, 420, 0.9], [460, 500, 0.85], [540, 480, 0.8], [620, 500, 0.8]], 14, '#8FE0D0', 0.4)}`,
        eyeAt: [742, 434],
        eyeRadius: 24,
        extras: `<path d="M 806 470 C 846 470 866 490 866 512 C 866 534 846 554 806 554 C 790 534 790 490 806 470 Z" fill="#EFE4C8"/>
        ${mouth('M 812 512 C 838 512 856 512 866 512', 9)}
        <path d="M 690 350 C 736 336 776 350 790 380 C 750 366 716 366 690 380 Z" fill="#E4665C" opacity="0.6"/>`,
      }),
  },
  {
    id: 'porcupinefish',
    title: 'Porcupinefish',
    art: () => {
      const body = BODY.sphere;
      const spineAngles = [];
      for (let i = 0; i < 26; i += 1) spineAngles.push((i / 26) * Math.PI * 2);
      const cx = 528;
      const cy = 520;
      const spikes = spineAngles
        .map((a) => {
          const rx = 268;
          const ry = 232;
          const x = cx + Math.cos(a) * rx;
          const y = cy + Math.sin(a) * ry;
          const tx = cx + Math.cos(a) * (rx + 62);
          const ty = cy + Math.sin(a) * (ry + 62);
          const nx = -Math.sin(a) * 22;
          const ny = Math.cos(a) * 22;
          return `<path d="M ${(x + nx).toFixed(1)} ${(y + ny).toFixed(1)} L ${tx.toFixed(1)} ${ty.toFixed(1)} L ${(x - nx).toFixed(1)} ${(y - ny).toFixed(1)} Z" fill="#B8955F"/>`;
        })
        .join('');
      return `  <defs>
    ${gradient('g-pcf', '#D9BD8A', '#A98A5B')}
    <clipPath id="clip-pcf"><path d="${body}"/></clipPath>
  </defs>
  <g>
    ${spikes}
    <path d="M 320 700 C 268 760 252 812 274 848 C 322 826 358 782 374 736 Z" fill="#C2A272"/>
    <path d="M 300 340 C 250 300 216 258 214 214 C 268 234 320 276 350 322 Z" fill="#C2A272"/>
    <path d="${body}" fill="url(#g-pcf)"/>
    <g clip-path="url(#clip-pcf)">
      ${highlight('M 262 600 C 400 720 680 730 818 600 C 760 760 380 770 262 660 Z', 0.28)}
      ${spots(
        [
          [370, 400, 1], [450, 360, 0.85], [530, 396, 0.9], [610, 372, 0.8],
          [340, 500, 0.9], [420, 470, 0.8], [500, 500, 0.9], [580, 470, 0.75], [660, 490, 0.7],
          [380, 600, 0.85], [470, 580, 0.8], [560, 610, 0.85], [650, 580, 0.7],
          [430, 680, 0.8], [540, 690, 0.75],
        ],
        20,
        '#5E4A2C',
        0.7,
      )}
    </g>
    <path d="M 700 560 C 740 620 736 668 706 692 C 682 654 678 604 686 566 Z" fill="#C2A272"/>
    ${mouth('M 788 546 C 806 556 812 566 810 576', 12)}
    ${eye(722, 458, 30)}
  </g>`;
    },
  },
  {
    id: 'caribbean-reef-squid',
    title: 'Caribbean reef squid',
    art: () => `  <defs>
    ${gradient('g-crs', '#8FE3DA', '#3FA5A8')}
    ${gradient('a-crs', '#7ED2CD', '#3C9BA0')}
  </defs>
  <g>
    <path d="M 258 300 C 200 274 156 274 132 300 C 168 336 214 356 264 360 Z" fill="#A9EDE6" opacity="0.9"/>
    <path d="M 258 452 C 200 478 156 478 132 452 C 168 416 214 396 264 392 Z" fill="#A9EDE6" opacity="0.9"/>
    <path d="M 244 376 C 244 296 330 240 452 240 C 574 240 662 296 662 376 C 662 456 574 512 452 512 C 330 512 244 456 244 376 Z" fill="url(#g-crs)"/>
    <path d="M 300 320 C 360 288 500 282 590 306 C 500 306 372 314 306 340 Z" fill="#FFFFFF" opacity="0.4"/>
    <path d="M 618 342 C 700 336 748 372 748 420 C 748 470 698 502 632 496 C 586 492 556 456 560 414 C 564 374 584 346 618 342 Z" fill="url(#a-crs)"/>
    <g stroke="url(#a-crs)" fill="none" stroke-linecap="round">
      <path d="M 700 470 C 776 508 830 566 864 640" stroke-width="46"/>
      <path d="M 706 448 C 792 466 858 506 908 562" stroke-width="42"/>
      <path d="M 700 500 C 752 560 780 630 786 706" stroke-width="40"/>
      <path d="M 674 508 C 696 580 694 650 668 718" stroke-width="38"/>
      <path d="M 640 506 C 632 578 606 640 566 690" stroke-width="34"/>
      <path d="M 706 424 C 794 420 868 442 924 480" stroke-width="32"/>
    </g>
    <path d="M 866 632 C 908 638 930 664 922 694 C 912 726 876 734 852 712 Z" fill="#5FBDBE"/>
    <path d="M 904 554 C 946 554 966 580 958 610 C 948 640 914 648 892 628 Z" fill="#5FBDBE"/>
    ${spots([[360, 350, 1], [430, 320, 0.8], [500, 356, 0.9], [560, 326, 0.7], [400, 420, 0.8], [520, 430, 0.75]], 14, '#F2A6B8', 0.55)}
    ${eye(650, 404, 30, '#0E3A44')}
  </g>`,
  },
  {
    id: 'caribbean-spiny-lobster',
    title: 'Caribbean spiny lobster',
    art: () => `  <defs>
    ${gradient('g-csl', '#B85A44', '#7B3226')}
  </defs>
  <g>
    <g stroke="#8E4534" fill="none" stroke-linecap="round" stroke-width="20">
      <path d="M 700 400 C 812 320 900 240 946 152"/>
      <path d="M 706 460 C 830 428 926 392 986 344"/>
    </g>
    <g stroke="#93503C" fill="none" stroke-linecap="round" stroke-width="22">
      <path d="M 560 560 C 546 646 500 704 430 730"/>
      <path d="M 460 560 C 440 650 392 706 320 728"/>
      <path d="M 640 552 C 640 640 604 700 540 736"/>
      <path d="M 560 400 C 542 320 494 268 428 246"/>
      <path d="M 460 402 C 434 322 386 274 318 254"/>
    </g>
    <path d="M 574 336 C 690 336 764 412 764 480 C 764 548 690 606 574 606 C 486 606 430 548 430 476 C 430 404 486 336 574 336 Z" fill="url(#g-csl)"/>
    <g fill="url(#g-csl)">
      <path d="M 380 356 C 452 356 470 420 470 476 C 470 532 452 592 380 592 C 330 592 306 534 306 474 C 306 414 330 356 380 356 Z"/>
      <path d="M 276 368 C 344 368 360 424 360 476 C 360 528 344 580 276 580 C 230 580 208 530 208 474 C 208 418 230 368 276 368 Z"/>
    </g>
    <path d="M 214 380 C 150 330 106 300 60 288 C 92 350 96 420 82 470 C 96 522 92 594 60 660 C 108 646 152 616 214 566 Z" fill="#A34E3B"/>
    <g fill="#F3D9A8" opacity="0.85">
      <circle cx="640" cy="410" r="20"/>
      <circle cx="700" cy="470" r="18"/>
      <circle cx="640" cy="540" r="20"/>
      <circle cx="560" cy="400" r="16"/>
      <circle cx="560" cy="556" r="16"/>
      <circle cx="380" cy="404" r="17"/>
      <circle cx="380" cy="548" r="17"/>
      <circle cx="272" cy="410" r="15"/>
      <circle cx="272" cy="542" r="15"/>
    </g>
    ${highlight('M 470 350 C 580 330 700 366 754 434 C 680 388 560 366 470 380 Z', 0.25)}
    ${eye(716, 424, 20)}
    ${eye(716, 530, 20)}
  </g>`,
  },
  {
    id: 'longsnout-seahorse',
    title: 'Longsnout seahorse',
    art: () => `  <defs>
    ${gradient('g-lsh', '#F0A048', '#B85E1C')}
  </defs>
  <g>
    <path d="M 618 322 C 540 288 452 322 436 400 C 420 476 470 522 506 568 C 548 622 556 686 520 728 C 486 766 428 764 402 730 C 380 700 394 662 428 654"
      fill="none" stroke="url(#g-lsh)" stroke-width="108" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M 560 300 C 640 268 706 276 736 316 C 762 352 748 400 706 416 C 660 434 606 416 584 380 C 566 352 570 318 560 300 Z" fill="url(#g-lsh)"/>
    <path d="M 726 316 C 790 322 852 344 892 376 C 846 396 782 396 726 380 Z" fill="#E88F32"/>
    <path d="M 884 366 C 908 366 922 378 920 392 C 918 408 900 414 878 406 Z" fill="#D97F26"/>
    <path d="M 604 264 C 610 216 640 188 676 190 C 660 216 650 244 652 272 Z" fill="#D97F26"/>
    <path d="M 664 236 C 700 216 736 220 754 244 C 722 244 692 254 672 270 Z" fill="#D97F26"/>
    <path d="M 470 470 C 542 492 580 552 570 620 C 532 586 494 550 466 520 Z" fill="#F8C078" opacity="0.9"/>
    <g fill="none" stroke="#B85E1C" stroke-width="13" stroke-linecap="round" opacity="0.35">
      <path d="M 452 358 C 490 334 542 336 574 362"/>
      <path d="M 442 448 C 480 432 516 440 540 466"/>
      <path d="M 486 542 C 522 532 552 546 568 574"/>
      <path d="M 522 646 C 556 644 580 662 590 690"/>
      <path d="M 428 716 C 456 700 484 708 498 730"/>
    </g>
    ${spots([[492, 372, 1], [472, 452, 0.8], [520, 528, 0.8], [546, 634, 0.75], [452, 712, 0.7], [640, 348, 0.7]], 13, '#FBD9A8', 0.7)}
    ${eye(668, 340, 23)}
  </g>`,
  },
  {
    id: 'blue-tang',
    title: 'Blue tang',
    art: () => {
      const body =
        'M 292 512 C 292 372 408 276 556 276 C 700 276 806 366 826 484 C 830 504 830 520 826 540 C 806 658 700 748 556 748 C 408 748 292 652 292 512 Z';
      return `  <defs>
    ${gradient('g-bt', '#3F8BE8', '#12489C')}
    <clipPath id="clip-bt"><path d="${body}"/></clipPath>
  </defs>
  <g>
    <path d="M 320 512 C 268 468 214 424 176 372 C 200 448 200 576 176 652 C 214 600 268 556 320 512 Z" fill="#F2C33C"/>
    <path d="M 336 512 C 300 480 262 446 232 410 C 250 468 250 556 232 614 C 262 578 300 544 336 512 Z" fill="#0E3C86"/>
    <path d="M 380 350 C 470 268 640 250 754 306 C 640 314 476 346 412 400 Z" fill="#0E3C86"/>
    <path d="M 386 676 C 470 754 636 772 748 720 C 636 712 478 680 416 628 Z" fill="#0E3C86"/>
    <path d="${body}" fill="url(#g-bt)"/>
    <g clip-path="url(#clip-bt)">
      ${highlight('M 300 380 C 420 300 640 288 760 336 C 620 336 420 366 320 430 Z', 0.22)}
      ${spots([[430, 420, 1], [510, 382, 0.8], [590, 420, 0.9], [470, 500, 0.8], [556, 470, 0.7], [640, 500, 0.6]], 14, '#93C6F7', 0.35)}
    </g>
    <path d="M 638 548 C 612 626 630 686 676 712 C 706 662 710 592 690 548 Z" fill="#78B4F0" opacity="0.85"/>
    ${mouth('M 812 500 C 826 508 830 516 828 526', 12)}
    ${eye(752, 432, 25)}
  </g>`;
    },
  },
  {
    id: 'lionfish',
    title: 'Lionfish',
    art: () => {
      const rays = [];
      for (let i = 0; i < 7; i += 1) {
        const a = -1.85 + (i / 6) * 1.1;
        const x = 520 + Math.cos(a) * 40;
        const y = 400 + Math.sin(a) * 40;
        const tx = 520 + Math.cos(a) * 330;
        const ty = 400 + Math.sin(a) * 330;
        rays.push(
          `<path d="M ${x.toFixed(0)} ${y.toFixed(0)} L ${tx.toFixed(0)} ${ty.toFixed(0)}" stroke="#F2E4CE" stroke-width="20" stroke-linecap="round"/>`,
        );
      }
      for (let i = 0; i < 5; i += 1) {
        const a = 0.5 + (i / 4) * 1.0;
        const x = 500 + Math.cos(a) * 40;
        const y = 620 + Math.sin(a) * 40;
        const tx = 500 + Math.cos(a) * 300;
        const ty = 620 + Math.sin(a) * 300;
        rays.push(
          `<path d="M ${x.toFixed(0)} ${y.toFixed(0)} L ${tx.toFixed(0)} ${ty.toFixed(0)}" stroke="#F2E4CE" stroke-width="18" stroke-linecap="round"/>`,
        );
      }
      return `  <defs>
    ${gradient('g-lf', '#C0503F', '#8A2B22')}
    <clipPath id="clip-lf"><path d="${BODY.oval}"/></clipPath>
  </defs>
  <g>
    <g opacity="0.95">${rays.join('')}</g>
    <path d="M 306 512 C 254 470 200 424 158 372 C 186 448 186 578 158 654 C 200 602 254 556 306 512 Z" fill="#D8C3A6"/>
    <path d="${BODY.oval}" fill="url(#g-lf)"/>
    <g clip-path="url(#clip-lf)">
      ${bars([320, 420, 520, 620, 720], '#F6EBD8', 40, 0.9)}
    </g>
    <path d="M 626 548 C 596 630 616 690 668 716 C 700 664 704 594 682 548 Z" fill="#EBD8BC" opacity="0.9"/>
    ${mouth('M 812 552 C 828 560 834 566 832 574', 12)}
    ${eye(760, 466, 24)}
    <path d="M 786 424 C 812 400 840 398 856 412 C 830 418 806 430 792 444 Z" fill="#F0DFC4"/>
  </g>`;
    },
  },
  {
    id: 'sergeant-major',
    title: 'Sergeant major',
    art: () =>
      fish({
        id: 'sm',
        shape: 'oval',
        base: '#F2D66B',
        deep: '#D9A93C',
        fin: '#E9C558',
        behind: ['tailForked', 'dorsalLow', 'analLow'],
        front: ['pectoral'],
        pattern: `${bars([340, 450, 560, 670, 780], '#26313C', 42, 0.9)}
        ${shade('M 268 560 C 420 700 700 700 824 560 C 760 700 400 720 268 620 Z', '#8FC0D8', 0.45)}`,
        eyeAt: [762, 466],
        eyeRadius: 22,
        mouthPath: 'M 812 528 C 826 534 832 542 830 550',
      }),
  },
  {
    id: 'french-grunt',
    title: 'French grunt',
    art: () =>
      fish({
        id: 'fg',
        shape: 'oval',
        base: '#F5D97A',
        deep: '#D9A83C',
        fin: '#F0C955',
        behind: ['tailForked', 'dorsalLow', 'analLow'],
        front: ['pectoral'],
        pattern: `${stripes([352, 404, 456, 508, 560, 612], '#5FA8D8', 20, 0.75)}
        ${shade('M 268 340 C 420 300 700 310 824 400 C 700 356 420 350 268 400 Z', '#8FC7E8', 0.45)}`,
        eyeAt: [758, 462],
        eyeRadius: 22,
        mouthPath: 'M 812 522 C 826 528 832 536 830 544',
      }),
  },
];

export function renderCreature(entry) {
  return document_(entry.title, entry.art());
}
