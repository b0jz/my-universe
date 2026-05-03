const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');

let width, height;
let stars = [];
let shootingStars = [];

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    initStars();
    initNebulae();
}

class Star {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.z = Math.random() * width;
        this.size = Math.random() * 1.5 + 0.1;
        this.alpha = Math.random() * 0.8 + 0.2;
        this.blinkRate = Math.random() * 0.02 - 0.01;
        this.color = this.getRandomColor();
    }

    getRandomColor() {
        const colors = [
            'rgba(255, 255, 255, ', 
            'rgba(240, 230, 255, ', // Slight purple tint
            'rgba(220, 200, 255, ', // More purple tint
            'rgba(200, 220, 255, '  // Slight blue tint
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        // Subtle twinkling
        this.alpha += this.blinkRate;
        if (this.alpha > 1 || this.alpha < 0.1) {
            this.blinkRate = -this.blinkRate;
        }
        
        // Very slow drift
        this.z -= 0.2;
        if (this.z <= 0) {
            this.z = width;
            this.x = Math.random() * width;
            this.y = Math.random() * height;
        }
    }

    draw() {
        let x = (this.x - width / 2) * (width / this.z);
        x = x + width / 2;
        let y = (this.y - height / 2) * (width / this.z);
        y = y + height / 2;
        let s = this.size * (width / this.z);

        ctx.beginPath();
        ctx.arc(x, y, s, 0, Math.PI * 2);
        ctx.fillStyle = this.color + Math.max(0, this.alpha) + ')';
        ctx.fill();
        
        // Glow effect for larger stars
        if (s > 1) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color + '1)';
        } else {
            ctx.shadowBlur = 0;
        }
    }
}

class ShootingStar {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * width * 1.5;
        this.y = 0;
        this.len = Math.random() * 80 + 30;
        this.speed = Math.random() * 10 + 15;
        this.size = Math.random() * 2 + 1;
        this.active = false;
        this.angle = Math.PI / 4 + (Math.random() * 0.2 - 0.1); // Roughly 45 degrees
    }

    spawn() {
        this.active = true;
        this.x = Math.random() * width;
        this.y = -50;
    }

    update() {
        if (this.active) {
            this.x -= this.speed * Math.cos(this.angle);
            this.y += this.speed * Math.sin(this.angle);

            if (this.x < -100 || this.y > height + 100) {
                this.active = false;
                this.reset();
            }
        }
    }

    draw() {
        if (!this.active) return;

        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.len * Math.cos(this.angle), this.y - this.len * Math.sin(this.angle));
        
        let gradient = ctx.createLinearGradient(this.x, this.y, this.x + this.len * Math.cos(this.angle), this.y - this.len * Math.sin(this.angle));
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.2, 'rgba(220, 180, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(150, 50, 255, 0)');
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = this.size;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Draw the name
        ctx.font = 'italic 20px "Cinzel", serif';
        ctx.fillStyle = 'rgba(255, 220, 255, 0.9)';
        ctx.shadowBlur = 5;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        ctx.fillText("zartaj", this.x, this.y - 15);
        ctx.shadowBlur = 0;
    }
}

function initStars() {
    stars = [];
    const numStars = Math.floor((width * height) / 1000); // Responsive star count
    for (let i = 0; i < numStars; i++) {
        stars.push(new Star());
    }
    
    shootingStars = [];
    for (let i = 0; i < 3; i++) {
        shootingStars.push(new ShootingStar());
    }
}

// Nebula definitions
const nebulae = [];
function initNebulae() {
    nebulae.length = 0;
    const numNebulae = 5;
    for (let i = 0; i < numNebulae; i++) {
        nebulae.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 400 + 200,
            color1: `rgba(${Math.random()*50 + 20}, ${Math.random()*20 + 10}, ${Math.random()*80 + 40}, 0.015)`,
            color2: `rgba(${Math.random()*20 + 10}, ${Math.random()*10 + 5}, ${Math.random()*40 + 20}, 0.005)`
        });
    }
}

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    initStars();
    initNebulae();
}

function drawNebulae() {
    nebulae.forEach(neb => {
        let grad = ctx.createRadialGradient(neb.x, neb.y, 0, neb.x, neb.y, neb.radius);
        grad.addColorStop(0, neb.color1);
        grad.addColorStop(0.5, neb.color2);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(neb.x, neb.y, neb.radius, 0, Math.PI * 2);
        ctx.fill();
    });
}

function animate() {
    // Clear with slight opacity for trails (darker)
    ctx.fillStyle = 'rgba(2, 1, 6, 0.3)';
    ctx.fillRect(0, 0, width, height);

    // Draw universe core (much darker)
    let coreGradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width);
    coreGradient.addColorStop(0, 'rgba(20, 5, 40, 0.03)');
    coreGradient.addColorStop(0.5, 'rgba(10, 2, 25, 0.01)');
    coreGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = coreGradient;
    ctx.fillRect(0, 0, width, height);

    drawNebulae();

    stars.forEach(star => {
        star.update();
        star.draw();
    });

    // Randomly spawn shooting stars
    if (Math.random() < 0.02) { // 2% chance per frame to check for spawn
        let inactiveStar = shootingStars.find(s => !s.active);
        if (inactiveStar && Math.random() < 0.1) { // 10% chance to actually spawn if one is available
            inactiveStar.spawn();
        }
    }

    shootingStars.forEach(star => {
        star.update();
        star.draw();
    });

    requestAnimationFrame(animate);
}

window.addEventListener('resize', resize);

resize();
animate();
