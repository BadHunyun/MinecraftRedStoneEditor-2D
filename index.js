const components = {
    "基础方块": [
        "air", "sand", "smoothstone", "obsidian", "slimeblock",
        "honeyblock", "ironblock", "rsblock", "scaffolding", "powderedsnow"
    ],
    "机械元件": [
        "duston", "dustoff", "torchon", "torchoff", "torchlon",
        "torchloff", "torchron", "torchroff", "repeaterlon", "repeaterloff",
        "repeaterron", "repeaterroff", "comparatorlon", "comparatorloff",
        "comparatorron", "comparatorroff", "lampon", "lampoff", "target",
        "pistonu", "pistond", "pistonl", "pistonr", "stickypistonu",
        "stickypistond", "stickypistonl", "stickypistonr", "observeru",
        "observerd", "observerl", "observerr", "dropperu", "dropperd",
        "dropperl", "dropperr", "hopperd", "hopperl", "hopperr",
        "arail", "arailsl", "arailsr", "prail", "prailsl", "prailsr"
    ],
    "装饰方块": [
        "chest", "chestdl", "chestdr", "shulkerboxu", "shulkerboxd",
        "shulkerboxl", "shulkerboxr", "barrel", "cauldron", "composter",
        "crafter", "cake14", "noteblock"
    ],
    "特殊方块": [
        "water", "lava", "ice", "glasst", "glassw", "glazedterracotta",
        "soulsand", "fencegatec", "fencegateo", "trapdooru", "trapdoord",
        "trapdoorl", "trapdoorr", "stairul", "stairur", "stairdl", "stairdr"
    ]
};

const componentNames = {
    'air': '空气',
    'sand': '沙子',
    'smoothstone': '平滑石头',
    'obsidian': '黑曜石',
    'slimeblock': '黏液块',
    'honeyblock': '蜂蜜块',
    'ironblock': '铁块',
    'rsblock': '红石块',
    'duston': '红石粉(充能)',
    'dustoff': '红石粉(未充能)',
    'torchon': '红石火把(开启)',
    'torchoff': '红石火把(关闭)',
    'pistonu': '活塞(上)',
    'pistond': '活塞(下)',
    'pistonl': '活塞(左)',
    'pistonr': '活塞(右)',
    'water': '水',
    'lava': '岩浆',
    'ice': '冰',
    'chest': '箱子',
    'hopperd': '漏斗(下)',
    'arail': '激活铁轨',
    'prail': '动力铁轨',
    'target': '标靶',
    'observeru': '侦测器(上)',
    'scaffolding': '脚手架',
    'powderedsnow': '细雪',
    'slabt': '台阶',
    'soulsand': '灵魂沙'
};

// Global varibles and constants
const imgRoot = 'https://raw.githubusercontent.com/11-90-an/rseditor/main/assets/';
const cols = 200, rows = 200, tileSize = 30;
const lightModeBgColor = [45, 52, 64];
const lightModeGridColor = [90, 100, 120];
const nightModeBgColor = [247, 249, 252];
const nightModeGridColor = [209, 219, 230];
let grid = new Array(cols * rows).fill('air');
let selectedComponent = 'air';
let canvasScale = 1.0; // 初始缩放100%
let offsetX = 0, offsetY = 0;
let isDragging = false;
let dragStartX = 0, dragStartY = 0;
let images = {}; // 存储所有组件图像
let bgColor = [247, 249, 252]; // 默认背景色
let gridLineColor = [209, 219, 230]; // 默认网格线颜色

// 初始化函数
function setup() {
    // 创建画布
    const canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('p5-canvas');
    canvas.mousePressed(canvasMousePressed);

    // 计算初始偏移量使画布居中
    const canvasWidth = cols * tileSize * canvasScale;
    const canvasHeight = rows * tileSize * canvasScale;
    offsetX = (windowWidth - canvasWidth) / 2;
    offsetY = (windowHeight - canvasHeight) / 2;

    loadComponents();

    setupEventListeners();

    updateStatusBar();
}

// 绘制函数
function draw() {
    clear();
    background(bgColor);

    // 应用缩放和平移
    translate(offsetX, offsetY);
    scale(canvasScale);

    // 绘制网格
    drawGrid();

    // 绘制组件
    drawComponents();
}

// 窗口大小变化处理
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

