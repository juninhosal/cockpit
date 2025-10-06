import Controller from "sap/ui/core/mvc/Controller";
import UIComponent from "sap/ui/core/UIComponent";
import { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";
import JSONModel from "sap/ui/model/json/JSONModel";
import View from "sap/ui/core/mvc/View";
import Route from "sap/ui/core/routing/Route";

/**
 * @namespace com.alfa.cockpit.controller
 */
export default class Users extends Controller {
    public onInit(): void {
        const oViewModel = new JSONModel({
            layout: "OneColumn"
        });
        // Adicionamos uma verificação para garantir que a View existe
        const oView = this.getView();
        if (oView) {
            oView.setModel(oViewModel, "appView");
        }

        const oRouter = (this.getOwnerComponent() as UIComponent).getRouter();
        // Verificamos se cada rota existe antes de anexar o evento
        const usersRoute = oRouter.getRoute("users");
        if(usersRoute) usersRoute.attachPatternMatched(this._onRouteMatched, this);

        const userDetailRoute = oRouter.getRoute("userDetail");
        if(userDetailRoute) userDetailRoute.attachPatternMatched(this._onRouteMatched, this);

        const roleDetailRoute = oRouter.getRoute("roleDetail");
        if(roleDetailRoute) roleDetailRoute.attachPatternMatched(this._onRouteMatched, this);
    }

    private _onRouteMatched(oEvent: Route$PatternMatchedEvent): void {
        const sRouteName = oEvent.getParameter("name");
        let sLayout: string;

        switch (sRouteName) {
            case "users":
                sLayout = "OneColumn";
                break;
            case "userDetail":
                sLayout = "TwoColumnsMidExpanded";
                break;
            case "roleDetail":
                sLayout = "ThreeColumnsMidExpanded";
                break;
            default:
                sLayout = "OneColumn";
                break;
        }

        const oView = this.getView();
        if (oView) {
            (oView.getModel("appView") as JSONModel).setProperty("/layout", sLayout);
        }
    }
}