// webapp/model/formatter.ts
export default {
    /**
     * Converte o status em string ("enable") para um booleano (true)
     * @param {string} sStatus o status vindo do modelo
     * @returns {boolean} true se o status for "enable", senão false
     */
    statusToBoolean(sStatus: string): boolean {
        return sStatus === "enable";
    }
};