const summonBtn = document.getElementById("summonBtn");
const sprite = document.getElementById("sprite");
const placeholder = document.getElementById("placeholder");
const spriteWrap = document.getElementById("sprite-wrap");
const pokeNumber = document.getElementById("pokeNumber");
const pokeName = document.getElementById("pokeName");
const typeBadges = document.getElementById("typeBadges");
const errorText = document.getElementById("errorText");

const TYPE_JA = {
  normal: "ノーマル", fire: "ほのお", water: "みず", electric: "でんき",
  grass: "くさ", ice: "こおり", fighting: "かくとう", poison: "どく",
  ground: "じめん", flying: "ひこう", psychic: "エスパー", bug: "むし",
  rock: "いわ", ghost: "ゴースト", dragon: "ドラゴン", dark: "あく",
  steel: "はがね", fairy: "フェアリー"
};

let maxPokemonId = 1025;

async function fetchPokemonCount() {
  try {
    const res = await fetch("https://pokeapi.co/api/v2/pokemon-species?limit=1");
    if (!res.ok) return;
    const data = await res.json();
    if (data.count) maxPokemonId = data.count;
  } catch {
    // keep fallback value
  }
}

function setLoading(loading) {
  summonBtn.disabled = loading;
  summonBtn.classList.toggle("is-loading", loading);
}

function showError(message) {
  errorText.textContent = message;
  errorText.hidden = false;
}

function clearError() {
  errorText.hidden = true;
}

async function fetchJapaneseName(speciesUrl) {
  const res = await fetch(speciesUrl);
  if (!res.ok) throw new Error("species fetch failed");
  const data = await res.json();
  const jaName = data.names.find((n) => n.language.name === "ja-Hrkt" || n.language.name === "ja");
  return jaName ? jaName.name : null;
}

async function summonRandomPokemon() {
  clearError();
  setLoading(true);
  spriteWrap.classList.remove("pop");

  try {
    const id = Math.floor(Math.random() * maxPokemonId) + 1;
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    if (!res.ok) throw new Error("pokemon fetch failed");
    const data = await res.json();

    const imageUrl =
      data.sprites.other?.["official-artwork"]?.front_default ||
      data.sprites.front_default;

    let displayName = data.name;
    try {
      const jaName = await fetchJapaneseName(data.species.url);
      if (jaName) displayName = jaName;
    } catch {
      // fall back to English name
    }

    pokeNumber.textContent = `No. ${String(data.id).padStart(4, "0")}`;
    pokeName.textContent = displayName;

    typeBadges.innerHTML = "";
    data.types.forEach((t) => {
      const badge = document.createElement("span");
      badge.className = `type-badge type-${t.type.name}`;
      badge.textContent = TYPE_JA[t.type.name] || t.type.name;
      typeBadges.appendChild(badge);
    });

    if (imageUrl) {
      sprite.src = imageUrl;
      sprite.alt = displayName;
      sprite.hidden = false;
      placeholder.hidden = true;
    } else {
      sprite.hidden = true;
      placeholder.hidden = false;
    }

    requestAnimationFrame(() => spriteWrap.classList.add("pop"));
  } catch (err) {
    showError("ポケモンの取得に失敗しました。もう一度お試しください。");
  } finally {
    setLoading(false);
  }
}

summonBtn.addEventListener("click", summonRandomPokemon);

fetchPokemonCount();
