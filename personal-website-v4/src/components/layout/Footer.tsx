import Link from '@/components/ui/SiteLink';
import { Arrow } from '@/components/ui/Arrow';
import { BrandMark } from '@/components/ui/BrandMark';
export function Footer({ name, github }: { name: string; github?: string }) {
  return <footer className="site-footer container"><p className="footer-signature"><BrandMark /><span>{name === 'Brian Wendot' ? 'Brian Wendot Koringo' : name}<span className="footer-aside">A little space for curiosity.</span></span></p><div>{github && <a href={github}>GitHub <Arrow external /></a>}<Link href="/#contact">Say hello <Arrow /></Link><a href="#top" className="back-top" aria-label="Back to top">↑</a></div></footer>;
}
