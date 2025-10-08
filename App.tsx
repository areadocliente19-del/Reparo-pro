import React, { useState, useEffect } from 'react';
import { Quote, User } from './types';
import QuoteForm from './components/QuoteForm';
import QuotePreview from './components/QuotePreview';
import Login from './components/Login';
import Button from './components/ui/Button';
import { initialQuote } from './constants';
import SavedQuotesList from './components/SavedQuotesList';
import Dashboard from './components/Dashboard';
import WorkOrderPreview from './components/WorkOrderPreview';
import CustomerPortal from './components/CustomerPortal';
import ManageService from './components/ManageService';
import Card from './components/ui/Card';
import AdminPanel from './components/AdminPanel';
import UserFormModal from './components/UserFormModal';
import SearchResults from './components/SearchResults';

const App: React.FC = () => {
  const [quote, setQuote] = useState<Quote>(initialQuote);
  const [activeQuote, setActiveQuote] = useState<Quote | null>(null);
  const [isPreview, setIsPreview] = useState<boolean>(false);
  const [isWorkOrderPreview, setIsWorkOrderPreview] = useState<boolean>(false);
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  const [savedQuotes, setSavedQuotes] = useState<Quote[]>([]);
  const [isSavedQuotesVisible, setIsSavedQuotesVisible] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'quoteForm' | 'manageService' | 'customerPortal' | 'adminPanel' | 'searchResults'>('dashboard');
  const [invalidTokenError, setInvalidTokenError] = useState<boolean>(false);

  const [isUserFormVisible, setIsUserFormVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');


  // --- DATA PERSISTENCE ---
  useEffect(() => {
    try {
      // Load users or create default admin
      const usersFromStorage = JSON.parse(localStorage.getItem('users') || '[]');
      if (usersFromStorage.length === 0) {
        const adminUser: User = {
          id: `user-${Date.now()}`,
          name: 'Admin Padrão',
          email: 'admin@reparopro.com',
          // NOTE: In a real application, passwords should ALWAYS be hashed.
          // This is a plain text password for demonstration purposes only.
          password: 'password123',
          role: 'admin',
          status: 'active',
        };
        saveUsersToStorage([adminUser]);
      } else {
        setUsers(usersFromStorage);
      }
      
      // Load quotes
      const quotesFromStorage = JSON.parse(localStorage.getItem('savedQuotes') || '[]') as Quote[];
      setSavedQuotes(quotesFromStorage);

      // Check for customer portal token in URL
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      if (token) {
        const portalQuote = quotesFromStorage.find(q => q.customerPortalToken === token);
        if (portalQuote) {
          setActiveQuote(portalQuote);
          setCurrentView('customerPortal');
        } else {
          setInvalidTokenError(true);
        }
      }

    } catch (error) {
      console.error("Failed to load data from storage:", error);
      setSavedQuotes([]);
      setUsers([]);
    }
  }, []);

  const saveQuotesToStorage = (quotes: Quote[]) => {
    setSavedQuotes(quotes);
    localStorage.setItem('savedQuotes', JSON.stringify(quotes));
  };
  
  const saveUsersToStorage = (usersToSave: User[]) => {
    setUsers(usersToSave);
    localStorage.setItem('users', JSON.stringify(usersToSave));
  }


  // --- AUTH & USER MANAGEMENT ---
  const handleLogin = (email: string, password: string): { success: boolean, error?: string } => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (user) {
      if (user.status === 'inactive') {
        return { success: false, error: 'Este usuário está inativo.' };
      }
      setCurrentUser({ ...user, lastLogin: Date.now() });
      return { success: true };
    }
    return { success: false, error: 'E-mail ou senha inválidos.' };
  };

  const handleLogout = () => {
    setCurrentUser(null);
    resetQuote();
    setCurrentView('dashboard');
  };

  const handleSaveUser = (userToSave: User) => {
    const existingIndex = users.findIndex(u => u.id === userToSave.id);
    let newUsers;
    if (existingIndex > -1) {
      newUsers = users.map(u => u.id === userToSave.id ? userToSave : u);
    } else {
      newUsers = [...users, { ...userToSave, id: `user-${Date.now()}` }];
    }
    saveUsersToStorage(newUsers);
    setIsUserFormVisible(false);
    setEditingUser(null);
  };

  const handleSetUserStatus = (userId: string, status: 'active' | 'inactive') => {
    const newUsers = users.map(u => u.id === userId ? { ...u, status } : u);
    saveUsersToStorage(newUsers);
  };

  const openUserForm = (user: User | null) => {
    setEditingUser(user);
    setIsUserFormVisible(true);
  };


  // --- QUOTE & SERVICE MANAGEMENT ---
  const updateCustomer = (customer: any) => setQuote(q => ({ ...q, customer }));
  const updateVehicle = (vehicle: any) => setQuote(q => ({ ...q, vehicle }));
  const addPhoto = (photo: any) => setQuote(q => ({ ...q, photos: [...q.photos, photo] }));
  const updateDamagedParts = (parts: any) => setQuote(q => ({ ...q, damagedParts: parts }));
  const updatePaymentMethod = (method: any) => setQuote(q => ({ ...q, paymentMethod: method }));
  
  const resetQuote = () => {
    setQuote(initialQuote);
    setActiveQuote(null);
    setIsPreview(false);
    setIsWorkOrderPreview(false);
  };
  
  const handleGoToDashboard = () => {
    resetQuote();
    setCurrentView('dashboard');
    if (window.history.pushState) {
        const newURL = new URL(window.location.href);
        newURL.search = '';
        window.history.pushState({ path: newURL.href }, '', newURL.href);
    }
  };

  const handleNewQuoteClick = () => {
    resetQuote();
    setCurrentView('quoteForm');
  };

  const handleSaveQuote = () => {
    const quoteToSave = { ...quote, status: quote.status || 'pending' } as Quote;
    if (!quoteToSave.id) {
      quoteToSave.id = `quote-${Date.now()}`;
      quoteToSave.createdAt = Date.now();
      if (currentUser) {
          quoteToSave.createdById = currentUser.id;
          quoteToSave.createdByName = currentUser.name;
      }
    }
    const existingIndex = savedQuotes.findIndex(q => q.id === quoteToSave.id);
    let newSavedQuotes = existingIndex > -1
      ? savedQuotes.map(q => q.id === quoteToSave.id ? quoteToSave : q)
      : [quoteToSave, ...savedQuotes];
    saveQuotesToStorage(newSavedQuotes);
    setQuote(quoteToSave);
    alert('Orçamento salvo com sucesso!');
  };

  const handleLoadQuote = (id: string) => {
    const quoteToLoad = savedQuotes.find(q => q.id === id);
    if (quoteToLoad) {
      setQuote(quoteToLoad);
      setActiveQuote(quoteToLoad);
      setIsSavedQuotesVisible(false);
      setCurrentView('quoteForm');
    }
  };

  const handleDeleteQuote = (id: string) => {
    const updatedQuotes = savedQuotes.filter(q => q.id !== id);
    saveQuotesToStorage(updatedQuotes);
    if (quote.id === id) {
      resetQuote();
      setCurrentView('dashboard');
    }
  };
  
  const handleUpdateQuoteStatus = (id: string, status: 'approved' | 'denied') => {
    const updatedQuotes = savedQuotes.map(q => (q.id === id) ? { ...q, status, approvedAt: status === 'approved' ? Date.now() : q.approvedAt } : q);
    saveQuotesToStorage(updatedQuotes);
  };

  const handleGenerateOS = (id: string) => {
    const updatedQuotes = savedQuotes.map(q => {
      if (q.id === id) {
        return { 
          ...q, 
          status: 'os-generated' as const, 
          osGeneratedAt: Date.now(),
          customerPortalToken: crypto.randomUUID(),
          timeline: [{ id: `timeline-${Date.now()}`, date: Date.now(), status: 'OS Gerada', description: 'Ordem de serviço gerada e aguardando início dos reparos.' }],
          chat: [],
        };
      }
      return q;
    });
    saveQuotesToStorage(updatedQuotes);
    const quoteForOS = updatedQuotes.find(q => q.id === id);
    if (quoteForOS) {
      setQuote(quoteForOS);
      setActiveQuote(quoteForOS);
      setIsSavedQuotesVisible(false);
      setIsWorkOrderPreview(true);
    }
  };

  const handleSignWorkOrder = (id: string, signatureDataUrl: string) => {
    const updatedQuotes = savedQuotes.map(q => (q.id === id) ? { ...q, signature: signatureDataUrl, signedAt: Date.now(), status: 'em-andamento' as const } : q);
    saveQuotesToStorage(updatedQuotes);
    if (activeQuote?.id === id) {
      setActiveQuote(q => q ? {...q, signature: signatureDataUrl, signedAt: Date.now(), status: 'em-andamento'} : null);
    }
    if (quote.id === id) {
      setQuote(q => ({...q, signature: signatureDataUrl, signedAt: Date.now(), status: 'em-andamento' }));
    }
  };

  const handleUpdateQuoteTerms = (id: string, terms: string) => {
    const updatedQuotes = savedQuotes.map(q => (q.id === id) ? { ...q, termsAndConditions: terms } : q);
    saveQuotesToStorage(updatedQuotes);
    if (activeQuote?.id === id) {
      setActiveQuote(q => q ? {...q, termsAndConditions: terms} : null);
    }
     if (quote.id === id) {
      setQuote(q => ({...q, termsAndConditions: terms }));
    }
  };
  
  const handleManageService = (id: string) => {
    const quoteToManage = savedQuotes.find(q => q.id === id);
    if (quoteToManage) {
        setActiveQuote(quoteToManage);
        setCurrentView('manageService');
        setIsSavedQuotesVisible(false);
    }
  };

  const handleUpdateService = (updatedQuote: Quote) => {
    const updatedQuotes = savedQuotes.map(q => q.id === updatedQuote.id ? updatedQuote : q);
    saveQuotesToStorage(updatedQuotes);
    setActiveQuote(updatedQuote);
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
        setSearchQuery(searchTerm.trim());
        setCurrentView('searchResults');
    }
  }


  // --- RENDER LOGIC ---
  if (invalidTokenError) {
    return (
      <div className="bg-gray-900 min-h-screen flex items-center justify-center p-4 text-gray-300">
        <Card className="text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-400 mt-4 mb-2">Link Inválido</h2>
          <p className="mb-6 text-gray-400">O link de acesso não é válido. Entre em contato com a oficina.</p>
          <Button onClick={() => setInvalidTokenError(false)} variant="secondary">Voltar</Button>
        </Card>
      </div>
    );
  }

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }
  
  const renderContent = () => {
    if (currentView === 'customerPortal' && activeQuote) {
        return <CustomerPortal quote={activeQuote} onUpdateService={handleUpdateService} />;
    }
    if (currentView === 'manageService' && activeQuote) {
        return <ManageService quote={activeQuote} onUpdateService={handleUpdateService} onBack={handleGoToDashboard} />;
    }
    if (isWorkOrderPreview && activeQuote) {
      return <WorkOrderPreview quote={activeQuote} onBack={handleGoToDashboard} onSign={(signature) => handleSignWorkOrder(activeQuote.id, signature)} onUpdateTerms={(terms) => handleUpdateQuoteTerms(activeQuote.id, terms)} />;
    }
    if (isPreview) {
       return <QuotePreview quote={quote} onBack={() => setIsPreview(false)} onNewQuote={handleNewQuoteClick} />;
    }
    switch (currentView) {
      case 'dashboard':
        return <Dashboard quotes={savedQuotes} users={users} onNewQuote={handleNewQuoteClick} onLoadQuote={handleLoadQuote} onManageService={handleManageService} currentUser={currentUser} />;
      case 'adminPanel':
        return <AdminPanel users={users} onAddUser={() => openUserForm(null)} onEditUser={openUserForm} onSetStatus={handleSetUserStatus} />;
      case 'searchResults':
        const results = savedQuotes.filter(q => q.vehicle.plate.toLowerCase().includes(searchQuery.toLowerCase()));
        return <SearchResults 
                    searchQuery={searchQuery} 
                    results={results} 
                    onLoadQuote={handleLoadQuote} 
                    onManageService={handleManageService} 
                />
      case 'quoteForm':
        return (
          <QuoteForm 
            quote={quote}
            currentUser={currentUser}
            updateCustomer={updateCustomer} updateVehicle={updateVehicle}
            addPhoto={addPhoto} updateDamagedParts={updateDamagedParts}
            updatePaymentMethod={updatePaymentMethod}
            onPreview={() => setIsPreview(true)} onSave={handleSaveQuote}
          />
        );
      default:
        return <Dashboard quotes={savedQuotes} users={users} onNewQuote={handleNewQuoteClick} onLoadQuote={handleLoadQuote} onManageService={handleManageService} currentUser={currentUser} />;
    }
  }

  return (
    <>
      {isUserFormVisible && (
        <UserFormModal 
          user={editingUser} 
          onSave={handleSaveUser} 
          onClose={() => { setIsUserFormVisible(false); setEditingUser(null); }}
        />
      )}
      {isSavedQuotesVisible && (
        <SavedQuotesList
          quotes={savedQuotes} onLoad={handleLoadQuote} onDelete={handleDeleteQuote}
          onClose={() => setIsSavedQuotesVisible(false)} onUpdateStatus={handleUpdateQuoteStatus}
          onGenerateOS={handleGenerateOS} onManage={handleManageService}
          currentUser={currentUser}
        />
      )}
      <div className="bg-gray-900 min-h-screen text-gray-300">
        <header className="bg-gray-800 shadow-lg sticky top-0 z-10 print:hidden">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center gap-4">
            <div className="flex items-center gap-3 cursor-pointer flex-shrink-0" onClick={handleGoToDashboard}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0L7.86 5.89c-.31.25-.68.42-1.07.49l-2.9.42c-1.62.23-2.28 2.18-1.09 3.33l2.1 2.05c.24.24.36.58.31.92l-.5 2.88c-.28 1.6.93 2.83 2.36 2.12l2.6-1.37c.33-.17.71-.17 1.04 0l2.6 1.37c1.43.71 2.64-.52 2.36-2.12l-.5-2.88c-.05-.34.07-.68.31-.92l2.1-2.05c1.19-1.15.53-3.1-1.09-3.33l-2.9-.42c-.39-.07-.76-.24-1.07-.49L11.49 3.17z" clipRule="evenodd" /></svg>
              <h1 className="text-2xl font-bold text-white hidden sm:block">ReparoPro</h1>
            </div>
            
            {currentView !== 'customerPortal' && (
              <>
                <form onSubmit={handleSearch} className="flex-grow max-w-md">
                  <div className="relative">
                      <input 
                          type="search"
                          placeholder="Buscar por placa..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full px-4 py-1.5 pr-10 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-gray-200"
                      />
                      <button type="submit" className="absolute inset-y-0 right-0 px-3 text-gray-400 hover:text-blue-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                      </button>
                  </div>
                </form>

                <div className="flex items-center gap-2 flex-shrink-0">
                   <div className="hidden lg:flex items-center gap-2">
                     <Button onClick={handleGoToDashboard} variant="secondary" className="!py-1.5 !px-3 !text-sm">Dashboard</Button>
                     {currentUser.role !== 'viewer' && <Button onClick={handleNewQuoteClick} variant="primary" className="!py-1.5 !px-3 !text-sm">Novo Orçamento</Button>}
                     <Button onClick={() => setIsSavedQuotesVisible(true)} variant="secondary" className="!py-1.5 !px-3 !text-sm">Orçamentos ({savedQuotes.length})</Button>
                     {currentUser.role === 'admin' && <Button onClick={() => setCurrentView('adminPanel')} variant="secondary" className="!py-1.5 !px-3 !text-sm">Usuários</Button>}
                   </div>
                   <div className="pl-2 border-l border-gray-600">
                      <span className="text-sm text-gray-400 mr-2 hidden md:inline">Olá, {currentUser.name.split(' ')[0]}</span>
                      <Button onClick={handleLogout} variant="danger" className="!py-1.5 !px-3 !text-sm">Sair</Button>
                   </div>
                </div>
              </>
            )}
          </div>
        </header>
        <main className="container mx-auto p-4 md:p-8">
          {renderContent()}
        </main>
      </div>
    </>
  );
};

export default App;