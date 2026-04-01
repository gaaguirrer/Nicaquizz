/**
 * Tests de Integración - Servicios de NicaQuizz
 * Pruebas para firestore-extensions.js (Mapa y Notificaciones)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock de Firebase
const mockGetDocs = vi.fn();
const mockGetDoc = vi.fn();
const mockAddDoc = vi.fn();
const mockUpdateDoc = vi.fn();
const mockDeleteDoc = vi.fn();
const mockCollection = vi.fn();
const mockDoc = vi.fn();
const mockQuery = vi.fn();
const mockWhere = vi.fn();
const mockOrderBy = vi.fn();
const mockLimit = vi.fn();
const mockIncrement = vi.fn();
const mockArrayUnion = vi.fn();
const mockServerTimestamp = vi.fn();

vi.mock('firebase/firestore', () => ({
  getDocs: () => mockGetDocs(),
  getDoc: () => mockGetDoc(),
  addDoc: (...args) => mockAddDoc(...args),
  updateDoc: (...args) => mockUpdateDoc(...args),
  deleteDoc: (...args) => mockDeleteDoc(...args),
  collection: (...args) => mockCollection(...args),
  doc: (...args) => mockDoc(...args),
  query: (...args) => mockQuery(...args),
  where: (...args) => mockWhere(...args),
  orderBy: (...args) => mockOrderBy(...args),
  limit: (...args) => mockLimit(...args),
  increment: () => mockIncrement(),
  arrayUnion: () => mockArrayUnion(),
  serverTimestamp: () => mockServerTimestamp(),
}));

// Importar funciones después de los mocks
import {
  getDepartments,
  getDepartmentById,
  getRegionalLeaders,
  getUserConquestProgress,
  updateUserConquestProgress,
  getUserNotifications,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification
} from '../../src/services/firestore-extensions.js';

describe('firestore-extensions.js - Mapa de Conquista', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDepartments', () => {
    it('obtiene todos los departamentos ordenados', async () => {
      const mockDepartments = [
        { id: 'leon', nombre: 'León', conquistado: true },
        { id: 'granada', nombre: 'Granada', conquistado: false }
      ];

      mockCollection.mockReturnValue('departments-ref');
      mockQuery.mockReturnValue('query-ref');
      mockGetDocs.mockResolvedValue({
        docs: mockDepartments.map(dept => ({
          id: dept.id,
          data: () => dept
        }))
      });

      const result = await getDepartments();

      expect(mockCollection).toHaveBeenCalledWith(expect.anything(), 'departments');
      expect(result).toHaveLength(2);
      expect(result[0].nombre).toBe('León');
    });

    it('maneja errores al obtener departamentos', async () => {
      mockCollection.mockReturnValue('departments-ref');
      mockQuery.mockReturnValue('query-ref');
      mockGetDocs.mockRejectedValue(new Error('Firestore error'));

      await expect(getDepartments()).rejects.toThrow('Firestore error');
    });
  });

  describe('getDepartmentById', () => {
    it('obtiene un departamento por ID', async () => {
      const mockDepartment = {
        id: 'leon',
        nombre: 'León',
        capital: 'León',
        conquistado: true
      };

      mockDoc.mockReturnValue('dept-ref');
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockDepartment,
        id: 'leon'
      });

      const result = await getDepartmentById('leon');

      expect(mockDoc).toHaveBeenCalledWith(expect.anything(), 'departments', 'leon');
      expect(result.nombre).toBe('León');
    });

    it('retorna null si el departamento no existe', async () => {
      mockDoc.mockReturnValue('dept-ref');
      mockGetDoc.mockResolvedValue({
        exists: () => false
      });

      const result = await getDepartmentById('inexistente');

      expect(result).toBeNull();
    });
  });

  describe('getRegionalLeaders', () => {
    it('obtiene todos los líderes activos', async () => {
      const mockLeaders = [
        { id: '1', nombre: 'Elena "Vigorón" López', departamento: 'Granada', activo: true },
        { id: '2', nombre: 'Carlos "Poeta" Martínez', departamento: 'León', activo: true }
      ];

      mockCollection.mockReturnValue('leaders-ref');
      mockQuery.mockReturnValue('query-ref');
      mockGetDocs.mockResolvedValue({
        docs: mockLeaders.map(leader => ({
          id: leader.id,
          data: () => leader
        }))
      });

      const result = await getRegionalLeaders();

      expect(result).toHaveLength(2);
      expect(result[0].nombre).toContain('Vigorón');
    });

    it('obtiene líderes de un departamento específico', async () => {
      const mockLeaders = [
        { id: '1', nombre: 'Elena "Vigorón" López', departamento: 'Granada', activo: true }
      ];

      mockCollection.mockReturnValue('leaders-ref');
      mockWhere.mockReturnValue('where-clause');
      mockQuery.mockReturnValue('query-ref');
      mockGetDocs.mockResolvedValue({
        docs: mockLeaders.map(leader => ({
          id: leader.id,
          data: () => leader
        }))
      });

      const result = await getRegionalLeaders('Granada');

      expect(mockWhere).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].departamento).toBe('Granada');
    });
  });

  describe('getUserConquestProgress', () => {
    it('obtiene el progreso de conquista del usuario', async () => {
      const mockUserData = {
        departamentosConquistados: ['leon', 'granada'],
        conquestProgress: 2
      };

      mockDoc.mockReturnValue('user-ref');
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockUserData
      });

      const result = await getUserConquestProgress('user-123');

      expect(result.departamentosConquistados).toHaveLength(2);
      expect(result.progresoTotal).toBe(2);
    });

    it('retorna valores por defecto si no hay progreso', async () => {
      mockDoc.mockReturnValue('user-ref');
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({})
      });

      const result = await getUserConquestProgress('user-123');

      expect(result.departamentosConquistados).toEqual([]);
      expect(result.progresoTotal).toBe(0);
    });

    it('maneja usuario inexistente', async () => {
      mockDoc.mockReturnValue('user-ref');
      mockGetDoc.mockResolvedValue({
        exists: () => false
      });

      const result = await getUserConquestProgress('user-inexistente');

      expect(result.departamentosConquistados).toEqual([]);
      expect(result.progresoTotal).toBe(0);
    });
  });

  describe('updateUserConquestProgress', () => {
    it('actualiza el progreso de conquista', async () => {
      mockDoc.mockReturnValue('user-ref');
      mockUpdateDoc.mockResolvedValue(undefined);
      mockArrayUnion.mockReturnValue('array-union-op');
      mockIncrement.mockReturnValue(1);
      mockServerTimestamp.mockReturnValue('timestamp');

      const result = await updateUserConquestProgress('user-123', 'leon');

      expect(mockUpdateDoc).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('maneja errores al actualizar progreso', async () => {
      mockDoc.mockReturnValue('user-ref');
      mockUpdateDoc.mockRejectedValue(new Error('Update error'));

      await expect(updateUserConquestProgress('user-123', 'leon')).rejects.toThrow('Update error');
    });
  });
});

describe('firestore-extensions.js - Notificaciones', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserNotifications', () => {
    it('obtiene notificaciones del usuario ordenadas por fecha', async () => {
      const mockNotifications = [
        { id: '1', tipo: 'trueque', titulo: '¡Trueque completado!', createdAt: '2024-01-02' },
        { id: '2', tipo: 'reto', titulo: 'Nuevo Desafío', createdAt: '2024-01-01' }
      ];

      mockCollection.mockReturnValue('notifications-ref');
      mockQuery.mockReturnValue('query-ref');
      mockGetDocs.mockResolvedValue({
        docs: mockNotifications.map(notif => ({
          id: notif.id,
          data: () => notif
        }))
      });

      const result = await getUserNotifications('user-123');

      expect(mockCollection).toHaveBeenCalledWith(expect.anything(), 'notifications');
      expect(result).toHaveLength(2);
      expect(result[0].tipo).toBe('trueque');
    });

    it('limita el número de notificaciones', async () => {
      mockCollection.mockReturnValue('notifications-ref');
      mockQuery.mockReturnValue('query-ref');
      mockGetDocs.mockResolvedValue({
        docs: []
      });

      await getUserNotifications('user-123', 10);

      expect(mockLimit).toHaveBeenCalledWith(10);
    });
  });

  describe('createNotification', () => {
    it('crea una notificación correctamente', async () => {
      mockCollection.mockReturnValue('notifications-ref');
      mockAddDoc.mockResolvedValue({ id: 'notif-123' });
      mockServerTimestamp.mockReturnValue('timestamp');

      const result = await createNotification(
        'user-123',
        'trueque',
        '¡Trueque completado!',
        '@Juanito aceptó tu oferta',
        { truequeId: 'trade-456' }
      );

      expect(mockAddDoc).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('crea notificación sin datos adicionales', async () => {
      mockCollection.mockReturnValue('notifications-ref');
      mockAddDoc.mockResolvedValue({ id: 'notif-123' });

      const result = await createNotification(
        'user-123',
        'sistema',
        'Aviso del Sistema',
        'Tu inventario está casi lleno'
      );

      expect(result.success).toBe(true);
    });

    it('maneja errores al crear notificación', async () => {
      mockCollection.mockReturnValue('notifications-ref');
      mockAddDoc.mockRejectedValue(new Error('Create error'));

      await expect(createNotification('user-123', 'reto', 'Test', 'Test')).rejects.toThrow('Create error');
    });
  });

  describe('markNotificationAsRead', () => {
    it('marca una notificación como leída', async () => {
      mockDoc.mockReturnValue('notif-ref');
      mockUpdateDoc.mockResolvedValue(undefined);
      mockServerTimestamp.mockReturnValue('timestamp');

      const result = await markNotificationAsRead('notif-123');

      expect(mockUpdateDoc).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('maneja errores al marcar como leída', async () => {
      mockDoc.mockReturnValue('notif-ref');
      mockUpdateDoc.mockRejectedValue(new Error('Update error'));

      await expect(markNotificationAsRead('notif-123')).rejects.toThrow('Update error');
    });
  });

  describe('markAllNotificationsAsRead', () => {
    it('marca todas las notificaciones como leídas', async () => {
      const mockDocs = [
        { ref: 'ref-1' },
        { ref: 'ref-2' },
        { ref: 'ref-3' }
      ];

      mockCollection.mockReturnValue('notifications-ref');
      mockQuery.mockReturnValue('query-ref');
      mockGetDocs.mockResolvedValue({
        docs: mockDocs,
        size: 3
      });
      mockUpdateDoc.mockResolvedValue(undefined);
      mockServerTimestamp.mockReturnValue('timestamp');

      const result = await markAllNotificationsAsRead('user-123');

      expect(mockUpdateDoc).toHaveBeenCalledTimes(3);
      expect(result.success).toBe(true);
      expect(result.count).toBe(3);
    });

    it('maneja cuando no hay notificaciones no leídas', async () => {
      mockCollection.mockReturnValue('notifications-ref');
      mockQuery.mockReturnValue('query-ref');
      mockGetDocs.mockResolvedValue({
        docs: [],
        size: 0
      });

      const result = await markAllNotificationsAsRead('user-123');

      expect(result.success).toBe(true);
      expect(result.count).toBe(0);
    });
  });

  describe('deleteNotification', () => {
    it('elimina una notificación', async () => {
      mockDoc.mockReturnValue('notif-ref');
      mockDeleteDoc.mockResolvedValue(undefined);

      const result = await deleteNotification('notif-123');

      expect(mockDeleteDoc).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('maneja errores al eliminar', async () => {
      mockDoc.mockReturnValue('notif-ref');
      mockDeleteDoc.mockRejectedValue(new Error('Delete error'));

      await expect(deleteNotification('notif-123')).rejects.toThrow('Delete error');
    });
  });
});

// ==================== TESTS DE FLUJOS COMBINADOS ====================

describe('Flujos Combinados - Mapa y Notificaciones', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('flujo completo: conquistar departamento y notificar', async () => {
    // Mock de obtener progreso actual
    mockDoc.mockReturnValue('user-ref');
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        departamentosConquistados: ['leon'],
        conquestProgress: 1
      })
    });

    // Mock de actualizar progreso
    mockUpdateDoc.mockResolvedValue(undefined);
    mockArrayUnion.mockReturnValue('array-union-op');
    mockIncrement.mockReturnValue(1);
    mockServerTimestamp.mockReturnValue('timestamp');

    // Mock de crear notificación
    mockCollection.mockReturnValue('notifications-ref');
    mockAddDoc.mockResolvedValue({ id: 'notif-123' });

    // Ejecutar flujo
    const userId = 'user-123';
    const departamentoId = 'granada';

    // 1. Obtener progreso actual
    const progreso = await getUserConquestProgress(userId);
    expect(progreso.departamentosConquistados).toContain('leon');

    // 2. Actualizar progreso
    await updateUserConquestProgress(userId, departamentoId);
    expect(mockUpdateDoc).toHaveBeenCalled();

    // 3. Crear notificación de logro
    await createNotification(
      userId,
      'logro',
      '¡Departamento Conquistado!',
      'Has conquistado Granada Colonial',
      { departamentoId: 'granada' }
    );
    expect(mockAddDoc).toHaveBeenCalled();
  });

  it('flujo completo: obtener notificaciones y marcar como leídas', async () => {
    const userId = 'user-123';

    // Mock de obtener notificaciones
    const mockNotifications = [
      { id: '1', tipo: 'reto', leido: false },
      { id: '2', tipo: 'trueque', leido: false },
      { id: '3', tipo: 'logro', leido: true }
    ];

    mockCollection.mockReturnValue('notifications-ref');
    mockQuery.mockReturnValue('query-ref');
    mockGetDocs.mockResolvedValue({
      docs: mockNotifications.map(notif => ({
        id: notif.id,
        data: () => notif,
        ref: `ref-${notif.id}`
      }))
    });

    mockUpdateDoc.mockResolvedValue(undefined);
    mockServerTimestamp.mockReturnValue('timestamp');

    // 1. Obtener notificaciones
    const notificaciones = await getUserNotifications(userId);
    expect(notificaciones).toHaveLength(3);

    // 2. Marcar todas como leídas
    const result = await markAllNotificationsAsRead(userId);
    expect(result.count).toBe(3);
    expect(mockUpdateDoc).toHaveBeenCalledTimes(3);
  });
});
