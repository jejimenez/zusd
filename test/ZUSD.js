const { expect } = require('chai');
const { ethers } = require('hardhat');

describe("ZUSD Contract", () => {
  const setup = async () => {
    const [owner, addr1, addr2, addr3, addr4, addr5] = await ethers.getSigners();
    const ZUSD = await ethers.getContractFactory("ZUSD")
    const USDC = await ethers.getContractFactory("TestnetERC20Token")
    
    usdDeployed = await USDC.deploy("USDC","USDC Token"); //deploying dai contract first
    

    const deployed = await ZUSD.deploy(usdDeployed.address);

    // getting timestamp
    const blockNumBefore = await ethers.provider.getBlockNumber();
    const blockBefore = await ethers.provider.getBlock(blockNumBefore);
    const timestampBefore = blockBefore.timestamp;

    return {
      owner: owner,
      addr1: addr1,
      addr2: addr2,
      addr3: addr3,
      addr4: addr4,
      addr5: addr5,
      deployed,
      usdDeployed,
      timestampBefore
    }
  }

  it("Address Contract", async () => {
    const { deployed } = await setup();
    console.log('contract address:', deployed.address);
  });

  it("Should stake the USDC Reserve", async () => {
    const { owner, deployed, usdDeployed } = await setup();
    const amount = 2000;
    await usdDeployed.mint(owner.address, amount);
    const bal = await usdDeployed.balanceOf(owner.address);
    expect(bal).to.be.eq(amount);
  });



  it("Should Mint a ZUSD", async () => {
    const { owner, deployed, timestampBefore } = await setup();
    const initBalance = await ethers.provider.getBalance(owner.address);
    const amount = 100;
    await deployed.mint(amount);
    const bal = await deployed.balanceOf(owner.address);
    expect(bal).to.be.eq(amount);
  });


  it("Should transfer USDC back when running batch", async() => {
    const { owner, deployed, addr1,addr2,addr3,addr4,addr5, usdDeployed } = await setup();

    const USDCamount = 2000;
    let amount1 = 100;
    let amount2 = 200;
    let amount3 = 300;
    let bal1, bal2, bal3, bal4;
    
    await usdDeployed.mint(owner.address, USDCamount);
    await usdDeployed.approve(deployed.address, USDCamount);
    //await usdDeployed.transfer()

    await deployed.stakeTokens(USDCamount);

    //const initBalance = await ethers.provider.getBalance(owner.address);
    await deployed.connect(addr1).mint(amount1);
    await deployed.connect(addr2).mint(amount2);
    await deployed.connect(addr3).mint(amount3);
    
    let bl1 = await deployed.blocked(0);
    let bl2 = await deployed.blocked(1);
    let bl3 = await deployed.blocked(2);

    bal1 = await usdDeployed.balanceOf(addr1.address);
    bal2 = await usdDeployed.balanceOf(addr2.address);
    bal3 = await usdDeployed.balanceOf(addr3.address);

    // Init balance should be 0 
    expect(bal1).to.be.eq(0);
    expect(bal2).to.be.eq(0);
    expect(bal3).to.be.eq(0);

    // Wait 10 seconds 
    await new Promise(r => setTimeout(r, 5000));
    await deployed.unblockStableBatch();

    bal1 = await usdDeployed.balanceOf(addr1.address);
    bal2 = await usdDeployed.balanceOf(addr2.address);
    bal3 = await usdDeployed.balanceOf(addr3.address);

    // Balance should be equal to the amount deposited
    expect(bal1).to.be.eq(amount1);
    expect(bal2).to.be.eq(amount2);
    expect(bal3).to.be.eq(amount3);

    bl1 = await deployed.blocked(0);
    bl2 = await deployed.blocked(1);
    bl3 = await deployed.blocked(2);

    
  })



  it.only("Should transfer USDC when running batch and take out the previous transactions", async() => {
    const { owner, deployed, addr1,addr2,addr3,addr4,addr5, usdDeployed } = await setup();

    const USDCamount = 2000;
    let amount1 = 100;
    let amount2 = 200;
    let amount3 = 300;
    let amount4 = 400;
    let bal1, bal2, bal3, bal4;
    
    await usdDeployed.mint(owner.address, USDCamount);
    await usdDeployed.approve(deployed.address, USDCamount);
    //await usdDeployed.transfer()

    await deployed.stakeTokens(USDCamount);

    //const initBalance = await ethers.provider.getBalance(owner.address);
    await deployed.connect(addr1).mint(amount1);
    await deployed.connect(addr2).mint(amount2);
    await deployed.connect(addr3).mint(amount3);
    
    let bl1 = await deployed.blocked(0);
    let bl2 = await deployed.blocked(1);
    let bl3 = await deployed.blocked(2);
    let bl4 = await deployed.blocked(3);

    bal1 = await usdDeployed.balanceOf(addr1.address);
    bal2 = await usdDeployed.balanceOf(addr2.address);
    bal3 = await usdDeployed.balanceOf(addr3.address);
    bal4 = await usdDeployed.balanceOf(addr4.address);

    // Init balance should be 0 
    expect(bal1).to.be.eq(0);
    expect(bal2).to.be.eq(0);
    expect(bal3).to.be.eq(0);
    expect(bal4).to.be.eq(0);

    // Wait 10 seconds 
    await new Promise(r => setTimeout(r, 5000));
    await deployed.connect(addr4).mint(amount4); // Mint right before the unblock function 
    // addr4 Should not be picked up by the unblock function 
    await deployed.unblockStableBatch(); // Unlock and transfer the USDC
    
    bal1 = await usdDeployed.balanceOf(addr1.address);
    bal2 = await usdDeployed.balanceOf(addr2.address);
    bal3 = await usdDeployed.balanceOf(addr3.address);
    bal4 = await usdDeployed.balanceOf(addr4.address);

    expect(bal1).to.be.eq(amount1);
    expect(bal2).to.be.eq(amount2);
    expect(bal3).to.be.eq(amount3);
    expect(bal4).to.be.eq(0);

    bl1 = await deployed.blocked(0);
    bl2 = await deployed.blocked(1);
    bl3 = await deployed.blocked(2);

    await new Promise(r => setTimeout(r, 5000));
    await deployed.unblockStableBatch();

    bal4 = await usdDeployed.balanceOf(addr4.address);
    expect(bal4).to.be.eq(amount4);


    
  })

  

});