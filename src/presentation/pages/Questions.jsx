/**
 * Questions.jsx - Interfaz de Juego de NicaQuizz
 * "La Arena del Conocimiento"
 * 
 * Características:
 * - Barra de progreso "Hoja de Plátano"
 * - Temporizador circular (30 segundos)
 * - Cuadro central de pregunta con sombra suave
 * - Botones de respuesta amplios con colores
 * - Controles inferiores de power-ups
 */

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
  fetchCategoryById,
  fetchRandomQuestions,
  submitAnswer,
  CATEGORIA_INGREDIENTE,
  addCoins,
  MEJORAS,
  useMejora,
  getChallenge,
  completeChallenge
} from '../../services/firestore';
import { FeedbackModal, ResultModal } from '../components/Modal';
import Button from '../components/Button';

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

// Mapeo de mejoras a iconos
const MEJORA_ICONS = {
  [MEJORAS.PASE]: 'skip_next',
  [MEJORAS.RELOJ_ARENA]: 'hourglass_top',
  [MEJORAS.COMODIN]: 'filter_list'
};

// Configuración de colores por estado de respuesta
const ANSWER_COLORS = {
  default: 'bg-gray-800/80 border-gray-700 hover:border-nica-amarillo/50 hover:bg-gray-800',
  selected: 'bg-nica-amarillo/20 border-nica-amarillo',
  correct: 'bg-green-900/50 border-green-500',
  incorrect: 'bg-red-900/50 border-red-500 animate-shake'
};

