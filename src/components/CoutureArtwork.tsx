/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { resolveFashionImageUrl } from '../data/seedData';

interface CoutureArtworkProps {
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
  sku?: string;
  className?: string;
}

export const CoutureArtwork: React.FC<CoutureArtworkProps> = ({
  src,
  alt,
  title,
  subtitle,
  sku,
  className = '',
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const resolvedSrc = resolveFashionImageUrl(src, sku || title);

  return (
    <div className={`relative overflow-hidden bg-stone-100 ${className}`}>
      {!imgFailed && resolvedSrc ? (
        <img
          src={resolvedSrc}
          alt={alt}
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={() => setImgFailed(true)}
          className="w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-stone-100 to-stone-200">
          <span className="text-[11px] font-mono uppercase tracking-widest text-rose-900 mb-2">
            {subtitle || 'Shingar Dresses'}
          </span>
          <p className="font-serif text-xl text-stone-900 max-w-[220px] leading-snug">
            {title || alt}
          </p>
        </div>
      )}
    </div>
  );
};
