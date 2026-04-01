import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  fetchCategoryById,
  fetchApprovedQuestions,
  submitAnswer,
  CATEGORIA_INGREDIENTE,
  addCoins,
  MEJORAS,
  useMejora
} from '../services/firestore';
import { FeedbackModal, ResultModal } from '../components/Modal';

// Iconos SVG para ingredientes
const IngredientIcon = ({ type, className = '' }) => {
  const icons = {
    masa: (
      <svg viewBox="0 0 64 64" className={className}>
        <ellipse cx="32" cy="32" rx="12" ry="20" fill="#F4C430" stroke="#D4A017" strokeWidth="2"/>
        <circle cx="28" cy="28" r="3" fill="#E8B830"/>
        <circle cx="36" cy="28" r="3" fill="#E8B830"/>
        <circle cx="28" cy="36" r="3" fill="#E8B830"/>
        <circle cx="36" cy="36" r="3" fill="#E8B830"/>
        <circle cx="32" cy="32" r="3" fill="#E8B830"/>
      </svg>
    ),
    cerdo: (
      <svg viewBox="0 0 64 64" className={className}>
        <rect x="16" y="20" width="32" height="24" rx="4" fill="#FF6B6B" stroke="#CC5555" strokeWidth="2"/>
        <rect x="20" y="24" width="10" height="8" rx="2" fill="#FF8888"/>
        <rect x="34" y="24" width="10" height="8" rx="2" fill="#FF8888"/>
      </svg>
    ),
    arroz: (
      <svg viewBox="0 0 64 64" className={className}>
        <ellipse cx="32" cy="40" rx="24" ry="12" fill="#F5F5F5" stroke="#DDD" strokeWidth="2"/>
        <ellipse cx="24" cy="38" rx="4" ry="8" fill="#FFF" transform="rotate(-30 24 38)"/>
        <ellipse cx="32" cy="36" rx="4" ry="8" fill="#FFF"/>
        <ellipse cx="40" cy="38" rx="4" ry="8" fill="#FFF" transform="rotate(30 40 38)"/>
      </svg>
    ),
    papa: (
      <svg viewBox="0 0 64 64" className={className}>
        <ellipse cx="32" cy="34" rx="20" ry="16" fill="#C9A959" stroke="#9A7B4A" strokeWidth="2"/>
        <circle cx="26" cy="30" r="3" fill="#8B6F47"/>
        <circle cx="38" cy="32" r="2" fill="#8B6F47"/>
        <circle cx="32" cy="40" r="2" fill="#8B6F47"/>
      </svg>
    ),
    chile: (
      <svg viewBox="0 0 64 64" className={className}>
        <path d="M32 12 Q36 8 40 12 L44 18 Q48 24 44 34 Q40 46 34 52 Q28 56 26 52 Q24 48 28 40 Q32 30 34 22 Q36 16 32 12Z" fill="#E74C3C" stroke="#C0392B" strokeWidth="2"/>
        <path d="M32 12 Q30 8 28 10 L26 14 Q28 16 32 12Z" fill="#27AE60"/>
      </svg>
    )
  };
  return icons[type] || null;
};

// Componente para iconos de Material Icons
const MaterialIcon = ({ name, className = '' }) => (
  <span className={`material-symbols-rounded ${className}`}>{name}</span>
);

// Mapeo de mejoras a iconos
const MEJORA_ICONS = {
  [MEJORAS.PASE]: 'skip_next',
  [MEJORAS.RELOJ_ARENA]: 'hourglass_top',
  [MEJORAS.COMODIN]: 'filter_list'
};

