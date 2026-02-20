const CLIENT_ID = "5d650521feba40be9b2be396b3abefeb";
const REDIRECT_URI = window.location.origin + "/";
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const RESPONSE_TYPE = "token";

const loginBtn = document.getElementById("loginBtn");
const albumArt = document.getElementById("albumArt");
const trackName = document.getElementById("trackName");
const artistName = document.getElementById("artistName");
const overlay = document.getElementById("overlay");

loginBtn.onclick = () => {
  window.location = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=user-read-currently-playing`;
};

const hash = window.location.hash;
let accessToken = null;

if (hash) {
  accessToken = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1];
  window.location.hash = "";
  loginBtn.style.display = "none";
}

let currentTrackId = null;
const colorThief = new ColorThief();

async function getCurrentlyPlaying() {
  if (!accessToken) return;

  const res = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!res.ok) return;

  const data = await res.json();
  if (!data || !data.item) return;

  const track = data.item;

  if (track.id === currentTrackId) return;

  currentTrackId = track.id;

  trackName.innerText = track.name;
  artistName.innerText = track.artists.map(a => a.name).join(", ");
  albumArt.src = track.album.images[0].url;

  const img = new Image();
  img.crossOrigin = "Anonymous";
  img.src = track.album.images[0].url;

  img.onload = function () {
    const palette = colorThief.getPalette(img, 2);

    const c1 = `rgb(${palette[0].join(",")})`;
    const c2 = `rgb(${palette[1].join(",")})`;

    overlay.style.opacity = "1";

    setTimeout(() => {
      document.body.style.background =
        `linear-gradient(135deg, ${c1}, ${c2})`;
      overlay.style.opacity = "0";
    }, 500);
  };
}

setInterval(getCurrentlyPlaying, 4000);
