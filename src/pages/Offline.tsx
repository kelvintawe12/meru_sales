import React, { useState, useEffect, useRef } from 'react';

// Interfaces for data structures
interface NewsArticle {
  id: number;
  title: string;
  content: string;
  category: string;
  date: string;
}

interface GameState {
  ticTacToeBoard: string[];
  puzzleNumbers: number[];
}

// Sample cached data (simulating service worker cache)
const cachedNews: NewsArticle[] = [
  { id: 1, title: "Local Festival Draws Crowds", content: "The annual festival brought thousands to the city center with vibrant performances and local cuisine.", category: "Culture", date: "2025-05-27" },
  { id: 2, title: "Tech Breakthrough in AI", content: "Researchers unveiled a new AI model that improves efficiency in natural language processing.", category: "Technology", date: "2025-05-26" },
  { id: 3, title: "Sports Team Wins Championship", content: "The local team clinched the title after a thrilling match that ended in a penalty shootout.", category: "Sports", date: "2025-05-25" },
  { id: 4, title: "New Art Exhibit Opens", content: "A contemporary art exhibit featuring local artists opened at the city gallery.", category: "Culture", date: "2025-05-24" },
];

const cachedImages = [
  "https://picsum.photos/800/600?random=1",
  "https://picsum.photos/800/600?random=2",
  "https://picsum.photos/800/600?random=3",
  "https://picsum.photos/800/600?random=4",
  "https://picsum.photos/800/600?random=5",
];

// Tic-Tac-Toe Component
const TicTacToe: React.FC<{ board: string[]; setBoard: React.Dispatch<React.SetStateAction<string[]>> }> = ({ board, setBoard }) => {
  const [isXNext, setIsXNext] = useState(true);
  const winner = calculateWinner(board);

  function handleClick(index: number) {
    if (board[index] || winner) return;
    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);
    localStorage.setItem('ticTacToeBoard', JSON.stringify(newBoard));
  }

  function resetGame() {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    localStorage.setItem('ticTacToeBoard', JSON.stringify(Array(9).fill(null)));
  }

  function calculateWinner(board: string[]) {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    for (let line of lines) {
      const [a, b, c] = line;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Tic-Tac-Toe</h3>
      <div className="grid grid-cols-3 gap-2 w-48 mx-auto">
        {board.map((cell, index) => (
          <button
            key={index}
            className="h-16 text-2xl font-bold border border-gray-300 rounded hover:bg-gray-100"
            onClick={() => handleClick(index)}
          >
            {cell}
          </button>
        ))}
      </div>
      <div className="mt-4 text-center">
        {winner ? (
          <p className="text-lg font-semibold">Winner: {winner}</p>
        ) : board.every(cell => cell) ? (
          <p className="text-lg font-semibold">Draw!</p>
        ) : (
          <p className="text-lg">Next Player: {isXNext ? 'X' : 'O'}</p>
        )}
        <button
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={resetGame}
        >
          Reset Game
        </button>
      </div>
    </div>
  );
};

// Number Puzzle Component
const NumberPuzzle: React.FC<{ numbers: number[]; setNumbers: React.Dispatch<React.SetStateAction<number[]>> }> = ({ numbers, setNumbers }) => {
  function shuffle() {
    const newNumbers = [...numbers].sort(() => Math.random() - 0.5);
    setNumbers(newNumbers);
    localStorage.setItem('puzzleNumbers', JSON.stringify(newNumbers));
  }

  function handleClick(index: number) {
    const newNumbers = [...numbers];
    const emptyIndex = newNumbers.indexOf(0);
    const validMoves = [emptyIndex - 1, emptyIndex + 1, emptyIndex - 4, emptyIndex + 4].filter(
      i => i >= 0 && i < 16 && Math.floor(i / 4) === Math.floor(emptyIndex / 4) || i % 4 === emptyIndex % 4
    );
    if (validMoves.includes(index)) {
      [newNumbers[emptyIndex], newNumbers[index]] = [newNumbers[index], newNumbers[emptyIndex]];
      setNumbers(newNumbers);
      localStorage.setItem('puzzleNumbers', JSON.stringify(newNumbers));
    }
  }

  const isSolved = numbers.every((num, i) => num === 0 ? i === 15 : num === i + 1);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Number Puzzle</h3>
      <div className="grid grid-cols-4 gap-1 w-64 mx-auto">
        {numbers.map((num, index) => (
          <button
            key={index}
            className={`h-16 text-xl font-semibold border border-gray-300 rounded ${num === 0 ? 'bg-gray-200' : 'bg-white hover:bg-gray-100'}`}
            onClick={() => handleClick(index)}
          >
            {num || ''}
          </button>
        ))}
      </div>
      <div className="mt-4 text-center">
        {isSolved && <p className="text-lg font-semibold text-green-600">Puzzle Solved!</p>}
        <button
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={shuffle}
        >
          Shuffle
        </button>
      </div>
    </div>
  );
};

