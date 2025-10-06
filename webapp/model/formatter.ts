/**
 * @namespace com.alfa.cockpit.model
 * @name com.alfa.cockpit.model.formatter
 * @description Ficheiro de formatação. Contém funções que podem ser usadas nas vistas XML para formatar dados do modelo.
 * Os formatters são úteis para converter dados em formatos que a UI pode entender ou para formatação visual.
 */
export default {
    /**
     * @public
     * @name statusToBoolean
     * @description Converte o status em string (ex: "enable", "disable") para um valor booleano.
     * Útil para controlar propriedades de UI como o estado de um Switch.
     * @param {string} sStatus O status vindo do modelo.
     * @returns {boolean} Retorna `true` se o status for "enable", caso contrário `false`.
     */
    statusToBoolean(sStatus: string): boolean {
        return sStatus === "enable";
    }
};