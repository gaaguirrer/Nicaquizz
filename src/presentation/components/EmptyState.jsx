/**
 * EmptyState.jsx - Estado Vacío
 * 
 * Muestra cuando no hay datos.
 * Incluye: NoDataEmptyState, NoResultsEmptyState, NoFriendsEmptyState, etc.
 */

import Button from './Button';

export default function EmptyState({
  icon = 'inbox',
  iconColor = 'text-[#154212]/20',
  iconSize = 'text-6xl',
  title,
  description,
  action,
  secondaryAction,
  className = ''
}) {
  return (
    <div className={`text-center py-12 px-6 ${className}`}>
      {/* Icono */}
      <div className="mb-6">
        <span className={`material-symbols-outlined ${iconSize} ${iconColor}`}>
          {icon}
        </span>
      </div>
      
      {/* Título */}
      {title && (
        <h3 className="text-xl font-bold font-headline text-[#154212] mb-2">
          {title}
        </h3>
      )}
      
      {/* Descripción */}
      {description && (
        <p className="text-[#42493e]/60 mb-8 max-w-md mx-auto">
          {description}
        </p>
      )}
      
      {/* Acciones */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {action && (
          <Button
            onClick={action.onClick}
            variant={action.variant || 'primary'}
            size={action.size || 'md'}
            leftIcon={action.icon}
          >
            {action.label}
          </Button>
        )}
        {secondaryAction && (
          <Button
            onClick={secondaryAction.onClick}
            variant={secondaryAction.variant || 'outline'}
            size={secondaryAction.size || 'md'}
            leftIcon={secondaryAction.icon}
          >
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * EmptyState variantes predefinidas
 */

export function NoDataEmptyState({ onRefresh, loading = false }) {
  return (
    <EmptyState
      icon="data_off"
      title="Sin datos"
      description="No hay información disponible en este momento"
      action={{
        label: 'Recargar',
        onClick: onRefresh,
        icon: loading ? undefined : 'refresh',
        variant: 'primary'
      }}
    />
  );
}

export function NoResultsEmptyState({ onClearFilters }) {
  return (
    <EmptyState
      icon="search_off"
      title="Sin resultados"
      description="No encontramos resultados que coincidan con tu búsqueda"
      action={onClearFilters ? {
        label: 'Limpiar filtros',
        onClick: onClearFilters,
        icon: 'filter_alt_off',
        variant: 'outline'
      } : undefined}
    />
  );
}

export function NoFriendsEmptyState({ onFindFriends }) {
  return (
    <EmptyState
      icon="group_off"
      title="Sin amigos"
      description="Aún no has agregado amigos. ¡Busca y conecta con otros jugadores!"
      action={onFindFriends ? {
        label: 'Buscar amigos',
        onClick: onFindFriends,
        icon: 'person_add',
        variant: 'primary'
      } : undefined}
    />
  );
}

export function NoNotificationsEmptyState() {
  return (
    <EmptyState
      icon="notifications_none"
      title="Sin notificaciones"
      description="No tienes notificaciones nuevas en este momento"
    />
  );
}

export function NoChallengesEmptyState({ onCreateChallenge }) {
  return (
    <EmptyState
      icon="emoji_events_outlined"
      title="Sin retos"
      description="No hay retos disponibles. ¡Crea uno nuevo!"
      action={onCreateChallenge ? {
        label: 'Crear reto',
        onClick: onCreateChallenge,
        icon: 'add',
        variant: 'primary'
      } : undefined}
    />
  );
}
