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

    public onInit(): void {}

    public onTilePress(): void {
        MessageBox.information("Navegação a partir do tile ainda não implementada.");
    }

    /**
     * Navega (faz scroll) para a secção correspondente ao botão clicado.
     * @param oEvent o evento de seleção
     */
    public onTabSelect(oEvent: UI5Event): void {
        const oSegButton = oEvent.getSource() as SegmentedButton;
        const sSelectedId = oSegButton.getSelectedItem(); // Obtém o ID do item selecionado

        // Usa o Core para obter o controlo através do seu ID
        const oSelectedItem = Core.byId(sSelectedId) as SegmentedButtonItem;

        if (oSelectedItem) {
            const sTargetId = oSelectedItem.data("targetId") as string;

            const oPage = this.byId("overviewPage") as Page;
            const oTargetControl = this.byId(sTargetId);

            if (oPage && oTargetControl) {
                oPage.scrollToElement(oTargetControl, 500); // 500ms de duração
            }
        }
    }
}