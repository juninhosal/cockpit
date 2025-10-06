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

// --- Imports Adicionadas ---
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import SearchField from "sap/m/SearchField";
import Sorter from "sap/ui/model/Sorter";
import UI5Event from "sap/ui/base/Event";
import Button from "sap/m/Button";
import ListBinding from "sap/ui/model/ListBinding"; // <-- 1. IMPORT ADICIONADO


/**
 * @namespace com.alfa.cockpit.controller
 */
export default class UsersList extends Controller {

    private _oCreateUserDialog: Dialog;
    private _mSortState: { [key: string]: boolean } = {};

    // ... (Suas funções existentes: onListItemPress, onDeleteUserPress, etc. continuam iguais) ...
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

    public onDeleteUserPress(oEvent: any): void {
        const oButton = oEvent.getSource();
        const oContext = oButton.getBindingContext();

        if (oContext) {
            const sPath = oContext.getPath();
            const oView = this.getView();
            if(oView){
                const oModel = oView.getModel() as ODataModel;
                const sUserName = oContext.getProperty("name");

                MessageBox.confirm(`Are you sure you want to delete user "${sUserName}"?`, {
                    title: "Confirm Deletion",
                    onClose: (sAction: string) => {
                        if (sAction === MessageBox.Action.OK) {
                            oModel.remove(sPath, {
                                success: () => {
                                    MessageToast.show("User deleted successfully.");
                                    const oTable = this.byId("usersTable") as Table;
                                    if(oTable) oTable.getBinding("items")?.refresh();
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

    public async onCreatePress(): Promise<void> {
        const oView = this.getView();
        if (!oView) {
            return;
        }

        if (!this._oCreateUserDialog) {
            this._oCreateUserDialog = await Fragment.load({
                id: oView.getId(),
                name: "com.alfa.cockpit.view.fragment.CreateUserDialog",
                controller: this
            }) as Dialog;
            oView.addDependent(this._oCreateUserDialog);
        }

        const oNewUserModel = new JSONModel({
            name: "",
            email: "",
            status: "enable"
        });
        this._oCreateUserDialog.setModel(oNewUserModel, "newUser");

        this._oCreateUserDialog.open();
    }

    public onSaveUser(): void {
        const oView = this.getView();
        if (!oView) {
            return;
        }

        const oNewUserModel = this._oCreateUserDialog.getModel("newUser") as JSONModel;
        const oNewUserData = oNewUserModel.getData();
        const oODataModel = oView.getModel() as ODataModel;

        if (!oNewUserData.name || !oNewUserData.email) {
            MessageToast.show("Please fill in all required fields.");
            return;
        }

        oODataModel.create("/Users", oNewUserData, {
            success: () => {
                MessageToast.show("User created successfully.");
                this.onCancelCreate();

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

    public onCancelCreate(): void {
        this._oCreateUserDialog.close();
    }



    public onExit(): void {
        if (this._oCreateUserDialog) {
            this._oCreateUserDialog.destroy();
        }
    }


    /**
     * Filtra a lista de usuários com base na entrada do SearchField.
     */
    public onFilterUsers(oEvent: any): void {
        const aFilters: Filter[] = [];
        const sQuery = (oEvent.getSource() as SearchField).getValue();
        const oTable = this.byId("usersTable") as Table;
        // <-- 2. CAST PARA ListBinding
        const oBinding = oTable.getBinding("items") as ListBinding;

        if (sQuery && sQuery.length > 0) {
            const oNameFilter = new Filter("name", FilterOperator.Contains, sQuery);
            const oEmailFilter = new Filter("email", FilterOperator.Contains, sQuery);

            const oCombinedFilter = new Filter({
                filters: [oNameFilter, oEmailFilter],
                and: false
            });
            aFilters.push(oCombinedFilter);
        }

        // <-- 3. VERIFICAÇÃO DE EXISTÊNCIA
        if (oBinding) {
            oBinding.filter(aFilters);
        }
    }

    /**
     * Ordena a tabela com base na coluna clicada.
     * @param oEvent o evento do 'press'
     */
    public onSort(oEvent: UI5Event): void {
        const oButton = oEvent.getSource() as Button;
        const sSortProperty = oButton.data("sortProperty") as string;
        const oTable = this.byId("usersTable") as Table;
        // <-- 2. CAST PARA ListBinding
        const oBinding = oTable.getBinding("items") as ListBinding;

        const bDescending = this._mSortState[sSortProperty] === false;
        this._mSortState[sSortProperty] = bDescending;

        Object.keys(this._mSortState).forEach(key => {
            if (key !== sSortProperty) {
                delete this._mSortState[key];
            }
        });

        const oSorter = new Sorter(sSortProperty, bDescending);

        // <-- 3. VERIFICAÇÃO DE EXISTÊNCIA
        if (oBinding) {
            oBinding.sort(oSorter);
        }
    }
}