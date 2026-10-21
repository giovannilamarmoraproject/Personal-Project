/**
 * ==============================================================================
 * GESTIONE VOCI DI BUDGET
 * ==============================================================================
 */

async function deleteBudgetItem(id) {
  const item = appData.budget.find((b) => b.id === id);
  if (item && item.isDebito && item.debitoId) {
    return deleteDebito(item.debitoId);
  }
  const name = item ? `"${item.desc}"` : "questa voce";
  const result = await showConfirm(
    `Eliminare ${name}?`,
    "Questa azione rimuoverà definitivamente la voce dal budget.",
  );
  if (result.isConfirmed) {
    appData.budget = appData.budget.filter((b) => b.id !== id);
    saveDataLocally();
    showNotification("Voce di budget eliminata");
  }
}

/**
 * Popola un elemento <select> con l'elenco dei costi casa disponibili da collegare.
 * @param {HTMLSelectElement} selectEl - Menu a tendina.
 * @param {number[]} currentIds - Array degli ID dei costi già collegati (da escludere).
 */
