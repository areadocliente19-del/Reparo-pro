import React from 'react';

interface DamageVisualizerProps {
  selectedParts: string[];
  onPartClick: (partId: string) => void;
  onPartSelect: (partId: string) => void;
}

const CarPart: React.FC<{ id: string; d: string; selected: boolean; onClick: (id: string) => void, onSelect: (id: string) => void }> = ({ id, d, selected, onClick, onSelect }) => {
  const handleClick = (e: React.MouseEvent) => {
      onClick(id);
      onSelect(id);
  }
  return (
    <path
      id={id}
      d={d}
      className={`stroke-gray-400 stroke-[1.5] fill-transparent cursor-pointer transition-all duration-200 ${selected ? 'stroke-blue-500 stroke-[3] fill-blue-500/20' : 'hover:stroke-blue-400 hover:stroke-2'}`}
      onClick={handleClick}
    />
  );
};

const DamageVisualizer: React.FC<DamageVisualizerProps> = ({ selectedParts, onPartClick, onPartSelect }) => {
  // SVG paths for each view based on blueprint style
  const topViewParts = [
    { id: 'hood', d: 'M55,300 L145,300 L155,390 L45,390 Z' },
    { id: 'roof', d: 'M60,160 L140,160 L145,300 L55,300 Z' },
    { id: 'trunk', d: 'M65,70 L135,70 L140,160 L60,160 Z' },
    { id: 'front-left-fender', d: 'M45,390 L25,380 C 25,350 45,310 55,300 Z' },
    { id: 'front-right-fender', d: 'M155,390 L175,380 C 175,350 155,310 145,300 Z' },
    { id: 'rear-left-fender', d: 'M65,70 L35,80 C 35,110 55,150 60,160 Z'},
    { id: 'rear-right-fender', d: 'M135,70 L165,80 C 165,110 145,150 140,160 Z'}
  ];
  
  const frontViewParts = [
    { id: 'front-bumper', d: 'M40,135 L260,135 L250,160 L50,160 Z' },
    { id: 'hood', d: 'M80,80 L220,80 L240,110 L60,110 Z' },
    { id: 'front-left-fender', d: 'M30,90 L80,80 L60,110 L40,135 Z' },
    { id: 'front-right-fender', d: 'M270,90 L220,80 L240,110 L260,135 Z' },
    { id: 'roof', d: 'M90,50 L210,50 L220,80 L80,80 Z' },
  ];
  
  const rearViewParts = [
      { id: 'rear-bumper', d: 'M40,135 L260,135 L250,160 L50,160 Z' },
      { id: 'trunk', d: 'M70,80 L230,80 L240,135 L60,135 Z' },
      { id: 'rear-left-fender', d: 'M30,90 L70,80 L60,135 L40,135 Z'},
      { id: 'rear-right-fender', d: 'M270,90 L230,80 L240,135 L260,135 Z'},
      { id: 'roof', d: 'M90,50 L210,50 L220,80 L80,80 Z'},
  ];

  const leftSideViewParts = [
    { id: 'front-left-fender', d: 'M300,80 L380,85 L370,125 L325,125 A 25 25 0 0 1 300,100 Z' },
    { id: 'front-left-door', d: 'M200,75 L300,80 L300,130 L200,130 Z' },
    { id: 'rear-left-door', d: 'M100,75 L200,75 L200,130 L100,130 Z' },
    { id: 'rear-left-fender', d: 'M20,90 L100,75 L100,125 L45,125 A 25 25 0 0 1 20,100 Z' },
    { id: 'left-rocker-panel', d: 'M100,130 L300,130 L300,140 L100,140 Z' },
    { id: 'hood', d: 'M300 80 C 320 60, 370 65, 380 85' },
    { id: 'roof', d: 'M100,75 L300,80 C 280 60, 120 60, 100 75 Z' },
    { id: 'trunk', d: 'M20 90 L100 75 C 80 70, 30 75, 20 90 Z'},
  ];

  const rightSideViewParts = [
    { id: 'front-right-fender', d: 'M100,80 L20,85 L30,125 L75,125 A 25 25 0 0 0 100,100 Z' },
    { id: 'front-right-door', d: 'M200,75 L100,80 L100,130 L200,130 Z' },
    { id: 'rear-right-door', d: 'M300,75 L200,75 L200,130 L300,130 Z' },
    { id: 'rear-right-fender', d: 'M380,90 L300,75 L300,125 L355,125 A 25 25 0 0 0 380,100 Z' },
    { id: 'right-rocker-panel', d: 'M100,130 L300,130 L300,140 L100,140 Z' },
    { id: 'hood', d: 'M100 80 C 80 60, 30 65, 20 85' },
    { id: 'roof', d: 'M300,75 L100,80 C 120 60, 280 60, 300 75 Z' },
    { id: 'trunk', d: 'M380 90 L300 75 C 320 70, 370 75, 380 90 Z'},
  ];

  const renderCarView = (title: string, parts: {id: string, d: string}[], viewBox: string, contextShapes: React.ReactNode) => (
    <div className="border border-gray-700 rounded-lg p-2 bg-gray-800/30">
      <h4 className="text-center font-semibold text-gray-400 mb-1 text-sm">{title}</h4>
      <svg viewBox={viewBox} xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
        <g className="stroke-gray-600 stroke-1 fill-none">
          {contextShapes}
        </g>
        {parts.map(part => (
          <CarPart
            key={`${title}-${part.id}`}
            id={part.id}
            d={part.d}
            selected={selectedParts.includes(part.id)}
            onClick={onPartClick}
            onSelect={onPartSelect}
          />
        ))}
      </svg>
    </div>
  );

  return (
    <div className="bg-gray-900/50 p-2 rounded-lg border border-gray-700 shadow-inner">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          {renderCarView("Topo", topViewParts, "0 0 200 420", 
            <>
              {/* Car Body Outline */}
              <path d="M50,20 C30,20 20,40 25,80 L45,390 C50,410 60,410 60,390 L140,390 C140,410 150,410 155,390 L175,80 C180,40 170,20 150,20 Z" />
              {/* Windows */}
              <path d="M55,300 L145,300 L140,280 L60,280 Z" />
              <path d="M60,160 L140,160 L135,180 L65,180 Z" />
              {/* Side Mirrors */}
              <path d="M45,280 L25,290 L25,270 L45,280 Z" />
              <path d="M155,280 L175,290 L175,270 L155,280 Z" />
            </>
          )}
        </div>
        {renderCarView("Frente", frontViewParts, "0 0 300 180", 
          <>
            {/* Car Body Outline */}
            <path d="M30,90 C10,110 10,150 40,160 L260,160 C290,150 290,110 270,90 L220,80 L80,80 Z" />
            {/* Windshield */}
            <path d="M80,80 L220,80 L210,50 L90,50 Z" />
            {/* Grille */}
            <rect x="90" y="115" width="120" height="20" />
            {/* Headlights */}
            <path d="M30,90 L80,80 L60,110 Z" />
            <path d="M270,90 L220,80 L240,110 Z" />
          </>
        )}
        {renderCarView("Traseira", rearViewParts, "0 0 300 180", 
          <>
            {/* Car Body Outline */}
            <path d="M30,90 C10,110 10,150 40,160 L260,160 C290,150 290,110 270,90 L230,80 L70,80 Z" />
            {/* Rear Window */}
            <path d="M70,80 L230,80 L210,50 L90,50 Z" />
            {/* Tail lights */}
            <path d="M30,90 L70,80 L60,135 Z" />
            <path d="M270,90 L230,80 L240,135 Z" />
          </>
        )}
        {renderCarView("Lateral Esquerda", leftSideViewParts, "0 0 400 160",
          <>
            {/* Car Body Outline */}
            <path d="M20,100 C10,120 20,140 45,140 L355,140 C380,140 390,120 380,100 L380,85 C370,65 320,60 300,80 L100,75 C80,60 30,65 20,90 Z" />
            {/* Windows */}
            <path d="M105,78 L195,78 L195,110 L105,110 Z" /> {/* Rear */}
            <path d="M205,78 L295,82 L295,110 L205,110 Z" /> {/* Front */}
            {/* Wheels */}
            <circle cx="70" cy="125" r="20" />
            <circle cx="330" cy="125" r="20" />
          </>
        )}
        {renderCarView("Lateral Direita", rightSideViewParts, "0 0 400 160",
          <>
            {/* Car Body Outline */}
            <path d="M380,100 C390,120 380,140 355,140 L45,140 C20,140 10,120 20,100 L20,85 C30,65 80,60 100,80 L300,75 C320,60 370,65 380,90 Z" />
            {/* Windows */}
            <path d="M295,78 L205,78 L205,110 L295,110 Z" /> {/* Rear */}
            <path d="M195,78 L105,82 L105,110 L195,110 Z" /> {/* Front */}
            {/* Wheels */}
            <circle cx="330" cy="125" r="20" />
            <circle cx="70" cy="125" r="20" />
          </>
        )}
      </div>
    </div>
  );
};

export default DamageVisualizer;
