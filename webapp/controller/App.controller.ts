import Controller from "sap/ui/core/mvc/Controller";
import ToolPage from "sap/tnt/ToolPage";
import NavigationListItem from "sap/tnt/NavigationListItem";
import UIComponent from "sap/ui/core/UIComponent";
import Router, { Router$RouteMatchedEvent } from "sap/ui/core/routing/Router";
import SideNavigation from "sap/tnt/SideNavigation";
import Target from "sap/ui/core/routing/Target";
import Route from "sap/ui/core/routing/Route";

/**
 * @namespace com.alfa.cockpit.controller
 */
export default class App extends Controller {

    public onInit(): void {
        const oRouter = (this.getOwnerComponent() as UIComponent).getRouter();
        oRouter.attachRouteMatched(this._onRouteMatched, this);
    }

    private _onRouteMatched(oEvent: Router$RouteMatchedEvent): void {
        const sRouteName = oEvent.getParameter("name");
        if (!sRouteName) {
            return;
        }

        const oRouter = (this.getOwnerComponent() as UIComponent).getRouter();
        const sSelectedKey = this._findMenuKeyForRoute(oRouter, sRouteName);

        const oSideNav = this.byId("sideNavigation") as SideNavigation;
        if (oSideNav) {
            oSideNav.setSelectedKey(sSelectedKey);

            const allTopLevelItems = oSideNav.getItem().getItems() as NavigationListItem[];
            const oParentItem = allTopLevelItems.find(item =>
                item.getItems().some((subItem: NavigationListItem) => subItem.getKey() === sSelectedKey)
            );

            if (oParentItem) {
                oParentItem.setExpanded(true);
            }
        }
    }

    private _findMenuKeyForRoute(oRouter: Router, sRouteName: string): string {
        const oRoute = oRouter.getRoute(sRouteName);
        if (!oRoute) {
            return sRouteName;
        }

        const aTargetNames = (oRoute as any)._oConfig.target as string[];
        if (!aTargetNames || aTargetNames.length === 0) {
            return sRouteName;
        }

        const oTarget = oRouter.getTarget(aTargetNames[0]);
        if (!oTarget) {
            return sRouteName;
        }

        const sParent = (oTarget as any)._oOptions.parent as string;

        if (sParent) {
            return sParent;
        } else {
            return sRouteName;
        }
    }

    public onMenuButtonPress(): void {
        const oToolPage = this.byId("toolPage") as ToolPage;
        oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
    }

    public onItemSelect(oEvent: any): void {
        const oItem = oEvent.getParameter("item") as NavigationListItem;
        const sKey = oItem.getKey();

        // CORREÇÃO FINAL: Verificamos se o item tem filhos. Se não tiver (length === 0), navegamos.
        if (sKey && oItem.getItems().length === 0) {
            const oRouter = (this.getOwnerComponent() as UIComponent).getRouter();
            oRouter.navTo(sKey);
        }
    }
}