const { Job, Contract, sequelize, Profile } = require("../model");

const depositAmount = async(req, res) => {
    const { userId } = req.params || {};
    console.log(":: data inside depositAmount ::", req.body);
    const data = req.body;
    try {
        const jobs = await Job.findAll({ 
            where: { paid: null },
            include: [{
                model: Contract,
                where: { ClientId: userId },
                required: true
            }]
        });
        if(!jobs || !jobs.length) {
            return res.status(400).send("No Pending payments");
        }
        let pendingAmount = 0;
        jobs.forEach(job => {
            pendingAmount += job?.price || 0;
        })
        console.log(":: pendingAmount ::", userId, pendingAmount);
        const permissibleRecharge = pendingAmount / 4;
        if(data?.amount > permissibleRecharge) {
            return res.status(400).send(`You can recharge maximum of ${permissibleRecharge}`);
        }
        const creditToClient = await Profile.increment("balance", {
            by: data?.amount,
            where: {
                id: userId
            }
        });
        console.log(":: creditToClient ::", creditToClient)
        return res.status(200).send("Amount is successfully credited");
    } catch(error) {
        console.log(":: error inside dA ::", error);
        return res.status(400).send("Something went wrong");
    }
}

module.exports = { depositAmount };