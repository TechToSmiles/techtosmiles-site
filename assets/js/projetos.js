
/* ========================================
   CARROSSEL DE PROJETOS
======================================== */

(() => {

  // 1. Selecionando os elementos HTML

  const track = document.querySelector(".projects_track");
  const viewport = document.querySelector(".projects_viewport");
  const prev = document.querySelector(".projects_prev");
  const next = document.querySelector(".projects_next");
  const dots = document.querySelector(".projects_dots");

  if (!track || !viewport || !prev || !next || !dots) return;

  const cards = [...track.querySelectorAll(".project_card")];
  const total = cards.length;

  if (total === 0) return;

  // 2. Criando cópias para o loop infinito

  function cloneCard(card) {
    const clone = card.cloneNode(true);

    clone.setAttribute("aria-hidden", "true");
    clone.inert = true;

    return clone;
  }

  track.prepend(...cards.map(cloneCard));
  track.append(...cards.map(cloneCard));

  // 3. Controlando a posição

  let current = 0;
  let position = total;
  let animating = false;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  // 4. Calculando a largura de cada deslocamento

  function getStep() {
    const card = track.querySelector(".project_card");

    const width = card.getBoundingClientRect().width;
    const gap = parseFloat(getComputedStyle(track).gap) || 0;

    return width + gap;
  }

  // 5. Movimentando a faixa

  function render() {
    const distance = position * getStep();

    track.style.transform =
      `translate3d(-${distance}px, 0, 0)`;
  }

  function withoutTransition(callback) {
    track.style.transition = "none";

    callback();

    track.getBoundingClientRect();

    track.style.transition = "";
  }

  // 6. Criando os indicadores

  cards.forEach((card, index) => {
    const dot = document.createElement("button");

    dot.type = "button";
    dot.setAttribute(
      "aria-label",
      `Ir para o projeto ${index + 1}`
    );

    dot.addEventListener("click", () => goTo(index));

    dots.appendChild(dot);
  });

  function updateDots() {
    dots.querySelectorAll("button").forEach((dot, index) => {
      const active = index === current;

      dot.classList.toggle("active", active);
      dot.setAttribute("aria-current", String(active));
    });
  }

  // 7. Normalizando a posição depois da animação

  function finishMovement() {
    if (!animating) return;

    withoutTransition(() => {
      position = total + current;
      render();
    });

    animating = false;
  }

  // 8. Avançando ou voltando

  function move(direction) {
    if (animating || total <= 1) return;

    current = (current + direction % total + total) % total;
    position += direction;

    animating = true;

    render();
    updateDots();

    if (reducedMotion.matches) {
      finishMovement();
    }
  }

  // 9. Navegando pelos indicadores

  function goTo(index) {
    if (animating || index === current) return;

    const forward = (index - current + total) % total;
    const backward = forward - total;

    const distance =
      Math.abs(forward) <= Math.abs(backward)
        ? forward
        : backward;

    move(distance);
  }

  // 10. Eventos das setas

  next.addEventListener("click", () => move(1));
  prev.addEventListener("click", () => move(-1));

  // 11. Identificando o final da animação

  track.addEventListener("transitionend", (event) => {
    if (
      event.target === track &&
      event.propertyName === "transform"
    ) {
      finishMovement();
    }
  });

  // 12. Deslizamento no celular

  let startX = 0;
  let startY = 0;

  viewport.addEventListener("touchstart", (event) => {
    if (event.touches.length !== 1) return;

    startX = event.touches[0].clientX;
    startY = event.touches[0].clientY;
  }, { passive: true });

  viewport.addEventListener("touchend", (event) => {
    const touch = event.changedTouches[0];

    if (!touch) return;

    const deltaX = startX - touch.clientX;
    const deltaY = startY - touch.clientY;

    if (
      Math.abs(deltaX) > 50 &&
      Math.abs(deltaX) > Math.abs(deltaY) * 1.2
    ) {
      move(deltaX > 0 ? 1 : -1);
    }
  }, { passive: true });

  // 13. Recalculando ao redimensionar a tela

  window.addEventListener("resize", () => {
    animating = false;
    position = total + current;

    withoutTransition(render);
  });

  // 14. Inicialização

  withoutTransition(render);
  updateDots();

})();


