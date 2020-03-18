// const refresh = setInterval
//Optimistic vs Pesmidic 

document.addEventListener("DOMContentLoaded", function () {
    fetchQutoes();
});

const fetchQutoes = function () {
    fetch("http://localhost:3000/quotes?_embed=likes")
        .then(function (response) {
            return response.json();
        })
        .then(function (datas) {
            displayQuotes(datas);
        });
};

document.addEventListener("click", function (event) {
    event.preventDefault();

    if (event.target.className === "btn btn-primary") {
        createNewQuotes(Array.from(event.target.parentNode));
    } else if (event.target.className === "btn-success") {
        fetchLikes(event.target);
    } else if (event.target.className === "btn-danger") {
        deleteQuote(event.target);
    } else if (event.target.className === "btn-warning") {
        editQuotes(event.target);
    } else if (event.target.className === "btn btn-primary btn-sm") {
        updateQuotes(event.target);
    } else if (event.target.className === "btn btn-secondary") {
        sortList(event.target);
    }
});

function displayQuotes(quotes) {
    const ul = document.getElementById("quote-list");

    quotes.forEach(function (singleQuote) {
        ul.innerHTML += `
        <li class='quote-card'>
        <blockquote class="blockquote">
        <p class="mb-0">${singleQuote.quote}</p>
        <footer class="blockquote-footer">${singleQuote.author}</footer><br>
         <button class='btn-success' data-id=${singleQuote.id}>Likes: <span>${singleQuote.likes.length > 0 ? singleQuote.likes[0].count : 0}</span></button>
        <button class='btn-danger' data-id=${singleQuote.id}>Delete</button>
        <button class='btn-warning' data-id=${singleQuote.id}>Edit</button>
        </blockquote>
        </li>
        `;
    });
};

function createNewQuotes(inputs) {
    const newQuote = {};

    if (validateForm(inputs)) {
        inputs.forEach(function (input) {
            newQuote[input.name] = input.value;
        });


        fetch("http://localhost:3000/quotes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json"
            },
            body: JSON.stringify(newQuote)
        })
            .then(function (message) {
                message = "Created new quotes!";
                fetchQutoes();
                return console.log(message);
            });
    } else {
        return alert("Space must be filled out");
    }
}

function validateForm(validates) {
    let result;

    validates.pop();

    validates.forEach(function (validate) {
        validate.value === "" ? result = false : result = true;
    });

    return result;
}

function fetchLikes(datas) {
    fetch(`http://localhost:3000/likes?quoteId=${datas.dataset.id}`)
        .then(function (response) {
            return response.json();
        })
        .then(function (value) {
            if (value.length === 0) {
                createLikes(datas);
            } else if (value.length > 0) {
                updateLikes(datas);
            }
        });
}

function createLikes(datas) {
    let newLike = {};
    let count = parseInt(datas.childNodes[1].innerText);
    count++;

    newLike["quoteId"] = parseInt(datas.dataset.id);
    newLike["createdAt"] = Date.now();
    newLike["count"] = count;
    newLike["id"] = newLike["quoteId"];

    fetch("http://localhost:3000/likes", {
        method: "POST",
        headers: {
            "content-type": "application/json",
            "accept": "application/json"
        },
        body: JSON.stringify(newLike)
    })
        .then(function () {
            console.log("Likes has added!");
        })
        .then(function () {
            datas.childNodes[1].innerText = count;
            console.log("Like added!");
        });
}

function updateLikes(datas) {
    let count = parseInt(datas.childNodes[1].innerText);
    count++;

    fetch(`http://localhost:3000/likes/${datas.dataset.id}`, {
        method: "PATCH",
        headers: {
            "content-type": "application/json",
            "accept": "application/json"
        },
        body: JSON.stringify({ count })
    })
        .then(function (response) {
            response.json();
            console.log(response);
        })
        .then(function () {
            datas.childNodes[1].innerText = count;
            console.log("Like added!");
        });
}

function deleteQuote(datas) {

    fetch(`http://localhost:3000/quotes/${datas.dataset.id}`, {
        method: "DELETE",
    })
        .then(function () {
            console.log("Qutoe deleted!");
            datas.parentNode.parentNode.remove();
        });
}

function editQuotes(datas) {
    let editForm = document.createElement("form");
    editForm.id = "edit-qutoe-form";
    editForm.dataset.quoteId = datas.dataset.id;
    editForm.innerHTML = `
    <div class="form-group">
      <label for="new-quote">Edit Quote</label>
      <input name="quote" type="text" class="form-control" id="new-quote" placeholder="Edit your Quote">
    </div>
    <div class="form-group">
      <label for="Author">Author</label>
      <input name="author" type="text" class="form-control" id="author" placeholder="Edit your Author">
    </div>
    <button type="submit" class="btn btn-primary btn-sm">Submit</button>
  `;
    return datas.parentNode.parentNode.replaceChild(editForm, datas.parentNode);
}

function updateQuotes(datas) {
    const datasInputs = Array.from(datas.parentNode);
    const editQuote = {};

    if (validateForm(datasInputs)) {
        datasInputs.forEach(function (data) {
            editQuote[data.name] = data.value;
        });

        fetch(`http://localhost:3000/quotes/${datas.parentNode.dataset.quoteId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json"
            },
            body: JSON.stringify(editQuote)
        })
            .then(function (response) {
                return response.json();
            })
            .then(function () {
                console.log("edit done");

            });
    } else {
        return alert("Space must be filled out");
    }
    fetch(`http://localhost:3000/likes/${datas.parentNode.dataset.quoteId}`, { method: "DELETE" });
    fetchQutoes();
    location.reload();
}

function sortList(bttn) {
    let ul = document.getElementById("quote-list");

    if (bttn.innerText === "Off") {

        bttn.innerText = "On";
        fetch("http://localhost:3000/quotes?_embed=likes&_sort=author")
            .then(function (response) {
                return response.json();
            })
            .then(function (quotes) {
                console.log(quotes);
                ul.innerHTML = ``;
                displayQuotes(quotes);
            });
    } else {
        bttn.innerText = "Off";
        ul.innerHTML = ``;
        return fetchQutoes();
    }
}
