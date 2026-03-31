import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  fetchCategoryById,
  fetchApprovedQuestions,
  submitAnswer,
  CATEGORIA_INGREDIENTE,
  addCoins,
  POWERUPS,
  usePowerUp
} from '../services/firestore';

// Iconos SVG personalizados para ingredientes del nacatamal
const IngredientIcon = ({ type, className = '' }) => {
  const icons = {
    masa: (
      <svg viewBox="0 0 64 64" className={className}>
        <circle cx="32" cy="32" r="28" fill="#F5E6D3" stroke="#D4A574" strokeWidth="3"/>
        <circle cx="24" cy="28" r="4" fill="#E8D5C4"/>
        <circle cx="40" cy="26" r="3" fill="#E8D5C4"/>
        <circle cx="32" cy="38" r="4" fill="#E8D5C4"/>
        <circle cx="20" cy="36" r="3" fill="#E8D5C4"/>
        <circle cx="44" cy="38" r="3" fill="#E8D5C4"/>
      </svg>
    ),
    cerdo: (
      <svg viewBox="0 0 64 64" className={className}>
        <ellipse cx="32" cy="36" rx="22" ry="18" fill="#FF8B9E" stroke="#E05570" strokeWidth="2"/>
        <ellipse cx="24" cy="28" rx="8" ry="10" fill="#FF9FAD" stroke="#E05570" strokeWidth="2"/>
        <ellipse cx="40" cy="28" rx="8" ry="10" fill="#FF9FAD" stroke="#E05570" strokeWidth="2"/>
        <ellipse cx="32" cy="32" rx="6" ry="4" fill="#FF6B8A"/>
        <circle cx="28" cy="31" r="2" fill="#4A2836"/>
        <circle cx="36" cy="31" r="2" fill="#4A2836"/>
      </svg>
    ),
    arroz: (
      <svg viewBox="0 0 64 64" className={className}>
        <ellipse cx="32" cy="36" rx="24" ry="16" fill="#FAFAFA" stroke="#E0E0E0" strokeWidth="2"/>
        <ellipse cx="24" cy="34" rx="6" ry="10" fill="#FFFFFF" stroke="#E8E8E8" strokeWidth="1" transform="rotate(-30 24 34)"/>
        <ellipse cx="32" cy="30" rx="6" ry="10" fill="#FFFFFF" stroke="#E8E8E8" strokeWidth="1" transform="rotate(-10 32 30)"/>
        <ellipse cx="40" cy="34" rx="6" ry="10" fill="#FFFFFF" stroke="#E8E8E8" strokeWidth="1" transform="rotate(15 40 34)"/>
        <ellipse cx="28" cy="40" rx="5" ry="9" fill="#F0F0F0" stroke="#E0E0E0" strokeWidth="1" transform="rotate(-20 28 40)"/>
        <ellipse cx="36" cy="42" rx="5" ry="9" fill="#F0F0F0" stroke="#E0E0E0" strokeWidth="1" transform="rotate(10 36 42)"/>
      </svg>
    ),
    papa: (
      <svg viewBox="0 0 64 64" className={className}>
        <ellipse cx="32" cy="36" rx="22" ry="18" fill="#C9A959" stroke="#9A7B4A" strokeWidth="2"/>
        <ellipse cx="24" cy="30" rx="6" ry="5" fill="#D4B86E"/>
        <ellipse cx="42" cy="34" rx="5" ry="4" fill="#D4B86E"/>
        <ellipse cx="30" cy="42" rx="5" ry="4" fill="#D4B86E"/>
        <circle cx="20" cy="38" r="2" fill="#8B6F47"/>
        <circle cx="38" cy="28" r="2" fill="#8B6F47"/>
        <circle cx="34" cy="46" r="2" fill="#8B6F47"/>
      </svg>
    ),
    chile: (
      <svg viewBox="0 0 64 64" className={className}>
        <path d="M32 16 Q36 12 40 16 L44 20 Q48 24 46 32 Q44 42 38 50 Q34 56 30 54 Q26 52 28 46 Q32 36 34 28 Q36 22 32 16Z" fill="#5A7D3A" stroke="#3D5A2A" strokeWidth="2"/>
        <path d="M32 16 Q30 12 28 14 L26 18 Q28 20 32 16Z" fill="#4A6A30"/>
        <ellipse cx="36" cy="30" rx="3" ry="6" fill="#6B9A4A" opacity="0.6"/>
        <ellipse cx="34" cy="40" rx="2" ry="5" fill="#6B9A4A" opacity="0.6"/>
      </svg>
    )
  };
  return icons[type] || null;
};

