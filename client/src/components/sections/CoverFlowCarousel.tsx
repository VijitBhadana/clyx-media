import { useState, useEffect, useCallback, useRef } from "react";

const ChevronLeftIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

export interface CampaignItem {
  tag: string;
  titleLine1: string;
  titleLine2?: string;
  desc?: string;
  img: string;
  ctaText?: string;
  ctaUrl?: string;
}

export const clyxCampaigns: CampaignItem[] = [
  {
    tag: "#CREATOR COMMERCE",
    titleLine1: "KULTURE SKIN",
    titleLine2: "3.4X ROAS SCALE",
    desc: "Turned organic beauty creator clips into a repeatable Meta whitelisting engine.",
    img: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=85",
    ctaText: "View Case Study",
    ctaUrl: "/case-studies",
  },
  {
    tag: "#PERFORMANCE ADS",
    titleLine1: "NOVA NUTRITION",
    titleLine2: "42% LOWER CPA",
    desc: "Rapid creative iteration testing 45+ hooks weekly to aggressively scale media spend.",
    img: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1000&q=85",
    ctaText: "View Case Study",
    ctaUrl: "/case-studies",
  },
  {
    tag: "#CULTURE FIRST",
    titleLine1: "MUTHA BEAUTY",
    titleLine2: "10M+ IMPRESSIONS",
    desc: "Editorial and high-aesthetic brand storytelling engineered to convert on TikTok & Reels.",
    img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=85",
    ctaText: "View Case Study",
    ctaUrl: "/case-studies",
  },
  {
    tag: "#CONVERSION TECH",
    titleLine1: "ORBIT LABS",
    titleLine2: "+28% CVR LIFT",
    desc: "Custom headless storefronts tuned for 0.4s load times and lightning checkout flows.",
    img: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1000&q=85",
    ctaText: "View Case Study",
    ctaUrl: "/case-studies",
  },
  {
    tag: "#UGC ENGINE",
    titleLine1: "HALO D2C",
    titleLine2: "4.1X BLENDED ROAS",
    desc: "Built and managed a dedicated roster of 120+ micro-creators producing genuine hooks.",
    img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=85",
    ctaText: "View Case Study",
    ctaUrl: "/case-studies",
  },
];

export interface CoverFlowCarouselProps {
  items?: CampaignItem[];
  sectionLabel?: string;
  autoplay?: boolean;
  autoplayDelay?: number;
  className?: string;
  id?: string;
}

