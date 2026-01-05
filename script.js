document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Плавное появление секций ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('section').forEach(section => observer.observe(section));

    // --- 2. Интерактивный фон ---
    const canvas = document.getElementById('canvas-container');
    const ctx = canvas.getContext('2d');

    let particles = [];

    let isAdmin = false;

    let atomsDivider = 4500; // Значения по умолчанию
    let connectionDist = 150;
    let connectionGlow = 250;

    let consoleHistoryArray = []; // Массив всех введенных команд
    let historyIndex = -1;         // Текущая позиция при просмотре истории

    let scrollY = window.scrollY;
    const mouse = { x: null, y: null, radius: 180 };
    let isMouseDown = false;

    const COLOR_DEFAULT = { r: 255, g: 96, b: 0 };   
    const COLOR_REPEL = { r: 0, g: 209, b: 255 };    
    const COLOR_ATTRACT = { r: 255, g: 255, b: 255 }; 

    function setCanvasSize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    setCanvasSize();

    window.addEventListener('resize', () => { setCanvasSize(); initParticles(); });
    window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
    window.addEventListener('mousedown', () => isMouseDown = true);
    window.addEventListener('mouseup', () => isMouseDown = false);
    window.addEventListener('scroll', () => { scrollY = window.scrollY; });

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * (canvas.height + 500); 
            this.size = Math.random() * 2 + 0.5;
            this.density = (Math.random() * 20) + 1;
            this.speedX = (Math.random() * 0.4) - 0.2;
            this.speedY = (Math.random() * 0.4) - 0.2;
            this.color = { ...COLOR_DEFAULT };
        }
        lerpColor(target, speed) {
            this.color.r += (target.r - this.color.r) * speed;
            this.color.g += (target.g - this.color.g) * speed;
            this.color.b += (target.b - this.color.b) * speed;
        }
        update() {
            this.x += this.speedX; this.y += this.speedY;
            if (mouse.x !== null) {
                let dx = mouse.x - this.x;
                let dy = (mouse.y + scrollY * 0.3) - this.y; 
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    if (isMouseDown) {
                        this.x += (dx / distance) * force * 6;
                        this.y += (dy / distance) * force * 6;
                        this.lerpColor(COLOR_ATTRACT, 0.2);
                    } else {
                        this.x -= (dx / distance) * force * this.density * 0.4;
                        this.y -= (dy / distance) * force * this.density * 0.4;
                        this.lerpColor(COLOR_REPEL, 0.15);
                    }
                } else { this.lerpColor(COLOR_DEFAULT, 0.02); }
            }
            if (this.x > canvas.width + 50) this.x = -50;
            if (this.x < -50) this.x = canvas.width + 50;
            if (this.y > canvas.height + 1000) this.y = -500;
            if (this.y < -500) this.y = canvas.height + 1000;
        }
        draw() {
            ctx.fillStyle = `rgb(${Math.floor(this.color.r)}, ${Math.floor(this.color.g)}, ${Math.floor(this.color.b)})`;
            ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        let quantity = (canvas.height * canvas.width) / atomsDivider;
        for (let i = 0; i < quantity; i++) particles.push(new Particle());
    }

    function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    
    // Этот translate синхронизирует отрисовку с положением скролла
    ctx.translate(0, -scrollY * 0.3);

    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        for (let j = i + 1; j < particles.length; j++) {
            let dx = particles[i].x - particles[j].x;
            let dy = particles[i].y - particles[j].y;
            let dist = Math.sqrt(dx * dx + dy * dy);

            // Увеличим дистанцию соединения до 150, так как поле стало больше
            if (dist < connectionDist) {
                ctx.beginPath();
                let opacity = 1 - (dist / connectionGlow);
                ctx.strokeStyle = `rgba(${particles[i].color.r}, ${particles[i].color.g}, ${particles[i].color.b}, ${opacity * 0.2})`;
                ctx.lineWidth = 0.5;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
    ctx.restore();
    requestAnimationFrame(animate);
    }   

    // --- 3. Модальные окна ---
    const projectData = {
        "Manus Age": {  
            desc: "Моя первая полноценная игра на Unity и первый опыт доведения проекта до конца, созданная для летней практики первого курса университета. Внутри находится редактор карт, позволяющий создавать свои собственные колоды с картинками для лучшего запоминания. Подходит детям дошкольного возраста под присмотром взрослых.\n\n[Unity] [C#] [2D]",
            image: "img/manus-age.png",
            githubUrl: "",
            itchUrl: "https://koba-fix.itch.io/manus-age",
            steamUrl: ""
         },
        "Half-Life 2: Freeman Paradox": { 
            desc: "Визуальная новелла на Ren'Py. Ранее называлась \"Half-Life Multiverse\" и имела другой вектор развития. Всё еще есть возможность скачать и ознакомиться со старой концепцией новеллы. Ныне HL2FP концентрирует своё внимание на личности Гордона Фримена в сеттинге Half-Life 2 Beta (leaks). Он, как наблюдатель, оправдывает каждый выбор игрока, каким бы он не был ужасным.\n\n[Ren'Py] [Python] [Narrative]",
            image: "img/hl2fp.png",
            githubUrl: "",
            itchUrl: "https://koba-fix.itch.io/hl2fp",
            steamUrl: ""
        },
        "Garry's Mod Workshop": { 
            desc: "Портирование карты \"Ангар\" из игры Warface.\nСоздание собственных карт, такие как Лаборатория Альмы.\nПереработка карт с использованием исходников: rp_downtown в rp_downtown_lp_dk174_winter.\nСоздание кастомной аптечки для MilitaryRP сервера. Аптечка обладает такими функциями как: самолечение, лечение игрока/NPC напротив, выкинуть аптечку (задержка 8 секунд, после выбрасывания новой аптечки старая удаляется).\n\n[Garry's Mod] [GLua] [Mapping]",
            image: "img/alma.png",
            githubUrl: "",
            itchUrl: "",
            steamUrl: "https://steamcommunity.com/id/fox1741/myworkshopfiles/"
        },
        "FileTagger": { 
            desc: "Файловый теговый менеджер, использующий локальную базу данных для хранения ссылок на файлы с прикрепленными к ним тегами, удобной системой поиска, сортировки и перехода к нужному файлу или папке.\n\n[C#] [WinForms] [SQL]",
            image: "img/ft.png",
            githubUrl: "",
            itchUrl: "",
            steamUrl: ""
        },
        "Freezegun": { 
            desc: "Небольшой проект, вдохновлённый Portal 2 и Garry's Mod. Создан на Unity за сутки или около того, первый \"законченный\" собственный проект. Хотелось бы продолжить его разработку, но нет идей для развития.\n\n[Unity] [C#] [Puzzle]",
            image: "img/fg.png",
            githubUrl: "",
            itchUrl: "https://koba-fix.itch.io/freezegun",
            steamUrl: ""
        },
        "Project Alef": { 
            desc: "Симулятор орбитальной механики. Изначально хотелось повторить в облегченной форме Aurora 4x. Возможно в будущем он будет улучшаться.\n\n[Python] [Tkinter] [Physics]",
            image: "img/pa.png",
            githubUrl: "https://github.com/Fantom1741/project-alef",
            itchUrl: "",
            steamUrl: ""
        },
        "legacy Projects": { 
            desc: "Моя идея по портированию карт из Warface по сути остановилась на Ангаре. Были попытки сделать Объект Д17, но вскоре я их забросил из-за не полного понимая геометрии той карты и отсутствия опыта в создании качественных моделей.\n\nМоей давней мечтой было создать игру про оружейника, который мог бы создавать любое оружие, заказывая его части из интернета. Есть игра, построенная на этом: Weapon Genius, - но  она больше шуточная, нежели серьёзная.\n\nВ конце 2025 года у меня появилась идея создать полностью свою ролевую карту для Garry's Mod, однако она не пережила столкновение с реальностью. Я не умею создавать открытые некоридорные карты.\n\n// TOP SECRET //",
            githubUrl: "",
            itchUrl: "",
            steamUrl: ""
        }
    };

    const modal = document.getElementById("project-modal");
    const closeBtn = document.querySelector(".close-button");

    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('click', () => {
            const title = card.querySelector('.project-title').innerText.trim();
            // Поиск данных (игнорируем регистр и лишние пробелы)
            const key = Object.keys(projectData).find(k => k.toLowerCase() === title.toLowerCase());
            const data = projectData[key];

            if (data) {
                document.getElementById("modal-title").innerText = key;
                document.getElementById("modal-full-desc").innerText = data.desc;

                const modalImg = document.getElementById("modal-img");
                const imgFallback = document.getElementById("img-fallback");
                const imgContainer = modalImg.parentElement;

                if (data.image) {
                    modalImg.src = data.image;
                    imgContainer.classList.add("has-image");
                    modalImg.style.display = "block";
                    imgFallback.style.display = "none";
                } else {
                    imgContainer.classList.remove("has-image");
                    modalImg.style.display = "none";
                    imgFallback.style.display = "block";
                }

                const gitBtn = document.getElementById("modal-link-git");
                const demoBtn = document.getElementById("modal-link-itch");
                const steamBtn = document.getElementById("modal-link-steam");

                // Логика для кнопки GitHub
                if (data.githubUrl) {
                    gitBtn.href = data.githubUrl;
                    gitBtn.style.display = "inline-block";
                } else {
                    gitBtn.style.display = "none";
                }

                // Логика для кнопки Demo/Itch.io
                if (data.itchUrl) {
                    demoBtn.href = data.itchUrl;
                    demoBtn.style.display = "inline-block";
                } else {
                    demoBtn.style.display = "none";
                }

                if (data.steamUrl) {
                    steamBtn.href = data.steamUrl;
                    steamBtn.style.display = "inline-block";
                } else {
                    steamBtn.style.display = "none";
                }

                modal.style.display = "block";
                document.body.style.overflow = "hidden";
            }
        });
    });

    if (closeBtn) {
        closeBtn.onclick = () => {
            modal.style.display = "none";
            document.body.style.overflow = "auto";
        };
    }

    window.onclick = (e) => { 
        if (e.target == modal) { 
            modal.style.display = "none"; 
            document.body.style.overflow = "auto"; 
        } 
    };

    initParticles();
    animate();

    const consoleEl = document.getElementById('developer-console');
    const consoleInput = document.getElementById('console-input');
    const consoleHistory = document.getElementById('console-history');

    // Открытие/закрытие на Тильду (Ё)
    window.addEventListener('keydown', (e) => {
        if (e.key === '`' || e.key === '~' || e.key === 'ё' || e.keyCode === 192) {
            e.preventDefault();
            
            const isHidden = consoleEl.classList.toggle('console-hidden');
            
            if (!isHidden) {
                // Если открыли — ставим фокус
                setTimeout(() => consoleInput.focus(), 100);
            } else {
                // Если закрыли — убираем фокус и очищаем поле (по желанию)
                consoleInput.blur();
            }
        }
    });

    function logToConsole(text, type = '') {
        const line = document.createElement('div');
        line.className = `console-line ${type}`;
        line.innerText = text;
        consoleHistory.appendChild(line);
        consoleHistory.scrollTop = consoleHistory.scrollHeight;
    }

    consoleInput.addEventListener('keydown', (e) => {
        if (consoleEl.classList.contains('console-hidden')) {
            return;
        }
        if (e.key === 'Enter') {
            const command = consoleInput.value.trim().toLowerCase();
            logToConsole(`] ${command}`, 'command');
            if (command.length > 0) {
                // Сохраняем в историю, только если команда не дублирует предыдущую
                if (consoleHistoryArray[consoleHistoryArray.length - 1] !== command) {
                    consoleHistoryArray.push(command);
                }
                historyIndex = -1; // Сбрасываем индекс истории
                
                processCommand(command.toLowerCase()); // Твой switch(command) вынеси в эту функцию
                consoleInput.value = '';
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (consoleHistoryArray.length > 0) {
                // Двигаемся назад по истории
                if (historyIndex === -1) historyIndex = consoleHistoryArray.length - 1;
                else if (historyIndex > 0) historyIndex--;
                
                consoleInput.value = consoleHistoryArray[historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (consoleHistoryArray.length > 0 && historyIndex !== -1) {
                // Двигаемся вперед по истории
                if (historyIndex < consoleHistoryArray.length - 1) {
                    historyIndex++;
                    consoleInput.value = consoleHistoryArray[historyIndex];
                } else {
                    historyIndex = -1;
                    consoleInput.value = ''; // Очищаем поле, если дошли до конца
                }
            }
        }
    });

    function processCommand(command) {
        switch(command) {
            case 'help':
                logToConsole('Navigate: about, skills, contact.\nAvailable commands: atoms <value>, clear, credits, color <value>, gravity <value>, links [-g] <value>');
                break;
            case 'system':
                logToConsole('Navigate: about, skills, contact.\nAvailable commands: atoms <value>, clear, credits, color <value>,  gravity <value>, links [-g] <value>, login <login>, logout, scan, whoami');
                break;
            case 'about':
                document.getElementById('about').scrollIntoView({behavior: 'smooth'});
                break;
            case 'skills':
                document.getElementById('skills').scrollIntoView({behavior: 'smooth'});
                break;
            case 'atoms':
                logToConsole('Usage: atoms <value> (lower value = more atoms, default atoms 4500). Minimum 1000.', 'error');
                break;
            case 'clear':
                consoleHistory.innerHTML = '';
                break;
            case 'color':
                logToConsole('Usage: color <value> (e.g. color #00ff00 or color white) change site color', 'error');
                break;
            case 'credits':
                logToConsole('Lead Developer: Artem Tarasenkov');
                logToConsole('AI-Tools: Gemini 3');
                break;
            case 'gravity':
                logToConsole('Usage: gravity <value> change distance of repulsion to atoms. default gravity 180', 'error');
                break;
            case 'links':
                logToConsole('Usage: links <value> change needed distance to atom to form link | links -g <value> change power of glow the links | links 150 -g 250', 'error');
                break;
            case 'login':
                logToConsole('Secret command! Don\'t write this!', 'error');
                break;
            case 'logout':
                if (!isAdmin) {
                    logToConsole('No active session found.', 'error');
                    return;
                }
                isAdmin = false;
                logToConsole('Terminating administrative session...', 'command');
                
                let cleanup = 0;
                const logoutInterval = setInterval(() => {
                    cleanup += 33;
                    logToConsole(`Clearing logs and traces... ${cleanup}%`);
                    
                    if (cleanup >= 100) {
                        clearInterval(logoutInterval);
                        lockSecret(); // Вызываем функцию закрытия
                    }
                }, 300);
                break;
            case 'scan':
                const files = ['assets/styles.css', 'scripts/engine.js', 'assets/images/screenshot_1.jpg', 'config/system.env', 'database/projects.db', 'assets/github.exe'];
                logToConsole('Starting system deep scan...', 'command');
                let errors = 0
                
                files.forEach((file, index) => {
                    setTimeout(() => {
                        const status = Math.random() > 0.15 ? 'OK' : 'CORRUPTED';
                        if (status == 'CORRUPTED') { errors += 1 }
                        const color = status === 'OK' ? '' : 'error';
                        logToConsole(`Checking ${file}... [${status}]`, color);
                        
                        if (index === files.length - 1) {
                            let checkStatus = 100 * (files.length - errors) / files.length
                            setTimeout(() => logToConsole(`Scan complete. System integrity: ${checkStatus.toFixed(1)}%`, 'command'), 500);
                        }
                    }, index * 200);
                });
                break;
            case 'whoami':
                if (isAdmin) {
                    logToConsole('Current user: Administrator (Artem_Tarasenkov)');
                    logToConsole('Access level: Root / All systems operational');
                } else {
                    logToConsole('Current user: Guest');
                    logToConsole('Access level: Restricted (Read-only)');
                }
                break;
            default:
                if (command.startsWith('atoms ')) {
                    let value = parseInt(command.split(' ')[1]);
                    
                    if (value < 1000) value = 1000;

                    if (!isNaN(value) && value > 0) {
                        atomsDivider = value; // Обновляем делитель
                        initParticles();      // Перезапускаем частицы
                        logToConsole(`Atoms density updated. Divider: ${value}. Total: ${particles.length} particles.`);
                    } else {
                        logToConsole('Invalid value. Please enter a positive number.', 'error');
                    }
                } else if (command.startsWith('color ')) {
                    let newColor = command.split(' ')[1];
                    if (newColor == "default") {newColor = "#FF6000"}
                    const glassBorder = `color-mix(in srgb, ${newColor}, transparent 70%)`;
                    const glassHover = `color-mix(in srgb, ${newColor}, transparent 80%)`;
                    
                    document.documentElement.style.setProperty('--primary', newColor);
                    document.documentElement.style.setProperty('--glass-border', glassBorder);
                    document.documentElement.style.setProperty('--glass-hover', glassHover);

                    const newRGB = getRGBFromCSS('--primary');
                    COLOR_DEFAULT.r = newRGB.r;
                    COLOR_DEFAULT.g = newRGB.g;
                    COLOR_DEFAULT.b = newRGB.b;

                    particles.forEach(p => {
                        p.color = { ...newRGB };
                    });

                    logToConsole(`Colors updated to: ${newColor}`);
                } else if (command.startsWith('gravity ')) {
                    const val = parseInt(command.split(' ')[1]);
                    if (!isNaN(val)) {
                        mouse.radius = val; // Меняем радиус влияния мыши
                        logToConsole(`Gravity radius set to: ${val}`);
                    } else {
                        logToConsole('Invalid value.', 'error');
                    }
                } else if (command.startsWith('links ')) {
                    const args = command.split(' '); // Разрезаем команду по пробелам

                    // 1. Проверка флага -g
                    const glowIndex = args.indexOf('-g');
                    if (glowIndex !== -1) {
                        const glowStr = args[glowIndex + 1];
                        const glowVal = parseInt(glowStr);

                        // Проверяем: есть ли значение ПОСЛЕ -g И является ли оно чистым числом
                        if (glowStr && !isNaN(glowVal) && /^\d+$/.test(glowStr)) {
                            connectionGlow = glowVal;
                            logToConsole(`Connection glow set to: ${glowVal}`);
                        } else {
                            logToConsole(`Error: "${glowStr || ''}" is not a valid number for glow.`, 'error');
                        }
                    }

                    // 2. Проверка основного значения дистанции
                    // Берем первый аргумент, если это не флаг -g
                    if (args[1] !== '-g') {
                        const distStr = args[1];
                        const distVal = parseInt(distStr);

                        if (!isNaN(distVal) && /^\d+$/.test(distStr)) {
                            connectionDist = distVal;
                            logToConsole(`Connection distance set to: ${distVal}`);
                        } else {
                            logToConsole(`Error: "${distStr}" is not a valid number for distance.`, 'error');
                        }
                    }
                } else if (command.startsWith('login ')) {
                    if (isAdmin) {
                        logToConsole('Session active! Please type logout to close session.', 'error');
                        return;
                    }
                    let args = command.split(' ')[1];
                    if (args === 'admin') {
                        isAdmin = true;
                        logToConsole('Requesting administrative access...', 'command');
                        
                        let progress = 0;
                        const interval = setInterval(() => {
                            progress += 25;
                            logToConsole(`Bypassing firewall... ${progress}%`);
                            
                            if (progress >= 100) {
                                clearInterval(interval);
                                unlockSecret();
                            }
                        }, 400);
                    } else {
                        logToConsole('Access denied. Invalid credentials.', 'error');
                    }
                } else {
                    logToConsole(`Unknown command: ${command}`, 'error');
                }
            }
    }

    const mobileBtn = document.getElementById('console-mobile-toggle');

    mobileBtn.addEventListener('click', () => {
        const isHidden = consoleEl.classList.toggle('console-hidden');
        
        if (!isHidden) {
            setTimeout(() => consoleInput.focus(), 100);
            mobileBtn.style.background = '#fff'; // Меняем цвет кнопки, когда консоль открыта
        } else {
            consoleInput.blur();
            mobileBtn.style.background = 'var(--primary)';
        }
    });

});

// --- ЭФФЕКТ ДЕШИФРОВКИ (SCRAMBLE) ---
const scrambleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789/?!@#$%^&*()_+<>αβγδεζηθιλμξρστϒφχψωΔΘΛΞπΣΦΨΩ";

class TextScramble {
    constructor(el) {
        this.el = el;
        this.chars = scrambleChars;
        this.update = this.update.bind(this);
    }
    setText(newText) {
        const oldText = this.el.innerText;
        const length = Math.max(oldText.length, newText.length);
        const promise = new Promise((resolve) => this.resolve = resolve);
        this.queue = [];
        for (let i = 0; i < length; i++) {
            const from = oldText[i] || '';
            const to = newText[i] || '';
            const start = Math.floor(Math.random() * 40);
            const end = start + Math.floor(Math.random() * 40);
            this.queue.push({ from, to, start, end });
        }
        cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.update();
        return promise;
    }
    update() {
        let output = '';
        let complete = 0;
        for (let i = 0, n = this.queue.length; i < n; i++) {
            let { from, to, start, end, char } = this.queue[i];
            if (this.frame >= end) {
                complete++;
                output += to;
            } else if (this.frame >= start) {
                if (!char || Math.random() < 0.28) {
                    char = this.chars[Math.floor(Math.random() * this.chars.length)];
                    this.queue[i].char = char;
                }
                output += `<span style="color: var(--primary)">${char}</span>`;
            } else {
                output += from;
            }
        }
        this.el.innerHTML = output;
        if (complete === this.queue.length) {
            this.resolve();
        } else {
            this.frameRequest = requestAnimationFrame(this.update);
            this.frame++;
        }
    }
}

// Инициализация при наведении
document.querySelectorAll('.scramble-text').forEach(el => {
    const fx = new TextScramble(el);
    const originalText = el.getAttribute('data-text');
    
    el.addEventListener('mouseenter', () => {
        fx.setText(originalText);
    });
});

function getRGBFromCSS(variableName) {
    // Создаем временный элемент, чтобы браузер сам вычислил цвет
    const temp = document.createElement('div');
    temp.style.color = getComputedStyle(document.documentElement).getPropertyValue(variableName);
    document.body.appendChild(temp);
    const styles = getComputedStyle(temp).color; // возвращает "rgb(r, g, b)"
    document.body.removeChild(temp);
    
    const rgb = styles.match(/\d+/g).map(Number);
    return { r: rgb[0], g: rgb[1], b: rgb[2] };
}

function unlockSecret() {
    const secretCard = document.getElementById('secret-project');
    
    // Эффект вспышки на странице
    document.body.style.filter = 'invert(1)';
    setTimeout(() => {
        document.body.style.filter = 'none';
        
        // Показываем секретный проект
        secretCard.style.display = 'flex';
        secretCard.classList.add('visible'); // Чтобы сработала твоя анимация появления
        
        logToConsole('ACCESS GRANTED. New data decrypted.', 'command');
        
        // Скроллим к новому проекту
        secretCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Можно даже сменить цвет темы на "хакерский" красный
        document.documentElement.style.setProperty('--primary', '#ff0000');
    }, 200);
}

function lockSecret() {
    const secretCard = document.getElementById('secret-project');
    
    // Эффект "выключения" — экран на миг чернеет
    document.body.style.transition = 'opacity 0.2s';
    document.body.style.opacity = '0';

    setTimeout(() => {
        // Возвращаем стандартные цвета
        document.documentElement.style.setProperty('--primary', '#FF6000');
        document.documentElement.style.setProperty('--glass-border', 'rgba(255, 96, 0, 0.3)');
        
        // Прячем секрет
        secretCard.style.display = 'none';
        
        // Возвращаем видимость сайта
        document.body.style.opacity = '1';
        
        logToConsole('LOGOUT SUCCESSFUL. Guest mode active.', 'command');
        
        // Скроллим в самое начало страницы
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Очищаем историю консоли (опционально, для пущей секретности)
        // consoleHistory.innerHTML = ''; 
    }, 500);
}