// News Component
const News: React.FC<{ news: NewsArticle[]; filter: string; favorites: number[]; toggleFavorite: (id: number) => void }> = ({ news, filter, favorites, toggleFavorite }) => {
  const filteredNews = filter === 'Favorites' ? news.filter(article => favorites.includes(article.id)) : filter === 'All' ? news : news.filter(article => article.category === filter);

  function readAloud(content: string) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(content);
      utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-speech not supported in this browser.');
    }
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Cached News</h3>
      {filteredNews.length === 0 ? (
        <p className="text-gray-600">No articles available for this filter.</p>
      ) : (
        filteredNews.map(article => (
          <div key={article.id} className="mb-4 p-4 border border-gray-200 rounded">
            <h4 className="text-md font-semibold">{article.title}</h4>
            <p className="text-sm text-gray-600">{article.date} | {article.category}</p>
            <p className="text-sm mt-2">{article.content}</p>
            <div className="mt-2 flex gap-2">
              <button
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => readAloud(`${article.title}. ${article.content}`)}
              >
                Read Aloud
              </button>
              <button
                className={`px-3 py-1 rounded ${favorites.includes(article.id) ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-800'}`}
                onClick={() => toggleFavorite(article.id)}
              >
                {favorites.includes(article.id) ? 'Unfavorite' : 'Favorite'}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

// Gallery Component with Infinite Scroll
const Gallery: React.FC = () => {
  const [images, setImages] = useState<string[]>(cachedImages.slice(0, 2));
  const [page, setPage] = useState(1);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && images.length < cachedImages.length) {
          setPage(prev => prev + 1);
          setImages(prev => [...prev, ...cachedImages.slice(prev.length, prev.length + 2)]);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current && loadMoreRef.current) {
        observerRef.current.unobserve(loadMoreRef.current);
      }
    };
  }, [images]);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Image Gallery</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {images.map((src, index) => (
          <img key={index} src={src} alt={`Gallery ${index + 1}`} className="w-full h-48 object-cover rounded" />
        ))}
      </div>
      {images.length < cachedImages.length && (
        <div ref={loadMoreRef} className="h-10 flex items-center justify-center">
          <p className="text-gray-600">Loading more...</p>
        </div>
      )}
    </div>
  );
};

// Main Offline Component
const Offline: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Games' | 'News' | 'Gallery'>('Games');
  const [gameState, setGameState] = useState<GameState>({
    ticTacToeBoard: JSON.parse(localStorage.getItem('ticTacToeBoard') || '[]') || Array(9).fill(null),
    puzzleNumbers: JSON.parse(localStorage.getItem('puzzleNumbers') || '[]') || [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0],
  });
  const [newsFilter, setNewsFilter] = useState<string>('All');
  const [favorites, setFavorites] = useState<number[]>(JSON.parse(localStorage.getItem('favorites') || '[]'));

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  function toggleFavorite(id: number) {
    setFavorites(prev => prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]);
  }

  const categories = ['All', 'Culture', 'Technology', 'Sports', 'Favorites'];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-red-600">You Are Offline</h1>
          <p className="text-gray-600 mt-2">Enjoy these offline features while you wait to reconnect.</p>
          <button
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={() => window.location.reload()}
          >
            Retry Connection
          </button>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-6">
          {['Games', 'News', 'Gallery'].map(tab => (
            <button
              key={tab}
              className={`px-4 py-2 rounded ${activeTab === tab ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
              onClick={() => setActiveTab(tab as 'Games' | 'News' | 'Gallery')}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'Games' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TicTacToe
              board={gameState.ticTacToeBoard}
              setBoard={(value) =>
                setGameState(prev => ({
                  ...prev,
                  ticTacToeBoard:
                    typeof value === 'function'
                      ? (value as (prevState: string[]) => string[])(prev.ticTacToeBoard)
                      : value,
                }))
              }
            />
            <NumberPuzzle numbers={gameState.puzzleNumbers} setNumbers={(numbers) => setGameState(prev => ({ ...prev, puzzleNumbers: numbers }))} />
          </div>
        )}
        {activeTab === 'News' && (
          <div>
            <div className="flex gap-2 mb-4 overflow-x-auto">
              {categories.map(category => (
                <button
                  key={category}
                  className={`px-3 py-1 rounded ${newsFilter === category ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
                  onClick={() => setNewsFilter(category)}
                >
                  {category}
                </button>
              ))}
            </div>
            <News news={cachedNews} filter={newsFilter} favorites={favorites} toggleFavorite={toggleFavorite} />
          </div>
        )}
        {activeTab === 'Gallery' && <Gallery />}
      </div>
    </div>
  );
};

export default Offline;