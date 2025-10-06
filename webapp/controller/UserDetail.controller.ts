import Controller from "sap/ui/core/mvc/Controller";
import UIComponent from "sap/ui/core/UIComponent";
import { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import MessageBox from "sap/m/MessageBox";
import MessageToast from "sap/m/MessageToast";
import ListItemBase from "sap/m/ListItemBase";
import Route from "sap/ui/core/routing/Route";

/**
 * @namespace com.alfa.cockpit.controller
 */
export default class UserDetail extends Controller {
    private sUserId: string;

    public onInit(): void {
        const oRouter = (this.getOwnerComponent() as UIComponent).getRouter();

        const userDetailRoute = oRouter.getRoute("userDetail");
        if(userDetailRoute) userDetailRoute.attachPatternMatched(this._onUserMatched, this);

        const roleDetailRoute = oRouter.getRoute("roleDetail");
        if(roleDetailRoute) roleDetailRoute.attachPatternMatched(this._onUserMatched, this);
    }

    private _onUserMatched(oEvent: Route$PatternMatchedEvent): void {
        const args = oEvent.getParameter("arguments") as { userId: string };
        this.sUserId = args.userId;
        const sObjectPath = `/Users('${this.sUserId}')`;
        const sExpand = "navRoleCollections($expand=roleCollection($expand=navRoles($expand=role)))";

        this.getView()?.bindElement({
            path: sObjectPath,
            parameters: {
                expand: sExpand
            }
        });
    }

    public onRoleCollectionPress(oEvent: any): void {
        const oItem = oEvent.getSource() as ListItemBase;
        const oContext = oItem.getBindingContext();

        if (oContext) {
            const sRoleCollectionId = oContext.getProperty("roleCollection_ID");
            (this.getOwnerComponent() as UIComponent).getRouter().navTo("roleDetail", {
                userId: this.sUserId,
                roleCollectionId: sRoleCollectionId
            });
        }
    }

    public handleDeletePress(): void {
        const oView = this.getView();
        const oElementBinding = oView?.getElementBinding();

        if (oElementBinding) {
            const sPath = oElementBinding.getPath();
            // Adicionamos esta verificação para garantir que sPath não é nulo
            if (sPath) {
                const oModel = oView?.getModel() as ODataModel;
                const sUserName = oModel.getProperty(sPath + "/name");

                MessageBox.confirm(`Are you sure you want to delete user "${sUserName}"?`, {
                    title: "Confirm Deletion",
                    onClose: (sAction: string) => {
                        if (sAction === MessageBox.Action.OK) {
                            oModel.remove(sPath, { // Agora é seguro usar sPath
                                success: () => {
                                    MessageToast.show("User deleted successfully.");
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
        }
    }

    public handleFullScreen(): void {
        MessageToast.show("Fullscreen toggled");
    }

    public handleClose(): void {
        (this.getOwnerComponent() as UIComponent).getRouter().navTo("users");
    }
}