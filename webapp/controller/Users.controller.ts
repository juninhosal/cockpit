// Imports... (todos os seus imports)
import Controller from "sap/ui/core/mvc/Controller";
import JSONModel from "sap/ui/model/json/JSONModel";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import FlexibleColumnLayout from "sap/f/FlexibleColumnLayout";
import { LayoutType } from "sap/f/library";
import ListItemBase from "sap/m/ListItemBase";
import MessageBox from "sap/m/MessageBox";
import MessageToast from "sap/m/MessageToast";
import Page from "sap/m/Page";
import Sorter from "sap/ui/model/Sorter";
import UI5Event from "sap/ui/base/Event";
import Button from "sap/m/Button";
import ListBinding from "sap/ui/model/ListBinding";
import Table from "sap/m/Table";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import SearchField from "sap/m/SearchField";
import Fragment from "sap/ui/core/Fragment";
import Dialog from "sap/m/Dialog";
import Context from "sap/ui/model/Context"; // Import adicional necessário
import formatter from "../model/formatter"; // Import do seu formatter

/**
 * @namespace com.alfa.cockpit.controller
 */
export default class Users extends Controller {

    public formatter = formatter; // Disponibiliza o formatter para a View
    private _oCreateUserDialog: Dialog;
    private _mSortState: { [key: string]: boolean | null } = {};

    public onInit(): void {
        const oView = this.getView();
        if (oView) {
            oView.setModel(new JSONModel({
                layout: LayoutType.OneColumn
            }), "appView");

            oView.setModel(new JSONModel({
                editMode: false,
                editStatus: false // Propriedade para controlar o Switch
            }), "viewModel");
        }
    }

    public onListItemPress(oEvent: UI5Event): void {
        const oItem = oEvent.getSource() as ListItemBase;
        const oContext = oItem.getBindingContext();
        const sPath = oContext?.getPath();
        const oView = this.getView();

        if (sPath && oContext && oView) {
            const oUser = oContext.getObject() as { status: string };
            // Define o estado inicial do Switch no viewModel
            const oViewModel = oView.getModel("viewModel") as JSONModel;
            oViewModel.setProperty("/editStatus", this.formatter.statusToBoolean(oUser.status));

            const oDetailColumn = this.byId("userDetail") as Page;
            if (oDetailColumn) {
                oDetailColumn.bindElement(sPath);
                const oFCL = this.byId("fcl") as FlexibleColumnLayout;
                oFCL.setLayout(LayoutType.TwoColumnsMidExpanded);
            }
        }
    }

    public onEditPress(): void {
        const oView = this.getView();
        if (!oView) return;

        const oContext = (this.byId("userDetail") as Page)?.getBindingContext();
        if (oContext) {
            const oUser = oContext.getObject() as { status: string };
            const oViewModel = oView.getModel("viewModel") as JSONModel;
            // Garante que o Switch tenha o valor correto ao entrar em modo de edição
            oViewModel.setProperty("/editStatus", this.formatter.statusToBoolean(oUser.status));
            oViewModel.setProperty("/editMode", true);
        }
    }

    public onCancelPress(): void {
        const oView = this.getView();
        if (oView) {
            (oView.getModel() as ODataModel)?.resetChanges();
            (oView.getModel("viewModel") as JSONModel)?.setProperty("/editMode", false);
        }
    }

    public onSavePress(): void {
        const oView = this.getView();
        if (!oView) return;

        const oModel = oView.getModel() as ODataModel;
        const oViewModel = oView.getModel("viewModel") as JSONModel;
        const oContext = (this.byId("userDetail") as Page)?.getBindingContext();

        // **LÓGICA CORRIGIDA**: Atualiza o modelo OData com o valor do Switch antes de salvar
        if (oContext) {
            const sPath = oContext.getPath();
            const bStatus = oViewModel.getProperty("/editStatus");
            const sStatusValue = bStatus ? 'enable' : 'disable';
            oModel.setProperty(sPath + "/status", sStatusValue);
        }

        if (oModel.hasPendingChanges()) {
            oModel.submitChanges({
                success: () => {
                    MessageToast.show("Usuário atualizado com sucesso.");
                    oViewModel.setProperty("/editMode", false);
                },
                error: (oError: any) => MessageBox.error("Erro ao atualizar usuário.")
            });
        } else {
            MessageToast.show("Nenhuma alteração para salvar.");
            oViewModel.setProperty("/editMode", false);
        }
    }

