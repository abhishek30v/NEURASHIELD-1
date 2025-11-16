import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiShield } from 'react-icons/fi';

// Spline is imported conditionally to prevent issues if the package isn't installed
let Spline;
try {
  Spline = React.lazy(() => import('@splinetool/react-spline'));
} catch (err) {
  console.warn('Spline package not found. Using fallback background.');
}

const FloatingWord = ({ word, initialX, initialY }) => {
  // Generate random positions across the entire viewport
  const randomPosition = () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    scale: Math.random() * 0.5 + 0.5, // Random size between 0.5 and 1
    opacity: Math.random() * 0.15 + 0.05 // Random opacity between 0.05 and 0.2
  });

  // Generate 5 random positions for the animation path
  const positions = Array.from({ length: 5 }, randomPosition);
  
  return (
    <motion.div
      className="fixed text-white font-medium pointer-events-none select-none"
      style={{
        fontSize: `${Math.random() * 1.5 + 1.5}rem`, // Random size between 1.5rem and 3rem (25% smaller)
      }}
      initial={{
        x: positions[0].x,
        y: positions[0].y,
        scale: positions[0].scale,
        opacity: positions[0].opacity
      }}
      animate={{
        x: positions.map(p => p.x),
        y: positions.map(p => p.y),
        scale: positions.map(p => p.scale),
        opacity: positions.map(p => p.opacity),
        rotate: [0, 45, -45, 20, 0],
      }}
      transition={{
        duration: Math.random() * 20 + 25, // Random duration between 25-45 seconds
        repeat: Infinity,
        repeatType: "reverse",
        ease: "linear"
      }}
    >
      {word}
    </motion.div>
  );
};

const FloatingWordsLayer = () => {
  const words = [
    "FAKE", "REAL", "100%", "20%", "AI", "DEEP",
    "TRUE", "FALSE", "DETECT", "SCAN", "CHECK", "VERIFY",
    "ML", "ANALYSIS", "NEURAL", "GAN", "SYNTHETIC", "AUTHENTIC",
    "DIGITAL", "CYBER", "SECURITY", "ALERT", "DETECTION", "DATA"
  ];

  return (
    <div className="fixed inset-0 z-[5] overflow-hidden">
      {words.map((word, index) => (
        <FloatingWord
          key={index}
          word={word}
          initialX={Math.random() * window.innerWidth}
          initialY={Math.random() * window.innerHeight}
        />
      ))}
    </div>
  );
};

const SplineLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
    <div className="text-2xl text-white">Loading 3D Scene...</div>
  </div>
);

const HomePage = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/10 to-indigo-950/20 text-white overflow-x-hidden">
      {/* Animated background pattern */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 40% 20%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)`
        }}></div>
      </div>

      {/* Main Content - Asymmetric Layout */}
      <div className="relative z-10">
        {/* Hero Section - Split Layout */}
        <section className="min-h-screen flex items-center px-6 lg:px-12 py-20">
          <div className="w-full max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Side - Content */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                <div className="inline-block px-4 py-2 glass-purple rounded-full border border-purple-500/30 mb-4">
                  <span className="text-sm font-medium text-purple-300">Next-Gen Security Platform</span>
                </div>
                
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight">
                  <span className="block text-white">Neuro</span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-pink-400">
                    Scan
                  </span>
                </h1>
                
                <p className="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-xl">
                  Advanced AI-powered threat detection system that protects your infrastructure with real-time monitoring and intelligent analysis.
                </p>
                
                <div className="flex flex-wrap gap-4 pt-4">
                  <Link 
                    to="/auth" 
                    className="btn-purple-primary"
                  >
                    Get Started
                  </Link>
                  <Link 
                    to="/dashboard" 
                    className="btn-purple-outline"
                  >
                    View Dashboard
                  </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 pt-8">
                  <div>
                    <div className="text-3xl font-bold text-purple-400">95%</div>
                    <div className="text-sm text-gray-400 mt-1">Accuracy</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-indigo-400">&lt;1s</div>
                    <div className="text-sm text-gray-400 mt-1">Response</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-pink-400">24/7</div>
                    <div className="text-sm text-gray-400 mt-1">Monitoring</div>
                  </div>
                </div>
              </motion.div>

              {/* Right Side - Visual Cards */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="grid grid-cols-2 gap-4"
              >
                <div className="card card-hover col-span-2 h-48 bg-gradient-to-br from-purple-600/20 to-indigo-600/20">
                  <div className="h-full flex flex-col justify-center items-center">
                    <div className="text-4xl mb-2">🛡️</div>
                    <div className="text-lg font-semibold text-purple-300">Real-time Protection</div>
                  </div>
                </div>
                <div className="card card-hover h-32 bg-gradient-to-br from-indigo-600/20 to-pink-600/20">
                  <div className="h-full flex flex-col justify-center items-center">
                    <div className="text-2xl mb-1">⚡</div>
                    <div className="text-sm font-medium text-indigo-300">Fast Analysis</div>
                  </div>
                </div>
                <div className="card card-hover h-32 bg-gradient-to-br from-pink-600/20 to-purple-600/20">
                  <div className="h-full flex flex-col justify-center items-center">
                    <div className="text-2xl mb-1">🧠</div>
                    <div className="text-sm font-medium text-pink-300">AI Powered</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section - Asymmetric Grid */}
        <section className="py-24 px-6 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="text-white">Core </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
                  Capabilities
                </span>
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl">
                Advanced detection features powered by cutting-edge AI and machine learning algorithms
              </p>
            </motion.div>

            {/* Asymmetric Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => {
                // Create asymmetric sizing
                const isLarge = index === 0 || index === 3;
                return (
                  <motion.div
                    key={index}
                    className={`card card-hover ${isLarge ? 'md:col-span-2 lg:col-span-2' : ''}`}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600/30 to-indigo-600/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">
                          {index % 3 === 0 ? '🔍' : index % 3 === 1 ? '⚡' : '🛡️'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2 text-purple-300">{feature.title}</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

const features = [
  {
    title: "High Accuracy Detection",
    description: "Our advanced AI algorithms can detect even the most sophisticated cybersecurity threats with an accuracy of over 95%."
  },
  {
    title: "Rapid Analysis",
    description: "Get results within seconds, allowing you to quickly identify and respond to potential threats."
  },
  {
    title: "Multi-Model Approach",
    description: "We use multiple detection models to cross-verify results, reducing false positives."
  },
  {
    title: "Continuous Learning",
    description: "Our system continuously learns from new threat techniques to stay ahead of malicious actors."
  },
  {
    title: "Detailed Reports",
    description: "Receive comprehensive reports on detected threats with detailed technical information."
  },
  {
    title: "Privacy Focused",
    description: "All network traffic is processed securely and analyzed with privacy in mind."
  }
];

export default HomePage; 