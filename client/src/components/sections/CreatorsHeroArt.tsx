import { useEffect, useState } from 'react';
import '@/styles/creators-hero-art.css';

// How often the camera fires; each shot moves one cloud (they take turns) on to its next note.
const SHOT_MS = 3600;

// Rays of the camera flash, as angles in degrees around the flash window.
const RAYS = [0, 45, 90, 135, 180, 225, 270, 315];

// A puffy cloud drawn for a 3:1 box, bumps all the way round.
const CLOUD_PATH = 'M52 92C28 94 10 80 12 62C13 48 26 40 40 41C38 24 54 12 72 15C82 3 106-1 122 8C134-1 160-1 172 10C186 2 210 4 220 18C236 14 254 22 258 38C278 38 292 52 288 68C285 84 270 92 254 90C244 98 224 99 212 92C200 99 178 99 166 92C152 99 128 99 116 92C104 99 80 99 70 92C64 94 58 94 52 92Z';

type Cloud ={ side: 'left' | 'right'; lines: string[]; shown: number };

// Creators hero: a photographer taking pictures, with thought clouds that write short notes on either side.
export default function CreatorsHeroArt({ left, right }: { left: string[]; right: string[] }) {
  const [turn, setTurn] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => setTurn((t) => t + 1), SHOT_MS);
    return () => window.clearInterval(id);
  }, []);

  // `shown` counts how many notes a cloud has moved through, so a note that comes round again still re-writes itself.
  const clouds: Cloud[] = [
    { side: 'left', lines: left, shown: Math.ceil(turn / 2) },
    { side: 'right', lines: right, shown: Math.floor(turn / 2) },
  ];

  return (
    <div className="cha">
      {clouds.filter((cloud) => cloud.lines.length > 0).map(({ side, lines, shown }) => {
        const active = shown % lines.length;
        return (
          <div key={side} className={`cha-cloud is-${side}`} aria-hidden="true">
            <i className="cha-dot" />
            <i className="cha-dot" />
            <div key={shown} className={`cha-cloud-body${shown === 0 ? ' is-first' : ''}`}>
              {/* Stretched to fit the note; the outline keeps its width however wide the cloud gets. */}
              <svg className="cha-cloud-shape" viewBox="0 0 300 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id={`cha-cloud-fill-${side}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset=".55" stopColor="#FFFFFF" />
                    <stop offset="1" stopColor="#E9EEF6" />
                  </linearGradient>
                </defs>
                <path d={CLOUD_PATH} fill={`url(#cha-cloud-fill-${side})`} vectorEffect="non-scaling-stroke" />
              </svg>
              {/* Every note sits in the same spot, so the cloud keeps the width of the longest one. */}
              <p className="cha-cloud-text">
                {lines.map((line, i) => (
                  <span key={i} className={i === active ? 'is-active' : undefined}>
                    {i === active ? line.split('').map((ch, j) => <span key={j} style={{ '--i': j } as React.CSSProperties}>{ch}</span>) : line}
                  </span>
                ))}
              </p>
            </div>
          </div>
        );
      })}

      <svg className="cha-art" viewBox="0 0 1035 514" role="img" aria-label="Illustration of a photographer taking a picture">
        <defs>
          <radialGradient id="cha-flash-glow">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset=".35" stopColor="#FFF6C9" stopOpacity=".9" />
            <stop offset="1" stopColor="#FFDE59" stopOpacity="0" />
          </radialGradient>
        </defs>

        <path className="cha-blob is-left" d="M20 560C-10 520-12 440 10 405C35 368 70 347 110 343C170 340 222 392 252 398C292 403 322 404 348 405V560Z" />
        <path className="cha-blob is-right" d="M700 560V420C740 360 792 312 846 288C902 266 966 258 1006 272C1046 288 1046 350 1032 402C1018 452 994 504 962 560Z" />

        {/* Parts reach below the frame (y > 514) so nothing lifts off the bottom edge while he breathes. */}
        <g className="cha-body" stroke="#1C1C1C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path className="is-sleeve" stroke="none" d="M404 242L282 238C252 249 214 268 178 293C150 313 126 332 118 352C112 372 113 396 123 411C134 426 156 434 178 433C216 430 262 413 300 399C318 392 334 387 352 383Z" />
          <path className="is-vest" stroke="none" d="M330 560L333 406C338 378 348 356 360 334C376 304 388 272 398 244C500 236 600 228 650 230C668 231 680 236 692 243C696 330 716 440 742 560Z" />
          <path className="is-sleeve" stroke="none" d="M455 240C454 270 455 292 460 310C466 326 474 338 482 345C496 358 520 369 543 371C560 371.5 578 364 592 352C598 347 603 343 607 338L625 300V240Z" />
          <path className="is-skin" stroke="none" d="M469 240C469 270 469 288 472 301C476 315 483 324 492 332C503 342 518 350 530 352.5C543 355 560 352 574 344C586 337 596 330 604 322L615 300V240Z" />

          <path className="is-ink cha-loop" stroke="none" d="M417 312C413 345 409 380 409.5 406C410 430 412 450 420 465C428 478 440 484 455 485C475 485 495 474 512 458C535 436 555 404 570 370C576 356 580 346 583 338H569C562 356 552 378 536 404C520 428 502 450 482 464C470 472 456 477 446 476C436 474 428 468 424 458C418 444 417 425 418 406C419 380 422 345 426 312Z" />
          <path className="is-ink" stroke="none" d="M412 236H462C455 268 441 298 426 320C412 340 404 356 398 375C388 410 372 455 364 490L358 560H322C326 505 336 455 348 420C356 390 366 358 374 330C384 298 398 268 412 236Z" />
          <path className="is-ink" stroke="none" d="M598 192C610 189 622 193 632 203C646 220 660 245 670 268C690 320 720 420 742 560H702C696 520 690 490 676 465C660 435 640 405 626 370C614 340 604 300 598 260C594 235 594 210 598 192Z" />

          <path className="is-sleeve" stroke="none" d="M690 243C705 244 725 254 745 268C780 293 830 345 868 395C885 418 896 442 895 465C894 490 882 505 862 520L850 560H790C770 530 745 500 725 482C705 462 686 440 672 420C664 408 662 395 664 380L684 300C682 280 684 258 690 243Z" />
          <path fill="none" d="M693 304C704 306 714 312 719 322C723 336 720 352 714 366C708 382 698 398 686 410C680 414 672 414 666 410C660 405 655 396 651 386M718 319C760 335 800 355 833 378" />
          <path className="is-ink" stroke="none" d="M647 364C652 378 658 387 666 390C670 389 672 386 673 382H666C659 377 652 371 647 364Z" />
          <path fill="none" d="M243 254C232 272 232 298 244 318C256 336 280 346 300 340C312 334 318 318 317 304M294 344C284 368 263 388 241 403" />
          <path className="is-ink" stroke="none" d="M296 320C305 317 313 309 318 298C320 310 317 322 306 327C302 325 299 323 296 320ZM262 247C268 242 276 240 283 239C277 246 269 250 262 252Z" />

          <path className="is-skin" stroke="none" d="M437 120C436 90 445 66 470 62C500 58 560 58 585 66C600 80 606 110 606 150C607 190 605 225 596 250C588 268 570 275 540 276C505 276 480 268 465 252C448 232 438 180 437 120Z" />
          <path className="is-skin" stroke="none" d="M603 145C612 138 624 138 628 148C632 160 628 178 618 188C612 192 606 193 603 190Z" />
          <path fill="none" d="M617 157C611 158 608 164 609 171C610 175 612 177 614 178M605 190V206" />
          <path className="is-hair" stroke="none" d="M411 105C409 95 409 82 410 75C411 66 412 60 414 58C417 54 419 53 422 52C426 51 429 51 431 51C434 51 437 51.5 440 52C440 46 440 41 440 37C441 31 442 26 444 22C447 17 449 14 452 11C458 7 464 5 470 4C477 2 484 1 490 1C497 2 504 3 510 5C515 7 520 9 525 10C532 12 539 13 545 14C552 14 559 13 565 12C571 12 576 14 580 16C584 19 585 22 585 25C585 29 585 33 584 37C583 39 582 40 581 40C586 40 592 41 597 42C602 44 606 47 610 50C614 53 617 56 619 60C621 63 622 66 621 69C620 71 618 72 616 71C613 71 611 70 610 70C612 74 615 78 617 82C619 88 621 94 621 100C621 106 620 112 619 117C617 122 614 126 610 130C608 136 606 142 605 147C603 140 601 132 600 125C597 116 594 108 590 100C586 91 583 83 580 75C578 70 577 67 577 65C573 70 569 73 565 75C558 77 552 78 545 79C538 79 531 78 525 77C516 75 506 73 497 72C489 71 482 70 475 70C469 70 464 70 460 71C455 72 451 74 447 77C444 81 443 85 442 90C441 97 440 104 439 110Z" />

          {/* Camera */}
          <path fill="#FFFFFF" d="M483 98H535C537 98 538.5 99 539 101L545.5 129.5H475.5L481 101C481.5 99 482 98 483 98Z" />
          <rect className="is-ink" stroke="none" x="488" y="104.5" width="40" height="19.5" />
          <rect fill="#FFFFFF" x="431" y="119.5" width="27" height="10.5" rx="2" />
          <path fill="#FFFFFF" stroke="none" d="M399 129.5H591C593 129.5 595 131.5 595 133.5V222H591L586 238.5C585.5 239.5 585 240 584 240H399C397 240 395 238 395 236V133.5C395 131.5 397 129.5 399 129.5Z" />
          <rect className="is-ink" stroke="none" x="395" y="156.5" width="200" height="65.5" />
          <path fill="none" d="M399 129.5H591C593 129.5 595 131.5 595 133.5V222H591L586 238.5C585.5 239.5 585 240 584 240H399C397 240 395 238 395 236V133.5C395 131.5 397 129.5 399 129.5Z" />
          <rect className="is-ink" stroke="none" x="568" y="137" width="9" height="8.5" />
          <g stroke="none">
            <circle cx="505.2" cy="185.4" r="55.3" fill="#111111" />
            <circle className="is-sleeve" cx="505.2" cy="185.4" r="54.2" />
            <circle cx="505.2" cy="185.4" r="49.7" fill="#FFFFFF" />
            <circle className="is-ink" cx="505.2" cy="185.4" r="44.8" />
            {/* Re-mounted on every shot so the aperture closes and opens again. */}
            <g key={turn} className={`cha-iris${turn === 0 ? ' is-first' : ''}`}>
              <circle className="is-sleeve" cx="505.2" cy="185.4" r="39.4" />
              <circle className="is-ink" cx="505.2" cy="185.4" r="32.6" />
            </g>
            <g className="cha-glint" fill="#FFFFFF">
              <circle cx="494.5" cy="174.3" r="9.7" />
              <ellipse cx="515" cy="187.4" rx="5" ry="8.6" transform="rotate(10 515 187.4)" />
            </g>
          </g>

          <path className="is-skin" d="M264.6 246C279 239 299 227 308.5 222C313 210 316 196 318 188C321 175 325 160 331 151C337 140 345 130 352 124C357 117 364 108 372 106C382 103 394 103 401 104.8C412 107 424 111 430 115C435 118 435 122 431.7 124.5C427 127.5 418 128.5 411 126.7C404 125 395 125 388 126C385 127 383 127.5 381.7 128.5L382 141C388 142.5 394 143 400 144.2C410 146 418 150 423 156C428 162 431 170 431 178C431 185 427 190.5 422 190.5C419 190.5 416 189 414.5 187C417 192 418.5 199 418.5 205C418.5 212 416 217 412 219.5C412.5 226 410 231 406 233.5C400 236.5 391 235.5 386.5 232C383.5 229 381.5 225 381 222C377 222 374 223 372.5 224C371 236 369 246 364.6 253.5C359 262 350 267 342.7 268C336 269.5 331 275 325 285C318 297 306 311 295 319.4C284 318 274 311 268 303C261 293 258 280 259.5 266C260 258 262 250 264.6 246Z" />
          <path fill="none" d="M369.5 120.6C373 124 377 127 381.7 128.5M356 145.7C368 143.5 378 142.5 382 141.5M357.3 167C372 168.5 390 170 403.7 173.5C408 175 411 178 414.5 187M356 189C372 192 390 196 400 200C406 203 410 209 411.5 217M370 222.5C378 220.5 388 218.5 395 218M333 162C334 158 337 156 343 154.5M338.5 176C339 172.5 341 170.5 345 169.5M341.5 199C341.5 195 343.5 192.5 348 191M397.6 161L398 172M403.7 166L403.5 172.5M399 193L398.5 197.5M308.5 222C307.5 226 306.8 229 306 232" />

          <path className="is-skin" stroke="none" d="M569 169.5C566 171 563.5 175 564 180C564.5 190 568 202 573 211C576 217 580 223 585 229L590.5 238.6C560 239.5 520 239 490 238.6C475 238.6 465 239 460 241C456 243 456 247 460 248.5C466 251 472 253 476 258C477 262 476 266 475 270.7C478 280 482 286 486 289C494 296 505 304 519 308.8C526 310.5 531 311 537 310.5C539 314 541 318 543 322C547 326 551 328.5 554.8 330C561 333 567 336 573.8 337.4C582 339 590 340.5 597.6 341C606 341.5 612 342.5 616.7 343.3C628 351 640 361 648 367C655 373 661 378 666 382C672 378 680 370 686 360C691 350 694 336 695 320C694 312 692 307 688 303C683 303 674 298 664 291C656 285 650 280 647.6 276.7C643 266 640 258 635.7 250.5C632 241 629 234 626 229C621 222 618 218 614 214.8C609 210 604 206 600 201.7C595 197 591 193 588 188.6C583 182 579 176 576 172C574 170 571 169 569 169.5Z" />
          <path fill="none" d="M475 270.7C478 280 482 286 486 289C494 296 505 304 519 308.8C526 310.5 531 311 537 310.5C539 314 541 318 543 322C547 326 551 328.5 554.8 330C561 333 567 336 573.8 337.4C582 339 590 340.5 597.6 341C608 342 618 342.8 628 343.5M616.7 343.3C628 351 640 361 648 367C655 373 661 378 666 382C672 378 680 370 686 360C691 350 694 336 695 320C694 312 692 307 688 303C683 303 674 298 664 291C656 285 650 280 647.6 276.7C643 266 640 258 635.7 250.5C632 241 629 234 626 229C621 222 618 218 614 214.8C609 210 604 206 600 201.7C595 197 591 193 588 188.6C583 182 579 176 576 172C574 170 571 169 569 169.5C566 171 563.5 175 564 180C564.5 190 568 202 573 211C576 217 580 223 585 229L590.5 238.6C560 239.5 520 239 490 238.6C475 238.6 465 239 460 241C456 243 456 247 460 248.5C466 251 474 253 481 256.4C495 261 510 265 521 267C540 269.5 552 270.5 563 270.7M483 258C495 265 510 273 521 281C535 288 548 295 560.7 300M520 280C521 289 526 296 534.5 303C542 309 550 314 559.5 317M583 231.4L590.5 232.6" />

          {/* Flash, re-mounted on every shot so it fires again. */}
          <g key={turn} className={`cha-flash${turn === 0 ? ' is-first' : ''}`} stroke="none">
            <rect className="cha-flash-lamp" x="568" y="137" width="9" height="8.5" />
            <circle className="cha-flash-glow" cx="572.5" cy="141" r="70" fill="url(#cha-flash-glow)" />
            <g className="cha-flash-rays" stroke="#FFDE59" strokeWidth="5">
              {RAYS.map((angle) => (
                <line key={angle} x1="572.5" y1="113" x2="572.5" y2="95" transform={`rotate(${angle} 572.5 141)`} />
              ))}
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
