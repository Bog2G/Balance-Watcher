const COINGECKO_COINS_URL = "https://api.coingecko.com/api/v3/coins/list";
const COINGECKO_PRICE_URL =
  "https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=";
const STORAGE_KEY = "createdRows";

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const elements = {
  addCoinButton: document.getElementById("add-coin-button"),
  addCoinForm: document.getElementById("add-coin-form"),
  addCoinSubmit: document.getElementById("add-coin-submit"),
  coinSelect: document.getElementById("coin-select"),
  coinBalance: document.getElementById("coin-balance"),
  destroyAll: document.getElementById("destroyAll"),
  statusMessage: document.getElementById("status-message"),
  emptyState: document.getElementById("empty-state"),
  tableBody: document
    .getElementById("coin-list")
    .getElementsByTagName("tbody")[0],
};

const hasChromeStorage =
  typeof chrome !== "undefined" && chrome.storage && chrome.storage.local;

function showMessage(message) {
  elements.statusMessage.textContent = message;
  elements.statusMessage.classList.remove("hidden");
}

function clearMessage() {
  elements.statusMessage.textContent = "";
  elements.statusMessage.classList.add("hidden");
}

function showForm() {
  elements.addCoinForm.classList.remove("hidden");
  elements.addCoinButton.classList.add("hidden");
}

function hideForm() {
  elements.addCoinForm.classList.add("hidden");
  elements.addCoinButton.classList.remove("hidden");
}

function formatUsdValue(value) {
  return usdFormatter.format(value);
}

function readPortfolio() {
  return new Promise((resolve) => {
    if (hasChromeStorage) {
      chrome.storage.local.get([STORAGE_KEY], (result) => {
        resolve(Array.isArray(result[STORAGE_KEY]) ? result[STORAGE_KEY] : []);
      });
      return;
    }

    const fallbackRows = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    resolve(Array.isArray(fallbackRows) ? fallbackRows : []);
  });
}

function writePortfolio(rows) {
  return new Promise((resolve) => {
    if (hasChromeStorage) {
      chrome.storage.local.set({ [STORAGE_KEY]: rows }, resolve);
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
    resolve();
  });
}

async function fetchCoins() {
  const res = await fetch(COINGECKO_COINS_URL);
  if (!res.ok) {
    throw new Error("Unable to fetch coin list");
  }

  const coins = await res.json();
  return coins
    .filter((coin) => coin && coin.id && coin.name)
    .sort((a, b) => a.name.localeCompare(b.name));
}

async function fetchCoinPrice(coinId) {
  const res = await fetch(`${COINGECKO_PRICE_URL}${encodeURIComponent(coinId)}`);

  if (!res.ok) {
    throw new Error(`Unable to fetch price for ${coinId}`);
  }

  const payload = await res.json();
  const usd = payload?.[coinId]?.usd;

  if (typeof usd !== "number") {
    throw new Error(`Invalid price data for ${coinId}`);
  }

  return usd;
}

function createRemoveButton(onClick) {
  const button = document.createElement("button");
  button.setAttribute("type", "button");
  button.className = "remove-button";
  button.textContent = "×";
  button.setAttribute("aria-label", "Remove coin");
  button.addEventListener("click", onClick);
  return button;
}

function setEmptyStateVisible(isVisible) {
  elements.emptyState.classList.toggle("hidden", !isVisible);
}

function safeStoredPrice(row) {
  if (typeof row.price === "string" && row.price.length > 0) {
    return row.price;
  }

  return "--";
}

async function renderTable() {
  const portfolio = await readPortfolio();
  elements.tableBody.innerHTML = "";
  setEmptyStateVisible(portfolio.length === 0);

  for (const row of portfolio) {
    const tr = document.createElement("tr");

    const coinCell = document.createElement("td");
    coinCell.textContent = row.coin;

    const balanceCell = document.createElement("td");
    balanceCell.textContent = row.balance;
    balanceCell.className = "balance-cell";
    balanceCell.setAttribute("contentEditable", true);

    const priceCell = document.createElement("td");
    try {
      const liveCoinPrice = await fetchCoinPrice(row.coin);
      const totalValue = liveCoinPrice * Number(row.balance);
      row.price = formatUsdValue(totalValue);
      priceCell.textContent = row.price;
    } catch (error) {
      priceCell.textContent = safeStoredPrice(row);
      showMessage("Some prices could not be refreshed. Showing last known values.");
    }

    balanceCell.addEventListener("blur", async () => {
      const nextBalance = Number(balanceCell.textContent);
      if (!Number.isFinite(nextBalance) || nextBalance < 0) {
        balanceCell.textContent = row.balance;
        showMessage("Balance must be a positive number.");
        return;
      }

      row.balance = nextBalance;

      try {
        const latestPrice = await fetchCoinPrice(row.coin);
        row.price = formatUsdValue(latestPrice * nextBalance);
      } catch (error) {
        showMessage("Price refresh failed. Balance was saved anyway.");
      }

      await writePortfolio(portfolio);
      await renderTable();
    });

    const removeButton = createRemoveButton(async () => {
      const nextRows = portfolio.filter((portfolioRow) => portfolioRow.id !== row.id);
      await writePortfolio(nextRows);
      if (nextRows.length === 0) {
        clearMessage();
      }
      await renderTable();
    });

    tr.appendChild(coinCell);
    tr.appendChild(balanceCell);
    tr.appendChild(priceCell);

    const removeCell = document.createElement("td");
    removeCell.appendChild(removeButton);
    tr.appendChild(removeCell);

    elements.tableBody.appendChild(tr);
  }

  await writePortfolio(portfolio);
}

function populateSelectWithFallback() {
  elements.coinSelect.innerHTML =
    '<option value="bitcoin">Bitcoin</option><option value="ethereum">Ethereum</option><option value="solana">Solana</option>';
}

async function populateSelect() {
  try {
    const coins = await fetchCoins();
    elements.coinSelect.innerHTML = coins
      .map((coin) => `<option value="${coin.id}">${coin.name}</option>`)
      .join("\n");
  } catch (error) {
    populateSelectWithFallback();
    showMessage("Live coin list is unavailable. Using a quick starter list.");
  }
}

async function addCoin() {
  const coin = elements.coinSelect.value;
  const balance = Number(elements.coinBalance.value);

  if (!coin || !Number.isFinite(balance) || balance < 0) {
    showMessage("Choose a coin and enter a valid balance.");
    return;
  }

  const portfolio = await readPortfolio();
  const entry = {
    id: `${coin}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    coin,
    balance,
    price: "--",
  };

  try {
    const price = await fetchCoinPrice(coin);
    entry.price = formatUsdValue(price * balance);
    clearMessage();
  } catch (error) {
    showMessage("Coin added, but live price is currently unavailable.");
  }

  portfolio.push(entry);

  await writePortfolio(portfolio);
  elements.coinBalance.value = "";
  elements.coinSelect.selectedIndex = 0;
  hideForm();
  await renderTable();
}

async function clearPortfolio() {
  await writePortfolio([]);
  clearMessage();
  await renderTable();
}

async function init() {
  elements.addCoinButton.addEventListener("click", showForm);
  elements.addCoinSubmit.addEventListener("click", addCoin);
  elements.destroyAll.addEventListener("click", clearPortfolio);

  await populateSelect();
  await renderTable();

  if (!hasChromeStorage) {
    showMessage("Running outside extension mode: using local storage fallback.");
  }
}

document.addEventListener("DOMContentLoaded", init);
