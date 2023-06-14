import './css/styles.css';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
// Додатковий імпорт стилів SimpleLightbox
import 'simplelightbox/dist/simple-lightbox.min.css';
import { PixabayApiService } from './js/pixabay-api';

const refs = {
  searchForm: document.querySelector('.search-form'),
  searchBtn: document.querySelector('.search-btn'),
  loadMoreBtn: document.querySelector('.load-more'),
  gallery: document.querySelector('.gallery'),
};

const pixabayApiService = new PixabayApiService();

const simpleLightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

loadMoreBtnHidden();

refs.searchForm.addEventListener('submit', handleSearch);
refs.loadMoreBtn.addEventListener('click', handleLoadMore);

async function handleSearch(event) {
  event.preventDefault();

  const searchValue = event.target.elements.searchQuery.value.trim();

  if (!searchValue) {
    Notiflix.Notify.info('Please input your request!');
    return;
  }

  pixabayApiService.resetPage();
  pixabayApiService.setSearchValue(searchValue);

  try {
    const {
      data: { hits, totalHits },
    } = await pixabayApiService.getImages();

    if (!hits.length) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      refs.gallery.innerHTML = '';
      return loadMoreBtnHidden();
    }

    pixabayApiService.setTotalHits(totalHits);

    Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);

    const normalizedHits = getNormalizedImages(hits);
    const imagesMarkup = getImagesMarkup(normalizedHits);
    console.log(hits);

    refs.gallery.innerHTML = imagesMarkup;

    pixabayApiService.checkLastPage() ? loadMoreBtnHidden() : loadMoreBtnShow();
  } catch (error) {
    console.log(error);
  }
}

async function handleLoadMore() {
  pixabayApiService.incrementPage();
  try {
    const {
      data: { hits },
    } = await pixabayApiService.getImages();
    const markup = getImagesMarkup(getNormalizedImages(hits));
    refs.gallery.insertAdjacentHTML('beforeend', markup);
    simpleLightbox.refresh();
    pixabayApiService.checkLastPage() ? loadMoreBtnHidden() : loadMoreBtnShow();
  } catch (error) {
    console.log(error.message);
  }
}

function loadMoreBtnHidden() {
  refs.loadMoreBtn.style.display = 'none';
}
function loadMoreBtnShow() {
  refs.loadMoreBtn.style.display = 'block';
}

function getNormalizedImages(array) {
  return array.map(({ webformatURL, likes, views, comments, downloads }) => ({
    webformatURL,
    likes,
    views,
    comments,
    downloads,
  }));
}

function getImagesMarkup(array) {
  return array
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) =>
        `<a class="gallery-item" href="${largeImageURL}">
            <div class="photo-card">
              <img class="img-item" src="${webformatURL}" alt="${tags}" loading="lazy" />
              <div class="info">
                <p class="info-item">
                  <b>Likes</b>${likes}
                </p>
                <p class="info-item">
                  <b>Views</b>${views}
                </p>
                <p class="info-item">
                  <b>Comments</b>${comments}
                </p>
                <p class="info-item">
                  <b>Downloads</b>${downloads}
                </p>
              </div>
            </div>
          </a>`
    )
    .join('');
}

// import './css/styles.css';
// import Notiflix from 'notiflix';
// import SimpleLightbox from "simplelightbox";
// // Додатковий імпорт стилів SimpleLightbox
// import 'simplelightbox/dist/simple-lightbox.min.css';
// import PixabayApiService from './js/pixabay-api';

// const refs = {
//   searchForm: document.querySelector('#search-form'),
//   divGallery: document.querySelector('.gallery'),
//   loadMoreBtn: document.querySelector('.load-more'),
// };
// refs.loadMoreBtn.classList.add('is-hidden');

// const pixabayApiService = new PixabayApiService();

// const simpleLightbox = new SimpleLightbox('.gallery a', {
//   captionsData: 'alt',
//   // captionPosition:	"bottom", // Default
//   captionDelay: 250,
// });

// refs.searchForm.addEventListener('submit', handleSearch);
// refs.loadMoreBtn.addEventListener('click', handleLoadMore);

// async function handleSearch(e) {
//   e.preventDefault();
//   pixabayApiService.query = e.currentTarget.elements.searchQuery.value.trim(); // Виклик сеттера PixabayApiService
//   if (pixabayApiService.query === '') {
//     return Notiflix.Notify.warning('Enter text to search the gallery.');
//   }

//   refs.loadMoreBtn.classList.remove('is-hidden');
//   pixabayApiService.resetPage();

//   try {
//     const hits = await pixabayApiService.fetchImages();
//     clearGalleryContainer();
//     appendImagesMarkup(hits);
//   } catch (error) {
//     console.log(error);
//   }
// }

// async function handleLoadMore() {
//   try {
//     const hits = await pixabayApiService.fetchImages();
//     appendImagesMarkup(hits);
//     smoothScroll();
//   } catch (error) {
//     console.log(error);
//   }
// }

// function appendImagesMarkup(hits) {
//   const imagesMarkup = hits
//     .map(
//       ({
//         webformatURL,
//         largeImageURL,
//         tags,
//         likes,
//         views,
//         comments,
//         downloads,
//       }) =>
//         `<a class="gallery-item" href="${largeImageURL}">
//         <div class="photo-card">
//           <img class="img-item" src="${webformatURL}" alt="${tags}" loading="lazy" />
//           <div class="info">
//             <p class="info-item">
//               <b>Likes</b>${likes}
//             </p>
//             <p class="info-item">
//               <b>Views</b>${views}
//             </p>
//             <p class="info-item">
//               <b>Comments</b>${comments}
//             </p>
//             <p class="info-item">
//               <b>Downloads</b>${downloads}
//             </p>
//           </div>
//         </div>
//       </a>`
//     )
//     .join('');

//   refs.divGallery.insertAdjacentHTML('beforeend', imagesMarkup);

//   simpleLightbox.refresh();

//   if (hits.length < pixabayApiService.per_page) {
//     refs.loadMoreBtn.classList.add('is-hidden');
//     Notiflix.Notify.info(
//       "We're sorry, but you've reached the end of search results."
//     );
//   }
// }

// function clearGalleryContainer() {
//   refs.divGallery.innerHTML = '';
// }

// function smoothScroll() {
//   const { height: cardHeight } = document
//     .querySelector('.gallery')
//     .firstElementChild.getBoundingClientRect();

//   window.scrollBy({
//     top: cardHeight * 2,
//     behavior: 'smooth',
//   });
// }
