### Documentação do `manifest.json`

Este arquivo é o descritor da aplicação (Application Descriptor) e é fundamental para qualquer aplicação SAPUI5. Ele centraliza todas as configurações e metadados, permitindo que o framework SAPUI5 inicialize e configure a aplicação corretamente.

---

### 1. Secção `sap.app`

Contém metadados gerais sobre a aplicação, independentes do SAPUI5.

-   `"id": "com.alfa.cockpit"`
    -   **O que faz?** Define o namespace (identificador único) da sua aplicação. É usado para referenciar recursos como controllers, views e o próprio componente.
-   `"type": "application"`
    -   **O que faz?** Especifica que este é um projeto de aplicação executável.
-   `"i18n": "i18n/i18n.properties"`
    -   **O que faz?** Aponta para o arquivo principal de internacionalização (i18n), onde os textos da UI são armazenados para facilitar a tradução.
-   `"title": "{{appTitle}}"` e `"description": "{{appDescription}}"`
    -   **O que faz?** Define o título e a descrição da aplicação. A sintaxe `{{...}}` indica que o valor real é obtido do modelo i18n, usando as chaves `appTitle` e `appDescription`.
-   `"dataSources"`
    -   **O que faz?** Declara todas as fontes de dados externas que a aplicação utiliza.
    -   `"mainService"`: É um nome amigável que você deu para o seu serviço OData principal.
        -   `"uri": "/odata/v2/Catalog/"`: A URL relativa para o seu serviço OData. É o endpoint que a aplicação consultará para todas as operações de dados.
        -   `"type": "OData"` e `"settings": { "odataVersion": "2.0" }`: Especifica o tipo e a versão do serviço.

---

### 2. Secção `sap.ui5`

Contém configurações específicas da plataforma SAPUI5.

-   `"rootView"`
    -   **O que faz?** Define a view principal (raiz) da aplicação, que é `com.alfa.cockpit.view.App.view.xml`. Esta view é a primeira a ser carregada e atua como o contêiner para todas as outras.
-   `"dependencies"`
    -   **O que faz?** Lista todas as bibliotecas de controles SAPUI5 que a sua aplicação utiliza (ex: `sap.m`, `sap.f`). O framework garante que estas bibliotecas sejam carregadas.
-   `"models"`
    -   **O que faz?** Declara os modelos de dados que estarão disponíveis em toda a aplicação.
    -   `"i18n"`: Cria o modelo de recursos para internacionalização, ligando-o ao arquivo definido em `sap.app`.
    -   `""`: Este é o **modelo OData padrão (default)**. Por não ter um nome, ele é o modelo principal da aplicação.
        -   `"dataSource": "mainService"`: **Configuração crucial**. Liga este modelo à fonte de dados `mainService` que você declarou anteriormente. É por isso que você pode fazer bindings como `{/Users}` ou `{/Roles}` diretamente nas suas views.
-   `"routing"`
    -   **O que faz?** É a secção mais importante para a navegação. Define como o utilizador se move entre as diferentes telas da aplicação.
    -   `"config"`: Define as configurações padrão para todas as rotas.
        -   `"routerClass": "sap.m.routing.Router"`: Especifica a classe do router a ser usada.
        -   `"viewPath": "com.alfa.cockpit.view"`: Define o caminho base onde os arquivos de view XML estão localizados.
        -   `"controlId": "navContainer"`: **Ponto de ligação fundamental**. Diz ao router para colocar todas as views carregadas dentro do controle que tem o ID `navContainer` (o `NavContainer` na sua `App.view.xml`).
        -   `"controlAggregation": "pages"`: Especifica que as views devem ser adicionadas na agregação `pages` do `navContainer`.
    -   `"routes"`: Uma lista de todas as rotas de navegação disponíveis.
        -   Cada objeto na lista define uma rota com um `name` (nome interno), um `pattern` (o que aparece na URL após o `#`) e um `target` (o que deve ser exibido).
        -   Exemplo: A rota `"users"` com o `pattern: "users"` mapeia a URL `.../index.html#/users` para o `target` de nome `"users"`.
        -   A rota `"overview"` com `pattern: ""` é a rota padrão, acionada quando a URL não tem um hash.
    -   `"targets"`: Define o que cada `target` faz.
        -   Cada objeto aqui especifica qual view (`viewName`) deve ser exibida quando o `target` correspondente é ativado por uma rota.
        -   Exemplo: O `target` `"users"` carrega a `viewName: "Users"`, que corresponde ao arquivo `Users.view.xml`.
