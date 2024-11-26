# XYL Block Explorer

This is a static, client-side Block Explorer designed for the [XYL Testnet](https://github.com/debxylen/XYL-Testnet). It provides a dark-themed and well-looking interface to view details like balance of an address, recent transactions, block details...etc. 
It is also configurable to work with any Ethereum Virtual Machine (EVM) compatible blockchain.

## Features

- View an address's balance
- Browse recent transactions and transaction details
- Navigate through block details
- Easily adaptable to any EVM chain

## Demo

You can view the live Block Explorer for the XYL Testnet here:
[XYL Block Explorer](https://debxylen.github.io/BlockExplorer/)

## Setup Instructions

### Clone the Repository

To set up your own Block Explorer for any EVM chain, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/debxylen/BlockExplorer.git
   ```
2. Change to the directory:
   ```bash
   cd BlockExplorer
   ```

### Configure the RPC Endpoint

In the `script.js` file, update the `RPC_URL` to connect to your preferred Ethereum node or RPC provider. This could be a public RPC endpoint or a local node.
```javascript
const RPC_URL = 'https://xyl-testnet.glitch.me/rpc/';  // On the first line of script.js, Replace the url with the endpoint of your desired chain.
```


### Run Locally

1. Open `index.html` in your browser to run the Block Explorer locally.

2. Optionally, deploy it to GitHub Pages or any other static file hosting service.

## Customization

- **Block Explorer UI:** You can modify the HTML/CSS to customize the layout and styling of the Block Explorer.
- **Chain Compatibility:** As long as the chain is EVM compatible, the explorer should work by simply adjusting the RPC endpoint and minimal or no other adjustments.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- The Block Explorer was built to work with the XYL Testnet, but it is open to be cloned and adapted for any EVM chain.
