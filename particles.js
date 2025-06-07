class AdvancedParticleSystem {
    constructor() {
        this.particles = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.canvas = this.createCanvas();
        this.ctx = this.canvas.getContext('2d');
        this.animationId = null;
        this.init();
    }
    createCanvas() {
        const canvas = document.createElement('canvas');
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '1';
        document.body.appendChild(canvas);
        return canvas;
    }
    init() {
        this.resize();
        this.createInitialParticles();
        this.animate();
        window.addEventListener('resize', () => this.resize());
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
    }
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    createInitialParticles() {
        for (let i = 0; i < 100; i++) {
            this.particles.push(new InteractiveParticle(
                Math.random() * this.canvas.width,
                Math.random() * this.canvas.height
            ));
        }
    }
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.particles.forEach(particle => {
            particle.update(this.mouseX, this.mouseY);
            particle.draw(this.ctx);
        });
        this.drawConnections();
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    drawConnections() {
        this.particles.forEach((particle, i) => {
            this.particles.slice(i + 1).forEach(otherParticle => {
                const distance = Math.hypot(
                    particle.x - otherParticle.x,
                    particle.y - otherParticle.y
                );
                if (distance < 150) {
                    this.ctx.strokeStyle = `rgba(102, 126, 234, ${1 - distance / 150})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.beginPath();
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(otherParticle.x, otherParticle.y);
                    this.ctx.stroke();
                }
            });
        });
    }
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.canvas.parentNode) {
            this.canvas.remove();
        }
    }
}
class InteractiveParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.baseX = x;
        this.baseY = y;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.size = Math.random() * 3 + 1;
        this.color = `hsl(${Math.random() * 60 + 220}, 70%, 60%)`;
        this.opacity = Math.random() * 0.5 + 0.2;
    }
    update(mouseX, mouseY) {
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 100) {
            const force = (100 - distance) / 100;
            this.vx -= (dx / distance) * force * 0.5;
            this.vy -= (dy / distance) * force * 0.5;
        }
        this.vx += (this.baseX - this.x) * 0.01;
        this.vy += (this.baseY - this.y) * 0.01;
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.98;
        this.vy *= 0.98;
        if (this.x < 0 || this.x > window.innerWidth) this.vx *= -1;
        if (this.y < 0 || this.y > window.innerHeight) this.vy *= -1;
    }
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}
if (window.innerWidth > 768) {
    document.addEventListener('DOMContentLoaded', () => {
        new AdvancedParticleSystem();
    });
}