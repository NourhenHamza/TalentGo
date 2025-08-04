
import { motion } from "framer-motion";

export const AnimatedBackground = () => {
  return (
    <>
      <Particles />
      <ColorfulOrbs />
      <GradientBeams />
    </>
  );
};

const Particles = () => {
  const particles = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    color: getRandomColor(0.3),
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: 10 + Math.random() * 20,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            x: [
              Math.random() * 100 - 50,
              Math.random() * 100 - 50,
              Math.random() * 100 - 50,
            ],
            y: [
              Math.random() * 100 - 50,
              Math.random() * 100 - 50,
              Math.random() * 100 - 50,
            ],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

// Colorful orbs animation
const ColorfulOrbs = () => {
  const orbs = [
    { color: "from-purple-300/30 to-pink-200/20", size: "w-64 h-64", position: "-top-32 -left-20" },
    { color: "from-indigo-300/30 to-blue-200/20", size: "w-80 h-80", position: "top-1/3 -right-20" },
    { color: "from-blue-300/20 to-teal-200/10", size: "w-72 h-72", position: "bottom-1/4 -left-20" },
    { color: "from-pink-300/20 to-purple-200/10", size: "w-56 h-56", position: "-bottom-20 right-1/4" },
  ];

  return (
    <>
      {orbs.map((orb, index) => (
        <motion.div
          key={index}
          className={`absolute ${orb.position} ${orb.size} rounded-full bg-gradient-to-br ${orb.color} blur-3xl opacity-60`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.6, 0.4],
            rotate: [0, index % 2 === 0 ? 15 : -15, 0],
          }}
          transition={{
            duration: 8 + index * 2,
            repeat: Infinity,
            repeatType: "reverse",
            delay: index * 1.5,
          }}
        />
      ))}
    </>
  );
};

// Gradient beams
const GradientBeams = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute -top-1/4 left-1/3 w-[800px] h-[500px] bg-gradient-to-br from-indigo-300/10 via-purple-300/5 to-transparent rounded-full blur-3xl"
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
      <motion.div
        className="absolute bottom-0 right-1/4 w-[600px] h-[400px] bg-gradient-to-tr from-blue-300/10 via-teal-300/5 to-transparent rounded-full blur-3xl"
        animate={{
          x: [0, -30, 0],
          y: [0, -20, 0],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          repeatType: "reverse",
          delay: 2,
        }}
      />
    </div>
  );
};

// Helper function for random colors
function getRandomColor(opacity = 1) {
  const colors = [
    `rgba(129, 140, 248, ${opacity})`, // indigo
    `rgba(165, 180, 252, ${opacity})`, // lighter indigo
    `rgba(196, 181, 253, ${opacity})`, // lavender
    `rgba(216, 180, 254, ${opacity})`, // light purple
    `rgba(240, 171, 252, ${opacity})`, // pink
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
}
