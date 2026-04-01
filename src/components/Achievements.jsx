/**
 * Achievements.jsx - Sistema de Logros de NicaQuizz
 * 
 * Muestra los logros desbloqueados y por desbloquear del usuario
 * 
 * Uso:
 * <Achievements userId="user123" />
 */

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import Card from './Card';
import Skeleton from './Skeleton';

// Definición de logros disponibles
const ACHIEVEMENTS_CONFIG = {
  // Logros de Batallas
  first_win: {
    id: 'first_win',
    name: 'Primera Victoria',
    description: 'Gana tu primer reto',
    icon: 'emoji_events',
    category: 'battle',
    requirement: { type: 'wins', count: 1 },
    reward: { type: 'coins', amount: 100 },
    color: 'from-[#F4C430] to-[#DAA520]'
  },
  win_streak_3: {
    id: 'win_streak_3',
    name: 'Racha de 3',
    description: 'Gana 3 batallas consecutivas',
    icon: 'local_fire_department',
    category: 'battle',
    requirement: { type: 'winStreak', count: 3 },
    reward: { type: 'coins', amount: 200 },
    color: 'from-[#C41E3A] to-[#79001c]'
  },
  win_streak_10: {
    id: 'win_streak_10',
    name: 'Racha de 10',
    description: 'Gana 10 batallas consecutivas',
    icon: 'whatshot',
    category: 'battle',
    requirement: { type: 'winStreak', count: 10 },
    reward: { type: 'coins', amount: 500 },
    color: 'from-[#FF6B6B] to-[#C41E3A]'
  },
  hundred_wins: {
    id: 'hundred_wins',
    name: 'Centurión',
    description: 'Gana 100 batallas',
    icon: 'military_tech',
    category: 'battle',
    requirement: { type: 'wins', count: 100 },
    reward: { type: 'badge', badge: 'centurion' },
    color: 'from-[#8B5FBF] to-[#5B3A7A]'
  },
  
  // Logros de Categoría
  historia_master: {
    id: 'historia_master',
    name: 'Maestro de Historia',
    description: 'Responde 50 preguntas de historia correctamente',
    icon: 'history_edu',
    category: 'category',
    requirement: { type: 'categoryCorrect', category: 'historia', count: 50 },
    reward: { type: 'coins', amount: 300 },
    color: 'from-[#2D5A27] to-[#154212]'
  },
  matematicas_master: {
    id: 'matematicas_master',
    name: 'Maestro de Matemáticas',
    description: 'Responde 50 preguntas de matemáticas correctamente',
    icon: 'calculate',
    category: 'category',
    requirement: { type: 'categoryCorrect', category: 'matematicas', count: 50 },
    reward: { type: 'coins', amount: 300 },
    color: 'from-[#C41E3A] to-[#79001c]'
  },
  geografia_master: {
    id: 'geografia_master',
    name: 'Maestro de Geografía',
    description: 'Responde 50 preguntas de geografía correctamente',
    icon: 'public',
    category: 'category',
    requirement: { type: 'categoryCorrect', category: 'geografia', count: 50 },
    reward: { type: 'coins', amount: 300 },
    color: 'from-[#154212] to-[#0A1F08]'
  },
  ciencias_master: {
    id: 'ciencias_master',
    name: 'Maestro de Ciencias',
    description: 'Responde 50 preguntas de ciencias correctamente',
    icon: 'science',
    category: 'category',
    requirement: { type: 'categoryCorrect', category: 'ciencias', count: 50 },
    reward: { type: 'coins', amount: 300 },
    color: 'from-[#8B5FBF] to-[#5B3A7A]'
  },
  
  // Logros Especiales
  daily_challenge_7: {
    id: 'daily_challenge_7',
    name: 'Constante',
    description: 'Completa el reto diario durante 7 días seguidos',
    icon: 'calendar_today',
    category: 'special',
    requirement: { type: 'dailyStreak', count: 7 },
    reward: { type: 'achiote', amount: 7 },
    color: 'from-[#D9531E] to-[#B93B0E]'
  },
  perfect_score: {
    id: 'perfect_score',
    name: 'Perfección',
    description: 'Responde todas las preguntas correctamente en un reto',
    icon: 'stars',
    category: 'special',
    requirement: { type: 'perfectScore', count: 1 },
    reward: { type: 'coins', amount: 500 },
    color: 'from-[#F4C430] to-[#FFD700]'
  },
  social_butterfly: {
    id: 'social_butterfly',
    name: 'Social',
    description: 'Agrega 20 amigos',
    icon: 'group',
    category: 'social',
    requirement: { type: 'friends', count: 20 },
    reward: { type: 'coins', amount: 200 },
    color: 'from-[#4CAF50] to-[#2D5A27]'
  },
  trader: {
    id: 'trader',
    name: 'Comerciante',
    description: 'Completa 10 trueques',
    icon: 'swap_horiz',
    category: 'social',
    requirement: { type: 'trades', count: 10 },
    reward: { type: 'coins', amount: 300 },
    color: 'from-[#2196F3] to-[#154212]'
  }
};

