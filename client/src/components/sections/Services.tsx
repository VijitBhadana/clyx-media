import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Real CLYX Services data (No sample text)
const SERVICES = [
  {
    id: "01",
    title: "Influencer Marketing",
    description:
      "We build and manage a creator bench matched to your category, then negotiate content + usage rights for paid.",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "02",
    title: "Performance Marketing",
    description:
      "Meta & Google campaigns run on data, not guesses — we scale spend behind what's already converting.",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "03",
    title: "Social Media Management",
    description:
      "Monthly content calendars, channel management, and organic strategy that builds a real audience.",
    image:
      "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "04",
    title: "UGC Videos",
    description:
      "Product photography, video direction, and AI-assisted design assets built for the feed, not a boardroom.",
    image:
      "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "05",
    title: "Website Development",
    description:
      "UI/UX-first, conversion-built sites — coded fast, priced for what they return in revenue.",
    image:
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "06",
    title: "Shopify Store CRO",
    description:
      "Storefronts built around checkout speed, merchandising, and the metrics that actually move revenue.",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=85",
  },
];

const AUTO_PLAY_DURATION = 5000;

export default function Services() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const handleNext = useCallback(() => {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % SERVICES.length);
  }, []);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + SERVICES.length) % SERVICES.length);
  }, []);

  const handleTabClick = (index: number) => {
    if (index === activeIndex) return;
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
    setIsPaused(false);
  };

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      handleNext();
    }, AUTO_PLAY_DURATION);
    return () => clearInterval(interval);
  }, [activeIndex, isPaused, handleNext]);

  const variants = {
    enter: (dir: number) => ({
      y: dir > 0 ? "-100%" : "100%",
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      y: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      zIndex: 0,
      y: dir > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
  };

  return (
    <section id="services" className="w-full bg-[color:var(--background)] text-foreground py-16 md:py-24 border-b border-grid transition-colors">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Left Column: Content */}
          <div className="lg:col-span-6 flex flex-col justify-center order-2 lg:order-1 pt-2">
            <div className="space-y-2 mb-8">
              <span className="text-xs font-semibold text-blue dark:text-yellow uppercase tracking-[0.2em] block">
                Six disciplines · One growth engine
              </span>
              <h2 className="display text-4xl font-bold md:text-5xl lg:text-6xl text-foreground">
                Strategy into systems.
              </h2>
            </div>

            <div className="flex flex-col space-y-0 border-t border-grid">
              {SERVICES.map((service, index) => {
                const isActive = activeIndex === index;
                return (
                  <button
                    key={service.id}
                    onClick={() => handleTabClick(index)}
                    className={cn(
                      "group relative flex items-start gap-4 py-4 md:py-5 text-left transition-all duration-300 border-b border-grid",
                      isActive
                        ? "text-foreground"
                        : "text-muted hover:text-foreground"
                    )}
                  >
                    <div className="absolute left-[-16px] md:left-[-20px] top-0 bottom-0 w-[3px] bg-muted/20">
                      {isActive && (
                        <motion.div
                          key={`progress-${index}-${isPaused}`}
                          className="absolute top-0 left-0 w-full bg-blue dark:bg-yellow origin-top"
                          initial={{ height: "0%" }}
                          animate={
                            isPaused ? { height: "0%" } : { height: "100%" }
                          }
                          transition={{
                            duration: AUTO_PLAY_DURATION / 1000,
                            ease: "linear",
                          }}
                        />
                      )}
                    </div>

                    <span className="font-mono text-xs font-semibold mt-1 text-muted/60 dark:text-muted/80">
                      /{service.id}
                    </span>

                    <div className="flex flex-col gap-1.5 flex-1 pr-4">
                      <span
                        className={cn(
                          "display text-2xl md:text-3xl font-semibold tracking-tight transition-colors",
                          isActive ? "text-blue dark:text-yellow" : ""
                        )}
                      >
                        {service.title}
                      </span>

                      <AnimatePresence mode="wait">
                        {isActive && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{
                              duration: 0.3,
                              ease: [0.23, 1, 0.32, 1],
                            }}
                            className="overflow-hidden"
                          >
                            <p className="text-muted text-sm md:text-base font-normal leading-relaxed max-w-md pt-1 pb-1">
                              {service.description}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Image Preview Gallery Centered in Between */}
          <div className="lg:col-span-6 flex flex-col justify-center my-auto order-1 lg:order-2">
            <div
              className="relative group/gallery"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div className="relative aspect-[4/3] lg:aspect-[4/3.2] min-h-[420px] md:min-h-[480px] rounded-2xl md:rounded-3xl overflow-hidden bg-muted/10 border border-grid shadow-2xl">
                <AnimatePresence
                  initial={false}
                  custom={direction}
                  mode="popLayout"
                >
                  <motion.div
                    key={activeIndex}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      y: { type: "spring", stiffness: 260, damping: 32 },
                      opacity: { duration: 0.4 },
                    }}
                    className="absolute inset-0 w-full h-full cursor-pointer"
                    onClick={handleNext}
                  >
                    <img
                      src={SERVICES[activeIndex].image}
                      alt={SERVICES[activeIndex].title}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    />

                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6 md:p-8">
                      <p className="text-xs uppercase tracking-[0.16em] text-yellow font-bold">
                        CLYX Capability 0{activeIndex + 1}
                      </p>
                      <h4 className="display text-2xl md:text-3xl font-bold text-white mt-1">
                        {SERVICES[activeIndex].title}
                      </h4>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Controls */}
                <div className="absolute top-6 right-6 flex gap-2 z-20">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrev();
                    }}
                    className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/80 transition-all active:scale-95"
                    aria-label="Previous service"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNext();
                    }}
                    className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/80 transition-all active:scale-95"
                    aria-label="Next service"
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
