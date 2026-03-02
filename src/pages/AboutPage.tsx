import { Navbar, Footer } from '../components';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] bg-gradient-to-r from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20 blur-3xl pointer-events-none" />
          <span className="text-[var(--color-secondary)] text-sm font-medium uppercase tracking-wider mb-4 block relative">About</span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 relative">
            <span className="text-[var(--color-text)]">Hey, I'm </span>
            <span className="gradient-text">Sriteja</span>
          </h1>
        </div>

        {/* Profile Section */}
        <div className="glass rounded-2xl p-8 md:p-12 mb-12 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-36 h-36 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] p-1">
                <div className="w-full h-full rounded-xl bg-[var(--color-surface)] flex items-center justify-center text-5xl font-bold gradient-text">
                  ST
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center shadow-glow">
                <span className="text-white text-lg">💻</span>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">Sriteja Thuraka</h2>
              <p className="text-[var(--color-primary)] font-medium mb-4">Software Engineer · 9 Years Experience</p>
              <p className="text-[var(--color-text-muted)] leading-relaxed mb-6">
                I'm a passionate software engineer with nearly a decade of experience building high-quality mobile applications and software solutions. 
                I specialize in mobile development (iOS & Android), with deep expertise in creating user-focused experiences that make a real difference in people's lives.
              </p>

              {/* Social Links */}
              <div className="flex items-center justify-center md:justify-start gap-4">
                <a 
                  href="https://www.linkedin.com/in/sriteja1607/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 glass hover:border-[var(--color-primary)] text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-all duration-300 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  <span className="font-medium">LinkedIn</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Featured App Section */}
        <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <h3 className="text-xl font-bold text-[var(--color-text)] mb-6 flex items-center gap-2">
            <span className="text-2xl">🚀</span>
            Featured App
          </h3>
          
          <a 
            href="https://apps.apple.com/us/app/habilog/id6754950256" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block glass rounded-2xl p-6 hover:border-[var(--color-primary)] transition-all duration-300 group"
          >
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* App Icon */}
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] p-0.5 shrink-0 group-hover:shadow-glow transition-shadow duration-300">
                <div className="w-full h-full rounded-[14px] bg-[var(--color-surface)] flex items-center justify-center">
                  <span className="text-4xl">📝</span>
                </div>
              </div>

              {/* App Info */}
              <div className="text-center sm:text-left flex-1">
                <h4 className="text-xl font-bold text-[var(--color-text)] mb-1 group-hover:gradient-text transition-all">Habilog</h4>
                <p className="text-sm text-[var(--color-primary)] font-medium mb-3">Available on iOS</p>
                <p className="text-[var(--color-text-muted)] text-sm leading-relaxed mb-4">
                  A beautifully crafted habit tracking app designed to help you build better habits and achieve your goals. 
                  Track your daily progress, build streaks, and transform your life one habit at a time.
                </p>
                <div className="inline-flex items-center gap-2 text-[var(--color-primary)] font-medium text-sm group-hover:gap-3 transition-all">
                  <span>View on App Store</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </div>
          </a>
        </div>

        {/* Skills & Expertise Section */}
        <div className="mt-12 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <h3 className="text-xl font-bold text-[var(--color-text)] mb-6 flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            Expertise
          </h3>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '📱', title: 'iOS Development', desc: 'Swift, SwiftUI, UIKit' },
              { icon: '🤖', title: 'Android Development', desc: 'Kotlin, Jetpack Compose' },
              { icon: '⚛️', title: 'React & React Native', desc: 'Cross-platform apps' },
              { icon: '🔥', title: 'Firebase', desc: 'Backend & Analytics' },
              { icon: '🧠', title: 'AI/ML Integration', desc: 'Mobile AI features' },
              { icon: '🏗️', title: 'Architecture', desc: 'Clean, scalable code' },
            ].map((skill) => (
              <div key={skill.title} className="glass rounded-xl p-4 hover:border-[var(--color-primary)] transition-all duration-300">
                <span className="text-2xl mb-2 block">{skill.icon}</span>
                <h4 className="font-semibold text-[var(--color-text)] mb-1">{skill.title}</h4>
                <p className="text-sm text-[var(--color-text-muted)]">{skill.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* About This Blog Section */}
        <div className="mt-12 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <h3 className="text-xl font-bold text-[var(--color-text)] mb-6 flex items-center gap-2">
            <span className="text-2xl">✍️</span>
            About beyondCoding
          </h3>
          
          <div className="glass rounded-2xl p-6">
            <p className="text-[var(--color-text-muted)] leading-relaxed">
              <span className="font-semibold text-[var(--color-text)]">beyondCoding</span> is where I share my journey, insights, and learnings from 9 years of building software. 
              Here you'll find articles on mobile development, AI engineering, software architecture, and practical tips for becoming a better developer. 
              My goal is to help fellow developers level up their skills and build amazing products.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;
