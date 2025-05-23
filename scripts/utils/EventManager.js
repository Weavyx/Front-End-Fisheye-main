/*
 * EventManager.js
 * Gestionnaire d'événements pour l'application.
 * Gère les interactions utilisateur et la communication entre le modèle et la vue.
 */
export class EventManager {
  /**
   * Crée une instance de EventManager.
   *
   * @param {Controller} controller - L'instance du contrôleur.
   * @param {View} view - L'instance de la vue.
   */
  constructor() {
    if (EventManager.instance) {
      return EventManager.instance;
    }
    this.controller = null;
    this.view = null;
    EventManager.instance = this;
  }

  /**
   * Ajoute un gestionnaire d'événements générique.
   *
   * @param {HTMLElement} element - L'élément cible.
   * @param {string} eventType - Le type d'événement (par ex. "click", "keydown").
   * @param {Function} callback - La fonction à exécuter lors de l'événement.
   */
  addEvent(element, eventType, callback) {
    element.addEventListener(eventType, callback);
  }

  /**
   * Ajoute un gestionnaire d'événements personnalisé.
   *
   * @param {string} eventName - Le nom de l'événement.
   * @param {Function} callback - La fonction à exécuter lorsque l'événement est déclenché.
   */
  on(eventName, callback) {
    if (!this.events) {
      this.events = {};
    }
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);
  }

  /**
   * Déclenche un événement personnalisé.
   *
   * @param {string} eventName - Le nom de l'événement.
   * @param {any} data - Les données à transmettre aux gestionnaires d'événements.
   */
  trigger(eventName, data) {
    if (this.events && this.events[eventName]) {
      this.events[eventName].forEach((callback) => callback(data));
    }
  }

  /**
   * Attache les événements de tri au menu déroulant.
   *
   * @param {Array} media - La liste des médias à trier.
   * @param {Object} photographer - Les informations du photographe.
   * @returns {void}
   */
  attachSortEvent(media, photographer) {
    const customSort = document.querySelector("#custom-sort");
    if (!customSort) {
      console.error("Élément #custom-sort introuvable.");
      return;
    }

    const button = customSort.querySelector(".custom-sort__button");
    const buttonText = button.querySelector(".custom-sort__button-text");
    const optionsContainer = customSort.querySelector(".custom-sort__options");
    const options = Array.from(
      optionsContainer.querySelectorAll(".custom-sort__option")
    );

    // Applique inert au chargement de la page
    optionsContainer.setAttribute("inert", "");

    // Fonction utilitaire pour mettre à jour les options visibles
    const updateVisibleOptions = (selectedOption) => {
      options.forEach((option) => {
        option.style.display = option === selectedOption ? "none" : "block";
      });
    };

    // Fonction utilitaire pour gérer la sélection
    const handleSelection = (selectedOption) => {
      options.forEach((option) => option.classList.remove("selected"));
      selectedOption.classList.add("selected");

      if (buttonText) {
        buttonText.textContent = selectedOption.textContent;
      }

      updateVisibleOptions(selectedOption);

      const selectedValue = selectedOption.getAttribute("data-value");
      const sortedMedia = this.controller.model.sortMediaByCriteria(
        media,
        selectedValue
      );
      this.view.displayPhotographerMedia(sortedMedia, photographer);

      document
        .querySelector(".photographer-work__container :nth-child(1) .media")
        .focus(); // Met le focus sur le premier média après le tri

      toggleDropdown(false); // Ferme le menu après la sélection
    };

    // Fonction utilitaire pour basculer l'état du menu déroulant
    const toggleDropdown = (forceState) => {
      const isExpanded = button.getAttribute("aria-expanded") === "true";
      const newState = forceState !== undefined ? forceState : !isExpanded;

      button.setAttribute("aria-expanded", newState);
      optionsContainer.setAttribute("aria-hidden", !newState);

      // Active ou désactive inert et gère le focus
      if (newState) {
        optionsContainer.removeAttribute("inert");
        options.forEach((option) => option.setAttribute("tabindex", "0")); // Rendre les options focusables
      } else {
        optionsContainer.setAttribute("inert", "");
        options.forEach((option) => option.setAttribute("tabindex", "-1")); // Empêcher le focus sur les options
      }
    };

    // Initialisation : Marquer l'option présélectionnée et cacher les autres
    const initializeOptions = () => {
      const defaultOption = options.find(
        (option) => option.getAttribute("data-value") === "popularite"
      );
      if (defaultOption) {
        defaultOption.classList.add("selected");
        if (buttonText) {
          buttonText.textContent = defaultOption.textContent;
        }
        updateVisibleOptions(defaultOption);
      }
    };

    // Ajout des événements
    this.addEvent(button, "click", () => {
      toggleDropdown();
    });

    this.addEvent(button, "keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleDropdown();
      }
    });

    options.forEach((option) => {
      this.addEvent(option, "click", () => handleSelection(option));
      this.addEvent(option, "keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleSelection(option);
        }
      });
    });

    this.addEvent(document, "click", (event) => {
      if (!customSort.contains(event.target)) {
        toggleDropdown(false);
      }
    });

    initializeOptions(); // Appel de l'initialisation
  }

  /**
   * Attache les événements de la modale de contact.
   *
   * @returns {void}
   * */
  attachModalEvents() {
    const modal = document.getElementById("contact_modal");
    if (!modal) {
      console.error("Modale de contact introuvable.");
      return;
    }
    const closeButton = modal.querySelector(".contact-modal__close-button");
    const contactForm = document.getElementById("contact_form");
    const contactButton = document.querySelector(
      ".photographer-header__contact-button"
    );

    if (!closeButton || !contactForm || !contactButton) {
      console.log(closeButton, contactForm, contactButton);
      console.error("Éléments de la modale de contact manquants.");
      return;
    }

    this.addEvent(closeButton, "click", (e) => {
      e.stopPropagation(); // Empêche la propagation de l'événement
      e.preventDefault(); // Empêche le comportement par défaut
      this.view.hideContactModal();
    });

    this.addEvent(window, "keydown", (event) => {
      if (event.key === "Escape" && modal.style.display === "flex") {
        event.stopPropagation(); // Empêche la propagation de l'événement
        event.preventDefault(); // Empêche le comportement par défaut
        this.view.hideContactModal();
      } else if (
        event.key === "Enter" &&
        closeButton === document.activeElement
      ) {
        event.stopPropagation(); // Empêche la propagation de l'événement
        event.preventDefault(); // Empêche le comportement par défaut
        this.view.hideContactModal();
      }
    });

    this.addEvent(contactForm, "submit", (event) => {
      const formData = new FormData(contactForm);
      const formValues = Object.fromEntries(formData.entries());
      console.log("Formulaire soumis :", formValues);
      event.stopPropagation(); // Empêche la propagation de l'événement
      event.preventDefault(); // Empêche le comportement par défaut
      this.view.hideContactModal();
    });
  }

  /**
   * Attache les événements de la lightbox.
   *
   * @returns {void}
   * */
  attachLightboxEvents() {
    const lightbox = document.getElementById("lightbox");
    if (!lightbox) {
      console.error("Lightbox introuvable dans le DOM.");
      return;
    }

    // Ajout des événements pour la lightbox
    this.addEvent(lightbox.querySelector(".lightbox__close"), "click", () => {
      this.trigger("closeLightbox");
    });

    this.addEvent(lightbox.querySelector(".lightbox__prev"), "click", () => {
      this.trigger("showPreviousMedia");
    });

    this.addEvent(lightbox.querySelector(".lightbox__next"), "click", () => {
      this.trigger("showNextMedia");
    });

    this.addEvent(lightbox, "keydown", (event) => {
      switch (event.key) {
        case "Escape":
          this.trigger("closeLightbox");
          break;
        case "ArrowRight":
          this.trigger("showNextMedia");
          break;
        case "ArrowLeft":
          this.trigger("showPreviousMedia");
          break;
      }
    });
  }

  /**
   * Ouvre la lightbox pour afficher un média.
   *
   * @param {Object} mediaData - Les données du média à afficher.
   * @returns {void}
   */
  openMediaLightbox(mediaData) {
    // Vérifier si la lightbox existe déjà dans le DOM
    let lightbox = document.getElementById("lightbox");

    if (!lightbox) {
      console.error("Lightbox introuvable dans le DOM.");
      return;
    }

    if (
      !this.controller.model.mediaList ||
      this.controller.model.mediaList.length === 0
    ) {
      console.error("La liste des médias n'est pas définie ou vide.");
      return;
    }

    // Afficher le média dans la lightbox
    this.view.renderLightboxMedia(mediaData);

    this.currentMediaIndex = this.controller.model.mediaList.findIndex(
      (media) => media.id === mediaData.id
    ); // Mettre à jour l'index du média actuel
  }

  /**
   * Ferme la lightbox.
   *
   * @returns {void}
   */
  closeMediaLightbox() {
    const lightbox = document.getElementById("lightbox");

    if (!lightbox) {
      console.error("Lightbox introuvable dans le DOM. ");
      return;
    }

    // Mettre le focus sur le .photographer-work__container[this.currentMediaIndex]
    document
      .querySelector(
        ".photographer-work__container :nth-child(" +
          (this.currentMediaIndex + 1) +
          ") .media"
      )
      .focus(); // Met le focus sur le média actuel

    // Masquer la lightbox
    lightbox.setAttribute("aria-hidden", "true"); // Met à jour l'attribut aria-hidden
    lightbox.style.display = "none";
    lightbox.setAttribute("inert", ""); // Ajoute l'attribut inert pour désactiver la lightbox
  }

  /**
   * Gère les événements pour les médias (clic et touche Entrée).
   *
   * @param {HTMLElement} mediaElement - L'élément HTML du média.
   * @param {Function} openLightbox - La fonction pour ouvrir la lightbox.
   */
  attachMediaEvents(mediaElement, openLightbox) {
    mediaElement.setAttribute("tabindex", "0"); // Assure que l'élément est focusable

    this.addEvent(mediaElement, "click", openLightbox);

    this.addEvent(mediaElement, "keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        console.log("Touche Entrée ou Espace pressée sur le média.");
        // Ajout de la touche Espace
        event.preventDefault(); // Empêche le comportement par défaut de la touche
        openLightbox();
      }
    });
  }

  /**
   * Affiche le média suivant dans la lightbox.
   *
   * @returns {void}
   */
  showNextMedia() {
    if (
      this.currentMediaIndex === undefined ||
      this.controller.model.mediaList.length === 0
    ) {
      return;
    }

    // Calculer l'index du média suivant
    this.currentMediaIndex =
      (this.currentMediaIndex + 1) % this.controller.model.mediaList.length;

    // Afficher le média suivant
    const nextMedia = this.controller.model.mediaList[this.currentMediaIndex];
    this.view.renderLightboxMedia(nextMedia);
  }

  /**
   * Affiche le média précédent dans la lightbox.
   *
   * @returns {void}
   */
  showPreviousMedia() {
    if (
      this.currentMediaIndex === undefined ||
      this.controller.model.mediaList.length === 0
    ) {
      return;
    }

    // Calculer l'index du média précédent
    this.currentMediaIndex =
      (this.currentMediaIndex - 1 + this.controller.model.mediaList.length) %
      this.controller.model.mediaList.length;

    // Afficher le média précédent
    const prevMedia = this.controller.model.mediaList[this.currentMediaIndex];
    this.view.renderLightboxMedia(prevMedia);
  }

  /**
   * Gère l'événement de like sur un média.
   *
   * @param {Object} data - Les données transmises par l'événement.
   * @returns {void}
   */
  handleLikeMedia(data) {
    const { mediaCard } = data;
    const mediaId = mediaCard.dataset.id;

    const medium = this.controller.model.mediaList.find(
      (media) => media.id === parseInt(mediaId)
    );
    if (!medium) {
      console.error("Média introuvable pour l'ID :", mediaId);
      return;
    }

    const photographer = this.model.photographers.find(
      (p) => p.id === medium.photographerId
    );
    if (!photographer) {
      console.error(
        "Photographe introuvable pour l'ID :",
        medium.photographerId
      );
      return;
    }

    this.model.toggleMediaLike(medium, photographer);

    const mediaLikesContainer = mediaCard.querySelector(".media__likes");
    const totalLikesContainer = document.querySelector(
      ".photographer__total-likes"
    );

    this.view.updateLikesDisplay(
      mediaLikesContainer,
      medium.likes,
      totalLikesContainer,
      photographer.totalLikes
    );
  }

  /**
   * Gère l'événement de basculement des likes pour un média.
   *
   * @param {Object} data - Les données contenant le média, le conteneur des likes et l'icône de cœur.
   */
  handleToggleLike(data) {
    const { medium, mediaLikesContainer, heartIcon, photographer } = data;

    // Déléguer la gestion des likes au modèle
    this.controller.model.toggleMediaLike(medium, photographer);

    // Mettre à jour l'affichage des likes
    const totalLikesContainer = document.querySelector(
      ".sticky-info-box__total-likes"
    );
    if (!totalLikesContainer) {
      console.error("Élément .total-likes introuvable dans le DOM.");
      return;
    }

    this.view.updateLikesDisplay(
      mediaLikesContainer,
      medium.likes,
      totalLikesContainer,
      photographer.totalLikes
    );

    // Ajouter une animation à l'icône de cœur
    if (medium.isLiked) {
      heartIcon.classList.add("liked");
    } else {
      heartIcon.classList.remove("liked");
    }
  }
}
