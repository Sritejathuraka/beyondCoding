import { Navbar, Hero, LatestArticles, ExploreTopics, Newsletter, Footer } from '../components';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Navbar />
      <main>
        <Hero />
        <LatestArticles />
        <ExploreTopics />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
