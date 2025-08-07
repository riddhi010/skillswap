import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion";
import "../pages/styles.css"; 

// Testimonials data
const testimonials = [
  {
    name: "Arjun R.",
    role: "Aspiring Web Developer",
    quote:
      "SkillSwap completely changed how I learn — the live sessions and real people make it so much more personal and effective!",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    name: "Lana M.",
    role: "Data Science Enthusiast",
    quote:
      "I taught Python basics to a beginner from Brazil and learned SQL from a student in Kenya. The cultural mix is amazing.",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    name: "Vikash T.",
    role: "Mentor & Tech Lead",
    quote:
      "Mentoring here isn't just giving back — it's helping me sharpen my skills too. The AI matching feature is on point!",
    avatar: "https://randomuser.me/api/portraits/men/76.jpg",
  },
  {
    name: "Elena P.",
    role: "ML Engineer",
    quote:
      "I've never seen such global collaboration before. Every session I attend feels like a mini cultural exchange.",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
  },
  {
    name: "Haruto S.",
    role: "Frontend Enthusiast",
    quote:
      "Learning React with a peer from Spain? Count me in. SkillSwap has made upskilling so fun.",
    avatar: "https://randomuser.me/api/portraits/men/88.jpg",
  },
];


const TestimonialsCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: false, skipSnaps: false },
    [Autoplay({ delay: 4000, stopOnInteraction: false })]
  );

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  return (
    <section className="relative bg-white/10 py-20 px-6 md:px-20 rounded-3xl max-w-7xl mx-auto my-20 border border-white/20 backdrop-blur-md">


      <h2 className="text-4xl font-extrabold text-center text-white mb-12 drop-shadow-lg">
        What Our Users Say
      </h2>

      <div className="embla overflow-hidden" ref={emblaRef}>
        <div className="embla__container flex space-x-8">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.4 }}
              className="embla__slide flex-shrink-0 w-full md:w-1/3 bg-white/5 border border-white/20 p-6 rounded-2xl shadow-xl backdrop-blur-md text-white flex flex-col items-center text-center"
            >
              <img
                src={t.avatar}
                alt={`${t.name} avatar`}
                className="w-20 h-20 rounded-full mb-4 border-2 border-white/50 object-cover"
              />
              <p className="italic text-lg mb-4">“{t.quote}”</p>
              <h3 className="font-semibold text-xl">{t.name}</h3>
              <p className="text-sm text-white/80">{t.role}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <button
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 p-2 rounded-full disabled:opacity-50"
        onClick={scrollPrev}
        disabled={!prevBtnEnabled}
      >
        ←
      </button>
      <button
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 p-2 rounded-full disabled:opacity-50"
        onClick={scrollNext}
        disabled={!nextBtnEnabled}
      >
        →
      </button>
    </section>
  );
};

export default TestimonialsCarousel;