export default function Questions() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { currentUser, updateUserStats, userData } = useAuth();

  const [category, setCategory] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [options, setOptions] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [quizComplete, setQuizComplete] = useState(false);
  const [answering, setAnswering] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [mejoras, setMejoras] = useState({});
  const [mejoraUsada, setMejoraUsada] = useState(false); // Solo 1 mejora por partida
  
  // Estados para modales
  const [showFeedback, setShowFeedback] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    loadData();
  }, [categoryId]);

  useEffect(() => {
    // Cargar mejoras del usuario
    if (userData) {
      setMejoras(userData.mejoras || {});
    }
  }, [userData]);

  useEffect(() => {
    // Temporizador para la pregunta actual
    if (!showResult && !quizComplete && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      // Tiempo agotado
      handleTimeUp();
    }
  }, [timeLeft, showResult, quizComplete]);

  async function loadData() {
    try {
      const [categoryData, questionsData] = await Promise.all([
        fetchCategoryById(categoryId),
        fetchApprovedQuestions(categoryId, 'hard')
      ]);

      setCategory(categoryData);
      
      // Preparar preguntas con opciones
      const questionsWithOptions = questionsData.map(q => ({
        ...q,
        options: q.options?.length ? q.options : generateOptions(q.correctAnswer)
      }));
      
      setQuestions(questionsWithOptions.sort(() => Math.random() - 0.5));
      setTimeLeft(30);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  }

  function generateOptions(correctAnswer) {
    // Generar opciones aleatorias si no existen
    const wrongOptions = [
      'Opción incorrecta 1',
      'Respuesta equivocada',
      'No es esta',
      'Intenta de nuevo'
    ];
    const shuffled = [...wrongOptions, correctAnswer].sort(() => Math.random() - 0.5);
    return shuffled;
  }

  async function handleTimeUp() {
    setAnswering(true);
    setIsCorrect(false);
    setScore(prev => ({ ...prev, total: prev.total + 1 }));

    const currentQuestion = questions[currentQuestionIndex];
    try {
      await submitAnswer(currentUser.uid, currentQuestion.id, categoryId, false);
      await updateUserStats(currentQuestion.id, categoryId, false);
    } catch (error) {
      console.error('Error al guardar respuesta:', error);
    }

    setAnswering(false);
    setShowFeedback(true); // Mostrar modal de feedback
  }

  async function handleAnswer() {
    if (!selectedAnswer || answering) return;

    setAnswering(true);
    const currentQuestion = questions[currentQuestionIndex];
    const correct = selectedAnswer === currentQuestion.correctAnswer;

    setIsCorrect(correct);
    setScore(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1
    }));

    // Registrar respuesta en Firestore
    try {
      await submitAnswer(currentUser.uid, currentQuestion.id, categoryId, correct);
      await updateUserStats(currentQuestion.id, categoryId, correct);
    } catch (error) {
      console.error('Error al guardar respuesta:', error);
    }

    setAnswering(false);
    setShowFeedback(true); // Mostrar modal de feedback
  }

  function nextQuestion() {
    setShowFeedback(false); // Cerrar modal de feedback
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer('');
      setShowResult(false);
      setTimeLeft(30);
    } else {
      setQuizComplete(true);
      handleQuizComplete();
    }
  }

  async function handleQuizComplete() {
    const ingrediente = CATEGORIA_INGREDIENTE[categoryId];
    let monedasGanadas = 0;
    
    // Si completó todas las preguntas con al menos 1 acierto, dar moneda
    if (score.correct > 0) {
      try {
        await addCoins(currentUser.uid, categoryId, false);
        monedasGanadas = 1;
      } catch (error) {
        console.error('Error al dar moneda:', error);
      }
    }
    
    // Calcular nacatamales
    const monedas = userData?.coins || {};
    const nacatamales = Math.min(
      monedas.masa || 0,
      monedas.cerdo || 0,
      monedas.arroz || 0,
      monedas.papa || 0,
      monedas.chile || 0
    );
    
    // Mostrar modal de resultados
    setShowResults(true);
  }

  function restartQuiz() {
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setShowResult(false);
    setScore({ correct: 0, total: 0 });
    setQuizComplete(false);
    setTimeLeft(30);
    setQuestions(prev => prev.sort(() => Math.random() - 0.5));
  }

  // Mejora: Pasar pregunta
  async function handlePassQuestion() {
    if (mejoraUsada || mejoras?.[MEJORAS.PASE] <= 0) return;

    setMejoraUsada(true);
    try {
      await useMejora(currentUser.uid, MEJORAS.PASE);
      setMejoras(prev => ({ ...prev, [MEJORAS.PASE]: prev[MEJORAS.PASE] - 1 }));

      // Marcar como incorrecta pero pasar a la siguiente
      setScore(prev => ({ ...prev, total: prev.total + 1 }));
      nextQuestion();
    } catch (error) {
      console.error('Error al usar mejora:', error);
    }
  }

  // Mejora: Duplicar tiempo
  async function handleDoubleTime() {
    if (mejoraUsada || mejoras?.[MEJORAS.RELOJ_ARENA] <= 0) return;

    setMejoraUsada(true);
    try {
      await useMejora(currentUser.uid, MEJORAS.RELOJ_ARENA);
      setMejoras(prev => ({ ...prev, [MEJORAS.RELOJ_ARENA]: prev[MEJORAS.RELOJ_ARENA] - 1 }));
      setTimeLeft(prev => Math.min(prev * 2, 60)); // Máximo 60 segundos
    } catch (error) {
      console.error('Error al usar mejora:', error);
    }
  }

  // Mejora: Reducir opciones
  async function handleReduceOptions() {
    if (mejoraUsada || mejoras?.[MEJORAS.COMODIN] <= 0) return;

    setMejoraUsada(true);
    try {
      await useMejora(currentUser.uid, MEJORAS.COMODIN);
      setMejoras(prev => ({ ...prev, [MEJORAS.COMODIN]: prev[MEJORAS.COMODIN] - 1 }));

      const currentQuestion = questions[currentQuestionIndex];
      // Eliminar 2 opciones incorrectas
      const correctOption = currentQuestion.correctAnswer;
      const wrongOptions = currentQuestion.options.filter(o => o !== correctOption);
      const remainingWrong = wrongOptions.sort(() => Math.random() - 0.5).slice(0, 1);
      const newOptions = [correctOption, ...remainingWrong].sort(() => Math.random() - 0.5);

      setOptions(newOptions);
    } catch (error) {
      console.error('Error al usar mejora:', error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Cargando preguntas...</div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card text-center">
          <p className="text-gray-400 mb-4">Categoría no encontrada</p>
          <Link to="/categories" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-all hover-lift shadow-lg shadow-indigo-500/30">
            Volver a categorías
          </Link>
        </div>
      </div>
    );
  }

  if (quizComplete) {
    const percentage = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
    const ingrediente = CATEGORIA_INGREDIENTE[categoryId];

    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card max-w-md w-full text-center animate-fade-in">
          <h2 className="text-3xl font-bold mb-4 text-white">
            {percentage >= 70 ? (
              <><MaterialIcon name="emoji_events" className="inline-block w-8 h-8 align-middle mr-1" /> ¡Excelente!</>
            ) : percentage >= 40 ? (
              <><MaterialIcon name="thumb_up" className="inline-block w-8 h-8 align-middle mr-1" /> ¡Bien hecho!</>
            ) : (
              <><MaterialIcon name="self_improvement" className="inline-block w-8 h-8 align-middle mr-1" /> ¡Sigue practicando!</>
            )}
          </h2>
          <div className="text-6xl font-bold gradient-text mb-4">
            {score.correct}/{score.total}
          </div>
          <p className="text-xl text-gray-300 mb-6">
            Precisión: {percentage}%
          </p>

          {percentage >= 50 && ingrediente && (
            <div className="bg-green-900/50 border border-green-700 text-green-300 p-4 rounded-lg mb-6 text-center">
              <p className="font-bold text-lg mb-3">¡Ganaste un ingrediente!</p>
              <div className="w-24 h-24 mx-auto my-4">
                <IngredientIcon type={ingrediente} className="w-full h-full" />
              </div>
              <p className="text-sm font-semibold capitalize">{ingrediente.toUpperCase()}</p>
            </div>
          )}

          <div className="bg-gray-800 rounded-full h-4 mb-6">
            <div
              className={`h-4 rounded-full transition-all ${
                percentage >= 70 ? 'bg-green-500' :
                percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex gap-4 justify-center flex-wrap">
            <button onClick={restartQuiz} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-all hover-lift shadow-lg shadow-indigo-500/30">
              Intentar de nuevo
            </button>
            <Link to="/categories" className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-6 py-2 rounded-lg font-semibold transition-all hover-lift">
              Otra categoría
            </Link>
            <Link to="/dashboard" className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-6 py-2 rounded-lg font-semibold transition-all hover-lift">
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card text-center">
          <p className="text-gray-400 mb-4">No hay preguntas en esta categoría</p>
          <Link to="/categories" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-all hover-lift shadow-lg shadow-indigo-500/30">
            Volver a categorías
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-nica-verde/20 via-gray-900 to-nica-verde/20">
      <div className="max-w-3xl mx-auto">
        {/* Header con Timer Circular y Barra de Progreso Hoja */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <Link 
              to="/categories" 
              className="text-gray-300 hover:text-nica-amarillo transition-colors flex items-center gap-2"
            >
              <MaterialIcon name="arrow_back" className="w-5 h-5" /> Volver
            </Link>
            <div className="text-gray-300 font-medium">
              Pregunta {currentQuestionIndex + 1} de {questions.length}
            </div>
          </div>

          {/* Barra de progreso hoja de plátano */}
          <div className="progress-banana mb-6" style={{ '--progress': `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}></div>

          {/* Timer Circular Central */}
          <div className="flex justify-center mb-6">
            <div 
              className="timer-circle"
              style={{ 
                '--time': `${(timeLeft / 30) * 360}deg`,
                borderColor: timeLeft <= 10 ? '#C41E3A' : timeLeft <= 20 ? '#F4C430' : '#2D5A27'
              }}
            >
              <span className={timeLeft <= 10 ? 'text-nica-rojo animate-pulse' : ''}>
                {timeLeft}
              </span>
            </div>
          </div>

          {/* Contador de aciertos */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-gray-800/80 px-6 py-2 rounded-xl border border-gray-700">
              <MaterialIcon name="check_circle" className="w-5 h-5 text-green-400" />
              <span className="text-gray-300">Aciertos:</span>
              <span className="text-2xl font-display text-nica-amarillo">{score.correct}</span>
            </div>
          </div>
        </div>

        {/* Mejoras (Controles Inferiores) */}
        <div className="flex gap-3 mb-6 justify-center">
          <button
            onClick={handlePassQuestion}
            disabled={mejoraUsada || mejoras?.[MEJORAS.PASE] <= 0}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all hover-lift shadow-comic ${
              !mejoraUsada && mejoras?.[MEJORAS.PASE] > 0
                ? 'bg-yellow-600 hover:bg-yellow-500 text-white shadow-yellow-500/30'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50'
            }`}
            title="Pasar pregunta"
          >
            <MaterialIcon name={MEJORA_ICONS[MEJORAS.PASE]} className="w-6 h-6" />
            <span>{mejoras?.[MEJORAS.PASE] || 0}</span>
          </button>
          <button
            onClick={handleDoubleTime}
            disabled={mejoraUsada || mejoras?.[MEJORAS.RELOJ_ARENA] <= 0}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all hover-lift shadow-comic ${
              !mejoraUsada && mejoras?.[MEJORAS.RELOJ_ARENA] > 0
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/30'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50'
            }`}
            title="Duplicar tiempo"
          >
            <MaterialIcon name={MEJORA_ICONS[MEJORAS.RELOJ_ARENA]} className="w-6 h-6" />
            <span>{mejoras?.[MEJORAS.RELOJ_ARENA] || 0}</span>
          </button>
          <button
            onClick={handleReduceOptions}
            disabled={mejoraUsada || mejoras?.[MEJORAS.COMODIN] <= 0}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all hover-lift shadow-comic ${
              !mejoraUsada && mejoras?.[MEJORAS.COMODIN] > 0
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-500/30'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50'
            }`}
            title="Reducir opciones"
          >
            <MaterialIcon name={MEJORA_ICONS[MEJORAS.COMODIN]} className="w-6 h-6" />
            <span>{mejoras?.[MEJORAS.COMODIN] || 0}</span>
          </button>
        </div>

        {mejoraUsada && (
          <p className="text-center text-gray-400 text-sm mb-4">
            <MaterialIcon name="info" className="w-4 h-4 inline-block align-middle mr-1" />
            Ya usaste una mejora en esta partida
          </p>
        )}

        {/* Pregunta (Elevated Card) */}
        <div className="card bg-gray-800/90 shadow-2xl mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 leading-relaxed">
            {currentQuestion.text}
          </h2>

          <div className="space-y-3 mb-6">
            {currentQuestion.options?.map((option, index) => (
              <label
                key={index}
                className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  showResult
                    ? option === currentQuestion.correctAnswer
                      ? 'border-green-500 bg-green-900/30'
                      : option === selectedAnswer
                      ? 'border-red-500 bg-red-900/30 animate-shake'
                      : 'border-gray-700'
                    : selectedAnswer === option
                    ? 'border-nica-amarillo bg-nica-amarillo/20'
                    : 'border-gray-700 hover:bg-gray-800 hover:border-nica-amarillo/50'
                }`}
              >
                <input
                  type="radio"
                  name="answer"
                  value={option}
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                  checked={selectedAnswer === option}
                  disabled={showResult || answering}
                  className="w-4 h-4"
                />
                <span className="flex-1 text-gray-300 text-lg">{option}</span>
              </label>
            ))}
          </div>

          {showResult && (
            <div className={`p-4 rounded-xl mb-4 ${
              isCorrect ? 'bg-green-900/50 text-green-300 border border-green-700' : 'bg-red-900/50 text-red-300 border border-red-700'
            }`}>
              <p className="font-bold text-lg">
                {isCorrect ? '✓ ¡Correcto!' : '✗ Incorrecto'}
              </p>
              {!isCorrect && (
                <p className="mt-1">
                  Respuesta correcta: <strong>{currentQuestion.correctAnswer}</strong>
                </p>
              )}
            </div>
          )}

          <div className="flex gap-4">
            {!showResult ? (
              <button
                onClick={handleAnswer}
                disabled={!selectedAnswer || answering}
                className="btn-primary flex-1"
              >
                {answering ? 'Enviando...' : 'Responder'}
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                className="btn-primary flex-1"
              >
                {currentQuestionIndex < questions.length - 1 ? 'Siguiente' : 'Ver resultados'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Feedback */}
      <FeedbackModal
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        isCorrect={isCorrect}
        ingrediente={CATEGORIA_INGREDIENTE[categoryId]}
      />

      {/* Modal de Resultados */}
      <ResultModal
        isOpen={showResults}
        onClose={() => {
          setShowResults(false);
          navigate('/categories');
        }}
        onRetry={restartQuiz}
        score={score.correct}
        total={score.total}
        ingrediente={CATEGORIA_INGREDIENTE[categoryId]}
        nacatamales={Math.min(
          userData?.coins?.masa || 0,
          userData?.coins?.cerdo || 0,
          userData?.coins?.arroz || 0,
          userData?.coins?.papa || 0,
          userData?.coins?.chile || 0
        )}
      />
    </div>
  );
}


