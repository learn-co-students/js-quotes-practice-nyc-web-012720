document.addEventListener('DOMContentLoaded', () => {
	loadQuotes()

	document.addEventListener('submit', function(event) {
		event.preventDefault()
		addQuote(event)
		removeQuotesFromPage()
		loadQuotes()
	})

	document.addEventListener('click', function(event) {
		console.log(event.target)
		if (event.target.className === '’btn-danger’') {
			console.log('Delete Click')
			deleteQuote(event)
			removeQuotesFromPage()
			loadQuotes()
		}

		if (event.target.className === '’btn-success’') {
			console.log('Like Click')
			addLike(event)
			removeQuotesFromPage()
			loadQuotes()
		}
	})
})

function makeQuoteCard(quoteObject) {
	const quoteCard = document.createElement('li')
	quoteCard.class = 'quote-card'
	quoteCard.dataset.id = quoteObject.id
	quoteCard.innerHTML = `
    <blockquote class="blockquote">
      <p class="mb-0">${quoteObject.quote}</p>
      <footer class="blockquote-footer">${quoteObject.author}</footer>
      <br>
      <button class=’btn-success’>Likes: <span>${quoteObject.likes.length}</span></button>
      <button class=’btn-danger’>Delete</button>
    </blockquote>`
	document.querySelector('.container').append(quoteCard)
}

function loadQuotes() {
	fetch('http://localhost:3000/quotes?_embed=likes')
		.then(response => {
			return response.json()
		})
		.then(result => {
			result.forEach(element => {
				makeQuoteCard(element)
			})
		})
}

function addQuote(event) {
	const newQuoteObject = {
		quote: event.target.quote.value,
		author: event.target.author.value
	}
	const configObject = {
		method: 'POST',
		headers: {
			'Content-type': 'application/json',
			Accept: 'application/json'
		},
		body: JSON.stringify(newQuoteObject)
	}
	fetch('http://localhost:3000/quotes', configObject)
		.then(response => {
			return response.json()
		})
		.then(result => console.log(result))
		.then(makeQuoteCard(newQuoteObject))
}

function deleteQuote(event) {
	const quoteID = event.target.parentNode.parentNode.dataset.id
	const configObject = {
		method: 'DELETE',
		headers: {
			'Content-type': 'application/json',
			Accept: 'application/json'
		}
	}
	fetch(`http://localhost:3000/quotes/${quoteID}`, configObject)
		.then(response => {
			return response.json()
		})
		.then(result => console.log(result))
}

function removeQuotesFromPage() {
	document.querySelectorAll('.mb-0').forEach(element => {
		element.parentNode.parentNode.remove()
	})
}

function addLike(event) {
	const newLikeObject = {
		quoteId: parseInt(event.target.parentNode.parentNode.dataset.id),
		createdAt: Date.now()
	}
	const configObject = {
		method: 'POST',
		headers: {
			'Content-type': 'application/json',
			Accept: 'application/json'
		},
		body: JSON.stringify(newLikeObject)
	}
	fetch('http://localhost:3000/likes', configObject).then(response => {
		return response.json()
	})
	// .then(json => {
	// 	event.childNodes.textContent = json[0].likes.length
	// })
}

// fetch('http://localhost:3000/quotes?_embed=likes')
// 	.then(response => {
// 		return response.json()
// 	})
// 	.then(result => console.log(result))
