import { data } from "https://shoneal.github.io/rollingstone/scripts/data.js";
import {
  listsLinks,
  coversLinks,
} from "https://shoneal.github.io/rollingstone/scripts/links.js";
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
  createResponsiveImage,
  initializeHeaderImages,
  renderLastArticlesAndDate,
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
  bodyElements.url,
  section,
  data,
  kebabToCamel,
); // Главная ссылка, данные по имени секции и длина объекта
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

      const { src, srcset } = createResponsiveImage(
        basicLink,
        key,
        "covers",
        872,
        [320, 640, 872],
      );

      img.style.opacity = "0";
      img.src = src;
      img.srcset = srcset;
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
  document.body.classList.add(section); // Название секции классом для body
  changingTheme(); // Смена темы
  switchingStickinessHeader(bodyElements.title, bodyElements.header); // Липкий выезжающий header

  initializeHeaderImages(
  getImagePath,
    basicLink,
    currentData,
    bodyElements.headerImages,
    bodyElements.headerImagesCaption,
    {
      getKey: (item) => item.author,
      filterFn: (item) => item.photo,
    },
  ); // Создание картинки в шапке

  renderSlides(currentData); // Вывод элементов в структуру HTML

  initApp(
    bodyElements,
    dataLength,
    renderLastArticlesAndDate,
    coversLinks,
    listsLinks,
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
