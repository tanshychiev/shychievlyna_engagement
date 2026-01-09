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
  // ✅ Thank you popup
  function showThankYou() {
    const popup = document.getElementById("thank-you-popup");
    if (!popup) {
      console.warn("❌ thank-you-popup not found");
      return;
    }

    popup.classList.add("show");
    setTimeout(() => popup.classList.remove("show"), 1800);
  }

  // ✅ SEND comment (ONLY when button clicked)
  sendBtn.addEventListener("click", async () => {
    const name = (nameEl.value || "").trim();
    const text = (textEl.value || "").trim();

    if (!name || !text) {
      alert("Please enter name and message");
      return;
    }

    try {
      sendBtn.disabled = true;

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
      showThankYou();
    } catch (err) {
      console.error("Send failed:", err);
      alert("Send failed: " + (err?.message || err));
    } finally {
      sendBtn.disabled = false;
    }
  });

  // ✅ Live comments list
  const q = query(collection(db, "comments"), orderBy("createdAt", "desc"));

  onSnapshot(
    q,
    (snap) => {
      listEl.innerHTML = "";

      snap.forEach((docSnap) => {
        const c = docSnap.data();

        const div = document.createElement("div");
        div.className = "comment";

        const meta = document.createElement("div");
        meta.className = "meta";
        meta.textContent = c.guest ? `${c.name} • ${c.guest}` : c.name;

        const msg = document.createElement("div");
        msg.className = "text";
        msg.textContent = c.text;

        const time = document.createElement("div");
        time.className = "time";
        if (c.createdAt?.toDate) {
          time.textContent = c.createdAt.toDate().toLocaleString();
        }

        div.appendChild(meta);
        div.appendChild(msg);
        div.appendChild(time);

        listEl.appendChild(div);
      });
    },
    (err) => {
      console.error("Snapshot error:", err);
    }
  );
}
