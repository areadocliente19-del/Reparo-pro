import React, { useState } from 'react';
import { Quote } from '../types';
import Card from './ui/Card';
import Input from './ui/Input';
import Button from './ui/Button';

interface EmailModalProps {
  quote: Quote;
  onClose: () => void;
}

const EmailModal: React.FC<EmailModalProps> = ({ quote, onClose }) => {
  const [to, setTo] = useState(quote.customer.email);
  const [subject, setSubject] = useState(`Ordem de Serviço #${quote.id.slice(-6).toUpperCase()} - ReparoPro Oficina`);
  const [body, setBody] = useState(
    `Olá ${quote.customer.name},\n\nSegue em anexo a Ordem de Serviço para o reparo do seu veículo ${quote.vehicle.make} ${quote.vehicle.model}.\n\nQualquer dúvida, estamos à disposição.\n\nAtenciosamente,\nEquipe ReparoPro`
  );
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    // Simulate sending email
    console.log('Sending email with the following data:', { to, subject, body, quoteId: quote.id });
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSending(false);
    setIsSent(true);
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      aria-modal="true"
    >
      <Card className="w-full max-w-2xl" onClick={e => e.stopPropagation()}>
        <header className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Enviar Ordem de Serviço por E-mail</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl font-bold">&times;</button>
        </header>
        
        {isSent ? (
          <div className="text-center py-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-2xl font-bold text-green-400 mt-4">E-mail Enviado!</h3>
            <p className="text-gray-400 mt-2">A Ordem de Serviço foi enviada com sucesso para {to}.</p>
            <Button onClick={onClose} className="mt-6" variant="secondary">Fechar</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="emailTo"
              label="Destinatário"
              type="email"
              value={to}
              onChange={e => setTo(e.target.value)}
              required
            />
            <Input
              id="emailSubject"
              label="Assunto"
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              required
            />
            <div>
              <label htmlFor="emailBody" className="block text-sm font-medium text-gray-400 mb-1">
                Corpo do E-mail
              </label>
              <textarea
                id="emailBody"
                value={body}
                onChange={e => setBody(e.target.value)}
                rows={8}
                className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-200"
              />
            </div>
            <p className="text-xs text-gray-500">O PDF da Ordem de Serviço será anexado automaticamente.</p>
            <footer className="flex justify-end gap-4 pt-4 border-t border-gray-700">
              <Button type="button" onClick={onClose} variant="secondary" disabled={isSending}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSending}>
                {isSending ? 'Enviando...' : 'Enviar E-mail'}
              </Button>
            </footer>
          </form>
        )}
      </Card>
    </div>
  );
};

export default EmailModal;
