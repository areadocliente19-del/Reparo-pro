import React, { useState } from 'react';
import { Quote, TimelineEvent, ChatMessage } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import ChatInterface from './ui/ChatInterface';

interface ManageServiceProps {
  quote: Quote;
  onUpdateService: (updatedQuote: Quote) => void;
  onBack: () => void;
}

const serviceStatuses = ['Em Análise', 'Aguardando Peças', 'Em Funilaria', 'Em Preparação', 'Em Pintura', 'Em Montagem', 'Polimento', 'Controle de Qualidade', 'Pronto para Retirada', 'Concluído'];

const ManageService: React.FC<ManageServiceProps> = ({ quote, onUpdateService, onBack }) => {
  const [newUpdate, setNewUpdate] = useState({ description: '', status: serviceStatuses[0], photoUrl: '' });
  const [isUploading, setIsUploading] = useState(false);

  const handleStatusChange = (newStatus: Quote['status']) => {
      const updatedQuote = {...quote, status: newStatus };
      onUpdateService(updatedQuote);
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewUpdate(prev => ({ ...prev, photoUrl: reader.result as string }));
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTimelineEvent = () => {
    if (!newUpdate.description) return;

    const event: TimelineEvent = {
      id: `timeline-${Date.now()}`,
      date: Date.now(),
      ...newUpdate,
    };

    const updatedTimeline = [...(quote.timeline || []), event];
    onUpdateService({ ...quote, timeline: updatedTimeline });
    setNewUpdate({ description: '', status: serviceStatuses[0], photoUrl: '' });
  };
  
  const handleSendMessage = (messageText: string) => {
    const message: ChatMessage = {
      id: `chat-${Date.now()}`,
      sender: 'workshop',
      text: messageText,
      timestamp: Date.now(),
    };
    const updatedChat = [...(quote.chat || []), message];
    onUpdateService({ ...quote, chat: updatedChat });
  };


  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Gerenciar Serviço: <span className="text-blue-400">{quote.vehicle.make} {quote.vehicle.model}</span></h1>
        <Button onClick={onBack} variant="secondary">Voltar ao Painel</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Timeline and Updates */}
        <div className="lg:col-span-2 space-y-8">
            <Card>
                <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">Status do Serviço</h2>
                 <select 
                    value={quote.status} 
                    onChange={(e) => handleStatusChange(e.target.value as Quote['status'])}
                    className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-200"
                >
                    <option value="os-generated">OS Gerada</option>
                    <option value="em-andamento">Em Andamento</option>
                    <option value="concluido">Concluído</option>
                </select>
            </Card>

          <Card>
            <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">Adicionar Atualização na Linha do Tempo</h2>
            <div className="space-y-4">
              <textarea
                value={newUpdate.description}
                onChange={e => setNewUpdate(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva o progresso do serviço..."
                className="w-full h-24 p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-200"
              />
              <select 
                value={newUpdate.status} 
                onChange={e => setNewUpdate(prev => ({...prev, status: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-gray-200"
              >
                  {serviceStatuses.map(status => <option key={status} value={status}>{status}</option>)}
              </select>
              <div className="flex items-center gap-4">
                <input type="file" accept="image/*" onChange={handleFileUpload} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500/10 file:text-blue-400 hover:file:bg-blue-500/20"/>
                {isUploading && <p className="text-sm text-gray-400">Carregando...</p>}
              </div>
              {newUpdate.photoUrl && <img src={newUpdate.photoUrl} alt="Preview" className="w-32 h-32 object-cover rounded-md"/>}
              <Button onClick={handleAddTimelineEvent} disabled={!newUpdate.description || isUploading}>
                Publicar Atualização
              </Button>
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">Linha do Tempo do Cliente</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {[...(quote.timeline || [])].reverse().map(event => (
                <div key={event.id} className="p-3 bg-gray-700/50 rounded-lg">
                  <p className="font-semibold text-blue-400">[{event.status}] - <span className="text-xs text-gray-400">{new Date(event.date).toLocaleString('pt-BR')}</span></p>
                  <p className="text-gray-300 mt-1">{event.description}</p>
                  {event.photoUrl && <img src={event.photoUrl} alt="Foto do progresso" className="mt-2 w-48 h-48 object-cover rounded-md"/>}
                </div>
              ))}
            </div>
          </Card>
        </div>
        
        {/* Right Column: Chat */}
        <div className="lg:sticky lg:top-24">
          <Card className="!p-0 h-[70vh]">
            <h2 className="text-xl font-bold p-4 border-b border-gray-700">Chat com {quote.customer.name}</h2>
            <ChatInterface
              messages={quote.chat || []}
              onSendMessage={handleSendMessage}
              currentUser="workshop"
              disabled={quote.status === 'concluido'}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ManageService;
