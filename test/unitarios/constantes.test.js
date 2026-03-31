import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock de constantes
const INGREDIENTES = {
  MASA: 'masa',
  CERDO: 'cerdo',
  ARROZ: 'arroz',
  PAPA: 'papa',
  CHILE: 'chile'
};

const INGREDIENTE_NAMES = {
  [INGREDIENTES.MASA]: 'Masa de Maíz',
  [INGREDIENTES.CERDO]: 'Carne de Cerdo',
  [INGREDIENTES.ARROZ]: 'Arroz',
  [INGREDIENTES.PAPA]: 'Papa',
  [INGREDIENTES.CHILE]: 'Chile'
};

const CATEGORIA_INGREDIENTE = {
  historia: INGREDIENTES.MASA,
  matematicas: INGREDIENTES.CERDO,
  geografia: INGREDIENTES.ARROZ,
  ciencias: INGREDIENTES.PAPA
};

describe('Constantes del Sistema', () => {
  describe('INGREDIENTES', () => {
    it('debe tener todos los ingredientes definidos', () => {
      expect(INGREDIENTES).toHaveProperty('MASA');
      expect(INGREDIENTES).toHaveProperty('CERDO');
      expect(INGREDIENTES).toHaveProperty('ARROZ');
      expect(INGREDIENTES).toHaveProperty('PAPA');
      expect(INGREDIENTES).toHaveProperty('CHILE');
    });

    it('debe tener valores en minúsculas', () => {
      Object.values(INGREDIENTES).forEach(valor => {
        expect(valor).toBe(valor.toLowerCase());
      });
    });

    it('no debe tener duplicados', () => {
      const valores = Object.values(INGREDIENTES);
      const unicos = [...new Set(valores)];
      expect(valores.length).toBe(unicos.length);
    });
  });

  describe('INGREDIENTE_NAMES', () => {
    it('debe tener nombres para todos los ingredientes', () => {
      Object.values(INGREDIENTES).forEach(valor => {
        expect(INGREDIENTE_NAMES).toHaveProperty(valor);
      });
    });

    it('los nombres no deben estar vacíos', () => {
      Object.values(INGREDIENTE_NAMES).forEach(nombre => {
        expect(nombre).toBeTruthy();
        expect(nombre.length).toBeGreaterThan(0);
      });
    });
  });

  describe('CATEGORIA_INGREDIENTE', () => {
    it('debe mapear todas las categorías a ingredientes válidos', () => {
      const categoriasValidas = ['historia', 'matematicas', 'geografia', 'ciencias'];
      
      categoriasValidas.forEach(categoria => {
        expect(CATEGORIA_INGREDIENTE).toHaveProperty(categoria);
        expect(Object.values(INGREDIENTES)).toContain(CATEGORIA_INGREDIENTE[categoria]);
      });
    });

    it('no debe tener categorías duplicadas', () => {
      const categorias = Object.keys(CATEGORIA_INGREDIENTE);
      const unicas = [...new Set(categorias)];
      expect(categorias.length).toBe(unicas.length);
    });
  });

  describe('Consistencia entre constantes', () => {
    it('CATEGORIA_INGREDIENTE debe usar las mismas constantes que INGREDIENTES', () => {
      Object.values(CATEGORIA_INGREDIENTE).forEach(ingrediente => {
        expect(Object.values(INGREDIENTES)).toContain(ingrediente);
      });
    });

    it('INGREDIENTE_NAMES debe tener entrada para cada ingrediente', () => {
      Object.entries(INGREDIENTES).forEach(([clave, valor]) => {
        expect(INGREDIENTE_NAMES[valor]).toBeDefined();
      });
    });
  });
});

describe('Funciones Utilitarias de Ingredientes', () => {
  describe('Validación de Nacatamal', () => {
    const verificarNacatamal = (coins) => {
      return Object.values(INGREDIENTES).every(
        ing => (coins[ing] || 0) >= 1
      );
    };

    const contarNacatamales = (coins) => {
      return Math.min(
        ...Object.values(INGREDIENTES).map(ing => coins[ing] || 0)
      );
    };

    it('debe detectar nacatamal completo', () => {
      const coins = {
        [INGREDIENTES.MASA]: 1,
        [INGREDIENTES.CERDO]: 1,
        [INGREDIENTES.ARROZ]: 1,
        [INGREDIENTES.PAPA]: 1,
        [INGREDIENTES.CHILE]: 1
      };
      expect(verificarNacatamal(coins)).toBe(true);
    });

    it('debe detectar nacatamal incompleto', () => {
      const coins = {
        [INGREDIENTES.MASA]: 1,
        [INGREDIENTES.CERDO]: 1,
        [INGREDIENTES.ARROZ]: 0,
        [INGREDIENTES.PAPA]: 1,
        [INGREDIENTES.CHILE]: 1
      };
      expect(verificarNacatamal(coins)).toBe(false);
    });

    it('debe contar múltiples nacatamales', () => {
      const coins = {
        [INGREDIENTES.MASA]: 5,
        [INGREDIENTES.CERDO]: 3,
        [INGREDIENTES.ARROZ]: 5,
        [INGREDIENTES.PAPA]: 4,
        [INGREDIENTES.CHILE]: 2
      };
      expect(contarNacatamales(coins)).toBe(2);
    });

    it('debe manejar coins vacíos', () => {
      expect(verificarNacatamal({})).toBe(false);
      expect(contarNacatamales({})).toBe(0);
    });
  });

  describe('Mapeo Categoría a Ingrediente', () => {
    it('historia debe dar masa', () => {
      expect(CATEGORIA_INGREDIENTE.historia).toBe(INGREDIENTES.MASA);
    });

    it('matematicas debe dar cerdo', () => {
      expect(CATEGORIA_INGREDIENTE.matematicas).toBe(INGREDIENTES.CERDO);
    });

    it('geografia debe dar arroz', () => {
      expect(CATEGORIA_INGREDIENTE.geografia).toBe(INGREDIENTES.ARROZ);
    });

    it('ciencias debe dar papa', () => {
      expect(CATEGORIA_INGREDIENTE.ciencias).toBe(INGREDIENTES.PAPA);
    });
  });
});
