import * as React from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";

/* ── Halo Reel ───────────────────────────────────────────────────
 * Cards ride an ellipse. Card i sits at θ = i·step + rotation on an
 * ellipse of radii (rx, ry):
 *
 *   x = rx·cos θ      y = ry·sin θ      scale = min + (1−min)·(cos θ + 1)/2
 *
 * cos θ does all the work: it places the card, sizes it, and — through the
 * scale — stacks it. One number driving three properties is why a card that
 * looks nearer *is* nearer; the stacking can never disagree with the
 * perspective.
 *
 * One `rotation` motion value drives the whole ring. Every card derives its
 * transform from it through `useTransform`, so a spin never re-renders React
 * — the ring turns at 60 fps whether it is autoplaying, being dragged, or
 * settling onto a snap.
 *
 * Adapted for this site (Vite, no "use client"): a card can link somewhere
 * (`href`) and carry a caption over its image, images take a `srcSet`, and a
 * drag only starts once the pointer has moved a few pixels, so a plain click
 * still reaches the card's link.
 * ─────────────────────────────────────────────────────────────── */

export type HaloReelItem = {
  /** Image for the card. Omit it and the card falls back to the text face. */
  src?: string;
  srcSet?: string;
  sizes?: string;
  alt?: string;
  /** Makes the card a link. */
  href?: string;
  /** Accessible name for the link (defaults to the title). */
  linkLabel?: string;
  /** Text face, used when there is no `src`. Both default to the shadcn
   *  `card` tokens, so a text card themes itself in light and dark. */
  bgColor?: string;
  textColor?: string;
  title?: string;
  subtitle?: string;
  /** Caption over an image card: small line above the title, a badge and a call to action. */
  eyebrow?: string;
  badge?: string;
  cta?: React.ReactNode;
  /** Thin bar along the top of an image card. */
  accent?: string;
};

export interface HaloReelProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "children"> {
  items: HaloReelItem[];
  /** Card width in px at the front of the ring. @default 130 */
  cardWidth?: number;
  /** Card height in px at the front of the ring. @default 180 */
  cardHeight?: number;
  /** Extra classes for every card (e.g. rounded corners). */
  cardClassName?: string;
  /** Scale of the card at the far side of the ring. @default 0.4 */
  minScale?: number;
  /** Horizontal radius as a fraction of the stage width. @default 0.45 */
  radiusXRatio?: number;
  /** Where the ellipse is centred across the stage. `0` pins it to the left
   *  edge, so the far half of the ring is clipped away. @default 0 */
  centerXRatio?: number;
  /** Vertical radius as a fraction of the stage height. @default 0.36 */
  radiusYRatio?: number;
  /** Rotate one card forward on a timer. @default true */
  autoPlay?: boolean;
  /** Time (ms) a card is held at the front before the next step. @default 1000 */
  holdDuration?: number;
  /** Duration (ms) of one step. @default 700 */
  stepDuration?: number;
  /** Hold the autoplay while a pointer rests on a card. @default true */
  pauseOnHover?: boolean;
  /** Spin the ring by dragging it. @default true */
  draggable?: boolean;
  /** Gap between neighbouring cards at the widest point of the ring, in card
   *  widths. `1` is just touching, above that they sit slightly apart, below
   *  that they overlap. The ring repeats `items` until it holds this spacing,
   *  so a wider ring means more cards rather than bigger gaps. @default 1.2 */
  spread?: number;
  /** Ceiling on the number of cards drawn around the ring. @default 64 */
  maxCards?: number;
  /** Multiplier on the drag rotation. @default 1 */
  dragSensitivity?: number;
  /** Turn the ring with the mouse wheel while the pointer is over it (the page
   *  scrolls normally everywhere else). @default false */
  scrollToSpin?: boolean;
  /** Cards turned per wheel notch. @default 1 */
  scrollSensitivity?: number;
  /** Node parked in the middle of the ring, behind the cards. */
  centerLabel?: React.ReactNode;
  /** @default true */
  showCenterLabel?: boolean;
}

const TAU = Math.PI * 2;
// Pixels the pointer must travel before a press becomes a drag (below it, it is a click).
const DRAG_THRESHOLD = 6;

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

