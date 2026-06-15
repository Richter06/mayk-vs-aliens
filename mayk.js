const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

// =========================
// CANVAS
// =========================
function ajustarCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
ajustarCanvas();
window.addEventListener("resize", ajustarCanvas);

// =========================
// ESTADO GLOBAL
// =========================
let jogoIniciado = false;
let assetsCarregados = false;

// =========================
// INTRO
// =========================
const video = document.getElementById("introVideo");
const skipBtn = document.getElementById("skipBtn");

// clique libera áudio do vídeo (browser policy)
document.addEventListener("click", () => {
    video.muted = false;
    video.play().catch(() => {});
}, { once: true });

// função única de finalizar intro
function finalizarIntro() {
    if (jogoIniciado) return;

    video.pause();
    video.style.display = "none";

    if (skipBtn) skipBtn.style.display = "none";

    iniciarJogo();
}

video.addEventListener("ended", finalizarIntro);
skipBtn?.addEventListener("click", finalizarIntro);

// =========================
// ÁUDIO
// =========================
const musica = new Audio("./sounds/mayk.mp3");
musica.loop = true;
musica.volume = 0.4;

const somRaio = new Audio("./sounds/alienBeam.mp3");
somRaio.volume = 0.5;

const somNave = new Audio("./sounds/shipSound.mp3");
somNave.volume = 0.3;
somNave.loop = true;

let somNaveAtivo = false;

// =========================
// IMAGENS (com proteção contra 404)
// =========================
function safeImage(src) {
    const img = new Image();
    img.src = src;

    img.onerror = () => {
        console.error("Imagem não encontrada:", src);
        img._broken = true;
    };

    return img;
}

const fundo = safeImage("./sprites/fazenda.png");

const alienRight = safeImage("./sprites/alienRight.png");
const alienLeft = safeImage("./sprites/alienLeft.png");

const alienBeamRight = safeImage("./sprites/alienBeamRight.png");
const alienBeamLeft = safeImage("./sprites/alienBeamLeft.png");

const maykRight = safeImage("./sprites/mayksRight.png");
const maykLeft = safeImage("./sprites/mayksLeft.png");

// =========================
// ESTADO DO JOGO
// =========================
let direcao = "right";
let pontos = 0;
let dificuldade = 1;

let naveX = 350;
const naveY = 485;
const escalaNave = 0.5;

let abduzindo = false;

const larguraMayk = 60;
const alturaMayk = 60;

// =========================
// MAYK
// =========================
function criarMayk() {
    const velocidadeBase = (Math.random() * 2 + 2) * dificuldade;
    const direcaoInicial = Math.random() < 0.5 ? -1 : 1;

    return {
        x: Math.random() * Math.max(1, canvas.width - larguraMayk),
        y: canvas.height - 163,
        largura: larguraMayk,
        altura: alturaMayk,
        velocidade: velocidadeBase * direcaoInicial,
        direcao: direcaoInicial > 0 ? "right" : "left",
        proximaDecisao: 0
    };
}

let mayk = criarMayk();
let maykCapturado = false;

// =========================
// INPUT
// =========================
document.addEventListener("keydown", (event) => {

    if (event.key === "a" || event.key === "ArrowLeft") {
        naveX -= 10;
        direcao = "left";

        if (!somNaveAtivo) {
            somNave.currentTime = 0;
            somNave.play().catch(() => {});
            somNaveAtivo = true;
        }
    }

    if (event.key === "d" || event.key === "ArrowRight") {
        naveX += 10;
        direcao = "right";

        if (!somNaveAtivo) {
            somNave.currentTime = 0;
            somNave.play().catch(() => {});
            somNaveAtivo = true;
        }
    }

    if (event.key === " ") {
        abduzindo = true;
        somRaio.currentTime = 0;
        somRaio.play().catch(() => {});
    }
});

document.addEventListener("keyup", (event) => {

    if (event.key === " ") {
        abduzindo = false;
    }

    if (["a","d","ArrowLeft","ArrowRight"].includes(event.key)) {
        somNave.pause();
        somNave.currentTime = 0;
        somNaveAtivo = false;
    }
});

// =========================
// SPRITES
// =========================
function obterSpriteAtual() {
    if (direcao === "right") {
        return abduzindo ? alienBeamRight : alienRight;
    } else {
        return abduzindo ? alienBeamLeft : alienLeft;
    }
}

function obterSpriteMayk() {
    return mayk.direcao === "right" ? maykRight : maykLeft;
}

// =========================
// START JOGO
// =========================
function iniciarJogo() {
    if (jogoIniciado) return;
    if (!assetsCarregados) return;

    jogoIniciado = true;

    musica.play().catch(() => {});

    requestAnimationFrame(desenhar);
}

// =========================
// LOOP
// =========================
function desenhar() {

    if (!jogoIniciado) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!fundo._broken) {
        ctx.drawImage(fundo, 0, 0, canvas.width, canvas.height);
    }

    const spriteAtual = obterSpriteAtual();
    const larguraSprite = spriteAtual.width * escalaNave;
    const alturaSprite = spriteAtual.height * escalaNave;

    naveX = Math.max(0, Math.min(canvas.width - larguraSprite, naveX));

    if (!spriteAtual._broken) {
        ctx.drawImage(spriteAtual, naveX, naveY, larguraSprite, alturaSprite);
    }

    const agora = performance.now();

    if (!maykCapturado) {

        const centroMayk = mayk.x + mayk.largura / 2;
        const centroNave = naveX + larguraSprite / 2;
        const distancia = Math.abs(centroMayk - centroNave);

        const medo = 220;

        if (agora >= mayk.proximaDecisao) {

            if (distancia < medo) {
                mayk.velocidade *= (centroMayk < centroNave ? -1 : 1);
                mayk.direcao = mayk.velocidade > 0 ? "right" : "left";
                mayk.proximaDecisao = agora + 600;
            } else {
                if (Math.random() < 0.5) {
                    mayk.velocidade *= -1;
                    mayk.direcao = mayk.velocidade > 0 ? "right" : "left";
                }
                mayk.proximaDecisao = agora + 900;
            }
        }

        mayk.x += mayk.velocidade;

        if (mayk.x <= 0) mayk.x = 0;
        if (mayk.x + mayk.largura >= canvas.width)
            mayk.x = canvas.width - mayk.largura;
    }

    if (!maykCapturado && !obterSpriteMayk()._broken) {
        ctx.drawImage(obterSpriteMayk(), mayk.x, mayk.y, mayk.largura, mayk.altura);
    }

    if (abduzindo && !maykCapturado) {

        const centroRaio = naveX + larguraSprite / 2;

        if (centroRaio >= mayk.x && centroRaio <= mayk.x + mayk.largura) {

            pontos++;
            dificuldade += 0.05;

            maykCapturado = true;

            setTimeout(() => {
                mayk = criarMayk();
                maykCapturado = false;
            }, 500);
        }
    }

    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Pontos: " + pontos, 20, 40);

    requestAnimationFrame(desenhar);
}

// =========================
// LOAD SYSTEM
// =========================
let carregadas = 0;
const total = 7;

function onLoad() {
    carregadas++;
    if (carregadas === total) {
        assetsCarregados = true;
        console.log("Assets carregados");
    }
}

[
fundo,
alienRight, alienLeft,
alienBeamRight, alienBeamLeft,
maykRight, maykLeft
].forEach(img => img.onload = onLoad);