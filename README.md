# 🚗⚡ Auto Elétrica Cañete - Sistema Integrado de Gestão, PDV & Estoque

Sistema completo desenvolvido sob medida para a **Auto Elétrica Cañete**.
Identidade visual automotiva profissional com as cores da oficina: **Cinza Grafite / Chumbo** e **Vermelho Racing**.

---

## 📱 Funcionalidades Principais

### 1. 📦 Estoque Completo com Imagem & Compatibilidade por Veículo e Ano
- **Fotos dos Produtos**: Tiradas diretamente com a câmera do celular, webcam ou upload de imagem.
- **Aplicação por Carro & Ano**: Indicação precisa para quais veículos e anos cada peça serve (ex: *Toyota Hilux 2005 a 2022*, *Gol G5/G6 2008 a 2016*, *Palio Fire*, etc.).
- **Leitor de Código de Barras**:
  - Pelo celular / tablet: leitura instantânea com a câmera traseira do aparelho.
  - No PC / Desktop (.exe): suporte a bipadores e leitores de código de barras USB físicos (emulação de teclado) e webcam.
- **Métricas de Estoque**: Quantidades em estoque, alertas de estoque baixo (mínimo), cálculo automático de margem de lucro (%), custo e valor de venda.

### 2. 🛒 PDV (Ponto de Venda & Venda Rápida de Peças)
- Checkout ágil para balcão da oficina.
- Bipou o código de barras ou buscou o produto -> cai no carrinho automaticamente.
- Desconto em reais/moeda, múltiplas formas de pagamento (Dinheiro, Pix, Cartão de Crédito/Débito, A Prazo).
- Baixa automática no estoque ao concluir a venda.
- Emissão de comprovante e celebração visual de venda concluída.

### 3. 📋 Orçamentos (Presupuestos) & Ordens de Serviço (OS)
- **Checklist e Diagnóstico Elétrico Exclusivo de Auto Elétrica**:
  - Medição de Tensão da Bateria em repouso e partida (V).
  - Tensão de carga do Alternador (V).
  - Estado do Motor de Partida (Arranque - buchas, escovas, induzido).
  - Teste de Fuga de Corrente / Consumo Parasita (mA).
- **Impressão de Presupuesto / Orçamento**:
  - Layout pronto para impressão em impressora comum (A4) ou térmica (80mm).
  - Cabeçalho oficial com Logo da Auto Elétrica Cañete, endereço e telefone **+595 983 788199**.
  - Discriminação detalhada de Peças aplicadas e Mão de obra.
  - Termos de garantia e validade do orçamento.
- **Envio Automático para WhatsApp**:
  - Botão com 1 clique para enviar orçamento formatado com todos os valores para o WhatsApp do cliente.
  - Botão de aviso "Carro Pronto para Retirada".

### 4. 📅 Agendamento & Pós-Venda (Fidelização de Clientes)
- Agendamento rápido de revisões com envio de confirmação formatada para o WhatsApp do cliente.
- Sistema de Pós-Venda: lista de clientes que concluíram serviços para envio de convite de teste elétrico preventivo gratuito (mantendo o cliente fiel à oficina).

### 5. 📢 Identidade Visual & Propaganda Oficial
- Banner promocional em alta definição com elementos de alta tecnologia (alternador, bateria, motor de arranque, raios e silhueta automotiva).
- Emblema / Logotipo 3D oficial da Auto Elétrica Cañete.
- Botão para baixar banner e textos prontos para status do WhatsApp, Instagram e Facebook.
- Contato configurado: **+595 983 788199**.

---

## 🚀 Como Executar o Sistema

### 1. Iniciar em modo de desenvolvimento (Web / Rede Local):
No terminal da pasta do projeto, execute:
```bash
npm run dev
```
O Vite iniciará o servidor (normalmente em `http://localhost:5173` ou pelo IP da sua rede Wi-Fi, ex: `http://192.168.1.X:5173`).

---

## 📱 Como Usar no Celular (Como App / APK)

1. Conecte o celular na mesma rede Wi-Fi do computador.
2. No navegador do celular (Chrome / Safari), acesse o IP mostrado no terminal (ex: `http://192.168.1.15:5173`).
3. **Instalar como App**: No menu do Chrome no celular, toque em **"Adicionar à tela inicial"** ou **"Instalar aplicativo"**.
4. O app ficará instalado na tela do celular com o ícone da Auto Elétrica Cañete, funcionando com:
   - Acesso total à **câmera para tirar fotos das peças**.
   - Acesso à **câmera para escanear código de barras**.
   - Envio de orçamentos e agendamentos direto para o WhatsApp.

---

## 🖥️ Como Gerar o Executável Windows (.exe)

O projeto está configurado com Electron e Electron Builder. Para compilar o `.exe`:

### Gerar instalador ou portátil:
```bash
npm run build:win
```
ou para versão portátil (sem necessidade de instalar):
```bash
npm run build:portable
```

Os arquivos `.exe` serão gerados dentro da pasta **`release/`**.

---

## 💾 Backup dos Dados

O sistema conta com um módulo de **Backup & Restauração** no botão de Configurações (ícone de engrenagem no topo):
- Clique em **"Baixar Backup (.json)"** para salvar uma cópia de segurança de todos os produtos, fotos, ordens de serviço e vendas.
- Clique em **"Restaurar Backup"** para carregar os dados em qualquer computador ou dispositivo.
