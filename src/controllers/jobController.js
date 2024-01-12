const { Job, sequelize, Contract } = require("../model");

const getUnPaidJobsByUserId = async(req, res) => {
    const userId = req.profile.id;
    try {
        const unpaidJobs = await Job.findAll({
            where: { paid: null },
            include: [{
                model: Contract,
                where: sequelize.or({ContractorId: userId}, {ClientId: userId}),
                required: true
            }]
        })
        if(!unpaidJobs) return res.status(404).send("No unpaid jobs");
        res.status(200).json(unpaidJobs)
    } catch(error) {
        console.log(":: error inside gUPJBuId ::", error);
        return res.status(400).send("Something went wrong");
    }
}

const processPaymentForAJob = async(req, res) => {
    const { id: clientId, balance } = req.profile || {};
    const { job_id } = req.params;
    try {
        /* finding if there is a job with this id 
            and the clientId is the same as logged in user
        */
        const job = await Job.findOne({ 
            where: { id: job_id },
            include: [{
                model: Contract,
                where: { ClientId: clientId },
                required: true
            }]
        });
        if(!job) {
            return res.status(404).send("Invalid Job");
        }
        if(!balance || job?.price > balance) {
            return res.status(400).send("Insufficient Balance");
        }
        let transaction;
        try {
            transaction = await sequelize.transaction();
            const debitFromClient = await Profile.decrement("balance", {
                by: job?.price,
                where: {
                    id: clientId
                }
            }, { transaction });
            const creditToContractor = await Profile.increment("balance", {
                by: job?.price,
                where: {
                    id: job.Contract.ContractorId
                }
            }, { transaction });
            console.log('success', debitFromClient, creditToContractor);
            await transaction.commit();
            return res.status(200).send("SUCCESS");
        } catch (error) {
            console.log('error', error);
            if(transaction) {
               await transaction.rollback();
            }
            return res.status(500).send("Transaction failed, Please try later");
        }
    } catch(error) {
        console.log(":: error inside ppFAj ::", error);
        return res.status(400).send("Something went wrong");
    }
}
module.exports = {
    getUnPaidJobsByUserId,
    processPaymentForAJob
}