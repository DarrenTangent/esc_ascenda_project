// components/SafeHotelImage.tsx
'use client';

import Image, { ImageProps } from 'next/image';
import { useMemo, useState } from 'react';

type Props = {
  hotelId?: string;
  imageUrl?: string;        // API primary URL
  fallbackPrefix?: string;  // e.g. https://d2ey9sqrvkqdfs.cloudfront.net/
  fallbackIndex?: number;   // default 0
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  quality?: number;
  priority?: boolean;
  // optionally override which hosts should use <Image> (others will use <img>)
  allowedHosts?: string[];
};

function ensureHttps(src?: string) {
  if (!src) return '';
  if (src.startsWith('//')) return 'https:' + src;
  if (src.startsWith('http://')) return src.replace(/^http:\/\//i, 'https://');
  return src;
}

function getHost(u: string) {
  try {
    return new URL(u).hostname;
  } catch {
    return '';
  }
}

export default function SafeHotelImage({
  hotelId,
  imageUrl,
  fallbackPrefix,
  fallbackIndex = 0,
  alt,
  fill,
  width,
  height,
  className,
  sizes,
  quality = 85,
  priority = false,
  allowedHosts = [
    // Add the remote hosts you configured in next.config.js
    'd2ey9sqrvkqdfs.cloudfront.net',
    'cf.bstatic.com',
    'pix8.agoda.net',
    'dynamic-media-cdn.tripadvisor.com',
    'q-xx.bstatic.com',
    'res.cloudinary.com',
  ],
}: Props) {
  // Primary and fallback URLs (normalized)
  const primary = useMemo(() => ensureHttps(imageUrl), [imageUrl]);
  const fallback = useMemo(() => {
    if (fallbackPrefix && hotelId) {
      // Ensure prefix has protocol and trailing slash logic is correct
      const safePrefix = ensureHttps(fallbackPrefix).replace(/\/$/, '');
      return `${safePrefix}/${hotelId}/${fallbackIndex}.jpg`;
    }
    return '';
  }, [fallbackPrefix, hotelId, fallbackIndex]);

  const initial = primary || fallback || '/placeholder-hotel.jpg';
  const [src, setSrc] = useState(initial);

  const finalHost = getHost(src);
  const useNextImage = finalHost && allowedHosts.includes(finalHost);

  const handleError = () => setSrc('/placeholder-hotel.jpg');

  // Common props for both render paths
  const style = { objectFit: 'cover' as const };

  if (useNextImage) {
    // Render with next/image (optimized) for whitelisted hosts
    const common: Partial<ImageProps> = {
      alt,
      className,
      sizes,
      quality,
      priority,
      onError: handleError,
    };

    if (fill) {
      return <Image {...common} src={src} fill style={style} />;
    }
    return (
      <Image
        {...common}
        src={src}
        width={width ?? 800}
        height={height ?? 600}
        style={style}
      />
    );
  }

  // Render a plain <img> for non-whitelisted hosts to avoid Next domain errors
  if (fill) {
    return (
      <img
        src={src}
        alt={alt}
        onError={handleError}
        className={className}
        style={{ ...style, width: '100%', height: '100%', position: 'absolute', inset: 0 }}
      />
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      onError={handleError}
      className={className}
      width={width ?? 800}
      height={height ?? 600}
      style={style}
    />
  );
}
