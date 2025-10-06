import Controller from "sap/ui/core/mvc/Controller";
import MessageBox from "sap/m/MessageBox";
import UI5Event from "sap/ui/base/Event";
import SegmentedButton from "sap/m/SegmentedButton"; // <-- IMPORT ADICIONADO
import SegmentedButtonItem from "sap/m/SegmentedButtonItem";
import Page from "sap/m/Page";
import Core from "sap/ui/core/Core"; // <-- IMPORT ADICIONADO

/**
 * @namespace com.alfa.cockpit.controller
 */
export default class Overview extends Controller {

    /**
     * Método do ciclo de vida do SAPUI5. Chamado quando o controller é instanciado.
     * Ótimo lugar para colocar código de inicialização.
     */
    public onInit(): void {}

    /**
     * Manipulador de evento para o clique em um tile na tela.
     * Atualmente, exibe uma mensagem temporária informando que a funcionalidade não foi implementada.
     */
    public onTilePress(): void {
        MessageBox.information("Navegação a partir do tile ainda não implementada.");
    }

    /**
     * Manipula a seleção de um item no SegmentedButton (barra de abas).
     * A função faz o scroll da página até a seção correspondente ao botão clicado.
     * A ligação entre o botão e a seção de destino é feita através de um custom data attribute "targetId" no item do SegmentedButton.
     * @param oEvent O evento de seleção que contém a informação do item selecionado.
     */
    public onTabSelect(oEvent: UI5Event): void {
        // Obtém o controle SegmentedButton que originou o evento
        const oSegButton = oEvent.getSource() as SegmentedButton;
        // Obtém o ID do item que foi selecionado
        const sSelectedId = oSegButton.getSelectedItem(); 

        // Usa a API do Core para obter a instância do controle a partir do seu ID
        const oSelectedItem = Core.byId(sSelectedId) as SegmentedButtonItem;

        if (oSelectedItem) {
            // Lê o valor do custom data "targetId" para saber para onde rolar
            const sTargetId = oSelectedItem.data("targetId") as string;

            // Obtém a instância da página principal e do controle de destino
            const oPage = this.byId("overviewPage") as Page;
            const oTargetControl = this.byId(sTargetId);

            // Se a página e o controle de destino existirem, faz o scroll
            if (oPage && oTargetControl) {
                oPage.scrollToElement(oTargetControl, 500); // Duração da animação de 500ms
            }
        }
    }
}