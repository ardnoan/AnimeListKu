import { createSignal, createResource, Show } from "solid-js";
import { For } from "solid-js/web";
import "../styles.css";

interface Anime {
  mal_id: number;
  url: string;
  title: string;
  title_english?: string;
  title_japanese?: string;
  images: {
    jpg: {
      image_url: string;
    };
  };
  type: string;
  episodes?: number;
  score?: number;
  rank?: number;
  duration: string;
  genres: { name: string }[];
}

interface ApiResponse {
  data: Anime[];
  pagination: {
    last_visible_page: number;
    has_next_page: boolean;
    current_page: number;
  };
}

const fetchAnimeList = async (page: number): Promise<ApiResponse> => {
  try {
    const response = await fetch(`http://localhost:8000/anime?page=${page}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching anime:", error);
    throw error;
  }
};

const fetchTopAnime = async (): Promise<ApiResponse> => {
  try {
    const response = await fetch("http://localhost:8000/top-anime");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching top anime:", error);
    throw error;
  }
};

const AnimeGrid = () => {
  const [currentPage, setCurrentPage] = createSignal(1);
  const [searchQuery, setSearchQuery] = createSignal("");
  const [sortType, setSortType] = createSignal("rank");
  const [sortOrder, setSortOrder] = createSignal("asc");
  const [animeData, { mutate }] = createResource(currentPage, fetchAnimeList);

  const filteredAnimeList = () => {
    let list = animeData()?.data || [];
    if (searchQuery()) {
      list = list.filter(anime => anime.title.toLowerCase().includes(searchQuery().toLowerCase()));
    }
    return list.sort((a, b) => {
      let comparison = 0;
      if (sortType() === "rank") comparison = (a.rank || Infinity) - (b.rank || Infinity);
      if (sortType() === "episodes") comparison = (a.episodes || 0) - (b.episodes || 0);
      if (sortType() === "duration") comparison = a.duration.localeCompare(b.duration);
      return sortOrder() === "asc" ? comparison : -comparison;
    });
  };

  const loadTopAnime = async () => {
    const topAnimeData = await fetchTopAnime();
    mutate(topAnimeData);
  };

  return (
    <div class="app-wrapper">
      <div class="container">
        <h1>Anime Collection</h1>
        
        <div class="controls">
          <input
            type="text"
            class="search-box"
            placeholder="Search anime..."
            onInput={(e) => setSearchQuery(e.currentTarget.value)}
          />
          <select class="sort-dropdown" onChange={(e) => setSortType(e.currentTarget.value)}>
            <option value="rank">Sort by Rank</option>
            <option value="episodes">Sort by Episodes</option>
            <option value="duration">Sort by Duration</option>
          </select>
          <button class="sort-btn" onClick={() => setSortOrder(sortOrder() === "asc" ? "desc" : "asc")}> 
            {sortOrder() === "asc" ? "Ascending" : "Descending"}
          </button>
          <button class="top-anime-btn" onClick={loadTopAnime}>Load Top Anime</button>
        </div>

        <div class="grid">
          <Show when={!animeData.loading} fallback={<div class="loading">Loading...</div>}>
            <For each={filteredAnimeList()}>
              {(anime) => (
                <div class="card">
                  <div class="card-image">
                    <img src={anime.images.jpg.image_url} alt={anime.title} loading="lazy" />
                  </div>
                  <div class="card-content">
                    <h2>{anime.title}</h2>
                    <p><strong>Type:</strong> {anime.type}</p>
                    <p><strong>Episodes:</strong> {anime.episodes || "Unknown"}</p>
                    <p><strong>Score:</strong> {anime.score || "N/A"}</p>
                    <p><strong>Rank:</strong> {anime.rank || "N/A"}</p>
                    <p><strong>Genres:</strong> {anime.genres.map(g => g.name).join(", ")}</p>
                    <p><strong>Duration:</strong> {anime.duration}</p>
                  </div>
                </div>
              )}
            </For>
          </Show>
        </div>

        <div class="pagination">
          <button
            class="pagination-btn"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage() === 1 || animeData.loading}
          >
            Previous
          </button>
          <span class="page-info">Page {animeData()?.pagination.current_page} of {animeData()?.pagination.last_visible_page}</span>
          <button
            class="pagination-btn"
            onClick={() => setCurrentPage((p) => Math.min(animeData()?.pagination.last_visible_page || 1, p + 1))}
            disabled={animeData.loading || !animeData()?.pagination.has_next_page}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnimeGrid;
