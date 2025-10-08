import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import Card from './ui/Card';
import Input from './ui/Input';
import Button from './ui/Button';

interface UserFormModalProps {
  user: User | null;
  onSave: (user: User) => void;
  onClose: () => void;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ user, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    password: '',
    role: 'estimator' as UserRole,
    status: 'active' as 'active' | 'inactive',
  });

  useEffect(() => {
    if (user) {
      setFormData({ ...user, password: '' }); // Don't show existing password
    } else {
      setFormData({
        id: '', name: '', email: '', password: '',
        role: 'estimator', status: 'active',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.password && !user) { // Require password for new users
        alert('A senha é obrigatória para novos usuários.');
        return;
    }
    // In a real app, password would be hashed here before saving.
    onSave(formData);
  };

  const isNewUser = !user;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <Card className="w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <header className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">
            {isNewUser ? 'Adicionar Novo Usuário' : 'Editar Usuário'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl font-bold">&times;</button>
        </header>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="name"
            name="name"
            label="Nome Completo"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <Input
            id="email"
            name="email"
            label="E-mail de Acesso"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-400 mb-1">
              Perfil / Função
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-200"
            >
              <option value="estimator">Orçamentista</option>
              <option value="viewer">Visualizador</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <Input
            id="password"
            name="password"
            label="Senha"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder={isNewUser ? 'Defina uma senha inicial' : 'Deixe em branco para manter a atual'}
            required={isNewUser}
          />
          
          <footer className="flex justify-end gap-4 pt-4 border-t border-gray-700">
            <Button type="button" onClick={onClose} variant="secondary">
              Cancelar
            </Button>
            <Button type="submit">
              Salvar
            </Button>
          </footer>
        </form>
      </Card>
    </div>
  );
};

export default UserFormModal;