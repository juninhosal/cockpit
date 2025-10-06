import Controller from "sap/ui/core/mvc/Controller";
import UIComponent from "sap.ui.core.UIComponent";
import { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";
import JSONModel from "sap/ui/model/json/JSONModel";

/**
 * @namespace com.alfa.cockpit.controller
 */
export default class RoleDetail extends Controller {
    private sUserId: string;

    public onInit(): void {
        const oRouter = (this.getOwnerComponent() as UIComponent).getRouter();
        oRouter.getRoute("roleDetail").attachPatternMatched(this._onRoleMatched, this);
    }

    private _onRoleMatched(oEvent: Route$PatternMatchedEvent): void {
        this.sUserId = oEvent.getParameter("arguments").userId;
        const sRoleCollectionId = oEvent.getParameter("arguments").roleCollectionId;

        // O binding já foi feito na view anterior com o $expand.
        // Aqui apenas garantimos que o contexto do elemento está correto se necessário,
        // mas a view já deve estar ligada ao caminho correto.
        // O modelo da view UserDetail já contém os dados necessários.
    }

    public handleFullScreen(): void {
        // Implementar lógica de tela cheia
        sap.m.MessageToast.show("Fullscreen toggled");
    }

    public handleClose(): void {
        (this.getOwnerComponent() as UIComponent).getRouter().navTo("userDetail", {
            userId: this.sUserId
        });
    }
}