const RPC_URL = 'https://ethereum-rpc.publicnode.com';

// Send RPC Request
async function sendRPCRequest(method, params) {
  // Construct the request payload
  const payload = {
    jsonrpc: '2.0',
    method: method,
    id: Math.floor(Math.random() * 1000), // Unique ID for each request
  };
  // // console.log(params);
  // Add params only if they are provided
  if (params !== undefined) {
    payload.params = params;
  }

  const response = await fetch(RPC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  // // console.log(data.result);
  return data.result; // Extract result from the response
}

// Fetch and display latest blocks
async function fetchLatestBlocks() {
  var latestBlockNumber = await sendRPCRequest('eth_blockNumber'); 
  latestBlockNumber = parseInt(latestBlockNumber, 16); //decimal
  const blocksContainer = document.getElementById('latest-blocks');
  blocksContainer.innerHTML = '';

  for (let i = 0; i < 10; i++) {
    const blockNumber = latestBlockNumber - i; // Directly use decimal
    if (blockNumber < 0) {
      break;
    }
    const blockData = await sendRPCRequest('eth_getBlockByNumber', ["0x" + blockNumber.toString(16), false]);
    var blNum = Number(blockData.number);
    if (blNum == 0) { blNum = "Genesis Block"; } else { blNum = "Block Number: " + blNum;}
    const blockElement = document.createElement('div');
    blockElement.classList.add('block');
    blockElement.innerHTML = `
      <p><a href="block_details.html?hash=${blockData.hash}">Block Hash: ${blockData.hash}</a></p>
      <p>${blNum}</p>
      <p>Transactions: ${blockData.transactions.length}</p>
      <p>Timestamp: ${blockData.timestamp}</p>
    `;
    blocksContainer.appendChild(blockElement);
  }
}

// Fetch and display block details
async function fetchBlockDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const blockId = urlParams.get('id');
  const blockHash = urlParams.get('hash');
  if (blockHash) {
    const blockData = await sendRPCRequest('eth_getBlockByHash', [blockHash, false]);
    var blNum = Number(blockData.number);
    if (blNum == 0) { blNum = "Genesis Block"; } else { blNum = "Block Number: " + blNum;}
    const blockDetailsContainer = document.getElementById('block-details');
    blockDetailsContainer.innerHTML = `
      <p>Block Hash: ${blockData.hash}</p>
      <p>${blNum}</p>
      <p>Timestamp: ${new Date(blockData.timestamp * 1000).toLocaleString()}</p>
      <p>Transactions: ${blockData.transactions.length}</p>
      <p>Miner: ${blockData.miner}</p>
    `;

    const rawJsonContainer = document.getElementsByTagName("code")[0];
    rawJsonContainer.textContent = JSON.stringify(blockData, null, 2);
  } else if (blockId) {
    const blockData = await sendRPCRequest('eth_getBlockByNumber', [ "0x" + Number(blockId).toString(16), false]); // convert blockid to hex
    var blNum = Number(blockData.number);
    if (blNum == 0) { blNum = "Genesis Block"; } else { blNum = "Block Number: " + blNum;}
    const blockDetailsContainer = document.getElementById('block-details');
    blockDetailsContainer.innerHTML = `
      <p>Block Hash: ${blockData.hash}</p>
      <p>${blNum}</p>
      <p>Timestamp: ${new Date(blockData.timestamp * 1000).toLocaleString()}</p>
      <p>Transactions: ${blockData.transactions.length}</p>
      <p>Miner: ${blockData.miner}</p>
    `;

    const rawJsonContainer = document.getElementsByTagName("code")[0];
    rawJsonContainer.textContent = JSON.stringify(blockData, null, 2);
  }
}

