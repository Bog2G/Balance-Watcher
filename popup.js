// when the add coin button is clicked show the input form and hide the button
document.getElementById("add-coin-button").addEventListener("click", function() {
    document.getElementById("add-coin-form").style.display = "block";
    document.getElementById("add-coin-button").style.display = "none";
});

// populate the select field
const coins = ["Coin1", "Coin2", "Coin3", "Coin4", "Coin5"]
let select = document.getElementById("coin-select")
let options = coins.map(coin => `<option value="${coin}">${coin}</option>`).join("\n")
select.innerHTML = options

document.getElementById("add-coin-submit").addEventListener("click", function() {
    let coin = document.getElementById("coin-select").value;
    let balance = document.getElementById("coin-balance").value;
    let price = 20;
    let newRow = document.createElement("tr");
    let coinCell = document.createElement("td");
    coinCell.innerHTML = coin;
    let balanceCell = document.createElement("td");
    balanceCell.innerHTML = balance;
    let priceCell = document.createElement("td");
    priceCell.innerHTML = price;
    newRow.appendChild(coinCell);
    newRow.appendChild(balanceCell);
    newRow.appendChild(priceCell);
    document.getElementById("coin-list").getElementsByTagName("tbody")[0].appendChild(newRow);
    // Clear the selected coin, entered balance and the price
    document.getElementById("coin-select").selectedIndex = 0;
    document.getElementById("coin-balance").value = "";
    // Hide the add-coin-form and show the add-coin-button
    document.getElementById("add-coin-form").style.display = "none";
    document.getElementById("add-coin-button").style.display = "block";

});

