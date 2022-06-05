const btns = document.querySelectorAll(".btn");
const connectBtn = document.querySelector(".connect-btn");
const pauseBtn = document.querySelector(".pause-btn");
const voteBtn = document.querySelector(".vote-btn");
const statusText = document.querySelector(".status");
const candidates = document.querySelectorAll(".candidate");
const Web3 = require("web3");
const contractArtifact = require("./build/contracts/Poll.json");
const contract = require("@truffle/contract");
const abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "candidates",
    outputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "voteCount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    name: "namedCandidate",
    outputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "voteCount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "voted",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getCandidates",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "voteCount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "id",
            type: "uint256",
          },
        ],
        internalType: "struct Poll.Candidate[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "setPaused",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "removePaused",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_name",
        type: "string",
      },
    ],
    name: "vote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getWinner",
    outputs: [
      {
        internalType: "string",
        name: "_winningCandidate",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_name",
        type: "string",
      },
    ],
    name: "getVoteCount",
    outputs: [
      {
        internalType: "uint256",
        name: "_voteCount",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
let web3;
let account;
let contractInstance;
let pauseFlag;
const initialize = async () => {
  if (typeof window.ethereum !== "undefined") {
    web3 = new Web3(ethereum);
    const accounts = await ethereum.request({ method: "eth_accounts" });
    account = accounts[0];
    const pollContract = contract(contractArtifact);
    pollContract.setProvider(window.ethereum);
    contractInstance = await pollContract.deployed();
    if (accounts.length !== 0) {
      connectBtn.textContent = "connected";
    }
  }
};

const fetchVotes = async () => {
  const candidateData = await contractInstance.getCandidates();
  const totalVotes = candidateData.reduce((acc, curr) => {
    acc += parseInt(curr.voteCount);
    return acc;
  }, 0);

  const domCandidates = [...candidates];

  domCandidates.forEach((candidate) => {
    const voted = candidateData.filter(
      (item) => item.name === candidate.firstElementChild.textContent
    );

    if (voted.length === 0) {
      candidate.lastElementChild.textContent = "0%";
      candidate.style.setProperty("--width", `0%`);
    } else {
      const ratio = ((parseInt(voted[0].voteCount) / totalVotes) * 100).toFixed(
        2
      );
      candidate.style.setProperty("--width", `${ratio}%`);

      candidate.lastElementChild.textContent = `${ratio}%`;
    }
  });
};
window.addEventListener("DOMContentLoaded", async () => {
  await initialize();
  await fetchVotes();
});
const defaultStatus = () => {
  setTimeout(() => {
    if (pauseFlag) {
      statusText.style.color = "#bca136";
      statusText.textContent = "the poll is paused";
    } else {
      statusText.style.color = "#bca136";
      statusText.textContent = "";
    }
  }, 1000);
};
ethereum.on("accountsChanged", (accounts) => {
  if (accounts.length <= 0) {
    connectBtn.textContent = "connect your wallet";
  } else {
    account = accounts[0];
  }
});
voteBtn.addEventListener("click", async () => {
  const selected = document.querySelector(".selected").firstElementChild;
  const voteData = selected.textContent;
  try {
    statusText.textContent = "Processing...";

    await contractInstance.vote(voteData, { from: account });
    statusText.style.color = "green";
    statusText.textContent = "Successful";
    defaultStatus();
  } catch (err) {
    statusText.style.color = "red";
    statusText.textContent = "Failed";
    defaultStatus();
  }
  fetchVotes();
});

const connectWallet = async () => {
  if (typeof window.ethereum !== "undefined") {
    try {
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      account = accounts[0];

      connectBtn.textContent = "connected";
    } catch (err) {
      console.log(err.message);
    }
  } else {
    statusText.textContent = "Please Install MetaMask";
    defaultStatus();
  }
};

connectBtn.addEventListener("click", connectWallet);

pauseBtn.addEventListener("click", async () => {
  if (statusText.textContent === "the poll is paused") {
    await contractInstance.removePaused({ from: account });
    statusText.textContent = "";
    pauseFlag = false;
  } else {
    await contractInstance.setPaused({ from: account });
    pauseFlag = true;
    statusText.textContent = "the poll is paused";
  }
});

btns.forEach((btn) => {
  btn.addEventListener("mousedown", () => {
    btn.classList.add("mousedown");
  });
  btn.addEventListener("mouseup", () => {
    btn.classList.remove("mousedown");
  });
});

candidates.forEach((candidate) => {
  candidate.addEventListener("click", (e) => {
    e.stopPropagation();
    candidates.forEach((candidate) => {
      if (candidate !== e.currentTarget) {
        candidate.classList.remove("selected");
      }
    });
    candidate.classList.toggle("selected");
  });
});

window.addEventListener("click", () => {
  candidates.forEach((candidate) => {
    candidate.classList.remove("selected");
  });
});
