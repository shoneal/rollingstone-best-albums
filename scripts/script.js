import { data } from "https://shoneal.github.io/rollingstone/scripts/data.js";
import { allLinks } from "https://shoneal.github.io/rollingstone/scripts/links.js";
import {
  changingTheme,
  switchingStickinessHeader,
  textToSlug,
  kebabToCamel,
  showImage,
  getImagePath,
  debounce,
} from "https://shoneal.github.io/rollingstone/scripts/utils.js";
import {
  initBodyElements,
  getSectionContext,
  renderAuthorLinks,
  createNavigation,
  updateActiveLink,
  handleNavigationClick,
  initApp,
} from "https://shoneal.github.io/rollingstone/scripts/utils-for-lists.js";

const section = "albums"; // О чем сайт
const platforms = {
  apple: "Apple Music",
  spotify: "Spotify",
  yandex: "Yandex Music",
}; // Платформы для ссылок на альбомы
const bodyElements = initBodyElements(); // Элементы тела страницы
const { basicLink, currentData, dataLength } = getSectionContext(
  section,
  data,
  kebabToCamel,
); // Главная ссылка, данные по имени секции и длина объекта
const initializeHeaderImages = (data, container, caption) => {
  const elements = Object.entries(data)
    .filter(([, { photo }]) => photo)
    .map(([key]) => key);

  const randomElements = [];
  while (randomElements.length < 3) {
    const key = elements[Math.floor(Math.random() * elements.length)];
    if (!randomElements.includes(key)) randomElements.push(key);
  }

  let loaded = 0;
  const complete = () => ++loaded === 3 && (container.style.opacity = "1");
  const fragment = document.createDocumentFragment();

  for (const key of randomElements) {
    const { author } = data[key];
    const img = Object.assign(document.createElement("img"), {
      src: getImagePath(basicLink, "header/desktop", author),
      srcset: `${getImagePath(
        basicLink,
        "header/mobile",
        author,
      )} 300w, ${getImagePath(basicLink, "header/desktop", author)} 2400w`,
      sizes: "100vw",
      alt: author,
      onload: complete,
    });

    const wrapper = document.createElement("div");
    wrapper.appendChild(img);
    fragment.appendChild(wrapper);
  }

  container.appendChild(fragment);

  caption.textContent += `${randomElements
    .map((key) => data[key].author)
    .join(", ")}`;
}; // Создание картинки в шапке
const renderSlides = (object) => {
  const fragment = document.createDocumentFragment();

  Object.entries(object)
    .sort(([, a], [, b]) => b.place - a.place)
    .forEach(([key, data]) => {
      const clone = bodyElements.slideTemplate.content.cloneNode(true);

      const [slide, img, place, title, year, links] = [
        clone.querySelector(".slide"),
        clone.querySelector(".slide-figure"),
        clone.querySelector(".slide-number"),
        clone.querySelector(".slide-title"),
        clone.querySelector(".slide-subtitle"),
        clone.querySelector(".slide-music-players"),
      ];

      slide.dataset.slideId = data.place;

      const artistAndName = `${data.author} '${key}'`;

      img.style.opacity = "0";
      img.src = getImagePath(basicLink, "covers/872", key);
      img.srcset = `${getImagePath(
        basicLink,
        "covers/320",
        key,
      )} 320w, ${getImagePath(
        basicLink,
        "covers/640",
        key,
      )} 640w, ${getImagePath(basicLink, "covers/872", key)} 872w`;
      img.alt = artistAndName;
      showImage(img);

      place.textContent = data.place;
      title.textContent = artistAndName;
      year.textContent = data.year;

      const linksFragment = document.createDocumentFragment();
      Object.entries(data.links).forEach(([platform, url]) => {
        const link = document.createElement("a");
        link.href = url;
        link.target = "_blank";
        link.setAttribute("data-platform", platform);

        const logoTemplateId = `${platform}-logo`;
        const logoTemplate = document.getElementById(logoTemplateId);

        if (logoTemplate)
          link.appendChild(logoTemplate.content.cloneNode(true));

        const linkSpan = document.createElement("span");
        linkSpan.textContent = platforms[platform];
        link.appendChild(linkSpan);
        linksFragment.appendChild(link);
      });

      links.appendChild(linksFragment);
      fragment.appendChild(clone);
    });

  bodyElements.gallery.appendChild(fragment);
}; // Вывод элементов в структуру HTML
bodyElements.navigation.addEventListener("click", handleNavigationClick); // Обработчик кликов по навигации
document.addEventListener("DOMContentLoaded", () => {
  changingTheme(); // Смена темы
  switchingStickinessHeader(bodyElements.title, bodyElements.header); // Липкий выезжающий header

  initializeHeaderImages(
    currentData,
    bodyElements.headerImages,
    bodyElements.headerImagesCaption,
  ); // Создание картинки в шапке

  renderSlides(currentData); // Вывод элементов в структуру HTML

  initApp(
    bodyElements,
    dataLength,
    renderAuthorLinks,
    allLinks,
    createNavigation,
    updateActiveLink,
  ); // Общая для всех инициализация
}); // Изначальная инициализация
let ticking = false; // Задержка для скролла
window.addEventListener("scroll", () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      switchingStickinessHeader(bodyElements.title, bodyElements.header); // Липкий выезжающий header
      updateActiveLink(bodyElements.navigation); // Обновление навигации

      ticking = false;
    });
    ticking = true;
  }
}); // Обработчик скролла
window.addEventListener(
  "resize",
  debounce(() => {
    updateActiveLink(bodyElements.navigation); // Обновление навигации
  }, 100),
); // Обработчик ресайза
