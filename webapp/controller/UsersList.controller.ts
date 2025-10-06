import Controller from "sap/ui/core/mvc/Controller";
import UIComponent from "sap/ui/core/UIComponent";
import ListItemBase from "sap/m/ListItemBase";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import MessageBox from "sap/m/MessageBox"; // Correção na importação
import MessageToast from "sap/m/MessageToast"; // Importação necessária
import Table from "sap/m/Table";
import Binding from "sap/ui/model/Binding";
import Context from "sap/ui/model/Context";

/**
 * @namespace com.alfa.cockpit.controller
 */
export default class UsersList extends Controller {

    public onListItemPress(oEvent: any): void {
        const oItem = oEvent.getSource() as ListItemBase;
        const oContext = oItem.getBindingContext();

        // Verificamos se o contexto de binding existe
        if (oContext) {
            const sUserId = oContext.getProperty("ID");
            const oRouter = (this.getOwnerComponent() as UIComponent).getRouter();
            oRouter.navTo("userDetail", {
                userId: sUserId
            });
        }
    }

    public onDeleteUserPress(oEvent: any): void {
        const oButton = oEvent.getSource();
        const oContext = oButton.getBindingContext();

        if (oContext) {
            const sPath = oContext.getPath();
            const oModel = this.getView()?.getModel() as ODataModel;
            const sUserName = oContext.getProperty("name");

            MessageBox.confirm(`Are you sure you want to delete user "${sUserName}"?`, {
                title: "Confirm Deletion",
                onClose: (sAction: string) => {
                    if (sAction === MessageBox.Action.OK) {
                        oModel.remove(sPath, {
                            success: () => {
                                MessageToast.show("User deleted successfully.");
                                const oTable = this.byId("usersTable") as Table;
                                const oBinding = oTable.getBinding("items");
                                if(oBinding) oBinding.refresh();
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

    public onCreatePress(): void {
        MessageToast.show("Create functionality to be implemented.");
    }
}