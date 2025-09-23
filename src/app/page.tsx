'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, Variants } from "framer-motion";

export default function Home() {
  const [redirecting, setRedirecting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Start redirect animation after all animations complete
    const redirectTimer = setTimeout(() => {
      setRedirecting(true);
      // Navigate to menu after fade out animation
      setTimeout(() => {
        router.push('/menu');
      }, 1000);
    }, 5000);

    return () => {
      clearTimeout(redirectTimer);
    };
  }, [router]);

  // Animation variants for the restaurant name
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.3,
      },
    },
  };

  const letterVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      rotateX: -90,
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  // Animation variants for tagline words
  const taglineContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 2.2,
      },
    },
  };

  const wordVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const restaurantName = "Baithak In Bir";
  const taglineWords = ["A view,", "A vibe,", "A Baithak"];

  return (
    <div className="bg-white h-screen w-full fixed inset-0 flex items-center justify-center overflow-hidden">
      <motion.div
        className="text-center px-4 w-full max-w-4xl mx-auto"
        initial={{ opacity: 1 }}
        animate={{ opacity: redirecting ? 0 : 1 }}
        transition={{ duration: 1, ease: "easeInOut" }}
      >
        {/* Main Content Group - Perfectly centered as one unit */}
        <div className="flex flex-col items-center justify-center space-y-4 sm:space-y-6">
          {/* Restaurant Name Animation - Letter by Letter */}
          <motion.h1
            className="text-4xl xs:text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-light text-black tracking-tight leading-none"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {restaurantName.split("").map((char, index) => (
              <motion.span
                key={index}
                variants={letterVariants}
                className="inline-block"
                style={{ transformOrigin: "50% 50%" }}
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </motion.h1>

          {/* Animated Divider */}
          <motion.div
            className="w-20 sm:w-24 md:w-32 h-px bg-black"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "100%", opacity: 1 }}
            transition={{ 
              duration: 1.2, 
              ease: "easeInOut",
              delay: 1.8 
            }}
          />

          {/* Tagline Animation - Word by Word */}
          <motion.div
            className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl text-gray-600 font-light tracking-wide italic leading-relaxed"
            variants={taglineContainerVariants}
            initial="hidden"
            animate="visible"
          >
            {taglineWords.map((word, index) => (
              <motion.span
                key={index}
                variants={wordVariants}
                className="inline-block mr-2 sm:mr-3"
              >
                {word}
              </motion.span>
            ))}
          </motion.div>
        </div>

        {/* Elegant loading indicator - Positioned below the main group */}
        <motion.div
          className="mt-12 sm:mt-16 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 4 }}
        >
          <div className="flex space-x-2 sm:space-x-3">
            <motion.div
              className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-gray-300 rounded-full"
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.4, 1, 0.4] 
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                delay: 0,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-gray-300 rounded-full"
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.4, 1, 0.4] 
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                delay: 0.3,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-gray-300 rounded-full"
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.4, 1, 0.4] 
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                delay: 0.6,
                ease: "easeInOut"
              }}
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}