// 绘制网格
function drawGrid() {
    stroke(gridLineColor[0], gridLineColor[1], gridLineColor[2]);
    strokeWeight(1);

    // 计算可视区域
    const startX = max(0, floor((-offsetX / canvasScale) / tileSize) - 1);
    const endX = min(cols, ceil((width - offsetX) / (tileSize * canvasScale)) + 1);
    const startY = max(0, floor((-offsetY / canvasScale) / tileSize) - 1);
    const endY = min(rows, ceil((height - offsetY) / (tileSize * canvasScale)) + 1);

    // 绘制垂直线
    for (let x = startX; x <= endX; x++) {
        line(x * tileSize, startY * tileSize, x * tileSize, endY * tileSize);
    }

    // 绘制水平线
    for (let y = startY; y <= endY; y++) {
        line(startX * tileSize, y * tileSize, endX * tileSize, y * tileSize);
    }
}

// 绘制组件
function drawComponents() {
    noStroke();

    // 计算可视区域
    const startX = max(0, floor((-offsetX / canvasScale) / tileSize) - 1);
    const endX = min(cols, ceil((width - offsetX) / (tileSize * canvasScale)) + 1);
    const startY = max(0, floor((-offsetY / canvasScale) / tileSize) - 1);
    const endY = min(rows, ceil((height - offsetY) / (tileSize * canvasScale)) + 1);

    for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
            const index = y * cols + x;
            if (grid[index] !== 'air') {
                // 如果组件图像已加载
                if (images[grid[index]]) {
                    image(images[grid[index]], x * tileSize, y * tileSize, tileSize, tileSize);
                } else {
                    // 如果未加载，显示占位符
                    fill(255, 50, 50);
                    rect(x * tileSize, y * tileSize, tileSize, tileSize);
                }
            }
        }
    }
}

// 加载组件
function loadComponents() {
    const componentsList = document.getElementById('components-list');
    componentsList.innerHTML = '';

    // 遍历所有分类
    for (const [category, comps] of Object.entries(components)) {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'category';

        // 分类标题
        const title = document.createElement('h3');

        // 添加类别图标
        const icon = document.createElement('i');
        if (category === "基础方块") icon.className = "fas fa-cube";
        else if (category === "机械元件") icon.className = "fas fa-cogs";
        else if (category === "装饰方块") icon.className = "fas fa-paint-brush";
        else if (category === "特殊方块") icon.className = "fas fa-star";

        title.appendChild(icon);
        title.appendChild(document.createTextNode(category));
        categoryDiv.appendChild(title);

        // 组件网格
        const gridDiv = document.createElement('div');
        gridDiv.className = 'components-grid';

        // 添加组件
        comps.forEach(comp => {
            const compDiv = document.createElement('div');
            compDiv.className = 'component';
            compDiv.dataset.name = comp;
            compDiv.innerHTML = `<img src="${imgRoot}${comp}.webp" alt="${comp}">`;

            // 添加点击事件
            compDiv.addEventListener('click', (e) => {
                e.stopPropagation();
                selectComponent(comp);
            });

            gridDiv.appendChild(compDiv);
        });

        categoryDiv.appendChild(gridDiv);
        componentsList.appendChild(categoryDiv);
    }

    // 默认选择空气
    selectComponent('air');
}

// 选择组件
function selectComponent(name) {
    selectedComponent = name;

    // 更新UI
    document.querySelectorAll('.component').forEach(comp => {
        comp.classList.toggle('selected', comp.dataset.name === name);
    });

    // 更新状态栏
    document.querySelector('#current-component span').textContent =
        componentNames[name] || name;

    updateStatusBar();
}

function canvasMousePressed(event) {
    // ++ so why the fuck the js doesn't provide a enum
    if (event.button === 1) { // 中键
        isDragging = true;
        dragStartX = mouseX - offsetX;
        dragStartY = mouseY - offsetY;
        return false; // 防止默认行为
    }

    const gridX = Math.floor((mouseX - offsetX) / (tileSize * canvasScale));
    const gridY = Math.floor((mouseY - offsetY) / (tileSize * canvasScale));

    if (gridX >= 0 && gridX < cols && gridY >= 0 && gridY < rows) {
        const index = gridY * cols + gridX;

        if (grid[index] === selectedComponent) {
            grid[index] = 'air'; // 移除
        } else {
            grid[index] = selectedComponent; // 放置
        }

        updateStatusBar();
    }

    return false;
}

function mouseDragged() {
    if (isDragging) {
        offsetX = mouseX - dragStartX;
        offsetY = mouseY - dragStartY;
    }
}

function mouseReleased() {
    isDragging = false;
}

function updateZoomDisplay() {
    document.querySelector('#canvas-scale span').textContent = `${Math.round(canvasScale * 100)}%`;
    document.querySelector('#zoom-reset span').textContent = `${Math.round(canvasScale * 100)}%`;
}

