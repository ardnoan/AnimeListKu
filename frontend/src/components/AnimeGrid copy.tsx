import { createSignal, createResource, createEffect, Show } from "solid-js";
import { For } from "solid-js/web";
import "../styles.css";

interface AnimeItem {
  id: string;
  title: string;
  image: string; // API mengembalikan 'image' bukan 'thumbnail_url'
  description?: string;
}

interface ApiResponse {
  status: string;
  message: string;
  data: AnimeItem[];
}

const fetchAnimeList = async (page: number): Promise<ApiResponse> => {
  try {
    console.log('Fetching page:', page);
    const response = await fetch(`http://localhost:8000/anime?page=${page}`);
    const data = await response.json();
    console.log('Received data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching anime:', error);
    throw error;
  }
};

const searchAnime = async (query: string): Promise<ApiResponse> => {
  try {
    console.log('Searching:', query);
    const response = await fetch(`http://localhost:8000/search?q=${query}`);
    const data = await response.json();
    console.log('Search results:', data);
    return data;
  } catch (error) {
    console.error('Error searching:', error);
    throw error;
  }
};

const AnimeGrid = () => {
  const [currentPage, setCurrentPage] = createSignal(1);
  const [searchQuery, setSearchQuery] = createSignal("");
  const [sortOrder, setSortOrder] = createSignal<"asc" | "desc">("asc");
  const [error, setError] = createSignal<string | null>(null);

  // Resource untuk data anime
  const [animeData] = createResource(
    () => ({ page: currentPage(), query: searchQuery() }),
    async ({ page, query }) => {
      try {
        setError(null);
        if (query.trim()) {
          return await searchAnime(query);
        }
        return await fetchAnimeList(page);
      } catch (err) {
        setError("Failed to load anime data. Please try again.");
        return { status: "error", message: "", data: [] };
      }
    }
  );

  // Fungsi untuk sorting anime
  const sortedAnimeList = () => {
    const data = animeData();
    if (!data || !data.data) return [];
    
    return [...data.data].sort((a, b) => {
      const comparison = a.title.localeCompare(b.title);
      return sortOrder() === "asc" ? comparison : -comparison;
    });
  };

  return (
    <div class="app-wrapper">
      <div class="container">
        <h1>Anime Collection</h1>
        
        <div class="controls">
          <div class="search-box">
            <input
              type="text"
              placeholder="Search anime..."
              value={searchQuery()}
              onInput={(e) => {
                setSearchQuery(e.currentTarget.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div class="sort-box">
            <select
              value={sortOrder()}
              onChange={(e) => setSortOrder(e.currentTarget.value as "asc" | "desc")}
            >
              <option value="asc">A-Z</option>
              <option value="desc">Z-A</option>
            </select>
          </div>
        </div>

        {/* Error Message */}
        <Show when={error()}>
          <div class="error-message">
            {error()}
          </div>
        </Show>

        {/* Loading State */}
        <Show when={animeData.loading}>
          <div class="loading">Loading anime...</div>
        </Show>

        {/* Anime Grid */}
        <div class="grid">
          <Show 
            when={!animeData.loading && sortedAnimeList().length > 0}
            fallback={
              <Show when={!animeData.loading}>
                <div class="no-results">No anime found</div>
              </Show>
            }
          >
            <For each={sortedAnimeList()}>
              {(anime) => (
                <div class="card">
                  <div class="card-image">
                    <img
                      src={anime.image}
                      alt={anime.title}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/200x300?text=No+Image';
                      }}
                    />
                    <div class="card-overlay"></div>
                  </div>
                  <div class="card-content">
                    <h2>{anime.title}</h2>
                    {anime.description && (
                      <p class="description">{anime.description}</p>
                    )}
                  </div>
                </div>
              )}
            </For>
          </Show>
        </div>

        {/* Pagination */}
        <Show when={!searchQuery().trim() && !animeData.loading && sortedAnimeList().length > 0}>
          <div class="pagination">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage() === 1}
              class="prev-btn"
            >
              Previous
            </button>
            <span class="page-info">Page {currentPage()}</span>
            <button
              onClick={() => setCurrentPage(p => p + 1)}
              class="next-btn"
            >
              Next
            </button>
          </div>
        </Show>
      </div>
    </div>
  );
};

export default AnimeGrid;