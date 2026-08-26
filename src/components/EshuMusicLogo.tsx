import React, { useState } from 'react';
import eshuLogoImage from '../assets/images/eshu_logo_1787596023085.jpg';

interface EshuMusicLogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
}

export const EshuMusicLogo: React.FC<EshuMusicLogoProps> = ({
  className = 'w-9 h-9',
  size,
  showText = false,
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div 
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={size ? { width: size, height: size } : undefined}
    >
      {!imageError ? (
        <img
          src={eshuLogoImage || '/eshu-logo.png'}
          alt="Eshu Music Logo"
          className="w-full h-full object-contain rounded-xl drop-shadow-[0_0_12px_rgba(255,82,82,0.4)]"
          onError={(e) => {
            if ((e.currentTarget as HTMLImageElement).src !== '/eshu-logo.png') {
              (e.currentTarget as HTMLImageElement).src = '/eshu-logo.png';
            } else {
              setImageError(true);
            }
          }}
        />
      ) : (
        <div className="w-full h-full rounded-xl bg-gradient-to-br from-[#0B132B] via-[#1C1438] to-[#081A2C] border border-[#00F2FE]/40 flex items-center justify-center font-extrabold text-white text-xs">
          EM
        </div>
      )}
    </div>
  );
};

