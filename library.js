const appkeyInput = document.getElementById("appkeyInput");
const saveKeyBtn = document.getElementById("saveKeyBtn");
const searchBtn = document.getElementById("searchBtn");
const statusText = document.getElementById("statusText");
const errorText = document.getElementById("errorText");
const resultList = document.getElementById("resultList");

const APPKEY_STORAGE_KEY = "calil_appkey";

function loadSavedAppkey() {
  try {
    const saved = localStorage.getItem(APPKEY_STORAGE_KEY);
    if (saved) appkeyInput.value = saved;
  } catch {
    // localStorage unavailable; ignore
  }
}

function saveAppkey() {
  try {
    localStorage.setItem(APPKEY_STORAGE_KEY, appkeyInput.value.trim());
    setStatus("APIキーを保存しました");
  } catch {
    showError("APIキーの保存に失敗しました");
  }
}

function setStatus(message) {
  statusText.textContent = message;
}

function showError(message) {
  errorText.textContent = message;
  errorText.hidden = false;
}

function clearError() {
  errorText.hidden = true;
  errorText.textContent = "";
}

function setLoading(loading) {
  searchBtn.disabled = loading;
  searchBtn.classList.toggle("is-loading", loading);
}

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("この端末では位置情報を利用できません"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos),
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          reject(new Error("位置情報の利用が許可されませんでした"));
        } else {
          reject(new Error("位置情報の取得に失敗しました"));
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

function fetchLibrariesJsonp(params) {
  return new Promise((resolve, reject) => {
    const callbackName = `calilLibraryCallback_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
    const query = new URLSearchParams({ ...params, format: "json", callback: callbackName });
    const script = document.createElement("script");
    script.src = `https://api.calil.jp/library?${query.toString()}`;

    const cleanup = () => {
      delete window[callbackName];
      script.remove();
    };

    window[callbackName] = (data) => {
      cleanup();
      resolve(data);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error("カーリルAPIへの接続に失敗しました"));
    };

    document.body.appendChild(script);
  });
}

function renderLibraries(libraries) {
  resultList.innerHTML = "";

  if (!Array.isArray(libraries) || libraries.length === 0) {
    setStatus("近くに図書館が見つかりませんでした");
    return;
  }

  const sorted = [...libraries].sort((a, b) => {
    const da = parseFloat(a.distance);
    const db = parseFloat(b.distance);
    if (Number.isNaN(da) || Number.isNaN(db)) return 0;
    return da - db;
  });

  setStatus(`${sorted.length}件の図書館が見つかりました`);

  sorted.slice(0, 20).forEach((lib) => {
    const li = document.createElement("li");
    li.className = "library-card";

    const name = document.createElement("div");
    name.className = "lib-name";
    name.textContent = lib.formal || lib.short || "名称不明の図書館";
    li.appendChild(name);

    const meta = document.createElement("div");
    meta.className = "lib-meta";
    const metaParts = [];
    if (lib.systemname) metaParts.push(lib.systemname);
    if (lib.distance) metaParts.push(`${parseFloat(lib.distance).toFixed(2)} km`);
    meta.textContent = metaParts.join(" ・ ");
    li.appendChild(meta);

    if (lib.address) {
      const address = document.createElement("div");
      address.className = "lib-address";
      address.textContent = lib.address;
      li.appendChild(address);
    }

    if (lib.tel) {
      const tel = document.createElement("div");
      tel.className = "lib-tel";
      tel.textContent = `TEL: ${lib.tel}`;
      li.appendChild(tel);
    }

    if (lib.url_pc) {
      const link = document.createElement("a");
      link.className = "lib-link";
      link.href = lib.url_pc;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = "図書館サイトを見る";
      li.appendChild(link);
    }

    resultList.appendChild(li);
  });
}

async function searchNearbyLibraries() {
  clearError();
  resultList.innerHTML = "";

  const appkey = appkeyInput.value.trim();
  if (!appkey) {
    showError("カーリルAPIキーを入力してください");
    return;
  }

  setLoading(true);
  setStatus("現在地を取得中...");

  try {
    const pos = await getCurrentPosition();
    const { longitude, latitude } = pos.coords;

    setStatus("図書館を検索中...");
    const data = await fetchLibrariesJsonp({
      appkey,
      geocode: `${longitude},${latitude}`,
      limit: 50,
    });

    renderLibraries(data);
  } catch (err) {
    showError(err.message || "検索に失敗しました");
    setStatus("");
  } finally {
    setLoading(false);
  }
}

saveKeyBtn.addEventListener("click", saveAppkey);
searchBtn.addEventListener("click", searchNearbyLibraries);

loadSavedAppkey();
