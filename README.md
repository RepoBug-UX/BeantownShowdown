# Snowball: A Decentralized Crowdfunding Platform

## Overview

Snowball is a decentralized fundraising and DAO management smart contract system that allows users to create and manage DAOs with specific funding goals, milestones, and transparent fund disbursement. The system integrates with a MongoDB server for data storage and a Next.js frontend for user interaction, and is deployed on Avalanche’s Layer 1 (L1) network for fast, scalable, and low-cost transactions.

## DFactory.sol

### Description

The daoFactory contract manages the creation and tracking of decentralized autonomous organizations (DAOs) within the Snowball ecosystem. It allows users to deploy DAOs with specified funding goals and durations.

### Key Features

- **DAO Tracking**: Maintains mappings to track DAOs created by users.
- **DAO Structure**: Defines a `dao` struct containing:
  - `address dao`: The DAO contract address.
  - `address creator`: The creator of the DAO.
  - `string campaignID`: A unique campaign identifier.

### Functionality

- Creates DAOs with funding goals and milestones.
- Stores DAOs under user mappings.

### Dependencies

- Imports DFund.sol to manage fundraising functionality.

## DFund.sol

### Description

The DFund contract handles decentralized fundraising, milestone tracking, and fund distribution within the Snowball project.

### Key Features

- **Error Handling**: Implements custom errors for security and validation.
- **Milestone Structure**: Defines a `milestone` struct with:
  - `string milestoneDescription`: Description of the milestone.
  - `uint256 votes`: Number of approvals from funders.
  - `bool approved`: Indicates if the milestone is approved.
  - `bool claimed`: Tracks if funds have been claimed.
  - `string finishedMile`: Marks completed milestones.

### Security Mechanisms

- Prevents reentrancy attacks.
- Ensures only funders and creators can perform actions.

### Fund Management

- Handles fund collection, milestone approval, and fund disbursement.

## MongoDB Server

The Snowball project utilizes a **MongoDB server** for persistent storage of DAO data, fundraising milestones, and user interactions. The MongoDB database allows for scalable, fast access to data related to DAOs and fundraising campaigns, supporting features like:

- Storing DAO metadata (creator, campaign ID, funding goal, etc.)
- Tracking milestone status and fund distribution
- Managing user data (contributors, approvals, etc.)

## Next.js Frontend

The Snowball project features a **Next.js frontend** that serves as the user interface for interacting with the decentralized ecosystem. The frontend communicates with the smart contracts deployed on Avalanche or other blockchains and provides users with a seamless experience to:

- Create and manage DAOs
- Track campaign progress and milestones
- Contribute to fundraising efforts
- View DAO and fundraising details (including milestones, goals, and approvals)

The frontend is designed for scalability, accessibility, and ease of use, with responsive design and integrations with Web3 technologies.

## Libraries & Tools Used

- **Wagmi**: A React hooks library for Ethereum used for wallet connection and account management.
- **RainbowKit**: Provides the wallet connection button (ConnectButton) for easy wallet interactions.
- **AvaCloud SDK**: Used to integrate Avalanche blockchain functionality with `@avalabs/avacloud-sdk`.
- **Fuji Testnet**: A development and testing environment for deploying and testing smart contracts.

## Steps to Launch Snowball on Avalanche’s Layer 1 (L1)

### Step 1: Create Snowball Blockchain

avalanche blockchain create SnowballNet --sovereign=false

select:

- subnetEVM
- default values
- block ID: 6697108108115
- Token symbol: SNWB

### Step 2: Deploy Snowball Blockchain'

avalanche blockchain deploy SnowballNet

select:

- localhost

[Watch Snowball Live](https://streamable.com/mnnqq9)
