import React from 'react';
import { Quote, ChatMessage } from '../types';
import Card from './ui/Card';
import ChatInterface from './ui/ChatInterface';
import Button from './ui/Button';

interface CustomerPortalProps {
  quote: Quote;
  onUpdateService: (updatedQuote: Quote) => void;
}

const CustomerPortal: React.FC<CustomerPortalProps> = ({ quote, onUpdateService }) => {

  const handleSendMessage = (messageText: string) => {
    const message: ChatMessage = {
      id: `chat-${Date.now()}`,
      sender: 'customer',
      text: messageText,
      timestamp: Date.now(),
    };
    const updatedChat = [...(quote.chat || []), message];
    onUpdateService({ ...quote, chat: updatedChat });
  };
  
  const lastTimelineEvent = [...(quote.timeline || [])].pop();

  const handlePrintOS = () => {
    // This is a simplified approach. A real app might fetch the OS data and render it to a printable view.
    alert("Funcionalidade para imprimir/visualizar a OS completa seria implementada aqui.");
  }

  return (
    <div className="max-w-7xl mx-auto">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white">Acompanhamento de Reparo</h1>
        <p className="text-gray-400 mt-2">Olá, {quote.customer.name}! Veja abaixo o progresso do seu {quote.vehicle.make} {quote.vehicle.model}.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Timeline */}
        <div className="lg:col-span-2 space-y-8">
            <Card>
                <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">Status Atual</h2>
                <div className="text-center p-6 bg-gray-700/50 rounded-lg">
                    <p className="text-lg text-gray-400">Status do Veículo:</p>
                    <p className="text-3xl font-bold text-blue-400 mt-1">{lastTimelineEvent?.status || "Aguardando início"}</p>
                    <p className="text-sm text-gray-500 mt-2">Última atualização: {lastTimelineEvent ? new Date(lastTimelineEvent.date).toLocaleString('pt-BR') : 'N/A'}</p>
                    <Button onClick={handlePrintOS} variant="secondary" className="mt-4 !text-sm !py-1 !px-3">Ver Ordem de Serviço</Button>
                </div>
            </Card>

          <Card>
            <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">Linha do Tempo do Reparo</h2>
            <div className="relative pl-6 border-l-2 border-gray-700 space-y-8">
              {[...(quote.timeline || [])].reverse().map((event, index) => (
                <div key={event.id} className="relative">
                  <div className="absolute -left-[34px] top-1 h-4 w-4 rounded-full bg-blue-500 ring-4 ring-gray-800"></div>
                  <p className="font-bold text-blue-400">{event.status}</p>
                  <p className="text-xs text-gray-500 mb-2">{new Date(event.date).toLocaleString('pt-BR')}</p>
                  <p className="text-gray-300">{event.description}</p>
                  {event.photoUrl && (
                    <a href={event.photoUrl} target="_blank" rel="noopener noreferrer">
                        <img src={event.photoUrl} alt="Foto do progresso" className="mt-3 w-full max-w-sm h-auto object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity" />
                    </a>
                  )}
                </div>
              ))}
               {(!quote.timeline || quote.timeline.length === 0) && (
                <p className="text-gray-500">Nenhuma atualização ainda.</p>
               )}
            </div>
          </Card>
        </div>

        {/* Right Column: Chat */}
        <div className="lg:sticky lg:top-24">
          <Card className="!p-0 h-[70vh]">
            <h2 className="text-xl font-bold p-4 border-b border-gray-700">Fale com a Oficina</h2>
            <ChatInterface
              messages={quote.chat || []}
              onSendMessage={handleSendMessage}
              currentUser="customer"
              disabled={quote.status === 'concluido'}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CustomerPortal;