export default function CoverFlowCarousel({
  items = clyxCampaigns,
  sectionLabel = "FEATURED CAMPAIGNS",
  autoplay = true,
  autoplayDelay = 5000,
  className = "",
  id,
}: CoverFlowCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef(0);
  const total = items.length;

  useEffect(() => {
    if (currentIndex >= total) setCurrentIndex(0);
  }, [currentIndex, total]);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goToSlide = (idx: number) => {
    setCurrentIndex(idx % total);
  };

  useEffect(() => {
    if (!autoplay || isHovered || total <= 1) return;
    const interval = setInterval(nextSlide, autoplayDelay);
    return () => clearInterval(interval);
  }, [autoplay, autoplayDelay, isHovered, nextSlide, total]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 45) {
      if (diff < 0) nextSlide();
      else prevSlide();
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <section
      id={id}
      className={`relative w-full min-h-[720px] flex items-center justify-center overflow-hidden py-16 select-none bg-[#050505] text-white border-b border-grid ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <img
          src={items[currentIndex]?.img}
          alt="ambience background"
          loading="lazy"
          decoding="async"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "brightness(0.18) blur(40px)",
            transform: "scale(1.2)",
            transition: "opacity 1000ms ease, filter 1000ms ease",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at center, rgba(5,5,5,0.4) 0%, rgba(5,5,5,0.95) 100%)",
          }}
        />
      </div>

      <div className="relative w-full max-w-6xl mx-auto px-4 z-10 flex flex-col items-center">
        {/* Eyebrow */}
        {sectionLabel && (
          <div className="flex items-center gap-3 mb-8">
            <span style={{ width: "36px", height: "1px", background: "linear-gradient(90deg, transparent, #FFDE59)" }} />
            <h3
              className="text-xs font-bold uppercase tracking-[0.3em] text-[#FFDE59] m-0"
            >
              {sectionLabel}
            </h3>
            <span style={{ width: "36px", height: "1px", background: "linear-gradient(90deg, #FFDE59, transparent)" }} />
          </div>
        )}

        {/* 3D Coverflow Stage */}
        <div
          className="relative w-full h-[480px] md:h-[520px] flex justify-center items-center mb-8"
          style={{ perspective: "1400px" }}
        >
          {items.map((item, idx) => {
            const offset = (idx - currentIndex + total) % total;

            let transform = "translateX(0px) scale(0.4) rotateY(0deg)";
            let opacity = 0;
            let zIndex = 0;
            let filter = "brightness(0.4) blur(2px)";
            let isCenter = false;

            if (offset === 0) {
              isCenter = true;
              transform = "translateX(0px) scale(1) rotateY(0deg)";
              opacity = 1;
              zIndex = 30;
              filter = "brightness(1)";
            } else if (offset === 1) {
              transform = "translateX(280px) scale(0.84) rotateY(-24deg)";
              opacity = 0.65;
              zIndex = 20;
              filter = "brightness(0.75)";
            } else if (offset === 2) {
              transform = "translateX(490px) scale(0.68) rotateY(-38deg)";
              opacity = 0.38;
              zIndex = 10;
              filter = "brightness(0.55) blur(1px)";
            } else if (offset === total - 1) {
              transform = "translateX(-280px) scale(0.84) rotateY(24deg)";
              opacity = 0.65;
              zIndex = 20;
              filter = "brightness(0.75)";
            } else if (offset === total - 2) {
              transform = "translateX(-490px) scale(0.68) rotateY(38deg)";
              opacity = 0.38;
              zIndex = 10;
              filter = "brightness(0.55) blur(1px)";
            }

            return (
              <div
                key={idx}
                onClick={() => !isCenter && goToSlide(idx)}
                style={{
                  position: "absolute",
                  width: "320px",
                  height: "480px",
                  borderRadius: "20px",
                  overflow: "hidden",
                  backgroundColor: "#0d0d0d",
                  border: isCenter ? "1px solid rgba(255, 222, 89, 0.4)" : "1px solid rgba(255, 255, 255, 0.12)",
                  transform,
                  opacity,
                  zIndex,
                  filter,
                  transformOrigin: "center center",
                  transition: "all 800ms cubic-bezier(0.25, 1, 0.5, 1)",
                  boxShadow: isCenter
                    ? "0 25px 60px rgba(0,0,0,0.9), 0 0 35px rgba(0,58,163,0.35)"
                    : "0 15px 35px rgba(0,0,0,0.5)",
                  cursor: isCenter ? "default" : "pointer",
                }}
              >
                {/* Photo */}
                <img
                  src={item.img}
                  alt={item.titleLine1}
                  loading="lazy"
                  decoding="async"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />

                {/* Dark Vignette Overlay */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 25%, rgba(0,0,0,0.7) 60%, rgba(5,5,5,0.98) 100%)",
                    pointerEvents: "none",
                    zIndex: 10,
                  }}
                />

                {/* Content Overlay */}
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    padding: "24px 20px 24px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    textAlign: "center",
                    zIndex: 20,
                    opacity: isCenter ? 1 : 0,
                    transform: isCenter ? "translateY(0px)" : "translateY(16px)",
                    transition: "opacity 500ms ease, transform 500ms ease",
                    pointerEvents: isCenter ? "auto" : "none",
                  }}
                >
                  {/* Tag */}
                  <div style={{ textAlign: "right", width: "100%" }}>
                    <span
                      className="inline-block text-[11px] font-bold tracking-wider text-yellow"
                    >
                      {item.tag}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "4px",
                      marginTop: "auto",
                    }}
                  >
                    <h2
                      className="display text-2xl font-bold uppercase tracking-tight text-white m-0"
                    >
                      {item.titleLine1}
                    </h2>

                    {item.titleLine2 && (
                      <span
                        className="text-sm font-semibold tracking-wider text-[#FFDE59] uppercase"
                      >
                        {item.titleLine2}
                      </span>
                    )}

                    <div
                      style={{
                        width: "36px",
                        height: "2px",
                        backgroundColor: "#FFDE59",
                        borderRadius: "2px",
                        margin: "6px auto",
                      }}
                    />

                    {item.desc && (
                      <p
                        className="text-xs text-white/80 max-w-[260px] m-0 mb-3 leading-relaxed"
                      >
                        {item.desc}
                      </p>
                    )}

                    <a
                      href={item.ctaUrl || "/case-studies"}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-yellow text-dark text-xs font-bold uppercase tracking-wider hover:bg-blue hover:text-white transition-colors"
                    >
                      <span>{item.ctaText || "View Case Study"}</span>
                      <ArrowRightIcon />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          aria-label="Previous campaign"
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 border border-white/20 text-white flex items-center justify-center backdrop-blur-md hover:bg-yellow hover:text-dark transition-colors z-40"
        >
          <ChevronLeftIcon />
        </button>

        <button
          onClick={nextSlide}
          aria-label="Next campaign"
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 border border-white/20 text-white flex items-center justify-center backdrop-blur-md hover:bg-yellow hover:text-dark transition-colors z-40"
        >
          <ChevronRightIcon />
        </button>

        {/* Pagination Dots */}
        <div className="flex items-center justify-center gap-2 z-30">
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              style={{
                height: "8px",
                width: idx === currentIndex ? "28px" : "8px",
                borderRadius: "9999px",
                backgroundColor: idx === currentIndex ? "#FFDE59" : "rgba(255,255,255,0.25)",
                border: "none",
                cursor: "pointer",
                transition: "all 300ms ease",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
