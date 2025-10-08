import React, { useRef, useEffect, useState } from 'react';
import { Quote, DamagedPart } from '../types';
import Button from './ui/Button';
import { PAYMENT_METHODS, CREDIT_CARD_FEE_PERCENTAGE } from '../constants';
import EmailModal from './EmailModal';

interface WorkOrderPreviewProps {
  quote: Quote;
  onBack: () => void;
  onSign: (signatureDataUrl: string) => void;
  onUpdateTerms: (terms: string) => void;
}

const WorkOrderPreview: React.FC<WorkOrderPreviewProps> = ({ quote, onBack, onSign, onUpdateTerms }) => {
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  useEffect(() => {
    if (quote.signature || !signatureCanvasRef.current) return;

    const canvas = signatureCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#374151'; // gray-700
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    const getPosition = (event: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (event instanceof MouseEvent) {
        return { x: event.clientX - rect.left, y: event.clientY - rect.top };
      } else {
        return { x: event.touches[0].clientX - rect.left, y: event.touches[0].clientY - rect.top };
      }
    };

    const startSigning = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      setIsSigning(true);
      const { x, y } = getPosition(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
    };

    const draw = (e: MouseEvent | TouchEvent) => {
      if (!isSigning) return;
      e.preventDefault();
      const { x, y } = getPosition(e);
      ctx.lineTo(x, y);
      ctx.stroke();
    };

    const finishSigning = () => {
      setIsSigning(false);
      ctx.beginPath();
    };

    canvas.addEventListener('mousedown', startSigning);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', finishSigning);
    canvas.addEventListener('mouseout', finishSigning);

    canvas.addEventListener('touchstart', startSigning);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', finishSigning);

    return () => {
      canvas.removeEventListener('mousedown', startSigning);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', finishSigning);
      canvas.removeEventListener('mouseout', finishSigning);

      canvas.removeEventListener('touchstart', startSigning);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', finishSigning);
    };
  }, [isSigning, quote.signature]);


  const clearSignature = () => {
    if (signatureCanvasRef.current) {
      const canvas = signatureCanvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const saveSignature = () => {
    if (signatureCanvasRef.current) {
      const dataUrl = signatureCanvasRef.current.toDataURL('image/png');
      onSign(dataUrl);
    }
  };

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
  const osNumber = `OS-${quote.id.slice(-6).toUpperCase()}`;
  const generationDate = quote.osGeneratedAt ? new Date(quote.osGeneratedAt) : new Date();
  
  const defaultTerms = `1. Esta Ordem de Serviço é válida a partir da data de sua emissão e autoriza a ReparoPro Oficina a executar os serviços descritos.
2. O cliente declara estar ciente de que o prazo de entrega é uma estimativa e pode sofrer alterações.
3. A garantia dos serviços de mão de obra é de 90 dias. Peças e materiais seguem a garantia do fabricante.
4. A oficina não se responsabiliza por objetos deixados no interior do veículo.
5. O pagamento deve ser realizado conforme as condições acordadas e descritas no orçamento.`;

  return (
    <>
      {isEmailModalOpen && <EmailModal quote={quote} onClose={() => setIsEmailModalOpen(false)} />}
      <div className="bg-gray-800 min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow-lg rounded-lg p-8 md:p-12 text-slate-800" id="os-to-print">
            <header className="flex justify-between items-start mb-8 border-b pb-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Ordem de Serviço</h1>
                <p className="text-slate-500 font-semibold">Número da OS: {osNumber}</p>
                <p className="text-slate-500">Data de Geração: {generationDate.toLocaleDateString('pt-BR')}</p>
                 {quote.createdByName && <p className="text-slate-500 text-sm">Orçamentista: {quote.createdByName}</p>}
              </div>
              <div className="text-right">
                <h2 className="text-xl font-bold">ReparoPro Oficina</h2>
                <p className="text-sm text-slate-600">Rua da Reparação, 123 - Centro</p>
                <p className="text-sm text-slate-600">CNPJ: 00.000.000/0001-00</p>
                <p className="text-sm text-slate-600">(11) 99999-8888 / reparopro@oficina.com</p>
              </div>
            </header>

            <main>
              <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="font-bold text-slate-700 mb-2 border-b">DADOS DO CLIENTE</h3>
                  <p><strong>Nome:</strong> {quote.customer.name}</p>
                  <p><strong>Telefone:</strong> {quote.customer.phone}</p>
                  <p><strong>Email:</strong> {quote.customer.email}</p>
                </div>
                <div>
                  <h3 className="font-bold text-slate-700 mb-2 border-b">DADOS DO VEÍCULO</h3>
                  <p><strong>Veículo:</strong> {quote.vehicle.make} {quote.vehicle.model} ({quote.vehicle.year})</p>
                  <p><strong>Cor:</strong> {quote.vehicle.color}</p>
                  <p><strong>Placa:</strong> {quote.vehicle.plate}</p>
                </div>
              </section>

              <section>
                <h3 className="font-bold text-lg text-slate-800 mb-4 border-b pb-2">SERVIÇOS, PEÇAS E MATERIAIS APROVADOS</h3>
                <table className="w-full text-sm mb-8">
                  <thead className='bg-slate-100'>
                    <tr className="border-b">
                      <th className="text-left font-semibold p-2">Item/Descrição</th>
                      <th className="text-center font-semibold p-2 w-20">Qtde.</th>
                      <th className="text-center font-semibold p-2 w-28">Vlr. Unit.</th>
                      <th className="text-right font-semibold p-2 w-32">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(quote.damagedParts).map((part: DamagedPart) => (
                      <React.Fragment key={part.partId}>
                        <tr className="bg-slate-200 font-bold">
                          <td colSpan={4} className="p-2 text-blue-800">{part.partName}</td>
                        </tr>
                        {part.services.map(service => (
                          <tr key={service.id} className="border-b border-slate-200">
                            <td className="py-1 px-2">{service.name} (Mão de Obra)</td>
                            <td className="text-center py-1 px-2">{service.laborHours.toFixed(1)} hrs</td>
                            <td className="text-center py-1 px-2">{service.costPerHour.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                            <td className="text-right py-1 px-2">
                              {(service.laborHours * service.costPerHour).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </td>
                          </tr>
                        ))}
                        {part.replacementParts.map(item => (
                          <tr key={item.id} className="border-b border-slate-200">
                            <td className="py-1 px-2">{item.name} (Peça)</td>
                            <td className="text-center py-1 px-2">{item.quantity}</td>
                            <td className="text-center py-1 px-2">{item.unitCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                            <td className="text-right py-1 px-2">
                              {(item.quantity * item.unitCost).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </td>
                          </tr>
                        ))}
                        {part.materials.map(item => (
                          <tr key={item.id} className="border-b border-slate-200">
                            <td className="py-1 px-2">{item.name} (Material)</td>
                            <td className="text-center py-1 px-2">{item.quantity}</td>
                            <td className="text-center py-1 px-2">{item.unitCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                            <td className="text-right py-1 px-2">
                              {(item.quantity * item.unitCost).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </section>
              
              <section className="flex justify-end mb-8">
                  <div className="w-full md:w-2/3 lg:w-1/2">
                      <h3 className="font-bold text-slate-700 mb-2 border-b">RESUMO FINANCEIRO</h3>
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
                          <span>VALOR TOTAL:</span>
                          <span>{totals.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                      </div>
                  </div>
              </section>
              
              <section className="mb-12 break-inside-avoid">
                  <h3 className="font-bold text-slate-700 mb-2 border-b">TERMOS E CONDIÇÕES</h3>
                  <textarea 
                    className="w-full h-40 text-xs text-slate-600 p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 print:hidden"
                    value={quote.termsAndConditions ?? defaultTerms}
                    onChange={(e) => onUpdateTerms(e.target.value)}
                  />
                  <div className="hidden print:block text-xs text-slate-600 whitespace-pre-wrap">
                    {quote.termsAndConditions ?? defaultTerms}
                  </div>
              </section>

              <section className="flex flex-col md:flex-row justify-around items-center gap-8 text-center mt-8 pt-8 border-t-2 border-dashed border-gray-400 break-inside-avoid">
                <div className="w-full md:w-1/2">
                    {quote.signature ? (
                        <div>
                            <img src={quote.signature} alt="Assinatura do cliente" className="mx-auto h-20 border-b-2 border-slate-600 px-4" />
                            <p className="font-semibold mt-2">{quote.customer.name}</p>
                            {quote.signedAt && (
                              <p className="text-xs text-slate-500">
                                Assinado digitalmente em: {new Date(quote.signedAt).toLocaleString('pt-BR')}
                              </p>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <h4 className="font-bold text-slate-600 mb-2">Assinatura do Cliente</h4>
                            <div className="border border-dashed border-gray-400 rounded-md w-full max-w-sm">
                                <canvas 
                                  ref={signatureCanvasRef} 
                                  width="400" 
                                  height="150" 
                                  className="cursor-crosshair w-full bg-slate-50 rounded-md"
                                ></canvas>
                            </div>
                            <div className="mt-2 flex justify-center gap-2 print:hidden">
                                <Button onClick={clearSignature} variant="secondary" className="!text-xs !py-1 !px-2">Limpar</Button>
                                <Button onClick={saveSignature} className="!text-xs !py-1 !px-2">Aceitar e Assinar Digitalmente</Button>
                            </div>
                        </div>
                    )}
                </div>
                <div className="w-full md:w-1/2">
                      <div className="pt-2 mt-16 md:mt-0">
                        <div className="border-t-2 border-slate-600 w-4/5 mx-auto pt-2">
                          <p className="font-semibold">ReparoPro Oficina</p>
                          <p className="text-sm text-slate-500">(Assinatura do Responsável)</p>
                        </div>
                      </div>
                </div>
              </section>
            </main>
          </div>

          <div className="mt-8 flex flex-col md:flex-row justify-center gap-4 print:hidden">
              <Button onClick={onBack} variant="secondary">Voltar ao Painel</Button>
              <Button onClick={() => setIsEmailModalOpen(true)}>Enviar por E-mail</Button>
              <Button onClick={handlePrint}>Imprimir / Salvar PDF</Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default WorkOrderPreview;