const { Contract, sequelize } = require("../model")

const getContractById = async(req, res) => {
    const { id } = req.params
    try {
        const contract = await Contract.findOne({ where: { id, ContractorId: req.profile.id }})
        if(!contract) return res.status(404).end()
        res.status(200).json(contract)
    } catch(error) {
        console.log(":: error inside gCBId ::", error);
        return res.status(400).send("Something went wrong");
    }
}

const getOngoingContractsOfUser = async(req, res) => {
    const userId = req.profile.id;
    try {
        const userContracts = await Contract.findAll(
            { where: sequelize.and(
                { status: "in_progress" }, 
                sequelize.or(
                    { ContractorId: userId }, 
                    { ClientId: userId }
                )
            )}
        );
        if(!userContracts) return res.status(404).send("No Ongoing Contracts")
        res.status(200).json(userContracts)
    } catch(error) {
        console.log(":: error inside gOgCOU ::", error);
        return res.status(400).send("Something went wrong");
    }
}
module.exports = {
    getContractById,
    getOngoingContractsOfUser
}