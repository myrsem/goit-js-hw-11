import './styles.css';
import Notiflix from 'notiflix';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const input = document.querySelector('.search-input');
const form = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more-btn');

const MY_API_KEY = '29225350-3af2603c162c678e18c25e7ab';
let pageforBtn = 1;
let valueInput = '';
let totalHitsValue = '';

const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
  close: false,
});

form.addEventListener('submit', onSubmit);
loadMoreBtn.addEventListener('click', onClick);

function onSubmit(e) {
  e.preventDefault();
  gallery.innerHTML = '';
  valueInput = e.currentTarget.elements.searchQuery.value.trim();
  if (!loadMoreBtn.classList.contains('is-hidden')) {
    loadMoreBtn.classList.add('is-hidden');
  }
  if (valueInput === '') {
    Notiflix.Notify.failure('Enter a query');
  } else {
    pageforBtn = 1;

    getUser(valueInput).then(() => {
      if (totalHitsValue > 0) {
        Notiflix.Notify.success(`Hooray! We found ${totalHitsValue} images.`);
      }
      pageforBtn += 1;
      lightbox.refresh();
      input.value = '';
    });
  }
}

async function getUser(q) {
  try {
    const response = await axios.get(
      `https://pixabay.com/api/?key=${MY_API_KEY}&q=${q}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${pageforBtn}`
    );
    if (response.data.hits.length === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }
    let arr = response.data.hits;
    let lastPage = Math.ceil(response.data.totalHits / 40);
    totalHitsValue = response.data.totalHits;

    makeListCountries(arr);

    if (response.data.total > 40) {
      loadMoreBtn.classList.remove('is-hidden');
    }
    if (pageforBtn === lastPage) {
      if (!loadMoreBtn.classList.contains('is-hidden')) {
        loadMoreBtn.classList.add('is-hidden');
      }
      if (response.data.total <= 40) {
        return;
      }
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
    }
  } catch (error) {
    console.error(error);
  }
}

function makeListCountries(data) {
  const markup = makeHtmlListCard(data);
  gallery.insertAdjacentHTML('beforeend', markup);
}

function makeHtmlListCard(data) {
  return data
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
        `<div class="photo-card">
  <a class="gallery-link" href="${largeImageURL}"> 
  <img class="gallery-img" src="${webformatURL}" alt="${tags}" loading="lazy"/>
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
  </a>
</div>`
    )
    .join('');
}

function onClick(e) {
  e.preventDefault();
  getUser(valueInput).then(() => {
    pageforBtn += 1;
    lightbox.refresh();
    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();
    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
  });
}
