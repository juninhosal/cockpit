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
import Context from "sap/ui/model/Context";
import formatter from "../model/formatter";
import TableSelectDialog from "sap/m/TableSelectDialog";
import Api from "../model/Api";

/**
 * @namespace com.alfa.cockpit.controller
 * @controller
 * @name com.alfa.cockpit.controller.Users
 * @description Controller para a gestão de Utilizadores.
 * Este controller gere a lista de utilizadores, a criação, edição, eliminação,
 * e a atribuição de Role Collections, utilizando um layout de coluna flexível.
 */
export default class Users extends Controller {

    public formatter = formatter;
    private _oCreateUserDialog: Dialog;
    private _mSortState: { [key: string]: boolean | null } = {};
    private _oAssignRoleCollectionDialog: TableSelectDialog;
    private _api: Api;

    /**
     * @public
     * @override
     * @name onInit
     * @description Inicializa o controller, configurando modelos para a vista e a classe de API.
     */
    public onInit(): void {
        this._api = new Api(this);
        const oView = this.getView();
        if (oView) {
            oView.setModel(new JSONModel({ layout: LayoutType.OneColumn }), "appView");
            oView.setModel(new JSONModel({ editMode: false, editStatus: false }), "viewModel");
        }
    }

    /**
     * @public
     * @name onListItemPress
     * @description Manipula o clique num item da lista de utilizadores.
     * @param {sap.ui.base.Event} oEvent O evento de clique.
     */
    public onListItemPress(oEvent: UI5Event): void {
        const oItem = oEvent.getSource() as ListItemBase;
        const oContext = oItem.getBindingContext();
        const sPath = oContext?.getPath();
        const oView = this.getView();

        if (sPath && oContext && oView) {
            const oUser = oContext.getObject() as { status: string };
            const oViewModel = oView.getModel("viewModel") as JSONModel;
            oViewModel.setProperty("/editStatus", this.formatter.statusToBoolean(oUser.status));

            const oDetailColumn = this.byId("userDetail") as Page;
            if (oDetailColumn) {
                oDetailColumn.bindElement({path: sPath, parameters: { expand: "navRoleCollections/roleCollection" }});
                const oFCL = this.byId("fcl") as FlexibleColumnLayout;
                oFCL.setLayout(LayoutType.TwoColumnsMidExpanded);
            }
        }
    }

    /**
     * @public
     * @name onCloseDetail
     * @description Fecha a coluna de detalhe e desativa o modo de edição.
     */
    public onCloseDetail(): void {
        (this.byId("fcl") as FlexibleColumnLayout).setLayout(LayoutType.OneColumn);
        (this.getView()?.getModel("viewModel") as JSONModel)?.setProperty("/editMode", false);
    }

    /**
     * @public
     * @name onToggleFullScreen
     * @description Alterna a vista de detalhe entre ecrã inteiro e modo de duas colunas.
     */
    public onToggleFullScreen(): void {
        const oModel = this.getView()?.getModel("appView") as JSONModel;
        const sCurrentLayout = oModel.getProperty("/layout") as string;

        if (sCurrentLayout === LayoutType.MidColumnFullScreen) {
            oModel.setProperty("/layout", LayoutType.TwoColumnsMidExpanded);
        } else {
            oModel.setProperty("/layout", LayoutType.MidColumnFullScreen);
        }
    }

    /**
     * @public
     * @name onEditPress
     * @description Ativa o modo de edição para o utilizador atualmente em detalhe.
     */
    public onEditPress(): void {
        const oView = this.getView();
        if (!oView) return;

        const oContext = (this.byId("userDetail") as Page)?.getBindingContext();
        if (oContext) {
            const oUser = oContext.getObject() as { status: string };
            const oViewModel = oView.getModel("viewModel") as JSONModel;
            oViewModel.setProperty("/editStatus", this.formatter.statusToBoolean(oUser.status));
            oViewModel.setProperty("/editMode", true);
        }
    }

    /**
     * @public
     * @name onCancelPress
     * @description Cancela o modo de edição, revertendo alterações e desativando o modo de edição.
     */
    public onCancelPress(): void {
        const oView = this.getView();
        if (oView) {
            (oView.getModel() as ODataModel)?.resetChanges();
            (oView.getModel("viewModel") as JSONModel)?.setProperty("/editMode", false);
        }
    }

    /**
     * @public
     * @name onSavePress
     * @description Guarda as alterações feitas ao utilizador utilizando a classe Api.
     */
    public onSavePress(): void {
        const oView = this.getView();
        if (!oView) return;

        const oViewModel = oView.getModel("viewModel") as JSONModel;
        const oContext = (this.byId("userDetail") as Page)?.getBindingContext();
        const oModel = oView.getModel() as ODataModel;

        if (oContext) {
            const sPath = oContext.getPath();
            const bStatus = oViewModel.getProperty("/editStatus");
            const sStatusValue = bStatus ? 'enable' : 'disable';
            oModel.setProperty(sPath + "/status", sStatusValue);
        }

        this._api.submitChanges(
            "Usuário atualizado com sucesso.",
            "Erro ao atualizar usuário."
        ).then(() => {
            oViewModel.setProperty("/editMode", false);
        }).catch((oError) => {
            console.error(oError);
        });
    }

    /**
     * @public
     * @name onFilterUsers
     * @description Filtra a lista de utilizadores com base no texto introduzido.
     * @param {sap.ui.base.Event} oEvent O evento de pesquisa.
     */
    public onFilterUsers(oEvent: UI5Event): void {
        const sQuery = (oEvent.getSource() as SearchField).getValue();
        const oBinding = (this.byId("usersTable") as Table).getBinding("items") as ListBinding;

        const aFilters = sQuery ? [new Filter({
            filters: [
                new Filter("name", FilterOperator.Contains, sQuery),
                new Filter("email", FilterOperator.Contains, sQuery)
            ],
            and: false
        })] : [];

        oBinding.filter(aFilters);
    }

