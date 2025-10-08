import React, { useState, useMemo } from 'react';
import { Quote, User } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';

interface SavedQuotesListProps {
  quotes: Quote[];
  currentUser: User;
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  onUpdateStatus: (id: string, status: 'approved' | 'denied') => void;
  onGenerateOS: (id: string) => void;
  onManage: (id: string) => void;
}

const statusMap = {
  pending: { text: 'Pendente', color: 'bg-yellow-500/20 text-yellow-400' },
  approved: { text: 'Aprovado', color: 'bg-green-500/20 text-green-400' },
  denied: { text: 'Recusado', color: 'bg-red-500/20 text-red-400' },
  'os-generated': { text: 'OS Gerada', color: 'bg-indigo-500/20 text-indigo-400' },
  'em-andamento': { text: 'Em Andamento', color: 'bg-blue-500/20 text-blue-400' },
  concluido: { text: 'Concluído', color: 'bg-gray-500/20 text-gray-400' },
};

const SavedQuotesList: React.FC<SavedQuotesListProps> = ({ quotes, currentUser, onLoad, onDelete, onClose, onUpdateStatus, onGenerateOS, onManage }) => {
  const [filter, setFilter] = useState('');

  const filteredQuotes = useMemo(() => {
    if (!filter) return quotes;
    return quotes.filter(q => 
        q.customer.name.toLowerCase().includes(filter.toLowerCase()) ||
        q.vehicle.plate.toLowerCase().includes(filter.toLowerCase())
    );
  }, [quotes, filter]);

  const handleCopyLink = (token: string) => {
    const url = `${window.location.origin}${window.location.pathname}?token=${token}`;
    navigator.clipboard.writeText(url)
      .then(() => alert('Link do portal copiado para a área de transferência!'))
      .catch(() => alert('Falha ao copiar o link.'));
  };
  
  const canApprove = ['admin', 'estimator'].includes(currentUser.role);
  const canDelete = currentUser.role === 'admin';

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Orçamentos e Serviços</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl font-bold" aria-label="Fechar">
            &times;
          </button>
        </header>

        <div className="p-4 border-b border-gray-700">
            <Input 
                id="search-quotes"
                label="Buscar por cliente ou placa"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Digite para filtrar..."
            />
        </div>

        <main className="p-6 overflow-y-auto space-y-4">
          {filteredQuotes.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
                {quotes.length > 0 ? 'Nenhum resultado encontrado para sua busca.' : 'Nenhum orçamento salvo ainda.'}
            </p>
          ) : (
            filteredQuotes.map(quote => {
              const statusInfo = statusMap[quote.status] || statusMap.pending;
              return (
                <Card key={quote.id} className="!p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex-grow">
                    <div className="flex items-center gap-3">
                      <p className="font-bold text-blue-400">{quote.customer.name || 'Cliente não informado'}</p>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusInfo.color}`}>
                        {statusInfo.text}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300">
                        {quote.vehicle.make} {quote.vehicle.model || 'Veículo não informado'} - <span className="font-mono bg-gray-700 px-1 rounded">{quote.vehicle.plate || 'S/ Placa'}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Salvo em: {new Date(quote.createdAt).toLocaleString('pt-BR')}
                      {quote.createdByName && ` por ${quote.createdByName}`}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap flex-shrink-0 items-center">
                    {quote.status === 'pending' && canApprove && (
                      <>
                        <Button onClick={() => onUpdateStatus(quote.id, 'approved')} className="!text-xs !py-1 !px-2 bg-green-600 hover:bg-green-700 focus:ring-green-500">Aprovar</Button>
                        <Button onClick={() => onUpdateStatus(quote.id, 'denied')} className="!text-xs !py-1 !px-2 bg-orange-600 hover:bg-orange-700 focus:ring-orange-500">Recusar</Button>
                      </>
                    )}
                    {quote.status === 'approved' && canApprove && (
                       <Button onClick={() => onGenerateOS(quote.id)} className="!text-xs !py-1 !px-2 bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500">Gerar OS</Button>
                    )}
                    {(quote.status === 'os-generated' || quote.status === 'em-andamento' || quote.status === 'concluido') && (
                        <>
                          <Button onClick={() => onManage(quote.id)} className="!text-xs !py-1 !px-2 bg-blue-600 hover:bg-blue-700 focus:ring-blue-500">Gerenciar</Button>
                          {quote.customerPortalToken && <Button onClick={() => handleCopyLink(quote.customerPortalToken!)} variant="secondary" className="!text-xs !py-1 !px-2">Copiar Link</Button>}
                        </>
                    )}

                    <Button onClick={() => onLoad(quote.id)} className="!text-sm !py-1 !px-3">{canApprove ? 'Ver/Editar' : 'Ver'}</Button>
                    {canDelete && <Button onClick={() => onDelete(quote.id)} variant="danger" className="!text-sm !py-1 !px-3">Excluir</Button>}
                  </div>
                </Card>
              )
            })
          )}
        </main>
         <footer className="p-4 border-t border-gray-700 text-right">
            <Button onClick={onClose} variant="secondary">Fechar</Button>
        </footer>
      </div>
    </div>
  );
};

export default SavedQuotesList;