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

    /**
     * @public
     * @override
     * @name onInit
     * @description Inicializa o controller, configurando modelos para a vista.
     * `appView` model: para controlar o layout do FlexibleColumnLayout.
     * `viewModel`: para controlar o estado da UI (ex: modo de edição).
     */
    public onInit(): void {
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
     * Navega para a vista de detalhe do utilizador, mostrando a segunda coluna.
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
                // Faz o binding do elemento e expande a navegação para as role collections associadas
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
        const oView = this.getView();
        if (!oView) return;

        const oModel = oView.getModel("appView") as JSONModel;
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
     * @description Guarda as alterações feitas ao utilizador.
     */
    public onSavePress(): void {
        const oView = this.getView();
        if (!oView) return;

        const oModel = oView.getModel() as ODataModel;
        const oViewModel = oView.getModel("viewModel") as JSONModel;
        const oContext = (this.byId("userDetail") as Page)?.getBindingContext();

        // Atualiza o campo 'status' com base no switch
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

    /**
     * @public
     * @name onFilterUsers
     * @description Filtra a lista de utilizadores com base no texto introduzido no campo de pesquisa.
     * @param {sap.ui.base.Event} oEvent O evento de pesquisa.
     */
    public onFilterUsers(oEvent: UI5Event): void {
        const aFilters: Filter[] = [];
        const sQuery = (oEvent.getSource() as SearchField).getValue();
        const oTable = this.byId("usersTable") as Table;
        const oBinding = oTable.getBinding("items") as ListBinding;

        if (sQuery && sQuery.length > 0) {
            // Filtro combinado para procurar em 'name' e 'email'
            const oCombinedFilter = new Filter({
                filters: [
                    new Filter("name", FilterOperator.Contains, sQuery),
                    new Filter("email", FilterOperator.Contains, sQuery)
                ],
                and: false // Operador OR
            });
            aFilters.push(oCombinedFilter);
        }

        if (oBinding) {
            oBinding.filter(aFilters);
        }
    }

    /**
     * @public
     * @name onSort
     * @description Ordena a lista de utilizadores. A direção da ordenação (ascendente/descendente) é alternada a cada clique.
     * @param {sap.ui.base.Event} oEvent O evento de clique no botão de ordenação.
     */
    public onSort(oEvent: UI5Event): void {
        const oButton = oEvent.getSource() as Button;
        const sSortProperty = oButton.data("sortProperty") as string;
        const oTable = this.byId("usersTable") as Table;
        const oBinding = oTable.getBinding("items") as ListBinding;

        // Mantém o estado da ordenação para alternar a direção
        const bCurrentSortDirection = this._mSortState[sSortProperty];
        let bDescending: boolean;

        if (bCurrentSortDirection === null || bCurrentSortDirection === undefined) {
            bDescending = false; // Primeira vez: ascendente
        } else {
            bDescending = !bCurrentSortDirection; // Alterna
        }

        this._mSortState = {}; // Reseta o estado para outras colunas
        this._mSortState[sSortProperty] = bDescending;
        const oSorter = new Sorter(sSortProperty, bDescending);

        if (oBinding) oBinding.sort(oSorter);
    }

    /**
     * @public
     * @name onDeleteUserPress
     * @description Apaga um utilizador após confirmação.
     * @param {sap.ui.base.Event} oEvent O evento de clique no botão de apagar.
     */
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

    /**
     * @public
     * @name onCreatePress
     * @description Abre um diálogo para criar um novo utilizador.
     */
    public async onCreatePress(): Promise<void> {
        const oView = this.getView();
        if (!oView) {
            return;
        }

        // Carrega o fragmento do diálogo na primeira vez
        if (!this._oCreateUserDialog) {
            this._oCreateUserDialog = await Fragment.load({
                id: oView.getId(),
                name: "com.alfa.cockpit.view.fragment.CreateUserDialog",
                controller: this
            }) as Dialog;
            oView.addDependent(this._oCreateUserDialog);
        }
        // Inicializa o modelo para o novo utilizador
        this._oCreateUserDialog.setModel(new JSONModel({ name: "", email: "", status: "enable" }), "newUser");
        this._oCreateUserDialog.open();
    }

    /**
     * @public
     * @name onSaveUser
     * @description Guarda o novo utilizador criado no diálogo.
     */
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
     * @description Abre um diálogo de seleção para atribuir Role Collections ao utilizador.
     */
    public async onAssignRoleCollectionPress(): Promise<void> {
        const oView = this.getView();
        if (!oView) return;

        // Carrega o fragmento do diálogo na primeira vez
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
     * @description Manipula a confirmação do diálogo de atribuição.
     * Cria as associações entre o utilizador e as Role Collections selecionadas.
     * @param {any} oEvent O evento de confirmação do diálogo.
     */
    public onAssignRoleCollectionDialogConfirm(oEvent: any): void {
        const oView = this.getView();
        if (!oView) return;

        const oModel = oView.getModel() as ODataModel;
        const aSelectedContexts = oEvent.getParameter("selectedContexts") as Context[];
        const oUserDetailContext = (this.byId("userDetail") as Page).getBindingContext();

        if (aSelectedContexts.length === 0 || !oUserDetailContext) {
            return;
        }

        const sUserID = oUserDetailContext.getProperty("ID") as string;

        // Cria uma entrada na entidade de associação para cada Role Collection selecionada
        aSelectedContexts.forEach(oContext => {
            const sRoleCollectionID = oContext.getProperty("ID") as string;
            const oPayload = {
                user_ID: sUserID,
                roleCollection_ID: sRoleCollectionID
            };
            oModel.create("/UserRoleCollections", oPayload);
        });

        // Submete todas as criações como um batch
        oModel.submitChanges({
            success: () => {
                MessageToast.show("Role Collection(s) atribuída(s).");
                // Refresca o binding do detalhe para mostrar a nova atribuição
                (this.byId("userDetail") as Page).getElementBinding()?.refresh();
            },
            error: (oError: any) => {
                MessageBox.error("Erro ao atribuir a(s) Role Collection(s).");
                oModel.resetChanges(); // Reverte as criações em caso de erro
            }
        });
    }

    /**
     * @public
     * @name onAssignRoleCollectionDialogCancel
     * @description Manipula o cancelamento do diálogo de atribuição. (Atualmente vazio)
     */
    public onAssignRoleCollectionDialogCancel(): void {}

    /**
     * @public
     * @name onUnassignRoleCollectionPress
     * @description Remove a atribuição de uma Role Collection de um utilizador.
     * @param {sap.ui.base.Event} oEvent O evento de clique no item da lista.
     */
    public onUnassignRoleCollectionPress(oEvent: UI5Event): void {
        const oContext = (oEvent.getSource() as ListItemBase).getBindingContext();
        if (!oContext) return;

        const sPath = oContext.getPath();
        const oModel = this.getView()?.getModel() as ODataModel;

        MessageBox.confirm("Tem a certeza que quer desatribuir esta Role Collection?", {
            onClose: (sAction: string) => {
                if (sAction === MessageBox.Action.OK && oModel) {
                    oModel.remove(sPath, {
                        success: () => MessageToast.show("Atribuição removida."),
                        error: (oError: any) => MessageBox.error("Erro ao remover a atribuição.")
                    });
                }
            }
        });
    }
}