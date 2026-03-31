import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useIsAdmin } from '../hooks/useIsAdmin';
import {
  fetchPendingQuestions,
  approveQuestion,
  rejectQuestion,
  createCategoryAdmin,
  fetchCategories,
  addInfiniteCoins,
  deleteCategory,
  fetchCurrencies,
  createCurrency,
  updateCurrency,
  deleteCurrency,
  toggleCurrencyActive
} from '../services/firestore';

const MaterialIcon = ({ name, className = '' }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

// Iconos disponibles para categorias
const CATEGORY_ICONS = [
  { name: 'history_edu', label: 'Historia' },
  { name: 'calculate', label: 'Matematicas' },
  { name: 'public', label: 'Geografia' },
  { name: 'science', label: 'Ciencias' },
  { name: 'menu_book', label: 'Libro' },
  { name: 'emoji_events', label: 'Trofeo' },
  { name: 'lightbulb', label: 'Idea' },
  { name: 'star', label: 'Estrella' }
];

// Ingredientes disponibles
const INGREDIENTES = [
  { value: 'masa', label: 'Masa de masa', icon: 'grain' },
  { value: 'cerdo', label: 'Carne de Cerdo', icon: 'lunch_dining' },
  { value: 'arroz', label: 'Arroz', icon: 'rice_bowl' },
  { value: 'papa', label: 'Papa', icon: 'potato' },
  { value: 'chile', label: 'chile', icon: 'olive' }
];

export default function AdminPanel() {
  const { userData, currentUser, logout } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const [activeTab, setActiveTab] = useState('questions'); // 'questions', 'categories', 'currencies', 'coins'
  const [pendingQuestions, setPendingQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState({ name: '', description: '', ingrediente: 'masa', icon: 'history_edu' });
  const [newCurrency, setNewCurrency] = useState({ name: '', description: '', icon: 'monetization_on', defaultAmount: 0 });
  const [editingCurrency, setEditingCurrency] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    // Verificar si es admin
    if (!userData?.isAdmin) {
      return;
    }
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [questions, cats, curr] = await Promise.all([
        fetchPendingQuestions(),
        fetchCategories(),
        fetchCurrencies()
      ]);
      setPendingQuestions(questions);
      setCategories(cats);
      setCurrencies(curr);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      showMessage('error', 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }

  function showMessage(type, text) {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  }

  async function handleApprove(questionId) {
    setActionLoading(true);
    try {
      await approveQuestion(questionId);
      setPendingQuestions(prev => prev.filter(q => q.id !== questionId));
      showMessage('success', 'Pregunta aprobada exitosamente');
    } catch (error) {
      console.error('Error al aprobar pregunta:', error);
      showMessage('error', 'Error al aprobar pregunta');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject(questionId) {
    if (!confirm('¿Estás seguro de rechazar esta pregunta?')) return;
    
    setActionLoading(true);
    try {
      await rejectQuestion(questionId);
      setPendingQuestions(prev => prev.filter(q => q.id !== questionId));
      showMessage('success', 'Pregunta rechazada');
    } catch (error) {
      console.error('Error al rechazar pregunta:', error);
      showMessage('error', 'Error al rechazar pregunta');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCreateCategory(e) {
    e.preventDefault();
    if (!newCategory.name.trim()) {
      showMessage('error', 'El nombre de la categoría es requerido');
      return;
    }

    setActionLoading(true);
    try {
      await createCategoryAdmin(newCategory.name, newCategory.description, newCategory.ingrediente, newCategory.icon);
      setNewCategory({ name: '', description: '', ingrediente: 'masa', icon: 'history_edu' });
      const cats = await fetchCategories();
      setCategories(cats);
      showMessage('success', 'Categoría creada exitosamente');
    } catch (error) {
      console.error('Error al crear categoría:', error);
      showMessage('error', 'Error al crear categoría');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeleteCategory(categoryId) {
    if (!confirm('¿Estás seguro de eliminar esta categoría? Las preguntas asociadas permanecerán en la BD.')) return;

    setActionLoading(true);
    try {
      await deleteCategory(categoryId);
      const cats = await fetchCategories();
      setCategories(cats);
      showMessage('success', 'Categoría eliminada');
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      showMessage('error', 'Error al eliminar categoría');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleAddInfiniteCoins() {
    if (!confirm('¿Estas seguro de agregar monedas infinitas? Esta accion es permanente.')) return;

    setActionLoading(true);
    try {
      await addInfiniteCoins(currentUser.uid);
      showMessage('success', 'Monedas infinitas agregadas. Ahora tienes 9999 de cada ingrediente.');
    } catch (error) {
      console.error('Error al agregar monedas:', error);
      showMessage('error', 'Error al agregar monedas');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCreateCurrency(e) {
    e.preventDefault();
    if (!newCurrency.name.trim()) {
      showMessage('error', 'El nombre de la moneda es requerido');
      return;
    }

    setActionLoading(true);
    try {
      await createCurrency(newCurrency.name, newCurrency.description, newCurrency.icon, newCurrency.defaultAmount);
      setNewCurrency({ name: '', description: '', icon: 'monetization_on', defaultAmount: 0 });
      const curr = await fetchCurrencies();
      setCurrencies(curr);
      showMessage('success', 'Moneda creada exitosamente');
    } catch (error) {
      console.error('Error al crear moneda:', error);
      showMessage('error', 'Error al crear moneda');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleEditCurrency(currency) {
    setEditingCurrency({ ...currency });
  }

  async function handleUpdateCurrency(e) {
    e.preventDefault();
    if (!editingCurrency.name.trim()) {
      showMessage('error', 'El nombre de la moneda es requerido');
      return;
    }

    setActionLoading(true);
    try {
      await updateCurrency(editingCurrency.id, {
        name: editingCurrency.name,
        description: editingCurrency.description,
        icon: editingCurrency.icon,
        defaultAmount: editingCurrency.defaultAmount
      });
      setEditingCurrency(null);
      const curr = await fetchCurrencies();
      setCurrencies(curr);
      showMessage('success', 'Moneda actualizada exitosamente');
    } catch (error) {
      console.error('Error al actualizar moneda:', error);
      showMessage('error', 'Error al actualizar moneda');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCancelEdit() {
    setEditingCurrency(null);
  }

  async function handleDeleteCurrency(currencyId) {
    if (!confirm('¿Estás seguro de eliminar esta moneda?')) return;

    setActionLoading(true);
    try {
      await deleteCurrency(currencyId);
      const curr = await fetchCurrencies();
      setCurrencies(curr);
      showMessage('success', 'Moneda eliminada');
    } catch (error) {
      console.error('Error al eliminar moneda:', error);
      showMessage('error', 'Error al eliminar moneda');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleToggleCurrencyActive(currencyId, currentActive) {
    setActionLoading(true);
    try {
      await toggleCurrencyActive(currencyId, !currentActive);
      const curr = await fetchCurrencies();
      setCurrencies(curr);
      showMessage('success', currentActive ? 'Moneda desactivada' : 'Moneda activada');
    } catch (error) {
      console.error('Error al cambiar estado de moneda:', error);
      showMessage('error', 'Error al cambiar estado de moneda');
    } finally {
      setActionLoading(false);
    }
  }

  // Si no es admin, mostrar mensaje de acceso denegado
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card text-center max-w-md">
          <h1 className="text-3xl font-bold text-red-600 mb-4"><MaterialIcon name="block" className="text-5xl" /></h1>
          <p className="text-gray-600 mb-6">
            No tienes permisos de administrador para acceder a esta página.
          </p>
          <Link to="/dashboard" className="btn-primary">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-primary-600"><MaterialIcon name="flag" className="text-red-500" /> NicaQuizz</h1>
            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold">
              Panel de Administrador
            </span>
          </div>
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Salir
          </button>
        </div>
      </header>

      {/* Contenido */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {message.text && (
          <div className={`p-4 rounded-lg mb-6 ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'questions'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <MaterialIcon name="fact_check" className="inline-block align-middle mr-1" /> Preguntas Pendientes ({pendingQuestions.length})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'categories'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <MaterialIcon name="folder" className="inline-block align-middle mr-1" /> Categorías
          </button>
          <button
            onClick={() => setActiveTab('currencies')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'currencies'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <MaterialIcon name="payments" className="inline-block align-middle mr-1" /> Monedas
          </button>
          <button
            onClick={() => setActiveTab('coins')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'coins'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <MaterialIcon name="grain" className="inline-block align-middle mr-1" /> Monedas Infinitas
          </button>
        </div>

        {/* Tab: Preguntas Pendientes */}
        {activeTab === 'questions' && (
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Preguntas Pendientes de Aprobacion
            </h2>

            {loading ? (
              <div className="text-center py-8 text-gray-500 animate-pulse">
                Cargando preguntas...
              </div>
            ) : pendingQuestions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MaterialIcon name="check_circle" className="inline-block align-middle text-green-500 mr-1" /> No hay preguntas pendientes de aprobacion
              </div>
            ) : (
              <div className="space-y-4">
                {pendingQuestions.map(question => (
                  <div
                    key={question.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {question.text}
                      </h3>
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                        ID: {question.id.slice(-6)}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">
                      <strong>Respuesta:</strong> {question.correctAnswer}
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      <strong>Categoría:</strong> {question.categoryId} • 
                      <strong> Por:</strong> {question.createdBy}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(question.id)}
                        disabled={actionLoading}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <MaterialIcon name="check" className="inline-block align-middle mr-1" /> Aprobar
                      </button>
                      <button
                        onClick={() => handleReject(question.id)}
                        disabled={actionLoading}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <MaterialIcon name="close" className="inline-block align-middle mr-1" /> Rechazar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Categorías */}
        {activeTab === 'categories' && (
          <div className="grid gap-6">
            {/* Formulario para crear categoría */}
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Crear Nueva Categoría
              </h2>
              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la categoría *
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                    className="input-field"
                    placeholder="Ej: Historia de Nicaragua"
                    disabled={actionLoading}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    id="description"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                    className="input-field min-h-[80px]"
                    placeholder="Descripción opcional de la categoría..."
                    disabled={actionLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ingrediente asociado *
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {INGREDIENTES.map(ing => (
                      <button
                        key={ing.value}
                        type="button"
                        onClick={() => setNewCategory(prev => ({ ...prev, ingrediente: ing.value }))}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          newCategory.ingrediente === ing.value
                            ? 'border-primary-600 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <MaterialIcon name={ing.icon} className={`block mx-auto text-2xl ${
                          newCategory.ingrediente === ing.value ? 'text-primary-600' : 'text-gray-400'
                        }`} />
                        <p className="text-xs text-center mt-1">{ing.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Icono de la categoría *
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {CATEGORY_ICONS.map(icon => (
                      <button
                        key={icon.name}
                        type="button"
                        onClick={() => setNewCategory(prev => ({ ...prev, icon: icon.name }))}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          newCategory.icon === icon.name
                            ? 'border-primary-600 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <MaterialIcon name={icon.name} className={`block mx-auto text-2xl ${
                          newCategory.icon === icon.name ? 'text-primary-600' : 'text-gray-400'
                        }`} />
                        <p className="text-xs text-center mt-1">{icon.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-primary"
                >
                  {actionLoading ? 'Creando...' : 'Crear Categoría'}
                </button>
              </form>
            </div>

            {/* Lista de categorías existentes */}
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Categorías Existentes ({categories.length})
              </h2>
              {categories.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No hay categorías creadas aún
                </p>
              ) : (
                <div className="space-y-2">
                  {categories.map(cat => (
                    <div
                      key={cat.id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <MaterialIcon name={cat.icon || 'folder'} className="text-2xl text-gray-600" />
                        <div>
                          <h3 className="font-semibold text-gray-800">{cat.name}</h3>
                          <p className="text-sm text-gray-500">{cat.description}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        disabled={actionLoading}
                        className="text-red-500 hover:text-red-700 p-2"
                        title="Eliminar categoría"
                      >
                        <MaterialIcon name="delete" className="text-xl" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Gestión de Monedas */}
        {activeTab === 'currencies' && (
          <div className="grid gap-6">
            {/* Formulario para crear/editar moneda */}
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {editingCurrency ? 'Editar Moneda' : 'Crear Nueva Moneda'}
              </h2>
              <form onSubmit={editingCurrency ? handleUpdateCurrency : handleCreateCurrency} className="space-y-4">
                <div>
                  <label htmlFor="currencyName" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la moneda *
                  </label>
                  <input
                    id="currencyName"
                    type="text"
                    value={editingCurrency ? editingCurrency.name : newCurrency.name}
                    onChange={(e) => editingCurrency 
                      ? setEditingCurrency(prev => ({ ...prev, name: e.target.value }))
                      : setNewCurrency(prev => ({ ...prev, name: e.target.value }))
                    }
                    className="input-field"
                    placeholder="Ej: Token Dorado"
                    disabled={actionLoading}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="currencyDesc" className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    id="currencyDesc"
                    value={editingCurrency ? editingCurrency.description : newCurrency.description}
                    onChange={(e) => editingCurrency
                      ? setEditingCurrency(prev => ({ ...prev, description: e.target.value }))
                      : setNewCurrency(prev => ({ ...prev, description: e.target.value }))
                    }
                    className="input-field min-h-[80px]"
                    placeholder="Descripción opcional de la moneda..."
                    disabled={actionLoading}
                  />
                </div>
                <div>
                  <label htmlFor="currencyAmount" className="block text-sm font-medium text-gray-700 mb-1">
                    Cantidad por defecto
                  </label>
                  <input
                    id="currencyAmount"
                    type="number"
                    value={editingCurrency ? editingCurrency.defaultAmount : newCurrency.defaultAmount}
                    onChange={(e) => editingCurrency
                      ? setEditingCurrency(prev => ({ ...prev, defaultAmount: parseInt(e.target.value) || 0 }))
                      : setNewCurrency(prev => ({ ...prev, defaultAmount: parseInt(e.target.value) || 0 }))
                    }
                    className="input-field"
                    placeholder="0"
                    disabled={actionLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Icono de la moneda *
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {[
                      { name: 'payments', label: 'Moneda' },
                      { name: 'account_balance_wallet', label: 'Billetera' },
                      { name: 'attach_money', label: 'Dinero' },
                      { name: 'monetization_on', label: 'Monetización' },
                      { name: 'paid', label: 'Pagado' },
                      { name: 'price_check', label: 'Precio' },
                      { name: 'shopping_bag', label: 'Bolsa' },
                      { name: 'card_giftcard', label: 'Regalo' },
                      { name: 'diamond', label: 'Diamante' },
                      { name: 'star', label: 'Estrella' },
                      { name: 'emoji_events', label: 'Trofeo' },
                      { name: 'local_fire_department', label: 'Fuego' }
                    ].map(icon => (
                      <button
                        key={icon.name}
                        type="button"
                        onClick={() => editingCurrency
                          ? setEditingCurrency(prev => ({ ...prev, icon: icon.name }))
                          : setNewCurrency(prev => ({ ...prev, icon: icon.name }))
                        }
                        className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center ${
                          (editingCurrency ? editingCurrency.icon : newCurrency.icon) === icon.name
                            ? 'border-primary-600 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <MaterialIcon name={icon.name} className={`text-2xl ${
                          (editingCurrency ? editingCurrency.icon : newCurrency.icon) === icon.name
                            ? 'text-primary-600'
                            : 'text-gray-400'
                        }`} />
                        <p className="text-xs text-center mt-1">{icon.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="btn-primary"
                  >
                    {actionLoading ? 'Guardando...' : (editingCurrency ? 'Actualizar' : 'Crear Moneda')}
                  </button>
                  {editingCurrency && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={actionLoading}
                      className="px-6 py-3 rounded-lg font-semibold border-2 border-gray-300 hover:bg-gray-100 transition-colors"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Lista de monedas existentes */}
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Monedas Existentes ({currencies.length})
              </h2>
              {currencies.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No hay monedas creadas aún
                </p>
              ) : (
                <div className="space-y-2">
                  {currencies.map(currency => (
                    <div
                      key={currency.id}
                      className={`flex justify-between items-center p-3 rounded-lg border-2 ${
                        currency.active ? 'bg-gray-50 border-gray-200' : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <MaterialIcon name={currency.icon || 'payments'} className={`text-3xl ${
                          currency.active ? 'text-gray-600' : 'text-red-400'
                        }`} />
                        <div>
                          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                            {currency.name}
                            {!currency.active && (
                              <span className="bg-red-200 text-red-700 px-2 py-0.5 rounded text-xs">Inactiva</span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-500">{currency.description || 'Sin descripción'}</p>
                          <p className="text-xs text-gray-400">
                            Cantidad por defecto: <strong>{currency.defaultAmount || 0}</strong>
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleCurrencyActive(currency.id, currency.active)}
                          disabled={actionLoading}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            currency.active
                              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                          title={currency.active ? 'Desactivar' : 'Activar'}
                        >
                          <MaterialIcon name={currency.active ? 'toggle_off' : 'toggle_on'} className="text-lg align-middle" />
                        </button>
                        <button
                          onClick={() => handleEditCurrency(currency)}
                          disabled={actionLoading}
                          className="text-blue-500 hover:text-blue-700 p-2"
                          title="Editar moneda"
                        >
                          <MaterialIcon name="edit" className="text-xl" />
                        </button>
                        <button
                          onClick={() => handleDeleteCurrency(currency.id)}
                          disabled={actionLoading}
                          className="text-red-500 hover:text-red-700 p-2"
                          title="Eliminar moneda"
                        >
                          <MaterialIcon name="delete" className="text-xl" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Monedas Infinitas */}
        {activeTab === 'coins' && (
          <div className="card max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              <MaterialIcon name="grain" className="inline-block align-middle mr-2" />
              Monedas Infinitas para Administrador
            </h2>
            <div className="bg-primary-50 border-l-4 border-primary-600 p-4 mb-6">
              <p className="text-primary-700">
                <strong>Nota:</strong> Esta función solo está disponible para usuarios administradores.
                Al hacer clic en el botón, recibirás 9999 de cada ingrediente del nacatamal.
              </p>
            </div>
            <div className="grid grid-cols-5 gap-4 mb-6">
              {INGREDIENTES.map(ing => (
                <div key={ing.value} className="text-center p-4 bg-gray-50 rounded-lg">
                  <MaterialIcon name={ing.icon} className="text-4xl text-gray-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700">{ing.label}</p>
                  <p className="text-2xl font-bold text-primary-600">9999</p>
                </div>
              ))}
            </div>
            <button
              onClick={handleAddInfiniteCoins}
              disabled={actionLoading}
              className="btn-primary w-full"
            >
              {actionLoading ? (
                'Agregando monedas...'
              ) : (
                <>
                  <MaterialIcon name="add_circle" className="inline-block align-middle mr-2" />
                  Agregar Monedas Infinitas
                </>
              )}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}



