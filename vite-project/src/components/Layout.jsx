import { useState } from 'react';

const COLOR_MAP = {
  red: {
    bg: 'bg-uno-red',
    gradient: 'from-red-600 to-uno-red',
    shadow: 'card-shadow-red',
    text: 'text-red-100',
    oval: 'bg-red-700',
    light: '#ff6b6b',
  },
  blue: {
    bg: 'bg-uno-blue',
    gradient: 'from-blue-700 to-uno-blue',
    shadow: 'card-shadow-blue',
    text: 'text-blue-100',
    oval: 'bg-blue-800',
    light: '#5b9bd5',
  },
  green: {
    bg: 'bg-uno-green',
    gradient: 'from-green-600 to-uno-green',
    shadow: 'card-shadow-green',
    text: 'text-green-100',
    oval: 'bg-green-700',
    light: '#52c789',
  },
  yellow: {
    bg: 'bg-uno-yellow',
    gradient: 'from-yellow-400 to-uno-yellow',
    shadow: 'card-shadow-yellow',
    text: 'text-yellow-900',
    oval: 'bg-yellow-500',
    light: '#ffd700',
  },
  black: {
    bg: 'bg-gray-900',
    gradient: 'from-gray-800 to-gray-950',
    shadow: 'card-shadow-black',
    text: 'text-white',
    oval: 'bg-gray-800',
    light: '#8b5cf6',
  },
};

const VALUE_DISPLAY = {
  skip: '⊘',
  reverse: '⇄',
  draw2: '+2',
  wild: '★',
  wild_draw4: '+4',
};

const EFFECT_LABEL = {
  skip: 'SKIP',
  reverse: 'REV',
  draw2: '+2',
  wild: 'WILD',
  wild_draw4: '+4',
};

export default function UnoCard({
  card,
  size = 'md',
  onClick,
  selected = false,
  disabled = false,
  faceDown = false,
  className = '',
  style = {},
  animationDelay = 0,
}) {
  const [hovered, setHovered] = useState(false);

  const colorKey = card?.color || 'black';
  const colors = COLOR_MAP[colorKey] || COLOR_MAP.black;
  const value = card?.value || '';
  const display = VALUE_DISPLAY[value] || value?.toUpperCase();
  const isSpecial = ['skip', 'reverse', 'draw2', 'wild', 'wild_draw4'].includes(value);
  const isWild = value === 'wild' || value === 'wild_draw4';

  const sizeClasses = {
    xs: 'w-10 h-14 text-xs',
    sm: 'w-14 h-20 text-sm',
    md: 'w-20 h-28',
    lg: 'w-24 h-36 text-xl',
    xl: 'w-32 h-44 text-2xl',
  };

  const baseClass = `
    ${sizeClasses[size] || sizeClasses.md}
    relative rounded-xl select-none
    transition-all duration-200 ease-out
    ${onClick && !disabled ? 'cursor-pointer' : disabled ? 'cursor-not-allowed' : 'cursor-default'}
    ${selected ? '-translate-y-6 ring-4 ring-white ring-opacity-90 scale-105' : ''}
    ${onClick && !disabled && hovered && !selected ? '-translate-y-3 scale-102' : ''}
    ${disabled ? 'opacity-40' : ''}
    ${className}
  `;

  return (
    <div
      className={baseClass}
      style={{
        animationDelay: `${animationDelay}ms`,
        ...style,
      }}
      onClick={onClick && !disabled ? onClick : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {faceDown ? (
        /* Card Back */
        <div className="w-full h-full rounded-xl overflow-hidden bg-arena-card border-2 border-white border-opacity-10 card-shadow-black">
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-950 flex items-center justify-center relative">
            {/* Pattern */}
            <div className="absolute inset-2 rounded-lg border-2 border-white border-opacity-10" />
            <div className="absolute inset-4 rounded-md border border-white border-opacity-5" />
            <span className="font-display text-white text-opacity-20 text-2xl tracking-widest">UNO</span>
          </div>
        </div>
      ) : (
        /* Card Front */
        <div className={`w-full h-full rounded-xl overflow-hidden border-2 border-white border-opacity-30 ${colors.shadow}`}>
          <div className={`w-full h-full bg-gradient-to-br ${colors.gradient} relative`}>
            {/* White oval center */}
            <div className={`absolute inset-2 ${colors.oval} rounded-lg opacity-40 rotate-12`} />

            {/* Top-left value */}
            <div className={`absolute top-1 left-2 font-display ${colors.text} leading-none z-10`}
              style={{ fontSize: size === 'xs' ? '10px' : size === 'sm' ? '12px' : '14px' }}>
              {display}
            </div>

            {/* Center value */}
            <div className={`absolute inset-0 flex items-center justify-center z-10`}>
              {isWild ? (
                <div className="grid grid-cols-2 gap-0.5 w-8 h-8">
                  <div className="rounded-tl-full bg-uno-red" />
                  <div className="rounded-tr-full bg-uno-blue" />
                  <div className="rounded-bl-full bg-uno-yellow" />
                  <div className="rounded-br-full bg-uno-green" />
                </div>
              ) : (
                <span className={`font-display ${colors.text} leading-none text-center`}
                  style={{
                    fontSize: size === 'xs' ? '18px' : size === 'sm' ? '22px' : size === 'lg' ? '36px' : size === 'xl' ? '44px' : '28px',
                    textShadow: '2px 2px 0 rgba(0,0,0,0.3)',
                  }}>
                  {display}
                </span>
              )}
            </div>

            {/* Bottom-right value (rotated) */}
            <div className={`absolute bottom-1 right-2 font-display ${colors.text} leading-none z-10 rotate-180`}
              style={{ fontSize: size === 'xs' ? '10px' : size === 'sm' ? '12px' : '14px' }}>
              {display}
            </div>

            {/* Gloss overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent opacity-10 rounded-xl pointer-events-none" />
          </div>
        </div>
      )}

      {/* Selection glow */}
      {selected && (
        <div className="absolute -inset-1 rounded-xl bg-white opacity-20 blur-sm pointer-events-none" />
      )}
    </div>
  );
}