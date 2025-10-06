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
import Table from "sap/m/Table";
import Button from "sap/m/Button";

/**
 * @namespace com.alfa.cockpit.controller
 */
export default class Roles extends Controller {

    private _oCreateRoleCollectionDialog: Dialog;
    private _oAddRoleDialog: TableSelectDialog;

    public onInit(): void {
        const oView = this.getView();
        if (oView) {
            oView.setModel(new JSONModel({ layout: LayoutType.OneColumn }), "appView");
            oView.setModel(new JSONModel({ editMode: false }), "viewModel");
        }
    }

    public onListItemPress(oEvent: UI5Event): void {
        const oItem = oEvent.getSource() as ListItemBase;
        const sPath = oItem.getBindingContext()?.getPath();
        if (sPath) {
            const oDetailColumn = this.byId("roleCollectionDetail") as Page;
            if (oDetailColumn) {
                oDetailColumn.bindElement({ path: sPath, parameters: { expand: "navRoles/role" } });
                const oFCL = this.byId("fcl") as FlexibleColumnLayout;
                oFCL.setLayout(LayoutType.TwoColumnsMidExpanded);
            }
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
                    MessageToast.show("Role Collection guardada com sucesso.");
                    (oView.getModel("viewModel") as JSONModel)?.setProperty("/editMode", false);
                },
                error: (oError: any) => MessageBox.error("Falha ao guardar as alterações.")
            });
        } else {
            MessageToast.show("Nenhuma alteração para guardar.");
            (oView.getModel("viewModel") as JSONModel)?.setProperty("/editMode", false);
        }
    }

    public onDeleteRoleCollectionPress(oEvent: UI5Event): void {
        const oButton = oEvent.getSource() as Button;
        const oContext = oButton.getBindingContext();
        if (!oContext) return;

        const sPath = oContext.getPath();
        const sName = oContext.getProperty("name") as string;
        const oModel = this.getView()?.getModel() as ODataModel;

        MessageBox.confirm(`Tem a certeza que quer apagar a Role Collection "${sName}"?`, {
            title: "Confirmar Exclusão",
            onClose: (sAction: string) => {
                if (sAction === MessageBox.Action.OK && oModel) {
                    oModel.remove(sPath, {
                        success: () => {
                            MessageToast.show("Role Collection apagada com sucesso.");
                            this.onCloseDetail(); // Fecha o detalhe, já que o item não existe mais
                        },
                        error: (oError: any) => MessageBox.error("Erro ao apagar a Role Collection.")
                    });
                }
            }
        });
    }

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

    public onSaveNewRoleCollection(): void {
        const oModel = this.getView()?.getModel() as ODataModel;
        const oNewData = (this._oCreateRoleCollectionDialog.getModel("newRoleCollection") as JSONModel).getData();

        if (!oNewData.name || !oNewData.description) {
            MessageToast.show("Please fill all fields.");
            return;
        }

        if(oModel){
            oModel.create("/RoleCollections", oNewData, {
                success: () => {
                    MessageToast.show("Role Collection created successfully.");
                    this.onCancelNewRoleCollection();
                },
                error: (oError: any) => MessageBox.error("Error creating Role Collection.")
            });
        }
    }

    public onCancelNewRoleCollection(): void {
        this._oCreateRoleCollectionDialog.close();
    }

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

    public onAddRoleDialogConfirm(oEvent: any): void {
        const oView = this.getView();
        if (!oView) return;

        const oModel = oView.getModel() as ODataModel;
        const aSelectedContexts = oEvent.getParameter("selectedContexts") as Context[];
        const oDetailContext = (this.byId("roleCollectionDetail") as Page).getBindingContext();

        if (aSelectedContexts.length === 0 || !oDetailContext) {
            return;
        }

        const sRoleCollectionID = oDetailContext.getProperty("ID") as string;

        aSelectedContexts.forEach(oContext => {
            const sRoleID = oContext.getProperty("ID") as string;
            const oPayload = {
                roleCollection_ID: sRoleCollectionID,
                role_ID: sRoleID
            };
            oModel.create("/RoleCollectionRoles", oPayload);
        });

        oModel.submitChanges({
            success: () => {
                MessageToast.show(`${aSelectedContexts.length} role(s) added.`);

                // *** CORREÇÃO APLICADA AQUI ***
                // Em vez de atualizar a tabela, atualizamos o 'binding' da página de detalhes inteira.
                (this.byId("roleCollectionDetail") as Page).getElementBinding()?.refresh();

            },
            error: (oError: any) => {
                MessageBox.error("Error adding roles.");
                oModel.resetChanges(); // Reverte as criações que falharam
            }
        });
    }

    public onAddRoleDialogCancel(): void {}

    public onRemoveRolePress(oEvent: UI5Event): void {
        const oContext = (oEvent.getSource() as ListItemBase).getBindingContext();
        if (!oContext) return;

        const sPath = oContext.getPath();
        const sRoleName = oContext.getProperty("role/name") as string;
        const oModel = this.getView()?.getModel() as ODataModel;

        MessageBox.confirm(`Are you sure you want to remove the role "${sRoleName}" from this collection?`, {
            onClose: (sAction: string) => {
                if (sAction === MessageBox.Action.OK && oModel) {
                    oModel.remove(sPath, {
                        success: () => MessageToast.show("Role removed."),
                        error: (oError: any) => MessageBox.error("Error removing role.")
                    });
                }
            }
        });
    }
}