    // --- O resto dos seus métodos (onCloseDetail, onFilterUsers, onSort, onDeleteUserPress, etc.) continuam aqui ---
    // ... (cole aqui o resto dos métodos do controller anterior, eles não precisam de alteração) ...
    public onCloseDetail(): void {
        const oFCL = this.byId("fcl") as FlexibleColumnLayout;
        oFCL.setLayout(LayoutType.OneColumn);
    }
    public onFilterUsers(oEvent: UI5Event): void {
        const aFilters: Filter[] = [];
        const sQuery = (oEvent.getSource() as SearchField).getValue();
        const oTable = this.byId("usersTable") as Table;
        const oBinding = oTable.getBinding("items") as ListBinding;

        if (sQuery && sQuery.length > 0) {
            const oCombinedFilter = new Filter({
                filters: [
                    new Filter("name", FilterOperator.Contains, sQuery),
                    new Filter("email", FilterOperator.Contains, sQuery)
                ],
                and: false
            });
            aFilters.push(oCombinedFilter);
        }

        if (oBinding) {
            oBinding.filter(aFilters);
        }
    }
    public onSort(oEvent: UI5Event): void {
        const oButton = oEvent.getSource() as Button;
        const sSortProperty = oButton.data("sortProperty") as string;
        const oTable = this.byId("usersTable") as Table;
        const oBinding = oTable.getBinding("items") as ListBinding;

        const bCurrentSortDirection = this._mSortState[sSortProperty];
        let bDescending: boolean;

        if (bCurrentSortDirection === null || bCurrentSortDirection === undefined) {
            bDescending = false;
        } else {
            bDescending = !bCurrentSortDirection;
        }

        this._mSortState = {};
        this._mSortState[sSortProperty] = bDescending;
        const oSorter = new Sorter(sSortProperty, bDescending);

        if (oBinding) oBinding.sort(oSorter);
    }
    public onDeleteUserPress(oEvent: UI5Event): void {
        const oButton = oEvent.getSource() as Button;
        const oContext = oButton.getBindingContext();
        if (!oContext) return;

        const sPath = oContext.getPath();
        const sUserName = oContext.getProperty("name") as string;

        const oView = this.getView();
        if (!oView) return;

        const oModel = oView.getModel() as ODataModel;

        MessageBox.confirm(`Tem a certeza que quer apagar o usuário "${sUserName}"?`, {
            title: "Confirmar Exclusão",
            onClose: (sAction: string) => {
                if (sAction === MessageBox.Action.OK) {
                    oModel.remove(sPath, {
                        success: () => MessageToast.show("Usuário apagado com sucesso."),
                        error: (oError: any) => MessageBox.error("Erro ao apagar usuário.")
                    });
                }
            }
        });
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
        this._oCreateUserDialog.setModel(new JSONModel({ name: "", email: "", status: "enable" }), "newUser");
        this._oCreateUserDialog.open();
    }
    public onSaveUser(): void {
        const oNewUserData = (this._oCreateUserDialog.getModel("newUser") as JSONModel).getData();

        const oView = this.getView();
        if (!oView) return;

        const oODataModel = oView.getModel() as ODataModel;

        if (!oNewUserData.name || !oNewUserData.email) {
            MessageToast.show("Por favor, preencha todos os campos obrigatórios.");
            return;
        }

        oODataModel.create("/Users", oNewUserData, {
            success: () => {
                MessageToast.show("Usuário criado com sucesso.");
                this.onCancelCreate();
            },
            error: (oError: any) => MessageBox.error("Erro ao criar usuário.")
        });
    }
    public onCancelCreate(): void {
        this._oCreateUserDialog.close();
    }
}