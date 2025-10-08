import React from 'react';
import { Quote } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';

interface SearchResultsProps {
  searchQuery: string;
  results: Quote[];
  onLoadQuote: (id: string) => void;
  onManageService: (id: string) => void;
}

const statusMap = {
  pending: { text: 'Pendente', color: 'bg-yellow-500/20 text-yellow-400' },
  approved: { text: 'Aprovado', color: 'bg-green-500/20 text-green-400' },
  denied: { text: 'Recusado', color: 'bg-red-500/20 text-red-400' },
  'os-generated': { text: 'OS Gerada', color: 'bg-indigo-500/20 text-indigo-400' },
  'em-andamento': { text: 'Em Andamento', color: 'bg-blue-500/20 text-blue-400' },
  concluido: { text: 'Concluído', color: 'bg-gray-500/20 text-gray-400' },
};

const SearchResults: React.FC<SearchResultsProps> = ({ searchQuery, results, onLoadQuote, onManageService }) => {
  const vehicleInfo = results.length > 0 ? results[0].vehicle : null;
  const customerInfo = results.length > 0 ? results[0].customer : null;

  return (
    <div className="space-y-8">
        <h1 className="text-3xl font-bold text-white">
            Resultados da Busca por: <span className="text-blue-400 font-mono">{searchQuery}</span>
        </h1>

        {results.length === 0 ? (
            <Card>
                <p className="text-center text-gray-400 py-8">Nenhum veículo, orçamento ou serviço encontrado com esta placa.</p>
            </Card>
        ) : (
            <>
                {vehicleInfo && customerInfo && (
                    <Card>
                        <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">Informações do Veículo</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p><span className="font-semibold text-gray-400">Veículo:</span> {vehicleInfo.make} {vehicleInfo.model} ({vehicleInfo.year})</p>
                                <p><span className="font-semibold text-gray-400">Cor:</span> {vehicleInfo.color}</p>
                            </div>
                            <div>
                                <p><span className="font-semibold text-gray-400">Cliente:</span> {customerInfo.name}</p>
                                <p><span className="font-semibold text-gray-400">Telefone:</span> {customerInfo.phone}</p>
                            </div>
                        </div>
                    </Card>
                )}
                
                <Card>
                    <h2 className="text-xl font-bold mb-4">Histórico de Orçamentos e Serviços</h2>
                    <div className="space-y-4">
                        {results.sort((a, b) => b.createdAt - a.createdAt).map(quote => {
                            const statusInfo = statusMap[quote.status] || statusMap.pending;
                            const isService = ['os-generated', 'em-andamento', 'concluido'].includes(quote.status);
                            
                            return (
                                <div key={quote.id} className="p-4 bg-gray-700/50 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <p className="font-semibold">
                                                {isService ? 'Ordem de Serviço' : 'Orçamento'} - {new Date(quote.createdAt).toLocaleDateString('pt-BR')}
                                            </p>
                                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusInfo.color}`}>
                                                {statusInfo.text}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Criado por: {quote.createdByName || 'N/A'}
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <Button 
                                            onClick={() => isService ? onManageService(quote.id) : onLoadQuote(quote.id)} 
                                            variant="secondary" 
                                            className="!py-1 !px-3 !text-sm"
                                        >
                                            {isService ? 'Gerenciar Serviço' : 'Ver Orçamento'}
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </>
        )}
    </div>
  );
};

export default SearchResults;