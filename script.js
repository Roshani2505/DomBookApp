const IMAGE_URL = "https://m.media-amazon.com/images/I/71ZB18P3inL._SY522_.jpg";

let books = [];
let sortAsc = true;

const addBookForm = document.getElementById('addBookForm');
const titleInput = document.getElementById('title');
const authorInput = document.getElementById('author');
const categoryInput = document.getElementById('category');
const booksGrid = document.getElementById('booksGrid');
const sortBtn = document.getElementById('sortBtn');
const filterSelect = document.getElementById('filterSelect');
const clearAllBtn = document.getElementById('clearAll');

function createBookObject(title, author, category){
  return { title: title.trim(), author: author.trim(), category, imageUrl: IMAGE_URL };
}

function encodeBooks(){
  return books
    .map(b => `${b.title}|||${b.author}|||${b.category}|||${b.imageUrl}`)
    .join("$$$");
}

function decodeBooks(str){
  if(!str) return [];
  return str.split("$$$").map(item => {
    const parts = item.split("|||");
    return {
      title: parts[0],
      author: parts[1],
      category: parts[2],
      imageUrl: parts[3]
    };
  });
}

function saveToLocal(){
  localStorage.setItem('domBooks', encodeBooks());
}

function loadFromLocal(){
  const raw = localStorage.getItem('domBooks');
  books = decodeBooks(raw);
}

function renderBooks(){
  const filter = filterSelect.value;
  let toRender = books.slice();

  toRender.sort((a,b)=>{
    const tA = a.title.toLowerCase();
    const tB = b.title.toLowerCase();
    if(tA < tB) return sortAsc ? -1 : 1;
    if(tA > tB) return sortAsc ? 1 : -1;
    return 0;
  });

  if(filter !== 'All'){
    toRender = toRender.filter(b => b.category === filter);
  }

  booksGrid.innerHTML = '';
  if(toRender.length === 0){
    booksGrid.innerHTML = `<div class="card empty">No books to show.</div>`;
    return;
  }

  toRender.forEach((book) =>{
    const card = document.createElement('div');
    card.className = 'card card-book';

    card.innerHTML = `
      <img class="book-img" src="${book.imageUrl}" />
      <h4>${escapeHtml(book.title)}</h4>
      <p>${escapeHtml(book.author)}</p>
      <p><em>${escapeHtml(book.category)}</em></p>
      <button class="delete-btn">Delete</button>
    `;

    const delBtn = card.querySelector('.delete-btn');
    delBtn.addEventListener('click', () => {
      const originalIndex = books.findIndex(b => 
        b.title === book.title && 
        b.author === book.author &&
        b.category === book.category
      );
      if(originalIndex > -1){
        books.splice(originalIndex,1);
        saveToLocal();
        renderBooks();
      }
    });

    booksGrid.appendChild(card);
  });
}

function escapeHtml(str){
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

addBookForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const title = titleInput.value;
  const author = authorInput.value;
  const category = categoryInput.value;

  if(!title.trim() || !author.trim()) return;

  const book = createBookObject(title, author, category);
  books.push(book);
  saveToLocal();
  renderBooks();

  addBookForm.reset();
  titleInput.focus();
});

sortBtn.addEventListener('click', ()=>{
  sortAsc = !sortAsc;
  sortBtn.textContent = sortAsc ? 'Sort by Title A → Z' : 'Sort by Title Z → A';
  renderBooks();
});

filterSelect.addEventListener('change', ()=>{
  renderBooks();
});

clearAllBtn.addEventListener('click', ()=>{
  if(confirm('Clear all books?')){
    books = [];
    saveToLocal();
    renderBooks();
  }
});

loadFromLocal();
renderBooks();
