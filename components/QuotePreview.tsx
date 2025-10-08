import React from 'react';
import { Quote, DamagedPart } from '../types';
import Button from './ui/Button';
import { PAYMENT_METHODS, CREDIT_CARD_FEE_PERCENTAGE } from '../constants';

interface QuotePreviewProps {
  quote: Quote;
  onBack: () => void;
  onNewQuote: () => void;
}

const QuotePreview: React.FC<QuotePreviewProps> = ({ quote, onBack, onNewQuote }) => {

  const totals = React.useMemo(() => {
    let labor = 0;
    let parts = 0;
    let materials = 0;

    Object.values(quote.damagedParts).forEach((part: DamagedPart) => {
      part.services.forEach(s => labor += s.laborHours * s.costPerHour);
      part.replacementParts.forEach(p => parts += p.quantity * p.unitCost);
      part.materials.forEach(m => materials += m.quantity * m.unitCost);
    });

    const subtotal = labor + parts + materials;
    const fee = quote.paymentMethod === 'credit' ? subtotal * (CREDIT_CARD_FEE_PERCENTAGE / 100) : 0;
    const total = subtotal + fee;

    return { labor, parts, materials, subtotal, fee, total };
  }, [quote.damagedParts, quote.paymentMethod]);

  const handlePrint = () => {
    window.print();
  };
  
  const selectedPaymentMethodName = PAYMENT_METHODS.find(p => p.id === quote.paymentMethod)?.name || 'Não especificado';

  return (
    <div className="bg-gray-900 min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-8 md:p-12 text-slate-800" id="quote-to-print">
          <header className="flex justify-between items-start mb-8 border-b pb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Orçamento de Reparo</h1>
              <p className="text-slate-500">Data: {new Date(quote.createdAt).toLocaleDateString('pt-BR')}</p>
              {quote.createdByName && <p className="text-slate-500 text-sm">Orçamentista: {quote.createdByName}</p>}
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold">Sua Oficina Inc.</h2>
              <p className="text-sm text-slate-600">Rua da Reparação, 123</p>
              <p className="text-sm text-slate-600">(11) 99999-8888</p>
            </div>
          </header>

          <main>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-bold text-slate-700 mb-2">CLIENTE</h3>
                <p>{quote.customer.name}</p>
                <p>{quote.customer.phone}</p>
                <p>{quote.customer.email}</p>
              </div>
              <div>
                <h3 className="font-bold text-slate-700 mb-2">VEÍCULO</h3>
                <p>{quote.vehicle.make} {quote.vehicle.model} ({quote.vehicle.year})</p>
                <p>Cor: {quote.vehicle.color}</p>
                <p>Placa: {quote.vehicle.plate}</p>
              </div>
            </div>

            <h3 className="font-bold text-lg text-slate-800 mb-4 border-b pb-2">DETALHES DO SERVIÇO</h3>
            
            <div className="space-y-6 mb-8">
              {Object.values(quote.damagedParts).map((part: DamagedPart) => (
                <div key={part.partId} className="p-4 bg-slate-50 rounded-md break-inside-avoid">
                  <h4 className="font-semibold text-blue-800 mb-2">{part.partName}</h4>
                  
                  {part.services.length > 0 && (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left font-medium py-1">Mão de Obra</th>
                          <th className="text-center font-medium py-1 w-24">Horas</th>
                          <th className="text-right font-medium py-1 w-32">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {part.services.map(service => (
                          <tr key={service.id} className="border-b border-slate-200">
                            <td className="py-1">{service.name}</td>
                            <td className="text-center py-1">{service.laborHours.toFixed(1)}</td>
                            <td className="text-right py-1">
                              {(service.laborHours * service.costPerHour).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {part.replacementParts.length > 0 && (
                    <table className="w-full text-sm mt-3">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left font-medium py-1">Peças</th>
                          <th className="text-center font-medium py-1 w-16">Qtd.</th>
                          <th className="text-center font-medium py-1 w-24">Vlr. Unit.</th>
                          <th className="text-right font-medium py-1 w-32">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {part.replacementParts.map(item => (
                          <tr key={item.id} className="border-b border-slate-200">
                            <td className="py-1">{item.name}</td>
                            <td className="text-center py-1">{item.quantity}</td>
                            <td className="text-center py-1">{item.unitCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                            <td className="text-right py-1">
                              {(item.quantity * item.unitCost).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {part.materials.length > 0 && (
                    <table className="w-full text-sm mt-3">
                       <thead>
                        <tr className="border-b">
                          <th className="text-left font-medium py-1">Materiais</th>
                          <th className="text-center font-medium py-1 w-16">Qtd.</th>
                          <th className="text-center font-medium py-1 w-24">Vlr. Unit.</th>
                          <th className="text-right font-medium py-1 w-32">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {part.materials.map(item => (
                          <tr key={item.id} className="border-b border-slate-200">
                            <td className="py-1">{item.name}</td>
                            <td className="text-center py-1">{item.quantity}</td>
                            <td className="text-center py-1">{item.unitCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                            <td className="text-right py-1">
                              {(item.quantity * item.unitCost).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                </div>
              ))}
            </div>

            <div className="flex justify-end mb-8">
                <div className="w-full md:w-2/3 lg:w-1/2">
                    <div className="flex justify-between py-1 text-slate-600">
                        <span>Subtotal Mão de Obra:</span>
                        <span className="font-medium">{totals.labor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                    <div className="flex justify-between py-1 text-slate-600">
                        <span>Subtotal Peças:</span>
                        <span className="font-medium">{totals.parts.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                     <div className="flex justify-between py-1 text-slate-600">
                        <span>Subtotal Materiais:</span>
                        <span className="font-medium">{totals.materials.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                    {quote.paymentMethod === 'credit' && (
                       <div className="flex justify-between py-1 text-slate-600">
                        <span>Acréscimo Cartão ({CREDIT_CARD_FEE_PERCENTAGE}%):</span>
                        <span className="font-medium">{totals.fee.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xl font-bold py-2 mt-2 border-t-2 border-slate-800">
                        <span>TOTAL:</span>
                        <span>{totals.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                </div>
            </div>

             <div className="mb-8">
                <h3 className="font-bold text-slate-700 mb-2">FORMA DE PAGAMENTO SELECIONADA</h3>
                <p className="text-base text-slate-800 bg-slate-100 p-3 rounded-md font-semibold">{selectedPaymentMethodName}</p>
                <h4 className="font-semibold text-slate-600 mt-4 mb-1 text-sm">Outras formas de pagamento aceitas:</h4>
                <ul className="list-disc list-inside text-sm text-slate-600">
                    <li>PIX</li>
                    <li>Cartão de Débito</li>
                    <li>Cartão de Crédito (acréscimos da máquina por conta do cliente)</li>
                </ul>
            </div>

            {quote.photos.length > 0 && (
              <div className="break-before-page">
                <h3 className="font-bold text-lg text-slate-800 mb-4 border-b pb-2">FOTOS DOS DANOS</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {quote.photos.map((photo, index) => (
                    <img key={index} src={photo.url} alt={`Dano ${index + 1}`} className="w-full h-auto object-cover rounded-md border" />
                  ))}
                </div>
              </div>
            )}
            
            <footer className="mt-12 pt-4 border-t text-xs text-slate-500">
              <p>Este orçamento é válido por 15 dias. Os serviços possuem garantia de 90 dias para mão de obra. Peças seguem a garantia do fabricante.</p>
            </footer>
          </main>
        </div>

        <div className="mt-8 flex flex-col md:flex-row justify-center gap-4 print:hidden">
            <Button onClick={onBack} variant="secondary">Voltar e Editar</Button>
            <Button onClick={handlePrint}>Imprimir / Salvar PDF</Button>
            <Button onClick={onNewQuote} variant="danger">Novo Orçamento</Button>
        </div>
      </div>
    </div>
  );
};

export default QuotePreview;