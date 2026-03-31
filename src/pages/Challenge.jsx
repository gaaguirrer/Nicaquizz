import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getChallenge,
  acceptChallenge,
  rejectChallenge,
  completeChallenge,
  fetchApprovedQuestions,
  submitAnswer,
  getUserProfile,
  INGREDIENTE_NAMES,
  CATEGORIA_INGREDIENTE,
  addCoins
} from '../services/firestore';

const MaterialIcon = ({ name, className = '' }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

export default function Challenge() {
  const { challengeId } = useParams();
  const navigate = useNavigate();
  const { currentUser, userData, updateUserStats } = useAuth();

  const [challenge, setChallenge] = useState(null);
  const [opponent, setOpponent] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gameState, setGameState] = useState('loading'); // loading, waiting, playing, complete
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [timeLeft, setTimeLeft] = useState(30);
  const [answering, setAnswering] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadChallenge();
  }, [challengeId]);

  useEffect(() => {
    if (!showResult && gameState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult && gameState === 'playing') {
      handleTimeUp();
    }
  }, [timeLeft, showResult, gameState]);

  async function loadChallenge() {
    try {
      const challengeData = await getChallenge(challengeId);
      
      if (!challengeData) {
        setMessage({ type: 'error', text: 'Reto no encontrado' });
        setGameState('error');
        return;
      }

      setChallenge(challengeData);

      // Verificar si el usuario es parte del reto
      const isChallenger = challengeData.challengerId === currentUser.uid;
      const isChallenged = challengeData.challengedId === currentUser.uid;

      if (!isChallenger && !isChallenged) {
        setMessage({ type: 'error', text: 'No eres parte de este reto' });
        setGameState('error');
        return;
      }

      // Cargar datos del oponente
      const opponentId = isChallenger ? challengeData.challengedId : challengeData.challengerId;
      const opponentData = await getUserProfile(opponentId);
      setOpponent(opponentData);

      // Verificar estado del reto
      if (challengeData.status === 'pending' && isChallenged) {
        setGameState('waiting');
      } else if (challengeData.status === 'accepted') {
        // Cargar preguntas
        const categoryId = challengeData.categoryId;
        const questionsData = await fetchApprovedQuestions(categoryId || null, 'hard');
        
        // Preparar preguntas con opciones
        const questionsWithOptions = questionsData
          .sort(() => Math.random() - 0.5)
          .slice(0, 5)
          .map(q => ({
            ...q,
            options: q.options?.length ? q.options : generateOptions(q.correctAnswer)
          }));

        setQuestions(questionsWithOptions);
        setGameState('playing');
      } else if (challengeData.status === 'completed') {
        setGameState('complete');
      }
    } catch (error) {
      console.error('Error al cargar reto:', error);
      setMessage({ type: 'error', text: 'Error al cargar el reto' });
      setGameState('error');
    } finally {
      setLoading(false);
    }
  }

  function generateOptions(correctAnswer) {
    const wrongOptions = [
      'Opción incorrecta 1',
      'Respuesta equivocada',
      'No es esta',
      'Intenta de nuevo'
    ];
    const shuffled = [...wrongOptions, correctAnswer].sort(() => Math.random() - 0.5);
    return shuffled;
  }

  async function handleAccept() {
    try {
      await acceptChallenge(challengeId);
      setGameState('playing');
      setMessage({ type: 'success', text: '¡Reto aceptado! Comenzando...' });
    } catch (error) {
      console.error('Error al aceptar reto:', error);
      setMessage({ type: 'error', text: 'Error al aceptar el reto' });
    }
  }

  async function handleReject() {
    if (!confirm('¿Estás seguro de rechazar este reto?')) return;
    
    try {
      await rejectChallenge(challengeId);
      navigate('/friends');
    } catch (error) {
      console.error('Error al rechazar reto:', error);
      setMessage({ type: 'error', text: 'Error al rechazar el reto' });
    }
  }

  async function handleTimeUp() {
    setAnswering(true);
    setIsCorrect(false);
    setShowResult(true);
    setScore(prev => ({ ...prev, total: prev.total + 1 }));

    const currentQuestion = questions[currentQuestionIndex];
    try {
      await submitAnswer(currentUser.uid, currentQuestion.id, challenge.categoryId || 'general', false);
      await updateUserStats(currentQuestion.id, challenge.categoryId || 'general', false);
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

    try {
      await submitAnswer(currentUser.uid, currentQuestion.id, challenge.categoryId || 'general', correct);
      await updateUserStats(currentQuestion.id, challenge.categoryId || 'general', correct);
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
      finishChallenge();
    }
  }

  async function finishChallenge() {
    try {
      const percentage = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
      
      // Determinar ganador (esto es simplificado - en producción se compara con el oponente)
      const isWinner = percentage >= 60;
      
      await completeChallenge(
        challengeId,
        isWinner ? currentUser.uid : (opponent?.id || null),
        score.correct,
        0 // opponent score se actualizaría después
      );

      // Dar recompensa si ganó
      if (isWinner && challenge.categoryId) {
        await addCoins(currentUser.uid, challenge.categoryId, true);
      }

      setGameState('complete');
    } catch (error) {
      console.error('Error al completar reto:', error);
      setMessage({ type: 'error', text: 'Error al completar el reto' });
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Cargando reto...</div>
      </div>
    );
  }

  if (gameState === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card text-center max-w-md">
          <MaterialIcon name="error" className="text-6xl text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Error en el Reto</h1>
          <p className="text-gray-400 mb-6">{message.text}</p>
          <Link to="/friends" className="btn-primary">
            Volver a Amigos
          </Link>
        </div>
      </div>
    );
  }

  if (gameState === 'waiting') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card text-center max-w-md">
          <MaterialIcon name="sports_martial_arts" className="text-6xl text-indigo-500 mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">¡Te han retado!</h1>
          <p className="text-gray-300 mb-2">
            <strong>{opponent?.displayName}</strong> te ha desafiado
          </p>
          {challenge?.categoryId && (
            <p className="text-gray-400 mb-6">
              Categoría: <span className="capitalize">{challenge.categoryId}</span>
            </p>
          )}
          <div className="flex gap-4 justify-center">
            <button onClick={handleAccept} className="btn-primary">
              <MaterialIcon name="check" className="inline-block align-middle mr-1" /> Aceptar
            </button>
            <button onClick={handleReject} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all">
              <MaterialIcon name="close" className="inline-block align-middle mr-1" /> Rechazar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'complete') {
    const percentage = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
    const isWinner = percentage >= 60;

    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card max-w-md w-full text-center">
          <div className="mb-6">
            {isWinner ? (
              <MaterialIcon name="emoji_events" className="text-7xl text-yellow-500" />
            ) : (
              <MaterialIcon name="sentiment_dissatisfied" className="text-7xl text-gray-500" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">
            {isWinner ? '¡Victoria!' : 'Derrota'}
          </h1>
          <div className="text-5xl font-bold gradient-text mb-4">
            {score.correct}/{score.total}
          </div>
          <p className="text-xl text-gray-300 mb-6">
            Precisión: {percentage}%
          </p>
          
          {isWinner && challenge.categoryId && (
            <div className="bg-green-900/50 border border-green-700 text-green-300 p-4 rounded-lg mb-6">
              <p className="font-bold">¡Ganaste un ingrediente!</p>
              <p className="text-sm">
                {INGREDIENTE_NAMES[CATEGORIA_INGREDIENTE[challenge.categoryId]] || 'Bonus'}
              </p>
            </div>
          )}

          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/friends" className="btn-primary">
              Volver a Amigos
            </Link>
            <Link to="/dashboard" className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-6 py-3 rounded-lg font-semibold transition-all">
              Inicio
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
          <p className="text-gray-400 mb-4">No hay preguntas disponibles</p>
          <Link to="/friends" className="btn-primary">Volver</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="max-w-2xl mx-auto">
        {/* Header del reto */}
        <div className="card mb-6 bg-gray-800/50">
          <div className="flex justify-between items-center">
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-1">Tú</p>
              <p className="font-bold text-white">{userData?.displayName || 'Usuario'}</p>
              <div className="text-2xl font-bold text-green-400 mt-1">{score.correct}</div>
            </div>
            <div className="text-center">
              <MaterialIcon name="vs" className="text-4xl text-gray-500" />
              <p className="text-xs text-gray-400 mt-2">VS</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-1">{opponent?.displayName || 'Oponente'}</p>
              <p className="font-bold text-white">{opponent?.displayName ? 'vs' : '?'}</p>
              <div className="text-2xl font-bold text-gray-500 mt-1">-</div>
            </div>
          </div>
        </div>

        {/* Info de la pregunta */}
        <div className="flex justify-between items-center mb-6">
          <Link to="/friends" className="text-gray-300 hover:text-indigo-400 transition-colors">
            <MaterialIcon name="arrow_back" className="align-middle" /> Salir
          </Link>
          <div className="text-gray-300 font-semibold">
            Pregunta {currentQuestionIndex + 1} de {questions.length}
          </div>
          <div className={`text-gray-300 font-semibold ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : ''}`}>
            <MaterialIcon name="timer" className="inline-block w-5 h-5 align-middle" /> {timeLeft}s
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="bg-gray-800 rounded-full h-2 mb-6">
          <div
            className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
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
                {isCorrect ? <><MaterialIcon name="check_circle" className="inline-block align-middle" /> ¡Correcto!</> : <><MaterialIcon name="cancel" className="inline-block align-middle" /> Incorrecto</>}
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
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white flex-1 py-3 rounded-lg font-semibold transition-all shadow-lg"
              >
                {answering ? 'Enviando...' : 'Responder'}
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white flex-1 py-3 rounded-lg font-semibold transition-all shadow-lg"
              >
                {currentQuestionIndex < questions.length - 1 ? 'Siguiente' : 'Ver resultado'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
