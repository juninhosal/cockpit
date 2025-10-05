import Controller from "sap/ui/core/mvc/Controller";
import ToolPage from "sap/tnt/ToolPage";

/**
 * @namespace com.alfa.cockpit.controller
 */
export default class Cockpit extends Controller {

    public onInit(): void {
        // Seu código de inicialização
    }

    /**
     * Alterna a visibilidade do menu lateral.
     */
    public onMenuButtonPress(): void {
        const oToolPage = this.byId("toolPage") as ToolPage;
        oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
    }



}