import Controller from "sap/ui/core/mvc/Controller";
import UIComponent from "sap/ui/core/UIComponent";
import { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";
import FlexibleColumnLayout from "sap/f/FlexibleColumnLayout";
import JSONModel from "sap/ui/model/json/JSONModel";

/**
 * @namespace com.alfa.cockpit.controller
 */
export default class Users extends Controller {
    public onInit(): void {
        const oViewModel = new JSONModel({
            layout: "OneColumn"
        });
        this.getView().setModel(oViewModel, "appView");

        const oRouter = (this.getOwnerComponent() as UIComponent).getRouter();
        oRouter.getRoute("users").attachPatternMatched(this._onRouteMatched, this);
        oRouter.getRoute("userDetail").attachPatternMatched(this._onRouteMatched, this);
        oRouter.getRoute("roleDetail").attachPatternMatched(this._onRouteMatched, this);
    }

    private _onRouteMatched(oEvent: Route$PatternMatchedEvent): void {
        const sRouteName = oEvent.getParameter("name");
        let sLayout;

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

        (this.getView().getModel("appView") as JSONModel).setProperty("/layout", sLayout);
    }
}