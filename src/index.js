document.addEventListener("DOMContentLoaded", function(){
    const quoteList = document.getElementById("quote-list")

    //ADD QUOTES TO PAGE
    fetch("http://localhost:3000/quotes")
    .then(response => response.json())
    .then(json => {
        json.forEach(quote => renderQuote(quote))
    })


    let form = document.querySelector("form#new-quote-form")
    form.addEventListener("submit", function(event){
        event.preventDefault()
        fetch("http://localhost:3000/quotes", {
            method: "post",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                "quote": `${event.target.quote.value}`,
                "author": `${event.target.author.value}`,
            })
        }) // fetch close
        .then(response => response.json())
        .then(quote => renderQuote(quote))
    }) // event listener close

    document.addEventListener("click", function(event){
        if (event.target.className === "btn-danger") {
            let parent = event.target.parentNode.parentNode
            deleteQuote(event.target)
            parent.remove()

        } 
        if (event.target.className === "btn-success"){
            addLike(event.target)
        }


    }) // click listener close


    function deleteQuote(button){
        let parent = button.parentNode.parentNode
        let id = parent.dataset.id

        return fetch(`http://localhost:3000/quotes/${id}`, {
            method: "delete"
        })
        .then(response => response.json())
        .then(json => {return json})
    }

    function addLike(button){
        let parent = button.parentNode.parentNode
        let id = parent.dataset.id 
        

        let span = parent.querySelector('span')
        let likes = parseInt(span.innerText)
        likes++
        span.innerText = likes

        fetch(`http://localhost:3000/likes`, {
            method: "POST",
            headers: 
            {
                "Content-Type": "application/json",
                Accept: "application/json"
            },
            body: JSON.stringify({
                "quoteId": `${id}`
            })

        }) // fetch close


    }

    function renderQuote(quote){
        let li = document.createElement('li')
        li.class = "quote-card"
        li.dataset.id = `${quote.id}`
        li.innerHTML = `
        <blockquote class="blockquote">
            <p class="mb-0">${quote.quote}</p>
            <footer class="blockquote-footer">${quote.author}</footer>
            <br>
            <button class='btn-success'>Likes: <span>0</span></button>
            <button class='btn-danger'>Delete</button>
        </blockquote>
        `
        quoteList.append(li)
        
        fetch(`http://localhost:3000/likes?quoteId=${quote.id}`)
        .then(response => response.json())
        .then(json => li.getElementsByTagName("span")[0].innerText = json.length)
    }

    // function renderLikes(quote){


    //     fetch(`http://localhost:3000/likes?quoteId=${quote.id}`)
    //     .then(response => response.json())
    //     .then(json => li.getElementsByTagName("span")[0].innerText = json.length)
    // }


})// last closer