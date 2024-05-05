import { CerberusVault } from "../typechain-types";
import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("CerberusVault", () => {
  let cerberusVault: CerberusVault;
  let owner1: SignerWithAddress;
  let owner2: SignerWithAddress;
  let owner3: SignerWithAddress;
  let nonOwner: SignerWithAddress;
  let receiver: SignerWithAddress;
  const INITIAL_THRESHOLD = 2;

  beforeEach(async () => {
    const CerberusVault = await ethers.getContractFactory("CerberusVault");
    [owner1, owner2, owner3, nonOwner, receiver] = await ethers.getSigners();
    cerberusVault = await CerberusVault.deploy(
      [owner1.address, owner2.address, owner3.address],
      INITIAL_THRESHOLD
    );

    // First deposit to the vault
    await owner1.sendTransaction({
      to: await cerberusVault.getAddress(),
      value: ethers.parseEther("1"),
    });
  });

  it("should setup the vault correctly", async function () {
    const owners = [owner1.address, owner2.address, owner3.address];
    owners.forEach(async (owner) => {
      expect(await cerberusVault.isOwner(owner)).to.be.true;
    });
    expect(await cerberusVault.ownerCount()).to.equal(3);
    expect(await cerberusVault.threshold()).to.equal(INITIAL_THRESHOLD);
    expect(await cerberusVault.isOwner(nonOwner.address)).to.be.false;
  });

  describe("OwnerManager", () => {
    describe("addOwner", () => {
      let newOwner: SignerWithAddress;

      beforeEach(async () => {
        newOwner = (await ethers.getSigners())[5];
      });
      it("only owner", async function () {
        await expect(
          cerberusVault.connect(nonOwner).addOwner(nonOwner.address)
        ).to.be.revertedWith(
          "OwnerManager: only owner can perform this action"
        );
      });

      it("add new owner", async () => {
        await cerberusVault.connect(owner1).addOwner(newOwner.address);
        expect(await cerberusVault.isOwner(newOwner.address)).to.be.true;
        expect(await cerberusVault.ownerCount()).to.equal(4);
      });

      it("emits AddOwner event", async () => {
        await expect(cerberusVault.connect(owner1).addOwner(newOwner.address))
          .to.emit(cerberusVault, "AddOwner")
          .withArgs(newOwner.address);
      });

      it("reverts if owner already exists", async () => {
        await expect(
          cerberusVault.connect(owner1).addOwner(owner2.address)
        ).to.be.revertedWith("OwnerManager: owner already exists");
      });

      it("reverts if owner is zero address", async () => {
        await expect(
          cerberusVault.connect(owner1).addOwner(ethers.ZeroAddress)
        ).to.be.revertedWith("OwnerManager: cannot be zero address");
      });
    });

    describe("removeOwner", () => {
      it("only owner", async () => {
        await expect(
          cerberusVault.connect(nonOwner).removeOwner(owner1.address)
        ).to.be.revertedWith(
          "OwnerManager: only owner can perform this action"
        );
      });

      it("remove owner", async () => {
        await cerberusVault.connect(owner1).removeOwner(owner2.address);
        expect(await cerberusVault.isOwner(owner2.address)).to.be.false;
        expect(await cerberusVault.ownerCount()).to.equal(2);
      });

      it("emits RemoveOwner event", async () => {
        await expect(cerberusVault.connect(owner1).removeOwner(owner2.address))
          .to.emit(cerberusVault, "RemoveOwner")
          .withArgs(owner2.address);
      });

      it("reverts if owner does not exist", async () => {
        await expect(
          cerberusVault.connect(owner1).removeOwner(nonOwner.address)
        ).to.be.revertedWith("OwnerManager: owner not found");
      });

      it("reverts if owner is zero address", async () => {
        await expect(
          cerberusVault.connect(owner1).removeOwner(ethers.ZeroAddress)
        ).to.be.revertedWith("OwnerManager: cannot be zero address");
      });

      it("reverts if new ownerCount is less than two", async () => {
        await cerberusVault.connect(owner1).removeOwner(owner2.address);
        await expect(
          cerberusVault.connect(owner1).removeOwner(owner3.address)
        ).to.be.revertedWith(
          "OwnerManager: new owner count must be at least two"
        );
      });

      it("reverts if new ownerCount is less than threshold", async () => {
        await cerberusVault.connect(owner1).changeThreshold(3);
        await expect(
          cerberusVault.connect(owner1).removeOwner(owner3.address)
        ).to.be.revertedWith(
          "OwnerManager: new owner count must be greater than or equal to threshold"
        );
      });
    });

    describe("swapOwner", () => {
      it("only owner", async () => {
        await expect(
          cerberusVault
            .connect(nonOwner)
            .swapOwner(owner1.address, owner2.address)
        ).to.be.revertedWith(
          "OwnerManager: only owner can perform this action"
        );
      });

      it("swap owner", async () => {
        const newOwner = (await ethers.getSigners())[5];
        await cerberusVault
          .connect(owner1)
          .swapOwner(owner2.address, newOwner.address);
        expect(await cerberusVault.isOwner(owner2.address)).to.be.false;
        expect(await cerberusVault.isOwner(newOwner.address)).to.be.true;
      });

      it("emits AddOwner and RemoveOwner events", async () => {
        const newOwner = (await ethers.getSigners())[4];
        await expect(
          cerberusVault
            .connect(owner1)
            .swapOwner(owner2.address, newOwner.address)
        )
          .to.emit(cerberusVault, "AddOwner")
          .withArgs(newOwner.address)
          .to.emit(cerberusVault, "RemoveOwner")
          .withArgs(owner2.address);
      });

      it("reverts if old owner same as new owner", async () => {
        await expect(
          cerberusVault
            .connect(owner1)
            .swapOwner(owner2.address, owner2.address)
        ).to.be.revertedWith("OwnerManager: old and new owners are the same");
      });

      it("reverts if owner does not exist", async () => {
        await expect(
          cerberusVault
            .connect(owner1)
            .swapOwner(nonOwner.address, owner2.address)
        ).to.be.revertedWith("OwnerManager: old owner not found");
      });

      it("reverts if old owner is zero address", async () => {
        await expect(
          cerberusVault
            .connect(owner1)
            .swapOwner(ethers.ZeroAddress, owner2.address)
        ).to.be.revertedWith("OwnerManager: old owner cannot be zero address");
      });

      it("reverts if new owner is zero address", async () => {
        await expect(
          cerberusVault
            .connect(owner1)
            .swapOwner(owner2.address, ethers.ZeroAddress)
        ).to.be.revertedWith("OwnerManager: new owner cannot be zero address");
      });

      it("reverts if newOwner is already an owner", async () => {
        await expect(
          cerberusVault
            .connect(owner1)
            .swapOwner(owner1.address, owner2.address)
        ).to.be.revertedWith("OwnerManager: new owner already exists");
      });
    });

    describe("changeThreshold", () => {
      it("only owner", async () => {
        await expect(
          cerberusVault.connect(nonOwner).changeThreshold(3)
        ).to.be.revertedWith(
          "OwnerManager: only owner can perform this action"
        );
      });

      it("change threshold", async () => {
        await cerberusVault.connect(owner1).changeThreshold(3);
        expect(await cerberusVault.threshold()).to.equal(3);
      });

      it("emits ChangeThreshold event", async () => {
        await expect(cerberusVault.connect(owner1).changeThreshold(3))
          .to.emit(cerberusVault, "ChangeThreshold")
          .withArgs(3);
      });

      it("reverts if threshold is zero", async () => {
        await expect(
          cerberusVault.connect(owner1).changeThreshold(0)
        ).to.be.revertedWith("OwnerManager: threshold cannot be zero");
      });

      it("reverts if threshold is greater than ownerCount", async () => {
        await expect(
          cerberusVault.connect(owner1).changeThreshold(4)
        ).to.be.revertedWith(
          "OwnerManager: threshold must be less than or equal to ownerCount"
        );
      });

      it("reverts if threshold is less than 2", async () => {
        await expect(
          cerberusVault.connect(owner1).changeThreshold(1)
        ).to.be.revertedWith("OwnerManager: threshold must be at least two");
      });

      it("reverts if old threshold same as new threshold", async () => {
        await expect(
          cerberusVault.connect(owner1).changeThreshold(INITIAL_THRESHOLD)
        ).to.be.revertedWith("OwnerManager: threshold unchanged");
      });
    });

    describe("isOwner", () => {
      it("reverts if owner does not exist", async () => {
        expect(await cerberusVault.isOwner(nonOwner.address)).to.be.false;
      });

      it("returns true if owner exists", async () => {
        expect(await cerberusVault.isOwner(owner1.address)).to.be.true;
      });
    });
  });

  describe("receive", () => {
    it("deposit to the vault", async () => {
      const vaultStartingBalance = await ethers.provider.getBalance(
        await cerberusVault.getAddress()
      );
      await owner1.sendTransaction({
        to: await cerberusVault.getAddress(),
        value: ethers.parseEther("1"),
      });

      expect(
        await ethers.provider.getBalance(await cerberusVault.getAddress())
      ).to.equal(vaultStartingBalance + ethers.parseEther("1"));
    });

    it("emits Deposit event", async () => {
      await expect(
        owner1.sendTransaction({
          to: await cerberusVault.getAddress(),
          value: ethers.parseEther("1"),
        })
      )
        .to.emit(cerberusVault, "Deposit")
        .withArgs(owner1.address, ethers.parseEther("1"));
    });
  });

  describe("withdraw", () => {
    it("only owner", async () => {
      await expect(
        cerberusVault.connect(nonOwner).withdraw(ethers.parseEther("1"))
      ).to.be.revertedWith("OwnerManager: only owner can perform this action");
    });

    it("withdraws from the vault", async () => {
      const vaultStartingBalance = await ethers.provider.getBalance(
        await cerberusVault.getAddress()
      );
      await expect(() =>
        cerberusVault.connect(owner1).withdraw(ethers.parseEther("1"))
      ).to.changeEtherBalance(owner1, ethers.parseEther("1"));
      expect(
        await ethers.provider.getBalance(await cerberusVault.getAddress())
      ).to.equal(vaultStartingBalance - ethers.parseEther("1"));
    });
  });

  describe("submit", () => {
    it("only owner", async () => {
      await expect(
        cerberusVault
          .connect(nonOwner)
          .submit(
            receiver.address,
            ethers.parseEther("1"),
            ethers.encodeBytes32String("")
          )
      ).to.be.revertedWith("OwnerManager: only owner can perform this action");
    });

    it("submits a new transaction", async () => {
      await cerberusVault
        .connect(owner1)
        .submit(
          receiver.address,
          ethers.parseEther("1"),
          ethers.encodeBytes32String("")
        );
      const expectedResult = [
        receiver.address,
        ethers.parseEther("1"),
        ethers.encodeBytes32String(""),
        false,
        0n, // empty mapping
      ];

      expect(await cerberusVault.transactions(1)).to.deep.equal(expectedResult);
    });

    it("increments the nonce", async () => {
      expect(await cerberusVault.nonce()).to.equal(0);
      await cerberusVault
        .connect(owner1)
        .submit(
          receiver.address,
          ethers.parseEther("1"),
          ethers.encodeBytes32String("")
        );
      expect(await cerberusVault.nonce()).to.equal(1);
    });

    it("emits Submit event", async () => {
      await expect(
        cerberusVault
          .connect(owner1)
          .submit(
            receiver.address,
            ethers.parseEther("1"),
            ethers.encodeBytes32String("")
          )
      )
        .to.emit(cerberusVault, "SubmitTransaction")
        .withArgs(
          1,
          receiver.address,
          ethers.parseEther("1"),
          ethers.encodeBytes32String("")
        );
    });
  });

  describe("confirm", () => {
    beforeEach(async () => {
      await cerberusVault
        .connect(owner1)
        .submit(
          receiver.address,
          ethers.parseEther("1"),
          ethers.encodeBytes32String("")
        );
    });
    it("only owner", async () => {
      await expect(
        cerberusVault.connect(nonOwner).confirm(1)
      ).to.be.revertedWith("OwnerManager: only owner can perform this action");
    });

    it("confirms a transaction", async () => {
      await cerberusVault.connect(owner1).confirm(1);
      expect(await cerberusVault.isOwnerConfirmed(1, owner1.address)).to.be
        .true;
    });

    it("emits Confirmation event", async () => {
      await expect(cerberusVault.connect(owner1).confirm(1))
        .to.emit(cerberusVault, "Confirmation")
        .withArgs(1, owner1.address);
    });

    it("reverts if nonce is invalid", async () => {
      await expect(cerberusVault.connect(owner1).confirm(2)).to.be.revertedWith(
        "Invalid nonce"
      );
    });

    it("reverts if transaction already executed", async () => {
      await cerberusVault.connect(owner1).confirm(1);
      await cerberusVault.connect(owner2).confirmAndExecute(1);
      expect((await cerberusVault.transactions(1)).executed).to.be.true;

      await expect(cerberusVault.connect(owner1).confirm(1)).to.be.revertedWith(
        "Transaction already executed"
      );
    });

    it("reverts if transaction already confirmed", async () => {
      await cerberusVault.connect(owner1).confirm(1);
      expect(await cerberusVault.isOwnerConfirmed(1, owner1.address)).to.be
        .true;
      await expect(cerberusVault.connect(owner1).confirm(1)).to.be.revertedWith(
        "Transaction already confirmed"
      );
    });
  });

  describe("revoke", () => {
    beforeEach(async () => {
      await cerberusVault
        .connect(owner1)
        .submit(
          receiver.address,
          ethers.parseEther("1"),
          ethers.encodeBytes32String("")
        );
      await cerberusVault.connect(owner1).confirm(1);
    });

    it("only owner", async () => {
      await expect(
        cerberusVault.connect(nonOwner).revoke(1)
      ).to.be.revertedWith("OwnerManager: only owner can perform this action");
    });

    it("revokes a transaction", async () => {
      await cerberusVault.connect(owner1).revoke(1);
      expect(await cerberusVault.isOwnerConfirmed(1, owner1.address)).to.be
        .false;
    });

    it("emits Revoke event", async () => {
      await expect(cerberusVault.connect(owner1).revoke(1))
        .to.emit(cerberusVault, "Revocation")
        .withArgs(1, owner1.address);
    });

    it("reverts if nonce is invalid", async () => {
      await expect(cerberusVault.connect(owner1).revoke(2)).to.be.revertedWith(
        "Invalid nonce"
      );
    });

    it("reverts if transaction already executed", async () => {
      await cerberusVault.connect(owner2).confirmAndExecute(1);
      expect((await cerberusVault.transactions(1)).executed).to.be.true;
      await expect(cerberusVault.connect(owner1).revoke(1)).to.be.revertedWith(
        "Transaction already executed"
      );
    });

    it("reverts if transaction not confirmed", async () => {
      await expect(cerberusVault.connect(owner2).revoke(1)).to.be.revertedWith(
        "Transaction not confirmed"
      );
    });
  });

  describe("submitAndConfirm", () => {
    it("only owner", async () => {
      await expect(
        cerberusVault
          .connect(nonOwner)
          .submitAndConfirm(
            receiver.address,
            ethers.parseEther("1"),
            ethers.encodeBytes32String("")
          )
      ).to.be.revertedWith("OwnerManager: only owner can perform this action");
    });

    it("submits and confirms a new transaction", async () => {
      await cerberusVault
        .connect(owner1)
        .submitAndConfirm(
          receiver.address,
          ethers.parseEther("1"),
          ethers.encodeBytes32String("")
        );
      const expectedResult = [
        receiver.address,
        ethers.parseEther("1"),
        ethers.encodeBytes32String(""),
        false,
        1n, // mapping with one confirmation
      ];

      expect(await cerberusVault.transactions(1)).to.deep.equal(expectedResult);
      expect(await cerberusVault.isOwnerConfirmed(1, owner1.address)).to.be
        .true;
      expect(await cerberusVault.confirmationCount(1)).to.equal(1);
    });

    it("emits SubmitTransaction and Confirmation events", async () => {
      await expect(
        cerberusVault
          .connect(owner1)
          .submitAndConfirm(
            receiver.address,
            ethers.parseEther("1"),
            ethers.encodeBytes32String("")
          )
      )
        .to.emit(cerberusVault, "SubmitTransaction")
        .withArgs(
          1,
          receiver.address,
          ethers.parseEther("1"),
          ethers.encodeBytes32String("")
        )
        .to.emit(cerberusVault, "Confirmation")
        .withArgs(1, owner1.address);
    });
  });

  describe("execute", () => {
    beforeEach(async () => {
      await cerberusVault
        .connect(owner1)
        .submitAndConfirm(
          receiver.address,
          ethers.parseEther("1"),
          ethers.encodeBytes32String("")
        );
      await cerberusVault.connect(owner2).confirm(1);
    });

    it("only owner", async () => {
      await expect(
        cerberusVault.connect(nonOwner).execute(1)
      ).to.be.revertedWith("OwnerManager: only owner can perform this action");
    });

    it("executes a transaction", async () => {
      const startingReceiverBalance = await ethers.provider.getBalance(
        receiver
      );
      await cerberusVault.connect(owner1).execute(1);
      expect((await cerberusVault.transactions(1)).executed).to.be.true;
      expect(await ethers.provider.getBalance(receiver)).to.equal(
        startingReceiverBalance + ethers.parseEther("1")
      );
    });

    it("emits Execution event", async () => {
      await expect(cerberusVault.connect(owner1).execute(1))
        .to.emit(cerberusVault, "Execution")
        .withArgs(
          1,
          receiver.address,
          ethers.parseEther("1"),
          ethers.encodeBytes32String("")
        );
    });

    it("reverts if transaction already executed", async () => {
      await cerberusVault.connect(owner1).execute(1);
      await expect(cerberusVault.connect(owner1).execute(1)).to.be.revertedWith(
        "Transaction already executed"
      );
    });

    it("reverts if transaction doesn't have enough confirmations", async () => {
      await cerberusVault.changeThreshold(3);
      await expect(cerberusVault.connect(owner1).execute(1)).to.be.revertedWith(
        "Not enough confirmations"
      );
    });
  });

  describe("confirmAndExecute", () => {
    beforeEach(async () => {
      await cerberusVault
        .connect(owner1)
        .submitAndConfirm(
          receiver.address,
          ethers.parseEther("1"),
          ethers.encodeBytes32String("")
        );
    });

    it("only owner", async () => {
      await expect(
        cerberusVault.connect(nonOwner).confirmAndExecute(1)
      ).to.be.revertedWith("OwnerManager: only owner can perform this action");
    });

    it("confirms and executes a transaction", async () => {
      const startingReceiverBalance = await ethers.provider.getBalance(
        receiver
      );
      await cerberusVault.connect(owner2).confirmAndExecute(1);
      expect((await cerberusVault.transactions(1)).executed).to.be.true;
      expect(await ethers.provider.getBalance(receiver)).to.equal(
        startingReceiverBalance + ethers.parseEther("1")
      );
    });

    it("emits Confirmation and Execution events", async () => {
      await expect(cerberusVault.connect(owner2).confirmAndExecute(1))
        .to.emit(cerberusVault, "Confirmation")
        .withArgs(1, owner2.address)
        .to.emit(cerberusVault, "Execution")
        .withArgs(
          1,
          receiver.address,
          ethers.parseEther("1"),
          ethers.encodeBytes32String("")
        );
    });
  });
});