// Componente para iconos de Material Icons
const MaterialIcon = ({ name, className = '' }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

// Mapeo de power-ups a iconos
const POWERUP_ICONS = {
  [POWERUPS.PASS_QUESTION]: 'skip_next',
  [POWERUPS.DOUBLE_TIME]: 'timer',
  [POWERUPS.REDUCE_OPTIONS]: 'filter_list'
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
  const [powerUps, setPowerUps] = useState({});
  const [usingPowerUp, setUsingPowerUp] = useState(null);

  useEffect(() => {
    loadData();
  }, [categoryId]);

  useEffect(() => {
    // Cargar power-ups del usuario
    if (userData) {
      setPowerUps(userData.powerUps || {});
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
    setShowResult(true);
    setScore(prev => ({ ...prev, total: prev.total + 1 }));
    
    const currentQuestion = questions[currentQuestionIndex];
    try {
      await submitAnswer(currentUser.uid, currentQuestion.id, categoryId, false);
      await updateUserStats(currentQuestion.id, categoryId, false);
    } catch (error) {
      console.error('Error al guardar respuesta:', error);
    }
    
    setAnswering(false);
  }

  async function handleAnswer() {
    if (!selectedAnswer || answering) return;

    setAnswering(true);
    const currentQuestion = questions[currentQuestionIndex];
    const correct = selectedAnswer === currentQuestion.correctAnswer;

    setIsCorrect(correct);
    setShowResult(true);
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
  }

  function nextQuestion() {
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
    // Si completó todas las preguntas, dar moneda
    if (score.correct > 0) {
      try {
        await addCoins(currentUser.uid, categoryId, false);
      } catch (error) {
        console.error('Error al dar moneda:', error);
      }
    }
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

  // Power-up: Pasar pregunta
  async function handlePassQuestion() {
    if (powerUps?.[POWERUPS.PASS_QUESTION] <= 0 || usingPowerUp) return;
    
    setUsingPowerUp(POWERUPS.PASS_QUESTION);
    try {
      await usePowerUp(currentUser.uid, POWERUPS.PASS_QUESTION);
      setPowerUps(prev => ({ ...prev, [POWERUPS.PASS_QUESTION]: prev[POWERUPS.PASS_QUESTION] - 1 }));
      
      // Marcar como incorrecta pero pasar a la siguiente
      setScore(prev => ({ ...prev, total: prev.total + 1 }));
      nextQuestion();
    } catch (error) {
      console.error('Error al usar power-up:', error);
    }
    setUsingPowerUp(null);
  }

  // Power-up: Duplicar tiempo
  async function handleDoubleTime() {
    if (powerUps?.[POWERUPS.DOUBLE_TIME] <= 0 || usingPowerUp) return;
    
    setUsingPowerUp(POWERUPS.DOUBLE_TIME);
    try {
      await usePowerUp(currentUser.uid, POWERUPS.DOUBLE_TIME);
      setPowerUps(prev => ({ ...prev, [POWERUPS.DOUBLE_TIME]: prev[POWERUPS.DOUBLE_TIME] - 1 }));
      setTimeLeft(prev => Math.min(prev * 2, 60)); // Máximo 60 segundos
    } catch (error) {
      console.error('Error al usar power-up:', error);
    }
    setUsingPowerUp(null);
  }

  // Power-up: Reducir opciones
  async function handleReduceOptions() {
    if (powerUps?.[POWERUPS.REDUCE_OPTIONS] <= 0 || usingPowerUp) return;
    
    setUsingPowerUp(POWERUPS.REDUCE_OPTIONS);
    try {
      await usePowerUp(currentUser.uid, POWERUPS.REDUCE_OPTIONS);
      setPowerUps(prev => ({ ...prev, [POWERUPS.REDUCE_OPTIONS]: prev[POWERUPS.REDUCE_OPTIONS] - 1 }));
      
      const currentQuestion = questions[currentQuestionIndex];
      // Eliminar 2 opciones incorrectas
      const correctOption = currentQuestion.correctAnswer;
      const wrongOptions = currentQuestion.options.filter(o => o !== correctOption);
      const remainingWrong = wrongOptions.sort(() => Math.random() - 0.5).slice(0, 1);
      const newOptions = [correctOption, ...remainingWrong].sort(() => Math.random() - 0.5);
      
      setOptions(newOptions);
    } catch (error) {
      console.error('Error al usar power-up:', error);
    }
    setUsingPowerUp(null);
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
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Link to="/categories" className="text-gray-300 hover:text-indigo-400 transition-colors">
            ← Volver
          </Link>
          <div className="text-gray-300 font-semibold">
            Pregunta {currentQuestionIndex + 1} de {questions.length}
          </div>
          <div className="flex items-center gap-4">
            <div className={`text-gray-300 font-semibold ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : ''}`}>
              <MaterialIcon name="timer" className="inline-block w-5 h-5 align-middle" /> {timeLeft}s
            </div>
            <div className="text-gray-300 font-semibold">
              Aciertos: {score.correct}
            </div>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="bg-gray-800 rounded-full h-2 mb-6">
          <div
            className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Power-ups */}
        <div className="flex gap-2 mb-4 justify-center">
          <button
            onClick={handlePassQuestion}
            disabled={powerUps?.[POWERUPS.PASS_QUESTION] <= 0 || usingPowerUp}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all hover-lift ${
              powerUps?.[POWERUPS.PASS_QUESTION] > 0
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white shadow-lg shadow-yellow-500/30'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
            title="Pasar pregunta"
          >
            <MaterialIcon name={POWERUP_ICONS[POWERUPS.PASS_QUESTION]} className="inline-block w-4 h-4 align-middle mr-1" /> {powerUps?.[POWERUPS.PASS_QUESTION] || 0}
          </button>
          <button
            onClick={handleDoubleTime}
            disabled={powerUps?.[POWERUPS.DOUBLE_TIME] <= 0 || usingPowerUp}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all hover-lift ${
              powerUps?.[POWERUPS.DOUBLE_TIME] > 0
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
            title="Duplicar tiempo"
          >
            <MaterialIcon name={POWERUP_ICONS[POWERUPS.DOUBLE_TIME]} className="inline-block w-4 h-4 align-middle mr-1" /> {powerUps?.[POWERUPS.DOUBLE_TIME] || 0}
          </button>
          <button
            onClick={handleReduceOptions}
            disabled={powerUps?.[POWERUPS.REDUCE_OPTIONS] <= 0 || usingPowerUp}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all hover-lift ${
              powerUps?.[POWERUPS.REDUCE_OPTIONS] > 0
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/30'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
            title="Reducir opciones"
          >
            <MaterialIcon name={POWERUP_ICONS[POWERUPS.REDUCE_OPTIONS]} className="inline-block w-4 h-4 align-middle mr-1" /> {powerUps?.[POWERUPS.REDUCE_OPTIONS] || 0}
          </button>
        </div>

        {/* Pregunta */}
        <div className="card">
          <h2 className="text-2xl font-bold text-white mb-6">
            {currentQuestion.text}
          </h2>

          <div className="space-y-3 mb-6">
            {currentQuestion.options?.map((option, index) => (
              <label
                key={index}
                className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  showResult
                    ? option === currentQuestion.correctAnswer
                      ? 'border-green-500 bg-green-900/30'
                      : option === selectedAnswer
                      ? 'border-red-500 bg-red-900/30'
                      : 'border-gray-700'
                    : selectedAnswer === option
                    ? 'border-indigo-500 bg-indigo-900/30'
                    : 'border-gray-700 hover:bg-gray-800'
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
                <span className="flex-1 text-gray-300">{option}</span>
              </label>
            ))}
          </div>

          {showResult && (
            <div className={`p-4 rounded-lg mb-4 ${
              isCorrect ? 'bg-green-900/50 text-green-300 border border-green-700' : 'bg-red-900/50 text-red-300 border border-red-700'
            }`}>
              <p className="font-bold">
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
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white flex-1 py-3 rounded-lg font-semibold transition-all hover-lift shadow-lg shadow-indigo-500/30"
              >
                {answering ? 'Enviando...' : 'Responder'}
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white flex-1 py-3 rounded-lg font-semibold transition-all hover-lift shadow-lg shadow-indigo-500/30"
              >
                {currentQuestionIndex < questions.length - 1 ? 'Siguiente' : 'Ver resultados'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


