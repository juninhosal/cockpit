import Controller from "sap/ui/core/mvc/Controller";
import ToolPage from "sap/tnt/ToolPage";
import NavigationListItem from "sap/tnt/NavigationListItem";
import UIComponent from "sap/ui/core/UIComponent";
import { Router$RouteMatchedEvent } from "sap/ui/core/routing/Router";
import SideNavigation from "sap/tnt/SideNavigation";

/**
 * @namespace com.alfa.cockpit.controller
 */
export default class App extends Controller {

    public onInit(): void {
        const oRouter = (this.getOwnerComponent() as UIComponent).getRouter();
        oRouter.attachRouteMatched(this._onRouteMatched, this);
    }

    /**
     * Chamado sempre que uma rota é acedida.
     * Seleciona o item correto no menu lateral.
     */
    private _onRouteMatched(oEvent: Router$RouteMatchedEvent): void {
        const sRouteName = oEvent.getParameter("name");
        const oSideNav = this.byId("sideNavigation") as SideNavigation;

        if (oSideNav && sRouteName) {
            // No nosso manifest simplificado, o nome da rota é o mesmo que a key do menu
            oSideNav.setSelectedKey(sRouteName);

            // Expande o item pai se estivermos a navegar para um sub-item
            const allTopLevelItems = oSideNav.getItem().getItems() as NavigationListItem[];
            const oParentItem = allTopLevelItems.find(item =>
                item.getItems().some((subItem: NavigationListItem) => subItem.getKey() === sRouteName)
            );

            if (oParentItem) {
                oParentItem.setExpanded(true);
            }
        }
    }

    public onMenuButtonPress(): void {
        const oToolPage = this.byId("toolPage") as ToolPage;
        oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
    }

    /**
     * Chamado quando um item do menu lateral é selecionado.
     */
    public onItemSelect(oEvent: any): void {
        const oItem = oEvent.getParameter("item") as NavigationListItem;
        const sKey = oItem.getKey();

        // Se o item tiver uma key e não tiver sub-itens, então é um item navegável.
        if (sKey && oItem.getItems().length === 0) {
            (this.getOwnerComponent() as UIComponent).getRouter().navTo(sKey);
        }
    }
}