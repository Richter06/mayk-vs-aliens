const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

function ajustarCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

ajustarCanvas();
window.addEventListener("resize", ajustarCanvas);

//Musica
const musica = new Audio("../sounds/mayk.mp3");
musica.loop = true;
musica.volume = 0.4;

//Efeitos sonoros
const somRaio = new Audio("../sounds/alienBeam.mp3");
somRaio.volume = 0.5;



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
let direcao = "right";

// Pontos + dificuldade
let pontos = 0;
let dificuldade = 1;

// Nave
let naveX = 350;
const naveY = 485;
const escalaNave = 0.5;

// Raio
let abduzindo = false;

// Mayk
const larguraMayk = 60;
const alturaMayk = 60;

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

        somRaio.currentTime = 0; // reinicia o som
        somRaio.play();
    }
});

document.addEventListener("keyup", (event) => {
    if (event.key === " ") {
        abduzindo = false;
    }
});

// Sprite da nave
function obterSpriteAtual() {
    if (direcao === "right") {
        return abduzindo ? alienBeamRight : alienRight;
    } else {
        return abduzindo ? alienBeamLeft : alienLeft;
    }
}

// Sprite do Mayk
function obterSpriteMayk() {
    return mayk.direcao === "right" ? maykRight : maykLeft;
}


//Musica play
let musicaIniciada = false;

function iniciarMusica() {
    if (musicaIniciada) return;

    musica.play()
        .then(() => {
            musicaIniciada = true;
        })
        .catch((err) => {
            console.log("Áudio bloqueado:", err);
        });
}

window.addEventListener("pointerdown", iniciarMusica);
window.addEventListener("keydown", iniciarMusica);


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

    const agora = performance.now();

    // =========================
    // MAYK IA
    // =========================
    if (!maykCapturado) {

        const centroMayk = mayk.x + mayk.largura / 2;
        const centroNave = naveX + larguraSprite / 2;
        const distancia = Math.abs(centroMayk - centroNave);

        const medoDaNave = 220;

        if (agora >= mayk.proximaDecisao) {

            // FUGA DA NAVE
            if (distancia < medoDaNave) {

                if (centroMayk < centroNave) {
                    mayk.velocidade = -Math.abs(mayk.velocidade);
                    mayk.direcao = "left";
                } else {
                    mayk.velocidade = Math.abs(mayk.velocidade);
                    mayk.direcao = "right";
                }

                mayk.proximaDecisao = agora + 600 + Math.random() * 300;
            }

            // MOVIMENTO NORMAL
            else {
                if (Math.random() < 0.5) {
                    mayk.velocidade *= -1;
                    mayk.direcao = mayk.velocidade > 0 ? "right" : "left";
                }

                mayk.proximaDecisao = agora + 900 + Math.random() * 700;
            }
        }

        mayk.x += mayk.velocidade;

        // PAREDES
        if (mayk.x <= 0) {
            mayk.x = 0;
            mayk.velocidade = Math.abs(mayk.velocidade);
            mayk.direcao = "right";
            mayk.proximaDecisao = agora + 500;
        }

        if (mayk.x + mayk.largura >= canvas.width) {
            mayk.x = canvas.width - mayk.largura;
            mayk.velocidade = -Math.abs(mayk.velocidade);
            mayk.direcao = "left";
            mayk.proximaDecisao = agora + 500;
        }
    }

    // Mayk desenhar
    if (!maykCapturado) {
        const spriteMayk = obterSpriteMayk();
        ctx.drawImage(spriteMayk, mayk.x, mayk.y, mayk.largura, mayk.altura);
    }

    // CAPTURA
    if (abduzindo && !maykCapturado) {
        const larguraSprite = obterSpriteAtual().width * escalaNave;
        const centroRaio = naveX + larguraSprite / 2;

        if (
            centroRaio >= mayk.x &&
            centroRaio <= mayk.x + mayk.largura
        ) {
            pontos++;
            dificuldade += 0.05;

            maykCapturado = true;

            setTimeout(() => {
                mayk = criarMayk();
                maykCapturado = false;
            }, 500);
        }
    }

    // UI
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Pontos: " + pontos, 20, 40);

    requestAnimationFrame(desenhar);
}

// LOAD
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