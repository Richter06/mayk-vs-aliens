const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const fundo = new Image();
fundo.src = "../sprites/fazenda.png";

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

//Pontos
let pontos = 0;

// Nave
let naveX = 350;
const larguraNave = 100;
const alturaNave = 50;

// Raio
let abduzindo = false;

// Mayk
let mayk = {
    x: 400,
    y: canvas.height - 140,
    largura: 40,
    altura: 40
};

// Teclado
document.addEventListener("keydown", (event) => {
    if (event.key === "a") {
        naveX -= 10;
    }

    if (event.key === "d") {
        naveX += 10;
    }

    if (event.key === " ") {
        abduzindo = true;
    }

    // Limites da tela
    naveX = Math.max(0, naveX);
    naveX = Math.min(canvas.width - larguraNave, naveX);
});

document.addEventListener("keyup", (event) => {
    if (event.key === " ") {
        abduzindo = false;
    }
});

// Desenho
function desenhar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fundo
    ctx.drawImage(
        fundo,
        0,
        0,
        canvas.width,
        canvas.height
    );

    // Nave
    ctx.fillRect(
        naveX,
        200,
        larguraNave,
        alturaNave
    );

    // Mayk
    ctx.fillRect(
        mayk.x,
        mayk.y,
        mayk.largura,
        mayk.altura
    );

    // Raio abdutor
    if (abduzindo) {
        ctx.beginPath();

        ctx.moveTo(
            naveX + larguraNave / 2,
            50 + alturaNave
        );

        ctx.lineTo(
            naveX + larguraNave / 2,
            canvas.height
        );

        const centroRaio = naveX + larguraNave / 2;

        if (
            centroRaio >= mayk.x &&
            centroRaio <= mayk.x + mayk.largura
        ) {
            pontos++;

            mayk.x = Math.random() * (canvas.width - mayk.largura);
        }



        ctx.stroke();
    }

    ctx.font = "30px Arial";
    ctx.fillText("Pontos: " + pontos, 20, 40);

    requestAnimationFrame(desenhar);
}

desenhar();