async function search() {
  const query = document.getElementById('search-input').value.trim(); // Get and trim input

  if (query) {
    if (query.startsWith("0x")) {
      window.location.href = `address.html?address=${query}`;
      return;
    }
    // It's a valid hash format; check if it's a block or a transaction
    const blockData = await sendRPCRequest('eth_getBlockByHash', [query]);
    if (blockData) {
      // If it's found as a block, redirect to block details
      window.location.href = `block_details.html?block=${query}`;
      return;
    }

    const transactionData = await sendRPCRequest('eth_getTransactionByHash', [query]);
    if (transactionData) {
      // If it's found as a transaction, redirect to transaction details
      window.location.href = `tx.html?hash=${query}`;
      return;
    }

    // If neither match, show an error
    alert('Invalid hash: Not a valid block or transaction hash.');
  } else {
    alert('Invalid input: Enter a valid hash.');
  }
}


// Initialize latest blocks
if (document.getElementById('latest-blocks')) {
  fetchLatestBlocks();
}

// Initialize block details and highlight code blocks
if (document.getElementById('block-details')) {
  fetchBlockDetails().then(() => {
    hljs.highlightAll();
  });
}

// Fetch and display latest transactions
async function fetchLatestTransactions() {
  const latestBlockNumber = await sendRPCRequest('eth_blockNumber'); // Block number in decimal

  const transactionsContainer = document.getElementById('latest-transactions');
  transactionsContainer.innerHTML = '';

  for (let i = 0; i < 10; i++) {
    const blockNumber = latestBlockNumber - i; // Directly use decimal
    if (blockNumber < 0) {
      break;
    }
    const blockData = await sendRPCRequest('eth_getBlockByNumber', ["0x" + blockNumber.toString(16), true]); // Include transactions in the block

    // Create a container for each block
    const blockElement = document.createElement('div');
    blockElement.classList.add('tx-block-container');

    // Add block information
    var blockNum = Number(blockData.number);
    if (blockNum == 0) { blockNum = "Genesis Block"; } else { blockNum = "Block Number: "+blockNum}
    blockElement.innerHTML = `
      <h4>${blockNum}</h4>
      <p>Block Hash: <a href="block_details.html?block=${blockData.hash}">${blockData.hash}</a></p>
      <p>Timestamp: ${new Date(blockData.timestamp * 1000).toLocaleString()}</p>
    `;

    // Loop through each transaction in the block and add it under the block
    const transactionsList = document.createElement('div');
    transactionsList.classList.add('transactions-list');

    for (let tx of blockData.transactions) {
      const transactionElement = document.createElement('div');
      transactionElement.classList.add('transaction');

      transactionElement.innerHTML = `
        <p>Transaction Hash: <a href="tx.html?tx=${tx.hash}">${tx.hash}</a></p>
        <p>From: ${tx.from}</p>
        <p>To: ${tx.to}</p>
        <p>Value: ${Number(tx.value) / 10**18} XYL</p>
      `;
      transactionsList.appendChild(transactionElement);
    }

    // Append the transactions to the block container
    blockElement.appendChild(transactionsList);

    // Add the block container to the main container
    transactionsContainer.appendChild(blockElement);
  }
}


// Initialize transactions
if (document.getElementById('latest-transactions')) {
  fetchLatestTransactions();
}