function updateStatusBar() {
    const placedCount = grid.filter(comp => comp !== 'air').length;
    document.querySelector('#block-count span').textContent = `已放置: ${placedCount} 个组件`;

    updateCursorPosition();
}

function updateCursorPosition() {
    const gridX = Math.floor((mouseX - offsetX) / (tileSize * canvasScale));
    const gridY = Math.floor((mouseY - offsetY) / (tileSize * canvasScale));
    document.querySelector("#cursor-position span").textContent =
        (gridX >= 0 && gridX < cols && gridY >= 0 && gridY < rows)
            ? `坐标: ${gridX}, ${gridY}`
            : "坐标: 0, 0";
}

// 设置昼夜模式切换
function setupDayNightToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('i');
    const themeText = themeToggle.querySelector('span');
    const themeDisplay = document.querySelector('#theme-display span');

    themeToggle.addEventListener('click', (e) => {
        e.stopPropagation();

        const isLight = !document.body.classList.contains('theme-dark');

        // 切换主题
        if (isLight) {
            // 夜间模式
            document.body.classList.add('theme-dark');
            themeIcon.className = 'fas fa-sun';
            themeText.textContent = '日间模式';
            themeDisplay.textContent = '夜间模式';
            bgColor = lightModeBgColor; // 深灰色背景
            gridLineColor = lightModeGridColor; // 深灰色网格线
        } else {
            // 日间模式
            document.body.classList.remove('theme-dark');
            themeIcon.className = 'fas fa-moon';
            themeText.textContent = '夜间模式';
            themeDisplay.textContent = '日间模式';
            bgColor = nightModeBgColor; // 浅色背景
            gridLineColor = nightModeGridColor; // 浅色网格线
        }
    });
}

// 设置缩放控制
function setupZoomControls() {
    document.getElementById('zoom-out').addEventListener('click', (e) => {
        e.stopPropagation();
        canvasScale = Math.max(0.1, canvasScale - 0.1);
        updateZoomDisplay();
    });

    document.getElementById('zoom-in').addEventListener('click', (e) => {
        e.stopPropagation();
        canvasScale = Math.min(2.0, canvasScale + 0.1);
        updateZoomDisplay();
    });

    document.getElementById('zoom-reset').addEventListener('click', (e) => {
        e.stopPropagation();
        canvasScale = 1.0;
        updateZoomDisplay();
    });
}

// 设置事件监听器
function setupEventListeners() {
    // 按钮事件
    document.getElementById('clear-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        clearCanvas();
    });
    document.getElementById('save-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        saveDesign();
    });
    document.getElementById('help-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        showHelp();
    });

    // 搜索功能
    document.getElementById('component-search').addEventListener('input', (e) => {
        e.stopPropagation();
        filterComponents();
    });

    // 全局鼠标事件
    document.addEventListener('mouseup', mouseReleased);
    document.addEventListener('mousemove', mouseDragged);
    document.addEventListener('mousemove', updateCursorPosition);

    // 缩放控制
    setupZoomControls();

    // 昼夜模式切换
    setupDayNightToggle();
}

// 清空画布
function clearCanvas() {
    if (confirm('确定要清空整个画布吗？')) {
        grid.fill('air');
        updateStatusBar();
    }
}

// 保存设计
function saveDesign() {
    alert('开发中...');
}

// 显示帮助
function showHelp() {
    alert('红石编辑器使用说明：\n\n1. 从左侧面板选择组件\n2. 在画布上点击放置组件\n3. 再次点击同一位置可移除组件\n4. 使用鼠标中键拖动画布\n5. 使用底部按钮控制缩放\n6. 清空按钮可重置画布\n7. 右上角可切换昼夜模式');
}

// 组件搜索
function filterComponents() {
    const searchTerm = document.getElementById('component-search').value.toLowerCase();
    document.querySelectorAll('.component').forEach(comp => {
        const compName = comp.dataset.name.toLowerCase();
        comp.style.display = compName.includes(searchTerm) ? 'flex' : 'none';
    });
}

// 预加载所有组件图片
function preload() {
    // 创建所有组件名称的数组
    const allComponents = [];
    for (const comps of Object.values(components)) {
        allComponents.push(...comps);
    }

    // 预加载所有图片
    allComponents.forEach(comp => {
        images[comp] = loadImage(`${imgRoot}${comp}.webp`);
    });
}

// 初始化p5
new p5();
window.preload = preload;
window.setup = setup;
window.draw = draw;
window.windowResized = windowResized;