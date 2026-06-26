# Projeto Adaptado para GitHub Pages

Este projeto foi adaptado para funcionar como um site estático, permitindo a hospedagem gratuita no **GitHub Pages**.

## O que foi alterado?
Como o GitHub Pages não suporta bancos de dados (SQL) ou backend (Node.js/Express), as seguintes adaptações foram feitas:

1.  **Remoção da dependência de servidor:** O site não tenta mais se conectar a um servidor `/api`.
2.  **Mock de Banco de Dados (`mock-db.js`):** Foi criado um arquivo que simula um banco de dados usando o `localStorage` do seu navegador.
3.  **Persistência Local:** Tudo o que você cadastrar (alunos, notas, comunicados) ficará salvo no seu próprio navegador.

## Credenciais de Acesso (Simuladas)
Para testar os portais, utilize os seguintes dados:

| Usuário | Senha | Tipo de Acesso |
| :--- | :--- | :--- |
| `admin` | `123` | Administrador |
| `professor` | `123` | Professor |
| `aluno` | `123` | Aluno/Responsável |

## Como subir no GitHub?
1. Crie um novo repositório no seu GitHub.
2. Suba **apenas** o conteúdo da pasta `frontend` (que está no arquivo ZIP que te enviei).
3. Vá em **Settings** > **Pages** e ative o GitHub Pages apontando para a branch `main`.

---
*Nota: Como os dados são salvos no navegador, se você limpar o cache ou acessar de outro computador, os dados cadastrados não aparecerão. Para um sistema profissional com banco de dados compartilhado, seria necessário um serviço de hospedagem de backend (como Heroku, Render ou Vercel).*
