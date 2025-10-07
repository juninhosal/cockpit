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
import Button from "sap/m/Button";
import Api from "../model/Api";

/**
 * @namespace com.alfa.cockpit.controller
 * @controller
 * @name com.alfa.cockpit.controller.Roles
 * @description Controller para a gestão de Roles. Utiliza um FlexibleColumnLayout para mostrar uma lista mestre e uma vista de detalhe.
 */
export default class Roles extends Controller {
    private _oCreateDialog: Dialog;
    private _api: Api;

    /**
     * @public
     * @override
     * @name onInit
     * @description Inicializa o controller. Configura os modelos da view e a classe de API.
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
     * @description Manipulador para o evento de clique num item da lista de roles.
     * @param {sap.ui.base.Event} oEvent O evento de clique.
     */
    public onListItemPress(oEvent: UI5Event): void {
        const sPath = (oEvent.getSource() as ListItemBase).getBindingContext()?.getPath();
        if (sPath) {
            (this.byId("roleDetail") as Page)?.bindElement({ path: sPath });
            (this.byId("fcl") as FlexibleColumnLayout).setLayout(LayoutType.TwoColumnsMidExpanded);
        }
    }

    /**
     * @public
     * @name onCloseDetail
     * @description Fecha a coluna de detalhe, voltando à vista de uma só coluna.
     */
    public onCloseDetail(): void {
        (this.byId("fcl") as FlexibleColumnLayout).setLayout(LayoutType.OneColumn);
    }

    /**
     * @public
     * @name onToggleFullScreen
     * @description Alterna a coluna de detalhe entre o modo de ecrã inteiro e a vista de duas colunas.
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
     * @description Ativa o modo de edição na vista de detalhe.
     */
    public onEditPress(): void {
        (this.getView()?.getModel("viewModel") as JSONModel)?.setProperty("/editMode", true);
    }

    /**
     * @public
     * @name onCancelPress
     * @description Cancela o modo de edição, revertendo quaisquer alterações e desativando o modo de edição.
     */
    public onCancelPress(): void {
        (this.getView()?.getModel() as ODataModel)?.resetChanges();
        (this.getView()?.getModel("viewModel") as JSONModel)?.setProperty("/editMode", false);
    }

    /**
     * @public
     * @name onSavePress
     * @description Guarda as alterações feitas a uma role, usando a classe Api.
     */
    public onSavePress(): void {
        this._api.submitChanges("Role salva com sucesso.", "Falha ao salvar as alterações.")
            .then(() => {
                (this.getView()?.getModel("viewModel") as JSONModel)?.setProperty("/editMode", false);
            })
            .catch(oError => console.error(oError));
    }

    /**
     * @public
     * @name onDeletePress
     * @description Apaga a role selecionada após confirmação, usando a classe Api.
     * @param {sap.ui.base.Event} oEvent O evento de clique do botão de apagar.
     */
    public onDeletePress(oEvent: UI5Event): void {
        const oContext = (oEvent.getSource() as Button).getBindingContext();
        if (!oContext) return;
        const sPath = oContext.getPath();
        const sName = oContext.getProperty("name") as string;

        MessageBox.confirm(`Tem a certeza que quer apagar a Role "${sName}"?`, {
            onClose: (sAction: string) => {
                if (sAction === MessageBox.Action.OK) {
                    this._api.remove(sPath, "Role apagada com sucesso.", "Erro ao apagar a role.")
                        .then(() => this.onCloseDetail())
                        .catch(oError => console.error(oError));
                }
            }
        });
    }

    /**
     * @public
     * @name onCreatePress
     * @description Abre um diálogo para a criação de uma nova role.
     */
    public async onCreatePress(): Promise<void> {
        const oView = this.getView();
        if (!oView) return;
        if (!this._oCreateDialog) {
            this._oCreateDialog = await Fragment.load({
                id: oView.getId(),
                name: "com.alfa.cockpit.view.fragment.CreateRoleDialog",
                controller: this
            }) as Dialog;
            oView.addDependent(this._oCreateDialog);
        }
        this._oCreateDialog.setModel(new JSONModel({ name: "", description: "" }), "newRole");
        this._oCreateDialog.open();
    }

    /**
     * @public
     * @name onSaveNewRole
     * @description Guarda a nova role criada, usando a classe Api.
     */
    public onSaveNewRole(): void {
        const oNewData = (this._oCreateDialog.getModel("newRole") as JSONModel).getData();
        if (!oNewData.name || !oNewData.description) {
            MessageToast.show("Por favor, preencha todos os campos.");
            return;
        }

        this._api.create("/Roles", oNewData, "Role criada com sucesso.", "Erro ao criar a Role.")
            .then(() => this.onCancelNewRole())
            .catch(oError => console.error(oError));
    }

    /**
     * @public
     * @name onCancelNewRole
     * @description Fecha o diálogo de criação de nova role.
     */
    public onCancelNewRole(): void {
        this._oCreateDialog.close();
    }
}