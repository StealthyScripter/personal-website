import Head from 'next/head';
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Skills from '@/components/Skills';
import Projects from '@/components/Projects';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import AnimatedBackground from '@/components/AnimatedBackground';

export default function Home() {
  return (
    <>
      <Head>
        <title>Brian Wendot | Portfolio</title>
        <meta name="description" content="Software Developer & Digital Craftsman" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div>
        <AnimatedBackground />
        <Navigation />
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Contact />
        <Footer />
      </div>
    </>
  );
}