export function HaloReel({
  items,
  cardWidth = 130,
  cardHeight = 180,
  cardClassName,
  minScale = 0.4,
  radiusXRatio = 0.45,
  centerXRatio = 0,
  radiusYRatio = 0.36,
  autoPlay = true,
  holdDuration = 1000,
  stepDuration = 700,
  pauseOnHover = true,
  draggable = true,
  spread = 1.2,
  maxCards = 64,
  dragSensitivity = 1,
  scrollToSpin = false,
  scrollSensitivity = 1,
  centerLabel,
  showCenterLabel = true,
  className,
  style,
  ...props
}: HaloReelProps) {
  const stageRef = React.useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const count = items.length;

  const rotation = useMotionValue(0);
  const draggingRef = React.useRef(false);
  const wheelingRef = React.useRef(false);
  const hoverRef = React.useRef(false);

  const [size, setSize] = React.useState({ w: 0, h: 0 });
  React.useEffect(() => {
    const node = stageRef.current;
    if (!node) return;
    const measure = () =>
      setSize({ w: node.offsetWidth, h: node.offsetHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const radiusX = size.w * radiusXRatio;
  const radiusY = size.h * radiusYRatio;

  // The ring is sized by the stage and *filled* by repeating the items — the
  // one way a wide ring and close cards can both be true. Neighbours sit
  // `radius × step` apart at the widest point of each axis, so the tighter
  // axis decides how many slots the ring needs; below that number a wider ring
  // just means bigger gaps.
  const slots = clamp(
    Math.ceil(
      TAU *
        Math.max(
          radiusX / (cardWidth * spread),
          radiusY / (cardHeight * spread),
        ),
    ),
    count,
    Math.max(count, maxCards),
  );
  const step = slots ? TAU / slots : 0;

  // Cards shrink continuously to fit whatever box they are given, instead of
  // stepping at a breakpoint — a ring that jumps at 768px reads as broken on
  // every width either side of it.
  const fit = size.w
    ? clamp(
        Math.min(
          size.w / (radiusX + cardWidth),
          size.h / (2 * radiusY + cardHeight),
        ),
        0.45,
        1,
      )
    : 1;
  const cardW = cardWidth * fit;
  const cardH = cardHeight * fit;

  // Autoplay. Each step schedules the next, so a paused tick costs a re-check
  // and nothing else — no interval keeps firing behind a held pointer.
  React.useEffect(() => {
    if (!autoPlay || reduceMotion || !count) return;

    let timer = 0;
    let controls: ReturnType<typeof animate> | undefined;

    const tick = () => {
      timer = window.setTimeout(() => {
        if (draggingRef.current || wheelingRef.current || (pauseOnHover && hoverRef.current)) {
          tick();
          return;
        }
        controls = animate(rotation, rotation.get() - step, {
          duration: stepDuration / 1000,
          ease: [0.4, 0, 0.2, 1],
        });
        // The next step is timed rather than chained to onComplete: a wheel or drag that takes over
        // the rotation stops this animation, and an onComplete chain would then never fire again.
        timer = window.setTimeout(tick, stepDuration);
      }, holdDuration);
    };

    tick();
    return () => {
      window.clearTimeout(timer);
      controls?.stop();
    };
  }, [
    autoPlay,
    count,
    holdDuration,
    pauseOnHover,
    reduceMotion,
    rotation,
    step,
    stepDuration,
  ]);

  /* ── wheel ─────────────────────────────────────────────────── */

  // Latest geometry for the native wheel listener, which is attached once.
  const geometryRef = React.useRef({ ringRight: 0, step });
  geometryRef.current = { ringRight: size.w * centerXRatio + radiusX + cardW / 2, step };

  // Scrolling over the ring turns it (one wheel notch ≈ one card), then it settles on the
  // nearest card. Over the rest of the stage (e.g. the centre label) the page scrolls as usual.
  // Native and non-passive, because React's onWheel cannot cancel the page scroll.
  React.useEffect(() => {
    const node = stageRef.current;
    if (!scrollToSpin || !node) return;
    let target = 0;
    let settleTimer = 0;
    const onWheel = (e: WheelEvent) => {
      const { ringRight, step: cardStep } = geometryRef.current;
      if (!cardStep || e.ctrlKey) return; // ctrl + wheel is browser zoom
      if (e.clientX - node.getBoundingClientRect().left > ringRight) return;
      const delta = e.deltaY || e.deltaX;
      if (!delta) return;
      e.preventDefault();
      if (!wheelingRef.current) target = rotation.get();
      wheelingRef.current = true;
      const px = e.deltaMode === 1 ? delta * 40 : e.deltaMode === 2 ? delta * 800 : delta;
      // Scrolling down turns the ring the same way autoplay does.
      target -= (px / 120) * cardStep * scrollSensitivity;
      if (reduceMotion) rotation.set(target);
      else animate(rotation, target, { duration: 0.45, ease: [0.22, 1, 0.36, 1] });
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => {
        const snapped = Math.round(target / cardStep) * cardStep;
        if (reduceMotion) rotation.set(snapped);
        else animate(rotation, snapped, { duration: 0.5, ease: [0.16, 1, 0.3, 1] });
        wheelingRef.current = false;
      }, 180);
    };
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      node.removeEventListener("wheel", onWheel);
      window.clearTimeout(settleTimer);
      wheelingRef.current = false;
    };
  }, [scrollToSpin, scrollSensitivity, reduceMotion, rotation]);

  /* ── drag ──────────────────────────────────────────────────── */

  // `pressed` is set on pointer down; the press only turns into a drag (and
  // captures the pointer) once it has moved past DRAG_THRESHOLD.
  const dragRef = React.useRef({
    left: 0,
    top: 0,
    angle: 0,
    startX: 0,
    startY: 0,
    pressed: false,
  });

  const pointerAngle = (e: React.PointerEvent) => {
    const { left, top } = dragRef.current;
    // Normalising by the radii un-squashes the ellipse, so a drag along its
    // flat side turns the ring by the same amount as one along its tall side.
    return Math.atan2(
      (e.clientY - top - size.h / 2) / (radiusY || 1),
      (e.clientX - left - size.w * centerXRatio) / (radiusX || 1),
    );
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggable || (e.pointerType === "mouse" && e.button !== 0)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    dragRef.current = {
      left: rect.left,
      top: rect.top,
      angle: 0,
      startX: e.clientX,
      startY: e.clientY,
      pressed: true,
    };
    dragRef.current.angle = pointerAngle(e);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag.pressed) return;
    if (!draggingRef.current) {
      if (Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) < DRAG_THRESHOLD) return;
      draggingRef.current = true;
      // Capturing now (not on pointer down) keeps a plain click on a card's link working;
      // after a real drag the click lands on the stage instead, so no link fires.
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    const angle = pointerAngle(e);
    // Wrap into (−π, π] so crossing the seam behind the ring is one small
    // delta and not a full turn in the wrong direction.
    const delta =
      ((angle - drag.angle + Math.PI * 3) % TAU) - Math.PI;
    drag.angle = angle;
    rotation.set(rotation.get() + delta * dragSensitivity);
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current.pressed = false;
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    // Settle onto the nearest card — the ring never rests between two.
    const snapped = Math.round(rotation.get() / step) * step;
    if (reduceMotion) {
      rotation.set(snapped);
      return;
    }
    animate(rotation, snapped, { duration: 0.5, ease: [0.16, 1, 0.3, 1] });
  };

  const spinBy = (direction: number) => {
    const target = Math.round(rotation.get() / step) * step - direction * step;
    if (reduceMotion) {
      rotation.set(target);
      return;
    }
    animate(rotation, target, {
      duration: stepDuration / 1000,
      ease: [0.4, 0, 0.2, 1],
    });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Only when the stage itself has focus, so Enter/arrows on a focused card link behave normally.
    if (e.target !== e.currentTarget) return;
    const direction = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!direction) return;
    e.preventDefault();
    spinBy(direction);
  };

  if (!count) return null;

  return (
    <div
      ref={stageRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={props["aria-label"] ?? "Image carousel"}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      className={cn(
        "relative h-[100dvh] w-full touch-pan-y select-none overflow-hidden outline-none",
        draggable && "cursor-grab active:cursor-grabbing",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
        className,
      )}
      style={style}
      {...props}
    >
      {showCenterLabel && centerLabel ? (
        <div
          className="pointer-events-none absolute inset-y-0 z-0 flex items-center justify-center px-4 text-center"
          // Parked in whatever space the ring leaves rather than at a fixed
          // spot, so it can never end up underneath the cards at any width.
          style={{
            left: size.w * centerXRatio + radiusX + cardW / 2,
            right: 0,
          }}
        >
          {centerLabel}
        </div>
      ) : null}

      {Array.from({ length: slots }, (_, i) => (
        <WheelCard
          key={i}
          item={items[i % count]}
          // The ring repeats `items` to stay dense. A screen reader should hear
          // each image once, not once per lap, so only the first pass is real
          // content and the copies are decoration.
          decorative={i >= count}
          index={i}
          step={step}
          rotation={rotation}
          radiusX={radiusX}
          radiusY={radiusY}
          centerXRatio={centerXRatio}
          minScale={minScale}
          width={cardW}
          height={cardH}
          className={cardClassName}
          onHoverChange={(hovered) => {
            hoverRef.current = hovered;
          }}
        />
      ))}
    </div>
  );
}

/* ── card ────────────────────────────────────────────────────── */

function WheelCard({
  item,
  index,
  step,
  rotation,
  radiusX,
  radiusY,
  centerXRatio,
  minScale,
  width,
  height,
  decorative,
  className,
  onHoverChange,
}: {
  item: HaloReelItem;
  index: number;
  step: number;
  rotation: MotionValue<number>;
  radiusX: number;
  radiusY: number;
  centerXRatio: number;
  minScale: number;
  width: number;
  height: number;
  decorative: boolean;
  className?: string;
  onHoverChange: (hovered: boolean) => void;
}) {
  const cos = useTransform(rotation, (r) => Math.cos(index * step + r));
  const sin = useTransform(rotation, (r) => Math.sin(index * step + r));

  const x = useTransform(cos, (c) => c * radiusX);
  const y = useTransform(sin, (s) => s * radiusY);
  const scale = useTransform(
    cos,
    (c) => minScale + (1 - minScale) * ((c + 1) / 2),
  );
  const zIndex = useTransform(scale, (s) => Math.round(s * 1000));

  const face = item.src ? (
    <>
      <img
        src={item.src}
        srcSet={item.srcSet}
        sizes={item.sizes}
        alt={decorative ? "" : (item.alt ?? "")}
        draggable={false}
        loading="lazy"
        decoding="async"
        className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover transition-transform duration-700 ease-out group-hover/card:scale-105"
      />
      {item.accent ? (
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 z-[1] h-1"
          style={{ background: item.accent }}
        />
      ) : null}
      {item.title || item.eyebrow || item.badge ? (
        <span className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/30 to-transparent p-[7%] text-left text-white">
          {item.eyebrow ? (
            <span className="truncate text-[9px] font-semibold uppercase tracking-[0.16em] text-white/70">
              {item.eyebrow}
            </span>
          ) : null}
          {item.title ? (
            <span className="mt-1 text-[15px] font-bold leading-tight">
              {item.title}
            </span>
          ) : null}
          {item.badge ? (
            <span className="mt-2 w-fit max-w-full truncate rounded-full bg-[#FFDE59] px-2.5 py-0.5 text-[11px] font-bold text-[#050505]">
              {item.badge}
            </span>
          ) : null}
          {item.cta ? (
            <span className="mt-2.5 flex items-center gap-1 border-t border-white/15 pt-2 text-[9px] font-bold uppercase tracking-[0.14em] text-white/90">
              {item.cta}
            </span>
          ) : null}
        </span>
      ) : null}
    </>
  ) : (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-1 bg-card p-3 text-center text-card-foreground"
      style={{
        backgroundColor: item.bgColor,
        color: item.textColor,
      }}
    >
      {item.title ? (
        <span className="text-2xl font-black leading-none">
          {item.title}
        </span>
      ) : null}
      {item.subtitle ? (
        <span className="text-[0.6rem] uppercase tracking-[0.2em] opacity-70">
          {item.subtitle}
        </span>
      ) : null}
    </div>
  );

  return (
    <motion.div
      role={decorative ? undefined : "group"}
      aria-roledescription={decorative ? undefined : "slide"}
      aria-hidden={decorative || undefined}
      onPointerEnter={() => onHoverChange(true)}
      onPointerLeave={() => onHoverChange(false)}
      style={{
        x,
        y,
        scale,
        zIndex,
        width,
        height,
        left: `${centerXRatio * 100}%`,
        top: "50%",
        marginLeft: -width / 2,
        marginTop: -height / 2,
      }}
      className={cn("group/card absolute overflow-hidden shadow-xl", className)}
    >
      {item.href ? (
        <a
          href={item.href}
          draggable={false}
          // Copies around the ring are decoration: keep them out of the tab order too.
          tabIndex={decorative ? -1 : undefined}
          aria-label={decorative ? undefined : (item.linkLabel ?? item.title)}
          className="absolute inset-0 block focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-[#FFDE59]"
        >
          {face}
        </a>
      ) : (
        face
      )}
    </motion.div>
  );
}

export default HaloReel;
