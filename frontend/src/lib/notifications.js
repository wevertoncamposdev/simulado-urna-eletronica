// Fonte única das notificações do menu do usuário (ver AppLayout). Cada notificação
// é { id, message, to } — novas regras entram aqui, sem precisar tocar no layout.
export function getNotifications(user) {
  const notifications = [];

  if (user && !user.institutionProfileComplete) {
    notifications.push({
      id: 'institution-profile',
      message: 'Complete o perfil da instituição.',
      to: '/perfil',
    });
  }

  return notifications;
}