/* ========================================
   MODAL DE PROJETOS
======================================== */

(() => {

  const projectData = {
    gestao: {
      description:
        "Sistema desenvolvido para organizar processos, " +
        "finanças e operações empresariais.",

      features: [
        "Gestão de processos",
        "Controle financeiro",
        "Relatórios gerenciais"
      ]
    },

    servicos: {
      description:
        "Aplicativo para conectar clientes e " +
        "prestadores de serviços.",

      features: [
        "Cadastro de profissionais",
        "Busca de serviços",
        "Agendamentos"
      ]
    },

    loja: {
      description:
        "Plataforma de comércio eletrônico para " +
        "apresentação e venda de produtos.",

      features: [
        "Catálogo de produtos",
        "Carrinho de compras",
        "Gestão de pedidos"
      ]
    },

    agendamentos: {
      description:
        "Sistema para organizar horários, " +
        "clientes e atendimentos.",

      features: [
        "Controle de horários",
        "Cadastro de clientes",
        "Histórico de atendimentos"
      ]
    },

    institucional: {
      description:
        "Página demonstrativa para apresentar marca, " +
        "serviços e canais de contato.",

      features: [
        "Apresentação dos serviços",
        "Design responsivo",
        "Chamadas para ação"
      ]
    }
  };

  const modal = document.querySelector("#project-modal");
  const track = document.querySelector(".projects_track");

  if (!modal || !track) return;

  const closeButton = modal.querySelector(
    ".project-modal__close"
  );

  const modalImage = modal.querySelector("#modal-image");
  const modalTitle = modal.querySelector("#modal-title");
  const modalCategory = modal.querySelector("#modal-category");
  const modalDescription = modal.querySelector("#modal-description");
  const modalFeatures = modal.querySelector("#modal-features");
  const modalNote = modal.querySelector("#modal-note");
  const modalCta = modal.querySelector(".project-modal__cta");

  track.addEventListener("click", (event) => {

    const button = event.target.closest(
      "button[data-project]"
    );

    if (!button) return;

    const id = button.dataset.project;
    const data = projectData[id];

    if (!data) return;

    const card = button.closest(".project_card");

    const image = card.querySelector("img");
    const title = card.querySelector("h3");
    const category = card.querySelector(".project_info > span");

    // Preenchendo os dados

    modalImage.src = image.currentSrc || image.src;
    modalImage.alt = image.alt;

    modalTitle.textContent = title.textContent;
    modalCategory.textContent = category.textContent;
    modalDescription.textContent = data.description;

    // Funcionalidades

    modalFeatures.replaceChildren();

    data.features.forEach(feature => {
      const li = document.createElement("li");
      li.textContent = feature;
      modalFeatures.appendChild(li);
    });

    modalNote.textContent =
      "As informações apresentadas são demonstrativas. " +
      "Substitua pelos dados reais do projeto antes de publicar.";

    // Abrindo o modal

    modal.showModal();
    document.body.classList.add("modal-open");

  });

  // Fechar pelo X

  closeButton.addEventListener("click", () => {
    modal.close();
  });

  // Fechar clicando fora

  modal.addEventListener("click", (event) => {

    const rect = modal.getBoundingClientRect();

    const outside =
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom;

    if (outside) {
      modal.close();
    }

  });

  // Botão de contato

  modalCta.addEventListener("click", (event) => {
    event.preventDefault();

    modal.close();

    document.querySelector("#contato")?.scrollIntoView({
      behavior: "smooth"
    });
  });

  // Restaurar a rolagem ao fechar

  modal.addEventListener("close", () => {
    document.body.classList.remove("modal-open");
  });

})();
