import Controller from "sap/ui/core/mvc/Controller";
import UIComponent from "sap/ui/core/UIComponent";
import { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";
import MessageToast from "sap/m/MessageToast"; // Importação necessária
import Route from "sap/ui/core/routing/Route";

/**
 * @namespace com.alfa.cockpit.controller
 */
export default class RoleDetail extends Controller {
    private sUserId: string;

    public onInit(): void {
        const oRouter = (this.getOwnerComponent() as UIComponent).getRouter();
        const roleDetailRoute = oRouter.getRoute("roleDetail");
        if(roleDetailRoute) roleDetailRoute.attachPatternMatched(this._onRoleMatched, this);
    }

    private _onRoleMatched(oEvent: Route$PatternMatchedEvent): void {
        // Tipamos o objeto de argumentos
        const args = oEvent.getParameter("arguments") as { userId: string, roleCollectionId: string };
        this.sUserId = args.userId;
        const sRoleCollectionId = args.roleCollectionId;

        // O binding já foi feito na view anterior com o $expand, então não precisamos fazer nada aqui
        // a não ser que tivéssemos uma lógica específica para esta tela.
    }

    public handleFullScreen(): void {
        MessageToast.show("Fullscreen toggled");
    }

    public handleClose(): void {
        (this.getOwnerComponent() as UIComponent).getRouter().navTo("userDetail", {
            userId: this.sUserId
        });
    }
}