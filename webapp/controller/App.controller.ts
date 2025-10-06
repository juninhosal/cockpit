import Controller from "sap/ui/core/mvc/Controller";
import ToolPage from "sap/tnt/ToolPage";
import NavigationListItem from "sap/tnt/NavigationListItem";
import UIComponent from "sap/ui/core/UIComponent";
import { Router$RouteMatchedEvent } from "sap/ui/core/routing/Router";
import SideNavigation from "sap/tnt/SideNavigation";

/**
 * @namespace com.alfa.cockpit.controller
 * @controller
 * @name com.alfa.cockpit.controller.App
 * @description Controller para a view principal da aplicação (App.view.xml), que contém o layout da ToolPage.
 * Este controller gere o layout principal da aplicação, incluindo o menu de navegação lateral.
 */
export default class App extends Controller {

    /**
     * @public
     * @override
     * @name onInit
     * @description Chamado quando o controller é instanciado.
     * Obtém a instância do router e anexa uma função ao evento 'routeMatched'.
     * Isto é usado para sincronizar o menu de navegação lateral com a rota URL atual.
     */
    public onInit(): void {
        const oRouter = (this.getOwnerComponent() as UIComponent).getRouter();
        oRouter.attachRouteMatched(this._onRouteMatched, this);
    }

    /**
     * @private
     * @name _onRouteMatched
     * @description Manipulador de evento para o evento 'routeMatched' do router.
     * Esta função garante que o item correto na navegação lateral é selecionado
     * quando a rota muda. Também expande os itens pai se um sub-item for navegado.
     * @param {sap.ui.core.routing.Router$RouteMatchedEvent} oEvent O objeto do evento route matched.
     */
    private _onRouteMatched(oEvent: Router$RouteMatchedEvent): void {
        const sRouteName = oEvent.getParameter("name");
        const oSideNav = this.byId("sideNavigation") as SideNavigation;

        if (oSideNav && sRouteName) {
            // No nosso manifesto simplificado, o nome da rota é o mesmo que a chave do menu
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

    /**
     * @public
     * @name onMenuButtonPress
     * @description Alterna o estado expandido/recolhido do menu de navegação lateral na ToolPage.
     * Isto é acionado ao pressionar o botão de menu "hambúrguer" no cabeçalho.
     */
    public onMenuButtonPress(): void {
        const oToolPage = this.byId("toolPage") as ToolPage;
        oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
    }

    /**
     * @public
     * @name onItemSelect
     * @description Manipula a seleção de um item no menu de navegação lateral.
     * Aciona a navegação para a rota correspondente.
     * A navegação só ocorre se o item selecionado tiver uma 'key' e não tiver sub-itens.
     * @param {sap.ui.base.Event} oEvent O objeto do evento da seleção do item.
     */
    public onItemSelect(oEvent: any): void {
        const oItem = oEvent.getParameter("item") as NavigationListItem;
        const sKey = oItem.getKey();

        // Se o item tiver uma chave e não tiver sub-itens, então é um item navegável.
        if (sKey && oItem.getItems().length === 0) {
            (this.getOwnerComponent() as UIComponent).getRouter().navTo(sKey);
        }
    }
}