document.addEventListener('DOMContentLoaded', () => {
const carrossel = document.querySelector('.carrossel');
const btnPrev = document.getElementById('prev');
const btnNext = document.getElementById('next');

btnPrev.addEventListener('click', () => {
  carrossel.scrollBy({ left: -200, behavior: 'smooth' });
});

btnNext.addEventListener('click', () => {
  carrossel.scrollBy({ left: 200, behavior: 'smooth' });
});
});