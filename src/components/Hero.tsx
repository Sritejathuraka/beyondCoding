import FeaturedCard from './FeaturedCard';
import { featuredArticle } from '../data/mockData';

const Hero = () => {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      {/* Left Content */}
      <div>
        <div className="flex items-center gap-2 text-[var(--color-primary)] text-sm font-medium tracking-wide mb-6">
          <span>MOBILE</span>
          <span>·</span>
          <span>AI</span>
          <span>·</span>
          <span>ENGINEERING</span>
        </div>
        
        <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
          <span className="text-[var(--color-text)]">Think </span>
          <span className="font-serif italic text-[var(--color-primary)]">beyond</span>
          <br />
          <span className="text-[var(--color-text)]">the code.</span>
        </h1>
        
        <p className="text-[var(--color-text-muted)] text-lg leading-relaxed mb-8 max-w-md">
          Insights on mobile development, AI engineering, and the craft of building things that matter — by Sriteja.
        </p>
        
        <div className="flex items-center gap-6">
          <button className="bg-[var(--color-text)] text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors">
            Start Reading
          </button>
          <a href="/topics" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors flex items-center gap-2">
            Browse Topics <span>→</span>
          </a>
        </div>
      </div>
      
      {/* Right Content - Featured Article */}
      <div>
        <FeaturedCard article={featuredArticle} />
      </div>
    </section>
  );
};

export default Hero;
