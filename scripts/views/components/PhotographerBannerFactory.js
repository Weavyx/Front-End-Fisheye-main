export function createPhotographerBanner(photographer) {
  const { name, city, country, tagline, portrait } = photographer;
  const bannerElement = document.createElement("div");
  bannerElement.classList.add("photograph-header");

  const picturePath = `assets/photographers/${portrait}`;

  bannerElement.innerHTML = `
    <div class="photograph-header__left" aria-labelledby="photographer-name" aria-describedby="photographer-location photographer-tagline">
      <h1 id="photographer-name" class="photograph-header__name" tabindex="0">${name}</h1>
      <p id="photographer-location" class="photograph-header__location" tabindex="0">${city}, ${country}</p>
      <p id="photographer-tagline" class="photograph-header__tagline" tabindex="0">${tagline}</p>
    </div>
    <button class="photograph-header__contact-button" aria-label="Contactez le photographe ${name}" tabindex="0">Contactez-moi</button>
    <div class="photograph-header__right" id="photographer-description">
      <img src="${picturePath}" alt="Portrait de ${name}" aria-describedby="photographer-description" tabindex="0" />
    </div>
  `;

  return bannerElement;
}
