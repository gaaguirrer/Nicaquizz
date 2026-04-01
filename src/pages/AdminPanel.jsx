/**
 * AdminPanel.jsx - Panel de Administración de NicaQuizz
 * "Herramienta del Maestro Docente"
 * 
 * Funcionalidades:
 * - Gestión de preguntas pendientes (aprobar/rechazar)
 * - Creación y eliminación de categorías
 * - Administración de monedas especiales
 * - Monedas infinitas para testing
 */

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
import Button from '../components/Button';

// Iconos disponibles para categorías
const CATEGORY_ICONS = [
  { name: 'history_edu', label: 'Historia' },
  { name: 'calculate', label: 'Matemáticas' },
  { name: 'public', label: 'Geografía' },
  { name: 'science', label: 'Ciencias' },
  { name: 'menu_book', label: 'Libro' },
  { name: 'emoji_events', label: 'Trofeo' },
  { name: 'lightbulb', label: 'Idea' },
  { name: 'star', label: 'Estrella' },
  { name: 'art_track', label: 'Arte' },
  { name: 'music_note', label: 'Música' }
];

// Ingredientes disponibles
const INGREDIENTES = [
  { value: 'masa', label: 'Masa', icon: 'bakery_dining' },
  { value: 'cerdo', label: 'Cerdo', icon: 'lunch_dining' },
  { value: 'arroz', label: 'Arroz', icon: 'rice_bowl' },
  { value: 'papa', label: 'Papa', icon: 'egg' },
  { value: 'chile', label: 'Chile', icon: 'local_fire_department' }
];

