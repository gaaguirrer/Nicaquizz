/**
 * IngredientIcon - Componente para iconos de ingredientes
 * Usa SVGs personalizados en lugar de Material Icons
 * 
 * @param {string} type - Tipo de ingrediente: 'masa', 'cerdo', 'arroz', 'papa', 'chile', 'achiote'
 * @param {string} className - Clases CSS adicionales
 * @param {number} size - Tamaño del icono (default: 24)
 */
export default function IngredientIcon({ type, className = '', size = 24 }) {
  const iconPath = `/icons/ingredientes/${type}.svg`;
  
  return (
    <img
      src={iconPath}
      alt={type}
      className={className}
      style={{ width: size, height: size }}
      loading="lazy"
    />
  );
}
