import Controller from "sap/ui/core/mvc/Controller";
import UIComponent from "sap/ui/core/UIComponent";
import ListItemBase from "sap/m/ListItemBase";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import { MessageBox } from "sap/m/MessageBox";
import Table from "sap/m/Table";

/**
 * @namespace com.alfa.cockpit.controller
 */
export default class UsersList extends Controller {

    public onListItemPress(oEvent: any): void {
        const oItem = oEvent.getSource() as ListItemBase;
        const sUserId = oItem.getBindingContext().getProperty("ID");

        const oRouter = (this.getOwnerComponent() as UIComponent).getRouter();
        oRouter.navTo("userDetail", {
            userId: sUserId
        });
    }

    public onDeleteUserPress(oEvent: any): void {
        const oButton = oEvent.getSource();
        const sPath = oButton.getBindingContext().getPath();
        const oModel = this.getView().getModel() as ODataModel;
        const sUserName = oModel.getProperty(sPath + "/name");

        MessageBox.confirm(`Are you sure you want to delete user "${sUserName}"?`, {
            title: "Confirm Deletion",
            onClose: (sAction: string) => {
                if (sAction === MessageBox.Action.OK) {
                    oModel.remove(sPath, {
                        success: () => {
                            sap.m.MessageToast.show("User deleted successfully.");
                            (this.byId("usersTable") as Table).getBinding("items").refresh();
                        },
                        error: (oError: any) => {
                            MessageBox.error("Error deleting user: " + oError.message);
                        }
                    });
                }
            }
        });
    }

    public onCreatePress(): void {
        // Lógica para abrir um Dialog/Popup de criação de usuário
        sap.m.MessageToast.show("Create functionality to be implemented.");
    }
}