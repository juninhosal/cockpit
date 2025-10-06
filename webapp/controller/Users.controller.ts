import Controller from "sap/ui/core/mvc/Controller";
import UIComponent from "sap/ui/core/UIComponent";
import ListItemBase from "sap/m/ListItemBase";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import MessageBox from "sap/m/MessageBox";
import MessageToast from "sap/m/MessageToast";
import Table from "sap/m/Table";
import Context from "sap/ui/model/Context";
import Fragment from "sap/ui/core/Fragment";
import Dialog from "sap/m/Dialog";
import JSONModel from "sap/ui/model/json/JSONModel";
import View from "sap/ui/core/mvc/View";

/**
 * @namespace com.alfa.cockpit.controller
 */
export default class UsersList extends Controller {

    private _oCreateUserDialog: Dialog;

    // ... (onListItemPress e onDeleteUserPress continuam os mesmos) ...

    public onListItemPress(oEvent: any): void {
        const oItem = oEvent.getSource() as ListItemBase;
        const oContext = oItem.getBindingContext();

        if (oContext) {
            const sUserId = oContext.getProperty("ID");
            const oRouter = (this.getOwnerComponent() as UIComponent).getRouter();
            oRouter.navTo("userDetail", {
                userId: sUserId
            });
        }
    }

    /**
     * Abre o dialog de criação de usuário.
     */
    public async onCreatePress(): Promise<void> {
        const oView = this.getView();
        // Verificação para satisfazer o TypeScript: garantimos que a view existe.
        if (!oView) {
            return;
        }

        if (!this._oCreateUserDialog) {
            this._oCreateUserDialog = await Fragment.load({
                id: oView.getId(), // Correção: Usamos a variável segura 'oView'
                name: "com.alfa.cockpit.view.fragment.CreateUserDialog",
                controller: this
            }) as Dialog;
            oView.addDependent(this._oCreateUserDialog); // Correção: Usamos a variável segura 'oView'
        }

        const oNewUserModel = new JSONModel({
            name: "",
            email: "",
            status: "enable"
        });
        this._oCreateUserDialog.setModel(oNewUserModel, "newUser");

        this._oCreateUserDialog.open();
    }

    /**
     * Salva o novo usuário.
     */
    public onSaveUser(): void {
        const oView = this.getView();
        // Verificação para satisfazer o TypeScript
        if (!oView) {
            return;
        }

        const oNewUserModel = this._oCreateUserDialog.getModel("newUser") as JSONModel;
        const oNewUserData = oNewUserModel.getData();
        const oODataModel = oView.getModel() as ODataModel; // Correção: Usamos a variável segura 'oView'

        if (!oNewUserData.name || !oNewUserData.email) {
            MessageToast.show("Please fill in all required fields.");
            return;
        }

        oODataModel.create("/Users", oNewUserData, {
            success: () => {
                MessageToast.show("User created successfully.");
                this.onCancelCreate();

                // Correção: Verificamos se a tabela e o binding existem antes de chamar refresh()
                const oTable = this.byId("usersTable") as Table;
                if (oTable) {
                    oTable.getBinding("items")?.refresh();
                }
            },
            error: (oError: any) => {
                const errorMessage = JSON.parse(oError.responseText).error.message.value;
                MessageBox.error("Error creating user: " + errorMessage);
            }
        });
    }

    /**
     * Fecha o dialog de criação.
     */
    public onCancelCreate(): void {
        this._oCreateUserDialog.close();
    }

    /**
     * Garante que o dialog seja destruído para evitar memory leaks.
     */
    public onExit(): void {
        if (this._oCreateUserDialog) {
            this._oCreateUserDialog.destroy();
        }
    }
}