import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchCategories, proposeQuestion } from '../services/firestore';

const MaterialIcon = ({ name, className = '' }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

export default function ProposeQuestion() {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    text: '',
    correctAnswer: '',
    categoryId: '',
    difficulty: 'hard',
    options: ['', '', '', '']
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const cats = await fetchCategories();
      setCategories(cats);
      if (cats.length > 0 && !formData.categoryId) {
        setFormData(prev => ({ ...prev, categoryId: cats[0].id }));
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  }

  function handleChange(e) {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  }

  function handleOptionChange(index, value) {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({ ...prev, options: newOptions }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!formData.text.trim()) {
      setError('La pregunta es requerida');
      return;
    }
    if (!formData.correctAnswer.trim()) {
      setError('La respuesta correcta es requerida');
      return;
    }
    if (!formData.categoryId) {
      setError('Debes seleccionar una categoría');
      return;
    }

    setLoading(true);

    try {
      // Filtrar opciones vacías
      const validOptions = formData.options.filter(opt => opt.trim() !== '');
      
      await proposeQuestion(
        formData.text,
        formData.correctAnswer,
        formData.categoryId,
        currentUser.uid,
        formData.difficulty,
        validOptions.length >= 2 ? validOptions : undefined
      );

      setSuccess(true);
      setFormData({ 
        text: '', 
        correctAnswer: '', 
        categoryId: categories[0]?.id || '',
        difficulty: 'hard',
        options: ['', '', '', '']
      });

      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error('Error al proponer pregunta:', error);
      setError('Ocurrió un error al enviar tu pregunta. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-md shadow-lg border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold gradient-text"><span className="text-3xl">��</span> NicaQuizz</h1>
            <nav className="hidden md:flex gap-4">
              <Link to="/dashboard" className="text-gray-400 hover:text-indigo-400 font-medium transition-colors">
                Inicio
              </Link>
              <Link to="/categories" className="text-gray-400 hover:text-indigo-400 font-medium transition-colors">
                Categorías
              </Link>
              <Link to="/ranking" className="text-gray-400 hover:text-indigo-400 font-medium transition-colors">
                Ranking
              </Link>
              <Link to="/propose" className="text-indigo-400 font-medium transition-colors">
                Proponer Pregunta
              </Link>
              {userData?.isAdmin && (
                <Link to="/admin" className="text-red-400 hover:text-red-300 font-medium transition-colors">
                  Panel Admin
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="card">
          <h1 className="text-3xl font-bold text-white mb-2 gradient-text">
            <MaterialIcon name="lightbulb" className="inline-block align-middle text-yellow-400 mr-2" /> Proponer una Pregunta
          </h1>
          <p className="text-gray-400 mb-6">
            Ayuda a crecer NicaQuizz enviando tus propias preguntas. Serán revisadas por un administrador antes de publicarse.
          </p>

          {success && (
            <div className="bg-green-900/50 text-green-300 border border-green-700 p-4 rounded-lg mb-6">
              <MaterialIcon name="check_circle" className="inline-block align-middle mr-1" /> ¡Pregunta enviada con éxito! Será revisada por un administrador.
            </div>
          )}

          {error && (
            <div className="bg-red-900/50 text-red-300 border border-red-700 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-gray-300 mb-1">
                Categoría *
              </label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="input-field"
                required
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-gray-300 mb-1">
                Dificultad
              </label>
              <select
                id="difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className="input-field"
              >
                <option value="easy" className="bg-gray-800">Fácil</option>
                <option value="medium" className="bg-gray-800">Media</option>
                <option value="hard" className="bg-gray-800">Difícil</option>
              </select>
            </div>

            <div>
              <label htmlFor="text" className="block text-sm font-medium text-gray-300 mb-1">
                Pregunta *
              </label>
              <textarea
                id="text"
                name="text"
                value={formData.text}
                onChange={handleChange}
                className="input-field min-h-[120px]"
                placeholder="Escribe tu pregunta aquí..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Opciones (mínimo 2, máximo 4)
              </label>
              <div className="space-y-2">
                {formData.options.map((option, index) => (
                  <input
                    key={index}
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="input-field"
                    placeholder={`Opción ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="correctAnswer" className="block text-sm font-medium text-gray-300 mb-1">
                Respuesta Correcta *
              </label>
              <input
                id="correctAnswer"
                name="correctAnswer"
                type="text"
                value={formData.correctAnswer}
                onChange={handleChange}
                className="input-field"
                placeholder="La respuesta correcta (debe coincidir exactamente con una de las opciones)"
                required
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white flex-1 py-3 rounded-lg font-semibold transition-all hover-lift shadow-lg shadow-indigo-500/30"
              >
                {loading ? 'Enviando...' : 'Enviar Pregunta'}
              </button>
              <Link
                to="/dashboard"
                className="bg-gray-700 hover:bg-gray-600 text-gray-300 py-3 px-6 rounded-lg font-semibold transition-all hover-lift"
              >
                Cancelar
              </Link>
            </div>
          </form>

          <div className="mt-6 p-4 bg-indigo-900/30 border border-indigo-700 rounded-lg">
            <h3 className="font-semibold text-indigo-300 mb-2">Consejos para una buena pregunta:</h3>
            <ul className="text-sm text-indigo-200 space-y-1">
              <li>• Sé claro y específico en la redacción</li>
              <li>• Asegúrate de que tenga una única respuesta correcta</li>
              <li>• Verifica que la información sea verídica</li>
              <li>• Evita preguntas demasiado obvias o ambiguas</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}



