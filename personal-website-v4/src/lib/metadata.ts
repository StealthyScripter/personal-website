import type { Metadata } from 'next';
import { site } from '@/content/site';
import { basePath, assetUrl } from './urls';

export function pageMetadata(title: string, description: string, pathname: string, image?: string): Metadata {
  const url = `${site.url}${basePath}${pathname}`;
  const imageUrl = new URL(assetUrl(image || '/brand/social-preview.png'), site.url).href;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} · ${site.name}`, description, url, siteName: site.name, type: 'website',
      ...(imageUrl ? { images: [{ url: imageUrl }] } : {}),
    },
    twitter: { card: 'summary_large_image', title, description, images: [imageUrl] },
  };
}
