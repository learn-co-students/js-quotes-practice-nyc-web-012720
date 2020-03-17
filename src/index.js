document.addEventListener("DOMContentLoaded", function(){
    quotesUl = document.getElementById('quote-list')
    
    fetchAndRenderQuotes()
    addSortButton()
    formSubmitListener()
    addClickListener()
})

function fetchAndRenderQuotes(){
    fetch("http://localhost:3000/quotes?_embed=likes")
    .then(resp => resp.json())
    .then(json => json.forEach(quote => renderQuote(quote, quotesUl)))
}

function renderQuote(quoteInJson, nodeToBeAppendedTo){
    let li = document.createElement('li')
    li.className = 'quote-card'
    li.innerHTML = `
    <blockquote class="blockquote" data-id=${quoteInJson.id}>
        <p class="mb-0">${quoteInJson.quote}</p>
        <footer class="blockquote-footer">${quoteInJson.author}</footer>
        <br>
        <button class="btn-success">Likes: <span>0</span></button>
        <button class="btn-edit">Edit</button>
        <button class="btn-danger">Delete</button>
    </blockquote>
    `
    nodeToBeAppendedTo.append(li)
    
    let likesButton = li.getElementsByClassName("btn-success")[0]
    renderLikesCount(quoteInJson, likesButton)
}

function formSubmitListener(){
    let form = document.getElementById('new-quote-form')
    form.addEventListener("submit", function(event){
        event.preventDefault()
        fetch("http://localhost:3000/quotes", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json'
            },
            body: JSON.stringify({
                quote: event.target.quote.value,
                author: event.target.author.value
            })
        })
        .then(resp => resp.json())
        .then(json => renderQuote(json))
        form.reset()
    })
}

function addClickListener(){
    document.addEventListener("click", function(event){
        if (event.target.className === "btn-success"){
            let numOfLikes = parseInt(event.target.children[0].textContent)
            let quoteId = parseInt(event.target.parentNode.dataset.id)
            event.target.children[0].textContent = ++numOfLikes
            fetch("http://localhost:3000/likes", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'accept': 'application/json'
                },
                body: JSON.stringify({
                    quoteId: quoteId,
                    createdAt: Date.now()
                })
            })
        } else if (event.target.className === "btn-danger"){
            let quoteCard = event.target.parentNode
            let quoteId = quoteCard.dataset.id
            quoteCard.parentNode.remove()
            fetch(`http://localhost:3000/quotes/${quoteId}`, {
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json',
                    'accept': 'application/json'
                }
            })
        } else if (event.target.className === "btn-edit"){
            let blockQuote = event.target.parentNode
            let targetNode = blockQuote.parentNode
            let editForm = document.createElement('form')
            editForm.dataset.id = blockQuote.dataset.id
            console.log(blockQuote.getElementsByTagName("footer")[0].textContent)
            editForm.innerHTML = `
            <label for="quote">Quote:</label>
            <br>
            <input name="quote" type="text" class="form-control" 
            size="100" value="${blockQuote.getElementsByTagName("p")[0].textContent}">
            <br>
            <label for="author">Author:</label>
            <br>
            <input name="author" type="text" class="form-control" 
            value="${blockQuote.getElementsByTagName("footer")[0].textContent}">
            <br>
            <button class="submit-edit">Submit</button>
            <button class="cancel-edit">Cancel</button>
            `
            targetNode.replaceChild(editForm, blockQuote)
            
            document.addEventListener("click", function(event){
                if (event.target.className === "cancel-edit"){
                    event.preventDefault()
                    // targetNode.replaceChild(blockQuote, editForm)
                    editForm.replaceWith(blockQuote)
                }
            })
        } else if (event.target.className === "submit-edit") {
            event.preventDefault()
            let editForm = event.target.parentNode
            let li = editForm.parentNode
            let quoteId = editForm.dataset.id
            fetch(`http://localhost:3000/quotes/${quoteId}`, {
                method: "PATCH",
                headers: {
                    'Content-Type': 'application/json',
                    'accept': 'application/json'
                },
                body: JSON.stringify({
                    quote: editForm.quote.value,
                    author: editForm.author.value
                })
            })
            .then(resp => resp.json())
            .then(quoteInJson => {
                
                li.innerHTML = `
                <blockquote class="blockquote" data-id=${quoteInJson.id}>
                    <p class="mb-0">${quoteInJson.quote}</p>
                    <footer class="blockquote-footer">${quoteInJson.author}</footer>
                    <br>
                    <button class="btn-success">Likes: <span>0</span></button>
                    <button class="btn-edit">Edit</button>
                    <button class="btn-danger">Delete</button>
                </blockquote>
                `
                
                let likesButton = li.getElementsByClassName("btn-success")[0]
                renderLikesCount(quoteInJson, likesButton)
            })
            editForm.remove()
            
        } else if (event.target.className === "sort-button") {
            if (event.target.status === "on"){
                event.target.innerHTML = "Sort: OFF"
                event.target.status = "off"
                quotesUl.innerText = ""
                fetchAndSortQuotesById()
            } else if (event.target.status === "off") {
                event.target.innerHTML = "Sort: ON"
                event.target.status = "on"
                quotesUl.innerText = ""
                fetchAndSortQuotesByAuthor()
            }
        }
    })
}

function renderLikesCount(jsonInstance, likesButtonElement){
    fetch(`http://localhost:3000/likes?quoteId=${jsonInstance.id}`)
    .then(resp => resp.json())
    .then(json => likesButtonElement.getElementsByTagName('span')[0].innerText = json.length)
}

function addSortButton(){
    let div = document.getElementsByTagName('div')[0]
    let button = document.createElement('button')
    button.className = 'sort-button'
    button.innerHTML = "Sort: OFF"
    button.status = "off"
    div.prepend(button)
}

function fetchAndSortQuotesById(){
    fetch("http://localhost:3000/quotes?_embed=likes")
    .then(resp => resp.json())
    .then(json => json.sort((a, b) => a.id - b.id).forEach(quote => renderQuote(quote, quotesUl)))
}

function fetchAndSortQuotesByAuthor(){
    fetch("http://localhost:3000/quotes?_embed=likes")
    .then(resp => resp.json())
    .then(json => {
        json.sort((a, b) => {
            let authorB = b.author.toUpperCase()
            let authorA = a.author.toUpperCase()
            if (authorA < authorB) {
                return -1
            }
            if (authorA > authorB) {
                return 1
            }
            return 0
        })
        json.forEach(quote => renderQuote(quote, quotesUl))
    })
}