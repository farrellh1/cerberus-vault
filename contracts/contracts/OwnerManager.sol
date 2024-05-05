// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @dev Abstract contract for managing a multi-signature wallet.
 */
abstract contract OwnerManager {
    mapping(address => bool) public owners;
    uint256 public threshold;
    uint256 public ownerCount;
    bool private isSetup;

    event AddOwner(address indexed owner);
    event RemoveOwner(address indexed owner);
    event ChangeThreshold(uint256 threshold);

    /**
     * @dev Sets up the owners of the multi-signature wallet.
     *
     * Requirements:
     * - Can only be called once in the constructor.
     * - each address cannot be zero address.
     * - threshold cannot be zero.
     * - _owners cannot be empty.
     * - threshold cannot be greater than the number of owners
     *
     * @param _owners The owners of the multi-signature wallet.
     * @param _threshold The threshold of the multi-signature wallet.
     *
     */
    function setupOwners(
        address[] memory _owners,
        uint256 _threshold
    ) internal {
        require(!isSetup, "OwnerManager: already setup");
        require(_owners.length > 0, "OwnerManager: no owners");
        require(
            _owners.length > 1,
            "OwnerManager: must have at least two owners"
        );
        require(
            _owners.length > _threshold,
            "OwnerManager: owner must be at least threshold"
        );
        require(_threshold > 0, "OwnerManager: threshold cannot be zero");

        for (uint256 i; i < _owners.length; i++) {
            require(
                _owners[i] != address(0),
                "OwnerManager: cannot be zero address"
            );
            require(!isOwner(_owners[i]), "OwnerManager: owner already exists");

            owners[_owners[i]] = true;
        }

        ownerCount = _owners.length;
        threshold = _threshold;
        isSetup = true;
    }

    /**
     * @dev Adds an owner to the multi-signature wallet.
     *
     * Requirements:
     * - _owner cannot be zero address
     * - _owner cannot already be an owner of the multi-signature wallet
     * - only the owner of the multi-signature wallet can add a new owner
     *
     * @param _owner The owner to add.
     *
     * Emits:
     * - AddOwner(address indexed owner)
     */
    function addOwner(address _owner) external onlyOwner {
        require(_owner != address(0), "OwnerManager: cannot be zero address");
        require(!isOwner(_owner), "OwnerManager: owner already exists");

        owners[_owner] = true;
        ownerCount++;
        emit AddOwner(_owner);
    }

    /**
     * @dev Removes an owner from the multi-signature wallet.
     *
     * Requirements:
     * - _owner cannot be zero address
     * - _owner must be an owner of the multi-signature wallet
     * - new ownerCount must be greater than or equal to threshold
     * - only the owner of the multi-signature wallet can remove an owner
     *
     * @param _owner The owner to remove.
     *
     * Emits:
     * - RemoveOwner(address indexed owner)
     */
    function removeOwner(address _owner) external onlyOwner {
        require(_owner != address(0), "OwnerManager: cannot be zero address");
        require(isOwner(_owner), "OwnerManager: owner not found");
        require(
            ownerCount - 1 > 1,
            "OwnerManager: new owner count must be at least two"
        );
        require(
            ownerCount - 1 >= threshold,
            "OwnerManager: new owner count must be greater than or equal to threshold"
        );

        owners[_owner] = false;
        ownerCount--;
        emit RemoveOwner(_owner);
    }

    /**
     * @dev Swaps an owner from the multi-signature wallet.
     *
     * Requirements:
     * - _oldOwner cannot be zero address
     * - _newOwner cannot be zero address
     * - _oldOwner must be an owner of the multi-signature wallet
     * - _newOwner must not be an owner of the multi-signature wallet
     * - only the owner of the multi-signature wallet can remove an owner
     *
     * @param _oldOwner The owner to swap.
     * @param _newOwner The owner to swap to.
     *
     * Emits:
     * - AddOwner(address indexed owner)
     * - RemoveOwner((address indexed owner)
     */
    function swapOwner(
        address _oldOwner,
        address _newOwner
    ) external onlyOwner {
        require(
            _oldOwner != _newOwner,
            "OwnerManager: old and new owners are the same"
        );
        require(
            _oldOwner != address(0),
            "OwnerManager: old owner cannot be zero address"
        );
        require(
            _newOwner != address(0),
            "OwnerManager: new owner cannot be zero address"
        );
        require(isOwner(_oldOwner), "OwnerManager: old owner not found");
        require(!isOwner(_newOwner), "OwnerManager: new owner already exists");

        owners[_newOwner] = true;
        owners[_oldOwner] = false;

        emit AddOwner(_newOwner);
        emit RemoveOwner(_oldOwner);
    }

    /**
     * @dev Changes the threshold of the multi-signature wallet.
     *
     * Requirements:
     * - _threshold cannot be zero
     * - new threshold must be less than or equal to ownerCount
     * - new threshold must be different from the current threshold
     * - only the owner of the multi-signature wallet can remove an owner
     *
     * @param _threshold The new threshold.
     *
     * Emits:
     * - ChangeThreshold(uint256 threshold)
     */
    function changeThreshold(uint256 _threshold) external onlyOwner {
        require(_threshold > 0, "OwnerManager: threshold cannot be zero");
        require(
            ownerCount >= _threshold,
            "OwnerManager: threshold must be less than or equal to ownerCount"
        );
        require(threshold != _threshold, "OwnerManager: threshold unchanged");
        require(_threshold > 1, "OwnerManager: threshold must be at least two");

        threshold = _threshold;
        emit ChangeThreshold(_threshold);
    }

    /**
     * @dev Checks if an _owner is an owner of the multi-signature wallet.
     */
    function isOwner(address _owner) public view returns (bool) {
        return owners[_owner];
    }

    /**
     * @dev Checks if the caller is an owner of the multi-signature wallet.
     */
    modifier onlyOwner() {
        require(
            isOwner(msg.sender),
            "OwnerManager: only owner can perform this action"
        );
        _;
    }
}
