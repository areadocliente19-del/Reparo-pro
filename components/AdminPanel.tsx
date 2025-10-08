import React from 'react';
import { User } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';

interface AdminPanelProps {
  users: User[];
  onAddUser: () => void;
  onEditUser: (user: User) => void;
  onSetStatus: (userId: string, status: 'active' | 'inactive') => void;
}

const roleMap: { [key in User['role']]: string } = {
  admin: 'Administrador',
  estimator: 'Orçamentista',
  viewer: 'Visualizador',
};

const statusMap = {
  active: { text: 'Ativo', color: 'bg-green-500/20 text-green-400' },
  inactive: { text: 'Inativo', color: 'bg-red-500/20 text-red-400' },
};

const AdminPanel: React.FC<AdminPanelProps> = ({ users, onAddUser, onEditUser, onSetStatus }) => {
  return (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Gerenciar Usuários</h1>
        <Button onClick={onAddUser}>+ Adicionar Usuário</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-gray-700 text-gray-400">
            <tr>
              <th className="p-3">Nome</th>
              <th className="p-3">E-mail</th>
              <th className="p-3">Perfil</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => {
              const statusInfo = statusMap[user.status];
              return (
                <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="p-3 font-medium">{user.name}</td>
                  <td className="p-3 text-gray-300">{user.email}</td>
                  <td className="p-3">{roleMap[user.role]}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusInfo.color}`}>
                      {statusInfo.text}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <Button onClick={() => onEditUser(user)} variant="secondary" className="!text-xs !py-1 !px-2">Editar</Button>
                      {user.status === 'active' ? (
                        <Button onClick={() => onSetStatus(user.id, 'inactive')} variant="danger" className="!text-xs !py-1 !px-2">Desativar</Button>
                      ) : (
                        <Button onClick={() => onSetStatus(user.id, 'active')} className="!text-xs !py-1 !px-2 bg-green-600 hover:bg-green-700">Ativar</Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default AdminPanel;