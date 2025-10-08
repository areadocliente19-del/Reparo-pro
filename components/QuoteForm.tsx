import React, { useState, useMemo } from 'react';
import { Quote, Customer, Vehicle, Photo, DamagedPart, Service, Part as ReplacementPart, Material, PaymentMethod, User } from '../types';
import { CAR_PARTS, AVAILABLE_SERVICES, LABOR_COST_PER_HOUR, AVAILABLE_MATERIALS, PAYMENT_METHODS, CREDIT_CARD_FEE_PERCENTAGE } from '../constants';
import Card from './ui/Card';
import Input from './ui/Input';
import Button from './ui/Button';
import AIAssistant from './AIAssistant';
import DamageVisualizer from './DamageVisualizer';
import EstimateSummary from './EstimateSummary';

interface QuoteFormProps {
  quote: Quote;
  currentUser: User;
  updateCustomer: (customer: Customer) => void;
  updateVehicle: (vehicle: Vehicle) => void;
  addPhoto: (photo: Photo) => void;
  updateDamagedParts: (parts: { [key: string]: DamagedPart }) => void;
  updatePaymentMethod: (method: PaymentMethod) => void;
  onPreview: () => void;
  onSave: () => void;
}

const QuoteForm: React.FC<QuoteFormProps> = ({
  quote,
  currentUser,
  updateCustomer,
  updateVehicle,
  addPhoto,
  updateDamagedParts,
  updatePaymentMethod,
  onPreview,
  onSave,
}) => {
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [newPart, setNewPart] = useState({ name: '', quantity: 1, unitCost: 0 });
  const [newMaterial, setNewMaterial] = useState({ name: AVAILABLE_MATERIALS[0]?.name || '', quantity: 1, unitCost: 0 });

  const isReadOnly = currentUser.role === 'viewer';

  const handlePartToggle = (partId: string) => {
    if (isReadOnly) return;
    const newDamagedParts = { ...quote.damagedParts };
    if (newDamagedParts[partId]) {
      delete newDamagedParts[partId];
      if (selectedPartId === partId) {
        setSelectedPartId(null);
      }
    } else {
      const partInfo = CAR_PARTS.find(p => p.id === partId);
      if (partInfo) {
        newDamagedParts[partId] = {
          partId: partId,
          partName: partInfo.name,
          services: [],
          replacementParts: [],
          materials: [],
        };
        setSelectedPartId(partId);
      }
    }
    updateDamagedParts(newDamagedParts);
  };
  
  const handleSelectPartForEditing = (partId: string) => {
    if (quote.damagedParts[partId]) {
      setSelectedPartId(partId);
    }
  }

  const handleServiceChange = (serviceName: string, checked: boolean) => {
    if (!selectedPartId || isReadOnly) return;
    const newDamagedParts = { ...quote.damagedParts };
    const part = newDamagedParts[selectedPartId];
    if (checked) {
      const serviceTemplate = AVAILABLE_SERVICES.find(s => s.name === serviceName);
      if (serviceTemplate) {
        part.services.push({
          id: `${selectedPartId}-${serviceName}-${Date.now()}`,
          name: serviceTemplate.name,
          type: serviceTemplate.type,
          laborHours: 2, // Default value
          costPerHour: LABOR_COST_PER_HOUR,
        });
      }
    } else {
      part.services = part.services.filter(s => s.name !== serviceName);
    }
    updateDamagedParts(newDamagedParts);
  };

  const updateItem = (
    itemType: 'replacementParts' | 'materials',
    index: number,
    field: 'quantity' | 'unitCost' | 'name',
    value: string | number
  ) => {
    if (!selectedPartId || isReadOnly) return;
    const newDamagedParts = { ...quote.damagedParts };
    const part = newDamagedParts[selectedPartId];
    const item = part[itemType][index];

    if (item) {
      (item as any)[field] = (field === 'name') ? value : Number(value);
      updateDamagedParts(newDamagedParts);
    }
  };
  
  const addItem = (itemType: 'replacementParts' | 'materials') => {
    if (!selectedPartId || isReadOnly) return;

    const newDamagedParts = { ...quote.damagedParts };
    const part = newDamagedParts[selectedPartId];

    if (itemType === 'replacementParts') {
      if (!newPart.name || newPart.quantity <= 0 || newPart.unitCost < 0) return;
      part.replacementParts.push({
        id: `${selectedPartId}-part-${Date.now()}`,
        ...newPart
      });
      setNewPart({ name: '', quantity: 1, unitCost: 0 });
    } else {
      if (!newMaterial.name || newMaterial.quantity <= 0 || newMaterial.unitCost < 0) return;
      part.materials.push({
        id: `${selectedPartId}-material-${Date.now()}`,
        ...newMaterial
      });
      setNewMaterial({ name: AVAILABLE_MATERIALS[0]?.name || '', quantity: 1, unitCost: 0 });
    }
    updateDamagedParts(newDamagedParts);
  };

  const removeItem = (itemType: 'replacementParts' | 'materials', index: number) => {
    if (!selectedPartId || isReadOnly) return;
    const newDamagedParts = { ...quote.damagedParts };
    const part = newDamagedParts[selectedPartId];
    part[itemType].splice(index, 1);
    updateDamagedParts(newDamagedParts);
  };


  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isReadOnly) return;
    if (e.target.files) {
      for(const file of Array.from(e.target.files)) {
        const typedFile = file as File;
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            addPhoto({ name: typedFile.name, url: event.target.result as string });
          }
        };
        reader.readAsDataURL(typedFile);
      }
    }
  };

  const selectedPartDetails = useMemo(() => {
    return selectedPartId ? quote.damagedParts[selectedPartId] : null;
  }, [selectedPartId, quote.damagedParts]);

  const totals = useMemo(() => {
    let labor = 0;
    let parts = 0;
    let materials = 0;
    Object.values(quote.damagedParts).forEach((part: DamagedPart) => {
      part.services.forEach(s => labor += s.laborHours * s.costPerHour);
      part.replacementParts.forEach(p => parts += p.quantity * p.unitCost);
      part.materials.forEach(m => materials += m.quantity * m.unitCost);
    });
    return { labor, parts, materials, total: labor + parts + materials };
  }, [quote.damagedParts]);

  const creditCardTotal = useMemo(() => {
    return totals.total * (1 + CREDIT_CARD_FEE_PERCENTAGE / 100);
  }, [totals.total]);

  const hasItems = quote.customer.name && quote.vehicle.make && Object.keys(quote.damagedParts).length > 0 && !!quote.paymentMethod;

  return (
    <div className="space-y-8">
      {isReadOnly && (
          <div className="bg-yellow-500/10 border border-yellow-500 text-yellow-300 px-4 py-3 rounded-lg text-center">
              <p><strong>Modo de Visualização:</strong> Você não tem permissão para editar este orçamento.</p>
          </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">1. Informações do Cliente e Veículo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input id="customerName" label="Nome do Cliente" value={quote.customer.name} onChange={e => updateCustomer({ ...quote.customer, name: e.target.value })} disabled={isReadOnly} />
            <Input id="customerPhone" label="Telefone" value={quote.customer.phone} onChange={e => updateCustomer({ ...quote.customer, phone: e.target.value })} disabled={isReadOnly} />
            <Input id="customerEmail" label="Email" type="email" value={quote.customer.email} onChange={e => updateCustomer({ ...quote.customer, email: e.target.value })} disabled={isReadOnly} />
            <Input id="vehicleMake" label="Marca" value={quote.vehicle.make} onChange={e => updateVehicle({ ...quote.vehicle, make: e.target.value })} disabled={isReadOnly} />
            <Input id="vehicleModel" label="Modelo" value={quote.vehicle.model} onChange={e => updateVehicle({ ...quote.vehicle, model: e.target.value })} disabled={isReadOnly} />
            <Input id="vehicleYear" label="Ano" value={quote.vehicle.year} onChange={e => updateVehicle({ ...quote.vehicle, year: e.target.value })} disabled={isReadOnly} />
            <Input id="vehicleColor" label="Cor" value={quote.vehicle.color} onChange={e => updateVehicle({ ...quote.vehicle, color: e.target.value })} disabled={isReadOnly} />
            <Input id="vehiclePlate" label="Placa" value={quote.vehicle.plate} onChange={e => updateVehicle({ ...quote.vehicle, plate: e.target.value })} disabled={isReadOnly} />
          </div>
        </Card>
        <Card>
          <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">2. Fotos dos Danos</h2>
          <div className="space-y-4">
            <input type="file" multiple onChange={handleFileUpload} disabled={isReadOnly} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500/10 file:text-blue-400 hover:file:bg-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed" />
            <div className="grid grid-cols-3 gap-4">
              {quote.photos.map((photo, index) => (
                <img key={index} src={photo.url} alt={photo.name} className="w-full h-24 object-cover rounded-md" />
              ))}
            </div>
          </div>
        </Card>
      </div>

      <AIAssistant updateDamagedParts={updateDamagedParts} existingParts={quote.damagedParts} />
      
      <Card>
        <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">3. Seleção de Peças Danificadas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <DamageVisualizer selectedParts={Object.keys(quote.damagedParts)} onPartClick={handlePartToggle} onPartSelect={handleSelectPartForEditing} />
          </div>
          <div className="bg-gray-900/50 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-3">Peças Selecionadas</h3>
            {Object.keys(quote.damagedParts).length === 0 ? (
              <p className="text-gray-400 text-sm">Clique em uma peça no diagrama para adicioná-la ao orçamento.</p>
            ) : (
              <ul className="space-y-2">
                {Object.values(quote.damagedParts).map((part: DamagedPart) => (
                  <li key={part.partId} 
                      onClick={() => setSelectedPartId(part.partId)}
                      className={`p-2 rounded-md cursor-pointer transition-colors ${selectedPartId === part.partId ? 'bg-blue-500 text-white ring-2 ring-blue-400' : 'hover:bg-gray-700'}`}>
                    {part.partName}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Card>

      {selectedPartDetails && (
        <Card>
          <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">4. Detalhes do Reparo para: <span className="text-blue-400">{selectedPartDetails.partName}</span></h2>
          <div className="space-y-6">
            {/* Services */}
            <div>
              <h3 className="font-semibold text-lg mb-2">Serviços</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {AVAILABLE_SERVICES.map(service => (
                  <div key={service.name} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`${selectedPartId}-${service.name}`}
                      checked={selectedPartDetails.services.some(s => s.name === service.name)}
                      onChange={e => handleServiceChange(service.name, e.target.checked)}
                      disabled={isReadOnly}
                      className="h-4 w-4 text-blue-500 border-gray-600 rounded focus:ring-blue-500 bg-gray-700 focus:ring-offset-gray-800 disabled:opacity-50"
                    />
                    <label htmlFor={`${selectedPartId}-${service.name}`} className={`ml-2 text-sm text-gray-300 ${isReadOnly ? 'opacity-70' : ''}`}>{service.name}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Replacement Parts */}
            <div>
                <h3 className="font-semibold text-lg mb-2">Peças de Reposição</h3>
                {selectedPartDetails.replacementParts.map((part, index) => (
                    <div key={part.id} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center mb-2 p-2 bg-gray-700/50 rounded-md">
                         <input type="text" value={part.name} onChange={e => updateItem('replacementParts', index, 'name', e.target.value)} placeholder="Nome da Peça" disabled={isReadOnly} className="md:col-span-2 w-full px-2 py-1 border border-gray-600 rounded-md bg-gray-800 text-gray-200 disabled:bg-gray-700" />
                         <div className="flex items-center gap-2">
                            <input type="number" value={part.quantity} onChange={e => updateItem('replacementParts', index, 'quantity', e.target.value)} min="1" disabled={isReadOnly} className="w-full px-2 py-1 border border-gray-600 rounded-md bg-gray-800 text-gray-200 disabled:bg-gray-700" />
                            <span className="text-gray-400 text-sm">Qtd</span>
                         </div>
                         <div className="flex items-center gap-2">
                            <input type="number" value={part.unitCost} onChange={e => updateItem('replacementParts', index, 'unitCost', e.target.value)} min="0" step="0.01" disabled={isReadOnly} className="w-full px-2 py-1 border border-gray-600 rounded-md bg-gray-800 text-gray-200 disabled:bg-gray-700" />
                            <button onClick={() => removeItem('replacementParts', index)} disabled={isReadOnly} className="text-red-500 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed">&times;</button>
                         </div>
                    </div>
                ))}
                {!isReadOnly && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center mt-2 pt-2 border-t border-gray-700">
                      <input type="text" value={newPart.name} onChange={e => setNewPart({...newPart, name: e.target.value})} placeholder="Nova Peça" className="md:col-span-2 w-full px-2 py-1 border border-gray-600 rounded-md bg-gray-800 text-gray-200"/>
                      <input type="number" value={newPart.quantity} onChange={e => setNewPart({...newPart, quantity: Number(e.target.value)})} min="1" className="w-full px-2 py-1 border border-gray-600 rounded-md bg-gray-800 text-gray-200"/>
                      <input type="number" value={newPart.unitCost} onChange={e => setNewPart({...newPart, unitCost: Number(e.target.value)})} min="0" step="0.01" placeholder="Custo Unit. (R$)" className="w-full px-2 py-1 border border-gray-600 rounded-md bg-gray-800 text-gray-200"/>
                      <Button onClick={() => addItem('replacementParts')} variant="secondary" className="w-full text-sm py-1">+</Button>
                  </div>
                )}
            </div>

            {/* Materials */}
            <div>
              <h3 className="font-semibold text-lg mb-2">Materiais</h3>
               {selectedPartDetails.materials.map((material, index) => (
                  <div key={material.id} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center mb-2 p-2 bg-gray-700/50 rounded-md">
                      <span className="md:col-span-2 text-gray-300">{material.name}</span>
                      <div className="flex items-center gap-2">
                          <input type="number" value={material.quantity} onChange={e => updateItem('materials', index, 'quantity', e.target.value)} min="1" disabled={isReadOnly} className="w-full px-2 py-1 border border-gray-600 rounded-md bg-gray-800 text-gray-200 disabled:bg-gray-700" />
                          <span className="text-gray-400 text-sm">Qtd</span>
                      </div>
                      <div className="flex items-center gap-2">
                          <input type="number" value={material.unitCost} onChange={e => updateItem('materials', index, 'unitCost', e.target.value)} min="0" step="0.01" disabled={isReadOnly} className="w-full px-2 py-1 border border-gray-600 rounded-md bg-gray-800 text-gray-200 disabled:bg-gray-700" />
                          <button onClick={() => removeItem('materials', index)} disabled={isReadOnly} className="text-red-500 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed">&times;</button>
                      </div>
                  </div>
              ))}
              {!isReadOnly && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center mt-2 pt-2 border-t border-gray-700">
                    <select value={newMaterial.name} onChange={e => setNewMaterial({...newMaterial, name: e.target.value})} className="md:col-span-2 w-full px-2 py-1 border border-gray-600 rounded-md bg-gray-800 text-gray-200">
                        {AVAILABLE_MATERIALS.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                    </select>
                    <input type="number" value={newMaterial.quantity} onChange={e => setNewMaterial({...newMaterial, quantity: Number(e.target.value)})} min="1" className="w-full px-2 py-1 border border-gray-600 rounded-md bg-gray-800 text-gray-200"/>
                    <input type="number" value={newMaterial.unitCost} onChange={e => setNewMaterial({...newMaterial, unitCost: Number(e.target.value)})} min="0" step="0.01" placeholder="Custo Unit. (R$)" className="w-full px-2 py-1 border border-gray-600 rounded-md bg-gray-800 text-gray-200"/>
                    <Button onClick={() => addItem('materials')} variant="secondary" className="w-full text-sm py-1">+</Button>
                </div>
              )}
            </div>

          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
         <EstimateSummary quote={quote} updateDamagedParts={updateDamagedParts} />
          <div className="space-y-8 lg:sticky lg:top-24">
            <Card>
              <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">6. Forma de Pagamento</h2>
              <fieldset disabled={isReadOnly} className="space-y-3">
                {PAYMENT_METHODS.map(method => (
                  <label
                    key={method.id}
                    htmlFor={method.id}
                    className={`flex items-center justify-between p-4 rounded-lg transition-all border-2 ${
                      quote.paymentMethod === method.id
                        ? 'border-blue-500 bg-blue-600/20'
                        : 'border-gray-700 bg-gray-700/50 hover:border-gray-600'
                    } ${isReadOnly ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="paymentMethod"
                        id={method.id}
                        checked={quote.paymentMethod === method.id}
                        onChange={() => updatePaymentMethod(method.id as PaymentMethod)}
                        className="h-5 w-5 text-blue-600 bg-gray-900 border-gray-600 focus:ring-blue-500 focus:ring-offset-gray-800"
                      />
                      <span className="ml-3 font-medium text-white">{method.name}</span>
                    </div>
                    {method.id === 'credit' && (
                      <span className="text-sm font-medium text-gray-300">
                        (+{CREDIT_CARD_FEE_PERCENTAGE}%)
                      </span>
                    )}
                  </label>
                ))}
              </fieldset>
              {totals.total > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-700 space-y-2">
                  <div className="flex justify-between text-base text-gray-300">
                    <span>Subtotal:</span>
                    <span className="font-medium">{totals.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
                  {quote.paymentMethod === 'credit' && (
                    <div className="flex justify-between text-base text-yellow-400">
                      <span>Acréscimo Cartão ({CREDIT_CARD_FEE_PERCENTAGE}%):</span>
                      <span className="font-medium">+ {(creditCardTotal - totals.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-bold text-white pt-2 mt-2 border-t border-gray-600">
                    <span>Total a Pagar:</span>
                    <span>
                      {(quote.paymentMethod === 'credit' ? creditCardTotal : totals.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                </div>
              )}
            </Card>

            <Card>
              <h2 className="text-xl font-bold mb-4">Finalizar Orçamento</h2>
              <p className="text-gray-400 mb-4">Revise todos os itens antes de gerar a prévia do orçamento.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={onSave} variant="secondary" className="w-full" disabled={isReadOnly}>
                  Salvar Orçamento
                </Button>
                <Button onClick={onPreview} disabled={!hasItems} className="w-full">
                  {isReadOnly ? 'Visualizar Prévia' : 'Gerar Prévia do Orçamento'}
                </Button>
              </div>
              {!hasItems && !isReadOnly && <p className="text-red-500 text-sm mt-2">Preencha os dados, selecione peças e a forma de pagamento.</p>}
            </Card>
          </div>
      </div>
    </div>
  );
};

export default QuoteForm;