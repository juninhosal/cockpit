import BaseComponent from "sap/ui/core/UIComponent";
import { createDeviceModel } from "./model/models";

/**
 * @namespace com.alfa.cockpit
 * @name com.alfa.cockpit.Component
 * @description Componente principal da aplicação. É o ponto de entrada da aplicação e responsável pela inicialização.
 */
export default class Component extends BaseComponent {

    /**
     * @public
     * @static
     * @name metadata
     * @description Metadados do componente. Declara o manifesto da aplicação para que o framework possa carregá-lo.
     * A interface `IAsyncContentCreation` indica que a view principal e seus fragmentos podem ser carregados de forma assíncrona.
     */
	public static metadata = {
		manifest: "json",
        interfaces: [
            "sap.ui.core.IAsyncContentCreation"
        ]
	};

    /**
     * @public
     * @override
     * @name init
     * @description Função de inicialização do componente. É chamada pelo framework SAPUI5 na inicialização.
     * - Chama a função `init` da classe base.
     * - Cria e define o modelo de dispositivo (`device model`) para a aplicação.
     * - Inicializa o router para habilitar a navegação baseada em hash.
     */
	public init() : void {
		// call the base component's init function
		super.init();

        // set the device model
        this.setModel(createDeviceModel(), "device");

        // enable routing
        this.getRouter().initialize();
	}
}