export default function Achievements({ userId }) {
  const [userAchievements, setUserAchievements] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unlocked, locked

  useEffect(() => {
    if (userId) {
      loadAchievements();
    }
  }, [userId]);

  async function loadAchievements() {
    try {
      setLoading(true);
      
      // Cargar logros del usuario
      const q = query(
        collection(db, 'userAchievements'),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      const achievements = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUserAchievements(achievements);

      // Cargar estadísticas del usuario
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDocs(query(collection(db, 'users'), where('__name__', '==', userId)));
      if (!userSnap.empty) {
        const userData = userSnap.docs[0].data();
        setStats(userData.stats || {});
      }

      // Verificar nuevos logros desbloqueados
      checkAchievements(userData);
    } catch (error) {
      console.error('Error al cargar logros:', error);
    } finally {
      setLoading(false);
    }
  }

  // Verificar si se desbloquearon nuevos logros
  async function checkAchievements(userData) {
    if (!userData) return;

    const stats = userData.stats || {};
    const coins = userData.coins || {};
    const newAchievements = [];

    // Verificar cada logro
    for (const [key, config] of Object.entries(ACHIEVEMENTS_CONFIG)) {
      const alreadyUnlocked = userAchievements.some(a => a.achievementId === key);
      if (alreadyUnlocked) continue;

      let unlocked = false;

      // Verificar requisitos
      switch (config.requirement.type) {
        case 'wins':
          unlocked = (stats.wins || 0) >= config.requirement.count;
          break;
        case 'winStreak':
          unlocked = (stats.currentWinStreak || 0) >= config.requirement.count;
          break;
        case 'categoryCorrect':
          const catStats = stats.categoryStats?.[config.requirement.category];
          unlocked = (catStats?.correct || 0) >= config.requirement.count;
          break;
        case 'dailyStreak':
          unlocked = (stats.dailyChallengeStreak || 0) >= config.requirement.count;
          break;
        case 'friends':
          unlocked = (userData.friends || []).length >= config.requirement.count;
          break;
        case 'trades':
          unlocked = (stats.tradesCompleted || 0) >= config.requirement.count;
          break;
        default:
          break;
      }

      if (unlocked) {
        newAchievements.push(key);
        // Desbloquear logro
        await unlockAchievement(userId, key, config.reward);
      }
    }

    if (newAchievements.length > 0) {
      console.log('Nuevos logros desbloqueados:', newAchievements);
    }
  }

  // Desbloquear logro
  async function unlockAchievement(userId, achievementId, reward) {
    try {
      const userAchievementsRef = collection(db, 'userAchievements');
      await addDoc(userAchievementsRef, {
        userId,
        achievementId,
        unlockedAt: new Date().toISOString(),
        reward
      });

      // Actualizar estadísticas del usuario
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        achievements: arrayUnion(achievementId)
      });

      // Aquí se podría enviar una notificación
      console.log(`¡Logro desbloqueado: ${achievementId}!`);
    } catch (error) {
      console.error('Error al desbloquear logro:', error);
    }
  }

  // Filtrar logros
  const filteredAchievements = Object.values(ACHIEVEMENTS_CONFIG).filter(ach => {
    const unlocked = userAchievements.some(a => a.achievementId === ach.id);
    if (filter === 'unlocked') return unlocked;
    if (filter === 'locked') return !unlocked;
    return true;
  });

  // Verificar si un logro está desbloqueado
  const isUnlocked = (achievementId) => {
    return userAchievements.some(a => a.achievementId === achievementId);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton variant="text" width="200px" height="32px" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header y Filtros */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold font-headline text-[#154212]">
          Logros y Medallas
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
              filter === 'all'
                ? 'bg-[#2D5A27] text-white'
                : 'bg-white text-[#154212]/70 hover:bg-[#f8f6c9]'
            }`}
          >
            Todos ({Object.keys(ACHIEVEMENTS_CONFIG).length})
          </button>
          <button
            onClick={() => setFilter('unlocked')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
              filter === 'unlocked'
                ? 'bg-[#F4C430] text-[#1d1d03]'
                : 'bg-white text-[#154212]/70 hover:bg-[#f8f6c9]'
            }`}
          >
            Desbloqueados ({userAchievements.length})
          </button>
          <button
            onClick={() => setFilter('locked')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
              filter === 'locked'
                ? 'bg-[#154212] text-white'
                : 'bg-white text-[#154212]/70 hover:bg-[#f8f6c9]'
            }`}
          >
            Por Desbloquear ({Object.keys(ACHIEVEMENTS_CONFIG).length - userAchievements.length})
          </button>
        </div>
      </div>

      {/* Grid de Logros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((achievement) => {
          const unlocked = isUnlocked(achievement.id);
          const unlockData = userAchievements.find(a => a.achievementId === achievement.id);

          return (
            <Card
              key={achievement.id}
              variant={unlocked ? 'elevated' : 'outlined'}
              hover={unlocked}
              className={`relative overflow-hidden ${
                unlocked ? '' : 'opacity-60 grayscale'
              }`}
            >
              {/* Banner de desbloqueado */}
              {unlocked && (
                <div className="absolute top-0 right-0 bg-gradient-to-br from-[#F4C430] to-[#DAA520] text-white px-3 py-1 rounded-bl-xl text-xs font-bold">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                </div>
              )}

              {/* Ícono */}
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${achievement.color} flex items-center justify-center mb-4 ${
                unlocked ? 'animate-glow' : ''
              }`}>
                <span className="material-symbols-outlined text-white text-3xl">
                  {achievement.icon}
                </span>
              </div>

              {/* Información */}
              <h3 className="text-lg font-bold font-headline text-[#154212] mb-2">
                {achievement.name}
              </h3>
              <p className="text-sm text-[#42493e] mb-4">
                {achievement.description}
              </p>

              {/* Recompensa */}
              <div className="bg-[#154212]/5 rounded-xl px-4 py-2 mb-4">
                <p className="text-xs text-[#42493e]/60 mb-1">Recompensa</p>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#F4C430] text-sm">
                    {achievement.reward.type === 'coins' || achievement.reward.type === 'achiote' ? 'bakery_dining' : 'emoji_events'}
                  </span>
                  <span className="font-bold text-[#154212]">
                    {achievement.reward.type === 'coins' && `${achievement.reward.amount} monedas`}
                    {achievement.reward.type === 'achiote' && `${achievement.reward.amount} achiotes`}
                    {achievement.reward.type === 'badge' && `Medalla ${achievement.reward.badge}`}
                  </span>
                </div>
              </div>

              {/* Fecha de desbloqueo */}
              {unlocked && unlockData && (
                <p className="text-xs text-[#42493e]/60">
                  Desbloqueado el {new Date(unlockData.unlockedAt).toLocaleDateString('es-NI')}
                </p>
              )}
            </Card>
          );
        })}
      </div>

      {/* Animación glow */}
      <style>{`
        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 10px rgba(244, 196, 48, 0.3);
          }
          50% {
            box-shadow: 0 0 20px rgba(244, 196, 48, 0.6);
          }
        }
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
