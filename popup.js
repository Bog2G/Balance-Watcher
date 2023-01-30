// when the add coin button is clicked show the input form and hide the button
document.getElementById("add-coin-button").addEventListener("click", function() {
    populate();
    document.getElementById("add-coin-form").style.display = "block";
    document.getElementById("add-coin-button").style.display = "none";
});


async function populate() {
    console.log('populating');
    const res = await fetch('https://api.coingecko.com/api/v3/coins/list');
    const coins = await res.json();
  
    let select = document.getElementById("coin-select");
    let options = coins.map(coin => `<option value="${coin.id}">${coin.name}</option>`).join("\n");
    select.innerHTML = options;
  }


document.getElementById("add-coin-submit").addEventListener("click", function() {
    let coin = document.getElementById("coin-select").value;
    let balance = document.getElementById("coin-balance").value;
    let price = 20;

    let newRow = document.createElement("tr");
    newRow.style.cssText = "text-align: center;"
    
    let removeButton = document.createElement("button");
    removeButton.setAttribute("id", "remove");
    removeButton.setAttribute("type", "button");
    removeButton.style.cssText = "height: 13px; text-align: center; display: flex; justify-content: center; align-items: center;";
    removeButton.innerHTML = "x";

    let coinCell = document.createElement("td");
    coinCell.innerHTML = coin;

    let balanceCell = document.createElement("td");
    balanceCell.innerHTML = balance;

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

});

// take the saved info from the local storage and populate the table
function populateTable() {
    let storedRows = JSON.parse(localStorage.getItem("createdRows")) || [];
    let tableBody = document.getElementById("coin-list").getElementsByTagName("tbody")[0];
    console.log(storedRows);
    // added this check incase tableBody is undefined
    if (tableBody) {
        storedRows.forEach(row => {
            let newRow = document.createElement("tr");
            newRow.style.cssText = "text-align: center;"

            let coinCell = document.createElement("td");
            coinCell.innerHTML = row.coin;

            let balanceCell = document.createElement("td");
            balanceCell.innerHTML = row.balance;

            let priceCell = document.createElement("td");
            priceCell.innerHTML = row.price;

            let removeButton = document.createElement("button");
            removeButton.setAttribute("id", "remove");
            removeButton.setAttribute("type", "button");
            removeButton.style.cssText = "height: 13px; text-align: center; display: flex; justify-content: center; align-items: center;";
            removeButton.innerHTML = "x";

            // Add event listener to remove button
            removeButton.addEventListener("click", function() {
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
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded');
    populateTable();
});

// remove all entries from the local storage and refresh the extension to display changes
document.getElementById("destroyAll").addEventListener("click", function() {
    window.localStorage.clear();
    location.reload();
});