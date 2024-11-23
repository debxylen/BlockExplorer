const RPC_URL = 'https://xyl-testnet.glitch.me/rpc/'; // Replace with your RPC URL

// Send RPC Request
async function sendRPCRequest(method, params) {
  // Construct the request payload
  const payload = {
    jsonrpc: '2.0',
    method: method,
    id: Math.floor(Math.random() * 1000), // Unique ID for each request
  };

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
  console.log(data);
  return data.result; // Extract result from the response
}

// Fetch and display latest blocks
async function fetchLatestBlocks() {
  const latestBlockNumber = await sendRPCRequest('eth_blockNumber'); // Block number in decimal

  const blocksContainer = document.getElementById('latest-blocks');
  blocksContainer.innerHTML = '';

  for (let i = 0; i < 10; i++) {
    const blockNumber = latestBlockNumber - i; // Directly use decimal
    if (blockNumber < 0) {
      break;
    }
    const blockData = await sendRPCRequest('eth_getBlockByNumber', [blockNumber.toString(16)]);
    var blNum = blockData.index;
    if (blNum == "0") { blNum = "Genesis Block"; } else { blNum = "Block Number: " + blNum;}
    const blockElement = document.createElement('div');
    blockElement.classList.add('block');
    blockElement.innerHTML = `
      <p><a href="block_details.html?block=${blockData.hash}">Block Hash: ${blockData.hash}</a></p>
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
  const blockHash = urlParams.get('block');

  if (blockHash) {
    const blockData = await sendRPCRequest('eth_getBlockByHash', [blockHash, true]);
    var blNum = blockData.index;
    if (blNum == "0") { blNum = "Genesis Block"; } else { blNum = "Block Number: " + blNum;}
    const blockDetailsContainer = document.getElementById('block-details');
    blockDetailsContainer.innerHTML = `
      <p>Block Hash: ${blockData.hash}</p>
      <p>${blNum}</p>
      <p>Timestamp: ${new Date(blockData.timestamp * 1000).toLocaleString()}</p>
      <p>Transactions: ${blockData.transactions.length}</p>
      <!-- <p>Miner: ${blockData.miner}</p> -->
    `;

    const rawJsonContainer = document.getElementsByTagName("code")[0];
    rawJsonContainer.textContent = JSON.stringify(blockData, null, 2);
  }
}

// Search functionality
function search() {
  const query = document.getElementById('search-input').value;
  window.location.href = `block_details.html?block=${query}`;
}
async function search() {
  const query = document.getElementById('search-input').value.trim(); // Get and trim input

  if (query) {
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
      window.location.href = `tx_details.html?tx=${query}`;
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
    const blockData = await sendRPCRequest('eth_getBlockByNumber', [blockNumber.toString(16), true]); // Include transactions in the block

    // Create a container for each block
    const blockElement = document.createElement('div');
    blockElement.classList.add('tx-block-container');

    // Add block information
    var blockNum = blockData.index;
    if (blockNum == "0") { blockNum = "Genesis Block"; } else { blockNum = "Block Number: "+blockNum}
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
        <p>Transaction Hash: <a href="transaction_details.html?tx=${tx.hash}">${tx.hash}</a></p>
        <p>From: ${tx.sender}</p>
        <p>To: ${tx.recipient}</p>
        <p>Value: ${parseInt(tx.amount, 16)} XYL</p>
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

// Fetch and display transaction details
async function fetchTransactionDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const txHash = urlParams.get('tx'); // Get transaction hash from URL

  if (txHash) {
    try {
      var transactionData = await sendRPCRequest('eth_getTransactionByHash', [txHash]);

      if (transactionData) {
        const transactionDetailsContainer = document.getElementById('transaction-details');
        const txBlock = await sendRPCRequest('eth_getBlockByNumber', [transactionData.blockNumber.toString(16)]);
        console.log(txBlock);
        const blockHash = txBlock.hash;
        transactionDetailsContainer.innerHTML = `
          <p>Transaction Hash: <a href="transaction_details.html?tx=${transactionData.hash}">${transactionData.hash}</a></p>
          <p>From: ${transactionData.sender}</p>
          <p>To: ${transactionData.recipient}</p>
          <p>Value: ${parseInt(transactionData.amount, 16)} XYL</p>
          <p>Block Hash: <a href="block_details.html?block=${blockHash}">${blockHash}</a></p>
          <p id="tx-block-number">Block Number: ${transactionData.blockNumber}</p>
          <p>Nonce: ${txBlock.nonce}</p>
          <p>Timestamp: ${txBlock.timestamp}</p>
        `;

        // Show raw transaction data in JSON format
        const rawJsonContainer = document.getElementById("raw-json");
        rawJsonContainer.textContent = JSON.stringify(transactionData, null, 2);
        
        // Optional: Highlight raw JSON using highlight.js if required
        hljs.highlightAll();
      } else {
        document.getElementById('transaction-details').innerHTML = '<p>Transaction not found.</p>';
      }
    } catch (error) {
      console.error('Error fetching transaction data:', error);
      document.getElementById('transaction-details').innerHTML = '<p>Error fetching transaction data.</p>';
    }
  } else {
    document.getElementById('transaction-details').innerHTML = '<p>No transaction hash provided.</p>';
  }
}

// Initialize transaction details
if (document.getElementById('transaction-details')) {
  fetchTransactionDetails();
}

async function fetchAndDisplayTransactionReceipt(txIdElement, receiptDiv) {
  try {
    document.getElementById('receipt-btn').style.display = "none";
    var txId = txIdElement.textContent.replace("Block Number: ", "");
    const receiptData = await sendRPCRequest('eth_getTransactionReceipt', [txId]);

    if (receiptData) {
      // Append receipt fields to the provided div
      receiptDiv.innerHTML = `
        <h3>Transaction Receipt</h3>
        <p>Block Hash: ${receiptData.blockHash}</p>
        <p>Block Number: ${parseInt(receiptData.blockNumber, 16)}</p>
        <p>Contract Address: ${receiptData.contractAddress || 'N/A'}</p>
        <p>Cumulative Gas Used: ${parseInt(receiptData.cumulativeGasUsed, 16)}</p>
        <p>Effective Gas Price: ${parseInt(receiptData.effectiveGasPrice, 16)}</p>
        <p>From: ${receiptData.from}</p>
        <p>Gas Used: ${parseInt(receiptData.gasUsed, 16)}</p>
        <p>Status: ${parseInt(receiptData.status, 16) === 1 ? 'Success' : 'Failed'}</p>
        <p>To: ${receiptData.to}</p>
        <p>Transaction Hash: ${receiptData.transactionHash}</p>
        <p>Transaction Index: ${parseInt(receiptData.transactionIndex, 16)}</p>
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

