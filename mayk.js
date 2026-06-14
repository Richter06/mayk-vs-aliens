const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

function ajustarCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

ajustarCanvas();
window.addEventListener("resize", ajustarCanvas);

// =========================
// INTRO
// =========================
const video = document.getElementById("introVideo");

let jogoIniciado = false;

// libera play do vídeo (som só funciona aqui por causa do browser)
document.addEventListener("click", () => {
    video.muted = false;
    video.play().catch(()=>{});
}, { once: true });

video.addEventListener("ended", () => {
    video.style.display = "none";
    iniciarJogo();
});


// botão de pular intro
const skipBtn = document.getElementById("skipBtn");

function finalizarIntro() {
    video.pause();
    video.style.display = "none";

    const skipBtn = document.getElementById("skipBtn");
    if (skipBtn) skipBtn.style.display = "none";

    iniciarJogo();
}

video.addEventListener("ended", () => {
    finalizarIntro();
});

skipBtn.addEventListener("click", finalizarIntro);



// =========================
// ÁUDIO
// =========================
const musica = new Audio("../sounds/mayk.mp3");
musica.loop = true;
musica.volume = 0.4;

const somRaio = new Audio("../sounds/alienBeam.mp3");
somRaio.volume = 0.5;

const somNave = new Audio("../sounds/shipSound.mp3");
somNave.volume = 0.3;
somNave.loop = true;

let somNaveAtivo = false;

// =========================
// IMAGENS
// =========================
const fundo = new Image();
fundo.src = "../sprites/fazenda.png";

const alienRight = new Image();
alienRight.src = "../sprites/alienRight.png";

const alienLeft = new Image();
alienLeft.src = "../sprites/alienLeft.png";

const alienBeamRight = new Image();
alienBeamRight.src = "../sprites/alienBeamRight.png";

const alienBeamLeft = new Image();
alienBeamLeft.src = "../sprites/alienBeamLeft.png";

const maykRight = new Image();
maykRight.src = "../sprites/mayksRight.png";

const maykLeft = new Image();
maykLeft.src = "../sprites/mayksLeft.png";

// =========================
// ESTADO
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
            somNave.play().catch(()=>{});
            somNaveAtivo = true;
        }
    }

    if (event.key === "d" || event.key === "ArrowRight") {
        naveX += 10;
        direcao = "right";

        if (!somNaveAtivo) {
            somNave.currentTime = 0;
            somNave.play().catch(()=>{});
            somNaveAtivo = true;
        }
    }

    if (event.key === " ") {
        abduzindo = true;
        somRaio.currentTime = 0;
        somRaio.play().catch(()=>{});
    }
});

document.addEventListener("keyup", (event) => {

    if (event.key === " ") {
        abduzindo = false;
    }

    if (
        event.key === "a" ||
        event.key === "ArrowLeft" ||
        event.key === "d" ||
        event.key === "ArrowRight"
    ) {
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

    jogoIniciado = true;

    musica.play().catch(()=>{});

    desenhar();
}

// =========================
// LOOP
// =========================
function desenhar() {

    if (!jogoIniciado) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(fundo, 0, 0, canvas.width, canvas.height);

    const spriteAtual = obterSpriteAtual();
    const larguraSprite = spriteAtual.width * escalaNave;
    const alturaSprite = spriteAtual.height * escalaNave;

    naveX = Math.max(0, naveX);
    naveX = Math.min(canvas.width - larguraSprite, naveX);

    ctx.drawImage(spriteAtual, naveX, naveY, larguraSprite, alturaSprite);

    const agora = performance.now();

    if (!maykCapturado) {

        const centroMayk = mayk.x + mayk.largura / 2;
        const centroNave = naveX + larguraSprite / 2;
        const distancia = Math.abs(centroMayk - centroNave);

        const medoDaNave = 220;

        if (agora >= mayk.proximaDecisao) {

            if (distancia < medoDaNave) {

                if (centroMayk < centroNave) {
                    mayk.velocidade = -Math.abs(mayk.velocidade);
                    mayk.direcao = "left";
                } else {
                    mayk.velocidade = Math.abs(mayk.velocidade);
                    mayk.direcao = "right";
                }

                mayk.proximaDecisao = agora + 600 + Math.random() * 300;

            } else {

                if (Math.random() < 0.5) {
                    mayk.velocidade *= -1;
                    mayk.direcao = mayk.velocidade > 0 ? "right" : "left";
                }

                mayk.proximaDecisao = agora + 900 + Math.random() * 700;
            }
        }

        mayk.x += mayk.velocidade;

        if (mayk.x <= 0) {
            mayk.x = 0;
            mayk.velocidade = Math.abs(mayk.velocidade);
            mayk.direcao = "right";
        }

        if (mayk.x + mayk.largura >= canvas.width) {
            mayk.x = canvas.width - mayk.largura;
            mayk.velocidade = -Math.abs(mayk.velocidade);
            mayk.direcao = "left";
        }
    }

    if (!maykCapturado) {
        ctx.drawImage(obterSpriteMayk(), mayk.x, mayk.y, mayk.largura, mayk.altura);
    }

    if (abduzindo && !maykCapturado) {

        const larguraSprite = obterSpriteAtual().width * escalaNave;
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
// LOAD
// =========================
let carregadas = 0;
const totalImagens = 7;

function imagemCarregada() {
    carregadas++;
    if (carregadas === totalImagens) {
        desenhar();
    }
}

fundo.onload = imagemCarregada;
alienRight.onload = imagemCarregada;
alienLeft.onload = imagemCarregada;
alienBeamRight.onload = imagemCarregada;
alienBeamLeft.onload = imagemCarregada;
maykRight.onload = imagemCarregada;
maykLeft.onload = imagemCarregada;