import { BRAND_WORLD } from './data.js';

/** Render the supporting brand artwork that sits outside the product catalogue. */
export function initBrandWorld() {
  const grid = document.getElementById('rangeGrid');
  if (!grid) return;

  BRAND_WORLD.forEach((item) => {
    const figure = document.createElement('figure');
    figure.id = item.id;
    figure.className = `range__item ${item.className || ''}`;
    figure.innerHTML = `
      <div class="range__media">
        <img src="${item.src}" alt="${item.title}" loading="lazy" decoding="async" />
      </div>
      <figcaption>
        <h3>${item.title}</h3>
        <p>${item.note}</p>
      </figcaption>`;
    grid.appendChild(figure);
  });
}
