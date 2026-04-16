const ATELIER_DATA = [
    { title: "Lavender Dreams", subtitle: "Rustic paper & Dried flowers", date: "Feb 2026", img: "assets/lavender.png", story: "選用帶有纖維感的再生紙，嵌入薰衣草花穗。" },
    { title: "Wabi-Sabi Indigo", subtitle: "Hand-dyed Boro fabric", date: "Jan 2026", img: "assets/indigo.png", story: "使用傳統藍染布料，透過手縫呈現殘缺美。" },
    { title: "Golden Hour", subtitle: "Linen with Gold accents", date: "Jan 2026", img: "assets/golden.png", story: "溫潤的黃赭色麻布，細緻的金箔燙印。" },
    { title: "Forest Chronicle", subtitle: "Coming Soon - Velvet Bind", date: "March 2026", img: null, story: "深邃的苔蘚綠天鵝絨，紀錄森林的絮語。" }
];

const MOMENTS_DATA = [
    { img: "assets/artisan_mascot.png" },
    { img: "assets/lavender.png" },
    { img: "assets/indigo.png" },
    { img: "assets/golden.png" }
];

const FAQ_DATA = [
    { q: "手工書製作需要多久？", a: "依裝幀複雜度而定，通常需 3-7 個工天。" },
    { q: "可以指定特殊的封面布料嗎？", a: "可以的，歡迎提供具有紀念價值的舊布料進行裝幀。" },
    { q: "手工書該如何保養？", a: "放在乾燥陰涼處，並定期翻閱，手部的油脂是紙張最好的保護。" }
];

const PROCESS_DATA = [
    { num: "01", title: "選紙 Selection", desc: "根據書籍主題選擇最適合的手感與磅數。" },
    { num: "02", title: "裝幀 Binding", desc: "一針一線將靈魂與記憶緊緊相連。" },
    { num: "03", title: "點綴 Details", desc: "壓花、燙金或封蠟，賦予其獨特生命。" },
    { num: "04", title: "封存 Archiving", desc: "完成一段故事的家，靜靜等待啟封。" }
];

function createPolaroid(item, index) {
    const card = document.createElement('div');
    card.className = 'polaroid-card';
    const rotation = (Math.random() * 4 - 2).toFixed(1); // Random -2 to +2 deg
    card.style.setProperty('--rot', `${rotation}deg`);
    card.style.animation = `fadeRotateIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards`;
    card.style.animationDelay = `${index * 0.1}s`;
    card.style.opacity = '0';

    card.innerHTML = `
        <div class="photo-area">
            ${item.img ? `<img src="${item.img}" style="width: 100%; height: 100%; object-fit: cover;">` : `<span style="opacity: 0.2;">📚 ${item.title}</span>`}
        </div>
        <div class="item-info">
            <h4>${item.title}</h4>
            <p style="font-size: 0.8rem; margin-top: 5px; opacity: 0.6;">${item.subtitle}</p>
            <p style="font-size: 0.7rem; color: #bf6b5b; margin-top: 10px; text-transform: uppercase; letter-spacing: 0.1em;">${item.date}</p>
        </div>
    `;

    // Click to Open Modal
    card.addEventListener('click', () => openModal(item));
    return card;
}

function createStep(step) {
    const card = document.createElement('div');
    card.className = 'step-card';
    card.innerHTML = `
        <span class="step-num">${step.num}</span>
        <h5>${step.title}</h5>
        <p>${step.desc}</p>
    `;
    return card;
}

function createMoment(moment) {
    const card = document.createElement('div');
    card.className = 'moment-card';
    const rotation = (Math.random() * 6 - 3).toFixed(1);
    card.style.setProperty('--rot', `${rotation}deg`);
    card.innerHTML = `<img src="${moment.img}" alt="Atelier Moment">`;
    return card;
}

function createFAQ(faq) {
    const item = document.createElement('div');
    item.className = 'faq-item';
    item.innerHTML = `
        <div class="faq-q">${faq.q}</div>
        <div class="faq-a">${faq.a}</div>
    `;
    return item;
}

// Modal Logic
const modal = document.getElementById('item-modal');
const modalTitle = document.getElementById('modal-title');
const modalDate = document.getElementById('modal-date');
const modalStory = document.getElementById('modal-story');
const modalImg = document.getElementById('modal-img');
const modalMaterials = document.getElementById('modal-materials-list');

function openModal(item) {
    modalTitle.textContent = item.title;
    modalDate.textContent = item.date;
    modalStory.textContent = item.story || "這件作品背後有一段溫暖的故事，正在裝幀中...";
    modalImg.innerHTML = item.img ? `<img src="${item.img}">` : "📚";
    
    // Mock materials based on choice
    const materials = item.subtitle.split('&').map(s => s.trim());
    modalMaterials.innerHTML = materials.map(m => `<li>${m}</li>`).join('');
    
    modal.style.display = 'flex';
}

function closeModal() {
    modal.style.display = 'none';
}

document.getElementById('modal-close-btn').addEventListener('click', closeModal);
window.addEventListener('click', (e) => { if(e.target === modal) closeModal(); });

function init() {
    const grid = document.getElementById('main-grid');
    ATELIER_DATA.forEach((item, index) => {
        grid.appendChild(createPolaroid(item, index));
    });

    const stepsGrid = document.getElementById('process-steps-grid');
    if (stepsGrid) {
        PROCESS_DATA.forEach(step => {
            stepsGrid.appendChild(createStep(step));
        });
    }

    const momentsGrid = document.getElementById('moments-grid');
    if (momentsGrid) {
        MOMENTS_DATA.forEach(moment => {
            momentsGrid.appendChild(createMoment(moment));
        });
    }

    const faqList = document.getElementById('faq-list');
    if (faqList) {
        FAQ_DATA.forEach(faq => {
            faqList.appendChild(createFAQ(faq));
        });
    }

    // Smooth Scroll for Floating Nav
    document.querySelectorAll('.floating-nav a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = entry.target.classList.contains('sidebar') ? 'none' : entry.target.style.transform;
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.about-card, .links-section, .video-entry, .sidebar').forEach(el => {
        observer.observe(el);
    });
}

// Custom Keyframe is actually better defined in CSS, but let's add it here for dynamic styling
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeRotateIn {
        from {
            opacity: 0;
            transform: translateY(30px) rotate(5deg);
        }
        to {
            opacity: 1;
            transform: translateY(0) rotate(var(--rot));
        }
    }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', init);
