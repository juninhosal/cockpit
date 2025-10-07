import Controller from "sap/ui/core/mvc/Controller";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import MessageBox from "sap/m/MessageBox";
import MessageToast from "sap/m/MessageToast";

/**
 * @namespace com.alfa.cockpit.model
 * @class Api
 * @description Classe genérica para interagir com o modelo OData.
 * Abstrai as chamadas de criação, atualização e remoção, retornando Promises.
 */
export default class Api {
    private controller: Controller;

    /**
     * @public
     * @constructor
     * @param {sap.ui.core.mvc.Controller} controller O controller que utilizará a API.
     */
    constructor(controller: Controller) {
        this.controller = controller;
    }

    private _getModel(): ODataModel | null {
        const oView = this.controller.getView();
        if (oView) {
            return oView.getModel() as ODataModel;
        }
        return null;
    }

    /**
     * @public
     * @name create
     * @description Cria uma nova entrada no modelo OData.
     * @param {string} path O caminho da entidade (ex: "/Users").
     * @param {object} payload Os dados a serem criados.
     * @param {string} successMessage Mensagem de sucesso a ser exibida.
     * @param {string} errorMessage Mensagem de erro a ser exibida.
     * @returns {Promise<object>} Uma Promise que resolve com os dados de resposta ou rejeita com o erro.
     */
    public create(path: string, payload: object, successMessage: string, errorMessage: string): Promise<object> {
        return new Promise((resolve, reject) => {
            const oDataModel = this._getModel();
            if (!oDataModel) {
                const error = "ODataModel não encontrado.";
                MessageBox.error(error);
                return reject(error);
            }

            oDataModel.create(path, payload, {
                success: (oData: object) => {
                    MessageToast.show(successMessage);
                    resolve(oData);
                },
                error: (oError: any) => {
                    MessageBox.error(errorMessage);
                    reject(oError);
                }
            });
        });
    }

    /**
     * @public
     * @name remove
     * @description Remove uma entrada do modelo OData.
     * @param {string} path O caminho para a entrada a ser removida (ex: "Users('123')").
     * @param {string} successMessage Mensagem de sucesso a ser exibida.
     * @param {string} errorMessage Mensagem de erro a ser exibida.
     * @returns {Promise<object>} Uma Promise que resolve com os dados de resposta ou rejeita com o erro.
     */
    public remove(path: string, successMessage: string, errorMessage: string): Promise<object> {
        return new Promise((resolve, reject) => {
            const oDataModel = this._getModel();
            if (!oDataModel) {
                const error = "ODataModel não encontrado.";
                MessageBox.error(error);
                return reject(error);
            }

            oDataModel.remove(path, {
                success: (oData: object) => {
                    MessageToast.show(successMessage);
                    resolve(oData);
                },
                error: (oError: any) => {
                    MessageBox.error(errorMessage);
                    reject(oError);
                }
            });
        });
    }

    /**
     * @public
     * @name submitChanges
     * @description Submete as alterações pendentes no modelo OData.
     * @param {string} successMessage Mensagem de sucesso a ser exibida.
     * @param {string} errorMessage Mensagem de erro a ser exibida.
     * @returns {Promise<object>} Uma Promise que resolve com os dados de resposta ou rejeita com o erro.
     */
    public submitChanges(successMessage: string, errorMessage: string): Promise<object> {
        return new Promise((resolve, reject) => {
            const oDataModel = this._getModel();
            if (!oDataModel) {
                const error = "ODataModel não encontrado.";
                MessageBox.error(error);
                return reject(error);
            }

            if (oDataModel.hasPendingChanges()) {
                oDataModel.submitChanges({
                    success: (oData: object) => {
                        MessageToast.show(successMessage);
                        resolve(oData);
                    },
                    error: (oError: any) => {
                        MessageBox.error(errorMessage);
                        oDataModel.resetChanges();
                        reject(oError);
                    }
                });
            } else {
                MessageToast.show("Nenhuma alteração para salvar.");
                resolve({});
            }
        });
    }
}
