const moment = require("moment");
const { Job, sequelize, Profile, Contract } = require("../model");
const { Op } = require("sequelize");

const highestPaidProfession = async(req, res) => {
    console.log(":: req", req.query);
    let { start, end } = req.query || {};
    start = start && new Date(start) || new Date("1900-01-01");
    end = end && new Date(end) || new Date()
    console.log("newwdd", start, end);
    try {
        const sumByContractId = await Job.findAll({
            where: { paid: true, createdAt: {
                [Op.between]: [start, end],
            },
        },
            attributes: [
                "ContractId",
                [ sequelize.fn('sum', sequelize.col('price')), 'totalAmountPaid' ],
            ],
            group: ['ContractId'],
            order: [[sequelize.literal('totalAmountPaid'), 'DESC']],
            limit: 1,
            include: [
                {
                    model: Contract,
                    attributes: ["id", "ContractorId"],
                    required: true,
                    include: [
                        {
                            model: Profile,
                            attributes: ["profession"],
                            as: "Contractor",
                            required: true
                        }
                    ]
                },
            ]
        });
        const highestPaidProfession = sumByContractId?.[0]?.Contract?.Contractor?.profession
        console.log(":: sumByContractId ::", highestPaidProfession)
        return res.status(200).json({ highestPaidProfession });
    } catch(error) {
        console.log(":: error inside lBc ::", error);
        return res.status(400).send("Something went wrong");
    }
}

const listBestClients = async(req, res) => {
    console.log(":: req ", req.query);
    let { start, end, limit } = req.query || {};
    start = start && new Date(start) || new Date("1900-01-01");
    end = end && new Date(end) || new Date()
    limit = limit || 2
    console.log("newwdd", start, end);
    try {
        const sumByContractId = await Job.findAll({
            where: { paid: true, createdAt: {
                [Op.between]: [start, end],
                },
            },
            attributes: [
                "ContractId",
                [ sequelize.fn('sum', sequelize.col('price')), 'totalAmountPaid' ],
            ],
            group: ['ContractId'],
            order: [[sequelize.literal('totalAmountPaid'), 'DESC']],
            limit,
            include: [
                {
                    model: Contract,
                    attributes: ["id", "ContractorId"],
                    required: true,
                    include: [
                        {
                            model: Profile,
                            attributes: ["id", "firstName", "lastName"],
                            as: "Client",
                            required: true
                        }
                    ]
                },
            ]
        }, { raw: true, nest: true, plain: true });
        console.log(":: sumByContractId ::", sumByContractId)
        const clientDetails = [];
        sumByContractId?.forEach(obj => {
            // console.log(":: obj ::", obj, obj?.totalAmountPaid)
            // clientDetails.push(obj, Object.keys(obj))
            const { dataValues } = obj || {}
            clientDetails.push({
                id: dataValues?.Contract?.Client?.id,
                fullName: `${dataValues?.Contract?.Client?.firstName} ${dataValues?.Contract?.Client?.lastName}`,
                paid: dataValues?.totalAmountPaid
            })
        })
        return res.status(200).json(clientDetails);
    } catch(error) {
        console.log(":: error inside lBc ::", error);
        return res.status(400).send("Something went wrong");
    }
}

module.exports = {
    highestPaidProfession,
    listBestClients
}