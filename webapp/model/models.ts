import JSONModel from "sap/ui/model/json/JSONModel";
import Device from "sap/ui/Device";

/**
 * @name createDeviceModel
 * @description Cria um JSONModel com informação sobre o dispositivo atual (desktop, tablet, telemóvel).
 * Este modelo é útil para fazer ajustes de layout responsivos na aplicação.
 * O binding mode é definido como "OneWay", pois a informação do dispositivo não precisa de ser alterada pela UI.
 * @returns {sap.ui.model.json.JSONModel} O modelo de dispositivo.
 */
export function createDeviceModel () {
    const model = new JSONModel(Device);
    model.setDefaultBindingMode("OneWay");
    return model;
}