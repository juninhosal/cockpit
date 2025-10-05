import Controller from "sap/ui/core/mvc/Controller";
import ToolPage from "sap/tnt/ToolPage";
import NavigationListItem from "sap/tnt/NavigationListItem";
import UIComponent from "sap/ui/core/UIComponent";

/**
 * @namespace com.alfa.cockpit.controller
 */
export default class App extends Controller {

    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {

    }

    public onMenuButtonPress(): void {
        const oToolPage = this.byId("toolPage") as ToolPage;
        oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
    }

    public onItemSelect(oEvent: any): void {
        const oItem = oEvent.getParameter("item") as NavigationListItem;
        const sKey = oItem.getKey();

        if (sKey) {
            const oRouter = (this.getOwnerComponent() as UIComponent).getRouter();
            oRouter.navTo(sKey);
        }
    }
}