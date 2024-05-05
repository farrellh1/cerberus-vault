// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {OwnerManager} from "./OwnerManager.sol";
import "hardhat/console.sol";

/**
 * @dev Cerberus Vault: Multi Sig Wallet
 */
contract CerberusVault is OwnerManager {
    mapping(uint256 => Transaction) public transactions;
    uint256 public nonce;

    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        bool executed;
        uint256 confirmationCount;
        mapping(address => bool) isConfirmed;
    }

    event SubmitTransaction(
        uint256 nonce,
        address indexed to,
        uint256 value,
        bytes data
    );
    event Confirmation(uint256 nonce, address indexed owner);
    event Revocation(uint256 nonce, address indexed owner);
    event Execution(
        uint256 nonce,
        address indexed to,
        uint256 value,
        bytes data
    );
    event Deposit(address indexed owner, uint256 amount);
    event Withdrawal(address indexed owner, uint256 amount);

    /**
     * @dev Constructor for the Cerberus Vault
     *
     * @param _owners Array of owners
     * @param _threshold Required number of confirmations
     */
    constructor(address[] memory _owners, uint256 _threshold) {
        // Set up owners and threshold using OwnerManager
        setupOwners(_owners, _threshold);
    }

    /**
     * @dev Deposit into the vault
     *
     * Emits:
     * - Deposit(address indexed owner, uint256 amount)
     */
    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    /**
     * @dev Withdraw from the vault
     * @param _amount Transaction nonce
     *
     * Requrements:
     * - Only callable by the owner
     *
     * Emits:
     * - Withdrawal(address indexed owner, uint256 amount)
     */
    function withdraw(uint256 _amount) external payable onlyOwner {
        (bool success, ) = msg.sender.call{value: _amount}("");
        require(success, "Failed to withdraw");

        emit Withdrawal(msg.sender, _amount);
    }

    /**
     * @dev Submit a transaction
     *
     * Requrements:
     * - Only callable by the owner
     *
     * @param _to Address of the recipient
     * @param _value Amount of ETH to send
     * @param _data Transaction data
     *
     * Emits:
     * - SubmitTransaction(uint256 nonce, address indexed to, uint256 value, bytes data)
     */
    function submit(
        address _to,
        uint256 _value,
        bytes calldata _data
    ) public onlyOwner {
        nonce++;
        Transaction storage transaction = transactions[nonce];
        transaction.to = _to;
        transaction.value = _value;
        transaction.data = _data;

        emit SubmitTransaction(nonce, _to, _value, _data);
    }

    /**
     * @dev Confirm a transaction
     *
     * Requrements:
     * - Transaction must have been submitted
     * - Only callable by the owner
     * - Transaction must not have been executed
     * - Transaction must not have been confirmed by the owner
     *
     * @param _nonce Transaction nonce
     *
     * Emits:
     * - Confirmation(uint256 nonce, address indexed owner)
     */
    function confirm(uint256 _nonce) public onlyOwner validNonce(_nonce) {
        require(nonce >= _nonce, "Invalid nonce");
        require(
            transactions[_nonce].executed == false,
            "Transaction already executed"
        );
        require(
            transactions[_nonce].isConfirmed[msg.sender] == false,
            "Transaction already confirmed"
        );
        transactions[_nonce].isConfirmed[msg.sender] = true;
        transactions[_nonce].confirmationCount++;

        emit Confirmation(_nonce, msg.sender);
    }

    /**
     * @dev Revoke a transaction
     * @param _nonce Transaction nonce
     *
     * Requrements:
     * - Transaction must have been submitted
     * - Only callable by the owner
     * - Transaction must not have been executed
     * - Transaction must be confirmed by the owner
     *
     * Emits:
     * - Revocation(uint256 nonce, address indexed owner)
     */
    function revoke(uint256 _nonce) external onlyOwner validNonce(_nonce) {
        require(
            transactions[_nonce].executed == false,
            "Transaction already executed"
        );
        require(
            transactions[_nonce].isConfirmed[msg.sender] == true,
            "Transaction not confirmed"
        );

        transactions[_nonce].isConfirmed[msg.sender] = false;

        emit Revocation(_nonce, msg.sender);
    }

    /**
     * @dev Submit a transaction and confirm
     *
     * Requrements:
     * - Only callable by the owner
     *
     * @param _to Address of the recipient
     * @param _value Amount of ETH to send
     * @param _data Transaction data
     *
     * Emits:
     * - SubmitTransaction(uint256 nonce, address indexed to, uint256 value, bytes data)
     * - Confirmation(uint256 nonce, address indexed owner)
     */
    function submitAndConfirm(
        address _to,
        uint256 _value,
        bytes calldata _data
    ) external onlyOwner {
        submit(_to, _value, _data);
        confirm(nonce);
    }

    /**
     * @dev Execute a transaction
     *
     * Requrements:
     * - Transaction must have been submitted
     * - Only callable by the owner
     * - Transaction must not have been executed
     * - Transaction must have enough confirmations
     *
     * @param _nonce Transaction nonce
     *
     * Emits:
     * - Execution(uint256 nonce, address indexed to, uint256 value, bytes data)
     */
    function execute(uint256 _nonce) public onlyOwner validNonce(_nonce) {
        Transaction storage transaction = transactions[_nonce];
        require(transaction.executed == false, "Transaction already executed");
        require(
            transaction.confirmationCount >= threshold,
            "Not enough confirmations"
        );

        transaction.executed = true;
        (bool success, ) = transaction.to.call{value: transaction.value}(
            transaction.data
        );
        require(success, "Failed to execute");

        emit Execution(
            _nonce,
            transaction.to,
            transaction.value,
            transaction.data
        );
    }

    /**
     * @dev Confirm and execute a transaction if have enough confirmations
     *
     * Requrements:
     * - Only callable by the owner
     *
     * @param _nonce Transaction nonce
     *
     * Emits:
     * - Confirmation(uint256 nonce, address indexed owner)
     * - Execution(uint256 nonce, address indexed to, uint256 value, bytes data)
     */
    function confirmAndExecute(uint256 _nonce) external onlyOwner {
        confirm(_nonce);
        execute(_nonce);
    }

    /**
     * @dev isOnwerConfirmed the transaction
     *
     * @param _nonce Transaction nonce
     * @param _owner Address of the owner
     *
     */
    function isOwnerConfirmed(
        uint256 _nonce,
        address _owner
    ) external view returns (bool) {
        return transactions[_nonce].isConfirmed[_owner];
    }

    /**
     * @dev confirmationCount by nonce
     *
     * @param _nonce Transaction nonce
     *
     */
    function confirmationCount(uint256 _nonce) external view returns (uint256) {
        return transactions[_nonce].confirmationCount;
    }

    /**
     * @dev Check if the nonce is valid
     */
    modifier validNonce(uint256 _nonce) {
        require(_nonce <= nonce, "Invalid nonce");
        _;
    }
}