export default function AdminPanel() {
  const { userData, currentUser, logout } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const [activeTab, setActiveTab] = useState('questions');
  const [pendingQuestions, setPendingQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState({ name: '', description: '', ingrediente: 'masa', icon: 'history_edu' });
  const [newCurrency, setNewCurrency] = useState({ name: '', description: '', icon: 'payments', defaultAmount: 0 });
  const [editingCurrency, setEditingCurrency] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!userData?.isAdmin) return;
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
    if (!confirm('¿Estás seguro de agregar monedas infinitas? Esta acción es permanente.')) return;
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
      setNewCurrency({ name: '', description: '', icon: 'payments', defaultAmount: 0 });
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
        <div className="card text-center max-w-md border-red-700 bg-red-900/20">
          <span className="material-symbols-rounded text-6xl text-red-500 mb-4">block</span>
          <h1 className="text-2xl font-display text-white mb-4">Acceso Denegado</h1>
          <p className="text-gray-400 mb-6">
            No tienes permisos de administrador para acceder a esta página.
          </p>
          <Link to="/play" className="btn-primary inline-block">
            <span className="material-symbols-rounded inline-block align-middle mr-1">home</span>
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12 bg-gradient-to-br from-gray-900 via-nica-verde/10 to-gray-900">
      {/* Header */}
      <header className="bg-gray-900/90 backdrop-blur-md shadow-comic border-b border-nica-amarillo/30 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="text-4xl">🇳🇮</span>
              <div>
                <h1 className="text-3xl font-display text-nica-amarillo">NicaQuizz</h1>
                <p className="text-xs text-gray-400">Panel de Administrador</p>
              </div>
            </Link>
            <span className="bg-nica-rojo/30 text-nica-rojo px-4 py-1.5 rounded-xl text-sm font-bold border border-nica-rojo/50">
              <span className="material-symbols-rounded text-sm inline-block align-middle mr-1">admin_panel_settings</span>
              Admin
            </span>
          </div>
          <button
            onClick={logout}
            className="bg-nica-rojo/20 hover:bg-nica-rojo/30 text-nica-rojo border border-nica-rojo/50 px-4 py-2 rounded-xl transition-colors flex items-center gap-2 font-bold"
          >
            <span className="material-symbols-rounded">logout</span>
            Salir
          </button>
        </div>
      </header>

      {/* Contenido */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Mensajes */}
        {message.text && (
          <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-900/30 text-green-400 border border-green-700/50'
              : 'bg-red-900/30 text-red-400 border border-red-700/50'
          }`}>
            <span className="material-symbols-rounded text-2xl">
              {message.type === 'success' ? 'check_circle' : 'error'}
            </span>
            {message.text}
          </div>
        )}

        {/* Tabs de Navegación */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all hover-lift flex items-center gap-2 ${
              activeTab === 'questions'
                ? 'bg-gradient-to-r from-nica-verde to-nica-amarillo text-white shadow-comic'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <span className="material-symbols-rounded">fact_check</span>
            <span>Preguntas ({pendingQuestions.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all hover-lift flex items-center gap-2 ${
              activeTab === 'categories'
                ? 'bg-gradient-to-r from-nica-verde to-nica-amarillo text-white shadow-comic'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <span className="material-symbols-rounded">folder</span>
            <span>Categorías</span>
          </button>
          <button
            onClick={() => setActiveTab('currencies')}
            className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all hover-lift flex items-center gap-2 ${
              activeTab === 'currencies'
                ? 'bg-gradient-to-r from-nica-verde to-nica-amarillo text-white shadow-comic'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <span className="material-symbols-rounded">payments</span>
            <span>Monedas</span>
          </button>
          <button
            onClick={() => setActiveTab('coins')}
            className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all hover-lift flex items-center gap-2 ${
              activeTab === 'coins'
                ? 'bg-gradient-to-r from-nica-verde to-nica-amarillo text-white shadow-comic'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <span className="material-symbols-rounded">grain</span>
            <span>Monedas Infinitas</span>
          </button>
        </div>

        {/* Tab: Preguntas Pendientes */}
        {activeTab === 'questions' && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display text-white flex items-center gap-3">
                <span className="material-symbols-rounded text-nica-amarillo">fact_check</span>
                Preguntas Pendientes de Aprobación
              </h2>
              <span className="bg-nica-amarillo/20 text-nica-amarillo px-4 py-1.5 rounded-xl font-bold border border-nica-amarillo/50">
                {pendingQuestions.length} pendientes
              </span>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <span className="material-symbols-rounded text-6xl text-nica-amarillo animate-spin inline-block">progress_activity</span>
                <p className="text-gray-400 mt-4">Cargando preguntas...</p>
              </div>
            ) : pendingQuestions.length === 0 ? (
              <div className="text-center py-12">
                <span className="material-symbols-rounded text-6xl text-green-400 mb-4">check_circle</span>
                <p className="text-gray-400 text-lg">¡No hay preguntas pendientes!</p>
                <p className="text-gray-500 text-sm mt-2">Todas las preguntas han sido revisadas</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingQuestions.map(question => (
                  <div
                    key={question.id}
                    className="border border-gray-700 rounded-xl p-6 hover:border-nica-amarillo/50 hover:bg-gray-800/50 transition-all"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">
                          {question.text}
                        </h3>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-rounded text-sm">check</span>
                            <strong>Respuesta:</strong> {question.correctAnswer}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-rounded text-sm">folder</span>
                            <strong>Categoría:</strong> {question.categoryId}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-rounded text-sm">person</span>
                            <strong>Por:</strong> {question.createdBy?.slice(0, 8)}...
                          </span>
                        </div>
                      </div>
                      <span className="bg-gray-800 text-gray-500 px-3 py-1 rounded-lg text-xs font-mono">
                        {question.id.slice(-6)}
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleApprove(question.id)}
                        disabled={actionLoading}
                        variant="success"
                        icon="check"
                      >
                        Aprobar
                      </Button>
                      <Button
                        onClick={() => handleReject(question.id)}
                        disabled={actionLoading}
                        variant="danger"
                        icon="close"
                      >
                        Rechazar
                      </Button>
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
              <h2 className="text-2xl font-display text-white mb-6 flex items-center gap-3">
                <span className="material-symbols-rounded text-nica-amarillo">add_circle</span>
                Crear Nueva Categoría
              </h2>
              <form onSubmit={handleCreateCategory} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">
                    Nombre de la categoría *
                  </label>
                  <input
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
                  <label className="block text-sm font-bold text-gray-300 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={newCategory.description}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                    className="input-field min-h-[80px]"
                    placeholder="Descripción opcional de la categoría..."
                    disabled={actionLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-3">
                    Ingrediente asociado *
                  </label>
                  <div className="grid grid-cols-5 gap-3">
                    {INGREDIENTES.map(ing => (
                      <button
                        key={ing.value}
                        type="button"
                        onClick={() => setNewCategory(prev => ({ ...prev, ingrediente: ing.value }))}
                        className={`p-4 rounded-xl border-2 transition-all hover-lift ${
                          newCategory.ingrediente === ing.value
                            ? 'border-nica-amarillo bg-nica-amarillo/20'
                            : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                        }`}
                      >
                        <span className={`material-symbols-rounded text-3xl block mx-auto ${
                          newCategory.ingrediente === ing.value ? 'text-nica-amarillo' : 'text-gray-500'
                        }`}>
                          {ing.icon}
                        </span>
                        <p className={`text-xs text-center mt-2 font-bold ${
                          newCategory.ingrediente === ing.value ? 'text-nica-amarillo' : 'text-gray-500'
                        }`}>
                          {ing.label}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-3">
                    Icono de la categoría *
                  </label>
                  <div className="grid grid-cols-5 gap-3">
                    {CATEGORY_ICONS.map(icon => (
                      <button
                        key={icon.name}
                        type="button"
                        onClick={() => setNewCategory(prev => ({ ...prev, icon: icon.name }))}
                        className={`p-4 rounded-xl border-2 transition-all hover-lift ${
                          newCategory.icon === icon.name
                            ? 'border-nica-amarillo bg-nica-amarillo/20'
                            : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                        }`}
                      >
                        <span className={`material-symbols-rounded text-3xl block mx-auto ${
                          newCategory.icon === icon.name ? 'text-nica-amarillo' : 'text-gray-500'
                        }`}>
                          {icon.name}
                        </span>
                        <p className={`text-xs text-center mt-2 font-bold ${
                          newCategory.icon === icon.name ? 'text-nica-amarillo' : 'text-gray-500'
                        }`}>
                          {icon.label}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
                <Button type="submit" disabled={actionLoading} variant="primary" icon="add">
                  {actionLoading ? 'Creando...' : 'Crear Categoría'}
                </Button>
              </form>
            </div>

            {/* Lista de categorías existentes */}
            <div className="card">
              <h2 className="text-2xl font-display text-white mb-6 flex items-center gap-3">
                <span className="material-symbols-rounded text-nica-amarillo">folder</span>
                Categorías Existentes ({categories.length})
              </h2>
              {categories.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No hay categorías creadas aún
                </p>
              ) : (
                <div className="space-y-3">
                  {categories.map(cat => (
                    <div
                      key={cat.id}
                      className="flex justify-between items-center p-4 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-nica-amarillo/30 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <span className="material-symbols-rounded text-3xl text-nica-amarillo">
                          {cat.icon || 'folder'}
                        </span>
                        <div>
                          <h3 className="font-bold text-white">{cat.name}</h3>
                          <p className="text-sm text-gray-500">{cat.description || 'Sin descripción'}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        disabled={actionLoading}
                        className="text-red-400 hover:text-red-300 p-2 hover:bg-red-900/30 rounded-lg transition-all"
                        title="Eliminar categoría"
                      >
                        <span className="material-symbols-rounded text-xl">delete</span>
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
              <h2 className="text-2xl font-display text-white mb-6 flex items-center gap-3">
                <span className="material-symbols-rounded text-nica-amarillo">
                  {editingCurrency ? 'edit' : 'add_circle'}
                </span>
                {editingCurrency ? 'Editar Moneda' : 'Crear Nueva Moneda'}
              </h2>
              <form onSubmit={editingCurrency ? handleUpdateCurrency : handleCreateCurrency} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">
                    Nombre de la moneda *
                  </label>
                  <input
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
                  <label className="block text-sm font-bold text-gray-300 mb-2">
                    Descripción
                  </label>
                  <textarea
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
                  <label className="block text-sm font-bold text-gray-300 mb-2">
                    Cantidad por defecto
                  </label>
                  <input
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
                <div className="flex gap-3">
                  <Button type="submit" disabled={actionLoading} variant="primary" icon={editingCurrency ? 'edit' : 'add'}>
                    {actionLoading ? 'Guardando...' : editingCurrency ? 'Actualizar Moneda' : 'Crear Moneda'}
                  </Button>
                  {editingCurrency && (
                    <Button type="button" onClick={() => setEditingCurrency(null)} variant="secondary" icon="close">
                      Cancelar
                    </Button>
                  )}
                </div>
              </form>
            </div>

            {/* Lista de monedas existentes */}
            <div className="card">
              <h2 className="text-2xl font-display text-white mb-6 flex items-center gap-3">
                <span className="material-symbols-rounded text-nica-amarillo">payments</span>
                Monedas Existentes ({currencies.length})
              </h2>
              {currencies.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No hay monedas creadas aún
                </p>
              ) : (
                <div className="space-y-3">
                  {currencies.map(currency => (
                    <div
                      key={currency.id}
                      className="flex justify-between items-center p-4 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-nica-amarillo/30 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <span className="material-symbols-rounded text-3xl text-nica-amarillo">
                          {currency.icon || 'payments'}
                        </span>
                        <div>
                          <h3 className="font-bold text-white">{currency.name}</h3>
                          <p className="text-sm text-gray-500">{currency.description || 'Sin descripción'}</p>
                          <p className="text-xs text-gray-600">Por defecto: {currency.defaultAmount}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleCurrencyActive(currency.id, currency.active)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            currency.active
                              ? 'bg-green-900/30 text-green-400 border border-green-700/50'
                              : 'bg-gray-700 text-gray-500 border border-gray-600'
                          }`}
                        >
                          {currency.active ? 'Activa' : 'Inactiva'}
                        </button>
                        <button
                          onClick={() => handleEditCurrency(currency)}
                          className="text-blue-400 hover:text-blue-300 p-2 hover:bg-blue-900/30 rounded-lg transition-all"
                          title="Editar moneda"
                        >
                          <span className="material-symbols-rounded text-xl">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteCurrency(currency.id)}
                          className="text-red-400 hover:text-red-300 p-2 hover:bg-red-900/30 rounded-lg transition-all"
                          title="Eliminar moneda"
                        >
                          <span className="material-symbols-rounded text-xl">delete</span>
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
          <div className="card bg-gradient-to-br from-nica-amarillo/20 to-yellow-900/20 border-nica-amarillo/50">
            <div className="text-center mb-8">
              <span className="material-symbols-rounded text-7xl text-nica-amarillo mb-4">grain</span>
              <h2 className="text-3xl font-display text-white mb-3">Monedas Infinitas</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Esta sección es exclusiva para administradores. Al hacer clic en el botón, recibirás 9999 de cada ingrediente del nacatamal.
              </p>
            </div>

            <div className="grid grid-cols-5 gap-4 mb-8 max-w-3xl mx-auto">
              {INGREDIENTES.map(ing => (
                <div key={ing.value} className="text-center p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                  <span className="material-symbols-rounded text-4xl text-nica-amarillo block mb-2">
                    {ing.icon}
                  </span>
                  <p className="text-sm text-gray-400">{ing.label}</p>
                  <p className="text-2xl font-display text-nica-amarillo font-bold">9999</p>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Button
                onClick={handleAddInfiniteCoins}
                disabled={actionLoading}
                variant="primary"
                icon="grain"
                className="px-8 py-4 text-lg"
              >
                {actionLoading ? 'Agregando...' : 'Agregar Monedas Infinitas'}
              </Button>
              <p className="text-gray-500 text-sm mt-4">
                <span className="material-symbols-rounded text-sm inline-block align-middle mr-1">info</span>
                Esta acción es permanente y solo disponible para administradores
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
