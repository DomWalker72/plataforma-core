const dialog = document.querySelector("#agent");
const menu = document.querySelector(".menu");
const nav = document.querySelector("#navigation");
const toast = document.querySelector(".toast");

document.querySelectorAll("[data-open-agent]").forEach((button) => button.addEventListener("click", () => dialog.showModal()));
document.querySelector(".close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
menu.addEventListener("click", () => {
  const open = menu.getAttribute("aria-expanded") === "true";
  menu.setAttribute("aria-expanded", String(!open)); nav.classList.toggle("open", !open);
});

document.querySelector(".question-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = event.currentTarget.elements.question;
  const conversation = document.querySelector(".conversation");
  const question = document.createElement("div"); question.className = "message visitor"; question.textContent = input.value;
  const answer = document.createElement("div"); answer.className = "message system";
  answer.textContent = "Não encontrei essa informação na base oficial disponível. Vou registrar sua solicitação para que a equipe responsável responda com segurança.";
  conversation.append(question, answer); input.value = ""; conversation.scrollTop = conversation.scrollHeight;
  toast.textContent = "Solicitação preparada. O contato será pedido com consentimento na próxima etapa."; toast.classList.add("visible");
  setTimeout(() => toast.classList.remove("visible"), 4200);
});

document.querySelector("[data-tour]").addEventListener("click", () => {
  toast.textContent = "1. Envie o documento  2. Revise diferenças  3. Aprove a versão vigente"; toast.classList.add("visible");
  setTimeout(() => toast.classList.remove("visible"), 5000);
});
