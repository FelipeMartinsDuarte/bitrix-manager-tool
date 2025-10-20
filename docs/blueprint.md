# **App Name**: Bitrix Integrator

## Core Features:

- Gerenciamento de CRMs: Listar, criar e deletar Smart Processes (CRMs) com telas de gerenciamento dinâmicas.
- Construtor de Campos Dinâmico: Criar campos personalizados em múltiplos CRMs com um formulário dinâmico que se adapta a diferentes tipos de campos; geração automática de nomes de campos (UF_CRM_{num}_{NAME}); visualização da carga antes do envio.
- Listagem e Gerenciamento de Campos: Listar campos para uma entidade CRM selecionada via endpoint userfieldconfig.list, com opções para editar e deletar.
- Visualizador de Logs: Consumir os endpoints crm.timeline.item.list e user.get para exibir logs de ação com autor e descrição, filtrados por entidade, usuário e data.
- Pesquisa de Usuários: Procurar usuários do Bitrix24 pesquisando através dos endpoints user.get ou user.search.
- Geração Automática de Nomes de Campos: Gera o fieldName automaticamente em letras maiúsculas, substituindo espaços por underscores, seguindo o padrão UF_CRM_{número}_{NAME}.
- Configurações: Gerenciar as configurações de token e URL base do Bitrix24; lidar com papéis e permissões de usuário.

## Style Guidelines:

- Cor primária: Azul escuro (#00629A) para cabeçalhos e botões principais, refletindo a marca do Bitrix.
- Cor de destaque: Azul claro (#0BBBEF) para hovers, links e destaques, fornecendo feedback interativo.
- Fundo: Cinza claro (#F5F7FA) para cartões, oferecendo uma sensação suave e elevada.
- Cor do texto: Cinza escuro (#333333) para o texto principal, garantindo legibilidade e uma aparência profissional.
- Fonte do corpo e título: 'Inter' (sans-serif) para uma interface administrativa moderna e limpa, adequada tanto para títulos quanto para texto do corpo.
- Fonte de código: 'Source Code Pro' (monospace) para exibição clara de valores de configuração e cargas de dados JSON.
- Design responsivo com uma barra lateral esquerda, barra superior, painel e modais para criação/edição; conteúdo principal baseado em grade com cartões e tabelas.