import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import MilkSupplyChain from '../artifacts/MilkSupplyChain.json'; // Đường dẫn đến file ABI
import './MilkSupplyChain.css'; // Import file CSS

const MilkSupplyChainComponent = () => {
    const [account, setAccount] = useState('');
    const [contract, setContract] = useState(null);
    const [milkBatchCode, setMilkBatchCode] = useState('');
    const [farmName, setFarmName] = useState('');
    const [milkBatches, setMilkBatches] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const init = async () => {
            const web3 = new Web3(Web3.givenProvider || "http://127.0.0.1:7545");
            const accounts = await web3.eth.getAccounts();
            setAccount(accounts[0]);

            const networkId = await web3.eth.net.getId();
            const deployedNetwork = MilkSupplyChain.networks[networkId];
            const instance = new web3.eth.Contract(
                MilkSupplyChain.abi,
                deployedNetwork && deployedNetwork.address,
            );
            setContract(instance);
            loadMilkBatches(instance);
        };

        init();
    }, []);

    const loadMilkBatches = async (instance) => {
        const count = await instance.methods.milkBatchCount().call();
        const batches = [];
        for (let i = 1; i <= count; i++) {
            const batch = await instance.methods.milkBatches(i).call();
            batches.push(batch);
        }
        setMilkBatches(batches);
    };

    const createMilkBatch = async () => {
        setErrorMessage(''); // Reset error message
        try {
            await contract.methods.createMilkBatch(milkBatchCode, farmName).send({ from: account, gas: 3000000 });
            loadMilkBatches(contract);
            setMilkBatchCode(''); // Reset input field
            setFarmName(''); // Reset input field
        } catch (error) {
            setErrorMessage("Error creating milk batch: " + error.message);
            console.error("Error creating milk batch:", error);
        }
    };

    return (
        <div className="container">
            <h1>Milk Supply Chain</h1>
            <h2>Account: {account}</h2>
            <div className="input-group">
                <h3>Create Milk Batch</h3>
                <input
                    type="text"
                    placeholder="Batch Code"
                    value={milkBatchCode}
                    onChange={(e) => setMilkBatchCode(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Farm Name"
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                />
                <button onClick={createMilkBatch}>Create Batch</button>
                {errorMessage && <div className="error-message">{errorMessage}</div>} {/* Hiển thị thông báo lỗi */}
            </div>
            <h3>Existing Milk Batches</h3>
            <ul>
                {milkBatches.map((batch) => (
                    <li key={batch.id}>
                        {batch.batchCode} - {batch.farmName} - Status: {batch.status}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MilkSupplyChainComponent;