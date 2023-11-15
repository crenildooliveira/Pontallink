
document.addEventListener("DOMContentLoaded", function () {
    // Seletor para o ícone de notificações (atualize conforme necessário)
    const notificationsIcon = document.getElementById("notifications-button");

    // Seletor para a janela suspensa
    const notificationModal = document.getElementById("notification-modal");

    // Quando o ícone de notificações é clicado
    notificationsIcon.addEventListener("click", () => {
      // Exibe a janela suspensa
      notificationModal.style.display = "block";
    });
});
  