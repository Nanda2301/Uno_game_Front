import { useState } from 'react';

const COLOR_MAP = {
  red: { bg: 'bg-red-600', gradient: 'from-red-500 to-red-700', shadow: 'shadow-red-900/50', text: 'text-white', oval: 'bg-red-800' },
  blue: { bg: 'bg-blue-600', gradient: 'from-blue-500 to-blue-700', shadow: 'shadow-blue-900/50', text: 'text-white', oval: 'bg-blue-800' },
  green: { bg: 'bg-green-600', gradient: 'from-green-500 to-green-700', shadow: 'shadow-green-900/50', text: 'text-white', oval: 'bg-green-800' },
  yellow: { bg: 'bg-yellow-400', gradient: 'from-yellow-300 to-yellow-500', shadow: 'shadow-yellow-900/50', text: 'text-yellow-900', oval: 'bg-yellow-500' },
  black: { bg: 'bg-gray-900', gradient: 'from-gray-800 to-black', shadow: 'shadow-black', text: 'text-white', oval: 'bg-gray-800' },
};

const VALUE_DISPLAY = {
  skip: '⊘',
  reverse: '⇄',
  draw2: '+2',
  wild: '★',
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

  // Segurança: Se não houver card e não for faceDown, não renderiza quebra
  if (!card && !faceDown) return null;

  const colorKey = card?.color || 'black';
  const colors = COLOR_MAP[colorKey] || COLOR_MAP.black;
  
  // Tratamento rigoroso do valor para evitar [object Object]
  const rawValue = card?.value !== undefined ? String(card.value) : '';
  const display = VALUE_DISPLAY[rawValue] || rawValue.toUpperCase();
  
  const isWild = rawValue === 'wild' || rawValue === 'wild_draw4' || colorKey === 'black';

  const sizeClasses = {
    xs: 'w-10 h-14 text-xs',
    sm: 'w-14 h-20 text-sm',
    md: 'w-20 h-28',
    lg: 'w-24 h-36 text-xl',
    xl: 'w-32 h-44 text-2xl',
  };

  const baseClass = `
    ${sizeClasses[size] || sizeClasses.md}
    relative rounded-xl select-none shadow-xl transition-all duration-200 ease-out
    ${onClick && !disabled ? 'cursor-pointer' : disabled ? 'cursor-not-allowed opacity-60' : 'cursor-default'}
    ${selected ? '-translate-y-6 ring-4 ring-yellow-400 scale-105 z-20' : ''}
    ${onClick && !disabled && hovered && !selected ? '-translate-y-4 scale-105 z-10' : ''}
    ${className}
  `;

  return (
    <div
      className={baseClass}
      style={{ animationDelay: `${animationDelay}ms`, ...style }}
      onClick={onClick && !disabled ? onClick : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {faceDown ? (
        <div className="w-full h-full rounded-xl overflow-hidden border-4 border-white bg-[#b72428] flex items-center justify-center shadow-lg">
          <div className="w-[85%] h-[85%] border-2 border-white/20 rounded-lg flex items-center justify-center bg-gradient-to-br from-red-700 to-red-900">
            <span className="font-black text-white italic text-xl tracking-tighter rotate-[-20deg] drop-shadow-lg">UNO</span>
          </div>
        </div>
      ) : (
        <div className={`w-full h-full rounded-xl overflow-hidden border-2 border-white/50 ${colors.shadow}`}>
          <div className={`w-full h-full bg-gradient-to-br ${colors.gradient} relative`}>
            <div className={`absolute inset-2 ${colors.oval} rounded-[50%] opacity-30 rotate-[35deg]`} />
            <div className={`absolute top-1 left-1.5 font-black ${colors.text} leading-none z-10`} style={{ fontSize: size === 'xs' ? '8px' : '12px' }}>
              {display}
            </div>
            <div className={`absolute inset-0 flex items-center justify-center z-10`}>
              {isWild && (rawValue.includes('wild') || !rawValue) ? (
                <div className="grid grid-cols-2 gap-0.5 w-10 h-10 rotate-[15deg]">
                  <div className="rounded-tl-full bg-red-500 border border-white/20" />
                  <div className="rounded-tr-full bg-blue-500 border border-white/20" />
                  <div className="rounded-bl-full bg-yellow-400 border border-white/20" />
                  <div className="rounded-br-full bg-green-500 border border-white/20" />
                </div>
              ) : (
                <span className={`font-black ${colors.text} leading-none text-center drop-shadow-[2px_2px_0px_rgba(0,0,0,0.4)]`}
                  style={{ fontSize: size === 'lg' ? '42px' : '32px', fontStyle: 'italic' }}>
                  {display}
                </span>
              )}
            </div>
            <div className={`absolute bottom-1 right-1.5 font-black ${colors.text} leading-none z-10 rotate-180`} style={{ fontSize: size === 'xs' ? '8px' : '12px' }}>
              {display}
            </div>
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/5 pointer-events-none" />
          </div>
        </div>
      )}
    </div>
  );
}