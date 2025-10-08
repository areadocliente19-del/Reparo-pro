

import React from 'react';
import { Quote, DamagedPart, Part, Material } from '../types';
import Card from './ui/Card';
import { LABOR_COST_PER_HOUR } from '../constants';

interface EstimateSummaryProps {
  quote: Quote;
  updateDamagedParts: (parts: { [key: string]: DamagedPart }) => void;
}

const serviceTypeLabels = {
  bodywork: 'Funilaria',
  prep: 'Preparação',
  paint: 'Pintura',
  finishing: 'Acabamento',
};

const EstimateSummary: React.FC<EstimateSummaryProps> = ({ quote, updateDamagedParts }) => {
  const handleServiceHourChange = (partId: string, serviceId: string, hours: number) => {
    const newParts = { ...quote.damagedParts };
    const service = newParts[partId].services.find(s => s.id === serviceId);
    if (service) {
      service.laborHours = hours;
      updateDamagedParts(newParts);
    }
  };
  
  const handleItemChange = (
    partId: string,
    itemType: 'replacementParts' | 'materials',
    itemIndex: number,
    field: 'quantity' | 'unitCost',
    value: number
  ) => {
    const newParts = { ...quote.damagedParts };
    const item = newParts[partId][itemType][itemIndex];
    if (item) {
      (item as any)[field] = value;
      updateDamagedParts(newParts);
    }
  };

  const totals = React.useMemo(() => {
    let labor = 0;
    let parts = 0;
    let materials = 0;
    const laborByType = {
      bodywork: 0,
      prep: 0,
      paint: 0,
      finishing: 0,
    };

    // FIX: Using Object.keys().forEach ensures correct type inference for the `totals` object.
    // `Object.values` with an indexed object type can sometimes lead to `unknown[]`, causing type errors.
    Object.keys(quote.damagedParts).forEach(partId => {
      const part = quote.damagedParts[partId];
      part.services.forEach(s => {
        const serviceCost = s.laborHours * s.costPerHour;
        labor += serviceCost;
        if (s.type in laborByType) {
          laborByType[s.type as keyof typeof laborByType] += serviceCost;
        }
      });
      part.replacementParts.forEach(p => parts += p.quantity * p.unitCost);
      part.materials.forEach(m => materials += m.quantity * m.unitCost);
    });

    return { labor, parts, materials, laborByType, total: labor + parts + materials };
  }, [quote.damagedParts]);

  return (
    <Card>
      <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">5. Resumo do Orçamento</h2>
      <div className="space-y-6">
        {Object.keys(quote.damagedParts).length === 0 ? (
          <p className="text-gray-400">Nenhuma peça selecionada para reparo.</p>
        ) : (
          Object.values(quote.damagedParts).map((part: DamagedPart) => (
            <div key={part.partId}>
              <h3 className="font-bold text-blue-400">{part.partName}</h3>
              
              {/* Labor */}
              {part.services.length > 0 && (
                <div className="pl-4 mt-2">
                  <h4 className="font-semibold text-sm text-gray-400">Mão de Obra</h4>
                  <ul className="text-sm list-disc list-inside space-y-1 mt-1">
                    {part.services.map(service => (
                      <li key={service.id} className="grid grid-cols-3 items-center gap-2">
                        <span>{service.name}</span>
                        <div className="flex items-center gap-1">
                          <input 
                            type="number" 
                            value={service.laborHours}
                            onChange={(e) => handleServiceHourChange(part.partId, service.id, parseFloat(e.target.value) || 0)}
                            className="w-16 px-1 py-0.5 border border-gray-600 rounded-md text-center bg-gray-700 text-gray-200"
                          />
                          <span className="text-gray-400">hrs</span>
                        </div>
                        <span className="text-right font-medium">
                          {(service.laborHours * service.costPerHour).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Replacement Parts */}
              {part.replacementParts.length > 0 && (
                <div className="pl-4 mt-2">
                  <h4 className="font-semibold text-sm text-gray-400">Peças</h4>
                  <ul className="text-sm list-disc list-inside space-y-1 mt-1">
                    {part.replacementParts.map((item, index) => (
                       <li key={item.id} className="grid grid-cols-4 items-center gap-2">
                        <span className="col-span-2">{item.name}</span>
                        <div className="flex items-center gap-1">
                          <input type="number" value={item.quantity} onChange={(e) => handleItemChange(part.partId, 'replacementParts', index, 'quantity', parseFloat(e.target.value) || 0)} className="w-12 px-1 py-0.5 border border-gray-600 rounded-md text-center bg-gray-700 text-gray-200" />
                          <input type="number" value={item.unitCost} onChange={(e) => handleItemChange(part.partId, 'replacementParts', index, 'unitCost', parseFloat(e.target.value) || 0)} className="w-20 px-1 py-0.5 border border-gray-600 rounded-md text-center bg-gray-700 text-gray-200" />
                        </div>
                        <span className="text-right font-medium">
                          {(item.quantity * item.unitCost).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Materials */}
              {part.materials.length > 0 && (
                <div className="pl-4 mt-2">
                  <h4 className="font-semibold text-sm text-gray-400">Materiais</h4>
                  <ul className="text-sm list-disc list-inside space-y-1 mt-1">
                    {part.materials.map((item, index) => (
                      <li key={item.id} className="grid grid-cols-4 items-center gap-2">
                        <span className="col-span-2">{item.name}</span>
                        <div className="flex items-center gap-1">
                          <input type="number" value={item.quantity} onChange={(e) => handleItemChange(part.partId, 'materials', index, 'quantity', parseFloat(e.target.value) || 0)} className="w-12 px-1 py-0.5 border border-gray-600 rounded-md text-center bg-gray-700 text-gray-200" />
                          <input type="number" value={item.unitCost} onChange={(e) => handleItemChange(part.partId, 'materials', index, 'unitCost', parseFloat(e.target.value) || 0)} className="w-20 px-1 py-0.5 border border-gray-600 rounded-md text-center bg-gray-700 text-gray-200" />
                        </div>
                        <span className="text-right font-medium">
                          {(item.quantity * item.unitCost).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="mt-6 pt-4 border-t-2 border-dashed border-gray-700">
        <h3 className="text-lg font-bold mb-2">Total Geral</h3>
        <div className="space-y-2 text-gray-300">
          <div>
            <div className="flex justify-between">
              <span>Total Mão de Obra:</span>
              <span className="font-semibold">{totals.labor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
            {totals.labor > 0 && (
                <div className="pl-4 text-sm text-gray-400 space-y-1 mt-1">
                    {Object.entries(totals.laborByType)
                        // FIX: Cast `cost` to number as TypeScript infers it as `unknown` from Object.entries, causing a type error with the `>` operator.
                        .filter(([, cost]) => (cost as number) > 0)
                        .map(([type, cost]) => (
                            <div key={type} className="flex justify-between">
                                <span>- {serviceTypeLabels[type as keyof typeof serviceTypeLabels]}:</span>
                                {/* FIX: Cast `cost` to number to resolve ambiguity and use the correct `toLocaleString` method for numbers, which accepts arguments. */}
                                <span>{(cost as number).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                            </div>
                        ))
                    }
                </div>
            )}
          </div>
          <div className="flex justify-between">
            <span>Total Peças:</span>
            <span className="font-semibold">{totals.parts.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Materiais:</span>
            <span className="font-semibold">{totals.materials.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
          </div>
          <div className="flex justify-between text-xl font-bold text-white mt-2 pt-2 border-t border-gray-700">
            <span>Total do Orçamento:</span>
            <span>{totals.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default EstimateSummary;