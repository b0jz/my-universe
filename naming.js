import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// ==========================================
// REPLACE THIS WITH YOUR ACTUAL FIREBASE CONFIG
// From your Firebase Console Settings
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyBeiR_Df8LYPcYg15AGpIBvAPFQYqtTjlE",
    authDomain: "my-univeres.firebaseapp.com",
    projectId: "my-univeres",
    storageBucket: "my-univeres.firebasestorage.app",
    messagingSenderId: "890055172530",
    appId: "1:890055172530:web:b36c2bdefa68e6f8fe04ab",
    measurementId: "G-Q5KHQLEF02"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

    // Canvas Setup
    const canvas = document.getElementById('starfield');
    const ctx = canvas.getContext('2d');
    const form = document.getElementById('starForm');
    const nameInput = document.getElementById('starName');

    let width, height;
    let namedStars =[];
    let backgroundStars =[];

    function resize() {
        width = window.innerWidth;
height = window.innerHeight;
canvas.width = width;
canvas.height = height;
initBgStars();
}

class BgStar {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 1.5;
        this.alpha = Math.random() * 0.5 + 0.1;
    }
    draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initBgStars() {
    backgroundStars = [];
    for (let i = 0; i < 300; i++) {
        backgroundStars.push(new BgStar());
    }
}

class NamedStar {
    constructor(data) {
        this.name = data.name;
        // Use name to create a consistent position
        let seed = 0;
        for (let i = 0; i < this.name.length; i++) {
            seed += this.name.charCodeAt(i);
        }

        this.x = (seed * 12345 % width);
        this.y = (seed * 67890 % (height - 100)) + 100;

        this.size = (seed % 2) + 2;
        this.pulse = 0;
        this.pulseDir = 0.05;

        const colors = [
            '255, 200, 200',
            '200, 200, 255',
            '255, 255, 200',
            '255, 255, 255',
            '220, 180, 255'
        ];
        this.color = colors[seed % colors.length];
    }

    update() {
        this.pulse += this.pulseDir;
        if (this.pulse >= 1) this.pulseDir = -0.02;
        if (this.pulse <= 0) this.pulseDir = 0.02;
    }

    draw() {
        // Glow
        let radius = this.size + (this.pulse * 3);
        let grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, radius * 3);
        grad.addColorStop(0, `rgba(${this.color}, 1)`);
        grad.addColorStop(0.2, `rgba(${this.color}, 0.8)`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius * 3, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Text
        ctx.font = '14px "Cinzel", serif';
        ctx.fillStyle = `rgba(255, 255, 255, ${0.7 + this.pulse * 0.3})`;
        ctx.shadowBlur = 5;
        ctx.shadowColor = `rgb(${this.color})`;
        ctx.fillText(this.name, this.x + 10, this.y + 4);
        ctx.shadowBlur = 0;
    }
}

// Fetch and listen for real-time updates from Firebase
const starsQuery = query(collection(db, "named_stars"), orderBy("createdAt", "asc"));
onSnapshot(starsQuery, (snapshot) => {
    const stars = [];
    snapshot.forEach((doc) => {
        stars.push(doc.data());
    });
    // Rebuild the namedStars array whenever the database changes
    namedStars = stars.map(s => new NamedStar(s));
}, (error) => {
    console.error("Error listening to Firebase:", error);
});

// Add new star to Firebase
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    if (!name) return;

    try {
        await addDoc(collection(db, "named_stars"), {
            name: name,
            createdAt: new Date()
        });
        nameInput.value = ''; // clear input
    } catch (e) {
        console.error("Error adding document: ", e);
        alert("Failed to add star. Please check your Firebase rules and config.");
    }
});

function animate() {
    ctx.fillStyle = 'rgba(10, 5, 25, 0.4)';
    ctx.fillRect(0, 0, width, height);

    backgroundStars.forEach(s => s.draw());

    namedStars.forEach(s => {
        s.update();
        s.draw();
    });

    requestAnimationFrame(animate);
}

window.addEventListener('resize', resize);
resize();
animate();
