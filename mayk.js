const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

function ajustarCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

ajustarCanvas();
window.addEventListener("resize", ajustarCanvas);

// Imagens
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

// Direção da nave
let direcao = "right"; // "left" ou "right"

// Pontos
let pontos = 0;

// Nave
let naveX = 350;
const naveY = 485;
const escalaNave = 0.5;

// Raio
let abduzindo = false;

// Mayk
let mayk = {
    x: 400,
    y: canvas.height - 163,
    largura: 60,
    altura: 60,
    velocidade: 3,
    direcao: "right"
};

let maykCapturado = false;

// Teclado
document.addEventListener("keydown", (event) => {
    if (event.key === "a" || event.key === "ArrowLeft") {
        naveX -= 10;
        direcao = "left";
    }

    if (event.key === "d" || event.key === "ArrowRight") {
        naveX += 10;
        direcao = "right";
    }

    if (event.key === " ") {
        abduzindo = true;
    }
});

document.addEventListener("keyup", (event) => {
    if (event.key === " ") {
        abduzindo = false;
    }
});

// Escolhe sprite da nave
function obterSpriteAtual() {
    if (direcao === "right") {
        return abduzindo ? alienBeamRight : alienRight;
    } else {
        return abduzindo ? alienBeamLeft : alienLeft;
    }
}

// Escolhe sprite do Mayk
function obterSpriteMayk() {
    return mayk.direcao === "right" ? maykRight : maykLeft;
}

// Desenho
function desenhar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fundo
    ctx.drawImage(fundo, 0, 0, canvas.width, canvas.height);

    // Nave
    const spriteAtual = obterSpriteAtual();
    const larguraSprite = spriteAtual.width * escalaNave;
    const alturaSprite = spriteAtual.height * escalaNave;

    naveX = Math.max(0, naveX);
    naveX = Math.min(canvas.width - larguraSprite, naveX);

    ctx.drawImage(spriteAtual, naveX, naveY, larguraSprite, alturaSprite);

    // Movimento do Mayk
    if (!maykCapturado) {
        mayk.x += mayk.velocidade;

        if (mayk.velocidade > 0) {
            mayk.direcao = "right";
        } else {
            mayk.direcao = "left";
        }

        if (mayk.x <= 0) {
            mayk.x = 0;
            mayk.velocidade *= -1;
        }

        if (mayk.x + mayk.largura >= canvas.width) {
            mayk.x = canvas.width - mayk.largura;
            mayk.velocidade *= -1;
        }
    }

    // Mayk
    if (!maykCapturado) {
        const spriteMayk = obterSpriteMayk();
        ctx.drawImage(spriteMayk, mayk.x, mayk.y, mayk.largura, mayk.altura);
    }

    // Captura
    if (abduzindo && !maykCapturado) {
        const centroRaio = naveX + larguraSprite / 2;

        if (
            centroRaio >= mayk.x &&
            centroRaio <= mayk.x + mayk.largura
        ) {
            pontos++;
            mayk.velocidade *= 1.1;
            maykCapturado = true;

            setTimeout(() => {
                mayk.x = Math.random() * (canvas.width - mayk.largura);
                maykCapturado = false;
            }, 500);
        }
    }

    // Texto
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Pontos: " + pontos, 20, 40);

    requestAnimationFrame(desenhar);
}

// Começa quando as imagens carregarem
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