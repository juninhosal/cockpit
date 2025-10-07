import Controller from "sap/ui/core/mvc/Controller";
import JSONModel from "sap/ui/model/json/JSONModel";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import FlexibleColumnLayout from "sap/f/FlexibleColumnLayout";
import { LayoutType } from "sap/f/library";
import ListItemBase from "sap/m/ListItemBase";
import MessageBox from "sap/m/MessageBox";
import MessageToast from "sap/m/MessageToast";
import Page from "sap/m/Page";
import UI5Event from "sap/ui/base/Event";
import Fragment from "sap/ui/core/Fragment";
import Dialog from "sap/m/Dialog";
import TableSelectDialog from "sap/m/TableSelectDialog";
import Context from "sap/ui/model/Context";
import Button from "sap/m/Button";
import Api from "../model/Api";

/**
 * @namespace com.alfa.cockpit.controller
 * @controller
 * @name com.alfa.cockpit.controller.RolesCollections
 * @description Controller para a gestão de Role Collections. Permite criar, editar, apagar e associar Roles a uma Role Collection.
 */
export default class RolesCollections extends Controller {

    private _oCreateRoleCollectionDialog: Dialog;
    private _oAddRoleDialog: TableSelectDialog;
    private _api: Api;

    /**
     * @public
     * @override
     * @name onInit
     * @description Inicializa o controller, configurando os modelos da view e a classe de API.
     */
    public onInit(): void {
        this._api = new Api(this);
        const oView = this.getView();
        if (oView) {
            oView.setModel(new JSONModel({ layout: LayoutType.OneColumn }), "appView");
            oView.setModel(new JSONModel({ editMode: false }), "viewModel");
        }
    }

    /**
     * @public
     * @name onListItemPress
     * @description Manipula o clique num item da lista de Role Collections, mostrando os seus detalhes.
     * @param {sap.ui.base.Event} oEvent O evento de clique.
     */
    public onListItemPress(oEvent: UI5Event): void {
        const oItem = oEvent.getSource() as ListItemBase;
        const sPath = oItem.getBindingContext()?.getPath();
        if (sPath) {
            const oDetailColumn = this.byId("roleCollectionDetail") as Page;
            if (oDetailColumn) {
                oDetailColumn.bindElement({ path: sPath, parameters: { expand: "navRoles/role" } });
                (this.byId("fcl") as FlexibleColumnLayout).setLayout(LayoutType.TwoColumnsMidExpanded);
            }
        }
    }

    /**
     * @public
     * @name onCloseDetail
     * @description Fecha a coluna de detalhe.
     */
    public onCloseDetail(): void {
        (this.byId("fcl") as FlexibleColumnLayout).setLayout(LayoutType.OneColumn);
    }

    /**
     * @public
     * @name onToggleFullScreen
     * @description Alterna a vista de detalhe entre ecrã inteiro e a vista normal.
     */
    public onToggleFullScreen(): void {
        const oModel = this.getView()?.getModel("appView") as JSONModel;
        if (!oModel) return;
        const sCurrentLayout = oModel.getProperty("/layout");
        oModel.setProperty("/layout", sCurrentLayout === LayoutType.MidColumnFullScreen ? LayoutType.TwoColumnsMidExpanded : LayoutType.MidColumnFullScreen);
    }

    /**
     * @public
     * @name onEditPress
     * @description Ativa o modo de edição para a Role Collection em detalhe.
     */
    public onEditPress(): void {
        (this.getView()?.getModel("viewModel") as JSONModel)?.setProperty("/editMode", true);
    }

    /**
     * @public
     * @name onCancelPress
     * @description Cancela o modo de edição, revertendo alterações.
     */
    public onCancelPress(): void {
        (this.getView()?.getModel() as ODataModel)?.resetChanges();
        (this.getView()?.getModel("viewModel") as JSONModel)?.setProperty("/editMode", false);
    }

    /**
     * @public
     * @name onSavePress
     * @description Guarda as alterações feitas na Role Collection, usando a classe Api.
     */
    public onSavePress(): void {
        this._api.submitChanges("Role Collection salva com sucesso.", "Falha ao salvar as alterações.")
            .then(() => {
                (this.getView()?.getModel("viewModel") as JSONModel)?.setProperty("/editMode", false);
            })
            .catch(oError => console.error(oError));
    }

    /**
     * @public
     * @name onDeleteRoleCollectionPress
     * @description Apaga a Role Collection selecionada após confirmação, usando a classe Api.
     * @param {sap.ui.base.Event} oEvent O evento de clique.
     */
    public onDeleteRoleCollectionPress(oEvent: UI5Event): void {
        const oContext = (oEvent.getSource() as Button).getBindingContext();
        if (!oContext) return;

        const sPath = oContext.getPath();
        const sName = oContext.getProperty("name") as string;

        MessageBox.confirm(`Tem a certeza que quer apagar a Role Collection "${sName}"?`, {
            title: "Confirmar Exclusão",
            onClose: (sAction: string) => {
                if (sAction === MessageBox.Action.OK) {
                    this._api.remove(sPath, "Role Collection apagada com sucesso.", "Erro ao apagar a Role Collection.")
                        .then(() => this.onCloseDetail())
                        .catch(oError => console.error(oError));
                }
            }
        });
    }

