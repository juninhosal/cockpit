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

/**
 * @namespace com.alfa.cockpit.controller
 */
export default class Roles extends Controller {
    private _oCreateDialog: Dialog;

    public onInit(): void {
        const oView = this.getView();
        if (oView) {
            oView.setModel(new JSONModel({ layout: LayoutType.OneColumn }), "appView");
            oView.setModel(new JSONModel({ editMode: false }), "viewModel");
        }
    }

    public onListItemPress(oEvent: UI5Event): void {
        const sPath = (oEvent.getSource() as ListItemBase).getBindingContext()?.getPath();
        if (sPath) {
            (this.byId("roleDetail") as Page)?.bindElement({ path: sPath });
            (this.byId("fcl") as FlexibleColumnLayout).setLayout(LayoutType.TwoColumnsMidExpanded);
        }
    }

    public onCloseDetail(): void {
        (this.byId("fcl") as FlexibleColumnLayout).setLayout(LayoutType.OneColumn);
    }

    public onToggleFullScreen(): void {
        const oModel = this.getView()?.getModel("appView") as JSONModel;
        if (!oModel) return;
        const sCurrentLayout = oModel.getProperty("/layout");
        oModel.setProperty("/layout", sCurrentLayout === LayoutType.MidColumnFullScreen ? LayoutType.TwoColumnsMidExpanded : LayoutType.MidColumnFullScreen);
    }

    public onEditPress(): void {
        (this.getView()?.getModel("viewModel") as JSONModel)?.setProperty("/editMode", true);
    }

    public onCancelPress(): void {
        (this.getView()?.getModel() as ODataModel)?.resetChanges();
        (this.getView()?.getModel("viewModel") as JSONModel)?.setProperty("/editMode", false);
    }

    public onSavePress(): void {
        const oView = this.getView();
        if (!oView) return;
        const oModel = oView.getModel() as ODataModel;
        if (oModel.hasPendingChanges()) {
            oModel.submitChanges({
                success: () => {
                    MessageToast.show("Role salva com sucesso.");
                    (oView.getModel("viewModel") as JSONModel)?.setProperty("/editMode", false);
                },
                error: () => MessageBox.error("Falha ao salvar as alterações.")
            });
        } else {
            MessageToast.show("Não existem alterações para salvar.");
            (oView.getModel("viewModel") as JSONModel)?.setProperty("/editMode", false);
        }
    }

    public onDeletePress(oEvent: UI5Event): void {
        const oContext = (oEvent.getSource() as Button).getBindingContext();
        if (!oContext) return;
        const sPath = oContext.getPath();
        const sName = oContext.getProperty("name") as string;
        const oModel = this.getView()?.getModel() as ODataModel;

        MessageBox.confirm(`Tem a certeza que quer apagar a Role "${sName}"?`, {
            onClose: (sAction: string) => {
                if (sAction === MessageBox.Action.OK && oModel) {
                    oModel.remove(sPath, {
                        success: () => {
                            MessageToast.show("Role apagada com sucesso.");
                            this.onCloseDetail();
                        },
                        error: () => MessageBox.error("Erro ao apagar a role.")
                    });
                }
            }
        });
    }

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

    public onSaveNewRole(): void {
        const oModel = this.getView()?.getModel() as ODataModel;
        const oNewData = (this._oCreateDialog.getModel("newRole") as JSONModel).getData();
        if (!oNewData.name || !oNewData.description) {
            MessageToast.show("Por favor, preencha todos os campos.");
            return;
        }
        if(oModel){
            oModel.create("/Roles", oNewData, {
                success: () => {
                    MessageToast.show("Role criada com sucesso.");
                    this.onCancelNewRole();
                },
                error: () => MessageBox.error("Erro ao criar a Role.")
            });
        }
    }

    public onCancelNewRole(): void {
        this._oCreateDialog.close();
    }
}