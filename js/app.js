
import { db, collection, getDocs } from "./firebase.js";

// ==========================================
// CONFIGURAÇÕES INICIAIS
// ==========================================

let produtos = [];
let carrinho = JSON.parse(localStorage.getItem("doceFacilCarrinho") || "[]");
let categoriaAtual = "Todos";

const grid = document.getElementById("productsGrid");
const contador = document.getElementById("cartCount");

// ==========================================
// ATUALIZAR CONTADOR DO CARRINHO
// ==========================================

function atualizarContador() {
    const total = carrinho.reduce(
        (soma, item) => soma + item.quantidade, 0
    );

    contador.textContent = total;

    localStorage.setItem(
        "doceFacilCarrinho",
        JSON.stringify(carrinho)
    );
}

// ==========================================
// MOSTRAR PRODUTOS NA TELA
// ==========================================

function mostrarProdutos() {
    const filtrados = categoriaAtual === "Todos"
        ? produtos
        : produtos.filter(
            produto => produto.categoria === categoriaAtual
        );

    console.log("Categoria selecionada:", categoriaAtual);
    console.log("Produtos disponíveis:", filtrados.length);

    if (filtrados.length === 0) {
        grid.innerHTML = `
            <div class="loading">
                Nenhum doce encontrado nesta categoria.
            </div>
        `;
        return;
    }

    grid.innerHTML = filtrados.map((produto, index) => `
        <article class="product-card"
            style="animation-delay:${index * 0.1}s">

            <div class="product-image">
                ${produto.emoji || "🍰"}
            </div>

            <div class="product-info">

                <h3>${escaparHTML(produto.nome || "Doce sem nome")}</h3>

                <p>
                    ${escaparHTML(
                        produto.descricao ||
                        "Uma delícia preparada com carinho."
                    )}
                </p>

                <div class="product-bottom">

                    <span class="product-price">
                        ${Number(produto.preco || 0).toLocaleString(
                            "pt-BR",
                            {
                                style: "currency",
                                currency: "BRL"
                            }
                        )}
                    </span>

                    <button
                        class="add-button"
                        data-id="${escaparHTML(produto.id)}">

                        + Adicionar

                    </button>

                </div>
            </div>
        </article>
    `).join("");

    grid.querySelectorAll(".add-button").forEach(botao => {
        botao.addEventListener("click", () => {
            adicionarCarrinho(botao.dataset.id);
        });
    });
}

// ==========================================
// PROTEÇÃO CONTRA HTML INDESEJADO
// ==========================================

function escaparHTML(valor) {
    return String(valor).replace(/[&<>"']/g, caractere => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[caractere]);
}

// ==========================================
// CARREGAR PRODUTOS DO FIREBASE
// ==========================================

async function carregarProdutos() {

    console.log("Iniciando conexão com o Firestore...");

    grid.innerHTML = `
        <div class="loading">
            <span class="loader"></span>
            Preparando nossas delícias...
        </div>
    `;

    try {

        const resultado = await getDocs(
            collection(db, "produtos")
        );

        console.log(
            "Quantidade de documentos encontrados:",
            resultado.size
        );

        console.log(
            "Documentos recebidos:",
            resultado.docs.map(documento => ({
                id: documento.id,
                ...documento.data()
            }))
        );

        produtos = resultado.docs.map(documento => ({
            id: documento.id,
            ...documento.data()
        })).filter(produto => produto.disponivel !== false);

        console.log(
            "Produtos disponíveis após o filtro:",
            produtos
        );

        if (produtos.length === 0) {

            grid.innerHTML = `
                <div class="loading">
                    Nossa vitrine está sendo preparada.
                    Em breve teremos delícias por aqui! ♡
                </div>
            `;

            return;
        }

        mostrarProdutos();

    } catch (erro) {

        console.error(
            "ERRO AO CARREGAR PRODUTOS DO FIREBASE:",
            erro
        );

        console.error("Código do erro:", erro.code);
        console.error("Mensagem:", erro.message);

        grid.innerHTML = `
            <div class="loading">
                Não foi possível carregar os doces.

                <br>

                Verifique a conexão com o Firebase
                e as regras de segurança do Firestore.
            </div>
        `;
    }
}

// ==========================================
// ADICIONAR PRODUTO AO CARRINHO
// ==========================================

function adicionarCarrinho(id) {

    const produto = produtos.find(
        item => item.id === id
    );

    if (!produto) {
        console.error("Produto não encontrado:", id);
        return;
    }

    const existente = carrinho.find(
        item => item.id === id
    );

    if (existente) {

        existente.quantidade++;

    } else {

        carrinho.push({
            id: produto.id,
            nome: produto.nome,
            preco: Number(produto.preco),
            quantidade: 1
        });

    }

    atualizarContador();

    mostrarToast(
        `${produto.nome} adicionado ao carrinho! ♡`
    );
}

// ==========================================
// NOTIFICAÇÕES
// ==========================================

function mostrarToast(mensagem) {

    const toast = document.getElementById("toast");

    toast.textContent = mensagem;

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

// ==========================================
// ABRIR CARRINHO
// ==========================================

function abrirCarrinho() {

    if (carrinho.length === 0) {

        mostrarToast(
            "Seu carrinho ainda está vazio! ♡"
        );

        return;
    }

    const resumo = carrinho.map(item =>
        `${item.quantidade}x ${item.nome}`
    ).join("\n");

    const total = carrinho.reduce(
        (soma, item) =>
            soma + item.preco * item.quantidade,
        0
    );

    alert(
        `SEU CARRINHO\n\n${resumo}\n\nTotal: ${
            total.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL"
            })
        }\n\nA tela completa do carrinho será desenvolvida na próxima etapa.`
    );
}

// ==========================================
// FILTRO DE CATEGORIAS
// ==========================================

document.querySelectorAll(".category").forEach(botao => {

    botao.addEventListener("click", () => {

        document.querySelector(
            ".category.active"
        )?.classList.remove("active");

        botao.classList.add("active");

        categoriaAtual = botao.dataset.category;

        mostrarProdutos();

    });

});

// ==========================================
// DISPONIBILIZAR FUNÇÃO DO CARRINHO
// ==========================================

window.abrirCarrinho = abrirCarrinho;

// ==========================================
// INICIALIZAÇÃO
// ==========================================

atualizarContador();

carregarProdutos();
