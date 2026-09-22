import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tilt } from '@/components/core/tilt';
import { cn } from '@/lib/utils';

export interface CampaignCard {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  tag?: string;
}

export const heroCampaigns: CampaignCard[] = [
  {
    id: 'ghost-shell',
    title: 'Ghost in the Shell',
    subtitle: 'Kôkaku kidôtai',
    image: 'https://images.beta.cosmos.so/f7fcb95d-981b-4cb3-897f-e35f6c20e830?format=jpeg',
    tag: '#Sample Creative',
  },
  {
    id: 'kulture',
    title: 'Kulture Skin',
    subtitle: 'Organic Reel · +312% ROAS',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=85',
    tag: '#Creator Ads',
  },
  {
    id: 'nova',
    title: 'Nova Nutrition',
    subtitle: 'Scaled Ad · +188% CTR',
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=85',
    tag: '#Performance',
  },
  {
    id: 'mutha',
    title: 'Mutha Beauty',
    subtitle: 'Feed Narrative · 10M+ Views',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=85',
    tag: '#Culture First',
  },
  {
    id: 'orbit',
    title: 'Orbit Labs',
    subtitle: 'Conversion Tech · +28% CVR',
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=85',
    tag: '#CRO Scale',
  },
];

export function HeroTiltStack() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <div className="relative w-full max-w-[480px] h-[400px] sm:h-[440px] flex items-center justify-center select-none py-6">
      {heroCampaigns.map((card, index) => {
        const isSelected = selectedIndex === index;
        const total = heroCampaigns.length;
        const diff = (index - selectedIndex + total) % total;

        // Loosely fanned out offsets for easy viewing of background cards
        let xOffset = 0;
        let yOffset = 0;
        let scale = 1;
        let rotate = 0;
        let zIndex = 40;

        if (diff === 0) {
          xOffset = 0;
          yOffset = 0;
          scale = 1;
          rotate = 0;
          zIndex = 40;
        } else if (diff === 1) {
          xOffset = 64;
          yOffset = -8;
          scale = 0.94;
          rotate = 7;
          zIndex = 30;
        } else if (diff === 2) {
          xOffset = 120;
          yOffset = -16;
          scale = 0.88;
          rotate = 13;
          zIndex = 20;
        } else if (diff === 3) {
          xOffset = -64;
          yOffset = -8;
          scale = 0.94;
          rotate = -7;
          zIndex = 25;
        } else {
          xOffset = -120;
          yOffset = -16;
          scale = 0.88;
          rotate = -13;
          zIndex = 15;
        }

        return (
          <motion.div
            key={card.id}
            onClick={() => setSelectedIndex(index)}
            animate={{
              x: xOffset,
              y: yOffset,
              scale,
              rotate,
              zIndex,
            }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 24,
            }}
            className={cn(
              'absolute cursor-pointer transition-shadow duration-300',
              isSelected
                ? 'filter drop-shadow-[0_25px_50px_rgba(0,0,0,0.65)]'
                : 'filter drop-shadow-[0_12px_30px_rgba(0,0,0,0.35)] opacity-90 hover:opacity-100 hover:scale-[0.96]'
            )}
            style={{ zIndex }}
          >
            <Tilt rotationFactor={10} isRevese>
              <div
                className={cn(
                  'flex w-[280px] sm:w-[310px] md:w-[330px] flex-col overflow-hidden rounded-2xl border bg-white dark:bg-zinc-900 transition-all duration-300',
                  isSelected
                    ? 'border-yellow ring-2 ring-yellow/70 shadow-2xl'
                    : 'border-white/30 dark:border-white/15 hover:border-yellow/50'
                )}
              >
                <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-black">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  {card.tag && (
                    <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-yellow text-dark shadow-sm">
                      {card.tag}
                    </span>
                  )}
                </div>

                <div className="p-3.5 sm:p-4 bg-white dark:bg-[#121620] transition-colors">
                  <div className="flex items-center justify-between">
                    <h3 className="font-mono text-sm font-bold leading-snug text-zinc-950 dark:text-zinc-50">
                      {card.title}
                    </h3>
                    {isSelected && (
                      <span className="text-[9px] font-mono font-bold uppercase text-blue dark:text-yellow tracking-wider">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                    {card.subtitle}
                  </p>
                </div>
              </div>
            </Tilt>
          </motion.div>
        );
      })}
    </div>
  );
}

export default HeroTiltStack;