    /**
     * @public
     * @name onSort
     * @description Ordena a lista de utilizadores.
     * @param {sap.ui.base.Event} oEvent O evento de clique no botão de ordenação.
     */
    public onSort(oEvent: UI5Event): void {
        const sSortProperty = (oEvent.getSource() as Button).data("sortProperty") as string;
        const oBinding = (this.byId("usersTable") as Table).getBinding("items") as ListBinding;

        const bDescending = !this._mSortState[sSortProperty];
        this._mSortState = { [sSortProperty]: bDescending };

        oBinding.sort(new Sorter(sSortProperty, bDescending));
    }

    /**
     * @public
     * @name onDeleteUserPress
     * @description Apaga um utilizador após confirmação, utilizando a classe Api.
     * @param {sap.ui.base.Event} oEvent O evento de clique no botão de apagar.
     */
    public onDeleteUserPress(oEvent: UI5Event): void {
        const oContext = (oEvent.getSource() as Button).getBindingContext();
        if (!oContext) return;

        const sPath = oContext.getPath();
        const sUserName = oContext.getProperty("name") as string;

        MessageBox.confirm(`Tem a certeza que quer apagar o usuário "${sUserName}"?`, {
            title: "Confirmar Exclusão",
            onClose: (sAction: string) => {
                if (sAction === MessageBox.Action.OK) {
                    this._api.remove(sPath, "Usuário apagado com sucesso.", "Erro ao apagar usuário.")
                        .catch(oError => console.error(oError));
                }
            }
        });
    }

    /**
     * @public
     * @name onCreatePress
     * @description Abre um diálogo para criar um novo utilizador.
     */
    public async onCreatePress(): Promise<void> {
        const oView = this.getView();
        if (!oView) return;

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

    /**
     * @public
     * @name onSaveUser
     * @description Guarda o novo utilizador utilizando a classe Api.
     */
    public onSaveUser(): void {
        const oNewUserData = (this._oCreateUserDialog.getModel("newUser") as JSONModel).getData();

        if (!oNewUserData.name || !oNewUserData.email) {
            MessageToast.show("Por favor, preencha todos os campos obrigatórios.");
            return;
        }

        this._api.create("/Users", oNewUserData, "Usuário criado com sucesso.", "Erro ao criar usuário.")
            .then(() => this.onCancelCreate())
            .catch(oError => console.error(oError));
    }

    /**
     * @public
     * @name onCancelCreate
     * @description Fecha o diálogo de criação de utilizador.
     */
    public onCancelCreate(): void {
        this._oCreateUserDialog.close();
    }

    /**
     * @public
     * @name onAssignRoleCollectionPress
     * @description Abre um diálogo para atribuir Role Collections.
     */
    public async onAssignRoleCollectionPress(): Promise<void> {
        const oView = this.getView();
        if (!oView) return;

        if (!this._oAssignRoleCollectionDialog) {
            this._oAssignRoleCollectionDialog = await Fragment.load({
                id: oView.getId(),
                name: "com.alfa.cockpit.view.fragment.AssignRoleCollectionDialog",
                controller: this
            }) as TableSelectDialog;
            oView.addDependent(this._oAssignRoleCollectionDialog);
        }
        this._oAssignRoleCollectionDialog.open("");
    }

    /**
     * @public
     * @name onAssignRoleCollectionDialogConfirm
     * @description Cria as associações entre o utilizador e as Role Collections, usando a classe Api.
     * @param {any} oEvent O evento de confirmação.
     */
    public onAssignRoleCollectionDialogConfirm(oEvent: any): void {
        const oView = this.getView();
        if (!oView) return;

        const oModel = oView.getModel() as ODataModel;
        const aSelectedContexts = oEvent.getParameter("selectedContexts") as Context[];
        const oUserDetailContext = (this.byId("userDetail") as Page).getBindingContext();

        if (!aSelectedContexts.length || !oUserDetailContext) return;

        const sUserID = oUserDetailContext.getProperty("ID") as string;

        aSelectedContexts.forEach(oContext => {
            const sRoleCollectionID = oContext.getProperty("ID") as string;
            oModel.create("/UserRoleCollections", { user_ID: sUserID, roleCollection_ID: sRoleCollectionID });
        });

        this._api.submitChanges(
            "Role Collection(s) atribuída(s).",
            "Erro ao atribuir a(s) Role Collection(s)."
        ).then(() => {
            (this.byId("userDetail") as Page).getElementBinding()?.refresh();
        }).catch(oError => console.error(oError));
    }

    /**
     * @public
     * @name onAssignRoleCollectionDialogCancel
     * @description Manipula o cancelamento do diálogo de atribuição.
     */
    public onAssignRoleCollectionDialogCancel(): void {}

    /**
     * @public
     * @name onUnassignRoleCollectionPress
     * @description Remove a atribuição de uma Role Collection, usando a classe Api.
     * @param {sap.ui.base.Event} oEvent O evento de clique.
     */
    public onUnassignRoleCollectionPress(oEvent: UI5Event): void {
        const oContext = (oEvent.getSource() as ListItemBase).getBindingContext();
        if (!oContext) return;

        const sPath = oContext.getPath();

        MessageBox.confirm("Tem a certeza que quer desatribuir esta Role Collection?", {
            onClose: (sAction: string) => {
                if (sAction === MessageBox.Action.OK) {
                    this._api.remove(sPath, "Atribuição removida.", "Erro ao remover a atribuição.")
                        .catch(oError => console.error(oError));
                }
            }
        });
    }
}