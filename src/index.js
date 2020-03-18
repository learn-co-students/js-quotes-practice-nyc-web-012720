document.addEventListener("DOMContentLoaded", () => {
    let sorted = false;
    const QUOTES_URL = "http://localhost:3000/quotes?_embed=likes";
    const LIKES_URL = "http://localhost:3000/likes";
    const quoteList = document.querySelector("#quote-list");
    const quoteForm = document.querySelector("#new-quote-form");
    const sortbtn = document.querySelector("#sort");

    const renderQuote = (quote) => {
        const li = document.createElement("li");
        li.setAttribute("class", "quote-card");
        li.setAttribute("id", quote.id);
        const blockquote = document.createElement("blockquote");
        blockquote.setAttribute("class", "blockquote");
        const p = document.createElement("p");
        p.innerHTML = quote.quote;
        p.setAttribute("class", "mb-0")
        const footer = document.createElement("footer");
        footer.setAttribute("class", "blockquote-footer");
        footer.innerHTML = quote.author;
        const br = document.createElement("br");
        const likebtn = document.createElement("button");
        likebtn.setAttribute("class", "btn-success");
        likebtn.innerHTML = "Likes: "
        const span = document.createElement("span");
        span.innerHTML = quote.likes.length;
        const delbtn = document.createElement("button");
        delbtn.setAttribute("class", "btn-danger");
        delbtn.innerHTML = "Delete";

        quoteList.appendChild(li);
        li.appendChild(blockquote);
        blockquote.appendChild(p);
        blockquote.appendChild(footer);
        blockquote.appendChild(br);
        blockquote.appendChild(likebtn);
        likebtn.appendChild(span);
        blockquote.appendChild(delbtn);

        likebtn.onclick = () => {
            addLike(quote);
        }

        delbtn.onclick = () => {
            removeQuote(quote.id);
        }
    }

    const getQuotes = () => {
        fetch(QUOTES_URL)
            .then(res => res.json())
            .then(quotes => {
                quotes.forEach(quote => {
                    renderQuote(quote);
                });
            })
            .catch(err => console.log(err));
    }

    const addQuote = (quote, author) => {
        const newQuote = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                quote: quote,
                author: author,
                likes: []
            })
        };

        fetch(QUOTES_URL, newQuote)
            .then(res => res.json())
            .then(quote => {
                renderQuote(quote);
            })
            .catch(err => console.log(err));
    }

    const removeQuote = (id) => {
        const byeQuote = {
            method: "DELETE"
        };

        fetch(`http://localhost:3000/quotes/${id}`, byeQuote)
            .then(res => res.json())
            .then(() => {
                const li = document.getElementById(`${id}`);
                li.remove();
            })
            .catch(err => console.log(err));
    }

    const addLike = (quote) => {
        const newLike = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                quoteId: quote.id,
                createdAt: Date.now()
            })
        };

        fetch(LIKES_URL, newLike)
            .then(res => res.json())
            .then(like => {
                const span = document.getElementById(`${quote.id}`).firstChild.lastChild.previousSibling.lastChild;
                let likes = parseInt(span.innerHTML, 10);
                likes++;
                span.innerHTML = likes;
            })
            .catch(err => console.log(err));
    }

    getQuotes();
    quoteForm.onsubmit = (e) => {
        e.preventDefault();
        const quote = document.querySelector("input[name='quote']").value;
        const author = document.querySelector("input[name='author']").value;
        addQuote(quote, author);
    }
    sortbtn.onclick = () => {
        quoteList.innerHTML = ""

        if (sorted) {
            getQuotes();
            sorted = false;
            sortbtn.innerHTML = "Sort by Author";
        } else {
            sorted = true;
            sortbtn.innerHTML = "Sort by ID";
            fetch("http://localhost:3000/quotes?_sort=author&_embed=likes")
                .then(res => res.json())
                .then(quotes => {
                    quotes.forEach(quote => {
                        renderQuote(quote);
                    });
                })
                .catch(err => console.log(err));

        //     CLIENT SIDE JS SORTING 
        //     fetch(QUOTES_URL)
        //         .then(res => res.json())
        //         .then(quotes => {
        //             let sortedQuotes = quotes.sort((a,b) => {
        //                 if (a.author < b.author){
        //                     return -1
        //                 } 
        //                 if (a.author > b.author){
        //                     return 1
        //                 } 
        //                 return 0
        //             });
        //             sortedQuotes.forEach(quote => {
        //                 renderQuote(quote);
        //             });
        //         })
        //         .catch(err => console.log(err));
        }
    }
});