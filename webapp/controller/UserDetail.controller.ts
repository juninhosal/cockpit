import Controller from "sap/ui/core/mvc/Controller";
import UIComponent from "sap/ui/core/UIComponent";
import { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import { MessageBox } from "sap/m/MessageBox";
import ListItemBase from "sap/m/ListItemBase";

/**
 * @namespace com.alfa.cockpit.controller
 */
export default class UserDetail extends Controller {
    private sUserId: string;

    public onInit(): void {
        const oRouter = (this.getOwnerComponent() as UIComponent).getRouter();
        oRouter.getRoute("userDetail").attachPatternMatched(this._onUserMatched, this);
        oRouter.getRoute("roleDetail").attachPatternMatched(this._onUserMatched, this);
    }

    private _onUserMatched(oEvent: Route$PatternMatchedEvent): void {
        this.sUserId = oEvent.getParameter("arguments").userId;
        const sObjectPath = `/Users('${this.sUserId}')`;

        // Usamos o $expand conforme a sua collection do Postman para buscar tudo de uma vez
        const sExpand = "navRoleCollections($expand=roleCollection($expand=navRoles($expand=role)))";

        this.getView().bindElement({
            path: sObjectPath,
            parameters: {
                expand: sExpand
            }
        });
    }

    public onRoleCollectionPress(oEvent: any): void {
        const oItem = oEvent.getSource() as ListItemBase;
        const sRoleCollectionId = oItem.getBindingContext().getProperty("roleCollection_ID");

        (this.getOwnerComponent() as UIComponent).getRouter().navTo("roleDetail", {
            userId: this.sUserId,
            roleCollectionId: sRoleCollectionId
        });
    }

    public handleDeletePress(): void {
        const sPath = this.getView().getElementBinding().getPath();
        const oModel = this.getView().getModel() as ODataModel;
        const sUserName = oModel.getProperty(sPath + "/name");

        MessageBox.confirm(`Are you sure you want to delete user "${sUserName}"?`, {
            title: "Confirm Deletion",
            onClose: (sAction: string) => {
                if (sAction === MessageBox.Action.OK) {
                    oModel.remove(sPath, {
                        success: () => {
                            sap.m.MessageToast.show("User deleted successfully.");
                            this.handleClose();
                        },
                        error: (oError: any) => {
                            MessageBox.error("Error deleting user: " + oError.message);
                        }
                    });
                }
            }
        });
    }

    public handleFullScreen(): void {
        // Implementar lógica de tela cheia se necessário
        sap.m.MessageToast.show("Fullscreen toggled");
    }

    public handleClose(): void {
        (this.getOwnerComponent() as UIComponent).getRouter().navTo("users");
    }
}