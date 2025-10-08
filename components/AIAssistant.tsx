
import React, { useState } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import { getRepairSuggestion } from '../services/geminiService';
import { DamagedPart } from '../types';
import { CAR_PARTS, AVAILABLE_SERVICES, LABOR_COST_PER_HOUR } from '../constants';

interface AIAssistantProps {
  updateDamagedParts: (parts: { [key: string]: DamagedPart }) => void;
  existingParts: { [key: string]: DamagedPart };
}

const AIAssistant: React.FC<AIAssistantProps> = ({ updateDamagedParts, existingParts }) => {
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSuggestion = async () => {
    if (!description) {
      setError("Por favor, descreva os danos.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await getRepairSuggestion(description);
      const newDamagedParts = { ...existingParts };
      
      result.damagedParts?.forEach((partId: string) => {
        if (!newDamagedParts[partId]) {
          const partInfo = CAR_PARTS.find(p => p.id === partId);
          if (partInfo) {
            
            const suggestedServicesForPart = result.suggestedServices?.[partId] || [];
            const services = suggestedServicesForPart
              .map((serviceName: string) => {
                  // Find a matching service template from our available services
                  const serviceTemplate = AVAILABLE_SERVICES.find(s => serviceName.toLowerCase().includes(s.name.toLowerCase().split(" ")[0]));
                  if (serviceTemplate) {
                      return {
                          id: `${partId}-${serviceTemplate.name}-${Date.now()}`,
                          name: serviceTemplate.name,
                          type: serviceTemplate.type,
                          laborHours: 2, // Default
                          costPerHour: LABOR_COST_PER_HOUR,
                      };
                  }
                  return null;
              })
              .filter((s: any): s is any => s !== null);

            newDamagedParts[partId] = {
              partId: partId,
              partName: partInfo.name,
              services: services,
              replacementParts: [],
              materials: [],
            };
          }
        }
      });
      updateDamagedParts(newDamagedParts);

    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <div className="flex items-center gap-2 mb-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <h2 className="text-xl font-bold">Assistente IA</h2>
      </div>
      <p className="text-gray-400 mb-4 text-sm">Descreva os danos do veículo e a IA irá pré-selecionar as peças e serviços necessários para agilizar o orçamento.</p>
      <div className="flex flex-col md:flex-row gap-4">
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Ex: Grande amassado na porta dianteira direita e arranhões no para-choque traseiro."
          className="flex-grow p-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-gray-200"
          rows={2}
          disabled={isLoading}
        />
        <Button onClick={handleSuggestion} disabled={isLoading}>
          {isLoading ? 'Analisando...' : 'Obter Sugestão'}
        </Button>
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </Card>
  );
};

export default AIAssistant;