    /**
     * @public
     * @name onCreatePress
     * @description Abre um diálogo para criar uma nova Role Collection.
     */
    public async onCreatePress(): Promise<void> {
        const oView = this.getView();
        if (!oView) return;

        if (!this._oCreateRoleCollectionDialog) {
            this._oCreateRoleCollectionDialog = await Fragment.load({
                id: oView.getId(),
                name: "com.alfa.cockpit.view.fragment.CreateRoleCollectionDialog",
                controller: this
            }) as Dialog;
            oView.addDependent(this._oCreateRoleCollectionDialog);
        }
        this._oCreateRoleCollectionDialog.setModel(new JSONModel({ name: "", description: "" }), "newRoleCollection");
        this._oCreateRoleCollectionDialog.open();
    }

    /**
     * @public
     * @name onSaveNewRoleCollection
     * @description Guarda a nova Role Collection criada, usando a classe Api.
     */
    public onSaveNewRoleCollection(): void {
        const oNewData = (this._oCreateRoleCollectionDialog.getModel("newRoleCollection") as JSONModel).getData();

        if (!oNewData.name || !oNewData.description) {
            MessageToast.show("Por favor, preencha todos os campos.");
            return;
        }

        this._api.create("/RoleCollections", oNewData, "Role Collection criada com sucesso.", "Erro ao criar a Role Collection.")
            .then(() => this.onCancelNewRoleCollection())
            .catch(oError => console.error(oError));
    }

    /**
     * @public
     * @name onCancelNewRoleCollection
     * @description Fecha o diálogo de criação de nova Role Collection.
     */
    public onCancelNewRoleCollection(): void {
        this._oCreateRoleCollectionDialog.close();
    }

    /**
     * @public
     * @name onAddRolePress
     * @description Abre um diálogo para adicionar Roles a uma Role Collection.
     */
    public async onAddRolePress(): Promise<void> {
        const oView = this.getView();
        if (!oView) return;

        if (!this._oAddRoleDialog) {
            this._oAddRoleDialog = await Fragment.load({
                id: oView.getId(),
                name: "com.alfa.cockpit.view.fragment.AddRoleDialog",
                controller: this
            }) as TableSelectDialog;
            oView.addDependent(this._oAddRoleDialog);
        }
        this._oAddRoleDialog.open("");
    }

    /**
     * @public
     * @name onAddRoleDialogConfirm
     * @description Confirma a adição de Roles a uma Role Collection, usando a classe Api.
     * @param {any} oEvent O evento de confirmação.
     */
    public onAddRoleDialogConfirm(oEvent: any): void {
        const oView = this.getView();
        if (!oView) return;

        const oModel = oView.getModel() as ODataModel;
        const aSelectedContexts = oEvent.getParameter("selectedContexts") as Context[];
        const oDetailContext = (this.byId("roleCollectionDetail") as Page).getBindingContext();

        if (aSelectedContexts.length === 0 || !oDetailContext) return;

        const sRoleCollectionID = oDetailContext.getProperty("ID") as string;

        aSelectedContexts.forEach(oContext => {
            const sRoleID = oContext.getProperty("ID") as string;
            oModel.create("/RoleCollectionRoles", { roleCollection_ID: sRoleCollectionID, role_ID: sRoleID });
        });

        this._api.submitChanges(
            `${aSelectedContexts.length} role(s) adicionados.`,
            "Erro ao adicionar roles."
        ).then(() => {
            (this.byId("roleCollectionDetail") as Page).getElementBinding()?.refresh();
        }).catch(oError => console.error(oError));
    }

    /**
     * @public
     * @name onAddRoleDialogCancel
     * @description Fecha o diálogo de adição de Roles.
     */
    public onAddRoleDialogCancel(): void {}

    /**
     * @public
     * @name onRemoveRolePress
     * @description Remove uma Role de uma Role Collection, usando a classe Api.
     * @param {sap.ui.base.Event} oEvent O evento de clique.
     */
    public onRemoveRolePress(oEvent: UI5Event): void {
        const oContext = (oEvent.getSource() as ListItemBase).getBindingContext();
        if (!oContext) return;

        const sPath = oContext.getPath();
        const sRoleName = oContext.getProperty("role/name") as string;

        MessageBox.confirm(`Tem a certeza que quer remover a role "${sRoleName}" desta coleção?`, {
            onClose: (sAction: string) => {
                if (sAction === MessageBox.Action.OK) {
                    this._api.remove(sPath, "Role removida.", "Erro ao remover a role.")
                        .catch(oError => console.error(oError));
                }
            }
        });
    }
}