async function fetchTransactionByHash(txId) {
  try {
    var transactionDetailsContainer = document.getElementById('transaction-details');
    const receiptData = await sendRPCRequest('eth_getTransactionReceipt', [txId]);

    if (receiptData) {
      // Append receipt fields to the provided div
      transactionDetailsContainer.innerHTML = `
        <h3>Transaction #${parseInt(receiptData.blockNumber, 16)}</h3>
        <p>From: ${receiptData.from}</p>
        <p>To: ${receiptData.to}</p>
        <p>Amount: ${Number(receiptData.value)/(10**18)} XYL</p>
        <p>Block Hash: ${receiptData.blockHash}</p>
        <p>Block Number: ${parseInt(receiptData.blockNumber, 16)}</p>
        <p>Transaction Hash: ${receiptData.transactionHash}</p>
        <p>Transaction Index: ${parseInt(receiptData.transactionIndex, 16)}</p>
        <p>Contract Address: ${receiptData.contractAddress || 'N/A'}</p>
        <p>Cumulative Gas Used: ${Number(receiptData.cumulativeGasUsed)} wei</p>
        <p>Effective Gas Price: ${Number(receiptData.effectiveGasPrice)} wei</p>
        <p>Gas Used: ${Number(receiptData.gasUsed)} wei</p>
        <p>Status: ${parseInt(receiptData.status, 16) === 1 ? 'Success' : 'Failed'}</p>
        <p>Type: ${receiptData.type}</p>
        <h4>Raw JSON</h4>
        <pre><code class="json">${JSON.stringify(receiptData, null, 2)}</code></pre>
      `;
      
      // Highlight the raw JSON using highlight.js
      hljs.highlightAll();
    } else {
      receiptDiv.innerHTML = '<p>No receipt found for this transaction.</p>';
    }
  } catch (error) {
    console.error('Error fetching transaction receipt:', error);
    receiptDiv.innerHTML = '<p>Error fetching transaction receipt.</p>';
  }
}

async function fetchTransaction() {
  const urlParams = new URLSearchParams(window.location.search);
  const txHash = urlParams.get('hash');
  
  if (txHash) {
    fetchTransactionByHash(txHash); // Fetch transaction by hash
  } else {
    console.error('No valid parameters provided.');
    alert('No valid parameters provided. Please include the transaction\'s hash in the URL.');
  }
}

if (document.getElementById('receipt-div')) {
  fetchTransaction();
}


// Fetch recent transactions for a specific address and directly render them in the table
async function getRecentTransactionsByUser(address, maxBlocks = 100) {
  var latestBlockNumber = await sendRPCRequest('eth_blockNumber'); // Get the latest block number 
  latestBlockNumber = parseInt(latestBlockNumber, 16); //decimal 
  const transactionsTable = document.querySelector('.transactions table');
  const transactionsTBody = transactionsTable.querySelector('tbody');


  // Iterate over the blocks and fetch transactions
  for (let i = 0; i < maxBlocks; i++) {
    const blockNumber = latestBlockNumber - i; // Block number to query
    if (blockNumber < 0) break; // Stop if we go below block 0

    // Fetch block data with transactions
    const blockData = await sendRPCRequest('eth_getBlockByNumber', ["0x" + blockNumber.toString(16), true]);

    // Filter and render transactions involving the address
    for (let tx of blockData.transactions) {
      if (tx.sender.toLowerCase() === address.toLowerCase() || tx.recipient.toLowerCase() === address.toLowerCase()) {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td><a href="block_details.html?id=${blockNumber}">${blockNumber}</a></td>
          <td><a href="tx.html?hash=${tx.hash}">${tx.hash}</a></td>
          <td>${tx.sender}</td>
          <td>${tx.recipient}</td>
          <td>${Number(tx.value) / (10**18)} XYL</td>
          <td>${new Date(blockData.timestamp * 1000).toLocaleString()}</td>
        `;
        transactionsTBody.appendChild(row);
      }
    }
  }
}

// Fetch and render address info (balance and recent transactions)
async function fetchAddressInfo() {
  const urlParams = new URLSearchParams(window.location.search);
  const address = urlParams.get('address'); // Get the address from the URL

  try {
    // Fetch and render balance
    const balance = await sendRPCRequest('eth_getBalance', [address]);
    document.querySelector('.address-info').innerHTML = `
      <h2>Address: ${address}</h2>
      <p><strong>Balance:</strong> ${parseInt(balance, 16) / 10 ** 18} XYL</p>
    `;

    // Fetch and render recent transactions directly in the table
    await getRecentTransactionsByUser(address);

  } catch (error) {
    console.error('Error fetching address info:', error);
    document.body.innerHTML = '<p>Error fetching address info.</p>';
  }
}



if (document.getElementById('address-info')) {
  fetchAddressInfo();
}