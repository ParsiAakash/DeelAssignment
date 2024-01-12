const express = require('express');
const bodyParser = require('body-parser');
const {sequelize, Profile, Job, Contract} = require('./model')
const {getProfile} = require('./middleware/getProfile')
const app = express();
const { Op } = require("sequelize");
const { getContractById, getOngoingContractsOfUser } = require('./controllers/contractController');
const { getUnPaidJobsByUserId, processPaymentForAJob } = require('./controllers/jobController');
const { depositAmount } = require('./controllers/profileController');
const { highestPaidProfession, listBestClients } = require('./controllers/adminAnalysisController');
app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

/**
 * FIX ME!
 * @returns contract by id
 */
app.get('/contracts/:id', getProfile ,async (req, res) => {
    getContractById(req, res);
})

app.get('/contracts/', getProfile ,async (req, res) => {
    getOngoingContractsOfUser(req, res);
})

app.get('/jobs/unpaid/', getProfile ,async (req, res) => {
    getUnPaidJobsByUserId(req, res);
})

app.post('/jobs/:job_id/pay', getProfile ,async (req, res) =>{
    processPaymentForAJob(req,res)
});

app.post('/balances/deposit/:userId', getProfile ,async (req, res) =>{
    depositAmount(req, res)
});

app.get('/admin/best-profession', async (req, res) => {
    highestPaidProfession(req, res)
})

app.get("/admin/best-clients", async(req, res) => {
    listBestClients(req, res);
})

app.get('/yoBro',async (req, res) =>{
    // const { Contract } = req.app.get('models')
    const id = req.get('profile_id')
    console.log(":: id ::", id);
    const contracts = await Contract.findAll({})
    const profiles = await Profile.findAll({})
    const jobs = await Job.findAll({})

    res.json({ contracts, profiles, jobs })
})
module.exports = app;
