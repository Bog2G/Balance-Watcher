// when the add coin button is clicked show the input form and hide the button
document.getElementById("add-coin-button").addEventListener("click", function () {
    populate();
    document.getElementById("add-coin-form").style.display = "block";
    document.getElementById("add-coin-button").style.display = "none";
});

// populate the select field with the crypto offered by the API
async function populate() {
    console.log('populating');
    const res = await fetch('https://api.coingecko.com/api/v3/coins/list');
    const coins = await res.json();

    let select = document.getElementById("coin-select");
    let options = coins.map(coin => `<option value="${coin.id}">${coin.name}</option>`).join("\n");
    select.innerHTML = options;
}


// get the coin price of the specified coin passed to the API
async function coinPrice(coin) {
    const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd`)
    const price = await res.json();
    const coinPrice = price[coin].usd;
    console.log(coinPrice);


    return coinPrice;
}

const coinPricey = setInterval(async function (coin) {
    coinPrice(coin);
    location.reload();
}, 1000 * 10)


document.getElementById("add-coin-submit").addEventListener("click", async function () {


    let coin = document.getElementById("coin-select").value;
    let balance = document.getElementById("coin-balance").value;
    let price = parseFloat((await coinPrice(coin) * balance).toFixed(5)) + "$";

    let newRow = document.createElement("tr");
    newRow.style.cssText = "text-align: center; border: 1px solid black;";

    let removeButton = document.createElement("button");
    removeButton.setAttribute("id", "remove");
    removeButton.setAttribute("type", "button");
    removeButton.style.cssText = "height: 13px; text-align: center; display: flex; justify-content: center; align-items: center; cursor: pointer; background-color: red; border: 0; border-radius: 5px; margin-top: 1.5px;";
    removeButton.innerHTML = "x";

    let coinCell = document.createElement("td");
    coinCell.innerHTML = coin;

    let balanceCell = document.createElement("td");
    balanceCell.innerHTML = balance;
    balanceCell.setAttribute("contentEditable", true);

    let priceCell = document.createElement("td");
    priceCell.innerHTML = price;


    newRow.appendChild(coinCell);
    newRow.appendChild(balanceCell);
    newRow.appendChild(priceCell);
    newRow.appendChild(removeButton);
    document.getElementById("coin-list").getElementsByTagName("tbody")[0].appendChild(newRow);


    // add each created row to local storage
    let createdRows = JSON.parse(localStorage.getItem("createdRows")) || [];
    createdRows.push({ coin, balance, price, removeButton });
    localStorage.setItem("createdRows", JSON.stringify(createdRows));



    // Clear the selected coin, entered balance and the price
    document.getElementById("coin-select").selectedIndex = 0;
    document.getElementById("coin-balance").value = "";



    // Hide the add-coin-form and show the add-coin-button
    document.getElementById("add-coin-form").style.display = "none";
    document.getElementById("add-coin-button").style.display = "block";
    location.reload();

});

// take the saved info from the local storage and populate the table
async function populateTable() {
    let storedRows = JSON.parse(localStorage.getItem("createdRows")) || [];
    let tableBody = document.getElementById("coin-list").getElementsByTagName("tbody")[0];
    console.log(storedRows);
    // added this check incase tableBody is undefined
    if (tableBody) {
        storedRows.forEach(async row => {
            let newRow = document.createElement("tr");
            newRow.style.cssText = "text-align: center; outline: thin solid black; border-radius: 5px;margin-bottom: 3px;";

            let coinCell = document.createElement("td");
            coinCell.innerHTML = row.coin;

            let balanceCell = document.createElement("td");
            balanceCell.innerHTML = row.balance;
            balanceCell.setAttribute("contentEditable", true);
            // when the balance is updated it saves the changes to local storage
            balanceCell.addEventListener("blur", async function () {
                row.balance = this.innerHTML;
                row.price = parseFloat((await coinPrice(row.coin) * row.balance).toFixed(5)) + "$";
                window.localStorage.setItem("createdRows", JSON.stringify(storedRows));
                location.reload();
            });

            let priceCell = document.createElement("td");
            priceCell.innerHTML = row.price;

            let removeButton = document.createElement("button");
            removeButton.setAttribute("id", "remove");
            removeButton.setAttribute("type", "button");
            removeButton.style.cssText = "height: 13px; text-align: center; display: flex; justify-content: center; align-items: center; cursor: pointer; background-color: red; border: 0; border-radius: 5px; margin-top: 1.5px;";
            removeButton.innerHTML = "x";

            // Add event listener to remove button
            removeButton.addEventListener("click", function () {
                let index = storedRows.indexOf(row);
                storedRows.splice(index, 1);
                window.localStorage.setItem("createdRows", JSON.stringify(storedRows));
                location.reload();
            });

            newRow.appendChild(coinCell);
            newRow.appendChild(balanceCell);
            newRow.appendChild(priceCell);
            newRow.appendChild(removeButton);
            tableBody.appendChild(newRow);
        });
    }

}


// when the extension is loaded populate the table with the stored rows
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOMContentLoaded');
    populateTable();
});



// remove all entries from the local storage and refresh the extension to display changes
document.getElementById("destroyAll").addEventListener("click", function () {
    window.localStorage.clear();
    location.reload();
});

