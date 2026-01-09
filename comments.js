// comments.js  (MUST be loaded as type="module" in HTML)

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

// ✅ Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC-faZ7gocekZ8z_YUZo5zLx9nuGfyZsUA",
  authDomain: "engagement-comment.firebaseapp.com",
  projectId: "engagement-comment",
  storageBucket: "engagement-comment.firebasestorage.app",
  messagingSenderId: "1042408265230",
  appId: "1:1042408265230:web:8c5b750539b5545c6a0e5f",
  measurementId: "G-1GDKYX6YJK",
};

// ✅ Init Firebase + Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ✅ HTML elements
const nameEl = document.getElementById("c-name");
const textEl = document.getElementById("c-text");
const sendBtn = document.getElementById("c-send");
const listEl = document.getElementById("c-list");

// Stop if comment HTML is missing
if (!nameEl || !textEl || !sendBtn || !listEl) {
  console.warn(
    "❌ Comment elements not found. Add comment section HTML first."
  );
} else {
  // ✅ Thank you popup function (move ABOVE click is fine too)
  function showThankYou() {
    const popup = document.getElementById("thank-you-popup");
    if (!popup) return;

    popup.classList.add("show");

    setTimeout(() => {
      popup.classList.remove("show");
    }, 1800);
  }

  // ✅ Send comment
  sendBtn.addEventListener("click", async () => {
    const name = (nameEl.value || "").trim();
    const text = (textEl.value || "").trim();
    if (!name || !text) return;

    const params = new URLSearchParams(window.location.search);
    const guest = params.get("guest")
      ? decodeURIComponent(params.get("guest"))
      : "";

    await addDoc(collection(db, "comments"), {
      name,
      text,
      guest,
      createdAt: serverTimestamp(),
    });

    textEl.value = "";

    // ✅ SHOW POPUP
    showThankYou();
  });

  // ✅ Live comments list
  const q = query(collection(db, "comments"), orderBy("createdAt", "desc"));

  onSnapshot(q, (snap) => {
    listEl.innerHTML = "";

    snap.forEach((docSnap) => {
      const c = docSnap.data();

      const div = document.createElement("div");
      div.className = "comment";

      // NAME (top)
      const meta = document.createElement("div");
      meta.className = "meta";
      meta.textContent = c.guest ? `${c.name} • ${c.guest}` : c.name;

      // MESSAGE
      const msg = document.createElement("div");
      msg.className = "text";
      msg.textContent = c.text;

      // DATE & TIME (bottom)
      const time = document.createElement("div");
      time.className = "time";

      if (c.createdAt?.toDate) {
        const d = c.createdAt.toDate();
        time.textContent = d.toLocaleString(); // date + time
      }

      div.appendChild(meta);
      div.appendChild(msg);
      div.appendChild(time);

      listEl.appendChild(div);
    });
  });
}