export default function Questions() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser, updateUserStats, userData } = useAuth();
  const toast = useToast();

  const challengeId = searchParams.get('challenge');

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
  const [mejoraUsada, setMejoraUsada] = useState(false);

  // Estados para modales
  const [showFeedback, setShowFeedback] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    loadData();
  }, [categoryId]);

  useEffect(() => {
    if (userData) {
      setMejoras(userData.mejoras || {});
    }
  }, [userData]);

  useEffect(() => {
    if (!showResult && !quizComplete && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      handleTimeUp();
    }
  }, [timeLeft, showResult, quizComplete]);

  async function loadData() {
    try {
      const [categoryData, questionsData] = await Promise.all([
        fetchCategoryById(categoryId),
        fetchRandomQuestions(categoryId, 10)
      ]);

      if (!categoryData) {
        toast.error('Categoría no encontrada');
        navigate('/play');
        return;
      }

      if (!questionsData || questionsData.length === 0) {
        toast.error('No hay preguntas disponibles para esta categoría');
        navigate('/play');
        return;
      }

      setCategory(categoryData);

      const questionsWithOptions = questionsData.map(q => ({
        ...q,
        options: q.options?.length ? q.options : generateOptions(q.correctAnswer)
      }));

      setQuestions(questionsWithOptions.sort(() => Math.random() - 0.5));
    } catch (error) {
      toast.handleError(error, 'Error al cargar preguntas');
    } finally {
      setLoading(false);
    }
  }

  function generateOptions(correctAnswer) {
    const wrongOptions = [
      'Ninguna de las anteriores',
      'Todas las anteriores',
      'No estoy seguro',
      'Otra respuesta'
    ].sort(() => Math.random() - 0.5).slice(0, 3);

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
      toast.handleError(error, 'Error al guardar respuesta');
    }

    setAnswering(false);
    setShowFeedback(true);
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

    try {
      await submitAnswer(currentUser.uid, currentQuestion.id, categoryId, correct);
      await updateUserStats(currentQuestion.id, categoryId, correct);
    } catch (error) {
      toast.handleError(error, 'Error al guardar respuesta');
    }

    setAnswering(false);
    setShowFeedback(true);
  }

  function nextQuestion() {
    setShowFeedback(false);
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

    if (score.correct > 0) {
      try {
        await addCoins(currentUser.uid, categoryId, false);
      } catch (error) {
        toast.handleError(error, 'Error al recompensar moneda');
      }
    }

    // Si hay un challenge ID, completar el reto
    if (challengeId) {
      try {
        const challengeData = await getChallenge(challengeId);
        if (challengeData && challengeData.status === 'accepted') {
          // Este jugador es el challenged, su score se registra
          // El challenger score se registra cuando él termine
          await completeChallenge(
            challengeId,
            null, // winnerId se determina cuando ambos terminan
            challengeData.challengerId === currentUser.uid ? score.correct : 0,
            challengeData.challengedId === currentUser.uid ? score.correct : 0
          );
        }

        // Navegar a la página del challenge para ver resultados
        navigate(`/challenge/${challengeId}`);
        return;
      } catch (error) {
        console.error('Error al completar reto:', error);
      }
    }

    const monedas = userData?.coins || {};
    const nacatamales = Math.min(
      monedas.masa || 0,
      monedas.cerdo || 0,
      monedas.arroz || 0,
      monedas.papa || 0,
      monedas.chile || 0
    );

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

  // Power-up: Pasar pregunta
  async function handlePassQuestion() {
    if (mejoraUsada || mejoras?.[MEJORAS.PASE] <= 0) return;

    setMejoraUsada(true);
    try {
      await useMejora(currentUser.uid, MEJORAS.PASE);
      setMejoras(prev => ({ ...prev, [MEJORAS.PASE]: prev[MEJORAS.PASE] - 1 }));
      setScore(prev => ({ ...prev, total: prev.total + 1 }));
      nextQuestion();
    } catch (error) {
      toast.handleError(error, 'Error al usar power-up');
    }
  }

  // Power-up: Duplicar tiempo
  async function handleDoubleTime() {
    if (mejoraUsada || mejoras?.[MEJORAS.RELOJ_ARENA] <= 0) return;

    setMejoraUsada(true);
    try {
      await useMejora(currentUser.uid, MEJORAS.RELOJ_ARENA);
      setMejoras(prev => ({ ...prev, [MEJORAS.RELOJ_ARENA]: prev[MEJORAS.RELOJ_ARENA] - 1 }));
      setTimeLeft(prev => Math.min(prev * 2, 60));
    } catch (error) {
      toast.handleError(error, 'Error al usar power-up');
    }
  }

  // Power-up: Reducir opciones
  async function handleReduceOptions() {
    if (mejoraUsada || mejoras?.[MEJORAS.COMODIN] <= 0) return;

    setMejoraUsada(true);
    try {
      await useMejora(currentUser.uid, MEJORAS.COMODIN);
      setMejoras(prev => ({ ...prev, [MEJORAS.COMODIN]: prev[MEJORAS.COMODIN] - 1 }));

      const currentQuestion = questions[currentQuestionIndex];
      const correctOption = currentQuestion.correctAnswer;
      const wrongOptions = currentQuestion.options.filter(o => o !== correctOption);
      const remainingWrong = wrongOptions.sort(() => Math.random() - 0.5).slice(0, 1);
      const newOptions = [correctOption, ...remainingWrong].sort(() => Math.random() - 0.5);

      setOptions(newOptions);
    } catch (error) {
      toast.handleError(error, 'Error al usar power-up');
    }
  }

  // Calcular progreso
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const ingrediente = CATEGORIA_INGREDIENTE[categoryId];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-rounded text-6xl text-nica-amarillo animate-spin inline-block">progress_activity</span>
          <p className="text-gray-400 mt-4">Cargando preguntas...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card text-center">
          <p className="text-gray-400 mb-4">Categoría no encontrada</p>
          <Link to="/categories" className="btn-primary">
            Volver a categorías
          </Link>
        </div>
      </div>
    );
  }

  if (quizComplete) {
    const percentage = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;

    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card max-w-md w-full text-center animate-fade-in">
          <h2 className="text-3xl font-display text-white mb-4">
            {percentage >= 70 ? (
              <span className="flex items-center justify-center gap-2">
                <span className="material-symbols-rounded text-5xl text-green-400">emoji_events</span>
                ¡Excelente!
              </span>
            ) : percentage >= 50 ? (
              <span className="flex items-center justify-center gap-2">
                <span className="material-symbols-rounded text-5xl text-yellow-400">thumb_up</span>
                ¡Bien hecho!
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span className="material-symbols-rounded text-5xl text-red-400">school</span>
                ¡Sigue Practicando!
              </span>
            )}
          </h2>

          <div className="bg-gray-800/50 rounded-2xl p-6 mb-6">
            <div className="text-5xl font-display text-nica-amarillo mb-2">
              {score.correct}/{score.total}
            </div>
            <div className="text-gray-400">{percentage}% de precisión</div>
            
            {/* Barra de progreso */}
            <div className="mt-4 bg-gray-700 rounded-full h-3 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${
                  percentage >= 70 ? 'bg-gradient-to-r from-green-500 to-green-400' :
                  percentage >= 50 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' :
                  'bg-gradient-to-r from-red-500 to-red-400'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {ingrediente && percentage > 0 && (
            <div className="bg-gradient-to-br from-nica-verde/20 to-nica-amarillo/20 rounded-2xl p-4 mb-6 border border-nica-amarillo/50">
              <p className="text-gray-300 mb-2">Ingrediente obtenido:</p>
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12">
                  <IngredientIcon type={ingrediente} className="w-full h-full animate-glow" />
                </div>
                <span className="text-xl font-display text-nica-amarillo capitalize">{ingrediente}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Button onClick={restartQuiz} variant="secondary" icon="refresh">
              Reintentar
            </Button>
            <Button onClick={() => navigate('/categories')} variant="primary" icon="home">
              Inicio
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-nica-verde/20 via-gray-900 to-nica-verde/20 py-6 px-4">
      {/* Header: Barra de Progreso Hoja de Plátano */}
      <div className="max-w-4xl mx-auto mb-6">
        {/* Información superior */}
        <div className="flex justify-between items-center mb-3 px-2">
          <div className="flex items-center gap-3">
            <Link to="/categories" className="text-gray-400 hover:text-nica-amarillo transition-colors flex items-center gap-1">
              <span className="material-symbols-rounded">arrow_back</span>
              <span className="hidden sm:inline">Volver</span>
            </Link>
          </div>
          <div className="text-gray-400 text-sm">
            Pregunta <span className="text-white font-bold">{currentQuestionIndex + 1}</span> de <span className="text-white font-bold">{questions.length}</span>
          </div>
          <div className="flex items-center gap-2">
            {ingrediente && (
              <div className="flex items-center gap-1 text-gray-400 text-sm">
                <div className="w-5 h-5">
                  <IngredientIcon type={ingrediente} className="w-full h-full" />
                </div>
                <span className="hidden sm:inline capitalize">{ingrediente}</span>
              </div>
            )}
          </div>
        </div>

        {/* Barra Hoja de Plátano */}
        <div className="relative h-8 bg-gray-800/80 rounded-full overflow-hidden shadow-inner border border-gray-700">
          {/* Progress fill con forma de hoja */}
          <div 
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-nica-verde to-nica-amarillo transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          >
            {/* Efecto de brillo */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
            {/* Borde derecho redondeado como hoja */}
            <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-nica-amarillo to-transparent"></div>
          </div>
          
          {/* Iconos de hojas en el track */}
          <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
            {Array.from({ length: Math.ceil(questions.length / 2) }).map((_, i) => (
              <span key={i} className="material-symbols-rounded text-white/30 text-sm">eco</span>
            ))}
          </div>
        </div>
      </div>

      {/* Área Central de Juego */}
      <div className="max-w-4xl mx-auto grid gap-6">
        
        {/* Temporizador Circular y Contador de Aciertos */}
        <div className="flex justify-between items-center">
          {/* Temporizador Circular */}
          <div className="relative">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center shadow-comic"
              style={{
                background: `conic-gradient(
                  ${timeLeft <= 10 ? '#C41E3A' : timeLeft <= 20 ? '#F4C430' : '#2D5A27'} 
                  ${(timeLeft / 30) * 360}deg,
                  transparent 0
                )`
              }}
            >
              {/* Círculo interior */}
              <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center">
                <span className={`text-2xl font-display font-bold ${
                  timeLeft <= 10 ? 'text-nica-rojo animate-pulse' : 'text-white'
                }`}>
                  {timeLeft}
                </span>
              </div>
            </div>
            {/* Etiqueta */}
            <p className="text-center text-xs text-gray-500 mt-1">segundos</p>
          </div>

          {/* Contador de Aciertos */}
          <div className="flex items-center gap-3 bg-gray-800/80 px-6 py-3 rounded-xl border border-gray-700">
            <span className="material-symbols-rounded text-green-400 text-3xl">check_circle</span>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Aciertos</p>
              <p className="text-2xl font-display text-green-400 font-bold">
                {score.correct}<span className="text-gray-500 text-lg">/{score.total}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Cuadro Central de Pregunta */}
        <div className="card bg-gradient-to-br from-gray-800/90 to-gray-900/90 shadow-2xl border border-gray-700/50 relative overflow-hidden">
          {/* Decoración superior */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-nica-amarillo/50 to-transparent"></div>
          
          {/* Badge de categoría */}
          <div className="flex justify-center mb-4">
            <span className="inline-block px-4 py-1.5 rounded-full bg-nica-amarillo/20 border border-nica-amarillo/50 text-nica-amarillo text-xs font-bold uppercase tracking-widest">
              {category.name}
            </span>
          </div>

          {/* Pregunta */}
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-2 leading-relaxed">
            {currentQuestion.text}
          </h2>
        </div>

        {/* Botones de Respuesta */}
        <div className="grid grid-cols-1 gap-3">
          {currentQuestion.options?.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isAnswered = showResult;
            const isCorrectAnswer = option === currentQuestion.correctAnswer;
            
            let buttonStyle = ANSWER_COLORS.default;
            if (isAnswered) {
              if (isCorrectAnswer) buttonStyle = ANSWER_COLORS.correct;
              else if (isSelected) buttonStyle = ANSWER_COLORS.incorrect;
            } else if (isSelected) {
              buttonStyle = ANSWER_COLORS.selected;
            }

            const letter = ['A', 'B', 'C', 'D'][index];

            return (
              <button
                key={index}
                onClick={() => {
                  if (!isAnswered && !answering) {
                    setSelectedAnswer(option);
                  }
                }}
                disabled={isAnswered || answering}
                className={`w-full p-5 rounded-xl border-2 text-left transition-all duration-300 flex items-center gap-4 group ${buttonStyle} ${
                  !isAnswered && !answering ? 'hover:scale-[1.02] hover:shadow-lg cursor-pointer' : 'cursor-default'
                }`}
              >
                {/* Letra de opción */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-display font-bold text-lg transition-colors ${
                  isSelected || isCorrectAnswer
                    ? 'bg-white text-gray-900'
                    : 'bg-gray-700 text-gray-400 group-hover:bg-gray-600'
                }`}>
                  {letter}
                </div>

                {/* Texto de opción */}
                <span className={`flex-1 text-lg ${
                  isCorrectAnswer ? 'text-green-300 font-bold' :
                  isSelected && isAnswered ? 'text-red-300' :
                  'text-gray-200'
                }`}>
                  {option}
                </span>

                {/* Icono de estado */}
                {isAnswered && isCorrectAnswer && (
                  <span className="material-symbols-rounded text-green-400 text-3xl">check_circle</span>
                )}
                {isAnswered && isSelected && !isCorrectAnswer && (
                  <span className="material-symbols-rounded text-red-400 text-3xl">cancel</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback de Resultado */}
        {showResult && (
          <div className={`p-4 rounded-xl flex items-center gap-3 ${
            isCorrect 
              ? 'bg-green-900/50 border border-green-700/50 text-green-300' 
              : 'bg-red-900/50 border border-red-700/50 text-red-300'
          }`}>
            <span className="material-symbols-rounded text-3xl">
              {isCorrect ? 'check_circle' : 'cancel'}
            </span>
            <div className="flex-1">
              <p className="font-bold text-lg">{isCorrect ? '¡Correcto!' : 'Incorrecto'}</p>
              {!isCorrect && (
                <p className="text-sm mt-1">
                  Respuesta correcta: <strong>{currentQuestion.correctAnswer}</strong>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Controles Inferiores: Power-ups */}
        <div className="card bg-gray-800/50 border-gray-700/50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-rounded text-nica-amarillo">emoji_events</span>
              Power-ups Disponibles
            </h3>
            {mejoraUsada && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <span className="material-symbols-rounded text-xs">info</span>
                Ya usaste una mejora en esta partida
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Pase */}
            <button
              onClick={handlePassQuestion}
              disabled={mejoraUsada || (mejoras?.[MEJORAS.PASE] || 0) <= 0}
              className={`relative p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                !mejoraUsada && (mejoras?.[MEJORAS.PASE] || 0) > 0
                  ? 'bg-yellow-900/30 border-yellow-600 hover:border-yellow-500 hover:scale-105 cursor-pointer'
                  : 'bg-gray-800/50 border-gray-700 opacity-50 cursor-not-allowed'
              }`}
            >
              <span className={`material-symbols-rounded text-4xl ${
                !mejoraUsada && (mejoras?.[MEJORAS.PASE] || 0) > 0 ? 'text-yellow-400' : 'text-gray-600'
              }`}>
                {MEJORA_ICONS[MEJORAS.PASE]}
              </span>
              <span className="text-xs font-bold text-gray-300">Pasar</span>
              <span className={`text-lg font-display font-bold ${
                !mejoraUsada && (mejoras?.[MEJORAS.PASE] || 0) > 0 ? 'text-yellow-400' : 'text-gray-600'
              }`}>
                {mejoras?.[MEJORAS.PASE] || 0}
              </span>
            </button>

            {/* Reloj de Arena */}
            <button
              onClick={handleDoubleTime}
              disabled={mejoraUsada || (mejoras?.[MEJORAS.RELOJ_ARENA] || 0) <= 0}
              className={`relative p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                !mejoraUsada && (mejoras?.[MEJORAS.RELOJ_ARENA] || 0) > 0
                  ? 'bg-blue-900/30 border-blue-600 hover:border-blue-500 hover:scale-105 cursor-pointer'
                  : 'bg-gray-800/50 border-gray-700 opacity-50 cursor-not-allowed'
              }`}
            >
              <span className={`material-symbols-rounded text-4xl ${
                !mejoraUsada && (mejoras?.[MEJORAS.RELOJ_ARENA] || 0) > 0 ? 'text-blue-400' : 'text-gray-600'
              }`}>
                {MEJORA_ICONS[MEJORAS.RELOJ_ARENA]}
              </span>
              <span className="text-xs font-bold text-gray-300">+Tiempo</span>
              <span className={`text-lg font-display font-bold ${
                !mejoraUsada && (mejoras?.[MEJORAS.RELOJ_ARENA] || 0) > 0 ? 'text-blue-400' : 'text-gray-600'
              }`}>
                {mejoras?.[MEJORAS.RELOJ_ARENA] || 0}
              </span>
            </button>

            {/* Comodín */}
            <button
              onClick={handleReduceOptions}
              disabled={mejoraUsada || (mejoras?.[MEJORAS.COMODIN] || 0) <= 0}
              className={`relative p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                !mejoraUsada && (mejoras?.[MEJORAS.COMODIN] || 0) > 0
                  ? 'bg-red-900/30 border-red-600 hover:border-red-500 hover:scale-105 cursor-pointer'
                  : 'bg-gray-800/50 border-gray-700 opacity-50 cursor-not-allowed'
              }`}
            >
              <span className={`material-symbols-rounded text-4xl ${
                !mejoraUsada && (mejoras?.[MEJORAS.COMODIN] || 0) > 0 ? 'text-red-400' : 'text-gray-600'
              }`}>
                {MEJORA_ICONS[MEJORAS.COMODIN]}
              </span>
              <span className="text-xs font-bold text-gray-300">Comodín</span>
              <span className={`text-lg font-display font-bold ${
                !mejoraUsada && (mejoras?.[MEJORAS.COMODIN] || 0) > 0 ? 'text-red-400' : 'text-gray-600'
              }`}>
                {mejoras?.[MEJORAS.COMODIN] || 0}
              </span>
            </button>
          </div>
        </div>

        {/* Botón de Acción */}
        <div className="flex gap-4">
          {!showResult ? (
            <Button
              onClick={handleAnswer}
              disabled={!selectedAnswer || answering}
              variant="primary"
              className="w-full py-5 text-lg font-bold"
            >
              {answering ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="material-symbols-rounded animate-spin">progress_activity</span>
                  Enviando...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span className="material-symbols-rounded">send</span>
                  Responder
                </span>
              )}
            </Button>
          ) : (
            <Button
              onClick={nextQuestion}
              variant="primary"
              className="w-full py-5 text-lg font-bold"
            >
              <span className="flex items-center justify-center gap-2">
                <span className="material-symbols-rounded">
                  {currentQuestionIndex < questions.length - 1 ? 'arrow_forward' : 'emoji_events'}
                </span>
                {currentQuestionIndex < questions.length - 1 ? 'Siguiente' : 'Ver Resultados'}
              </span>
            </Button>
          )}
        </div>
      </div>

      {/* Modales */}
      <FeedbackModal
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        isCorrect={isCorrect}
        ingrediente={ingrediente}
      />

      <ResultModal
        isOpen={showResults}
        onClose={() => {
          setShowResults(false);
          navigate('/categories');
        }}
        onRetry={restartQuiz}
        score={score.correct}
        total={score.total}
        ingrediente={ingrediente}
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
